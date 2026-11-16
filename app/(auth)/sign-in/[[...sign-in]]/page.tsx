import { Suspense } from "react";
import Logo from "@/components/Logo";
import { ThemedSignIn } from "@/components/ThemedClerk";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-base-200 px-4 py-12 text-base-content">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="mb-8">
          <Logo />
        </div>
        <Suspense
          fallback={
            <div className="h-[440px] w-full rounded-xl border border-line bg-base-100" />
          }
        >
          <ThemedSignIn />
        </Suspense>
        <p className="mt-6 text-center text-xs text-fg-3">
          Your library and compressed videos are waiting
        </p>
      </div>
    </main>
  );
}
