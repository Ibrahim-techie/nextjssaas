import { filesize } from "filesize";

/** One size format across the app: binary units, one decimal, like "84.2 MB". */
export function formatBytes(bytes: number): string {
  return filesize(Math.max(0, bytes), {
    base: 2,
    standard: "jedec",
    round: 1,
  });
}

/** Sizes are stored as byte strings. Older rows may hold "12.3 MB". */
export function parseStoredBytes(value: string | null | undefined): number {
  if (!value) return 0;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0) return numeric;

  const match = value.trim().match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) return 0;
  const exponent = ["B", "KB", "MB", "GB", "TB"].indexOf(match[2].toUpperCase());
  return Number(match[1]) * 1024 ** exponent;
}

/** Timecode, like 0:42 or 1:03:07. */
export function formatDuration(seconds: number): string {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = String(total % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${secs}`
    : `${minutes}:${secs}`;
}

export function percentSmaller(original: number, compressed: number): number {
  if (original <= 0 || compressed <= 0 || compressed >= original) return 0;
  return Math.round(((original - compressed) / original) * 100);
}
