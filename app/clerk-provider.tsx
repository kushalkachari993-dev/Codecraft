"use client";

import { ClerkProvider } from "@clerk/react";
import { CLERK_PUBLISHABLE_KEY } from "./clerk-config";

export default function CodeCraftClerkProvider({ children }: { children: React.ReactNode }) {
  if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error("VITE_CLERK_PUBLISHABLE_KEY is required to start CodeCraft.");
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  );
}
