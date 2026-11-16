import { Suspense } from "react";
import Logo from "@/components/Logo";
import { ThemedSignUp } from "@/components/ThemedClerk";

export const metadata = { title: "Create an account" };

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-base-200 px-4 py-12 text-base-content">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="mb-8">
          <Logo />
        </div>
        <Suspense
          fallback={
            <div className="h-[480px] w-full rounded-xl border border-line bg-base-100" />
          }
        >
          <ThemedSignUp />
        </Suspense>
        <p className="mt-6 text-center text-xs text-fg-3">
          Compress videos and crop images for every feed
        </p>
      </div>
    </main>
  );
}
