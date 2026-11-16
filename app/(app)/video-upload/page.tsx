"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Upload, X } from "lucide-react";
import { formatBytes } from "@/lib/format";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_VIDEO_BYTES,
} from "@/lib/limits";
import { errorMessage, uploadToCloudinary } from "@/lib/upload";

type Phase = "idle" | "uploading" | "saving";

const OUTPUT_SPEC = [
  ["Format", "MP4, H.264 video, AAC audio"],
  ["Resolution", "Longest side up to 1280 px"],
  ["Quality", "Cloudinary eco, 2 Mbps ceiling"],
  ["Input", "MP4, MOV, WebM, AVI and more"],
  ["Limit", "100 MB per upload"],
  ["Visibility", "Only your account"],
] as const;

function titleFromFile(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .slice(0, MAX_TITLE_LENGTH);
}

export default function VideoUploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const previewRef = useRef("");

  const busy = phase !== "idle";

  function replacePreview(file: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = file ? URL.createObjectURL(file) : "";
    setPreviewUrl(previewRef.current);
  }

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  function selectFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Choose a video file");
      return;
    }
    if (file.size === 0 || file.size > MAX_VIDEO_BYTES) {
      toast.error(`Videos can be up to 100 MB. This one is ${formatBytes(file.size)}`);
      return;
    }
    setVideoFile(file);
    replacePreview(file);
    setDuration(0);
    if (!title.trim()) setTitle(titleFromFile(file.name));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.currentTarget.files?.[0]);
    event.currentTarget.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!busy) selectFile(event.dataTransfer.files?.[0]);
  }

  function removeFile() {
    setVideoFile(null);
    replacePreview(null);
    setDuration(0);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!videoFile) {
      toast.error("Choose a video first");
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast.error("Add a title and a description");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setPhase("uploading");
    setProgress(0);

    try {
      const uploaded = await uploadToCloudinary("video", videoFile, {
        onProgress: setProgress,
        signal: controller.signal,
      });

      setPhase("saving");
      await axios.post(
        "/api/video-upload",
        {
          publicId: uploaded.public_id,
          version: uploaded.version,
          signature: uploaded.signature,
          duration: uploaded.duration ?? duration,
          title: title.trim(),
          description: description.trim(),
        },
        { signal: controller.signal },
      );

      toast.success("Uploaded. The compressed MP4 is on its way");
      router.push("/home");
      router.refresh();
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error(errorMessage(error, "The video could not be uploaded"));
      }
      setPhase("idle");
    } finally {
      abortRef.current = null;
    }
  }

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <Link
        href="/home"
        className="inline-flex h-8 items-center gap-2 rounded-lg text-sm text-fg-2 transition-colors hover:text-base-content"
      >
        <ArrowLeft className="size-4" strokeWidth={1.5} />
        Library
      </Link>

      <div className="enter mt-4 max-w-xl">
        <h1 className="text-[32px] font-medium leading-tight">Upload video</h1>
        <p className="mt-2 text-[15px] leading-6 text-fg-2">
          The file goes straight to storage. A compressed MP4 is made in the
          background and appears in your library when it is ready
        </p>
      </div>

      <div className="enter-2 mt-8 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
        <aside className="h-fit rounded-xl border border-line bg-base-100 p-5">
          <h2 className="text-sm font-medium">What you get back</h2>
          <dl className="mt-4 divide-y divide-line">
            {OUTPUT_SPEC.map(([term, value]) => (
              <div key={term} className="flex justify-between gap-4 py-3 text-[13px]">
                <dt className="text-fg-3">{term}</dt>
                <dd className="text-right text-base-content">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <section className="rounded-xl border border-line bg-base-100 p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-sm font-medium" id="video-file-label">
                Video file
              </p>
              <input
                ref={inputRef}
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={busy}
                className="sr-only"
                aria-labelledby="video-file-label"
              />

              {videoFile && previewUrl ? (
                <div className="mt-2 overflow-hidden rounded-lg border border-line">
                  <div className="viewfinder aspect-video bg-frame">
                    <video
                      src={previewUrl}
                      muted
                      playsInline
                      controls
                      preload="metadata"
                      onLoadedMetadata={(event) =>
                        setDuration(event.currentTarget.duration || 0)
                      }
                      className="size-full object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">
                        {videoFile.name}
                      </p>
                      <p className="mt-0.5 font-mono text-xs tabular-nums text-fg-3">
                        {formatBytes(videoFile.size)}
                        {videoFile.type ? ` · ${videoFile.type.replace("video/", "")}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={busy}
                      aria-label="Remove selected video"
                      className="grid size-8 place-items-center rounded-lg text-fg-2 transition-colors hover:bg-base-300 hover:text-base-content disabled:opacity-50"
                    >
                      <X className="size-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="video-file"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`mt-2 flex cursor-pointer flex-col items-center rounded-lg border border-dashed px-6 py-10 text-center transition-colors ${
                    dragging
                      ? "border-primary bg-primary/5"
                      : "border-line-strong bg-base-200 hover:bg-base-300/60"
                  }`}
                >
                  <Upload className="size-[18px] text-fg-2" strokeWidth={1.5} />
                  <span className="mt-3 text-sm font-medium">
                    Drop a video or choose one
                  </span>
                  <span className="mt-1 text-xs text-fg-3">Up to 100 MB</span>
                </label>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="video-title" className="block text-sm font-medium">
                Title
              </label>
              <input
                id="video-title"
                type="text"
                placeholder="Product demo, October"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={MAX_TITLE_LENGTH}
                required
                disabled={busy}
                className="input h-10 w-full rounded-lg border-line-strong bg-base-100 text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label htmlFor="video-description" className="text-sm font-medium">
                  Description
                </label>
                <span className="font-mono text-xs tabular-nums text-fg-3">
                  {description.length.toLocaleString("en-US")}/
                  {MAX_DESCRIPTION_LENGTH.toLocaleString("en-US")}
                </span>
              </div>
              <textarea
                id="video-description"
                placeholder="Where it was shot, who it is for"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={MAX_DESCRIPTION_LENGTH}
                required
                disabled={busy}
                className="textarea min-h-28 w-full resize-y rounded-lg border-line-strong bg-base-100 text-sm leading-6"
              />
            </div>

            {busy && (
              <div aria-live="polite">
                <div className="flex justify-between text-xs">
                  <span className="text-fg-2">
                    {phase === "uploading" ? "Uploading" : "Saving to your library"}
                  </span>
                  <span className="font-mono tabular-nums text-fg-3">{progress}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300">
                  <div
                    className="h-full rounded-full bg-primary transition-transform duration-300"
                    style={{
                      transform: `translateX(-${100 - progress}%)`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
              {busy ? (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  disabled={phase === "saving"}
                  className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-fg-2 transition-colors hover:bg-base-300 hover:text-base-content disabled:opacity-50"
                >
                  Cancel upload
                </button>
              ) : (
                <Link
                  href="/home"
                  className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-fg-2 transition-colors hover:bg-base-300 hover:text-base-content"
                >
                  Cancel
                </Link>
              )}
              <button
                type="submit"
                disabled={busy || !videoFile}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-content transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {phase === "uploading"
                  ? "Uploading"
                  : phase === "saving"
                    ? "Saving"
                    : "Upload and compress"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
