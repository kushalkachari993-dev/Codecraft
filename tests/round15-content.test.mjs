import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all fifteen Round 15 expert topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round15.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql|genai):expert:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 15);
  for (const topic of [
    "Docker", "CI/CD", "Cloud", "Security", "Observability", "Performance",
    "Connection pooling", "Caching architecture", "High availability", "Backup/PITR", "Monitoring",
    "Distributed systems", "Docker/Kubernetes/GPU", "LLMOps", "Production feedback loops",
  ]) assert.ok(lessons.includes(topic), `missing ${topic}`);
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 15 authored execution missions and world projects", async () => {
  const [challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/round15-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round15-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);
  assert.match(await readFile(new URL("../app/lesson-enrichment-bundle.ts", import.meta.url), "utf8"), /getRoundFifteenLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundFifteenPythonChallenge/);
  assert.match(challengeRouter, /buildRoundFifteenSQLChallenge/);
  assert.match(genaiRouter, /buildRoundFifteenGenAILab/);
  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundFifteenPythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundFifteenSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));
  assert.match(challenges, /Deployment Citadel Python project/);
  assert.match(challenges, /Production Platform SQL project/);
  assert.match(challenges, /Release evidence and gates are exact/);
  assert.match(challenges, /Global connection budget is 88/);
  assert.match(labs, /durable_distributed_workflow_lab\.py/);
  assert.match(labs, /gpu_platform_release_lab\.py/);
  assert.match(labs, /llmops_promotion_lab\.py/);
  assert.match(labs, /production_feedback_loop_lab\.py/);
  assert.match(labs, /Platform Frontier: STABLE/);
  assert.match(labs, /Mock tools only/);
});
