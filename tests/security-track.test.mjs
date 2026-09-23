import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const modules = new Map();
async function resolveLocal(specifier, parent) { if (/\.tsx?$/.test(specifier)) return new URL(specifier, parent); const path = new URL(specifier + ".ts", parent); try { await access(path); return path; } catch { return new URL(specifier + ".tsx", parent); } }
async function loadModule(path) { const file = new URL(path, root); async function moduleUrl(url) { if (modules.has(url.href)) return modules.get(url.href); const source = await readFile(url, "utf8"); let output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText; for (const match of [...output.matchAll(/from ["']([^"']+)["']/g)]) { const specifier = match[1]; const target = specifier.startsWith(".") ? await moduleUrl(await resolveLocal(specifier, url)) : import.meta.resolve(specifier); output = output.replace(match[0], "from " + JSON.stringify(target)); } const result = "data:text/javascript;base64," + Buffer.from(output).toString("base64"); modules.set(url.href, result); return result; } return import(await moduleUrl(file)); }

const { SECURITY_CURRICULA, SECURITY_TOPICS, getSecurityLesson, getSecurityLessons } = await loadModule("app/security/curriculum.ts");
const { getSecurityCheckpoints } = await loadModule("app/security/checkpoints.ts");
const { getSecurityEvidenceExercise } = await loadModule("app/security/evidence.ts");
const { evaluateSecurityArtifact, getSecurityArtifact } = await loadModule("app/security/artifacts.ts");
const { completeSecurityDailyQuest, completeSecurityLesson, securityCompleted, securityLessonXp, securityProfileStat, isSecurityLessonUnlocked } = await loadModule("app/security/progress.ts");
const { SECURITY_PATH_TOTAL, SECURITY_TRACK, getSecurityWorlds, isSecurityWorldProject } = await loadModule("app/security/track.ts");
const { evaluateCloudPlan, serializeCloudPlan } = await loadModule("app/cloud/model.ts");
const { DEFAULT_PROGRESS, normalizeProgress } = await loadModule("app/progress.ts");
const { learningPathForRoute, parseLearningLocation } = await loadModule("app/navigation.ts");
const PACES = ["beginner", "intermediate", "expert"];

test("Security has 63 distinct authored topics with substantial explanations and four projects per path", () => {
  assert.deepEqual(Object.keys(SECURITY_CURRICULA), PACES); assert.equal(SECURITY_PATH_TOTAL, 21); assert.equal(SECURITY_TRACK.total, 63);
  assert.equal(new Set(PACES.flatMap((pace) => getSecurityLessons(pace).map((lesson) => lesson.title))).size, 63);
  for (const pace of PACES) { const lessons = getSecurityLessons(pace); assert.deepEqual(lessons.map((lesson) => lesson.id), Array.from({ length: 21 }, (_, i) => i + 1)); assert.deepEqual(getSecurityWorlds(pace).map((world) => world.end), [5, 10, 15, 21]);
    for (const lesson of lessons) { const topic = SECURITY_TOPICS[pace][lesson.id - 1]; assert.equal(lesson.concepts.length, 4); assert.ok(lesson.concepts.every((concept) => concept.body.length >= 60), lesson.title); assert.ok(lesson.example.length >= 150, lesson.title); assert.ok(topic.question.length >= 35, lesson.title); assert.ok(lesson.practice.prompt.length >= 100, lesson.title); assert.equal(lesson.fields.length, 5); assert.equal(lesson.checks.length, 4); if (isSecurityWorldProject(pace, lesson.id)) assert.equal(lesson.projectStages.length, 4); else assert.equal(lesson.projectStages, undefined); for (const format of ["json", "hcl", "yaml"]) { assert.equal(evaluateCloudPlan(lesson, serializeCloudPlan(lesson.solution, format), format).passed, true, lesson.title); assert.equal(evaluateCloudPlan(lesson, serializeCloudPlan(lesson.starter, format), format).passed, false, lesson.title); } }
    assert.equal(getSecurityLesson(pace, 22), undefined);
  }
});

test("Every Security lesson tests decisions, evidence, and safe static artifacts", () => {
  for (const pace of PACES) { const lessons = getSecurityLessons(pace); const evidence = lessons.map((lesson) => getSecurityEvidenceExercise(pace, lesson)); assert.deepEqual([...new Set(evidence.map((item) => item.kind))].sort(), ["logs", "plan-diff", "timeline"]); for (const lesson of lessons) { const questions = getSecurityCheckpoints(pace, lesson); assert.equal(questions.length, 3); for (const item of questions) { assert.equal(item.options.length, 3); assert.equal(new Set(item.options).size, 3); assert.ok(item.explanation.length >= 100); assert.ok(item.answer >= 0 && item.answer < 3); } const artifact = getSecurityArtifact(pace, lesson); assert.equal(evaluateSecurityArtifact(artifact, artifact.solution).passed, true, artifact.filename + " " + lesson.title); assert.equal(evaluateSecurityArtifact(artifact, artifact.starter).passed, false, artifact.filename + " " + lesson.title); assert.ok(artifact.checks.length >= 4); } }
});

test("Security progress is sequential, isolated, idempotent, and daily rewards occur once", () => { let progress = normalizeProgress({ ...DEFAULT_PROGRESS, completed: { "python-beginner": [1] } }); let xp = progress.xp; for (const pace of PACES) for (let id = 1; id <= 21; id += 1) { assert.equal(isSecurityLessonUnlocked(progress, id, pace), true); if (id < 21) assert.equal(isSecurityLessonUnlocked(progress, id + 1, pace), false); progress = normalizeProgress(completeSecurityLesson(progress, id, pace, new Date("2026-09-22T10:00:00Z"))); xp += securityLessonXp(id, pace); assert.strictEqual(completeSecurityLesson(progress, id, pace), progress); } assert.equal(progress.xp, xp); assert.deepEqual(progress.completed["python-beginner"], [1]); assert.deepEqual(securityProfileStat(progress), { id: "security", icon: "SE", label: "Cybersecurity Engineering", completed: 63, total: 63, projects: 12, percent: 100 }); assert.equal(securityCompleted(progress, "expert").length, 21); const first = normalizeProgress(completeSecurityDailyQuest(progress, "beginner", 4, new Date("2026-09-23T10:00:00Z"))); assert.equal(first.xp, progress.xp + 30); assert.strictEqual(completeSecurityDailyQuest(first, "expert", 9, new Date("2026-09-23T18:00:00Z")), first); });

test("Security page routes round-trip", async () => { const files = ["app/tracks/security/page.tsx", "app/roadmap/security/[paceId]/page.tsx", "app/lesson/security/[paceId]/[questId]/page.tsx", "app/daily-quest/security/[paceId]/page.tsx"]; for (const file of files) assert.match(await readFile(new URL(file, root), "utf8"), /SecurityApp/); const paths = ["/tracks/security", ...PACES.flatMap((pace) => ["/roadmap/security/" + pace, "/lesson/security/" + pace + "/1", "/lesson/security/" + pace + "/21", "/daily-quest/security/" + pace])]; for (const path of paths) { const route = parseLearningLocation(path); assert.equal(route.kind, "security"); assert.equal(learningPathForRoute(route), path); } });
