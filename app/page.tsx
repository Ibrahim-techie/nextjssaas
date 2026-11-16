import Link from "next/link";
import { ArrowDownToLine, Crop, FileVideo, Lock, Play } from "lucide-react";
import DuskStill from "@/components/DuskStill";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const crops = [
  { name: "Instagram post", size: "1080 × 1080", ratio: "aspect-square" },
  { name: "Story", size: "1080 × 1920", ratio: "aspect-[9/16]" },
  { name: "YouTube", size: "1280 × 720", ratio: "aspect-video" },
];

const steps = [
  {
    icon: FileVideo,
    title: "A compressed copy of every clip",
    copy: "Each upload gets an H.264 MP4 with its longest side capped at 1280 px and a 2 Mbps ceiling, made in the background. Your library shows both sizes side by side.",
  },
  {
    icon: Crop,
    title: "The exact size for each feed",
    copy: "Instagram post and story, Facebook, YouTube thumbnail and LinkedIn. The crop follows the subject of the photo instead of the center.",
  },
  {
    icon: Lock,
    title: "Private to your account",
    copy: "Uploads are tied to your sign-in and only appear in your own library",
  },
];

function ProductPreview() {
  return (
    <div className="rounded-[20px] border border-line bg-base-100 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <article className="overflow-hidden rounded-xl border border-line">
        <div className="viewfinder relative aspect-video bg-frame">
          <DuskStill id="hero-still" className="size-full" />
          <span className="absolute inset-0 z-[2] grid place-items-center">
            <span className="grid size-11 place-items-center rounded-full border border-white/20 bg-black/40 text-white">
              <Play className="ml-0.5 size-4 fill-current" strokeWidth={1.5} />
            </span>
          </span>
          <span className="absolute bottom-4 right-7 z-[2] rounded bg-black/60 px-1.5 py-0.5 font-mono text-xs tabular-nums text-white">
            0:42
          </span>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <p className="text-[15px] font-medium leading-5">Harbour at dusk</p>
            <p className="mt-1 text-[13px] leading-5 text-fg-2">
              Drone pass for the Saturday post
            </p>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-xs tabular-nums text-fg-2">
                84.2 MB<span className="px-1.5 text-fg-3">→</span>
                <span className="text-base-content">9.6 MB</span>
              </p>
              <p className="text-xs font-medium tabular-nums text-primary">89% smaller</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300">
              <div className="h-full w-[11%] rounded-full bg-primary" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-xs text-fg-3">Added 2 minutes ago</span>
            <span className="inline-flex h-8 items-center gap-2 rounded-lg border border-line-strong px-3 text-[13px] font-medium">
              <ArrowDownToLine className="size-4 text-fg-2" strokeWidth={1.5} />
              Download MP4
            </span>
          </div>
        </div>
      </article>

      <div className="grid grid-cols-[1fr_0.56fr_1.6fr] items-end gap-2 p-2 pt-4">
        {crops.map((crop, index) => (
          <figure key={crop.name} className="min-w-0">
            <div className={`${crop.ratio} overflow-hidden rounded-md bg-frame`}>
              <DuskStill id={`crop-${index}`} className="size-full" />
            </div>
            <figcaption className="mt-2 truncate text-xs text-fg-2">
              {crop.name}
              <span className="hidden font-mono tabular-nums text-fg-3 sm:block">
                {crop.size}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Account">
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="rounded-lg px-3 py-2 text-sm text-fg-2 transition-colors hover:text-base-content"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-9 items-center rounded-lg bg-base-content px-4 text-sm font-medium text-base-100 transition-[opacity,transform] hover:opacity-90 active:scale-[0.98]"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-12 sm:px-8 lg:min-h-[calc(100svh-64px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-16">
          <div className="enter max-w-xl">
            <h1 className="text-[40px] font-medium leading-[1.06] tracking-[-0.02em] sm:text-[56px] sm:tracking-[-0.03em] lg:text-[60px]">
              Videos small enough to post. Images sized for every feed
            </h1>
            <p className="mt-6 max-w-[36rem] text-lg leading-[30px] text-fg-2">
              Frameflow turns a clip of up to 100 MB into an H.264 MP4 at a
              fraction of the size, and crops one photo to the exact pixels
              Instagram, YouTube, Facebook and LinkedIn ask for
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center rounded-lg bg-primary px-5 text-[15px] font-medium text-primary-content transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98]"
              >
                Create an account
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex h-12 items-center rounded-lg border border-line-strong bg-base-100 px-5 text-[15px] font-medium transition-colors hover:bg-base-300"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="enter-2 mx-auto w-full max-w-xl lg:max-w-none">
            <ProductPreview />
          </div>
        </section>

        <section className="border-t border-line bg-base-100">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-24">
            <h2 className="max-w-xl text-[32px] font-medium leading-tight">
              What happens to your files
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map(({ icon: Icon, title, copy }) => (
                <article key={title} className="border-t border-line pt-6">
                  <Icon className="size-[18px] text-fg-3" strokeWidth={1.5} />
                  <h3 className="mt-4 text-base font-medium">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-fg-2">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-xs text-fg-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>Frameflow</span>
          <span>Video compression and social image sizes</span>
        </div>
      </footer>
    </div>
  );
}
