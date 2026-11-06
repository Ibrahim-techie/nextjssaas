import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";





const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp3",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/mpeg",
  "video/ogg",
]);

async function uploadVideo(file: File): Promise<UploadApiResponse> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "nextjssaas/videos",
        resource_type: "video",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary returned no upload result."));
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "User is not authenticated." },
      { status: 401 },
    );
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary is not configured on the server." },
      { status: 500 },
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Send the video as multipart form data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const title = formData.get("title");
  const description = formData.get("description");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing video file. Use the form field "file".' },
      { status: 400 },
    );
  }

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json(
      { error: 'A non-empty "title" field is required.' },
      { status: 400 },
    );
  }

  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json(
      { error: 'A non-empty "description" field is required.' },
      { status: 400 },
    );
  }

  if (title.trim().length > 200) {
    return NextResponse.json(
      { error: "Title must be 200 characters or fewer." },
      { status: 400 },
    );
  }

  if (description.trim().length > 5000) {
    return NextResponse.json(
      { error: "Description must be 5000 characters or fewer." },
      { status: 400 },
    );
  }

  if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Use an MP4, MOV, WebM, M4V, AVI, MPEG, or OGG video." },
      { status: 415 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "The video is empty." }, { status: 400 });
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return NextResponse.json(
      { error: "The video must be 100 MB or smaller." },
      { status: 413 },
    );
  }

  let uploaded: UploadApiResponse;
  try {
    uploaded = await uploadVideo(file);
  } catch (error) {
    console.error("Cloudinary video upload failed:", error);
    return NextResponse.json(
      { error: "Cloudinary could not upload the video." },
      { status: 502 },
    );
  }

  try {
    const video = await prisma.video.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        originalSize: String(file.size),
        publicId: uploaded.public_id,
        compressedSize: String(uploaded.bytes),
        duration: uploaded.duration ?? 0,
        userId,
      },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error("Could not save video metadata:", error);

    try {
      await cloudinary.uploader.destroy(uploaded.public_id, {
        resource_type: "video",
      });
    } catch (cleanupError) {
      console.error("Could not remove orphaned Cloudinary video:", cleanupError);
    }

    return NextResponse.json(
      { error: "The video uploaded, but its record could not be saved." },
      { status: 500 },
    );
  }
}
