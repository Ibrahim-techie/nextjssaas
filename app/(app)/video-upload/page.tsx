"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Film, FileVideo2, Upload, X } from "lucide-react";
import Link from "next/link";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export default function VideoUploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Choose a video file to continue.");
      setVideoFile(null);
      event.currentTarget.value = "";
      return;
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      toast.error("Videos must be larger than 0 and no more than 100 MB.");
      setVideoFile(null);
      event.currentTarget.value = "";
      return;
    }

    setVideoFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!videoFile) {
      toast.error("Select a video first.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast.error("Add a title and description for your video.");
      return;
    }

    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("title", title.trim());
    formData.append("description", description.trim());

    setIsUploading(true);
    setProgress(0);
    try {
      await axios.post("/api/video-upload", formData, {
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
          }
        },
      });
      toast.success("Video added to your library.");
      router.push("/home");
      router.refresh();
    } catch (error) {
      const message = axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error ?? "The video could not be uploaded."
        : "The video could not be uploaded.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  function removeFile() {
    setVideoFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <Link href="/home" className="inline-flex items-center gap-2 text-sm font-medium text-base-content/55 transition hover:text-base-content">
        <ArrowLeft className="h-4 w-4" /> Back to library
      </Link>

      <div className="grid overflow-hidden rounded-[2rem] border border-base-300/70 bg-base-100 shadow-sm lg:grid-cols-[0.8fr_1.2fr]">
        <section className="relative overflow-hidden bg-neutral-950 p-7 text-white sm:p-9">
          <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/10 text-cyan-200">
              <Film className="h-6 w-6" />
            </span>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
              Add to your library
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Bring your next story in.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
              Upload one video and keep its optimized version, file details, and
              download together in your private workspace.
            </p>
            <div className="mt-auto space-y-3 pt-10 text-sm text-white/75">
              <p className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Up to 100 MB per upload</p>
              <p className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> MP4, MOV, WebM, and more</p>
              <p className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Only visible in your account</p>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-9 lg:p-10">
          <div className="mb-7">
            <h2 className="text-xl font-semibold tracking-tight">Video details</h2>
            <p className="mt-1 text-sm text-base-content/55">Add a few details before uploading.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="video-file" className="text-sm font-semibold">Video file</label>
              <input
                ref={inputRef}
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="sr-only"
              />
              {videoFile ? (
                <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileVideo2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{videoFile.name}</p>
                    <p className="mt-1 text-xs text-base-content/55">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB · {videoFile.type || "Video"}
                    </p>
                  </div>
                  <button type="button" onClick={removeFile} disabled={isUploading} aria-label="Remove selected video" className="btn btn-ghost btn-sm btn-square rounded-lg">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label htmlFor="video-file" className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-base-300 bg-base-200/40 px-5 py-9 text-center transition hover:border-primary/50 hover:bg-primary/5">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-base-100 text-primary shadow-sm">
                    <Upload className="h-5 w-5" />
                  </span>
                  <span className="mt-4 text-sm font-semibold">Choose a video to upload</span>
                  <span className="mt-1 text-xs text-base-content/50">Click to browse · maximum 100 MB</span>
                </label>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="video-title" className="text-sm font-semibold">Title</label>
              <input
                id="video-title"
                type="text"
                placeholder="Give your video a clear name"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={200}
                required
                disabled={isUploading}
                className="input input-bordered h-12 w-full rounded-xl bg-base-100"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="video-description" className="text-sm font-semibold">Description</label>
                <span className="text-xs text-base-content/40">{description.length}/2,000</span>
              </div>
              <textarea
                id="video-description"
                placeholder="Add context or notes about this video"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={2000}
                required
                disabled={isUploading}
                className="textarea textarea-bordered min-h-28 w-full resize-y rounded-xl bg-base-100"
              />
            </div>

            {isUploading && (
              <div className="space-y-2" aria-live="polite">
                <div className="flex justify-between text-xs font-medium text-base-content/60">
                  <span>Uploading your video</span><span>{progress}%</span>
                </div>
                <progress className="progress progress-primary h-2 w-full" value={progress} max="100" />
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-base-200 pt-5 sm:flex-row sm:justify-end">
              <Link href="/home" className={`btn btn-ghost rounded-xl ${isUploading ? "pointer-events-none opacity-50" : ""}`}>
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary rounded-xl px-6" disabled={isUploading || !videoFile}>
                {isUploading ? "Uploading…" : "Save to library"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
