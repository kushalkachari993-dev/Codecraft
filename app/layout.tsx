import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
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

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "CodeCraft — An Original Voxel Coding Adventure";
  const description = "Explore the original Code Realms with Byte, choose a learning path, and master Python, GenAI, or SQL through story-led lessons and checkpoints.";
  const socialImage = new URL("/og-v2.png", origin).toString();

  return {
    title,
    description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: origin,
      images: [{ url: socialImage, width: 1731, height: 909, alt: "CodeCraft — Explore the Code Realms with Byte" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

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
