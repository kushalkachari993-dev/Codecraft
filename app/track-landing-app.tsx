"use client";

import { SignInButton, useAuth, useUser } from "@clerk/react";
import { useEffect, useRef } from "react";
import { trackAnalyticsEvent } from "./analytics-events";
import TrackPickerView from "./components/track-picker-view";
import { useJourney, type JourneyPaceId, type JourneyPreferences, type JourneyTrackId } from "./hooks/use-journey";
import { useProgressSync } from "./hooks/use-progress-sync";
import { learningPathForRoute, parseLearningLocation } from "./navigation";
import { TRACKS, type Track } from "./track-catalog";
import { CLOUD_PATH_TOTAL, getCloudPath } from "./cloud/track";
import { getCloudLessons } from "./cloud/catalog";
import { BACKEND_PATH_TOTAL, getBackendPath } from "./backend/track";
import { getBackendLessons } from "./backend/curriculum";
import { getDailyQuestIndex } from "./daily-quest";

const paceLabel = (pace: JourneyPaceId) => pace[0].toUpperCase() + pace.slice(1);

export default function TrackLandingApp() {
  const analyticsSessionTracked = useRef(false);
  const { getToken, isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useAuth();
  const { user } = useUser();
  const displayName = user?.fullName ?? user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "CodeCraft learner";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const { progress, cloudUser, cloudState } = useProgressSync({
    clerkLoaded: Boolean(clerkLoaded),
    clerkSignedIn: Boolean(clerkSignedIn),
    displayName,
    email,
    getToken,
  });
  const { journey, persistJourney, goalRecommendation, setGoalRecommendation, paceRecommendation } = useJourney(() => undefined);
  const totalBadges = Object.values(progress.completed).reduce((total, ids) => total + ids.length, 0);
  const savedTrack = TRACKS.find((track) => track.id === journey.trackId) ?? TRACKS[0];

  useEffect(() => {
    const current = window.location.pathname + window.location.search;
    const route = parseLearningLocation(current);
    const canonical = learningPathForRoute(route);
    if (window.location.search && canonical !== current) window.location.replace(canonical);
  }, []);

  useEffect(() => {
    if (!clerkLoaded || analyticsSessionTracked.current) return;
    analyticsSessionTracked.current = true;
    void trackAnalyticsEvent("session_started", {}, clerkSignedIn ? getToken : undefined);
  }, [clerkLoaded, clerkSignedIn, getToken]);

  const navigate = (path: string) => window.location.assign(path);

  const selectTrack = (track: Track) => {
    setGoalRecommendation(track.id);
    persistJourney({ ...journey, trackId: track.id });
    navigate(`/tracks/${track.id}`);
  };

  const resolveResumeDestination = (): JourneyPreferences => {
    if (journey.started) return journey;
    const bestProgress = Object.entries(progress.completed)
      .filter(([key, ids]) => key.includes("-") && ids.length > 0)
      .sort((left, right) => right[1].length - left[1].length)[0];
    if (bestProgress) {
      const [trackId, paceId] = bestProgress[0].split("-");
      return {
        trackId: trackId === "genai" || trackId === "sql" || trackId === "cloud" || trackId === "backend" ? trackId : "python",
        paceId: paceId === "intermediate" || paceId === "expert" ? paceId : "beginner",
        started: true,
        tutorialComplete: true,
      };
    }
    return { trackId: goalRecommendation, paceId: paceRecommendation, started: true, tutorialComplete: false };
  };

  const resumeJourney = () => {
    const destination = resolveResumeDestination();
    persistJourney(destination);
    navigate(`/roadmap/${destination.trackId}/${destination.paceId}`);
  };

  const chosenTrackId: JourneyTrackId = journey.started ? journey.trackId : goalRecommendation;
  const dailyTrackId = chosenTrackId;
  const dailyPaceId: JourneyPaceId = journey.started ? journey.paceId : paceRecommendation;
  const dailyTrack = TRACKS.find((track) => track.id === dailyTrackId) ?? TRACKS[0];
  const today = new Date().toISOString().slice(0, 10);
  const dailyCompleted = progress.game.dailyQuestDate === today && progress.game.dailyQuestCompleted;
  const cloudDailyLesson = chosenTrackId === "cloud" ? getCloudLessons(dailyPaceId)[getDailyQuestIndex(today, "cloud", dailyPaceId, CLOUD_PATH_TOTAL)] : undefined;
  const backendDailyLesson = chosenTrackId === "backend" ? getBackendLessons(dailyPaceId)[getDailyQuestIndex(today, "backend", dailyPaceId, BACKEND_PATH_TOTAL)] : undefined;

  return (
    <main className="app-shell track-python">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("/tracks")} aria-label="Open CodeCraft tracks">
          <span className="brand-cube" aria-hidden="true"><i /></span>
          <span>CODECRAFT</span>
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          <button className="active" onClick={() => navigate("/tracks")}>Tracks</button>
          <button onClick={resumeJourney}>Roadmap</button>
          <button className="daily-nav" onClick={() => navigate(`/daily-quest/${dailyTrackId}/${dailyPaceId}`)}>Daily Quest</button>
        </nav>
        <div className="player-stats">
          <button className="stat-chip profile-stat-trigger" onClick={() => navigate("/profile")} aria-label={`Open profile, ${progress.xp} XP`}><b>◆</b> {progress.xp} XP</button>
          <span className="stat-chip badge-count"><b>✦</b> {totalBadges}</span>
          {clerkSignedIn ? (
            <span className={`auth-account ${cloudState}`}>{cloudState === "syncing" ? "Syncing…" : cloudState === "error" ? "Sync error" : cloudState === "synced" ? "Cloud saved" : "Signed in"}</span>
          ) : (
            <SignInButton mode="modal"><button className={`auth-chip ${cloudState}`}>{clerkLoaded ? "Sign in to sync" : "Checking…"}</button></SignInButton>
          )}
        </div>
      </header>
      <TrackPickerView
        journey={journey}
        totalBadges={totalBadges}
        savedTrackLabel={journey.trackId === "cloud" ? "Cloud Engineering" : journey.trackId === "backend" ? "Backend Engineering" : savedTrack.label}
        savedPaceLabel={journey.trackId === "cloud" ? getCloudPath(journey.paceId).title : journey.trackId === "backend" ? getBackendPath(journey.paceId).title : paceLabel(journey.paceId)}
        dailyQuest={{
          completed: dailyCompleted,
          title: cloudDailyLesson?.title ?? backendDailyLesson?.title ?? "Today’s Relay Challenge",
          trackLabel: chosenTrackId === "cloud" ? "Cloud Engineering" : chosenTrackId === "backend" ? "Backend Engineering" : dailyTrack.label,
          paceLabel: paceLabel(dailyPaceId),
          streak: progress.game.dailyQuestStreak,
          onOpen: () => navigate(`/daily-quest/${dailyTrackId}/${dailyPaceId}`),
        }}
        progress={progress}
        recommendation={goalRecommendation}
        cloudUser={cloudUser}
        onResume={resumeJourney}
        onRecommend={setGoalRecommendation}
        onSelectTrack={selectTrack}
      />
    </main>
  );
}
