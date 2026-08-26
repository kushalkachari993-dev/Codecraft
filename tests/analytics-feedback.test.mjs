import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("analytics uses a provider-neutral repository and predefined events", async () => {
  const [port, adapter, route, eventNames] = await Promise.all([
    read("server/repositories/analytics-repository.ts"),
    read("infrastructure/cloudflare/d1-analytics-repository.ts"),
    read("app/api/analytics/route.ts"),
    read("app/analytics-events.ts"),
  ]);
  assert.doesNotMatch(port, /D1Database|cloudflare:workers|\.prepare\(/);
  assert.match(adapter, /implements AnalyticsRepository/);
  assert.match(route, /ANALYTICS_EVENT_NAMES/);
  assert.match(eventNames, /world_completed/);
  assert.match(eventNames, /checkpoint_failed/);
  assert.doesNotMatch(eventNames, /\b(code|prompt|answer|email|displayName)\??:/);
});

test("feedback is validated, rate limited, and protected from oversized payloads", async () => {
  const [route, adapter, component] = await Promise.all([
    read("app/api/feedback/route.ts"),
    read("infrastructure/cloudflare/d1-analytics-repository.ts"),
    read("app/beta-feedback.tsx"),
  ]);
  assert.match(route, /contentLength > 4_000/);
  assert.match(route, /message\.length > 1_200/);
  assert.match(adapter, /FEEDBACK_LIMIT_PER_DAY = 5/);
  assert.match(component, /Do not include passwords, API keys, code, prompts, or personal information/);
  assert.match(component, /How did your first world feel/);
});

test("analytics tables are versioned and account deletion removes linked rows", async () => {
  const [schema, migration, runtimeMigrations, deleteRoute, privacy] = await Promise.all([
    read("db/schema.ts"),
    read("drizzle/0003_amazing_shockwave.sql"),
    read("infrastructure/cloudflare/migrations.ts"),
    read("app/api/account/route.ts"),
    read("app/privacy/page.tsx"),
  ]);
  for (const source of [schema, migration, runtimeMigrations]) {
    assert.match(source, /analytics_events/);
    assert.match(source, /beta_feedback/);
  }
  assert.match(runtimeMigrations, /version: 4/);
  assert.match(deleteRoute, /getAnalyticsRepository\(\)\.deleteUserData/);
  assert.match(privacy, /automatically removed after 90 days/);
});

test("owner analytics endpoint is server-side allowlisted", async () => {
  const [route, admin, page] = await Promise.all([
    read("app/api/admin/analytics/route.ts"),
    read("server/admin.ts"),
    read("app/admin/analytics/page.tsx"),
  ]);
  assert.match(route, /isCodeCraftAdmin/);
  assert.match(route, /status: 403/);
  assert.match(admin, /CODECRAFT_ADMIN_USER_IDS/);
  assert.match(admin, /CODECRAFT_ADMIN_EMAILS/);
  assert.match(page, /Learning funnel/);
  assert.match(page, /Recent feedback/);
});

test("temporary owner access uses a signed HTTP-only session and keeps Clerk authorization", async () => {
  const [sessionRoute, session, analyticsRoute, page, docs] = await Promise.all([
    read("app/api/admin/session/route.ts"),
    read("server/temporary-admin-session.ts"),
    read("app/api/admin/analytics/route.ts"),
    read("app/admin/analytics/page.tsx"),
    read("docs/TEMP_ADMIN_ACCESS.md"),
  ]);
  assert.match(sessionRoute, /MAX_FAILURES = 5/);
  assert.match(sessionRoute, /isSameOriginRequest/);
  assert.match(sessionRoute, /contentLength > 1_024/);
  assert.match(session, /HttpOnly; SameSite=Strict/);
  assert.match(session, /crypto\.subtle\.sign/);
  assert.match(analyticsRoute, /isCodeCraftAdmin/);
  assert.match(analyticsRoute, /verifyTemporaryAdminSession/);
  assert.match(page, /Sign in with Clerk/);
  assert.match(page, /Temporary beta owner passcode/);
  assert.match(docs, /Mandatory removal checkpoint/);
  assert.match(docs, /production Clerk/);
});
