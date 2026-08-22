import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the CodeCraft track chooser", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  const visibleHtml = html.replace(/<!--.*?-->/g, "");
  assert.match(html, /<title>CodeCraft — An Original Voxel Coding Adventure<\/title>/i);
  assert.match(html, /ORIGINAL CODE REALMS/);
  assert.match(html, /Repair the Core Relay/);
  assert.match(html, />Python</);
  assert.match(html, />GenAI</);
  assert.match(visibleHtml, /0\/71 topics/);
  assert.match(html, />SQL</);
  assert.match(visibleHtml, /0\/78 topics/);
  assert.match(html, /Choose your pace/);
  assert.doesNotMatch(html, /codex-preview/);
  assert.doesNotMatch(html, /Your site is taking shape/);
});

test("runs controlled GenAI lab evaluation without exposing a model credential", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("genai-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/api/genai-lab", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        topic: "AI/ML basics",
        code: "input_data = load_prompt_case('prompt_cases.json')\nresult = run_mock_model(input_data)\nreport = compare_behavior(result)\nprint(report)",
      }),
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.mode, "controlled-local");
  assert.equal(payload.passed, true);
  assert.equal(payload.tests.length, 4);
  assert.deepEqual(payload.tests.map((item) => item.name), ["Grounding", "Tool usage", "Safety", "Output quality"]);
  assert.match(payload.output, /Result: PASS/);
  assert.match(payload.output, /Sign in to request one of three daily AI coaching reviews/);
});

test("renders the privacy notice", async () => {
  const response = await render("/privacy");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /What CodeCraft stores/);
  assert.match(html, /Code execution and GenAI labs/);
  assert.match(html, /Open account deletion controls/);
});

test("keeps the finished product free of starter-preview code", async () => {
  const [page, layout, packageJson, pythonCurriculum, genaiCurriculum, sqlCurriculum, challenges, executionClient, pythonRunner, sqlRunner, worker, progressSource, progressRoute, submissionsRoute, schema, clerkAuth, clerkProvider, accountRoute, healthRoute, privacyPage, deleteAccountPage, migration] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/python-curriculum.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/genai-curriculum.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/sql-curriculum.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/challenges.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/execution/client.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/execution/python-runner.worker.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/execution/sql-runner.worker.ts", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/progress.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/progress/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/submissions/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/clerk-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/clerk-provider.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/account/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/health/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/account/delete/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_warm_edwin_jarvis.sql", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const TRACKS: Track\[\]/);
  assert.match(page, /codecraft-progress-v3/);
  assert.match(page, /function buildQuiz/);
  assert.match(page, /"theory", "example", "quiz", "bonus"/);
  assert.match(page, /Take the checkpoint/);
  assert.match(page, /Optional coding challenge/);
  assert.match(page, /CORE EXPLANATION/);
  assert.doesNotMatch(page, /setLessonStage\("code"\)/);
  assert.match(page, /progress\.bonus/);
  assert.doesNotMatch(page, /const (?:PYTHON|GENAI|SQL)_QUESTS: Quest\[\]/);
  assert.match(page, /The Function Relay/);
  assert.match(page, /\{activeTrack\.label\} pace/);
  assert.match(page, /activeTrack\.id === "sql" \? SQL_PACES/);
  assert.match(progressSource, /python-beginner/);
  assert.match(progressSource, /python-intermediate/);
  assert.match(progressSource, /python-expert/);
  assert.match(page, /function buildGenAIPaceQuests/);
  assert.match(page, /function buildGenAITheory/);
  assert.match(progressSource, /genai-beginner/);
  assert.match(progressSource, /genai-intermediate/);
  assert.match(progressSource, /genai-expert/);
  assert.match(page, /Intelligence Foundations/);
  assert.match(page, /Safety & Scale/);
  assert.match(page, /Platform Frontier/);
  assert.match(page, /function buildSQLPaceQuests/);
  assert.match(page, /function buildSQLTheory/);
  assert.match(progressSource, /sql-beginner/);
  assert.match(progressSource, /sql-intermediate/);
  assert.match(progressSource, /sql-expert/);
  assert.match(page, /Data Foundations/);
  assert.match(page, /Transaction Core/);
  assert.match(page, /Architecture Frontier/);
  assert.match(pythonCurriculum, /label: "Beginner"/);
  assert.match(pythonCurriculum, /label: "Intermediate"/);
  assert.match(pythonCurriculum, /label: "Expert"/);
  const beginnerSection = pythonCurriculum.slice(pythonCurriculum.indexOf('id: "beginner"'), pythonCurriculum.indexOf('id: "intermediate"'));
  const intermediateSection = pythonCurriculum.slice(pythonCurriculum.indexOf('id: "intermediate"'), pythonCurriculum.indexOf('id: "expert"'));
  const expertSection = pythonCurriculum.slice(pythonCurriculum.indexOf('id: "expert"'));
  assert.equal((beginnerSection.match(/makeTopic\(/g) ?? []).length, 24);
  assert.equal((intermediateSection.match(/makeTopic\(/g) ?? []).length, 29);
  assert.equal((expertSection.match(/makeTopic\(/g) ?? []).length, 30);
  assert.ok(beginnerSection.indexOf('"Environment"') < beginnerSection.indexOf('"Basic recursion"'));
  assert.ok(intermediateSection.indexOf('"OOP"') < intermediateSection.indexOf('"PostgreSQL"'));
  assert.ok(expertSection.indexOf('"Object model"') < expertSection.indexOf('"Specialization"'));
  assert.match(genaiCurriculum, /label: "Beginner"/);
  assert.match(genaiCurriculum, /label: "Intermediate"/);
  assert.match(genaiCurriculum, /label: "Expert"/);
  const genaiBeginnerSection = genaiCurriculum.slice(genaiCurriculum.indexOf('id: "beginner"'), genaiCurriculum.indexOf('id: "intermediate"'));
  const genaiIntermediateSection = genaiCurriculum.slice(genaiCurriculum.indexOf('id: "intermediate"'), genaiCurriculum.indexOf('id: "expert"'));
  const genaiExpertSection = genaiCurriculum.slice(genaiCurriculum.indexOf('id: "expert"'));
  assert.equal((genaiBeginnerSection.match(/makeTopic\(/g) ?? []).length, 18);
  assert.equal((genaiIntermediateSection.match(/makeTopic\(/g) ?? []).length, 25);
  assert.equal((genaiExpertSection.match(/makeTopic\(/g) ?? []).length, 28);
  assert.ok(genaiBeginnerSection.indexOf('"AI/ML basics"') < genaiBeginnerSection.indexOf('"Multimodal basics"'));
  assert.ok(genaiIntermediateSection.indexOf('"Transformers deeper"') < genaiIntermediateSection.indexOf('"Caching"'));
  assert.ok(genaiExpertSection.indexOf('"Transformer internals"') < genaiExpertSection.indexOf('"Production feedback loops"'));
  assert.match(genaiCurriculum, /keyIdeas:/);
  assert.match(genaiCurriculum, /commonMistake:/);
  assert.match(genaiCurriculum, /export function buildGenAILab/);
  assert.match(genaiCurriculum, /export function validateGenAILab/);
  assert.match(genaiCurriculum, /requiredCalls:/);
  assert.match(genaiCurriculum, /Mock tools only/);
  assert.match(page, /isRequiredWorldProject/);
  assert.match(page, /pendingRequiredProject/);
  assert.match(page, /requiredProjectIds/);
  assert.match(page, /trackBonus\.includes\(previousId\)/);
  assert.match(page, /Start required world project/);
  assert.match(page, /Sign in to sync/);
  assert.match(page, /\/api\/progress/);
  assert.match(page, /\/api\/submissions/);
  assert.match(progressSource, /export function mergeProgress/);
  assert.match(progressSource, /Math\.max\(local\.xp, cloud\.xp\)/);
  assert.match(progressRoute, /getClerkUser/);
  assert.match(progressRoute, /ON CONFLICT\(user_id\) DO UPDATE/);
  assert.match(progressRoute, /storage: "local"/);
  assert.match(clerkAuth, /authenticateRequest/);
  assert.match(clerkAuth, /authorizedParties/);
  assert.match(clerkAuth, /acceptsToken: "session_token"/);
  assert.match(clerkProvider, /ClerkProvider/);
  assert.match(page, /SignInButton/);
  assert.match(page, /useClerk/);
  assert.match(page, /openUserProfile/);
  assert.match(page, /clerkProfile\.update/);
  assert.match(page, /Saved submissions/);
  assert.match(page, /Delete account/);
  assert.match(page, /3 signed-in AI coaching reviews daily/);
  assert.match(page, /Badges by track/);
  assert.match(page, /LIVE REALM MAP/);
  assert.match(page, /WORLD BOSS/);
  assert.match(page, /recordGameActivity/);
  assert.match(page, /Avatar loadout/);
  assert.match(page, /Inventory & achievements/);
  assert.match(page, /DAILY MISSION COMPLETE/);
  assert.match(progressSource, /export type GameProfile/);
  assert.match(progressSource, /streakDays/);
  assert.match(progressSource, /inventory: \[\.\.\.new Set/);
  assert.match(page, /authorization: `Bearer \$\{token\}`/);
  assert.match(packageJson, /@clerk\/react/);
  assert.match(packageJson, /@clerk\/backend/);
  assert.match(submissionsRoute, /code_submissions/);
  assert.match(submissionsRoute, /crypto\.randomUUID/);
  assert.match(submissionsRoute, /LIMIT 20/);
  assert.match(schema, /progressSnapshots/);
  assert.match(schema, /codeSubmissions/);
  assert.match(schema, /aiReviewUsage/);
  assert.match(worker, /AI_REVIEW_DAILY_LIMIT = 3/);
  assert.match(worker, /INSERT INTO ai_review_usage/);
  assert.match(worker, /llama-3\.1-8b-instruct-fp8-fast/);
  assert.match(worker, /getClerkUser\(request, env\)/);
  assert.match(executionClient, /request\.authToken/);
  assert.match(accountRoute, /DELETE FROM ai_review_usage/);
  assert.match(accountRoute, /clerk\.users\.deleteUser/);
  assert.match(healthRoute, /status === "healthy" \? 200 : 503/);
  assert.match(privacyPage, /What CodeCraft stores/);
  assert.match(deleteAccountPage, /Permanently delete account/);
  assert.match(migration, /CREATE TABLE `ai_review_usage`/);
  assert.match(page, /CONTROLLED AI RUNTIME/);
  assert.match(page, /NO PERSONAL API KEY · NO CREDITS/);
  assert.match(page, /executeLab/);
  assert.match(page, /REAL PYTHON · BROWSER SANDBOX/);
  assert.match(page, /REAL POSTGRESQL · PRACTICE DATABASE/);
  assert.match(page, /Stop execution/);
  assert.match(page, /RESULT TABLE/);
  assert.match(page, /TEST RESULTS/);
  assert.match(page, /HIDDEN CHECKS/);
  assert.match(challenges, /buildPythonChallenge/);
  assert.match(challenges, /buildSQLChallenge/);
  assert.match(challenges, /stabilize_world/);
  assert.match(challenges, /world_relay_report/);
  assert.match(challenges, /Uses its input instead of constants/);
  assert.match(challenges, /Aurora aggregation is correct/);
  assert.match(challenges, /minimumCodeLength/);
  assert.match(challenges, /pythonTests/);
  assert.match(challenges, /database-value/);
  assert.match(challenges, /VISIBLE EXAMPLE/);
  assert.match(executionClient, /python-runner[.]js[\s\S]*type: "module"/);
  assert.match(executionClient, /sql-runner\.worker\.ts/);
  assert.match(executionClient, /runtimePools/);
  assert.match(executionClient, /python-runner[.]js/);
  assert.match(executionClient, /prepareLabRuntime/);
  assert.match(executionClient, /COLD_START_TIMEOUT/);
  assert.match(page, /RUNTIME READY/);
  assert.match(page, /warmed worker/);
  assert.match(pythonRunner, /loadPyodide/);
  assert.match(pythonRunner, /Creating a clean Python workspace/);
  assert.match(sqlRunner, /Reusing the warmed PostgreSQL runtime/);
  assert.match(pythonRunner, /runPythonAsync/);
  assert.match(pythonRunner, /Hidden behavior check passed/);
  assert.match(sqlRunner, /PGlite\.create\("memory:\/\/"\)/);
  assert.match(sqlRunner, /CREATE TABLE relays/);
  assert.match(sqlRunner, /gradeSQL/);
  assert.match(worker, /\/api\/genai-lab/);
  assert.match(worker, /env\.AI\.run/);
  assert.match(worker, /UNTRUSTED_SUBMISSION/);
  assert.doesNotMatch(page + executionClient, /API_KEY|CLERK_SECRET_KEY|sk_(?:test|live)_/i);
  assert.match(sqlCurriculum, /label: "Beginner"/);
  assert.match(sqlCurriculum, /label: "Intermediate"/);
  assert.match(sqlCurriculum, /label: "Expert"/);
  const sqlBeginnerSection = sqlCurriculum.slice(sqlCurriculum.indexOf('id: "beginner"'), sqlCurriculum.indexOf('id: "intermediate"'));
  const sqlIntermediateSection = sqlCurriculum.slice(sqlCurriculum.indexOf('id: "intermediate"'), sqlCurriculum.indexOf('id: "expert"'));
  const sqlExpertSection = sqlCurriculum.slice(sqlCurriculum.indexOf('id: "expert"'));
  assert.equal((sqlBeginnerSection.match(/makeTopic\(/g) ?? []).length, 23);
  assert.equal((sqlIntermediateSection.match(/makeTopic\(/g) ?? []).length, 26);
  assert.equal((sqlExpertSection.match(/makeTopic\(/g) ?? []).length, 29);
  assert.ok(sqlBeginnerSection.indexOf('"Database basics"') < sqlBeginnerSection.indexOf('"Basic schema design"'));
  assert.ok(sqlIntermediateSection.indexOf('"Advanced JOINs"') < sqlIntermediateSection.indexOf('"Query optimization"'));
  assert.ok(sqlExpertSection.indexOf('"Query optimizer"') < sqlExpertSection.indexOf('"Database architecture"'));
  assert.match(sqlCurriculum, /keyIdeas:/);
  assert.match(sqlCurriculum, /commonMistake:/);
  assert.match(page, /window\.localStorage/);
  assert.match(layout, /const title = "CodeCraft — An Original Voxel Coding Adventure"/);
  assert.match(layout, /Explore the original Code Realms with Byte/);
  assert.match(page, /ORIGINAL CODE REALMS/);
  assert.match(page, /Core Relay/);
  assert.match(page, /Byte/);
  const globals = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const protectedBrandSources = `${page}\n${pythonCurriculum}\n${genaiCurriculum}\n${sqlCurriculum}\n${globals}`;
  for (const forbiddenTerm of ["minecraft", "mojang", "creeper", "redstone", "ender", "nether", "Steve", "Alex", "villager", "command blocks", "pickaxe", "diamond"]) {
    assert.doesNotMatch(
      protectedBrandSources,
      new RegExp(`\\b${forbiddenTerm}\\b`, "i"),
      `Original CodeCraft content must not reference ${forbiddenTerm}`,
    );
  }
  assert.doesNotMatch(protectedBrandSources, /scene-cave/i);
  assert.match(layout, /new URL\("\/og-v2\.png", origin\)/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await assert.rejects(access(new URL("../app/chatgpt-auth.ts", import.meta.url)));
  await access(new URL("../public/pyodide/pyodide.asm.wasm", import.meta.url));
  await access(new URL("../public/pyodide/python_stdlib.zip", import.meta.url));
});
