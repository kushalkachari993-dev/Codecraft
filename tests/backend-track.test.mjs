import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

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
    let output = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    for (const match of [...output.matchAll(/from ["']([^"']+)["']/g)]) {
      const specifier = match[1];
      const target = specifier === "next/link"
        ? "data:text/javascript," + encodeURIComponent("import{createElement}from" + JSON.stringify(import.meta.resolve("react")) + ";export default function Link({href,children,...props}){return createElement('a',{href,...props},children)}")
        : specifier.startsWith(".")
          ? await moduleUrl(await resolveLocal(specifier, url))
          : import.meta.resolve(specifier);
      output = output.replace(match[0], "from " + JSON.stringify(target));
    }
    const result = "data:text/javascript;base64," + Buffer.from(output).toString("base64");
    modules.set(url.href, result);
    return result;
  }
  return import(await moduleUrl(file));
}

const { BACKEND_CURRICULA, getBackendLesson, getBackendLessons } = await loadModule("app/backend/curriculum.ts");
const { evaluateBackendArtifact, getBackendArtifact } = await loadModule("app/backend/artifacts.ts");
const { getBackendCheckpoints } = await loadModule("app/backend/checkpoints.ts");
const { getBackendEvidenceExercise } = await loadModule("app/backend/evidence.ts");
const {
  backendCompleted,
  backendLessonXp,
  backendProfileStat,
  completeBackendDailyQuest,
  completeBackendLesson,
  isBackendLessonUnlocked,
} = await loadModule("app/backend/progress.ts");
const {
  BACKEND_PATH_TOTAL,
  BACKEND_TRACK,
  getBackendWorlds,
  isBackendWorldProject,
} = await loadModule("app/backend/track.ts");
const { evaluateCloudPlan, serializeCloudPlan } = await loadModule("app/cloud/model.ts");
const { DEFAULT_PROGRESS, normalizeProgress } = await loadModule("app/progress.ts");
const { learningPathForRoute, parseLearningLocation } = await loadModule("app/navigation.ts");

const PACES = ["beginner", "intermediate", "expert"];

test("Backend Engineering contains three complete 21-topic paths", () => {
  assert.deepEqual(Object.keys(BACKEND_CURRICULA), PACES);
  assert.equal(BACKEND_PATH_TOTAL, 21);
  assert.equal(BACKEND_TRACK.total, 63);
  assert.equal(PACES.reduce((total, paceId) => total + getBackendLessons(paceId).length, 0), 63);
  assert.equal(new Set(PACES.flatMap((paceId) => getBackendLessons(paceId).map((lesson) => lesson.title))).size, 63);

  for (const paceId of PACES) {
    const lessons = getBackendLessons(paceId);
    assert.deepEqual(lessons.map((lesson) => lesson.id), Array.from({ length: 21 }, (_, index) => index + 1));
    assert.deepEqual(getBackendWorlds(paceId).map((world) => world.end), [5, 10, 15, 21]);
    assert.deepEqual(
      lessons.filter((lesson) => isBackendWorldProject(paceId, lesson.id)).map((lesson) => lesson.id),
      [5, 10, 15, 21],
    );

    for (const lesson of lessons) {
      assert.equal(lesson.concepts.length, 3);
      assert.ok(lesson.concepts.every((concept) => concept.body.length >= 120), paceId + " lesson " + lesson.id);
      assert.ok(lesson.objective.length >= 60);
      assert.ok(lesson.story.length >= 120);
      assert.ok(lesson.exampleNote.length >= 100);
      assert.ok(lesson.mistake.length >= 100);
      assert.ok(lesson.mission.length >= 100);
      assert.equal(lesson.fields.length, 6);
      assert.equal(lesson.checks.length, 5);
      assert.deepEqual(new Set(lesson.fields.map((field) => field.key)), new Set(Object.keys(lesson.solution)));

      for (const format of ["json", "hcl", "yaml"]) {
        const good = evaluateCloudPlan(lesson, serializeCloudPlan(lesson.solution, format), format);
        const bad = evaluateCloudPlan(lesson, serializeCloudPlan(lesson.starter, format), format);
        assert.equal(good.passed, true, paceId + " " + lesson.id + " " + format + ": " + JSON.stringify(good));
        assert.equal(bad.passed, false, paceId + " " + lesson.id + " " + format);
        assert.equal(bad.error, undefined);
      }
    }
    assert.equal(getBackendLesson(paceId, 22), undefined);
  }
});

test("every Backend topic has three unique scenario-based checkpoints", () => {
  for (const paceId of PACES) {
    const checkpoints = getBackendLessons(paceId).flatMap((lesson) => getBackendCheckpoints(paceId, lesson));
    assert.equal(checkpoints.length, 63);
    assert.equal(new Set(checkpoints.map((checkpoint) => checkpoint.question)).size, 63);
    for (const checkpoint of checkpoints) {
      assert.ok(checkpoint.question.length >= 60);
      assert.equal(checkpoint.options.length, 3);
      assert.equal(new Set(checkpoint.options).size, 3);
      assert.ok(checkpoint.answer >= 0 && checkpoint.answer < checkpoint.options.length);
      assert.ok(checkpoint.explanation.length >= 100);
    }
  }
});

test("every Backend topic has a safe static artifact review", () => {
  const expectedFiles = ["event.schema.json", "migration.sql", "openapi.yaml", "service.config.json"];
  for (const paceId of PACES) {
    const artifacts = getBackendLessons(paceId).map((lesson) => getBackendArtifact(paceId, lesson));
    assert.deepEqual([...new Set(artifacts.map((artifact) => artifact.filename))].sort(), expectedFiles);
    assert.equal(new Set(artifacts.map((artifact) => artifact.solution)).size, 21);

    for (const [index, artifact] of artifacts.entries()) {
      const lesson = getBackendLessons(paceId)[index];
      const good = evaluateBackendArtifact(artifact, artifact.solution);
      const bad = evaluateBackendArtifact(artifact, artifact.starter);
      assert.ok(artifact.brief.includes(lesson.title));
      assert.ok(artifact.solution.split("\n").some((line) => /^\s{2,}\S/.test(line)));
      assert.equal(good.passed, true, paceId + " " + lesson.id + ": " + JSON.stringify(good));
      assert.equal(bad.passed, false, paceId + " " + lesson.id);
      assert.equal(good.checks.length, 4);

      if (artifact.filename === "migration.sql") {
        const commit = artifact.solution.indexOf("COMMIT;");
        const concurrentIndex = artifact.solution.indexOf("CREATE INDEX CONCURRENTLY");
        assert.ok(commit >= 0 && concurrentIndex > commit, "concurrent index must run outside the transaction");
      }
    }
  }
});

test("every Backend path covers logs, traces, timelines, plan diffs, and cost reports", () => {
  const expectedKinds = ["cost-report", "logs", "plan-diff", "timeline", "traces"];
  for (const paceId of PACES) {
    const exercises = getBackendLessons(paceId).map((lesson) => getBackendEvidenceExercise(paceId, lesson));
    assert.deepEqual([...new Set(exercises.map((exercise) => exercise.kind))].sort(), expectedKinds);
    assert.equal(new Set(exercises.map((exercise) => exercise.question)).size, 21);
    assert.equal(new Set(exercises.map((exercise) => exercise.evidence)).size, 21);
    for (const exercise of exercises) {
      assert.ok(exercise.evidence.length >= 120);
      assert.equal(exercise.options.length, 3);
      assert.ok(exercise.answer >= 0 && exercise.answer < exercise.options.length);
      assert.ok(exercise.explanation.length >= 100);
    }
  }
});

test("Backend completion is sequential, isolated, and idempotent", () => {
  let progress = normalizeProgress({ ...DEFAULT_PROGRESS, completed: { "python-beginner": [1, 2] } });
  const startingXp = progress.xp;
  let expectedXp = startingXp;

  for (const paceId of PACES) {
    for (let id = 1; id <= 21; id += 1) {
      assert.equal(isBackendLessonUnlocked(progress, id, paceId), true);
      assert.equal(isBackendLessonUnlocked(progress, id + 1, paceId), false);
      progress = normalizeProgress(completeBackendLesson(progress, id, paceId, new Date("2026-09-05T10:00:00Z")));
      expectedXp += backendLessonXp(id, paceId);
      assert.strictEqual(completeBackendLesson(progress, id, paceId), progress);
      assert.equal(backendCompleted(progress, paceId).length, id);
    }
  }

  assert.equal(progress.xp, expectedXp);
  assert.deepEqual(progress.completed["python-beginner"], [1, 2]);
  assert.deepEqual(backendProfileStat(progress), {
    id: "backend",
    icon: "BE",
    label: "Backend Engineering",
    completed: 63,
    total: 63,
    projects: 12,
    percent: 100,
  });
});

test("Backend Daily Quest awards one shared daily reward", () => {
  const original = normalizeProgress(DEFAULT_PROGRESS);
  const first = normalizeProgress(completeBackendDailyQuest(original, "beginner", 4, new Date("2026-09-05T10:00:00Z")));
  assert.equal(first.xp, original.xp + 30);
  assert.match(first.game.dailyQuestId, /^backend-beginner-4-/);
  assert.equal(first.game.dailyQuestCompleted, true);
  assert.strictEqual(completeBackendDailyQuest(first, "expert", 9, new Date("2026-09-05T18:00:00Z")), first);
});

test("the shared lab renders Backend-specific content and the dynamic 21-lesson boundary", async () => {
  const { default: CloudLab } = await loadModule("app/cloud/cloud-lab.tsx");
  const source = await readFile(new URL("app/cloud/cloud-lab.tsx", root), "utf8");
  const html = renderToStaticMarkup(createElement(CloudLab, {
    trackKind: "backend",
    paceId: "beginner",
    lesson: getBackendLesson("beginner", 1),
    completed: false,
    onComplete() {},
  }));

  assert.match(html, /Your Backend Engineering lab/);
  assert.match(html, /No server, database, queue, external API, or credentials are used/);
  assert.match(html, /OpenAPI YAML/);
  assert.match(html, /THREE REQUIRED DECISIONS/);
  assert.match(html, /Evidence lab/);
  assert.match(html, /Complete lesson/);
  assert.match(source, /BACKEND_PATH_TOTAL/);
  assert.match(source, /lessonTotal/);
  assert.doesNotMatch(source, /of 15/);
});

test("Backend route entries point to the dedicated application", async () => {
  const routeFiles = [
    "app/tracks/backend/page.tsx",
    "app/roadmap/backend/[paceId]/page.tsx",
    "app/lesson/backend/[paceId]/[questId]/page.tsx",
    "app/daily-quest/backend/[paceId]/page.tsx",
  ];
  for (const file of routeFiles) {
    const source = await readFile(new URL(file, root), "utf8");
    assert.match(source, /BackendApp/);
  }
});

test("Backend URLs round-trip through shared navigation", () => {
  const paths = [
    "/tracks/backend",
    ...PACES.flatMap((paceId) => [
      "/roadmap/backend/" + paceId,
      "/lesson/backend/" + paceId + "/1",
      "/lesson/backend/" + paceId + "/21",
      "/daily-quest/backend/" + paceId,
    ]),
  ];
  for (const path of paths) {
    const route = parseLearningLocation(path);
    assert.equal(route.kind, "backend");
    assert.equal(learningPathForRoute(route), path);
  }
  for (const path of ["/lesson/backend/beginner/0", "/lesson/backend/expert/22", "/roadmap/backend/professional"]) {
    assert.equal(parseLearningLocation(path).kind, "tracks");
  }
});
