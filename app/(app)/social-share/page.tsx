"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";

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

export default function SocialMediaCreator() {
  const [uploadedImage, setUploadedImage] = useState<UploadedAsset | null>(
    null,
  );

  const [selectedFormat, setSelectedFormat] = useState<SocialFormatKey | "">(
    "",
  );

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Upload image through your API endpoint
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setUploadedImage(null);
    setSelectedFormat("");

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

    if (file.size > 10 * 1024 * 1024) {
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

  return (
    <main className="min-h-screen bg-base-200 px-4 py-12">
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-10">
        <h1 className="text-4xl font-bold">Social Media Creator</h1>

        <p className="text-base-content/60 mt-2">
          Upload, resize and optimize your images for social media.
        </p>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <section className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-2">Upload Image</h2>

            <p className="text-sm text-base-content/60 mb-4">
              Select an image to get started.
            </p>

            <label className="border-2 border-dashed border-base-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition">
              <span className="text-4xl mb-3">📁</span>

              <span className="font-medium">
                {isUploading
                  ? "Uploading image..."
                  : "Click to upload an image"}
              </span>

              <span className="text-xs text-base-content/50 mt-2">
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
              <progress className="progress progress-primary w-full mt-4" />
            )}

            {error && <p className="text-error text-sm mt-3">{error}</p>}

            <div className="text-xs text-base-content/50 mt-4 space-y-1">
              <p>• Images are uploaded to Cloudinary.</p>
              <p>• Select a format to transform your image.</p>
              <p>• Automatic cropping and resizing.</p>
            </div>
          </div>
        </section>

        {/* Format Selection */}
        <section className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-2">Social Media Format</h2>

            <p className="text-sm text-base-content/60 mb-4">
              Choose where you want to publish your image.
            </p>

            <select
              className="select select-bordered w-full"
              value={selectedFormat}
              onChange={(e) =>
                setSelectedFormat(e.target.value as SocialFormatKey | "")
              }
              disabled={!uploadedImage}
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

            {currentFormat && (
              <div className="bg-base-200 rounded-lg p-4 mt-4">
                <p className="font-medium">Selected Format</p>

                <p className="text-sm text-base-content/60 mt-1">
                  {currentFormat.width} × {currentFormat.height} pixels
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Image Preview */}
        {uploadedImage && (
          <section className="card bg-base-100 shadow-sm md:col-span-2">
            <div className="card-body">
              <h2 className="card-title">
                {currentFormat
                  ? "Transformed Image Preview"
                  : "Uploaded Image Preview"}
              </h2>

              <div className="flex justify-center bg-base-200 rounded-xl p-6">
                <CldImage
                  key={`${uploadedImage.publicId}-${selectedFormat}`}
                  src={uploadedImage.publicId}
                  width={currentFormat?.width ?? uploadedImage.width}
                  height={currentFormat?.height ?? uploadedImage.height}
                  crop={currentFormat ? "fill" : undefined}
                  gravity={currentFormat ? "auto" : undefined}
                  quality="auto"
                  format="auto"
                  alt={
                    currentFormat
                      ? "Transformed social media image"
                      : "Uploaded image"
                  }
                  className="max-h-96 max-w-full object-contain rounded-lg"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                <div className="text-sm text-base-content/60">
                  <p>Cloudinary Public ID</p>
                  <p className="font-mono break-all">
                    {uploadedImage.publicId}
                  </p>
                </div>

                {currentFormat && (
                  <a
                    href={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,g_auto,w_${currentFormat.width},h_${currentFormat.height},q_auto,f_auto/${uploadedImage.publicId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Download Image
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
