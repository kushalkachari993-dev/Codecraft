import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all nine Round 16 expert topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round16.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql):expert:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 9);
  for (const topic of [
    "CPython internals", "Bytecode", "AST", "Architecture",
    "Performance engineering", "Keyset pagination", "OLTP vs OLAP", "Dimensional modeling", "Distributed SQL",
  ]) assert.ok(lessons.includes(topic), `missing ${topic}`);
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 16 authored execution missions and world projects", async () => {
  const [challenges, challengeRouter] = await Promise.all([
    readFile(new URL("../app/round16-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
  ]);
  assert.match(await readFile(new URL("../app/lesson-enrichment-bundle.ts", import.meta.url), "utf8"), /getRoundSixteenLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundSixteenPythonChallenge/);
  assert.match(challengeRouter, /buildRoundSixteenSQLChallenge/);
  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundSixteenPythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundSixteenSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));
  assert.match(challenges, /CPython Lab Python project/);
  assert.match(challenges, /Performance & Analytics SQL project/);
  assert.match(challenges, /Analysis never executes code/);
  assert.match(challenges, /Next events are exact/);
  assert.match(challenges, /Composite seek pagination mission/);
  assert.match(challenges, /Type-2 relay dimension mission/);
});
