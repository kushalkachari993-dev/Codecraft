import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all fifteen Round 7 intermediate topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round7.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql|genai):intermediate:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 15);
  for (const topic of [
    "Decorators", "Closures", "Context managers", "Type hints", "Dataclasses",
    "Window functions", "Set operations", "Advanced aggregation", "Views", "Materialized views",
    "Model selection", "Agents", "Agent loops", "Agent state", "Memory",
  ]) assert.match(lessons, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 7 authored execution missions and world projects", async () => {
  const [challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/round7-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round7-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);

  assert.match(await readFile(new URL("../app/lesson-enrichment-bundle.ts", import.meta.url), "utf8"), /getRoundSevenLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundSevenPythonChallenge/);
  assert.match(challengeRouter, /buildRoundSevenSQLChallenge/);
  assert.match(genaiRouter, /buildRoundSevenGenAILab/);

  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundSevenPythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundSevenSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));

  assert.match(challenges, /Pythonic Forge Python project/);
  assert.match(challenges, /Analytical Engine SQL project/);
  assert.match(challenges, /Decorator records and preserves metadata/);
  assert.match(challenges, /Ranks reset per sector/);
  assert.match(challenges, /Materialized snapshot was created/);

  assert.match(labs, /model_selection_bakeoff\.py/);
  assert.match(labs, /bounded_agent_lab\.py/);
  assert.match(labs, /agent_loop_breakers_lab\.py/);
  assert.match(labs, /durable_agent_state_lab\.py/);
  assert.match(labs, /governed_memory_lab\.py/);
  assert.match(labs, /Agent Relay: STABLE/);
});
