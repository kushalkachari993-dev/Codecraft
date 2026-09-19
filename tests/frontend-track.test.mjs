import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const modules = new Map();
async function resolveLocal(specifier, parent) {
  if (/\.tsx?$/.test(specifier)) return new URL(specifier, parent);
  const path = new URL(specifier + ".ts", parent);
  try { await access(path); return path; } catch { return new URL(specifier + ".tsx", parent); }
}
async function loadModule(path) {
  const file = new URL(path, root);
  async function moduleUrl(url) {
    if (modules.has(url.href)) return modules.get(url.href);
    const source = await readFile(url, "utf8");
    let output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    for (const match of [...output.matchAll(/from ["']([^"']+)["']/g)]) {
      const specifier = match[1];
      const target = specifier.startsWith(".") ? await moduleUrl(await resolveLocal(specifier, url)) : import.meta.resolve(specifier);
      output = output.replace(match[0], "from " + JSON.stringify(target));
    }
    const result = "data:text/javascript;base64," + Buffer.from(output).toString("base64");
    modules.set(url.href, result);
    return result;
  }
  return import(await moduleUrl(file));
}

const { FRONTEND_CURRICULA, getFrontendLesson, getFrontendLessons } = await loadModule("app/frontend/curriculum.ts");
const { evaluateFrontendArtifact, getFrontendArtifact } = await loadModule("app/frontend/artifacts.ts");
const { getFrontendCheckpoints } = await loadModule("app/frontend/checkpoints.ts");
const { getFrontendEvidenceExercise } = await loadModule("app/frontend/evidence.ts");
const { frontendCompleted, frontendLessonXp, frontendProfileStat, completeFrontendDailyQuest, completeFrontendLesson, isFrontendLessonUnlocked } = await loadModule("app/frontend/progress.ts");
const { FRONTEND_PATH_TOTAL, FRONTEND_TRACK, getFrontendWorlds, isFrontendWorldProject } = await loadModule("app/frontend/track.ts");
const { evaluateCloudPlan, serializeCloudPlan } = await loadModule("app/cloud/model.ts");
const { DEFAULT_PROGRESS, normalizeProgress } = await loadModule("app/progress.ts");
const { learningPathForRoute, parseLearningLocation } = await loadModule("app/navigation.ts");
const PACES = ["beginner", "intermediate", "expert"];

test("Frontend contains three complete and distinct 21-topic paths", () => {
  assert.deepEqual(Object.keys(FRONTEND_CURRICULA), PACES);
  assert.equal(FRONTEND_PATH_TOTAL, 21);
  assert.equal(FRONTEND_TRACK.total, 63);
  assert.equal(new Set(PACES.flatMap((paceId) => getFrontendLessons(paceId).map((lesson) => lesson.title))).size, 63);
  for (const paceId of PACES) {
    const lessons = getFrontendLessons(paceId);
    assert.deepEqual(lessons.map((lesson) => lesson.id), Array.from({ length: 21 }, (_, index) => index + 1));
    assert.deepEqual(getFrontendWorlds(paceId).map((world) => world.end), [5, 10, 15, 21]);
    assert.deepEqual(lessons.filter((lesson) => isFrontendWorldProject(paceId, lesson.id)).map((lesson) => lesson.id), [5, 10, 15, 21]);
    for (const lesson of lessons) {
      assert.equal(lesson.concepts.length, 3);
      assert.ok(lesson.concepts.every((concept) => concept.body.length >= 120), paceId + " lesson " + lesson.id);
      assert.equal(lesson.fields.length, 6);
      assert.equal(lesson.checks.length, 5);
      for (const format of ["json", "hcl", "yaml"]) {
        assert.equal(evaluateCloudPlan(lesson, serializeCloudPlan(lesson.solution, format), format).passed, true);
        assert.equal(evaluateCloudPlan(lesson, serializeCloudPlan(lesson.starter, format), format).passed, false);
      }
    }
    assert.equal(getFrontendLesson(paceId, 22), undefined);
  }
});

test("every Frontend lesson has three scenario decisions and browser evidence", () => {
  for (const paceId of PACES) {
    const lessons = getFrontendLessons(paceId);
    const questions = lessons.flatMap((lesson) => getFrontendCheckpoints(paceId, lesson));
    const exercises = lessons.map((lesson) => getFrontendEvidenceExercise(paceId, lesson));
    assert.equal(questions.length, 63);
    assert.equal(new Set(questions.map((entry) => entry.question)).size, 63);
    assert.deepEqual([...new Set(exercises.map((entry) => entry.kind))].sort(), ["cost-report", "logs", "plan-diff", "timeline", "traces"]);
    assert.equal(new Set(exercises.map((entry) => entry.evidence)).size, 21);
    for (const question of questions) { assert.equal(question.options.length, 3); assert.equal(new Set(question.options).size, 3); assert.ok(question.explanation.length >= 80); }
  }
});

test("every Frontend lesson includes a safe static artifact repair", () => {
  const expected = ["frontend.release.json", "lesson-card.css", "lesson.html", "load-items.ts"];
  for (const paceId of PACES) {
    const artifacts = getFrontendLessons(paceId).map((lesson) => getFrontendArtifact(paceId, lesson));
    assert.deepEqual([...new Set(artifacts.map((artifact) => artifact.filename))].sort(), expected);
    for (const artifact of artifacts) {
      assert.equal(evaluateFrontendArtifact(artifact, artifact.solution).passed, true, artifact.filename);
      assert.equal(evaluateFrontendArtifact(artifact, artifact.starter).passed, false, artifact.filename);
      assert.equal(artifact.checks.length, 4);
    }
  }
});

test("Frontend progress is sequential, isolated, and idempotent", () => {
  let progress = normalizeProgress({ ...DEFAULT_PROGRESS, completed: { "python-beginner": [1] } });
  let xp = progress.xp;
  for (const paceId of PACES) for (let id = 1; id <= 21; id += 1) {
    assert.equal(isFrontendLessonUnlocked(progress, id, paceId), true);
    assert.equal(isFrontendLessonUnlocked(progress, id + 1, paceId), false);
    progress = normalizeProgress(completeFrontendLesson(progress, id, paceId, new Date("2026-09-19T10:00:00Z")));
    xp += frontendLessonXp(id, paceId);
    assert.strictEqual(completeFrontendLesson(progress, id, paceId), progress);
  }
  assert.equal(progress.xp, xp);
  assert.deepEqual(progress.completed["python-beginner"], [1]);
  assert.deepEqual(frontendProfileStat(progress), { id: "frontend", icon: "FE", label: "Frontend Web Development", completed: 63, total: 63, projects: 12, percent: 100 });
  assert.equal(frontendCompleted(progress, "expert").length, 21);
});

test("Frontend daily quests reward only once per day", () => {
  const original = normalizeProgress(DEFAULT_PROGRESS);
  const first = normalizeProgress(completeFrontendDailyQuest(original, "beginner", 4, new Date("2026-09-19T10:00:00Z")));
  assert.equal(first.xp, original.xp + 30);
  assert.match(first.game.dailyQuestId, /^frontend-beginner-4-/);
  assert.strictEqual(completeFrontendDailyQuest(first, "expert", 9, new Date("2026-09-19T18:00:00Z")), first);
});

test("Frontend routes are dedicated and round-trip through navigation", async () => {
  const routeFiles = ["app/tracks/frontend/page.tsx", "app/roadmap/frontend/[paceId]/page.tsx", "app/lesson/frontend/[paceId]/[questId]/page.tsx", "app/daily-quest/frontend/[paceId]/page.tsx"];
  for (const file of routeFiles) assert.match(await readFile(new URL(file, root), "utf8"), /FrontendApp/);
  const paths = ["/tracks/frontend", ...PACES.flatMap((paceId) => ["/roadmap/frontend/" + paceId, "/lesson/frontend/" + paceId + "/1", "/lesson/frontend/" + paceId + "/21", "/daily-quest/frontend/" + paceId])];
  for (const path of paths) { const route = parseLearningLocation(path); assert.equal(route.kind, "frontend"); assert.equal(learningPathForRoute(route), path); }
  for (const path of ["/lesson/frontend/beginner/0", "/lesson/frontend/expert/22", "/roadmap/frontend/professional"]) assert.equal(parseLearningLocation(path).kind, "tracks");
});
