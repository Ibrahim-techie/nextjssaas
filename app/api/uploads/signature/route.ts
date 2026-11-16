import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  CloudinaryConfigError,
  IMAGE_FOLDER,
  VIDEO_FOLDER,
  eagerNotificationUrl,
  getCloudinary,
  newPublicId,
  videoEager,
} from "@/lib/cloudinary";
import type { UploadKind, UploadTarget } from "@/types";

/**
 * Signs a one-off direct upload to Cloudinary. Files go from the browser
 * straight to Cloudinary, so they never pass through the Next.js proxy (which
 * buffers only 10 MB) or a serverless body limit (4.5 MB on Vercel).
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "User is not authenticated." },
      { status: 401 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const kind = (body as { kind?: unknown } | null)?.kind;
  if (kind !== "video" && kind !== "image") {
    return NextResponse.json(
      { error: 'Set "kind" to "video" or "image".' },
      { status: 400 },
    );
  }

  let config: ReturnType<typeof getCloudinary>;
  try {
    config = getCloudinary();
  } catch (error) {
    if (error instanceof CloudinaryConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    throw error;
  }

  const params: Record<string, string | number> = {
    timestamp: Math.round(Date.now() / 1000),
    public_id: newPublicId(
      kind === "video" ? VIDEO_FOLDER : IMAGE_FOLDER,
      userId,
    ),
  };

  if (kind === "video") {
    params.eager = videoEager();
    params.eager_async = "true";
    const notificationUrl = eagerNotificationUrl();
    if (notificationUrl) params.eager_notification_url = notificationUrl;
  } else {
    params.allowed_formats = "jpg,jpeg,png,webp,gif,avif";
  }

  const signature = config.cloudinary.utils.api_sign_request(
    params,
    config.apiSecret,
  );

  const target: UploadTarget = {
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/${kind satisfies UploadKind}/upload`,
    fields: { ...params, api_key: config.apiKey, signature },
  };

  return NextResponse.json(target, {
    headers: { "Cache-Control": "no-store" },
  });
}
