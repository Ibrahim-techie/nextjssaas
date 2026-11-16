/** Clerk colors per theme, matching the graphite ramp and rose accent in globals.css. */

export const clerkLightVariables = {
  colorPrimary: "#d61f52",
  colorPrimaryForeground: "#ffffff",
  colorDanger: "#dc2626",
  colorSuccess: "#16a34a",
  colorWarning: "#b45309",
  colorNeutral: "#171717",
  colorForeground: "#171717",
  colorMuted: "#f4f4f5",
  colorMutedForeground: "#525252",
  colorBackground: "#ffffff",
  colorInput: "#ffffff",
  colorInputForeground: "#171717",
  colorBorder: "#e5e5e5",
  colorRing: "#d61f52",
  borderRadius: "0.5rem",
  fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
};

export const clerkDarkVariables = {
  ...clerkLightVariables,
  colorPrimary: "#ff6b91",
  colorPrimaryForeground: "#1a0a10",
  colorDanger: "#e5484d",
  colorSuccess: "#4cc38a",
  colorWarning: "#e2a336",
  colorNeutral: "#ededed",
  colorForeground: "#ededed",
  colorMuted: "#232325",
  colorMutedForeground: "#a1a1a6",
  colorBackground: "#19191b",
  colorInput: "#232325",
  colorInputForeground: "#ededed",
  colorBorder: "#2e2e31",
  colorRing: "#ff6b91",
};
