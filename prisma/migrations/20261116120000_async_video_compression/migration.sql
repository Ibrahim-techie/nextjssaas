-- The compressed MP4 is generated in the background after upload, so its size is unknown at first.
ALTER TABLE "Video" ALTER COLUMN "compressedSize" DROP NOT NULL;

-- Webhooks and status checks look videos up by their Cloudinary public ID.
CREATE INDEX "Video_publicId_idx" ON "Video"("publicId");
