export const ANALYTICS_EVENT_NAMES = [
  "session_started",
  "track_selected",
  "pace_selected",
  "journey_resumed",
  "tutorial_completed",
  "lesson_started",
  "checkpoint_passed",
  "checkpoint_failed",
  "lab_started",
  "lab_run_passed",
  "lab_run_failed",
  "lab_completed",
  "world_power_used",
  "world_completed",
  "daily_quest_started",
  "daily_quest_completed",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
export type AnalyticsTrack = "python" | "genai" | "sql";
export type AnalyticsPace = "beginner" | "intermediate" | "expert";
export type AnalyticsContext = {
  track?: AnalyticsTrack;
  pace?: AnalyticsPace;
  topicId?: number;
  worldNumber?: number;
  required?: boolean;
};

const SESSION_KEY = "codecraft-analytics-session-v1";

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") return "";
  const saved = window.localStorage.getItem(SESSION_KEY);
  if (saved && /^[a-zA-Z0-9-]{16,64}$/.test(saved)) return saved;
  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

export async function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  context: AnalyticsContext = {},
  getToken?: () => Promise<string | null>,
) {
  try {
    const sessionId = getAnalyticsSessionId();
    if (!sessionId) return;
    const token = getToken ? await getToken().catch(() => null) : null;
    await fetch("/api/analytics", {
      method: "POST",
      keepalive: true,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ eventName, sessionId, ...context }),
    });
  } catch {
    // Analytics must never interrupt learning.
  }
}
