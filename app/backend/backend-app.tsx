"use client";

import { SignInButton, useAuth, useUser } from "@clerk/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CloudLab from "../cloud/cloud-lab";
import { DAILY_QUEST_XP, getDailyQuestIndex } from "../daily-quest";
import { loadJourneyPreferences } from "../hooks/use-journey";
import { useProgressSync } from "../hooks/use-progress-sync";
import { getBackendLesson } from "./curriculum";
import { backendCompleted, backendLessonXp, completeBackendDailyQuest, completeBackendLesson, isBackendLessonUnlocked } from "./progress";
import { BACKEND_PATH_TOTAL, getBackendPath, getBackendWorlds, type BackendPaceId } from "./track";
import BackendOverview from "./backend-overview";
import BackendPacePicker from "./backend-pace-picker";

export const backendLessonPath = (paceId: BackendPaceId, id: number) => "/lesson/backend/" + paceId + "/" + id;

export default function BackendApp({ paceId = "beginner", lessonId, roadmap = false, daily = false }: { paceId?: BackendPaceId; lessonId?: number; roadmap?: boolean; daily?: boolean }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { progress, persistProgress, progressReady, cloudState } = useProgressSync({
    clerkLoaded: Boolean(isLoaded), clerkSignedIn: Boolean(isSignedIn), getToken,
    displayName: user?.fullName ?? user?.firstName ?? "CodeCraft learner",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
  });
  const [mounted, setMounted] = useState(false);
  const [paceRecommendation, setPaceRecommendation] = useState<BackendPaceId>("beginner");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
      const savedJourney = loadJourneyPreferences();
      if (savedJourney.trackId === "backend") setPaceRecommendation(savedJourney.paceId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const ready = mounted && progressReady;
  const path = getBackendPath(paceId);
  const completed = ready ? backendCompleted(progress, paceId) : [];
  const nextId = Math.min(completed.length + 1, BACKEND_PATH_TOTAL);
  const today = new Date().toISOString().slice(0, 10);
  const dailyLessonId = getDailyQuestIndex(today, "backend", paceId, BACKEND_PATH_TOTAL) + 1;
  const effectiveLessonId = daily ? dailyLessonId : lessonId;
  const lesson = effectiveLessonId === undefined ? undefined : getBackendLesson(paceId, effectiveLessonId);
  const world = getBackendWorlds(paceId).find((entry) => lesson && lesson.id >= entry.start && lesson.id <= entry.end);
  const unlocked = ready && lesson && (daily || isBackendLessonUnlocked(progress, lesson.id, paceId));
  const dailyCompleted = ready && progress.game.dailyQuestDate === today && progress.game.dailyQuestCompleted;
  const totalBadges = ready ? Object.values(progress.completed).reduce((total, ids) => total + ids.length, 0) : 0;
  const level = ready ? Math.floor(Math.max(0, progress.xp - 120) / 100) + 1 : 1;
  const avatarId = ready ? progress.game.avatarId : "relay-scout";
  const avatarGlyph = avatarId === "signal-mage" ? "✦" : avatarId === "core-runner" ? "◆" : "◇";
  const navigate = (destination: string) => window.location.assign(destination);

  const selectPace = (selectedPace: BackendPaceId) => {
    window.localStorage.setItem("codecraft-journey-v1", JSON.stringify({
      ...loadJourneyPreferences(), trackId: "backend", paceId: selectedPace, started: true, tutorialComplete: true,
    }));
    navigate("/roadmap/backend/" + selectedPace);
  };

  const saveCompletion = () => {
    if (!lesson || !ready) throw new Error("Your saved progress is still loading.");
    persistProgress(daily ? completeBackendDailyQuest(progress, paceId, lesson.id) : completeBackendLesson(progress, lesson.id, paceId));
    window.localStorage.setItem("codecraft-journey-v1", JSON.stringify({
      ...loadJourneyPreferences(), trackId: "backend", paceId, started: true, tutorialComplete: true,
    }));
  };

  return (
    <main className="app-shell track-python cloud-app backend-app">
      <a className="cloud-skip" href="#backend-content">Skip to learning content</a>
      <header className="topbar">
        <button className="brand" onClick={() => navigate("/tracks")} aria-label="Open CodeCraft tracks"><span className="brand-cube" aria-hidden="true"><i /></span><span>CODECRAFT</span></button>
        <nav className="main-nav" aria-label="Main navigation">
          <button onClick={() => navigate("/tracks")}>Tracks</button>
          <button className={!lessonId && !roadmap && !daily ? "active" : ""} onClick={() => navigate("/tracks/backend")}>Backend Paths</button>
          <button className={roadmap ? "active" : ""} onClick={() => navigate("/roadmap/backend/" + paceId)}>Roadmap</button>
          <button className={Boolean(lessonId) && !daily ? "active" : ""} disabled={!ready} onClick={() => navigate(backendLessonPath(paceId, nextId))}>Quest</button>
          <button className={daily ? "active daily-nav" : "daily-nav"} onClick={() => navigate("/daily-quest/backend/" + (!lessonId && !roadmap ? paceRecommendation : paceId))}>Daily Quest</button>
        </nav>
        <div className="player-stats">
          <button className="stat-chip profile-stat-trigger" onClick={() => navigate("/profile")} aria-label="Open profile"><b>◆</b> {ready ? progress.xp : 120} XP</button>
          <span className="stat-chip badge-count"><b>✦</b> {totalBadges}</span>
          <button className={"avatar " + avatarId} onClick={() => navigate("/profile")} aria-label={"Open profile, level " + level}>{avatarGlyph}<small>LV {level}</small></button>
          {isSignedIn ? <span className={"auth-account " + cloudState} role="status">{cloudState === "synced" ? "Cloud saved" : cloudState === "syncing" ? "Syncing…" : cloudState === "error" ? "Sync error" : "Signed in"}</span> : <SignInButton mode="modal"><button className={"auth-chip " + cloudState}>{isLoaded ? "Sign in to sync" : "Checking…"}</button></SignInButton>}
        </div>
      </header>
      {effectiveLessonId !== undefined ? (
        <section className="lesson-page" id="backend-content">
          <div className="lesson-bar">
            <button onClick={() => navigate("/roadmap/backend/" + paceId)}>← Roadmap</button>
            <div><span>{daily ? "DAILY QUEST · " + path.title.toUpperCase() : path.title.toUpperCase() + " · " + (world ? "WORLD " + world.id : "SERVICE FOUNDRY")}</span><strong>{lesson?.title ?? "Lesson not found"}</strong></div>
            <div className="lesson-progress" role="progressbar" aria-label={daily ? "Daily Quest completion" : path.title + " progress"} aria-valuemin={0} aria-valuemax={daily ? 1 : BACKEND_PATH_TOTAL} aria-valuenow={daily ? dailyCompleted ? 1 : 0 : completed.length}><i style={{ width: daily ? dailyCompleted ? "100%" : "50%" : completed.length / BACKEND_PATH_TOTAL * 100 + "%" }} /></div>
            <span>{daily ? "UTC · +" + DAILY_QUEST_XP + " XP" : lesson ? lesson.id + "/" + BACKEND_PATH_TOTAL + " · " + backendLessonXp(lesson.id, paceId) + " XP" : BACKEND_PATH_TOTAL + " LESSONS"}</span>
          </div>
          {!lesson ? <div className="cloud-gate"><h1>Lesson not found</h1><Link href="/tracks/backend">Explore Backend Engineering paths →</Link></div> : !ready ? <p className="view-loading" role="status">Loading your local learning progress…</p> : !unlocked ? (
            <section className="cloud-gate"><h1>This lesson is locked</h1><p>Complete lesson {nextId}, including its simulation, to continue in order.</p><Link className="curriculum-next cloud-button" href={backendLessonPath(paceId, nextId)}>Continue lesson {nextId} →</Link></section>
          ) : <>{daily && <section className={"daily-quest-brief " + (dailyCompleted ? "complete" : "")}><div className="daily-quest-emblem" aria-hidden="true">☼<span>DQ</span></div><div><p>TODAY&apos;S BACKEND RELAY CHALLENGE</p><h1>{lesson.title}</h1><span>Pass the architecture checkpoint, investigate the evidence, and repair both static backend artifacts.</span><div><b>Backend Engineering</b><b>{path.label}</b><b>15–25 min</b></div></div><aside><small>REWARD</small><strong>+{DAILY_QUEST_XP} XP</strong><span>{progress.game.dailyQuestStreak} day streak</span><i>{dailyCompleted ? "REWARD CLAIMED" : "AVAILABLE TODAY"}</i></aside></section>}<CloudLab key={(daily ? "daily-" : "") + "backend-" + paceId + "-" + lesson.id} trackKind="backend" paceId={paceId} lesson={lesson} completed={daily ? dailyCompleted : completed.includes(lesson.id)} daily={daily} onComplete={saveCompletion} /></>}
        </section>
      ) : roadmap ? <BackendOverview paceId={paceId} progress={progress} ready={ready} /> : <BackendPacePicker progress={progress} ready={ready} recommendation={paceRecommendation} onRecommend={setPaceRecommendation} onSelect={selectPace} />}
    </main>
  );
}
