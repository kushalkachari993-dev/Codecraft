import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all nine final Round 17 expert topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round17.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql):expert:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 9);
  for (const topic of [
    "Distributed systems", "Design patterns", "Package design", "Open source", "Specialization",
    "SQL vs NoSQL", "Multi-tenancy", "Zero-downtime migrations", "Database architecture",
  ]) assert.ok(lessons.includes(topic), `missing ${topic}`);
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships final authored missions and world projects before generic fallbacks", async () => {
  const [challenges, challengeRouter] = await Promise.all([
    readFile(new URL("../app/round17-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
  ]);
  assert.match(await readFile(new URL("../app/lesson-enrichment-bundle.ts", import.meta.url), "utf8"), /getRoundSeventeenLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundSeventeenPythonChallenge/);
  assert.match(challengeRouter, /buildRoundSeventeenSQLChallenge/);
  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundSeventeenPythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundSeventeenSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));
  assert.match(challenges, /Systems Frontier Python project/);
  assert.match(challenges, /Architecture Frontier SQL project/);
  assert.match(challenges, /Blueprint routes and policies are exact/);
  assert.match(challenges, /Derived architecture result is exact/);
  assert.match(challenges, /Idempotent delivery reconciliation mission/);
  assert.match(challenges, /Expand-backfill-contract migration mission/);
});
