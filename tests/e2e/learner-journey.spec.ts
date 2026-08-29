import { expect, test } from "@playwright/test";
import { buildPythonPaceQuests, buildQuiz } from "../../app/codecraft-catalog";
import { getAuthoredLessonEnrichment } from "../../app/lesson-enrichment-bundle";

test("a guest can navigate from track selection through a checkpoint and optional lab", async ({ page }) => {
  await page.goto("/tracks");
  await expect(page.getByRole("heading", { name: /Repair the Core Relay/i })).toBeVisible();

  const pythonCard = page.locator("article.track-card.python");
  await pythonCard.getByRole("button", { name: /Choose your pace/i }).click();
  await expect(page).toHaveURL(/\/tracks\/python$/);
  await expect(page.getByRole("heading", { name: /Choose your Python pace/i })).toBeVisible();

  const beginnerCard = page.locator("article.pace-card.beginner");
  await beginnerCard.getByRole("button", { name: /Start Beginner/i }).click();
  const tutorial = page.locator(".onboarding-dialog");
  await expect(tutorial).toBeVisible();
  await tutorial.getByRole("button", { name: "Next" }).click();
  await tutorial.getByRole("button", { name: "Next" }).click();
  await tutorial.getByRole("button", { name: /Start first lesson/i }).click();

  await expect(page).toHaveURL(/\/lesson\/python\/beginner\/1$/);
  await page.getByRole("button", { name: /See an explained example/i }).click();
  await page.getByRole("button", { name: /Take the checkpoint/i }).click();
  await expect(page.getByRole("heading", { name: /Prove what you learned/i })).toBeVisible();

  const quest = buildPythonPaceQuests("beginner")[0];
  const enrichment = getAuthoredLessonEnrichment("python", "beginner", quest.title);
  const questions = buildQuiz(quest, enrichment?.quiz ?? null);
  const fieldsets = page.locator(".quiz-list fieldset");
  await expect(fieldsets).toHaveCount(questions.length);
  for (let index = 0; index < questions.length; index += 1) {
    await fieldsets.nth(index).locator("label").nth(questions[index].answer).click();
  }
  await page.getByRole("button", { name: /Check answers/i }).click();
  await expect(page.getByText(/Checkpoint passed!/i)).toBeVisible();
  await page.getByRole("button", { name: /Try optional coding/i }).click();
  await expect(page.getByRole("button", { name: /Run Python/i })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /code editor/i })).toBeVisible();
});

test("browser Back and Forward restore the learner's roadmap and lesson", async ({ page }) => {
  await page.goto("/lesson/python/beginner/1");
  await expect(page.locator(".lesson-page")).toBeVisible();

  await page.getByRole("button", { name: "← Roadmap", exact: true }).click();
  await expect(page).toHaveURL(/\/roadmap\/python\/beginner$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/lesson\/python\/beginner\/1$/);
  await expect(page.locator(".lesson-page")).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/roadmap\/python\/beginner$/);
  await expect(page.locator(".roadmap-page")).toBeVisible();
});

test("daily quest and guest profile open from the roadmap", async ({ page }) => {
  await page.goto("/roadmap/python/beginner");
  await expect(page.locator(".roadmap-page")).toBeVisible();

  await page.locator("button.profile-card").click();
  await expect(page.getByRole("dialog", { name: /Relay Apprentice/i })).toBeVisible();
  await expect(page.getByText(/Sign in to save attempts/i)).toBeVisible();
  await page.locator("button.profile-close").click();

  await page.getByRole("button", { name: "Daily Quest", exact: true }).click();
  await expect(page).toHaveURL(/\/daily-quest\/python\/beginner$/);
  await expect(page.getByText(/TODAY'S RELAY CHALLENGE/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Run Python/i })).toBeVisible();
});

test("a real Python runtime executes the daily quest starter code", async ({ page }) => {
  test.slow();
  await page.goto("/daily-quest/python/beginner");
  const runButton = page.getByRole("button", { name: /Run Python/i });
  await expect(runButton).toBeVisible({ timeout: 20_000 });
  await runButton.click();
  await expect(page.locator(".execution-details")).toBeVisible({ timeout: 90_000 });
  await expect(page.locator(".execution-output")).toContainText("OUTPUT");
  await expect(page.locator(".test-results")).toContainText("TEST RESULTS");
});

test("the primary guest journey remains usable on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tracks");
  await expect(page.getByRole("heading", { name: /Repair the Core Relay/i })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);

  await page.locator("article.track-card.python").getByRole("button", { name: /Choose your pace/i }).click();
  await expect(page.getByRole("heading", { name: /Choose your Python pace/i })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
});
