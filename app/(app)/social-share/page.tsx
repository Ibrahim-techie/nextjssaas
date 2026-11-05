"use client";

import React, { useState, useEffect, useRef } from "react";
import { CldImage } from "next-cloudinary";
const socialFormats = [
  {
    name: "Facebook Cover (1.91:1)",
    width: 1200,
    height: 630,
  },
  {
    name: "Twitter (16:9)",
    width: 1200,
    height: 675,
  },
  {
    name: "LinkedIn Post (1.91:1)",
    width: 1200,
    height: 627,
  },
  {
    name: "LinkedIn Cover",
    width: 1584,
    height: 396,
  },
  {
    name: "Instagram Post (1:1)",
    width: 1080,
    height: 1080,
  },
  {
    name: "Instagram Story (9:16)",
    width: 1080,
    height: 1920,
  },
  {
    name: "Pinterest (2:3)",
    width: 1000,
    height: 1500,
  },
  {
    name: "YouTube Thumbnail (16:9)",
    width: 1280,
    height: 720,
  },
];

type SocialFormat = keyof (typeof socialFormats)[number];

export default function SocialShare() {
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat | null>(
    null,
  );

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isTransforming, setIsTransforming] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (uploadedImage) {
      setIsTransforming(true);
    }
  }, [selectedFormat, uploadedImage]);

  const handFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setUploadedImage(data.public_id);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!imageRef.current) return;
    
  }

  return (
    <div>
      <h1>Social Share</h1>
    </div>
  );
}
