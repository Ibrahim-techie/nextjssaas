import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Cloudinary's browser helpers require a public cloud name. Reuse the
  // server-side CLOUDINARY_CLOUD_NAME when no public alias is configured.
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
      process.env.CLOUDINARY_CLOUD_NAME ??
      "",
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
