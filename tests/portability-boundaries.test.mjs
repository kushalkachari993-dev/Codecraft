import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("application ports do not expose Cloudflare provider types", async () => {
  const [repository, evaluator] = await Promise.all([
    read("server/repositories/progress-repository.ts"),
    read("server/ai/ai-evaluator.ts"),
  ]);
  assert.doesNotMatch(repository, /D1Database|cloudflare:workers|\.prepare\(/);
  assert.doesNotMatch(evaluator, /CloudflareAiBinding|cloudflare:workers/);
});

test("API routes use the repository instead of direct D1 queries", async () => {
  const routes = await Promise.all([
    read("app/api/progress/route.ts"),
    read("app/api/submissions/route.ts"),
    read("app/api/account/route.ts"),
    read("app/api/health/route.ts"),
  ]);
  for (const route of routes) {
    assert.doesNotMatch(route, /cloudflare:workers|D1Database|\.prepare\(|\.batch\(/);
    assert.match(route, /getProgressRepository/);
  }
});

test("Worker delegates hosted AI and persistence to adapters", async () => {
  const worker = await read("worker/index.ts");
  assert.doesNotMatch(worker, /\.AI\.run\(|\.DB\.prepare\(|\.DB\.batch\(/);
  assert.match(worker, /WorkersAiEvaluator/);
  assert.match(worker, /D1ProgressRepository/);
});


test("CI verifies lint, unit tests, browser journeys, accessibility, and the production build", async () => {
  const [workflow, packageJson] = await Promise.all([
    readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /push:/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run lint/);
  assert.match(workflow, /npm run test:unit/);
  assert.match(workflow, /playwright install --with-deps chromium/);
  assert.match(workflow, /npm run test:e2e/);
  assert.match(workflow, /actions\/upload-artifact@v6/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /VITE_CLERK_PUBLISHABLE_KEY:\s+pk_test_/);
  assert.doesNotMatch(workflow, /actions\/(?:checkout|setup-node)@v4/);
  assert.ok(
    workflow.indexOf("npm run build") < workflow.indexOf("npm run test:unit"),
    "CI must build the server-rendered site before tests import dist/server/index.js",
  );
  assert.match(packageJson, /"test:unit"/);
  assert.match(packageJson, /"test:e2e":\s*"playwright test"/);
  const [journey, accessibility] = await Promise.all([
    readFile(new URL("./e2e/learner-journey.spec.ts", import.meta.url), "utf8"),
    readFile(new URL("./e2e/accessibility.spec.ts", import.meta.url), "utf8"),
  ]);
  assert.match(journey, /real Python runtime executes/);
  assert.match(journey, /browser Back and Forward restore/);
  assert.match(accessibility, /AxeBuilder/);
  assert.match(accessibility, /wcag22aa/);
});

test("heavy lesson content and browser runtimes load on demand", async () => {
  const [page, enrichmentHook, challengeHook, runtimeHook, executionClient] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/hooks/use-lesson-enrichment.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/hooks/use-lab-challenge.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/hooks/use-lab-runtime.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/execution/client.ts", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page, /from "\.\/authored-lessons-round/);
  assert.match(enrichmentHook, /import\("\.\.\/lesson-enrichment-bundle"\)/);
  assert.match(challengeHook, /import\("\.\.\/challenges"\)/);
  assert.match(page, /await import\("\.\/execution\/client"\)/);
  assert.match(runtimeHook, /import\("\.\.\/execution\/client"\)/);
  assert.match(executionClient, /new Worker\("\/python-runner\.js"/);
  assert.match(executionClient, /new URL\("\.\/sql-runner\.worker\.ts"/);
});
