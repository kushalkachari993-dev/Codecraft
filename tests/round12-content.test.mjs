import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all fourteen Round 12 expert topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round12.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql|genai):expert:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 14);
  for (const topic of [
    "Object model", "Dunder methods", "Descriptors", "Metaclasses",
    "Query optimizer", "Execution internals", "Advanced EXPLAIN", "Join algorithms", "Index internals",
    "Context engineering", "Advanced agents", "Durable agents", "Multi-agent systems", "Advanced memory",
  ]) assert.match(lessons, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 12 authored execution missions and world projects", async () => {
  const [challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/round12-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round12-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);
  assert.match(await readFile(new URL("../app/lesson-enrichment-bundle.ts", import.meta.url), "utf8"), /getRoundTwelveLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundTwelvePythonChallenge/);
  assert.match(challengeRouter, /buildRoundTwelveSQLChallenge/);
  assert.match(genaiRouter, /buildRoundTwelveGenAILab/);
  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundTwelvePythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundTwelveSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));
  assert.match(challenges, /Object Core Python project/);
  assert.match(challenges, /Optimizer Core SQL project/);
  assert.match(challenges, /Metaclass registry enforces unique concrete kinds/);
  assert.match(challenges, /Analyzed write was rolled back/);
  assert.match(challenges, /Access-method selection mission/);
  assert.match(labs, /authority_context_lab\.py/);
  assert.match(labs, /authorized_agent_loop_lab\.py/);
  assert.match(labs, /durable_agent_recovery_lab\.py/);
  assert.match(labs, /multi_agent_coordination_lab\.py/);
  assert.match(labs, /governed_memory_lab\.py/);
  assert.match(labs, /Context & Agent Core: STABLE/);
  assert.match(labs, /Mock tools only/);
});
