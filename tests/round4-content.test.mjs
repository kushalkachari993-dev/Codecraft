import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("enriches all fifteen Round 4 beginner topics", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons-round4.ts", import.meta.url), "utf8");
  const keys = lessons.match(/"(?:python|sql|genai):beginner:[^"]+": lesson\(/g) ?? [];
  assert.equal(keys.length, 15);
  for (const topic of [
    "Files", "Modules", "Git basics", "Virtual environments", "Dependency basics", "JSON", "Debugging basics",
    "Foreign keys", "Constraints", "Relationships", "JOINs",
    "Embeddings", "Vector DB basics", "Basic RAG", "Multimodal basics",
  ]) {
    assert.match(lessons, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("ships Round 4 authored execution missions and world projects", async () => {
  const [page, challenges, labs, challengeRouter, genaiRouter] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/round4-challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/round4-genai-labs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /getRoundFourLessonEnrichment/);
  assert.match(challengeRouter, /buildRoundFourPythonChallenge/);
  assert.match(challengeRouter, /buildRoundFourSQLChallenge/);
  assert.match(genaiRouter, /buildRoundFourGenAILab/);

  assert.match(challenges, /Builder Toolkit Python project/);
  assert.match(challenges, /Integrity Network SQL project/);
  assert.match(challenges, /Rejects broken contracts/);
  assert.match(challenges, /Every relay is preserved/);
  assert.match(challenges, /Junction has composite identity/);

  assert.match(labs, /embedding_quality_lab\.py/);
  assert.match(labs, /vector_index_lab\.py/);
  assert.match(labs, /basic_rag_lab\.py/);
  assert.match(labs, /multimodal_evidence_lab\.py/);
  assert.match(labs, /Cross-tenant results: 0/);
});
