/**
 * - processing: the compressed MP4 is still being generated
 * - ready: compressedSize holds the real size of the compressed MP4
 * - failed: no compressed MP4 appeared within the processing window
 */
export type VideoStatus = "processing" | "ready" | "failed";

export interface Video {
  id: string;
  title: string;
  description: string;
  publicId: string;
  /** Bytes, stored as a string. */
  originalSize: string;
  /** Bytes of the compressed MP4, or null while it is being generated. */
  compressedSize: string | null;
  duration: number;
  createdAt: string;
  updatedAt: string;
  status: VideoStatus;
  posterUrl: string;
  /** Compressed MP4, used for preview and download once ready. */
  compressedUrl: string;
  originalUrl: string;
}

export type UploadKind = "video" | "image";

export interface UploadTarget {
  uploadUrl: string;
  fields: Record<string, string | number>;
}
