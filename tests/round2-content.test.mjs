import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all thirteen Round 2 beginner topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round2.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql|genai):beginner:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 13);
  for (const topic of ["Lists", "Tuples", "Sets", "Dictionaries", "WHERE", "ORDER BY", "LIMIT", "DISTINCT", "Aggregates", "Tokens", "Context windows", "Generation parameters", "Prompt engineering"]) {
    assert.match(lessons, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 2 authored execution missions and world projects", async () => {
  const [challenges, labs, challengeRouter, genaiRouter, types, sqlRunner] = await Promise.all([
    readFile(new URL("../app/round2-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round2-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/execution/types.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/execution/sql-runner.worker.ts", import.meta.url), "utf8"),
  ]);

  assert.match(await readFile(new URL("../app/lesson-enrichment-bundle.ts", import.meta.url), "utf8"), /getRoundTwoLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundTwoPythonChallenge/);
  assert.match(challengeRouter, /buildRoundTwoSQLChallenge/);
  assert.match(genaiRouter, /buildRoundTwoGenAILab/);

  assert.match(challenges, /Inventory Basics Python project/);
  assert.match(challenges, /Query Relay SQL project/);
  assert.match(challenges, /Preserves caller state/);
  assert.match(challenges, /Strongest relays are ordered/);
  assert.match(challenges, /Counts only known errors/);

  assert.match(labs, /token_budget_lab\.py/);
  assert.match(labs, /context_budget_lab\.py/);
  assert.match(labs, /generation_sweep_lab\.py/);
  assert.match(labs, /prompt_contract_lab\.py/);

  assert.match(types, /result-ordered-values/);
  assert.match(sqlRunner, /Result values are in the required order/);
});

