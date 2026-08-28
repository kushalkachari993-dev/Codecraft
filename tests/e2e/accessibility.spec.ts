import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  { path: "/tracks", ready: ".track-picker", name: "track selection" },
  { path: "/tracks?track=python", ready: ".python-pace-picker", name: "pace selection" },
  { path: "/tracks?track=python&pace=beginner", ready: ".roadmap-page", name: "roadmap" },
  { path: "/lesson?track=python&pace=beginner&quest=1", ready: ".lesson-page", name: "lesson" },
] as const;

for (const route of routes) {
  test(`${route.name} has no detectable WCAG A or AA violations`, async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "connection", {
        configurable: true,
        value: { effectiveType: "4g", saveData: true },
      });
    });
    await page.goto(route.path);
    await expect(page.locator(route.ready)).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const summary = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        message: node.failureSummary,
      })),
    }));
    expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
  });
}
