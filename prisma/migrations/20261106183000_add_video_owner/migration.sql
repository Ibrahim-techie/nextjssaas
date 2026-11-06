-- Keep existing videos readable in the database while assigning ownership to new uploads.
ALTER TABLE "Video" ADD COLUMN "userId" TEXT;

CREATE INDEX "Video_userId_createdAt_idx" ON "Video"("userId", "createdAt");
