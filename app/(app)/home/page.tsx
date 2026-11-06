"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowUpRight, HardDrive, Search, Sparkles, Upload, Video as VideoIcon } from "lucide-react";
import { filesize } from "filesize";
import VideoCard from "@/components/VideoCard";
import type { Video } from "@/types";

function storedBytes(value: string): number {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  const match = value.trim().match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) return 0;
  const exponent = ["B", "KB", "MB", "GB", "TB"].indexOf(
    match[2].toUpperCase(),
  );
  return Number(match[1]) * 1024 ** exponent;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestVideos = useCallback(async () => {
    const response = await axios.get<Video[]>("/api/video");
    if (!Array.isArray(response.data)) {
      throw new Error("The video service returned an unexpected response.");
    }
    return response.data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    requestVideos()
      .then((items) => {
        if (!cancelled) setVideos(items);
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;
        const message = axios.isAxiosError<{ error?: string }>(requestError)
          ? requestError.response?.data?.error ?? "Could not load your videos."
          : requestError instanceof Error
            ? requestError.message
            : "Could not load your videos.";
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestVideos]);

  function retryFetch() {
    setLoading(true);
    setError("");
    requestVideos()
      .then(setVideos)
      .catch((requestError: unknown) => {
        const message = axios.isAxiosError<{ error?: string }>(requestError)
          ? requestError.response?.data?.error ?? "Could not load your videos."
          : requestError instanceof Error
            ? requestError.message
            : "Could not load your videos.";
        setError(message);
      })
      .finally(() => setLoading(false));
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

  const totalOriginalBytes = videos.reduce(
    (total, video) => total + storedBytes(video.originalSize),
    0,
  );
  const totalSavedBytes = videos.reduce(
    (total, video) =>
      total +
      Math.max(
        0,
        storedBytes(video.originalSize) - storedBytes(video.compressedSize),
      ),
    0,
  );

  return (
    <div className="space-y-9 pb-12">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-neutral px-6 py-9 text-neutral-content shadow-xl sm:px-10 sm:py-12">
        <div className="absolute -right-16 -top-28 -z-10 h-80 w-80 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 -z-10 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-content/20 bg-neutral-content/10 px-3 py-1.5 text-xs font-medium text-neutral-content/85">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Your media workspace
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Make every video ready to share.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-content/70 sm:text-base">
              Keep your uploads organized, see how much space you save, and
              create polished visuals for every social channel.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/video-upload" className="btn btn-primary gap-2 rounded-xl">
              <Upload className="h-4 w-4" />
              Upload video
            </Link>
            <Link
              href="/social-share"
              className="btn btn-ghost border border-neutral-content/25 text-neutral-content hover:border-neutral-content/40 hover:bg-neutral-content/10"
            >
              Create social image
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-base-300/70 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-base-content/60">Your videos</p>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <VideoIcon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight">
            {loading ? "—" : videos.length}
          </p>
          <p className="mt-1 text-xs text-base-content/45">In your library</p>
        </div>
        <div className="rounded-2xl border border-base-300/70 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-base-content/60">Original media</p>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/10 text-secondary">
              <HardDrive className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight">
            {loading ? "—" : filesize(totalOriginalBytes)}
          </p>
          <p className="mt-1 text-xs text-base-content/45">Across your library</p>
        </div>
        <div className="rounded-2xl border border-base-300/70 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-base-content/60">Space saved</p>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20 text-secondary">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight">
            {loading ? "—" : filesize(totalSavedBytes)}
          </p>
          <p className="mt-1 text-xs text-base-content/45">Compared with original uploads</p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Video library</h2>
            <p className="mt-1 text-sm text-base-content/55">
              Your uploaded videos, thumbnails, and optimized downloads.
            </p>
          </div>
          <label className="input input-bordered flex w-full items-center gap-2 rounded-xl bg-base-100 sm:max-w-xs">
            <Search className="h-4 w-4 text-base-content/40" />
            <input
              type="search"
              aria-label="Search videos"
              placeholder="Search your videos"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="grow"
            />
          </label>
        </div>

        {error ? (
          <div className="rounded-2xl border border-error/20 bg-error/5 p-6 text-center">
            <p className="font-medium text-error">{error}</p>
            <button type="button" className="btn btn-outline btn-sm mt-4" onClick={retryFetch}>
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="overflow-hidden rounded-3xl border border-base-300 bg-base-100">
                <div className="skeleton aspect-video rounded-none" />
                <div className="space-y-3 p-5">
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleVideos.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 px-6 py-14 text-center">
            <Search className="mx-auto h-8 w-8 text-base-content/30" />
            <h3 className="mt-4 font-semibold">No matching videos</h3>
            <p className="mt-1 text-sm text-base-content/55">Try another title or description.</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 px-6 py-16 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <VideoIcon className="h-7 w-7" />
            </span>
            <h3 className="mt-5 text-lg font-semibold">Your library is ready</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-base-content/55">
              Upload your first clip to see its thumbnail, file size, and optimized download here.
            </p>
            <Link href="/video-upload" className="btn btn-primary mt-6 gap-2 rounded-xl">
              <Upload className="h-4 w-4" />
              Upload your first video
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
