import { getClerkUser } from "../../clerk-auth";
import { getCloudflareEnvironment, getProgressRepository } from "../../../infrastructure/cloudflare/runtime";

export const dynamic = "force-dynamic";

const TRACKS = new Set(["python", "sql", "genai"]);
const PACES = new Set(["beginner", "intermediate", "expert"]);

export async function POST(request: Request) {
  const user = await getClerkUser(request, getCloudflareEnvironment());
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

    const now = await getProgressRepository().saveSubmission(user, {
      track,
      pace,
      topicId,
      topic,
      stage,
      code,
      passed: payload.passed === true,
      score,
      feedback,
    });
    return Response.json({ saved: true, createdAt: now }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Invalid submission payload." }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const user = await getClerkUser(request, getCloudflareEnvironment());
  if (!user) return Response.json({ submissions: [] }, { status: 401 });
  const url = new URL(request.url);
  const track = url.searchParams.get("track");
  const pace = url.searchParams.get("pace");
  const hasFilter = track !== null || pace !== null;
  if (hasFilter && (!track || !pace || !TRACKS.has(track) || !PACES.has(pace))) {
    return Response.json({ error: "Choose a valid track and pace." }, { status: 400 });
  }
  const filter = hasFilter ? { track: track as string, pace: pace as string } : undefined;
  const submissions = await getProgressRepository().listSubmissions(user.userId, filter);
  return Response.json({ submissions }, { headers: { "cache-control": "no-store" } });
}
