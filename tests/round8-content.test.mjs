import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all fifteen Round 8 intermediate topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round8.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql|genai):intermediate:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 15);
  for (const topic of [
    "Collections", "Itertools", "Functools", "Pythonic coding", "Testing", "Logging",
    "Normalization", "Schema design", "Indexes", "EXPLAIN ANALYZE",
    "Agent workflows", "LangChain", "LangGraph", "MCP", "Evaluation",
  ]) assert.match(lessons, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 8 authored execution missions and world projects", async () => {
  const [page, challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/round8-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round8-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);
  assert.match(page, /getRoundEightLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundEightPythonChallenge/);
  assert.match(challengeRouter, /buildRoundEightSQLChallenge/);
  assert.match(genaiRouter, /buildRoundEightGenAILab/);
  const pythonRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildPythonChallenge"));
  const sqlRouter = challengeRouter.slice(challengeRouter.indexOf("export function buildSQLChallenge"));
  assert.ok(pythonRouter.indexOf("buildRoundEightPythonChallenge(topic, options)") < pythonRouter.indexOf("if (options.required)"));
  assert.ok(sqlRouter.indexOf("buildRoundEightSQLChallenge(topic, options)") < sqlRouter.indexOf("if (options.required)"));
  assert.match(challenges, /Standard Library Citadel Python project/);
  assert.match(challenges, /Schema & Index Lab SQL project/);
  assert.match(challenges, /Repair cost is correct and cached/);
  assert.match(challenges, /Assignments have two foreign keys/);
  assert.match(challenges, /Executes a measured plan/);
  assert.match(labs, /agent_workflow_recovery_lab\.py/);
  assert.match(labs, /langchain_boundary_lab\.py/);
  assert.match(labs, /langgraph_checkpoint_lab\.py/);
  assert.match(labs, /mcp_trust_boundary_lab\.py/);
  assert.match(labs, /evaluation_release_gate_lab\.py/);
  assert.match(labs, /Workflow Graphs: STABLE/);
});
