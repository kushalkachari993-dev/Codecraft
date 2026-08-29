import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("includes authored first-world lessons for all three beginner tracks", async () => {
  const lessons = await readFile(new URL("../app/authored-lessons.ts", import.meta.url), "utf8");
  const authoredKeys = lessons.match(/"(?:python|sql|genai):beginner:[^"]+": lesson\(/g) ?? [];

  assert.equal(authoredKeys.length, 15);
  for (const topic of [
    "Environment", "Variables", "Data types", "Operators", "Strings",
    "Database basics", "Tables/rows/columns", "CRUD", "SELECT",
    "AI/ML basics", "Neural network basics", "NLP basics", "Transformers", "LLM fundamentals",
  ]) {
    assert.match(lessons, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(lessons, /whyItMatters/);
  assert.match(lessons, /walkthrough/);
  assert.match(lessons, /explanation/);
});

test("uses authored first-world execution missions and precise checks", async () => {
  const [page, challenges, genai] = await Promise.all([
    Promise.all([
      readFile(new URL("../app/learning-app.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/codecraft-catalog.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/lesson-stage-views.tsx", import.meta.url), "utf8"),
    ]).then((parts) => parts.join("\n")),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
  ]);

  assert.match(await readFile(new URL("../app/lesson-enrichment-bundle.ts", import.meta.url), "utf8"), /getLessonEnrichment/);
  assert.match(page, /WHY THIS MATTERS/);
  assert.match(page, /Correct —/);
  assert.match(page, /rotateQuizOptions/);

  assert.match(challenges, /Interpreter diagnostic mission/);
  assert.match(challenges, /Telemetry normalization mission/);
  assert.match(challenges, /Relay readiness mission/);
  assert.match(challenges, /Finds the three core relations/);
  assert.match(challenges, /Create relay_checks/);
  assert.match(challenges, /Delete targeted one practice row/);

  assert.match(genai, /AUTHORED_BEGINNER_LABS/);
  assert.match(genai, /baseline_comparison\.py/);
  assert.match(genai, /attention_trace\.py/);
  assert.match(genai, /generation_comparison\.py/);
});
