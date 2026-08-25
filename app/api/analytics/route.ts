import { ANALYTICS_EVENT_NAMES } from "../../analytics-events";
import { getClerkUser } from "../../clerk-auth";
import { getAnalyticsRepository, getCloudflareEnvironment } from "../../../infrastructure/cloudflare/runtime";

export const dynamic = "force-dynamic";

const TRACKS = new Set(["python", "genai", "sql"]);
const PACES = new Set(["beginner", "intermediate", "expert"]);
const EVENTS = new Set<string>(ANALYTICS_EVENT_NAMES);
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
  if (contentLength > 2_000) return Response.json({ error: "Event payload is too large." }, { status: 413, headers: noStoreHeaders });

  try {
    const payload = await request.json() as Record<string, unknown>;
    const eventName = typeof payload.eventName === "string" ? payload.eventName : "";
    const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : "";
    const topicId = optionalBoundedInteger(payload.topicId, 500);
    const worldNumber = optionalBoundedInteger(payload.worldNumber, 100);
    if (!EVENTS.has(eventName) || !/^[a-zA-Z0-9-]{16,64}$/.test(sessionId) || topicId === null || worldNumber === null) {
      return Response.json({ error: "Invalid analytics event." }, { status: 400, headers: noStoreHeaders });
    }

    const environment = getCloudflareEnvironment();
    const user = await getClerkUser(request, environment);
    const result = await getAnalyticsRepository().recordEvent({
      eventName,
      sessionId,
      track: optionalEnum(payload.track, TRACKS),
      pace: optionalEnum(payload.pace, PACES),
      topicId,
      worldNumber,
      required: payload.required === true,
    }, user?.userId);
    return Response.json({ recorded: result === "recorded" }, {
      status: result === "rate_limited" ? 429 : 202,
      headers: noStoreHeaders,
    });
  } catch {
    return Response.json({ error: "Invalid analytics event." }, { status: 400, headers: noStoreHeaders });
  }
}
