export type LearningView = "tracks" | "paces" | "roadmap" | "quest";
export type LearningTrackId = "python" | "genai" | "sql";
export type LearningPaceId = "beginner" | "intermediate" | "expert";

export type LearningRoute =
  | { kind: "tracks" }
  | { kind: "paces"; trackId: LearningTrackId }
  | { kind: "roadmap"; trackId: LearningTrackId; paceId: LearningPaceId }
  | { kind: "lesson"; trackId: LearningTrackId; paceId: LearningPaceId; questId: number }
  | { kind: "daily-quest"; trackId: LearningTrackId; paceId: LearningPaceId }
  | { kind: "profile" };

const TRACK_IDS = new Set<LearningTrackId>(["python", "genai", "sql"]);
const PACE_IDS = new Set<LearningPaceId>(["beginner", "intermediate", "expert"]);

const isTrackId = (value: string | undefined): value is LearningTrackId => Boolean(value && TRACK_IDS.has(value as LearningTrackId));
const isPaceId = (value: string | undefined): value is LearningPaceId => Boolean(value && PACE_IDS.has(value as LearningPaceId));

export function parseLearningLocation(location: string): LearningRoute {
  const url = new URL(location, "https://codecraft.local");
  const segments = url.pathname.split("/").filter(Boolean).map((segment) => decodeURIComponent(segment));
  const trackId = url.searchParams.get("track") ?? undefined;
  const paceId = url.searchParams.get("pace") ?? undefined;

  if (segments.length === 0) return { kind: "tracks" };
  if (segments.length === 1 && segments[0] === "profile") return { kind: "profile" };

  if (segments.length === 2 && segments[0] === "tracks" && isTrackId(segments[1])) {
    return { kind: "paces", trackId: segments[1] };
  }

  if (segments.length === 3 && segments[0] === "roadmap" && isTrackId(segments[1]) && isPaceId(segments[2])) {
    return { kind: "roadmap", trackId: segments[1], paceId: segments[2] };
  }

  if (segments.length === 4 && segments[0] === "lesson" && isTrackId(segments[1]) && isPaceId(segments[2])) {
    const questId = Number.parseInt(segments[3], 10);
    if (Number.isSafeInteger(questId) && questId > 0) return { kind: "lesson", trackId: segments[1], paceId: segments[2], questId };
  }

  if (segments.length === 3 && segments[0] === "daily-quest" && isTrackId(segments[1]) && isPaceId(segments[2])) {
    return { kind: "daily-quest", trackId: segments[1], paceId: segments[2] };
  }

  if (segments.length === 1 && segments[0] === "tracks") {
    if (isTrackId(trackId) && isPaceId(paceId)) return { kind: "roadmap", trackId, paceId };
    if (isTrackId(trackId)) return { kind: "paces", trackId };
    return { kind: "tracks" };
  }

  if (segments.length === 1 && segments[0] === "lesson" && isTrackId(trackId) && isPaceId(paceId)) {
    const questId = Number.parseInt(url.searchParams.get("quest") ?? "", 10);
    if (Number.isSafeInteger(questId) && questId > 0) return { kind: "lesson", trackId, paceId, questId };
  }

  if (segments.length === 1 && segments[0] === "daily-quest" && isTrackId(trackId) && isPaceId(paceId)) {
    return { kind: "daily-quest", trackId, paceId };
  }

  return { kind: "tracks" };
}

export function learningPathForRoute(route: LearningRoute) {
  if (route.kind === "tracks") return "/tracks";
  if (route.kind === "paces") return `/tracks/${route.trackId}`;
  if (route.kind === "roadmap") return `/roadmap/${route.trackId}/${route.paceId}`;
  if (route.kind === "lesson") return `/lesson/${route.trackId}/${route.paceId}/${route.questId}`;
  if (route.kind === "daily-quest") return `/daily-quest/${route.trackId}/${route.paceId}`;
  return "/profile";
}

export function learningPathForState({ view, trackId, paceId, questId, dailyQuestMode, profileOpen }: {
  view: LearningView;
  trackId: LearningTrackId;
  paceId: LearningPaceId;
  questId: number;
  dailyQuestMode: boolean;
  profileOpen: boolean;
}) {
  if (profileOpen) return "/profile";
  if (view === "tracks") return "/tracks";
  if (view === "paces") return `/tracks/${trackId}`;
  if (view === "roadmap") return `/roadmap/${trackId}/${paceId}`;
  if (dailyQuestMode) return `/daily-quest/${trackId}/${paceId}`;
  return `/lesson/${trackId}/${paceId}/${questId}`;
}
