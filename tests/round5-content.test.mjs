import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all twelve Round 5 topics across the pace transition", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round5.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql|genai):(?:beginner|intermediate):[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 12);
  assert.equal((lessons.match(/"genai:intermediate:/g) ?? []).length, 5);
  for (const topic of [
    "Basic DSA", "Big-O basics", "Basic recursion",
    "Subqueries", "String functions", "Date functions", "Basic schema design",
    "Transformers deeper", "Embeddings deeper", "Document ingestion", "Chunking", "Retrieval engineering",
  ]) {
    assert.match(lessons, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 5 authored execution missions and world projects", async () => {
  const [page, challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/round5-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round5-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /getRoundFiveLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundFivePythonChallenge/);
  assert.match(challengeRouter, /buildRoundFiveSQLChallenge/);
  assert.match(genaiRouter, /buildRoundFiveGenAILab/);
  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundFivePythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundThreeSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundFourSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundFiveSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));

  // Optional topic missions must route before the generic required-project fallback.


  assert.match(challenges, /Algorithm Grove Python project/);
  assert.match(challenges, /Relational Design SQL project/);
  assert.match(challenges, /Handles branching and duplicate names/);
  assert.match(challenges, /Newest relays are ordered/);
  assert.match(challenges, /Titles are normalized/);

  assert.match(labs, /transformer_trace_lab\.py/);
  assert.match(labs, /embedding_engineering_lab\.py/);
  assert.match(labs, /ingestion_pipeline_lab\.py/);
  assert.match(labs, /chunking_eval_lab\.py/);
  assert.match(labs, /retrieval_pipeline_lab\.py/);
  assert.match(labs, /Unauthorized candidates: 0/);
});
