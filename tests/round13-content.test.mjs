import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all sixteen Round 13 expert topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round13.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql|genai):expert:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 16);
  for (const topic of [
    "Memory internals", "Garbage collection", "GIL/runtime model", "Advanced threading", "Multiprocessing", "Advanced Asyncio",
    "Storage internals", "MVCC", "Vacuum", "Advanced transactions", "Deadlocks",
    "Evaluation engineering", "Agent evaluation", "Observability", "Cost optimization", "Model routing",
  ]) assert.ok(lessons.includes(topic), `missing ${topic}`);
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 13 authored execution missions and world projects", async () => {
  const [challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/round13-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round13-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);
  assert.match(await readFile(new URL("../app/lesson-enrichment-bundle.ts", import.meta.url), "utf8"), /getRoundThirteenLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundThirteenPythonChallenge/);
  assert.match(challengeRouter, /buildRoundThirteenSQLChallenge/);
  assert.match(genaiRouter, /buildRoundThirteenGenAILab/);
  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundThirteenPythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundThirteenSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));
  assert.match(challenges, /Runtime Depths Python project/);
  assert.match(challenges, /Storage & Concurrency SQL project/);
  assert.match(challenges, /Cycles terminate/);
  assert.match(challenges, /Outbox intent is durable and unique/);
  assert.match(labs, /evaluation_release_gate_lab\.py/);
  assert.match(labs, /agent_trajectory_eval_lab\.py/);
  assert.match(labs, /genai_observability_lab\.py/);
  assert.match(labs, /cost_quality_frontier_lab\.py/);
  assert.match(labs, /model_routing_lab\.py/);
  assert.match(labs, /Evaluation Operations: STABLE/);
  assert.match(labs, /Mock tools only/);
});
