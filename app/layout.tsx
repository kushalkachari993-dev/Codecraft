import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CodeCraftClerkProvider from "./clerk-provider";
import { getClerkPublishableKey, type ClerkRuntimeEnvironment } from "./clerk-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://codecraft-block-quests.kushalkachari993.chatgpt.site";
const title = "CodeCraft — An Original Voxel Coding Adventure";
const description = "Explore the original Code Realms with Byte, choose a learning path, and master Python, GenAI, or SQL through story-led lessons and checkpoints.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    images: [{ url: "/og-v2.png", width: 1731, height: 909, alt: "CodeCraft — Explore the Code Realms with Byte" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-v2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtimeEnvironment = typeof process === "undefined" ? undefined : process.env as ClerkRuntimeEnvironment;
  const publishableKey = getClerkPublishableKey(runtimeEnvironment);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CodeCraftClerkProvider publishableKey={publishableKey}>{children}</CodeCraftClerkProvider>
      </body>
    </html>
  );
}
