import { getClerkUser } from "../../clerk-auth";
import { getAnalyticsRepository, getCloudflareEnvironment } from "../../../infrastructure/cloudflare/runtime";

export const dynamic = "force-dynamic";

const TRACKS = new Set(["python", "genai", "sql"]);
const PACES = new Set(["beginner", "intermediate", "expert"]);
const CATEGORIES = new Set(["general", "content", "difficulty", "bug", "idea"]);
const DIFFICULTIES = new Set(["too_easy", "about_right", "too_hard"]);
const noStoreHeaders = { "cache-control": "no-store" };

function optionalEnum(value: unknown, allowed: Set<string>) {
  return typeof value === "string" && allowed.has(value) ? value : undefined;
}

function optionalBoundedInteger(value: unknown, maximum: number) {
  if (value === undefined || value === null) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= maximum ? parsed : null;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 4_000) return Response.json({ error: "Feedback is too large." }, { status: 413, headers: noStoreHeaders });

  try {
    const payload = await request.json() as Record<string, unknown>;
    const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : "";
    const category = typeof payload.category === "string" ? payload.category : "";
    const rating = Number(payload.rating);
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    const difficulty = optionalEnum(payload.difficulty, DIFFICULTIES);
    const topicId = optionalBoundedInteger(payload.topicId, 500);
    const worldNumber = optionalBoundedInteger(payload.worldNumber, 100);
    if (!/^[a-zA-Z0-9-]{16,64}$/.test(sessionId) || !CATEGORIES.has(category) || !Number.isInteger(rating) || rating < 1 || rating > 5 || !message || message.length > 1_200 || topicId === null || worldNumber === null) {
      return Response.json({ error: "Check the rating and feedback message." }, { status: 400, headers: noStoreHeaders });
    }

    const environment = getCloudflareEnvironment();
    const user = await getClerkUser(request, environment);
    const result = await getAnalyticsRepository().saveFeedback({
      sessionId,
      category,
      rating,
      difficulty,
      message,
      contactAllowed: payload.contactAllowed === true && Boolean(user),
      track: optionalEnum(payload.track, TRACKS),
      pace: optionalEnum(payload.pace, PACES),
      topicId,
      worldNumber,
    }, user?.userId);
    return Response.json({ saved: result === "recorded" }, {
      status: result === "rate_limited" ? 429 : 201,
      headers: noStoreHeaders,
    });
  } catch {
    return Response.json({ error: "Invalid feedback." }, { status: 400, headers: noStoreHeaders });
  }
}
