import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  CloudinaryConfigError,
  fetchVideoResource,
  getCloudinary,
} from "@/lib/cloudinary";
import { toVideo, videoStatus } from "@/lib/videos";

/** Admin API calls are rate limited, so only check a few processing videos per request. */
const MAX_STATUS_CHECKS = 5;

export async function GET(): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    getCloudinary();
  } catch (error) {
    if (error instanceof CloudinaryConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    throw error;
  }

  try {
    const videos = await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // The webhook usually fills compressedSize in. This catches the cases it
    // cannot reach, like local development without a public APP_URL.
    const processing = videos
      .filter((video) => videoStatus(video) === "processing")
      .slice(0, MAX_STATUS_CHECKS);

    await Promise.allSettled(
      processing.map(async (video) => {
        const { compressedBytes } = await fetchVideoResource(video.publicId);
        if (compressedBytes === null) return;
        const updated = await prisma.video.update({
          where: { id: video.id },
          data: { compressedSize: String(compressedBytes) },
        });
        Object.assign(video, updated);
      }),
    );

    return NextResponse.json(videos.map(toVideo), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Could not load your videos." },
      { status: 500 },
    );
  }
}
