import { env } from "cloudflare:workers";
import { getClerkUser } from "../../clerk-auth";
import type { ClerkRuntimeEnvironment } from "../../clerk-config";
import { normalizeProgress } from "../../progress";

export const dynamic = "force-dynamic";

async function upsertLearner(user: NonNullable<Awaited<ReturnType<typeof getClerkUser>>>) {
  const { ensureProgressSchema, getD1 } = await import("../../../db");
  const db = getD1();
  await ensureProgressSchema(db);
  const now = Date.now();
  await db.prepare(
    "INSERT INTO learners (user_id, email, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, updated_at = excluded.updated_at",
  ).bind(user.userId, user.email, user.displayName, now, now).run();
  return db;
}

export async function GET(request: Request) {
  const user = await getClerkUser(request, env as unknown as ClerkRuntimeEnvironment);
  if (!user) {
    return Response.json({ user: null, progress: null, storage: "local" }, { headers: { "cache-control": "no-store" } });
  }

  const db = await upsertLearner(user);
  const row = await db.prepare("SELECT progress_json FROM progress_snapshots WHERE user_id = ?")
    .bind(user.userId).first<{ progress_json: string }>();
  let progress = null;
  if (row?.progress_json) {
    try {
      progress = normalizeProgress(JSON.parse(row.progress_json));
    } catch {
      progress = null;
    }
  }
  return Response.json({
    user: { displayName: user.displayName, email: user.email },
    progress,
    storage: "cloud",
  }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  const user = await getClerkUser(request, env as unknown as ClerkRuntimeEnvironment);
  if (!user) return Response.json({ error: "Sign in to sync progress." }, { status: 401 });

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 80_000) return Response.json({ error: "Progress payload is too large." }, { status: 413 });
  try {
    const payload = await request.json() as { progress?: unknown };
    const progress = normalizeProgress(payload.progress);
    const db = await upsertLearner(user);
    const now = Date.now();
    await db.prepare(
      "INSERT INTO progress_snapshots (user_id, progress_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET progress_json = excluded.progress_json, updated_at = excluded.updated_at",
    ).bind(user.userId, JSON.stringify(progress), now).run();
    return Response.json({ saved: true, updatedAt: now }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Invalid progress payload." }, { status: 400 });
  }
}
