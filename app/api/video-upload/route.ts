import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CloudinaryConfigError,
  VIDEO_FOLDER,
  fetchVideoResource,
  getCloudinary,
  isOwnPublicId,
  verifyUploadSignature,
  type VideoResource,
} from "@/lib/cloudinary";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_VIDEO_BYTES,
} from "@/lib/limits";
import { toVideo } from "@/lib/videos";

function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

async function discardUpload(publicId: string) {
  try {
    await getCloudinary().cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
      invalidate: true,
    });
  } catch (error) {
    console.error("Could not remove orphaned Cloudinary video:", error);
  }
}

/**
 * Saves a video the browser has already uploaded to Cloudinary with a
 * signature from /api/uploads/signature. The upload response signature is
 * verified and sizes are read from Cloudinary, never trusted from the client.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return badRequest("User is not authenticated.", 401);

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) return badRequest("Send the video details as JSON.");

  const { publicId, version, signature, title, description, duration } = body;

  if (
    typeof publicId !== "string" ||
    typeof signature !== "string" ||
    (typeof version !== "number" && typeof version !== "string")
  ) {
    return badRequest("Missing the Cloudinary upload result.");
  }
  if (typeof title !== "string" || !title.trim()) {
    return badRequest("Add a title.");
  }
  if (typeof description !== "string" || !description.trim()) {
    return badRequest("Add a description.");
  }
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return badRequest(`Keep the title under ${MAX_TITLE_LENGTH} characters.`);
  }
  if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
    return badRequest(
      `Keep the description under ${MAX_DESCRIPTION_LENGTH.toLocaleString("en-US")} characters.`,
    );
  }
  if (!isOwnPublicId(publicId, VIDEO_FOLDER, userId)) {
    return badRequest("This upload does not belong to your account.", 403);
  }

  try {
    getCloudinary();
  } catch (error) {
    if (error instanceof CloudinaryConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    throw error;
  }

  if (!verifyUploadSignature(publicId, version, signature)) {
    return badRequest("The upload signature is not valid.", 403);
  }

  const existing = await prisma.video.findFirst({
    where: { publicId },
    select: { id: true },
  });
  if (existing) return badRequest("This video is already in your library.", 409);

  let resource: VideoResource;
  try {
    resource = await fetchVideoResource(publicId);
  } catch (error) {
    console.error("Could not read the uploaded video from Cloudinary:", error);
    return NextResponse.json(
      { error: "Cloudinary could not confirm the upload. Try again." },
      { status: 502 },
    );
  }

  if (resource.bytes <= 0 || resource.bytes > MAX_VIDEO_BYTES) {
    await discardUpload(publicId);
    return badRequest("The video must be 100 MB or smaller.", 413);
  }

  const clientDuration =
    typeof duration === "number" && Number.isFinite(duration) && duration >= 0
      ? duration
      : 0;

  try {
    const video = await prisma.video.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        publicId,
        originalSize: String(resource.bytes),
        compressedSize:
          resource.compressedBytes === null
            ? null
            : String(resource.compressedBytes),
        duration: resource.duration ?? clientDuration,
        userId,
      },
    });

    return NextResponse.json({ video: toVideo(video) }, { status: 201 });
  } catch (error) {
    console.error("Could not save video metadata:", error);
    await discardUpload(publicId);
    return NextResponse.json(
      { error: "The video uploaded, but its record could not be saved." },
      { status: 500 },
    );
  }
}
