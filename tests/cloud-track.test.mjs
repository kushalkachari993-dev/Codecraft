import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

const root = new URL("../", import.meta.url);
const modules = new Map();
async function loadModule(path) {
  const file = new URL(path, root);
  async function moduleUrl(url) {
    if (modules.has(url.href)) return modules.get(url.href);
    const source = await readFile(url, "utf8");
    let output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    for (const match of [...output.matchAll(/from ["']([^"']+)["']/g)]) {
      const specifier = match[1];
      const target = specifier === "next/link"
        ? "data:text/javascript," + encodeURIComponent('import{createElement}from' + JSON.stringify(import.meta.resolve("react")) + ';export default function Link({href,children,...props}){return createElement("a",{href,...props},children)}')
        : specifier.startsWith(".") ? await moduleUrl(new URL(specifier + (/\.tsx?$/.test(specifier) ? "" : ".ts"), url)) : import.meta.resolve(specifier);
      output = output.replace(match[0], "from " + JSON.stringify(target));
    }
    const result = "data:text/javascript;base64," + Buffer.from(output).toString("base64");
    modules.set(url.href, result);
    return result;
  }
  return import(await moduleUrl(file));
}
const { CLOUD_CURRICULA, getCloudLesson, getCloudLessons } = await loadModule("app/cloud/catalog.ts");
const { evaluateCloudArtifact, getCloudArtifact } = await loadModule("app/cloud/artifacts.ts");
const { getCloudEvidenceExercise } = await loadModule("app/cloud/evidence.ts");
const { evaluateCloudPlan, serializeCloudPlan, simulateCapacity } = await loadModule("app/cloud/model.ts");
const { getCloudCheckpoint, getCloudCheckpoints } = await loadModule("app/cloud/checkpoints.ts");
const { cloudCompleted, isCloudLessonUnlocked, completeCloudDailyQuest, completeCloudLesson, cloudProfileStat } = await loadModule("app/cloud/progress.ts");
const { DEFAULT_PROGRESS, normalizeProgress, mergeProgress } = await loadModule("app/progress.ts");
const { parseLearningLocation, learningPathForRoute } = await loadModule("app/navigation.ts");
const { CLOUD_PATH_TOTAL, CLOUD_TRACK, getCloudWorlds, isCloudWorldProject } = await loadModule("app/cloud/track.ts");
const PACES = ["beginner", "intermediate", "expert"];
const beginnerLesson = (id) => getCloudLesson("beginner", id);
const evaluate = (id, overrides = {}) => evaluateCloudPlan(beginnerLesson(id), JSON.stringify({ ...beginnerLesson(id).solution, ...overrides }));

test("Cloud Engineering has three complete, sequential 21-topic paths", () => {
  assert.deepEqual(Object.keys(CLOUD_CURRICULA), PACES);
  assert.equal(CLOUD_PATH_TOTAL, 21);
  assert.equal(CLOUD_TRACK.total, 63);
  assert.equal(PACES.reduce((total, paceId) => total + getCloudLessons(paceId).length, 0), 63);
  for (const paceId of PACES) {
    const lessons = getCloudLessons(paceId);
    assert.deepEqual(lessons.map((lesson) => lesson.id), Array.from({ length: CLOUD_PATH_TOTAL }, (_, i) => i + 1), paceId);
    const worlds = getCloudWorlds(paceId);
    assert.equal(worlds.length, 4);
    assert.deepEqual(worlds.map((world) => world.end), [5, 10, 15, 21]);
    assert.deepEqual(worlds.flatMap((world) => Array.from({ length: world.end - world.start + 1 }, (_, index) => world.start + index)), lessons.map((lesson) => lesson.id));
    for (const lesson of lessons) {
      assert.ok(lesson.concepts.length >= 3, paceId + " lesson " + lesson.id);
      assert.ok(lesson.concepts.every((entry) => entry.body.length >= 120), paceId + " lesson " + lesson.id);
      assert.ok(lesson.example && lesson.exampleNote && lesson.mistake && lesson.mission);
      assert.ok(lesson.checks.length >= 2);
      assert.deepEqual(new Set(lesson.fields.map((entry) => entry.key)), new Set(Object.keys(lesson.solution)));
    }
    assert.equal(getCloudLesson(paceId, CLOUD_PATH_TOTAL + 1), undefined);
  }
});

test("every Cloud topic has three specific, scenario-based knowledge checkpoints", () => {
  for (const paceId of PACES) {
    const suites = getCloudLessons(paceId).map((lesson) => getCloudCheckpoints(paceId, lesson));
    assert.ok(suites.every((suite) => suite.length === 3));
    const questions = suites.flat();
    assert.equal(questions.length, CLOUD_PATH_TOTAL * 3);
    assert.equal(new Set(questions.map((entry) => entry.question)).size, CLOUD_PATH_TOTAL * 3);
    for (const checkpoint of questions) {
      assert.ok(checkpoint.question.length >= 35);
      assert.equal(checkpoint.options.length, 3);
      assert.equal(new Set(checkpoint.options).size, 3);
      assert.ok(Number.isInteger(checkpoint.answer) && checkpoint.answer >= 0 && checkpoint.answer < checkpoint.options.length);
      assert.ok(checkpoint.explanation.length >= 70);
    }
    assert.deepEqual(getCloudCheckpoint(paceId, 1), suites[0][0]);
  }
});

test("every Cloud topic includes a safe, realistic nested artifact review", () => {
  for (const paceId of PACES) {
    const kinds = new Set();
    const lessons = getCloudLessons(paceId);
    const artifacts = lessons.map((lesson) => getCloudArtifact(paceId, lesson));
    assert.equal(new Set(artifacts.map((artifact) => artifact.solution)).size, CLOUD_PATH_TOTAL);
    for (const [index, lesson] of lessons.entries()) {
      const artifact = artifacts[index];
      kinds.add(artifact.kind);
      assert.ok(artifact.brief.includes(lesson.title));
      assert.ok(artifact.solution.split("\n").some((line) => /^\s{2,}\S/.test(line)), paceId + " " + lesson.id);
      const good = evaluateCloudArtifact(artifact, artifact.solution);
      const bad = evaluateCloudArtifact(artifact, artifact.starter);
      assert.equal(good.passed, true, paceId + " " + lesson.id + ": " + JSON.stringify(good));
      assert.equal(bad.passed, false, paceId + " " + lesson.id);
      assert.ok(good.checks.length >= 4);
    }
    assert.deepEqual([...kinds].sort(), ["cicd", "iam", "kubernetes", "terraform"]);
  }
  const terraform = getCloudArtifact("beginner", beginnerLesson(2));
  assert.match(evaluateCloudArtifact(terraform, 'terraform {\n  backend "s3" {').error, /unbalanced/i);
  const iam = getCloudArtifact("beginner", beginnerLesson(1));
  assert.match(evaluateCloudArtifact(iam, "{broken").error, /JSON/i);
  assert.match(evaluateCloudArtifact(terraform, "x".repeat(24_001)).error, /under 24,000/i);
});

test("every topic has a deterministic logs, traces, timeline, plan, or cost investigation", () => {
  for (const paceId of PACES) {
    const exercises = getCloudLessons(paceId).map((lesson) => getCloudEvidenceExercise(paceId, lesson));
    assert.deepEqual([...new Set(exercises.map((entry) => entry.kind))].sort(), ["cost-report", "logs", "plan-diff", "timeline", "traces"]);
    assert.equal(new Set(exercises.map((entry) => entry.question)).size, CLOUD_PATH_TOTAL);
    assert.equal(new Set(exercises.map((entry) => entry.evidence)).size, CLOUD_PATH_TOTAL);
    for (const exercise of exercises) {
      assert.ok(exercise.evidence.length >= 120);
      assert.equal(exercise.options.length, 3);
      assert.ok(exercise.answer >= 0 && exercise.answer < exercise.options.length);
      assert.ok(exercise.explanation.length >= 100);
    }
  }
});

test("every world-ending project is a four-stage capstone boundary", () => {
  for (const paceId of PACES) {
    assert.deepEqual(Array.from({ length: CLOUD_PATH_TOTAL }, (_, index) => index + 1).filter((id) => isCloudWorldProject(paceId, id)), [5, 10, 15, 21]);
  }
});

for (const paceId of PACES) {
  for (const lesson of getCloudLessons(paceId)) {
    test(paceId + " lesson " + lesson.id + " accepts its solution and rejects its broken starter", () => {
      const good = evaluateCloudPlan(lesson, JSON.stringify(lesson.solution));
      const bad = evaluateCloudPlan(lesson, JSON.stringify(lesson.starter));
      assert.equal(good.passed, true, JSON.stringify(good));
      assert.equal(bad.passed, false);
      assert.equal(bad.error, undefined, "starter should be valid JSON/schema so learners can see repair checks");
      assert.ok(good.observations.length >= 2);
    });
  }
}

test("all Cloud solutions and starters behave equivalently in JSON, HCL, and YAML", () => {
  for (const paceId of PACES) {
    for (const lesson of getCloudLessons(paceId)) {
      for (const format of ["json", "hcl", "yaml"]) {
        const good = evaluateCloudPlan(lesson, serializeCloudPlan(lesson.solution, format), format);
        const bad = evaluateCloudPlan(lesson, serializeCloudPlan(lesson.starter, format), format);
        assert.equal(good.passed, true, paceId + " " + lesson.id + " " + format + ": " + JSON.stringify(good));
        assert.deepEqual(good.plan, lesson.solution);
        assert.equal(bad.passed, false);
        assert.equal(bad.error, undefined);
      }
    }
  }
  const lesson = beginnerLesson(1);
  assert.match(evaluateCloudPlan(lesson, "provider = [\"physical-security\"]\nprovider = []", "hcl").error, /duplicate key/i);
  assert.match(evaluateCloudPlan(lesson, "provider:\n  - physical-security", "yaml").error, /training format|expected/i);
  assert.match(evaluateCloudPlan(lesson, "provider = [\"physical-security\"]\nteam", "hcl").error, /expected key/i);
});

test("relay plans strictly validate JSON structure and field types", () => {
  const lesson = beginnerLesson(15);
  for (const invalid of ["null", "[]", '"text"', "{", " ".repeat(16_001), '{"__proto__":{}}']) {
    assert.equal(evaluateCloudPlan(lesson, invalid).passed, false);
    assert.ok(evaluateCloudPlan(lesson, invalid).error);
  }
  assert.match(evaluateCloudPlan(lesson, JSON.stringify({ ...lesson.solution, secret: "do-not-accept" })).error, /Unknown field/);
  for (const entry of lesson.fields) {
    const missing = { ...lesson.solution };
    delete missing[entry.key];
    assert.match(evaluateCloudPlan(lesson, JSON.stringify(missing)).error, /Missing field/);
    const wrong = entry.type === "string" ? 42 : "wrong-type";
    assert.equal(evaluate(15, { [entry.key]: wrong }).passed, false, entry.key);
  }
  assert.equal(evaluate(1, { provider: ["physical-security", "physical-security"] }).passed, false);
  assert.equal(evaluate(2, { zones: ["eu-west-1a", "eu-west-1a"] }).passed, false);
});

test("permission and networking drills test allowed and denied paths independently", () => {
  for (const [id, bad] of [
    [6, { databasePublic: true }], [6, { databaseAllowedFrom: "anywhere" }], [6, { databasePort: 80 }],
    [7, { certificateValid: false }], [7, { protocol: "http" }],
    [8, { actions: ["object:read", "object:delete"] }], [8, { resource: "*" }], [8, { credentialMode: "static-key" }],
    [9, { logSecrets: true }], [9, { committedSecrets: true }], [9, { databaseUrlRef: "postgres://password" }],
    [10, { databaseAllowedFrom: "anywhere" }],
  ]) assert.equal(evaluate(id, bad).passed, false, "lesson " + id + ": " + JSON.stringify(bad));
});

test("capacity is derived from traffic, replica limits, and fictional costs", () => {
  assert.deepEqual(simulateCapacity(2, 3, 300), { valid: true, replicas: 3, served: 300, dropped: 0, credits: 115 });
  assert.equal(simulateCapacity(2, 2, 300).dropped, 100);
  assert.equal(simulateCapacity(2, 4, 60).replicas, 2);
  for (const [min, max] of [[0, 4], [3, 2], [2.1, 4], [2, 21], ["2", 4]]) assert.equal(simulateCapacity(min, max, 300).valid, false);
  for (const maximum of [3, 4]) assert.equal(evaluate(14, { maxReplicas: maximum }).passed, true);
  for (const maximum of [2, 5, 4.5]) assert.equal(evaluate(14, { maxReplicas: maximum }).passed, false);
});

test("operations accept valid alternatives while rejecting unsafe release and alert settings", () => {
  assert.equal(evaluate(11, { image: "relay-api:2.1.0" }).passed, true);
  for (const bad of [{ image: "relay-api:latest" }, { runAsRoot: true }, { listenHost: "127.0.0.1" }, { servicePort: 80 }]) assert.equal(evaluate(11, bad).passed, false);
  for (const percent of [1, 7, 10]) assert.equal(evaluate(12, { canaryPercent: percent }).passed, true);
  for (const bad of [{ canaryPercent: 100 }, { canaryPercent: 1.5 }, { runTests: false }, { retainPrevious: false }, { rollbackOnError: false }]) assert.equal(evaluate(12, bad).passed, false);
  for (const threshold of [3, 8, 11]) assert.equal(evaluate(13, { thresholdPercent: threshold }).passed, true);
  for (const bad of [{ thresholdPercent: 2 }, { thresholdPercent: 12 }, { windowMinutes: 6 }, { notify: "nobody" }]) assert.equal(evaluate(13, bad).passed, false);
});

test("the final capstone checks every declared field instead of matching one answer string", () => {
  const lesson = beginnerLesson(CLOUD_PATH_TOTAL);
  for (const entry of lesson.fields) {
    const invalid = entry.type === "boolean" ? !lesson.solution[entry.key] : entry.type === "number" ? -1 : entry.type === "strings" ? [] : "incorrect";
    assert.equal(evaluate(CLOUD_PATH_TOTAL, { [entry.key]: invalid }).passed, false, "unvalidated field: " + entry.key);
  }
  const alternative = { ...lesson.solution, allocationTags: [...lesson.solution.allocationTags].reverse(), budgetAlertPercent: 70, rpoMinutes: 10, rtoMinutes: 45 };
  assert.equal(evaluateCloudPlan(lesson, JSON.stringify(alternative, null, 4)).passed, true);
});

test("completion is sequential, isolated by pace, idempotent, and survives sync", () => {
  let progress = normalizeProgress({ ...DEFAULT_PROGRESS, completed: { "python-beginner": [1, 2] } });
  const original = progress;
  assert.strictEqual(completeCloudLesson(progress, CLOUD_PATH_TOTAL, "beginner"), progress);
  for (const paceId of PACES) {
    for (const invalid of [0, CLOUD_PATH_TOTAL + 1, 1.2, NaN]) assert.equal(isCloudLessonUnlocked(progress, invalid, paceId), false);
    for (let id = 1; id <= CLOUD_PATH_TOTAL; id += 1) {
      assert.equal(isCloudLessonUnlocked(progress, id, paceId), true);
      assert.equal(isCloudLessonUnlocked(progress, id + 1, paceId), false);
      progress = normalizeProgress(completeCloudLesson(progress, id, paceId, new Date("2026-09-05T10:00:00Z")));
      assert.strictEqual(completeCloudLesson(progress, id, paceId), progress, "replay must not award XP");
      assert.equal(cloudCompleted(progress, paceId).length, id);
    }
  }
  assert.equal(progress.xp, original.xp + 1055 + 1280 + 1520);
  assert.equal(progress.game.dailyLabs, 63);
  assert.equal(progress.game.streakDays, 1);
  assert.equal(progress.game.inventory.length, original.game.inventory.length + 12);
  assert.deepEqual(progress.completed["python-beginner"], [1, 2]);
  assert.deepEqual(progress.bonus["cloud-beginner"], [5, 10, 15, 21]);
  assert.deepEqual(progress.bonus["cloud-intermediate"], [5, 10, 15, 21]);
  assert.deepEqual(progress.bonus["cloud-expert"], [5, 10, 15, 21]);
  assert.deepEqual(cloudProfileStat(progress), { id: "cloud", icon: "CL", label: "Cloud Engineering", completed: 63, total: 63, projects: 12, percent: 100 });
  for (const paceId of PACES) {
    assert.equal(cloudCompleted(mergeProgress(original, progress), paceId).length, CLOUD_PATH_TOTAL);
    assert.equal(cloudCompleted(normalizeProgress(JSON.parse(JSON.stringify(progress))), paceId).length, CLOUD_PATH_TOTAL);
  }
  assert.deepEqual(cloudCompleted(normalizeProgress({ completed: { "cloud-expert": [1, 3, 21] } }), "expert"), [1]);
});

test("Cloud Daily Quest awards one shared daily reward and extends the streak", () => {
  const original = normalizeProgress(DEFAULT_PROGRESS);
  const first = normalizeProgress(completeCloudDailyQuest(original, "beginner", 4, new Date("2026-09-05T10:00:00Z")));
  assert.equal(first.xp, original.xp + 30);
  assert.equal(first.game.dailyQuestDate, "2026-09-05");
  assert.equal(first.game.dailyQuestCompleted, true);
  assert.equal(first.game.dailyQuestStreak, 1);
  assert.match(first.game.dailyQuestId, /^cloud-beginner-4-/);
  assert.ok(first.game.inventory.includes("Daily Quest Cache"));
  assert.deepEqual(cloudCompleted(first, "beginner"), []);
  assert.strictEqual(completeCloudDailyQuest(first, "expert", 9, new Date("2026-09-05T18:00:00Z")), first);
  const second = normalizeProgress(completeCloudDailyQuest(first, "intermediate", 7, new Date("2026-09-06T10:00:00Z")));
  assert.equal(second.xp, original.xp + 60);
  assert.equal(second.game.dailyQuestStreak, 2);
  assert.match(second.game.dailyQuestId, /^cloud-intermediate-7-/);
});

test("cloud routes round-trip without falling into the SQL or Python runtimes", () => {
  const paths = ["/tracks/cloud", ...PACES.flatMap((paceId) => [`/roadmap/cloud/${paceId}`, `/lesson/cloud/${paceId}/1`, `/lesson/cloud/${paceId}/${CLOUD_PATH_TOTAL}`, `/daily-quest/cloud/${paceId}`])];
  for (const path of paths) {
    const route = parseLearningLocation(path);
    assert.equal(route.kind, "cloud");
    assert.equal(learningPathForRoute(route), path);
  }
  for (const path of ["/lesson/cloud/beginner/0", `/lesson/cloud/expert/${CLOUD_PATH_TOTAL + 1}`, "/lesson/cloud/intermediate/1abc", "/roadmap/cloud/professional", "/daily-quest/cloud/professional"]) assert.equal(parseLearningLocation(path).kind, "tracks");
  assert.deepEqual(parseLearningLocation("/lesson/python/beginner/1"), { kind: "lesson", trackId: "python", paceId: "beginner", questId: 1 });
});

test("the lab renders accessible controls, real teaching content, and a gated completion action", async () => {
  const { default: CloudLab } = await loadModule("app/cloud/cloud-lab.tsx");
  const source = await readFile(new URL("app/cloud/cloud-lab.tsx", root), "utf8");
  const html = renderToStaticMarkup(createElement(CloudLab, { paceId: "beginner", lesson: beginnerLesson(1), completed: false, onComplete() {} }));
  assert.match(html, /<label for="cloud-plan">/);
  assert.match(html, /<textarea[^>]+id="cloud-plan"/);
  assert.match(html, /<button[^>]+disabled="">Complete lesson/);
  assert.match(html, /Byte’s briefing/);
  assert.match(html, /A worked example/);
  assert.match(html, /THREE REQUIRED DECISIONS/);
  assert.match(html, /3 decisions verified/);
  assert.match(html, /Evidence lab/);
  assert.match(html, /Static artifact review/);
  assert.match(html, /Nested syntax/);
  assert.match(html, /JSON/);
  assert.match(html, /HCL/);
  assert.match(html, /YAML/);
  assert.match(html, /No provider login/);
  assert.match(html, /Failure scenario loaded/);
  assert.match(source, /Troubleshooting runbook/);
  assert.match(source, /Observed evidence/);
  assert.match(source, /Repair hypothesis/);
  assert.match(source, /CLOUD_PATH_TOTAL/);
  const replay = renderToStaticMarkup(createElement(CloudLab, { paceId: "beginner", lesson: beginnerLesson(CLOUD_PATH_TOTAL), completed: true, onComplete() {} }));
  assert.match(replay, /Cloud Foundations complete/);
  assert.match(replay, /XP is awarded once/);
  assert.match(replay, /Four-stage architecture and recovery review/);
});
