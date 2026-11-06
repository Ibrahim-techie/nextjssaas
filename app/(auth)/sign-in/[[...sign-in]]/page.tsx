import Link from "next/link";
import { Suspense } from "react";
import { Clapperboard } from "lucide-react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-base-200 px-4 py-12 text-base-content">
      <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent/25 blur-3xl" />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-content shadow-lg shadow-primary/20">
            <Clapperboard className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Frameflow</span>
        </Link>
        <Suspense
          fallback={
            <div className="h-[440px] w-full animate-pulse rounded-3xl border border-base-300 bg-base-100 shadow-sm" />
          }
        >
          <SignIn />
        </Suspense>
        <p className="mt-6 text-center text-xs text-base-content/60">
          Your creative workspace, ready when you are.
        </p>
      </div>
    </main>
  );
}
