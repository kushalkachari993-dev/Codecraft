import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all fourteen Round 6 intermediate topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round6.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql|genai):intermediate:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 14);
  for (const topic of [
    "OOP", "Comprehensions", "Lambda", "Iterators", "Generators",
    "Advanced JOINs", "Advanced subqueries", "CTEs", "Recursive CTEs",
    "Hybrid search", "Reranking", "Advanced RAG", "RAG evaluation", "Production prompting",
  ]) assert.match(lessons, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 6 authored execution missions and world projects", async () => {
  const [page, challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/round6-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round6-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /getRoundSixLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundSixPythonChallenge/);
  assert.match(challengeRouter, /buildRoundSixSQLChallenge/);
  assert.match(genaiRouter, /buildRoundSixGenAILab/);

  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundSixPythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundSixSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));

  assert.match(challenges, /Object Workshop Python project/);
  assert.match(challenges, /Advanced Query Grid SQL project/);
  assert.match(challenges, /Sorts and averages active relays/);
  assert.match(challenges, /Open alert is correlated/);
  assert.match(challenges, /Predecessors are correct/);

  assert.match(labs, /hybrid_search_lab\.py/);
  assert.match(labs, /reranking_budget_lab\.py/);
  assert.match(labs, /adaptive_rag_lab\.py/);
  assert.match(labs, /rag_evaluation_lab\.py/);
  assert.match(labs, /prompt_release_lab\.py/);
  assert.match(labs, /Prompt release: APPROVED/);
});
