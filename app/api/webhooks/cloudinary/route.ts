import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CloudinaryConfigError,
  compressedBytesFrom,
  getCloudinary,
} from "@/lib/cloudinary";

/**
 * Cloudinary calls this when the background renditions for an upload are
 * done. Only used when APP_URL is a public HTTPS URL (see .env.example).
 */
export async function POST(request: Request) {
  let config: ReturnType<typeof getCloudinary>;
  try {
    config = getCloudinary();
  } catch (error) {
    if (error instanceof CloudinaryConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    throw error;
  }

  const body = await request.text();
  const timestamp = Number(request.headers.get("x-cld-timestamp"));
  const signature = request.headers.get("x-cld-signature");

  if (
    !signature ||
    !Number.isFinite(timestamp) ||
    !config.cloudinary.utils.verifyNotificationSignature(
      body,
      timestamp,
      signature,
    )
  ) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: { notification_type?: unknown; public_id?: unknown; eager?: unknown };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (
    payload.notification_type !== "eager" ||
    typeof payload.public_id !== "string"
  ) {
    return NextResponse.json({ received: true });
  }

  const compressedBytes = compressedBytesFrom(payload.eager);
  if (compressedBytes !== null) {
    await prisma.video.updateMany({
      where: { publicId: payload.public_id, compressedSize: null },
      data: { compressedSize: String(compressedBytes) },
    });
  }

  return NextResponse.json({ received: true });
}
