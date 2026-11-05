import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-50 dark:bg-primary-900">
      <Suspense>
        <SignIn />
      </Suspense>
    </div>
  );
}
