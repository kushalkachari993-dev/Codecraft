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
