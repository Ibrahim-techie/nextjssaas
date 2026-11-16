import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Providers from "@/app/provider";
import AppToaster from "@/components/AppToaster";
import { clerkLightVariables } from "@/lib/clerk-appearance";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Frameflow · Smaller videos, social-size images",
    template: "%s · Frameflow",
  },
  description:
    "Compress videos to a fraction of their size and crop images to the exact dimensions Instagram, YouTube, Facebook and LinkedIn ask for.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
        <ClerkProvider appearance={{ variables: clerkLightVariables,
          options: {
            unsafe_disableDevelopmentModeWarnings: true,
          }
         }}>
      <html
        data-theme="frameflow"
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
        
      >
        <body className="min-h-screen bg-base-200 font-sans text-base-content antialiased">
          <Providers>
            {children}
            <AppToaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
