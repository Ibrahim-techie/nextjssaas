import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";


const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

async function uploadImage(file: File): Promise<UploadApiResponse> {
    const bytes=await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "nextjssaas/images",
        resource_type: "image",
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
      { error: "Send the image as multipart form data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
 
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing image file. Use the form field "file".' },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, WebP, GIF, or AVIF image." },
      { status: 415 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "The image is empty." }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "The image must be 10 MB or smaller." },
      { status: 413 },
    );
  }

  try {
    const uploaded = await uploadImage(file);
    return NextResponse.json({
      publicId: uploaded.public_id,
      url: uploaded.secure_url,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
      size: String((uploaded.bytes/1024)/1024)+ " MB",// Convert bytes to MB
    });
  } catch (error) {
    console.error("Cloudinary image upload failed:", error);
    return NextResponse.json(
      { error: "Cloudinary could not upload the image." },
      { status: 502 },
    );
  }
}
