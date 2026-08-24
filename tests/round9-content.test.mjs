import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all fifteen Round 9 intermediate topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round9.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql|genai):intermediate:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 15);
  for (const topic of [
    "HTTP", "APIs", "FastAPI", "SQL", "ORM",
    "Transactions", "ACID", "Isolation levels", "Locks", "Functions/procedures",
    "Guardrails", "Prompt injection", "Security", "Streaming", "Caching",
  ]) assert.match(lessons, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 9 authored execution missions and world projects", async () => {
  const [page, challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/round9-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round9-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);
  assert.match(page, /getRoundNineLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundNinePythonChallenge/);
  assert.match(challengeRouter, /buildRoundNineSQLChallenge/);
  assert.match(genaiRouter, /buildRoundNineGenAILab/);
  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundNinePythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundNineSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));
  assert.match(challenges, /Web Gateway Python project/);
  assert.match(challenges, /Transaction Core SQL project/);
  assert.match(challenges, /SQL keeps values out of query text/);
  assert.match(challenges, /Uses consistent lock order/);
  assert.match(challenges, /Total power is preserved/);
  assert.match(labs, /layered_guardrails_lab\.py/);
  assert.match(labs, /prompt_injection_boundary_lab\.py/);
  assert.match(labs, /genai_threat_model_lab\.py/);
  assert.match(labs, /typed_streaming_lab\.py/);
  assert.match(labs, /tenant_safe_cache_lab\.py/);
  assert.match(labs, /Safety & Scale: STABLE/);
});
