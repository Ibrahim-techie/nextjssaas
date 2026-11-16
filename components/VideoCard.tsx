"use client";

import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowDownToLine, Play } from "lucide-react";
import type { Video } from "@/types";
import {
  formatBytes,
  formatDuration,
  parseStoredBytes,
  percentSmaller,
} from "@/lib/format";
import { downloadFile, safeFilename } from "@/lib/upload";

dayjs.extend(relativeTime);

function SizeReadout({ video }: { video: Video }) {
  const original = parseStoredBytes(video.originalSize);
  const compressed = parseStoredBytes(video.compressedSize);

  if (video.status === "processing") {
    return (
      <div>
        <div className="flex items-baseline justify-between gap-3 text-xs">
          <span className="text-fg-2">Compressing</span>
          <span className="font-mono tabular-nums text-fg-3">
            {formatBytes(original)}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300">
          <div className="h-full w-full animate-pulse rounded-full bg-fg-3/30" />
        </div>
      </div>
    );
  }

  if (video.status === "failed") {
    return (
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-fg-2">Original kept, compression did not finish</span>
        <span className="font-mono tabular-nums text-fg-3">
          {formatBytes(original)}
        </span>
      </div>
    );
  }

  const saved = percentSmaller(original, compressed);
  const share = original > 0 ? Math.min(100, (compressed / original) * 100) : 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-xs tabular-nums text-fg-2">
          {formatBytes(original)}
          <span className="px-1.5 text-fg-3">→</span>
          <span className="text-base-content">{formatBytes(compressed)}</span>
        </p>
        <p className="text-xs font-medium tabular-nums text-primary">
          {saved > 0 ? `${saved}% smaller` : "Already compact"}
        </p>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300"
        role="img"
        aria-label={`Compressed file is ${Math.round(share)}% of the original size`}
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.max(share, 2)}%` }}
        />
      </div>
    </div>
  );
}

export default function VideoCard({ video }: { video: Video }) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const ready = video.status === "ready";
  const canPreview = ready && !previewFailed;
  const showVideo = canPreview && (hovered || playing);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadFile(
        ready ? video.compressedUrl : video.originalUrl,
        safeFilename(video.title),
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-base-100 transition-colors hover:border-line-strong">
      <div
        className="viewfinder relative aspect-video overflow-hidden bg-frame"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setPlaying(false);
        }}
      >
        {showVideo ? (
          <video
            src={video.compressedUrl}
            poster={posterFailed ? undefined : video.posterUrl}
            preload="metadata"
            autoPlay
            loop
            muted={!playing}
            playsInline
            controls={playing}
            className="size-full object-contain"
            onError={() => {
              setPreviewFailed(true);
              setPlaying(false);
            }}
          />
        ) : (
          <>
            {!posterFailed && (
              // Cloudinary already serves an optimized poster.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.posterUrl}
                alt=""
                loading="lazy"
                className="size-full object-cover"
                onError={() => setPosterFailed(true)}
              />
            )}
            {canPreview && (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Play ${video.title}`}
                className="absolute inset-0 z-[2] grid place-items-center"
              >
                <span className="grid size-11 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition-colors hover:bg-black/70">
                  <Play className="ml-0.5 size-4 fill-current" strokeWidth={1.5} />
                </span>
              </button>
            )}
          </>
        )}

        <span className="pointer-events-none absolute bottom-4 right-7 z-[2] rounded bg-black/60 px-1.5 py-0.5 font-mono text-xs tabular-nums text-white">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-medium leading-5">
            {video.title}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-10 text-[13px] leading-5 text-fg-2">
            {video.description}
          </p>
        </div>

        <SizeReadout video={video} />

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
          <time
            dateTime={video.createdAt}
            className="text-xs text-fg-3"
            title={dayjs(video.createdAt).format("D MMM YYYY, HH:mm")}
          >
            Added {dayjs(video.createdAt).fromNow()}
          </time>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || video.status === "processing"}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-line-strong bg-base-100 px-3 text-[13px] font-medium transition-colors hover:bg-base-300 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Download ${video.title}`}
          >
            <ArrowDownToLine className="size-4 text-fg-2" strokeWidth={1.5} />
            {downloading ? "Downloading" : ready ? "Download MP4" : "Download"}
          </button>
        </div>
      </div>
    </article>
  );
}
