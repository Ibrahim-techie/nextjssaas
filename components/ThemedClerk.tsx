"use client";

import { SignIn, SignUp, UserButton } from "@clerk/nextjs";
import { clerkDarkVariables, clerkLightVariables } from "@/lib/clerk-appearance";
import { useThemeMode } from "@/lib/use-theme-mode";

function useClerkAppearance() {
  const { isDark } = useThemeMode();
  return { variables: isDark ? clerkDarkVariables : clerkLightVariables };
}

export function ThemedSignIn() {
  return <SignIn appearance={useClerkAppearance()} />;
}

export function ThemedSignUp() {
  return <SignUp appearance={useClerkAppearance()} />;
}

export function ThemedUserButton() {
  const appearance = useClerkAppearance();
  return (
    <UserButton
      appearance={{ ...appearance, elements: { avatarBox: "size-8" } }}
    />
  );
}
