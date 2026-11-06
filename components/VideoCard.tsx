"use client";

import { useState } from "react";
import Image from "next/image";
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { ArrowDownToLine, CheckCircle2, Clock3, Play, Video as VideoIcon } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";
import type { Video } from "@/types";

dayjs.extend(relativeTime);

function parseStoredBytes(value: string): number {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0) return numeric;

  const match = value.trim().match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) return 0;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = units.indexOf(match[2].toUpperCase());
  return Number(match[1]) * 1024 ** exponent;
}

function formatDuration(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function VideoCard({ video }: { video: Video }) {
  const [showPreview, setShowPreview] = useState(false);
  const originalBytes = parseStoredBytes(video.originalSize);
  const compressedBytes = parseStoredBytes(video.compressedSize);
  const savedBytes = Math.max(0, originalBytes - compressedBytes);
  const savedPercent = originalBytes
    ? Math.round((savedBytes / originalBytes) * 100)
    : 0;

  const thumbnailUrl = getCldImageUrl({
    src: video.publicId,
    assetType: "video",
    width: 640,
    height: 360,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "jpg",
  });

  const previewUrl = getCldVideoUrl({
    src: video.publicId,
    assetType: "video",
    width: 1280,
    height: 720,
    crop: "limit",
    quality: "auto",
    format: "auto",
  });

  const downloadUrl = getCldVideoUrl({
    src: video.publicId,
    assetType: "video",
    flags: "attachment",
  });

  return (
    <article className="overflow-hidden rounded-3xl border border-base-300/70 bg-base-100 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      <div className="group relative aspect-video overflow-hidden bg-neutral-950">
        {showPreview ? (
          <video
            src={previewUrl}
            poster={thumbnailUrl}
            controls
            autoPlay
            playsInline
            className="h-full w-full object-contain"
            onError={() => setShowPreview(false)}
          />
        ) : (
          <>
            <Image
              src={thumbnailUrl}
              alt={`${video.title} thumbnail`}
              width={640}
              height={360}
              unoptimized
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              aria-label={`Preview ${video.title}`}
              className="absolute inset-0 grid place-items-center bg-neutral-950/15 transition hover:bg-neutral-950/30"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full border border-white/30 bg-white/90 text-neutral-950 shadow-lg transition group-hover:scale-105">
                <Play className="ml-1 h-5 w-5 fill-current" />
              </span>
            </button>
          </>
        )}
        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-neutral-950/75 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur">
          <Clock3 className="h-3.5 w-3.5" />
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="space-y-5 p-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h2 className="line-clamp-1 text-lg font-semibold tracking-tight">
              {video.title}
            </h2>
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              VIDEO
            </span>
          </div>
          <p className="line-clamp-2 min-h-10 text-sm leading-5 text-base-content/60">
            {video.description || "No description provided."}
          </p>
          <p className="mt-3 text-xs text-base-content/45">
            Added {dayjs(video.createdAt).fromNow()}
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-base-300 rounded-2xl bg-base-200/70 py-3">
          <div className="px-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/45">
              Original
            </p>
            <p className="mt-1 text-sm font-semibold">
              {filesize(originalBytes)}
            </p>
          </div>
          <div className="px-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/45">
              Optimized
            </p>
            <p className="mt-1 text-sm font-semibold">
              {filesize(compressedBytes)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            {savedPercent > 0 ? (
              <>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="truncate font-medium text-emerald-700">
                  {savedPercent}% smaller
                </span>
              </>
            ) : (
              <>
                <VideoIcon className="h-4 w-4 shrink-0 text-base-content/50" />
                <span className="truncate text-base-content/60">
                  Ready to share
                </span>
              </>
            )}
          </div>
          <a
            href={downloadUrl}
            className="btn btn-primary btn-sm shrink-0 gap-2 rounded-xl"
            aria-label={`Download ${video.title}`}
          >
            <ArrowDownToLine className="h-4 w-4" />
            Download
          </a>
        </div>
      </div>
    </article>
  );
}
