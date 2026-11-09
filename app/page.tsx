import Link from "next/link";

import {
  ArrowRight,
  Check,
  Clapperboard,
  Image as ImageIcon,
  Play,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const featureCards = [
  {
    icon: Clapperboard,
    title: "A home for every clip",
    copy: "Keep your uploads organized with clear previews, file details, and quick downloads.",
  },
  {
    icon: WandSparkles,
    title: "Optimized as you go",
    copy: "Deliver media in efficient formats and sizes without managing complex export settings.",
  },
  {
    icon: ImageIcon,
    title: "Ready for every channel",
    copy: "Prepare one image for posts, stories, thumbnails, and professional profiles.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-base-200 text-base-content">
      <header className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Frameflow home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-content shadow-lg shadow-primary/20">
            <Clapperboard className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Frameflow</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Account">
          <Link
            href="/sign-in"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-base-content/70 transition hover:text-primary sm:px-4"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="btn btn-secondary rounded-xl px-4 sm:px-5"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-28">
        <div className="absolute -left-40 top-12 -z-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/85 px-3.5 py-2 text-xs font-semibold text-secondary shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Your creative workflow, simplified
          </div>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Make your media
            <span className="block text-primary">ready for anywhere.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-base-content/70 sm:text-lg sm:leading-8">
            Upload a video, keep it organized, and create social-ready images in
            one calm, simple workspace.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/sign-up"
              className="btn btn-primary h-auto min-h-12 rounded-xl px-5 py-3.5 shadow-lg shadow-primary/20 transition hover:-translate-y-0.5"
            >
              Create your workspace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="btn btn-outline btn-secondary h-auto min-h-12 rounded-xl px-5 py-3.5"
            >
              I already have an account
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-base-content/60">
            {["Organized uploads", "Fast previews", "Social formats"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-success" /> {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-xl">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/40 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative rounded-[2rem] border border-base-300/60 bg-base-100 p-3 shadow-xl">
            <div className="overflow-hidden rounded-[1.45rem] bg-neutral text-neutral-content">
              <div className="relative flex aspect-[1.22] items-center justify-center overflow-hidden" style={{ background: "radial-gradient(ellipse at 55% 35%, var(--color-accent) 0%, var(--color-secondary) 42%, var(--color-neutral) 100%)" }}>
                <div className="absolute -left-16 top-1/3 h-48 w-48 rounded-full bg-accent/40 blur-3xl" />
                <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-primary/25 blur-3xl" />
                <div className="relative grid h-16 w-16 place-items-center rounded-full border border-neutral-content/30 bg-neutral-content/15 text-neutral-content shadow-xl backdrop-blur">
                  <Play className="ml-1 h-6 w-6 fill-current" />
                </div>
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-neutral-content/15 bg-neutral/65 p-4 text-neutral-content backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">Weekend highlights.mp4</p>
                      <p className="mt-1 text-xs text-neutral-content/65">Optimized · 1080p · 00:42</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-success/20 px-2.5 py-1.5 text-xs font-semibold text-neutral-content">
                      −38%
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-content/15">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-accent" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-3">
                {[
                  { label: "Instagram", size: "1080 × 1080", style: "from-primary to-accent" },
                  { label: "Story", size: "1080 × 1920", style: "from-secondary to-primary" },
                  { label: "YouTube", size: "1280 × 720", style: "from-accent to-secondary" },
                ].map((format) => (
                  <div key={format.label} className="rounded-xl bg-neutral-content/5 p-2.5 text-neutral-content">
                    <div className={`mb-2 aspect-[1.4] rounded-lg bg-gradient-to-br ${format.style}`} />
                    <p className="text-[10px] font-semibold sm:text-xs">{format.label}</p>
                    <p className="mt-0.5 text-[9px] text-neutral-content/60 sm:text-[10px]">{format.size}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -right-2 top-10 hidden items-center gap-2 rounded-2xl border border-base-300 bg-base-100 px-3.5 py-3 shadow-xl sm:flex">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-success/10 text-success">
              <Check className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold text-base-content">Ready to publish</span>
          </div>
        </div>
      </section>

      <section className="border-y border-base-300/70 bg-base-100 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">One simple workspace</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Less file juggling. More making.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, copy }, index) => (
              <article key={title} className="rounded-3xl border border-base-300/70 bg-base-200/45 p-6 sm:p-7">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${index === 0 ? "bg-primary/10 text-primary" : index === 1 ? "bg-secondary/10 text-secondary" : "bg-accent/25 text-secondary"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-base-content/55 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span> Frameflow</span>
        <span>Media tools for creators who make things.</span>
      </footer>
    </main>
  );
}
