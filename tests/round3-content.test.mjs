import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all fifteen Round 3 beginner topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round3.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql|genai):beginner:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 15);
  for (const topic of [
    "Conditions", "Loops", "Functions", "Scope", "Exceptions",
    "GROUP BY", "HAVING", "NULL", "CASE", "Primary keys",
    "Hallucinations", "LLM APIs", "Conversation state", "Structured outputs", "Tool calling",
  ]) {
    assert.match(lessons, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 3 authored execution missions and world projects", async () => {
  const [page, challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/round3-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round3-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /getRoundThreeLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundThreePythonChallenge/);
  assert.match(challengeRouter, /buildRoundThreeSQLChallenge/);
  assert.match(genaiRouter, /buildRoundThreeGenAILab/);

  assert.match(challenges, /Logic Vaults Python project/);
  assert.match(challenges, /Aggregation Lab SQL project/);
  assert.match(challenges, /Rejects invalid input/);
  assert.match(challenges, /States are ordered/);
  assert.match(challenges, /NULL errors are excluded/);

  assert.match(labs, /grounding_eval_lab\.py/);
  assert.match(labs, /api_gateway_lab\.py/);
  assert.match(labs, /conversation_state_lab\.py/);
  assert.match(labs, /structured_output_lab\.py/);
  assert.match(labs, /tool_router_lab\.py/);
  assert.match(labs, /Unauthorized executions: 0/);
});
