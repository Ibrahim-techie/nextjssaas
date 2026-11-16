"use client";

import { Toaster } from "sonner";
import { useThemeMode } from "@/lib/use-theme-mode";

export default function AppToaster() {
  const { isDark } = useThemeMode();
  return <Toaster theme={isDark ? "dark" : "light"} position="bottom-right" />;
}
