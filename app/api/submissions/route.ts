import { getClerkUser } from "../../clerk-auth";

export const dynamic = "force-dynamic";

const TRACKS = new Set(["python", "sql", "genai"]);
const PACES = new Set(["beginner", "intermediate", "expert"]);

export async function POST(request: Request) {
  const user = await getClerkUser(request);
  if (!user) return Response.json({ saved: false, storage: "local" }, { status: 401 });
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 40_000) return Response.json({ error: "Submission is too large." }, { status: 413 });

  try {
    const payload = await request.json() as Record<string, unknown>;
    const track = typeof payload.track === "string" ? payload.track : "";
    const pace = typeof payload.pace === "string" ? payload.pace : "";
    const topicId = Number(payload.topicId);
    const topic = typeof payload.topic === "string" ? payload.topic.trim().slice(0, 160) : "";
    const stage = payload.stage === "submitted" ? "submitted" : "attempt";
    const code = typeof payload.code === "string" ? payload.code : "";
    const score = Number.isFinite(Number(payload.score)) ? Math.max(0, Math.min(100, Math.round(Number(payload.score)))) : 0;
    const feedback = Array.isArray(payload.feedback) ? payload.feedback.slice(0, 20) : [];
    if (!TRACKS.has(track) || !PACES.has(pace) || !Number.isInteger(topicId) || topicId < 1 || !topic || !code || code.length > 24_000) {
      return Response.json({ error: "Invalid submission payload." }, { status: 400 });
    }

    const { ensureProgressSchema, getD1 } = await import("../../../db");
    const db = getD1();
    await ensureProgressSchema(db);
    const now = Date.now();
    await db.batch([
      db.prepare(
        "INSERT INTO learners (user_id, email, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, updated_at = excluded.updated_at",
      ).bind(user.userId, user.email, user.displayName, now, now),
      db.prepare(
        "INSERT INTO code_submissions (submission_id, user_id, track, pace, topic_id, topic, stage, code, passed, score, feedback_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).bind(crypto.randomUUID(), user.userId, track, pace, topicId, topic, stage, code, payload.passed === true ? 1 : 0, score, JSON.stringify(feedback), now),
    ]);
    return Response.json({ saved: true, createdAt: now }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Invalid submission payload." }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const user = await getClerkUser(request);
  if (!user) return Response.json({ submissions: [] }, { status: 401 });
  const url = new URL(request.url);
  const track = url.searchParams.get("track");
  const pace = url.searchParams.get("pace");
  const hasFilter = track !== null || pace !== null;
  if (hasFilter && (!track || !pace || !TRACKS.has(track) || !PACES.has(pace))) return Response.json({ error: "Choose a valid track and pace." }, { status: 400 });
  const { ensureProgressSchema, getD1 } = await import("../../../db");
  const db = getD1();
  await ensureProgressSchema(db);
  const result = hasFilter
    ? await db.prepare(
      "SELECT submission_id, track, pace, topic_id, topic, stage, passed, score, created_at FROM code_submissions WHERE user_id = ? AND track = ? AND pace = ? ORDER BY created_at DESC LIMIT 50",
    ).bind(user.userId, track, pace).all()
    : await db.prepare(
      "SELECT submission_id, track, pace, topic_id, topic, stage, passed, score, created_at FROM code_submissions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
    ).bind(user.userId).all();
  return Response.json({ submissions: result.results }, { headers: { "cache-control": "no-store" } });
}
