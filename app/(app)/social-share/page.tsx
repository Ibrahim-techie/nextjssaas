"use client";

import { useState, type ChangeEvent } from "react";
import { getCldImageUrl } from "next-cloudinary";
import { ArrowDownToLine, ImageUp } from "lucide-react";
import { formatBytes } from "@/lib/format";
import { MAX_IMAGE_BYTES } from "@/lib/limits";
import { errorMessage, uploadToCloudinary } from "@/lib/upload";

type SocialFormatKey =
  | "instagram"
  | "instagramStory"
  | "facebook"
  | "youtube"
  | "linkedin";

type SocialFormat = {
  name: string;
  width: number;
  height: number;
  ratio: string;
};

type UploadedAsset = {
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

const socialFormats: Record<SocialFormatKey, SocialFormat> = {
  instagram: {
    name: "Instagram post",
    width: 1080,
    height: 1080,
    ratio: "1:1",
  },
  instagramStory: {
    name: "Instagram story",
    width: 1080,
    height: 1920,
    ratio: "9:16",
  },
  facebook: {
    name: "Facebook post",
    width: 1200,
    height: 630,
    ratio: "1.91:1",
  },
  youtube: {
    name: "YouTube thumbnail",
    width: 1280,
    height: 720,
    ratio: "16:9",
  },
  linkedin: {
    name: "LinkedIn post",
    width: 1200,
    height: 627,
    ratio: "1.91:1",
  },
};

const ALLOWED_TYPES = [
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_PREVIEW_DIMENSION = 1600;

/** A frame drawn at the format's real aspect ratio, fitted into a 40px box. */
function RatioFrame({ width, height }: { width: number; height: number }) {
  const scale = 40 / Math.max(width, height);
  return (
    <span
      className="grid size-10 shrink-0 place-items-center"
      aria-hidden="true"
    >
      <span
        className="rounded-[3px] border-[1.5px] border-current"
        style={{
          width: Math.round(width * scale),
          height: Math.round(height * scale),
        }}
      />
    </span>
  );
}

export default function SocialMediaCreator() {
  const [uploadedImage, setUploadedImage] = useState<UploadedAsset | null>(
    null,
  );
  const [selectedFormat, setSelectedFormat] = useState<SocialFormatKey | "">(
    "",
  );
  const [isTransforming, setIsTransforming] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  const isUploading = progress !== null;

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Use a JPEG, PNG, WebP, GIF or AVIF image");
      input.value = "";
      return;
    }
    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      setError(
        `Images can be up to 10 MB. This one is ${formatBytes(file.size)}`,
      );
      input.value = "";
      return;
    }

    try {
      setProgress(0);
      const uploaded = await uploadToCloudinary("image", file, {
        onProgress: setProgress,
      });
      setUploadedImage({
        publicId: uploaded.public_id,
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        bytes: uploaded.bytes,
      });
      setSelectedFormat("");
      setIsTransforming(false);
    } catch (uploadError) {
      setError(errorMessage(uploadError, "The image could not be uploaded"));
    } finally {
      setProgress(null);
      input.value = "";
    }
  }

  function chooseFormat(key: SocialFormatKey) {
    if (key === selectedFormat) return;
    setSelectedFormat(key);
    setIsTransforming(true);
  }

  const currentFormat = selectedFormat ? socialFormats[selectedFormat] : null;
  const previewScale = uploadedImage
    ? Math.min(
        1,
        MAX_PREVIEW_DIMENSION / uploadedImage.width,
        MAX_PREVIEW_DIMENSION / uploadedImage.height,
      )
    : 1;
  const previewWidth = uploadedImage
    ? Math.max(1, Math.round(uploadedImage.width * previewScale))
    : 1;
  const previewHeight = uploadedImage
    ? Math.max(1, Math.round(uploadedImage.height * previewScale))
    : 1;
  const previewUrl = uploadedImage
    ? getCldImageUrl({
        src: uploadedImage.publicId,
        width: currentFormat?.width ?? previewWidth,
        height: currentFormat?.height ?? previewHeight,
        crop: currentFormat ? "fill" : "limit",
        gravity: currentFormat ? "auto" : undefined,
        quality: "auto",
        format: "auto",
      })
    : "";
  const downloadUrl =
    uploadedImage && currentFormat
      ? getCldImageUrl({
          src: uploadedImage.publicId,
          width: currentFormat.width,
          height: currentFormat.height,
          crop: "fill",
          gravity: "auto",
          quality: "auto",
          format: "jpg",
          flags: "attachment",
        })
      : "";

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <header className="enter flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-xl">
          <h1 className="text-[32px] font-medium leading-tight">
            Social image
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-fg-2">
            Upload one image and crop it to the exact size a post, story or
            thumbnail needs. The crop follows the subject of the photo
          </p>
        </div>
        <p className="text-xs text-fg-3">
          JPEG, PNG, WebP, GIF or AVIF · up to 10 MB
        </p>
      </header>

      <div className="enter-2 grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-line bg-base-100 p-5">
          <h2 className="flex items-baseline gap-2 text-sm font-medium">
            <span className="font-mono text-xs text-fg-3">1</span>
            Image
          </h2>

          <label
            className={`mt-4 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-base-200 p-6 text-center transition-colors hover:bg-base-300/60 ${
              isUploading ? "pointer-events-none" : ""
            }`}
          >
            <ImageUp className="size-[18px] text-fg-2" strokeWidth={1.5} />
            <span className="mt-3 text-sm font-medium">
              {isUploading
                ? `Uploading ${progress}%`
                : uploadedImage
                  ? "Choose another image"
                  : "Choose an image"}
            </span>
            <span className="mt-1 text-xs text-fg-3">Up to 10 MB</span>
            <input
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={handleFileUpload}
              disabled={isUploading}
              className="sr-only"
            />
          </label>

          {isUploading && (
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-base-300">
              <div
                className="h-full rounded-full bg-primary transition-transform duration-300"
                style={{ transform: `translateX(-${100 - (progress ?? 0)}%)` }}
              />
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 text-sm text-error">
              {error}
            </p>
          )}

          {uploadedImage && !isUploading && (
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs tabular-nums text-fg-2">
              <div className="flex gap-2">
                <dt className="text-fg-3">Size</dt>
                <dd>
                  {uploadedImage.width} × {uploadedImage.height}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-fg-3">Type</dt>
                <dd>{uploadedImage.format.toUpperCase()}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-fg-3">File</dt>
                <dd>{formatBytes(uploadedImage.bytes)}</dd>
              </div>
            </dl>
          )}
        </section>

        <section className="rounded-xl border border-line bg-base-100 p-5">
          <h2 className="flex items-baseline gap-2 text-sm font-medium">
            <span className="font-mono text-xs text-fg-3">2</span>
            Format
          </h2>

          <div
            role="group"
            aria-label="Social media format"
            className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2"
          >
            {(
              Object.entries(socialFormats) as [SocialFormatKey, SocialFormat][]
            ).map(([key, format]) => {
              const selected = key === selectedFormat;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selected}
                  disabled={!uploadedImage || isUploading}
                  onClick={() => chooseFormat(key)}
                  className={`flex items-center gap-3 rounded-lg border px-2 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent text-fg-3 hover:bg-base-300/60"
                  }`}
                >
                  <RatioFrame width={format.width} height={format.height} />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-base-content">
                      {format.name}
                    </span>
                    <span className="block font-mono text-xs tabular-nums text-fg-3">
                      {format.width} × {format.height}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {!uploadedImage && (
            <p className="mt-3 text-xs text-fg-3">
              Upload an image to choose a format
            </p>
          )}
        </section>

        {uploadedImage && (
          <section className="overflow-hidden rounded-xl border border-line bg-base-100 md:col-span-2">
            <div className="flex flex-col justify-between gap-2 border-b border-line px-5 py-4 sm:flex-row sm:items-center">
              <h2 className="flex items-baseline gap-2 text-sm font-medium">
                <span className="font-mono text-xs text-fg-3">3</span>
                {currentFormat ? currentFormat.name : "Original image"}
              </h2>
              <p className="font-mono text-xs tabular-nums text-fg-3">
                {currentFormat
                  ? `${currentFormat.width} × ${currentFormat.height} · ${currentFormat.ratio}`
                  : `${uploadedImage.width} × ${uploadedImage.height}`}
              </p>
            </div>

            <div className="p-5">
              <div className="relative flex min-h-64 items-center justify-center rounded-lg bg-base-200 p-6 sm:min-h-80">
                {isTransforming && (
                  <div
                    className="absolute inset-0 z-10 grid place-items-center bg-base-200/70"
                    aria-live="polite"
                  >
                    <span
                      className="loading loading-spinner loading-sm text-fg-3"
                      aria-label="Preparing preview"
                    />
                  </div>
                )}
                <div
                  className="viewfinder max-w-full"
                  style={
                    {
                      "--vf-color": "var(--color-base-content)",
                      "--vf-inset": "-8px",
                      "--vf-length": "14px",
                    } as React.CSSProperties
                  }
                >
                  {/* Cloudinary resizes and optimizes this preview itself. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={`${uploadedImage.publicId}-${selectedFormat}`}
                    src={previewUrl}
                    width={currentFormat?.width ?? previewWidth}
                    height={currentFormat?.height ?? previewHeight}
                    onLoad={() => {
                      setIsTransforming(false);
                      setError("");
                    }}
                    onError={() => {
                      setIsTransforming(false);
                      setError(
                        "The preview could not load. Upload the image again",
                      );
                    }}
                    alt={
                      currentFormat
                        ? `Image cropped for ${currentFormat.name}`
                        : "Uploaded image"
                    }
                    className="block h-auto max-h-[70vh] w-auto max-w-full rounded-sm object-contain"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 text-xs text-fg-3">
                  Public ID{" "}
                  <span className="break-all font-mono text-fg-2">
                    {uploadedImage.publicId}
                  </span>
                </p>

                {currentFormat ? (
                  <a
                    href={downloadUrl}
                    download
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-content transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98]"
                  >
                    <ArrowDownToLine className="size-4" strokeWidth={1.5} />
                    Download {currentFormat.width} × {currentFormat.height}
                  </a>
                ) : (
                  <p className="text-xs text-fg-3">
                    Choose a format to download
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
