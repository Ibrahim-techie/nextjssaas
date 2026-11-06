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
    <ClerkProvider>
      <html data-theme="dark" lang="en">
        <body className="min-h-screen bg-base-100 font-sans antialiased">
          {children}
          <Toaster richColors position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
