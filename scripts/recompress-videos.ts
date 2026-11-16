/**
 * Queues the compressed MP4 for every video that does not have one yet,
 * mainly videos uploaded before compression moved to background renditions.
 *
 *   npm run videos:recompress            queue missing renditions
 *   npm run videos:recompress -- --dry   only report what would happen
 *
 * Each queued video counts against your Cloudinary transformation quota.
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const dryRun = process.argv.includes("--dry");

async function main() {
  const { prisma } = await import("../lib/prisma");
  const {
    eagerNotificationUrl,
    fetchVideoResource,
    getCloudinary,
    videoEager,
  } = await import("../lib/cloudinary");

  const { cloudinary } = getCloudinary();
  const videos = await prisma.video.findMany({
    select: { id: true, title: true, publicId: true, compressedSize: true },
    orderBy: { createdAt: "asc" },
  });

  let alreadyDone = 0;
  let queued = 0;
  let failed = 0;

  for (const video of videos) {
    try {
      const { compressedBytes } = await fetchVideoResource(video.publicId);

      if (compressedBytes !== null) {
        alreadyDone += 1;
        if (video.compressedSize !== String(compressedBytes) && !dryRun) {
          await prisma.video.update({
            where: { id: video.id },
            data: { compressedSize: String(compressedBytes) },
          });
        }
        continue;
      }

      console.log(`${dryRun ? "Would queue" : "Queueing"}  ${video.title}`);
      if (dryRun) {
        queued += 1;
        continue;
      }

      await cloudinary.uploader.explicit(video.publicId, {
        type: "upload",
        resource_type: "video",
        eager: videoEager(),
        eager_async: true,
        eager_notification_url: eagerNotificationUrl(),
      });
      // Clearing the size moves updatedAt, which starts a new processing window.
      await prisma.video.update({
        where: { id: video.id },
        data: { compressedSize: null },
      });
      queued += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed     ${video.title}:`, error);
    }
  }

  console.log(
    `\n${videos.length} videos · ${alreadyDone} already compressed · ${queued} ${dryRun ? "to queue" : "queued"} · ${failed} failed`,
  );
  await prisma.$disconnect();
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
