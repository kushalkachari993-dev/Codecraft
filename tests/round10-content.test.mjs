import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all fourteen Round 10 intermediate and expert topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round10.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql):intermediate:[^"]+": lesson\(|"genai:expert:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 14);
  for (const topic of [
    "DSA", "Trees/Graphs", "Algorithms", "Memory concepts", "Hashing",
    "Triggers", "JSON/JSONB", "Application DB access", "ORM",
    "Transformer internals", "LLM training", "Fine-tuning", "LoRA/QLoRA/PEFT", "Quantization",
  ]) assert.match(lessons, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 10 authored execution missions and world projects", async () => {
  const [challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/round10-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round10-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);
  assert.match(await readFile(new URL("../app/lesson-enrichment-bundle.ts", import.meta.url), "utf8"), /getRoundTenLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundTenPythonChallenge/);
  assert.match(challengeRouter, /buildRoundTenSQLChallenge/);
  assert.match(genaiRouter, /buildRoundTenGenAILab/);
  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundTenPythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundTenSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));
  assert.match(challenges, /Algorithm Arena Python project/);
  assert.match(challenges, /Automation & Data SQL project/);
  assert.match(challenges, /Shortest route is deterministic/);
  assert.match(challenges, /One transition is audited/);
  assert.match(challenges, /N\+1-free relay hydration mission/);
  assert.match(labs, /attention_trace_lab\.py/);
  assert.match(labs, /llm_training_pipeline_lab\.py/);
  assert.match(labs, /fine_tuning_decision_lab\.py/);
  assert.match(labs, /peft_adapter_lab\.py/);
  assert.match(labs, /quantization_tradeoff_lab\.py/);
  assert.match(labs, /Model Engine: STABLE/);
  assert.match(labs, /Mock tools only/);
});
