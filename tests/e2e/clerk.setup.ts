import { clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

setup.describe.configure({ mode: "serial" });

setup("configure Clerk testing tokens", async () => {
  if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    throw new Error("Authenticated E2E requires Clerk development publishable and secret keys.");
  }
  if (!process.env.CLERK_PUBLISHABLE_KEY.startsWith("pk_test_") || !process.env.CLERK_SECRET_KEY.startsWith("sk_test_")) {
    throw new Error("Authenticated E2E is restricted to a Clerk development instance.");
  }
  await clerkSetup();
});
