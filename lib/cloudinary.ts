import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

/**
 * Server-only Cloudinary helpers. Never import this from a client component:
 * it reads CLOUDINARY_API_SECRET.
 */

export const VIDEO_FOLDER = "nextjssaas/videos";
export const IMAGE_FOLDER = "nextjssaas/images";

/** How long a video may stay without a compressed size before we call it failed. */
export const COMPRESSION_WINDOW_MS = 6 * 60 * 60 * 1000;

const COMPRESSED_FORMAT = "mp4";
const POSTER_FORMAT = "jpg";

/**
 * The rendition people preview and download: H.264 + AAC in MP4 so it plays
 * everywhere, longest side capped at 1280px, Cloudinary's "eco" quality and a
 * 2 Mbps ceiling. It is generated once, in the background, right after upload.
 *
 * Factories return fresh objects because the SDK mutates what it is given.
 */
const compressedVideo = () => [
  { width: 1280, height: 1280, crop: "limit" },
  {
    quality: "auto:eco",
    video_codec: "h264",
    audio_codec: "aac",
    bit_rate: "2m",
  },
];

const videoPoster = () => [
  { width: 640, height: 360, crop: "fill" },
  { quality: "auto" },
];

export class CloudinaryConfigError extends Error {
  constructor() {
    super("Cloudinary is not configured on the server.");
    this.name = "CloudinaryConfigError";
  }
}

export function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new CloudinaryConfigError();
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return { cloudinary, cloudName, apiKey, apiSecret };
}

function transformationString(steps: object[]): string {
  return cloudinary.utils.generate_transformation_string({
    transformation: steps,
  });
}

/** The signed `eager` parameter: compressed MP4 first, poster frame second. */
export function videoEager(): string {
  return [
    `${transformationString(compressedVideo())}/${COMPRESSED_FORMAT}`,
    `${transformationString(videoPoster())}/${POSTER_FORMAT}`,
  ].join("|");
}

/** Webhook for finished eager renditions, only when the app has a public HTTPS URL. */
export function eagerNotificationUrl(): string | undefined {
  const appUrl = process.env.APP_URL?.trim().replace(/\/+$/, "");
  if (!appUrl?.startsWith("https://")) return undefined;
  return `${appUrl}/api/webhooks/cloudinary`;
}

export function newPublicId(folder: string, userId: string): string {
  return `${folder}/${userId}/${randomUUID()}`;
}

const PUBLIC_ID_TAIL =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** True when the public ID is one we signed for this user. */
export function isOwnPublicId(
  publicId: string,
  folder: string,
  userId: string,
): boolean {
  const prefix = `${folder}/${userId}/`;
  return (
    publicId.startsWith(prefix) &&
    PUBLIC_ID_TAIL.test(publicId.slice(prefix.length))
  );
}

/** Checks the signature Cloudinary returns with every upload response. */
export function verifyUploadSignature(
  publicId: string,
  version: string | number,
  signature: string,
): boolean {
  const verify = (
    cloudinary.utils as unknown as {
      verify_api_response_signature?: (
        publicId: string,
        version: string | number,
        signature: string,
      ) => boolean;
    }
  ).verify_api_response_signature;

  if (typeof verify !== "function") {
    throw new Error("This Cloudinary SDK cannot verify upload signatures.");
  }
  return verify(publicId, version, signature);
}

function normalizeTransformation(value: string): string {
  return value
    .replace(/\/(mp4|jpg)$/, "")
    .split("/")
    .map((component) => component.split(",").sort().join(","))
    .join("/");
}

type DerivedEntry = {
  transformation?: unknown;
  bytes?: unknown;
};

/** Finds the compressed MP4 in an Admin API `derived` list or a webhook `eager` list. */
export function compressedBytesFrom(entries: unknown): number | null {
  if (!Array.isArray(entries)) return null;
  const target = normalizeTransformation(transformationString(compressedVideo()));

  for (const entry of entries as DerivedEntry[]) {
    if (
      typeof entry?.transformation === "string" &&
      normalizeTransformation(entry.transformation) === target &&
      typeof entry.bytes === "number" &&
      entry.bytes > 0
    ) {
      return entry.bytes;
    }
  }
  return null;
}

export type VideoResource = {
  bytes: number;
  duration: number | null;
  compressedBytes: number | null;
};

/** Reads an uploaded video's real size and, once ready, its compressed size. */
export async function fetchVideoResource(
  publicId: string,
): Promise<VideoResource> {
  const resource = await cloudinary.api.resource(publicId, {
    resource_type: "video",
  });

  return {
    bytes: typeof resource.bytes === "number" ? resource.bytes : 0,
    duration:
      typeof resource.duration === "number" && Number.isFinite(resource.duration)
        ? resource.duration
        : null,
    compressedBytes: compressedBytesFrom(resource.derived),
  };
}

export function videoUrls(publicId: string) {
  return {
    posterUrl: cloudinary.url(publicId, {
      resource_type: "video",
      transformation: videoPoster(),
      format: POSTER_FORMAT,
      secure: true,
    }),
    compressedUrl: cloudinary.url(publicId, {
      resource_type: "video",
      transformation: compressedVideo(),
      format: COMPRESSED_FORMAT,
      secure: true,
    }),
    originalUrl: cloudinary.url(publicId, {
      resource_type: "video",
      secure: true,
    }),
  };
}
