import Link from "next/link";
import { Suspense } from "react";
import { Clapperboard } from "lucide-react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7f8fc] px-4 py-12">
      <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-indigo-200/60 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-cyan-100/80 blur-3xl" />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#635bff] text-white shadow-lg shadow-indigo-500/20">
            <Clapperboard className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Frameflow</span>
        </Link>
        <Suspense
          fallback={
            <div className="h-[440px] w-full animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm" />
          }
        >
          <SignIn />
        </Suspense>
        <p className="mt-6 text-center text-xs text-slate-500">
          Your creative workspace, ready when you are.
        </p>
      </div>
    </main>
  );
}
