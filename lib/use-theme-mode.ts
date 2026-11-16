"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

export const LIGHT_THEME = "frameflow";
export const DARK_THEME = "frameflow-dark";

const subscribe = () => () => {};

/** False on the server and the first client render, so markup hydrates cleanly. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function useThemeMode() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === DARK_THEME;

  return {
    isDark,
    toggle: () => setTheme(isDark ? LIGHT_THEME : DARK_THEME),
  };
}
