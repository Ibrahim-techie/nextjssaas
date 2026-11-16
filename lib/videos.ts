import type { Video as VideoRecord } from "@/app/generated/prisma/client";
import type { Video, VideoStatus } from "@/types";
import { COMPRESSION_WINDOW_MS, videoUrls } from "@/lib/cloudinary";

/** The window starts at updatedAt, which moves when a rendition is (re)queued. */
export function videoStatus(
  video: Pick<VideoRecord, "compressedSize" | "updatedAt">,
  now = Date.now(),
): VideoStatus {
  if (video.compressedSize !== null) return "ready";
  return now - video.updatedAt.getTime() < COMPRESSION_WINDOW_MS
    ? "processing"
    : "failed";
}

/** Shapes a database row for the client. Requires getCloudinary() first. */
export function toVideo(video: VideoRecord): Video {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    publicId: video.publicId,
    originalSize: video.originalSize,
    compressedSize: video.compressedSize,
    duration: video.duration,
    createdAt: video.createdAt.toISOString(),
    updatedAt: video.updatedAt.toISOString(),
    status: videoStatus(video),
    ...videoUrls(video.publicId),
  };
}
