# Frameflow

Compress videos to a fraction of their size and crop images to the exact dimensions each social channel asks for.

Next.js 16 (App Router), Clerk for auth, Cloudinary for media, Prisma 7 on PostgreSQL, Tailwind 4 with daisyUI.

## How uploads and compression work

1. The browser asks `POST /api/uploads/signature` for a signed, one-off upload. The server picks the public ID (`nextjssaas/videos/<userId>/<uuid>`) and the background renditions.
2. The browser uploads the file **directly to Cloudinary**. Files never pass through Next.js, which only buffers 10 MB of a request body when `proxy.ts` runs (and Vercel caps function bodies at 4.5 MB).
3. The browser sends the upload result to `POST /api/video-upload`. The server verifies Cloudinary's response signature, checks the public ID belongs to the user, reads the real size from the Admin API, and saves the record.
4. Cloudinary builds the compressed MP4 in the background (`eager_async`): H.264 + AAC, longest side 1280 px, `q_auto:eco`, 2 Mbps ceiling. The transformation lives in `lib/cloudinary.ts`.
5. The compressed size is stored when the rendition is ready, through the webhook at `/api/webhooks/cloudinary` when `APP_URL` is set, and otherwise by the library page checking while it is open.

Preview and download both use the compressed MP4. If a rendition has not appeared after six hours, the video is marked as failed and the original is offered instead.

## Setup

```bash
npm install
cp .env.example .env    # fill in Postgres, Clerk and Cloudinary keys
npm run db:migrate      # or `npm run db:deploy` against an existing database
npm run dev
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Generate the Prisma client and start the dev server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | Create and apply migrations in development |
| `npm run db:deploy` | Apply pending migrations (production, CI) |
| `npm run videos:recompress` | Queue the compressed MP4 for videos that do not have one yet, such as uploads from before background compression. Add `-- --dry` to only report. Each queued video uses Cloudinary transformation quota |

## Deploying

- Set every variable from `.env.example` in your host. Use Clerk production keys.
- Set `APP_URL` to the public HTTPS origin (for example `https://frameflow.example.com`). Cloudinary then reports finished renditions to `/api/webhooks/cloudinary`, which verifies the `X-Cld-Signature` header.
- Run `npm run db:deploy` before the new version starts serving traffic.
- Cloudinary's free plan allows videos up to 100 MB and images up to 10 MB, which are the limits in `lib/limits.ts`.
