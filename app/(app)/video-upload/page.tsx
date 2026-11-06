"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function VideoUpload() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  // Maximum file size: 100MB
  const MAX_FILE_SIZE = 100 * 1024 * 1024;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 100MB");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file");
      e.target.value = "";
      return;
    }

    setVideoFile(file);
  };

  // Handle video upload
  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error("Please select a video");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a video title");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a video description");
      return;
    }

    setIsUploading(true);
    toast.info("Video is uploading...");

    const formData = new FormData();

    formData.append("file", videoFile);
    formData.append("title", title.trim());
    formData.append("description", description.trim());

    try {
      // Same-origin requests send the Clerk session cookie automatically.
      // Let Axios set the multipart boundary for FormData.
      const response = await axios.post("/api/video-upload", formData);

      if (response.status === 200 || response.status === 201) {
        toast.success("Video uploaded successfully!");

        setVideoFile(null);
        setTitle("");
        setDescription("");

        router.refresh();
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      const message = axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error ?? "Failed to upload video"
        : "Failed to upload video";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card w-full max-w-2xl bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body">
        {/* Header */}
        <div className="mb-3">
          <h2 className="text-2xl font-bold">Add New Video</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Video Upload */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Video File</span>
            </label>

            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full"
            />

            <p className="text-xs text-base-content/50 mt-2">
              Maximum file size: 100MB
            </p>

            {videoFile && (
              <div className="mt-3 p-3 rounded-lg bg-base-200 flex justify-between items-center">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {videoFile.name}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  className="btn btn-xs btn-ghost text-error"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Video Title</span>
            </label>

            <input
              type="text"
              placeholder="Enter video title"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description</span>
            </label>

            <textarea
              placeholder="Add a description or notes about this video..."
              className="textarea textarea-bordered w-full min-h-32 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
            />
          </div>

          {/* Submit */}
          <div className="card-actions justify-end pt-3">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.back()}
              disabled={isUploading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading || !videoFile}
            >
              {isUploading ? (
                <>
                  <span className="loading animate-spin loading-sm"></span>
                  Uploading...
                </>
              ) : (
                "Save Video"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
