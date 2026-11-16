"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/lib/use-theme-mode";

export default function ThemeToggle() {
  const { isDark, toggle } = useThemeMode();

  return (
    <button
      type="button"
      className="grid size-9 place-items-center rounded-lg text-fg-2 transition-colors hover:bg-base-300 hover:text-base-content"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggle}
    >
      {isDark ? (
        <Sun className="size-4" strokeWidth={1.5} />
      ) : (
        <Moon className="size-4" strokeWidth={1.5} />
      )}
    </button>
  );
}
