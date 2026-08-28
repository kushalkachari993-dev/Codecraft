import { createClerkClient } from "@clerk/backend";
import { clerk } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";
import { DEFAULT_PROGRESS } from "../../app/progress";

test.describe.configure({ mode: "serial" });

const publishableKey = process.env.CLERK_PUBLISHABLE_KEY ?? "";
const secretKey = process.env.CLERK_SECRET_KEY ?? "";
const clerkClient = createClerkClient({ publishableKey, secretKey });
let testUserId = "";
let testEmail = "";

test.beforeAll(async () => {
  if (!publishableKey.startsWith("pk_test_") || !secretKey.startsWith("sk_test_")) {
    throw new Error("Authenticated E2E is restricted to Clerk development keys.");
  }
  const runId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  testEmail = `codecraft+clerk_test_${runId}@example.com`;
  const disposablePassword = `Cc!${crypto.randomUUID()}7z`;
  const user = await clerkClient.users.createUser({
    emailAddress: [testEmail],
    firstName: "CodeCraft",
    lastName: "Test Learner",
    password: disposablePassword,
  });
  testUserId = user.id;
});

test.afterAll(async () => {
  if (!testUserId) return;
  try {
    await clerkClient.users.deleteUser(testUserId);
  } catch {
    // The product's deletion flow normally removes this disposable user first.
  }
});

test("a signed-in learner syncs progress across browser state and permanently deletes the account", async ({ page }) => {
  test.slow();
  await page.goto("/tracks");
  await clerk.signIn({ page, emailAddress: testEmail });
  await page.goto("/tracks");
  await expect(page.getByText("Progress synced across devices")).toBeVisible({ timeout: 20_000 });

  const expectedXp = 781;
  const markedProgress = {
    ...DEFAULT_PROGRESS,
    xp: expectedXp,
    game: {
      ...DEFAULT_PROGRESS.game,
      updatedAt: Date.now(),
    },
  };
  await page.evaluate((progress) => {
    window.localStorage.setItem("codecraft-progress-v3", JSON.stringify(progress));
    window.localStorage.setItem("codecraft-xp", String(progress.xp));
  }, markedProgress);
  await page.reload();
  await expect(page.getByText("Cloud saved", { exact: true })).toBeVisible({ timeout: 20_000 });

  await page.evaluate(() => {
    window.localStorage.removeItem("codecraft-progress-v3");
    window.localStorage.removeItem("codecraft-xp");
  });
  await page.reload();
  await expect(page.getByRole("button", { name: `Open profile, ${expectedXp} XP` })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Progress synced across devices")).toBeVisible();

  const previousAnalyticsSession = await page.evaluate(() => window.localStorage.getItem("codecraft-analytics-session-v1"));

  await page.goto("/account/delete");
  await expect(page.getByRole("heading", { name: "Delete account" })).toBeVisible();
  await expect(page.getByText(testEmail)).toBeVisible();
  await page.getByLabel(/Type DELETE to confirm/i).fill("DELETE");
  const deletionResponse = page.waitForResponse((response) => response.url().endsWith("/api/account") && response.request().method() === "DELETE");
  await page.getByRole("button", { name: "Permanently delete account" }).click();
  const response = await deletionResponse;
  expect(response.status()).toBe(200);
  await expect(page).toHaveURL(/\/(?:tracks)?$/, { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Sign in to sync" })).toBeVisible();

  const localValues = await page.evaluate(() => ({
    progressV3: window.localStorage.getItem("codecraft-progress-v3"),
    progressV2: window.localStorage.getItem("codecraft-progress-v2"),
    legacyXp: window.localStorage.getItem("codecraft-xp"),
    analyticsSession: window.localStorage.getItem("codecraft-analytics-session-v1"),
  }));
  expect(localValues.progressV3).toBeNull();
  expect(localValues.progressV2).toBeNull();
  expect(localValues.legacyXp).toBeNull();
  expect(localValues.analyticsSession).not.toBe(previousAnalyticsSession);

  await expect.poll(async () => {
    try {
      await clerkClient.users.getUser(testUserId);
      return false;
    } catch (error) {
      return (error as { status?: number }).status === 404;
    }
  }, { timeout: 20_000 }).toBe(true);
  testUserId = "";
});
