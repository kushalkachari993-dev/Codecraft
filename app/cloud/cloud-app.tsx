"use client";

import { SignInButton, useAuth, useUser } from "@clerk/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DAILY_QUEST_XP, getDailyQuestIndex } from "../daily-quest";
import { useProgressSync } from "../hooks/use-progress-sync";
import { loadJourneyPreferences } from "../hooks/use-journey";
import { getCloudLesson } from "./catalog";
import { CLOUD_PATH_TOTAL, getCloudPath, getCloudWorlds, type CloudPaceId } from "./track";
import { cloudCompleted, cloudLessonXp, completeCloudDailyQuest, completeCloudLesson, isCloudLessonUnlocked } from "./progress";
import CloudLab from "./cloud-lab";
import CloudOverview from "./cloud-overview";
import CloudPacePicker from "./cloud-pace-picker";

export const cloudLessonPath = (paceId: CloudPaceId, id: number) => "/lesson/cloud/" + paceId + "/" + id;

export default function CloudApp({ paceId = "beginner", lessonId, roadmap = false, daily = false }: { paceId?: CloudPaceId; lessonId?: number; roadmap?: boolean; daily?: boolean }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { progress, persistProgress, progressReady, cloudState } = useProgressSync({
    clerkLoaded: Boolean(isLoaded), clerkSignedIn: Boolean(isSignedIn), getToken,
    displayName: user?.fullName ?? user?.firstName ?? "CodeCraft learner",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
  });
  const [mounted, setMounted] = useState(false);
  const [paceRecommendation, setPaceRecommendation] = useState<CloudPaceId>("beginner");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
      const savedJourney = loadJourneyPreferences();
      if (savedJourney.trackId === "cloud") setPaceRecommendation(savedJourney.paceId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const ready = mounted && progressReady;
  const path = getCloudPath(paceId);
  const completed = ready ? cloudCompleted(progress, paceId) : [];
  const nextId = Math.min(completed.length + 1, CLOUD_PATH_TOTAL);
  const today = new Date().toISOString().slice(0, 10);
  const dailyLessonId = getDailyQuestIndex(today, "cloud", paceId, CLOUD_PATH_TOTAL) + 1;
  const effectiveLessonId = daily ? dailyLessonId : lessonId;
  const lesson = effectiveLessonId === undefined ? undefined : getCloudLesson(paceId, effectiveLessonId);
  const world = getCloudWorlds(paceId).find((entry) => lesson && lesson.id >= entry.start && lesson.id <= entry.end);
  const unlocked = ready && lesson && (daily || isCloudLessonUnlocked(progress, lesson.id, paceId));
  const dailyCompleted = ready && progress.game.dailyQuestDate === today && progress.game.dailyQuestCompleted;
  const totalBadges = ready ? Object.values(progress.completed).reduce((total, ids) => total + ids.length, 0) : 0;
  const level = ready ? Math.floor(Math.max(0, progress.xp - 120) / 100) + 1 : 1;
  const avatarId = ready ? progress.game.avatarId : "relay-scout";
  const avatarGlyph = avatarId === "signal-mage" ? "✦" : avatarId === "core-runner" ? "◆" : "◇";
  const navigate = (path: string) => window.location.assign(path);

  const selectPace = (selectedPace: CloudPaceId) => {
    window.localStorage.setItem("codecraft-journey-v1", JSON.stringify({
      ...loadJourneyPreferences(), trackId: "cloud", paceId: selectedPace, started: true, tutorialComplete: true,
    }));
    navigate("/roadmap/cloud/" + selectedPace);
  };

  const saveCompletion = () => {
    if (!lesson || !ready) throw new Error("Your saved progress is still loading.");
    persistProgress(daily ? completeCloudDailyQuest(progress, paceId, lesson.id) : completeCloudLesson(progress, lesson.id, paceId));
    window.localStorage.setItem("codecraft-journey-v1", JSON.stringify({
      ...loadJourneyPreferences(), trackId: "cloud", paceId, started: true, tutorialComplete: true,
    }));
  };

  return (
    <main className="app-shell track-python cloud-app">
      <a className="cloud-skip" href="#cloud-content">Skip to learning content</a>
      <header className="topbar">
        <button className="brand" onClick={() => navigate("/tracks")} aria-label="Open CodeCraft tracks"><span className="brand-cube" aria-hidden="true"><i /></span><span>CODECRAFT</span></button>
        <nav className="main-nav" aria-label="Main navigation">
          <button onClick={() => navigate("/tracks")}>Tracks</button>
          <button className={!lessonId && !roadmap && !daily ? "active" : ""} onClick={() => navigate("/tracks/cloud")}>Cloud Paths</button>
          <button className={roadmap ? "active" : ""} onClick={() => navigate("/roadmap/cloud/" + paceId)}>Roadmap</button>
          <button className={Boolean(lessonId) && !daily ? "active" : ""} disabled={!ready} onClick={() => navigate(cloudLessonPath(paceId, nextId))}>Quest</button>
          <button className={daily ? "active daily-nav" : "daily-nav"} onClick={() => navigate("/daily-quest/cloud/" + (!lessonId && !roadmap ? paceRecommendation : paceId))}>Daily Quest</button>
        </nav>
        <div className="player-stats">
          <button className="stat-chip profile-stat-trigger" onClick={() => navigate("/profile")} aria-label="Open profile"><b>◆</b> {ready ? progress.xp : 120} XP</button>
          <span className="stat-chip badge-count"><b>✦</b> {totalBadges}</span>
          <button className={"avatar " + avatarId} onClick={() => navigate("/profile")} aria-label={"Open profile, level " + level}>{avatarGlyph}<small>LV {level}</small></button>
          {isSignedIn ? <span className={"auth-account " + cloudState} role="status">{cloudState === "synced" ? "Cloud saved" : cloudState === "syncing" ? "Syncing…" : cloudState === "error" ? "Sync error" : "Signed in"}</span> : <SignInButton mode="modal"><button className={"auth-chip " + cloudState}>{isLoaded ? "Sign in to sync" : "Checking…"}</button></SignInButton>}
        </div>
      </header>
      {effectiveLessonId !== undefined ? (
        <section className="lesson-page" id="cloud-content">
          <div className="lesson-bar">
            <button onClick={() => navigate("/roadmap/cloud/" + paceId)}>← Roadmap</button>
            <div><span>{daily ? "DAILY QUEST · " + path.title.toUpperCase() : path.title.toUpperCase() + " · " + (world ? "WORLD " + world.id : "CLOUD CITADEL")}</span><strong>{lesson?.title ?? "Lesson not found"}</strong></div>
            <div className="lesson-progress" role="progressbar" aria-label={daily ? "Daily Quest completion" : path.title + " progress"} aria-valuemin={0} aria-valuemax={daily ? 1 : CLOUD_PATH_TOTAL} aria-valuenow={daily ? dailyCompleted ? 1 : 0 : completed.length}><i style={{ width: daily ? dailyCompleted ? "100%" : "50%" : completed.length / CLOUD_PATH_TOTAL * 100 + "%" }} /></div>
            <span>{daily ? "UTC · +" + DAILY_QUEST_XP + " XP" : lesson ? lesson.id + "/" + CLOUD_PATH_TOTAL + " · " + cloudLessonXp(lesson.id, paceId) + " XP" : CLOUD_PATH_TOTAL + " LESSONS"}</span>
          </div>
          {!lesson ? <div className="cloud-gate"><h1>Lesson not found</h1><Link href="/tracks/cloud">Explore Cloud Engineering paths →</Link></div> : !ready ? <p className="view-loading" role="status">Loading your local learning progress…</p> : !unlocked ? (
            <section className="cloud-gate"><h1>This lesson is locked</h1><p>Complete lesson {nextId}, including its simulation, to continue in order.</p><Link className="curriculum-next cloud-button" href={cloudLessonPath(paceId, nextId)}>Continue lesson {nextId} →</Link></section>
          ) : <>{daily && <section className={"daily-quest-brief " + (dailyCompleted ? "complete" : "")}><div className="daily-quest-emblem" aria-hidden="true">☼<span>DQ</span></div><div><p>TODAY&apos;S CLOUD RELAY CHALLENGE</p><h1>{lesson.title}</h1><span>Pass the knowledge checkpoint and repair the injected failure. The first completion today awards XP and extends your streak.</span><div><b>Cloud Engineering</b><b>{path.label}</b><b>10–20 min</b></div></div><aside><small>REWARD</small><strong>+{DAILY_QUEST_XP} XP</strong><span>{progress.game.dailyQuestStreak} day streak</span><i>{dailyCompleted ? "REWARD CLAIMED" : "AVAILABLE TODAY"}</i></aside></section>}<CloudLab key={(daily ? "daily-" : "") + paceId + "-" + lesson.id} paceId={paceId} lesson={lesson} completed={daily ? dailyCompleted : completed.includes(lesson.id)} daily={daily} onComplete={saveCompletion} /></>}
        </section>
      ) : roadmap ? <CloudOverview paceId={paceId} progress={progress} ready={ready} /> : <CloudPacePicker progress={progress} ready={ready} recommendation={paceRecommendation} onRecommend={setPaceRecommendation} onSelect={selectPace} />}
    </main>
  );
}
