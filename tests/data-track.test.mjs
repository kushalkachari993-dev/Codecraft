import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const root = new URL("../", import.meta.url); const modules = new Map();
async function resolveLocal(specifier, parent) { if (/\.tsx?$/.test(specifier)) return new URL(specifier, parent); const path = new URL(specifier + ".ts", parent); try { await access(path); return path; } catch { return new URL(specifier + ".tsx", parent); } }
async function loadModule(path) { const file = new URL(path, root); async function moduleUrl(url) { if (modules.has(url.href)) return modules.get(url.href); const source = await readFile(url, "utf8"); let output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText; for (const match of [...output.matchAll(/from ["']([^"']+)["']/g)]) { const specifier = match[1]; const target = specifier.startsWith(".") ? await moduleUrl(await resolveLocal(specifier, url)) : import.meta.resolve(specifier); output = output.replace(match[0], "from " + JSON.stringify(target)); } const result = "data:text/javascript;base64," + Buffer.from(output).toString("base64"); modules.set(url.href, result); return result; } return import(await moduleUrl(file)); }

const { DATA_CURRICULA, getDataLesson, getDataLessons } = await loadModule("app/data/curriculum.ts");
const { getDataCheckpoints } = await loadModule("app/data/checkpoints.ts");
const { DATA_ENRICHMENT_COUNT, getDataEnrichment } = await loadModule("app/data/enrichment.ts");
const { getDataEvidenceExercise } = await loadModule("app/data/evidence.ts");
const { evaluateDataArtifact, getDataArtifact } = await loadModule("app/data/artifacts.ts");
const { completeDataDailyQuest, completeDataLesson, dataCompleted, dataLessonXp, dataProfileStat, isDataLessonUnlocked } = await loadModule("app/data/progress.ts");
const { DATA_PATH_TOTAL, DATA_TRACK, getDataWorlds, isDataWorldProject } = await loadModule("app/data/track.ts");
const { evaluateCloudPlan, serializeCloudPlan } = await loadModule("app/cloud/model.ts");
const { DEFAULT_PROGRESS, normalizeProgress } = await loadModule("app/progress.ts");
const { learningPathForRoute, parseLearningLocation } = await loadModule("app/navigation.ts");
const PACES = ["beginner", "intermediate", "expert"];

test("Data Engineering contains three distinct, complete 21-topic paths", () => {
  assert.deepEqual(Object.keys(DATA_CURRICULA), PACES); assert.equal(DATA_PATH_TOTAL, 21); assert.equal(DATA_TRACK.total, 63); assert.equal(DATA_ENRICHMENT_COUNT, 63);
  assert.equal(new Set(PACES.flatMap((pace) => getDataLessons(pace).map((lesson) => lesson.title))).size, 63);
  for (const pace of PACES) { const lessons = getDataLessons(pace); assert.deepEqual(lessons.map((lesson) => lesson.id), Array.from({ length: 21 }, (_, i) => i + 1)); assert.deepEqual(getDataWorlds(pace).map((world) => world.end), [5, 10, 15, 21]);
    for (const lesson of lessons) { const enrichment = getDataEnrichment(lesson.title); assert.equal(lesson.concepts.length, 4); assert.ok(lesson.concepts.every((concept) => concept.body.length >= 100)); assert.ok(lesson.example.length >= 300); assert.match(lesson.example, new RegExp(enrichment.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")); assert.ok(lesson.practice.prompt.length >= 220); assert.ok(enrichment.scenario.length >= 55); assert.ok(enrichment.evidence.length >= 45); assert.ok(enrichment.decision.length >= 45); assert.ok(enrichment.proof.length >= 45); assert.equal(lesson.fields.length, 6); assert.equal(lesson.checks.length, 5); if (isDataWorldProject(pace, lesson.id)) assert.equal(lesson.projectStages.length, 4); else assert.equal(lesson.projectStages, undefined); for (const format of ["json", "hcl", "yaml"]) { assert.equal(evaluateCloudPlan(lesson, serializeCloudPlan(lesson.solution, format), format).passed, true); assert.equal(evaluateCloudPlan(lesson, serializeCloudPlan(lesson.starter, format), format).passed, false); } }
    assert.equal(getDataLesson(pace, 22), undefined);
  }
});

test("every Data lesson has scenarios, varied evidence, and safe static artifacts", () => {
  for (const pace of PACES) { const lessons = getDataLessons(pace); const checkpoints = lessons.flatMap((lesson) => getDataCheckpoints(pace, lesson)); const evidence = lessons.map((lesson) => getDataEvidenceExercise(pace, lesson)); assert.equal(checkpoints.length, 63); assert.deepEqual([...new Set(evidence.map((item) => item.kind))].sort(), ["cost-report", "logs", "plan-diff", "timeline", "traces"]); for (const item of checkpoints) { assert.equal(item.options.length, 3); assert.equal(new Set(item.options).size, 3); assert.ok(item.explanation.length >= 100); } for (const lesson of lessons) { const artifact = getDataArtifact(pace, lesson); assert.equal(evaluateDataArtifact(artifact, artifact.solution).passed, true, artifact.filename); assert.equal(evaluateDataArtifact(artifact, artifact.starter).passed, false, artifact.filename); assert.equal(artifact.checks.length, 4); } }
});

test("Data artifacts match the engineering skill being taught", () => {
  const cases = [
    ["beginner", "CSV, JSON, and Parquet", "transform.py"],
    ["intermediate", "Directed Acyclic Graphs", "pipeline.yml"],
    ["intermediate", "Data Contracts and Schema Evolution", "contract.json"],
    ["beginner", "Fact and Dimension Tables", "model.sql"],
  ];
  for (const [pace, title, filename] of cases) {
    const lesson = getDataLessons(pace).find((entry) => entry.title === title);
    assert.ok(lesson, title);
    assert.equal(getDataArtifact(pace, lesson).filename, filename);
  }
});

test("Data progress is sequential, isolated, and idempotent", () => { let progress = normalizeProgress({ ...DEFAULT_PROGRESS, completed: { "python-beginner": [1] } }); let xp = progress.xp; for (const pace of PACES) for (let id = 1; id <= 21; id += 1) { assert.equal(isDataLessonUnlocked(progress, id, pace), true); assert.equal(isDataLessonUnlocked(progress, id + 1, pace), false); progress = normalizeProgress(completeDataLesson(progress, id, pace, new Date("2026-09-21T10:00:00Z"))); xp += dataLessonXp(id, pace); assert.strictEqual(completeDataLesson(progress, id, pace), progress); } assert.equal(progress.xp, xp); assert.deepEqual(progress.completed["python-beginner"], [1]); assert.deepEqual(dataProfileStat(progress), { id: "data", icon: "DE", label: "Data Engineering", completed: 63, total: 63, projects: 12, percent: 100 }); assert.equal(dataCompleted(progress, "expert").length, 21); });

test("Data daily quests reward once and routes round-trip", async () => { const original = normalizeProgress(DEFAULT_PROGRESS); const first = normalizeProgress(completeDataDailyQuest(original, "beginner", 4, new Date("2026-09-21T10:00:00Z"))); assert.equal(first.xp, original.xp + 30); assert.match(first.game.dailyQuestId, /^data-beginner-4-/); assert.strictEqual(completeDataDailyQuest(first, "expert", 9, new Date("2026-09-21T18:00:00Z")), first); const files = ["app/tracks/data/page.tsx", "app/roadmap/data/[paceId]/page.tsx", "app/lesson/data/[paceId]/[questId]/page.tsx", "app/daily-quest/data/[paceId]/page.tsx"]; for (const file of files) assert.match(await readFile(new URL(file, root), "utf8"), /DataApp/); const paths = ["/tracks/data", ...PACES.flatMap((pace) => ["/roadmap/data/" + pace, "/lesson/data/" + pace + "/1", "/lesson/data/" + pace + "/21", "/daily-quest/data/" + pace])]; for (const path of paths) { const route = parseLearningLocation(path); assert.equal(route.kind, "data"); assert.equal(learningPathForRoute(route), path); } });
