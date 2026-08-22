"use client";

import { ClerkProvider } from "@clerk/react";

export default function CodeCraftClerkProvider({ children, publishableKey }: { children: React.ReactNode; publishableKey?: string }) {
  if (!publishableKey) {
    throw new Error("VITE_CLERK_PUBLISHABLE_KEY is required to start CodeCraft.");
  }

  return (
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  );
}
