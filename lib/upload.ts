import axios from "axios";
import type { UploadKind, UploadTarget } from "@/types";

/** Browser-side helpers for direct, signed uploads to Cloudinary. */

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
  duration?: number;
  secure_url: string;
}

/** Reads `{ error: "..." }` from our API or `{ error: { message } }` from Cloudinary. */
export function errorMessage(error: unknown, fallback: string): string {
  if (axios.isCancel(error)) return "Upload cancelled";
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string | { message?: string } }
      | undefined;
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.error?.message === "string") return data.error.message;
    if (!error.response) return "Check your connection and try again";
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function uploadToCloudinary(
  kind: UploadKind,
  file: File,
  options: { onProgress?: (percent: number) => void; signal?: AbortSignal } = {},
): Promise<CloudinaryUploadResult> {
  const { data: target } = await axios.post<UploadTarget>(
    "/api/uploads/signature",
    { kind },
    { signal: options.signal },
  );

  const form = new FormData();
  for (const [key, value] of Object.entries(target.fields)) {
    form.append(key, String(value));
  }
  form.append("file", file);

  const { data } = await axios.post<CloudinaryUploadResult>(
    target.uploadUrl,
    form,
    {
      signal: options.signal,
      onUploadProgress: (event) => {
        if (event.total) {
          options.onProgress?.(
            Math.min(100, Math.round((event.loaded / event.total) * 100)),
          );
        }
      },
    },
  );
  return data;
}

const EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-msvideo": "avi",
  "video/mpeg": "mpeg",
  "video/ogg": "ogv",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/**
 * Saves a cross-origin file under a chosen name, with the extension taken from
 * its content type. Falls back to opening it in a new tab when the browser
 * cannot fetch it directly.
 */
export async function downloadFile(url: string, baseName: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed with ${response.status}`);
    const blob = await response.blob();
    const extension = EXTENSIONS[blob.type.split(";")[0]] ?? "mp4";
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${baseName}.${extension}`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/** A file name without extension that every OS accepts. */
export function safeFilename(title: string, fallback = "video"): string {
  const base = title
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80)
    .trim();
  return base || fallback;
}
