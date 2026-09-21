import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const root = new URL("../", import.meta.url); const modules = new Map();
async function resolveLocal(specifier, parent) { if (/\.tsx?$/.test(specifier)) return new URL(specifier, parent); const path = new URL(specifier + ".ts", parent); try { await access(path); return path; } catch { return new URL(specifier + ".tsx", parent); } }
async function loadModule(path) { const file = new URL(path, root); async function moduleUrl(url) { if (modules.has(url.href)) return modules.get(url.href); const source = await readFile(url, "utf8"); let output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText; for (const match of [...output.matchAll(/from ["']([^"']+)["']/g)]) { const specifier = match[1]; const target = specifier.startsWith(".") ? await moduleUrl(await resolveLocal(specifier, url)) : import.meta.resolve(specifier); output = output.replace(match[0], "from " + JSON.stringify(target)); } const result = "data:text/javascript;base64," + Buffer.from(output).toString("base64"); modules.set(url.href, result); return result; } return import(await moduleUrl(file)); }

const { DEFAULT_PROGRESS, PORTFOLIO_MILESTONE_IDS, PORTFOLIO_RUBRIC_IDS, mergeProgress, normalizeProgress } = await loadModule("app/progress.ts");
const { PORTFOLIO_PROJECTS, buildPortfolioShowcase, decodePortfolioShowcase, encodePortfolioShowcase, portfolioProjectComplete, portfolioProjectScore } = await loadModule("app/portfolio/catalog.ts");

test("portfolio ships one complete flagship brief per track", () => {
  assert.equal(PORTFOLIO_PROJECTS.length, 7);
  assert.equal(new Set(PORTFOLIO_PROJECTS.map((project) => project.id)).size, 7);
  for (const project of PORTFOLIO_PROJECTS) {
    assert.equal(project.milestones.length, 5, project.id);
    assert.deepEqual(project.milestones.map((milestone) => milestone.id), PORTFOLIO_MILESTONE_IDS);
    assert.ok(project.scenario.length >= 100, project.id);
    assert.ok(project.outcome.length >= 90, project.id);
    assert.ok(project.skills.length >= 5, project.id);
    assert.ok(project.artifacts.length >= 5, project.id);
    assert.ok(project.milestones.every((milestone) => milestone.deliverable.length >= 65 && milestone.evidencePrompt.length >= 60), project.id);
  }
});

test("portfolio state is bounded and rejects unknown fields", () => {
  const progress = normalizeProgress({ portfolio: { projects: { python: { completedMilestones: ["brief", "brief", "unknown"], evidence: { brief: "x".repeat(2_000), unknown: "private" }, rubric: { correctness: 9, unknown: 3 }, updatedAt: 42 }, unknown: { evidence: { brief: "no" } } }, updatedAt: 43 } });
  assert.deepEqual(progress.portfolio.projects.python.completedMilestones, ["brief"]);
  assert.equal(progress.portfolio.projects.python.evidence.brief.length, 1_200);
  assert.equal(progress.portfolio.projects.python.evidence.unknown, undefined);
  assert.equal(progress.portfolio.projects.python.rubric.correctness, 3);
  assert.equal(progress.portfolio.projects.unknown, undefined);
});

test("newest project state wins account sync without overwriting other tracks", () => {
  const local = normalizeProgress({ portfolio: { projects: { python: { completedMilestones: ["brief"], evidence: { brief: "local" }, rubric: {}, updatedAt: 20 }, sql: { completedMilestones: ["brief"], evidence: {}, rubric: {}, updatedAt: 10 } }, updatedAt: 20 } });
  const cloud = normalizeProgress({ portfolio: { projects: { python: { completedMilestones: ["design"], evidence: { design: "cloud" }, rubric: {}, updatedAt: 15 }, data: { completedMilestones: ["brief"], evidence: {}, rubric: {}, updatedAt: 30 } }, updatedAt: 30 } });
  const merged = mergeProgress(local, cloud);
  assert.deepEqual(merged.portfolio.projects.python.completedMilestones, ["brief"]);
  assert.deepEqual(merged.portfolio.projects.sql.completedMilestones, ["brief"]);
  assert.deepEqual(merged.portfolio.projects.data.completedMilestones, ["brief"]);
});

test("portfolio readiness requires every milestone and a ready rubric", () => {
  const project = { completedMilestones: [...PORTFOLIO_MILESTONE_IDS], evidence: {}, rubric: Object.fromEntries(PORTFOLIO_RUBRIC_IDS.map((id) => [id, 2])), updatedAt: 1 };
  assert.equal(portfolioProjectScore(project), 67);
  assert.equal(portfolioProjectComplete(project), true);
  assert.equal(portfolioProjectComplete({ ...project, rubric: { ...project.rubric, reliability: 1 } }), false);
  assert.equal(portfolioProjectComplete({ ...project, completedMilestones: PORTFOLIO_MILESTONE_IDS.slice(0, 4) }), false);
});

test("share tokens round-trip summaries without exposing private evidence", () => {
  const progress = normalizeProgress({ ...DEFAULT_PROGRESS, portfolio: { projects: { python: { completedMilestones: ["brief"], evidence: { brief: "private architecture notes" }, rubric: { correctness: 2 }, updatedAt: 1 } }, updatedAt: 1 } });
  const token = encodePortfolioShowcase(buildPortfolioShowcase(progress, "Ada Builder"));
  assert.doesNotMatch(token, /private|architecture/i);
  const showcase = decodePortfolioShowcase(token);
  assert.equal(showcase.learner, "Ada Builder");
  assert.deepEqual(showcase.projects, [{ id: "python", score: 17, milestones: 1, complete: false }]);
  assert.equal(decodePortfolioShowcase("not-valid"), null);
});

test("portfolio route and discovery links are present", async () => {
  for (const file of ["app/portfolio/page.tsx", "app/portfolio/portfolio-app.tsx"]) await access(new URL(file, root));
  assert.match(await readFile(new URL("app/components/track-picker-view.tsx", root), "utf8"), /href="\/portfolio"/);
  assert.match(await readFile(new URL("app/components/profile-panel.tsx", root), "utf8"), /Portfolio projects/);
});
