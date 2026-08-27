import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all fourteen Round 14 expert topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round14.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql|genai):expert:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 14);
  for (const topic of [
    "Advanced typing", "Production APIs", "PostgreSQL engineering", "Caching", "Queues",
    "WAL", "Recovery", "Replication", "Partitioning", "Sharding",
    "Reliability", "Advanced security", "Agent authorization", "GenAI system design",
  ]) assert.ok(lessons.includes(topic), `missing ${topic}`);
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 14 authored execution missions and world projects", async () => {
  const [challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/round14-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round14-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);
  assert.match(await readFile(new URL("../app/lesson-enrichment-bundle.ts", import.meta.url), "utf8"), /getRoundFourteenLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundFourteenPythonChallenge/);
  assert.match(challengeRouter, /buildRoundFourteenSQLChallenge/);
  assert.match(genaiRouter, /buildRoundFourteenGenAILab/);
  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundFourteenPythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundFourteenSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));
  assert.match(challenges, /Type & API Forge Python project/);
  assert.match(challenges, /Durability Grid SQL project/);
  assert.match(challenges, /Retries replay exactly once/);
  assert.match(challenges, /Archive sequence is continuous/);
  assert.match(labs, /resilient_model_workflow_lab\.py/);
  assert.match(labs, /genai_attack_path_lab\.py/);
  assert.match(labs, /agent_authorization_lab\.py/);
  assert.match(labs, /genai_system_design_lab\.py/);
  assert.match(labs, /Reliability & Security: STABLE/);
  assert.match(labs, /Mock tools only/);
});
