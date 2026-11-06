import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Frameflow — Your media, ready to share",
    template: "%s · Frameflow",
  },
  description:
    "Upload, optimize, and prepare videos and images for every social channel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#e82d5e",
          colorPrimaryForeground: "#ffffff",
          colorDanger: "#a91e42",
          colorSuccess: "#a91e42",
          colorWarning: "#f57a8e",
          colorNeutral: "#6e1028",
          colorForeground: "#380411",
          colorMuted: "#fdebed",
          colorMutedForeground: "#6e1028",
          colorBackground: "#fff8f9",
          colorInput: "#fff8f9",
          colorInputForeground: "#380411",
          colorBorder: "#f8b6bf",
          colorRing: "#e82d5e",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "border border-base-300 shadow-xl",
          headerTitle: "text-base-content",
          headerSubtitle: "text-base-content/65",
          formButtonPrimary: "btn btn-primary",
          footerActionLink: "text-primary",
        },
      }}
    >
      <html data-theme="frameflow" lang="en">
        <body className="min-h-screen bg-base-100 font-sans antialiased">
          {children}
          <Toaster theme="light" richColors position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
