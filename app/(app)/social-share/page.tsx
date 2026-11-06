"use client";

import { useState } from "react";
import Image from "next/image";
import { getCldImageUrl } from "next-cloudinary";

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
};

type UploadedAsset = {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
};

const socialFormats: Record<SocialFormatKey, SocialFormat> = {
  instagram: {
    name: "Instagram Post",
    width: 1080,
    height: 1080,
  },
  instagramStory: {
    name: "Instagram Story",
    width: 1080,
    height: 1920,
  },
  facebook: {
    name: "Facebook Post",
    width: 1200,
    height: 630,
  },
  youtube: {
    name: "YouTube Thumbnail",
    width: 1280,
    height: 720,
  },
  linkedin: {
    name: "LinkedIn Post",
    width: 1200,
    height: 627,
  },
};

const MAX_PREVIEW_DIMENSION = 1600;

export default function SocialMediaCreator() {
  const [uploadedImage, setUploadedImage] = useState<UploadedAsset | null>(
    null,
  );

  const [selectedFormat, setSelectedFormat] = useState<SocialFormatKey | "">(
    "",
  );
  const [isTransforming, setIsTransforming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Upload image through your API endpoint
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");

    const allowedTypes = [
      "image/avif",
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, WebP, GIF, or AVIF image.");
      e.target.value = "";
      return;
    }

    if (file.size === 0 || file.size > 10 * 1024 * 1024) {
      setError("Maximum file size allowed is 10 MB.");
      e.target.value = "";
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Image upload failed.");
      }

      if (!data.publicId || !data.url) {
        throw new Error("Invalid response from upload API.");
      }

      setUploadedImage(data as UploadedAsset);
      setSelectedFormat("");
      setIsTransforming(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during upload.",
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

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
  const downloadUrl = uploadedImage && currentFormat
    ? getCldImageUrl({
        src: uploadedImage.publicId,
        width: currentFormat.width,
        height: currentFormat.height,
        crop: "fill",
        gravity: "auto",
        quality: "auto",
        format: "auto",
        flags: "attachment",
      })
    : "";

  return (
    <main className="mx-auto max-w-6xl space-y-8 pb-12">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Image studio</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Social media creator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/55">
            Turn one image into a ready-to-publish crop for your next post, story, or thumbnail.
          </p>
        </div>
        <div className="hidden rounded-xl border border-base-300/70 bg-base-100 px-4 py-3 text-right sm:block">
          <p className="text-xs font-medium text-base-content/45">SUPPORTED FORMATS</p>
          <p className="mt-1 text-sm font-semibold">Up to 10 MB · JPEG, PNG, WebP, GIF, AVIF</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Upload Section */}
        <section className="rounded-3xl border border-base-300/70 bg-base-100 p-5 shadow-sm sm:p-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">01</span>
              <div>
                <h2 className="font-semibold tracking-tight">Add your image</h2>
                <p className="text-xs text-base-content/50">Start with a photo or graphic.</p>
              </div>
            </div>

            <label className="mt-5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-base-300 bg-base-200/40 p-6 text-center transition hover:border-primary/50 hover:bg-primary/5">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-base-100 text-2xl shadow-sm">📁</span>

              <span className="mt-3 text-sm font-semibold">
                {isUploading
                  ? "Uploading image..."
                  : uploadedImage ? "Choose another image" : "Click to upload an image"}
              </span>

              <span className="mt-1 text-xs text-base-content/50">
                JPEG, PNG, WebP, GIF, AVIF · Maximum 10 MB
              </span>

              <input
                type="file"
                accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {isUploading && (
              <progress aria-label="Uploading image" className="progress progress-primary mt-4 w-full" />
            )}

            {error && <p role="alert" className="mt-3 rounded-xl bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

            {uploadedImage && (
              <div className="mt-4 rounded-xl border border-base-300/70 bg-base-200/50 p-3">
                <p className="truncate text-sm font-medium">Current image</p>
                <p className="mt-1 text-xs text-base-content/50">{uploadedImage.width} × {uploadedImage.height} px · {uploadedImage.format.toUpperCase()}</p>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-base-content/50">
              <span className="rounded-full bg-base-200 px-2.5 py-1.5">Automatic crop</span>
              <span className="rounded-full bg-base-200 px-2.5 py-1.5">High-resolution download</span>
            </div>
          </div>
        </section>

        {/* Format Selection */}
        <section className="rounded-3xl border border-base-300/70 bg-base-100 p-5 shadow-sm sm:p-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-700">02</span>
              <div>
                <h2 className="font-semibold tracking-tight">Choose a destination</h2>
                <p className="text-xs text-base-content/50">We’ll crop and resize it for you.</p>
              </div>
            </div>

            <select
              className="select select-bordered mt-5 h-12 w-full rounded-xl bg-base-100"
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value as SocialFormatKey | "");
                setIsTransforming(true);
              }}
              disabled={!uploadedImage || isUploading}
            >
              <option value="" disabled>
                Select a social media format
              </option>

              {Object.entries(socialFormats).map(([key, format]) => (
                <option key={key} value={key}>
                  {format.name}
                </option>
              ))}
            </select>

            <div className="mt-4 min-h-24 rounded-2xl bg-base-200/60 p-4">
              {currentFormat ? (
                <>
                  <p className="text-sm font-semibold">{currentFormat.name}</p>
                  <p className="mt-1 text-sm text-base-content/55">{currentFormat.width} × {currentFormat.height} pixels</p>
                  <p className="mt-2 text-xs text-base-content/45">Preview is optimized for fast loading. Downloads keep this full size.</p>
                </>
              ) : (
                <p className="pt-2 text-sm text-base-content/45">Select an image first, then choose a social format.</p>
              )}
            </div>
          </div>
        </section>

        {/* Image Preview */}
        {uploadedImage && (
          <section className="overflow-hidden rounded-3xl border border-base-300/70 bg-base-100 shadow-sm md:col-span-2">
            <div className="border-b border-base-200 px-5 py-4 sm:px-6">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/40">03 · Preview</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">
                    {currentFormat ? `${currentFormat.name} preview` : "Your image preview"}
                  </h2>
                </div>
                {currentFormat && <span className="w-fit rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">{currentFormat.width} × {currentFormat.height}</span>}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(45deg,#f1f2f6_25%,transparent_25%),linear-gradient(-45deg,#f1f2f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f2f6_75%),linear-gradient(-45deg,transparent_75%,#f1f2f6_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0px] p-5 sm:min-h-80">
                {isTransforming && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-base-100/75 backdrop-blur-sm" aria-live="polite">
                    <span className="loading loading-spinner loading-md text-primary" aria-label="Preparing preview" />
                  </div>
                )}
                <Image
                  key={`${uploadedImage.publicId}-${selectedFormat}`}
                  src={previewUrl}
                  unoptimized
                  width={currentFormat?.width ?? previewWidth}
                  height={currentFormat?.height ?? previewHeight}
                  onLoad={() => { setIsTransforming(false); setError(""); }}
                  onError={() => { setIsTransforming(false); setError("Could not load the image preview. Please try uploading the image again."); }}
                  alt={
                    currentFormat
                      ? "Transformed social media image"
                      : "Uploaded image"
                  }
                  className="h-auto max-h-[70vh] max-w-full rounded-xl object-contain shadow-lg"
                />
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-base-content/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-base-content/40">Cloudinary public ID</p>
                  <p className="mt-1 break-all font-mono text-xs">
                    {uploadedImage.publicId}
                  </p>
                </div>

                {currentFormat && (
                  <a
                    href={downloadUrl}
                    download
                    className="btn btn-primary h-12 rounded-xl px-5"
                  >
                    Download full-size image
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
