"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Crop, Search, Upload } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import type { Video } from "@/types";
import { formatBytes, parseStoredBytes, percentSmaller } from "@/lib/format";
import { errorMessage } from "@/lib/upload";

/** While a video is compressing, refresh the list on this interval. */
const POLL_INTERVAL_MS = 15_000;

async function fetchVideos(): Promise<Video[]> {
  const response = await axios.get<Video[]>("/api/video");
  if (!Array.isArray(response.data)) {
    throw new Error("The video service returned an unexpected response");
  }
  return response.data;
}

function Stat({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: boolean;
}) {
  return (
    <div className="px-5 py-4">
      <p className="text-[13px] text-fg-2">{label}</p>
      <p
        className={`mt-2 text-[28px] font-medium leading-none tabular-nums ${accent ? "text-primary" : ""}`}
      >
        {value}
      </p>
      {detail && <p className="mt-2 text-xs text-fg-3">{detail}</p>}
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-xl border border-line bg-base-100"
        >
          <div className="aspect-video bg-base-300" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 rounded bg-base-300" />
            <div className="h-3 w-full rounded bg-base-300" />
            <div className="h-1.5 w-full rounded-full bg-base-300" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchVideos()
      .then((items) => {
        if (!cancelled) setVideos(items);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(errorMessage(requestError, "Could not load your videos"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const processing = videos.some((video) => video.status === "processing");

  // Quiet refresh while a compressed MP4 is still being made. Failures here
  // keep the current list on screen and try again on the next tick.
  useEffect(() => {
    if (!processing) return;
    let cancelled = false;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      fetchVideos()
        .then((items) => {
          if (!cancelled) setVideos(items);
        })
        .catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [processing]);

  function retry() {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }

  const visibleVideos = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return videos;
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query),
    );
  }, [search, videos]);

  const totals = useMemo(() => {
    let uploaded = 0;
    let compressedFrom = 0;
    let compressedTo = 0;
    for (const video of videos) {
      const original = parseStoredBytes(video.originalSize);
      uploaded += original;
      if (video.status === "ready") {
        compressedFrom += original;
        compressedTo += Math.min(original, parseStoredBytes(video.compressedSize));
      }
    }
    return {
      uploaded,
      saved: compressedFrom - compressedTo,
      percent: percentSmaller(compressedFrom, compressedTo),
    };
  }, [videos]);

  const compressing = videos.filter((video) => video.status === "processing").length;

  return (
    <div className="space-y-10 pb-12">
      <section className="enter flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-xl">
          <h1 className="text-[32px] font-medium leading-tight">Library</h1>
          <p className="mt-2 text-[15px] leading-6 text-fg-2">
            Every upload is kept with a compressed MP4 next to it, ready to
            download or post
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/video-upload"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-content transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98]"
          >
            <Upload className="size-4" strokeWidth={1.5} />
            Upload video
          </Link>
          <Link
            href="/social-share"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line-strong bg-base-100 px-4 text-sm font-medium transition-colors hover:bg-base-300"
          >
            <Crop className="size-4 text-fg-2" strokeWidth={1.5} />
            Social image
          </Link>
        </div>
      </section>

      <section
        aria-label="Library totals"
        className="enter-2 grid divide-y divide-line rounded-xl border border-line bg-base-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        <Stat
          label="Videos"
          value={loading ? "–" : String(videos.length)}
          detail={compressing > 0 ? `${compressing} compressing now` : undefined}
        />
        <Stat
          label="Uploaded"
          value={loading ? "–" : formatBytes(totals.uploaded)}
          detail="Original files"
        />
        <Stat
          label="Saved by compression"
          value={loading ? "–" : formatBytes(totals.saved)}
          detail={
            totals.percent > 0
              ? `${totals.percent}% smaller than the originals`
              : "Appears once a video is compressed"
          }
          accent={totals.saved > 0}
        />
      </section>

      <section className="enter-3 space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="flex items-baseline gap-2 text-lg font-medium">
            Videos
            {!loading && videos.length > 0 && (
              <span className="font-mono text-xs tabular-nums text-fg-3">
                {visibleVideos.length === videos.length
                  ? videos.length
                  : `${visibleVideos.length} of ${videos.length}`}
              </span>
            )}
          </h2>
          <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-line-strong bg-base-100 px-3 transition-colors focus-within:border-primary sm:max-w-64">
            <Search className="size-4 shrink-0 text-fg-3" strokeWidth={1.5} />
            <input
              type="search"
              aria-label="Search videos"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-full w-full bg-transparent text-sm outline-none placeholder:text-fg-3"
            />
          </label>
        </div>

        {error ? (
          <div className="rounded-xl border border-line bg-base-100 px-6 py-10 text-center">
            <p className="text-sm text-error">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 inline-flex h-8 items-center rounded-lg border border-line-strong px-3 text-[13px] font-medium transition-colors hover:bg-base-300"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <LibrarySkeleton />
        ) : visibleVideos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visibleVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="rounded-xl border border-line bg-base-100 px-6 py-12 text-center">
            <p className="text-sm font-medium">No videos match “{search.trim()}”</p>
            <p className="mt-1 text-[13px] text-fg-2">
              Search looks at titles and descriptions
            </p>
          </div>
        ) : (
          <div className="grid gap-8 rounded-xl border border-line bg-base-100 p-6 sm:grid-cols-[minmax(0,320px)_1fr] sm:items-center sm:p-8">
            <div
              className="viewfinder aspect-video rounded-lg bg-frame"
              style={{ "--vf-color": "rgb(255 255 255 / 0.35)" } as React.CSSProperties}
              aria-hidden="true"
            />
            <div className="max-w-md">
              <h3 className="text-lg font-medium">No videos yet</h3>
              <p className="mt-2 text-sm leading-6 text-fg-2">
                Upload a clip up to 100 MB. Frameflow keeps the original and
                makes an H.264 MP4 at a fraction of the size in the background.
              </p>
              <Link
                href="/video-upload"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-content transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98]"
              >
                <Upload className="size-4" strokeWidth={1.5} />
                Upload your first video
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
