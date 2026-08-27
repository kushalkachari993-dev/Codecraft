import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all twelve Round 11 intermediate and expert topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round11.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql):intermediate:[^"]+": lesson\(|"genai:expert:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 12);
  for (const topic of [
    "Concurrency intro", "Project structure", "PostgreSQL",
    "N+1 problem", "Security", "PostgreSQL deeper", "Query optimization",
    "LLM inference", "Model serving", "GPU fundamentals", "Distributed inference", "Advanced RAG",
  ]) assert.match(lessons, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 11 authored execution missions and world projects", async () => {
  const [challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/round11-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round11-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);
  assert.match(await readFile(new URL("../app/lesson-enrichment-bundle.ts", import.meta.url), "utf8"), /getRoundElevenLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundElevenPythonChallenge/);
  assert.match(challengeRouter, /buildRoundElevenSQLChallenge/);
  assert.match(genaiRouter, /buildRoundElevenGenAILab/);
  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundElevenPythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundElevenSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));
  assert.match(challenges, /Project Foundry Python project/);
  assert.match(challenges, /Production Access SQL project/);
  assert.match(challenges, /Input and errors remain visible/);
  assert.match(challenges, /Reporter cannot update relays/);
  assert.match(challenges, /Measured online-relay index mission/);
  assert.match(labs, /prefill_decode_benchmark_lab\.py/);
  assert.match(labs, /admission_rollout_lab\.py/);
  assert.match(labs, /gpu_bottleneck_lab\.py/);
  assert.match(labs, /distributed_inference_topology_lab\.py/);
  assert.match(labs, /federated_rag_lab\.py/);
  assert.match(labs, /Inference Grid: STABLE/);
  assert.match(labs, /Mock tools only/);
});
