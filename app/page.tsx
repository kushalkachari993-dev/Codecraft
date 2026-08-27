"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { SignInButton, useAuth, useClerk, useUser } from "@clerk/react";
import { PYTHON_PACES, type PythonPaceId } from "./python-curriculum";
import { GENAI_PACES, buildGenAILab, validateGenAILab, type GenAIPaceId } from "./genai-curriculum";
import { SQL_PACES, type SQLPaceId } from "./sql-curriculum";
import { executeLab } from "./execution/client";
import { buildPythonChallenge, buildSQLChallenge } from "./challenges";
import { getLessonEnrichment } from "./authored-lessons";
import { getRoundTwoLessonEnrichment } from "./authored-lessons-round2";
import { getRoundThreeLessonEnrichment } from "./authored-lessons-round3";
import { getRoundFourLessonEnrichment } from "./authored-lessons-round4";
import { getRoundFiveLessonEnrichment } from "./authored-lessons-round5";
import { getRoundSixLessonEnrichment } from "./authored-lessons-round6";
import { getRoundSevenLessonEnrichment } from "./authored-lessons-round7";
import { getRoundEightLessonEnrichment } from "./authored-lessons-round8";
import { getRoundNineLessonEnrichment } from "./authored-lessons-round9";
import { getRoundTenLessonEnrichment } from "./authored-lessons-round10";
import { getRoundElevenLessonEnrichment } from "./authored-lessons-round11";
import { getRoundTwelveLessonEnrichment } from "./authored-lessons-round12";
import { getRoundThirteenLessonEnrichment } from "./authored-lessons-round13";
import { getRoundFourteenLessonEnrichment } from "./authored-lessons-round14";
import { getRoundFifteenLessonEnrichment } from "./authored-lessons-round15";
import { getRoundSixteenLessonEnrichment } from "./authored-lessons-round16";
import { getRoundSeventeenLessonEnrichment } from "./authored-lessons-round17";
import type { ExecutionResult } from "./execution/types";
import { type AvatarId, type PlayerProgress } from "./progress";
import BetaFeedback from "./beta-feedback";
import { trackAnalyticsEvent, type AnalyticsContext, type AnalyticsEventName } from "./analytics-events";
import { DAILY_QUEST_XP, getDailyQuestStreak } from "./daily-quest";
import { useJourney } from "./hooks/use-journey";
import { useProgressSync } from "./hooks/use-progress-sync";
import { useProfile } from "./hooks/use-profile";
import { useLabRuntime } from "./hooks/use-lab-runtime";
import { useDailyQuest } from "./hooks/use-daily-quest";
import ProfilePanel from "./components/profile-panel";
import WorldMap from "./components/world-map";
import { ExampleLessonView, LabWorkspaceView, QuizLessonView, TheoryLessonView } from "./components/lesson-stage-views";
import { PacePickerView, TrackPickerView } from "./components/journey-views";
import {
  AVATARS,
  FirstRunChecklist,
  GENAI_PACE_MODULES,
  PYTHON_PACE_MODULES,
  SQL_PACE_MODULES,
  TRACKS,
  buildGenAIPaceQuests,
  buildGenAITheory,
  buildPythonPaceQuests,
  buildPythonTheory,
  buildQuiz,
  buildSQLPaceQuests,
  buildSQLTheory,
  getGenAIModule,
  getPythonModule,
  getSQLModule,
  getWorldMechanic,
  type Quest,
  type Track,
} from "./codecraft-catalog";

type View = "tracks" | "paces" | "roadmap" | "quest";
type LessonStage = "theory" | "example" | "quiz" | "bonus";

export default function Home() {
  const { getToken, isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useAuth();
  const clerk = useClerk();
  const { user: clerkProfile } = useUser();
  const clerkDisplayName = clerkProfile?.fullName
    ?? clerkProfile?.firstName
    ?? clerkProfile?.primaryEmailAddress?.emailAddress
    ?? "CodeCraft learner";
  const clerkEmail = clerkProfile?.primaryEmailAddress?.emailAddress ?? "";
  const [view, setView] = useState<View>("tracks");
  const [activeTrackId, setActiveTrackId] = useState<Track["id"]>("python");
  const [activePythonPaceId, setActivePythonPaceId] = useState<PythonPaceId>("beginner");
  const [activeGenAIPaceId, setActiveGenAIPaceId] = useState<GenAIPaceId>("beginner");
  const [activeSQLPaceId, setActiveSQLPaceId] = useState<SQLPaceId>("beginner");
  const [hasChosenPythonPace, setHasChosenPythonPace] = useState(false);
  const [hasChosenGenAIPace, setHasChosenGenAIPace] = useState(false);
  const [hasChosenSQLPace, setHasChosenSQLPace] = useState(false);
  const [activeQuestId, setActiveQuestId] = useState(1);
  const [lessonStage, setLessonStage] = useState<LessonStage>("theory");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<"idle" | "incomplete" | "passed" | "failed">("idle");
  const analyticsSessionTracked = useRef(false);
  const [storyStep, setStoryStep] = useState(0);
  const [gameToast, setGameToast] = useState("");
  const [firstWorldCelebration, setFirstWorldCelebration] = useState(false);
  const [worldFeedbackPrompt, setWorldFeedbackPrompt] = useState(false);
  const [worldPowerHint, setWorldPowerHint] = useState("");
  const [eliminatedQuizOptions, setEliminatedQuizOptions] = useState<Record<number, number[]>>({});

  const {
    code, setCode, status, setStatus, terminal, setTerminal, sceneStep, setSceneStep,
    executionResult, setExecutionResult, executionPhase, setExecutionPhase,
    runtimeReadiness, updateRuntimeReadiness, clearRun, startRun, isCurrentRun,
    finishRun, warmExecutionRuntime, stopExecution: stopRuntimeExecution,
  } = useLabRuntime(buildPythonPaceQuests("beginner")[0].starterCode);
  const { progress, persistProgress, cloudUser, cloudState } = useProgressSync({
    clerkLoaded: Boolean(clerkLoaded),
    clerkSignedIn: Boolean(clerkSignedIn),
    displayName: clerkDisplayName,
    email: clerkEmail,
    getToken,
  });
  const {
    journey, persistJourney, goalRecommendation, setGoalRecommendation,
    paceRecommendation, setPaceRecommendation, tutorialOpen, setTutorialOpen,
    tutorialStep, setTutorialStep,
  } = useJourney((savedJourney) => {
    if (!savedJourney.started) return;
    setActiveTrackId(savedJourney.trackId);
    if (savedJourney.trackId === "python") {
      setActivePythonPaceId(savedJourney.paceId);
      setHasChosenPythonPace(true);
    } else if (savedJourney.trackId === "genai") {
      setActiveGenAIPaceId(savedJourney.paceId);
      setHasChosenGenAIPace(true);
    } else {
      setActiveSQLPaceId(savedJourney.paceId);
      setHasChosenSQLPace(true);
    }
  });
  const {
    profileOpen, openProfile, closeProfile, editingName, beginNameEdit, cancelNameEdit,
    firstNameDraft, setFirstNameDraft, lastNameDraft, setLastNameDraft,
    nameSaveState, nameError, saveProfileName, savedSubmissions, submissionsState,
  } = useProfile({
    signedIn: Boolean(clerkSignedIn),
    firstName: clerkProfile?.firstName ?? "",
    lastName: clerkProfile?.lastName ?? "",
    getToken,
    updateName: clerkProfile ? async (firstName, lastName) => {
      await clerkProfile.update({ firstName, lastName });
      await clerkProfile.reload();
    } : null,
  });

  const activeTrack = TRACKS.find((track) => track.id === activeTrackId) ?? TRACKS[0];
  const activePythonPace = PYTHON_PACES.find((pace) => pace.id === activePythonPaceId) ?? PYTHON_PACES[0];
  const activeGenAIPace = GENAI_PACES.find((pace) => pace.id === activeGenAIPaceId) ?? GENAI_PACES[0];
  const activeSQLPace = SQL_PACES.find((pace) => pace.id === activeSQLPaceId) ?? SQL_PACES[0];
  const isPacedTrack = activeTrack.id === "python" || activeTrack.id === "genai" || activeTrack.id === "sql";
  const activePaces = activeTrack.id === "sql" ? SQL_PACES : activeTrack.id === "genai" ? GENAI_PACES : PYTHON_PACES;
  const activePaceId = activeTrack.id === "sql" ? activeSQLPaceId : activeTrack.id === "genai" ? activeGenAIPaceId : activePythonPaceId;
  const activePace = activeTrack.id === "sql" ? activeSQLPace : activeTrack.id === "genai" ? activeGenAIPace : activePythonPace;
  const activeModules = activeTrack.id === "sql" ? SQL_PACE_MODULES[activeSQLPaceId] : activeTrack.id === "genai" ? GENAI_PACE_MODULES[activeGenAIPaceId] : PYTHON_PACE_MODULES[activePythonPaceId];
  const hasChosenActivePace = activeTrack.id === "sql" ? hasChosenSQLPace : activeTrack.id === "genai" ? hasChosenGenAIPace : hasChosenPythonPace;
  const activeQuests = activeTrack.id === "python"
    ? buildPythonPaceQuests(activePythonPaceId)
    : activeTrack.id === "genai"
      ? buildGenAIPaceQuests(activeGenAIPaceId)
      : buildSQLPaceQuests(activeSQLPaceId);
  const progressKey = isPacedTrack ? `${activeTrack.id}-${activePaceId}` : activeTrack.id;
  const trackCompleted = progress.completed[progressKey] ?? [];
  const trackBonus = progress.bonus[progressKey] ?? [];
  const activeQuest = activeQuests.find((quest) => quest.id === activeQuestId) ?? activeQuests[0];
  const isFinalQuest = activeQuest.id === activeQuests.length;
  const activeTheory = activeTrack.id === "python"
    ? buildPythonTheory(activePythonPace.topics[activeQuest.id - 1])
    : activeTrack.id === "genai"
      ? buildGenAITheory(activeGenAIPace.topics[activeQuest.id - 1])
      : buildSQLTheory(activeSQLPace.topics[activeQuest.id - 1]);
  const activeLessonEnrichment = getLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundTwoLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundThreeLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundFourLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundFiveLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundSixLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundSevenLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundEightLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundNineLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundTenLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundElevenLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundTwelveLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundThirteenLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundFourteenLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundFifteenLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundSixteenLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title)
    ?? getRoundSeventeenLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title);
  const activeQuiz = buildQuiz(activeQuest, activeLessonEnrichment?.quiz ?? null);
  const completedCount = trackCompleted.length;
  const progressPercent = Math.round((completedCount / activeQuests.length) * 100);
  const level = Math.max(1, Math.floor((progress.xp - 120) / 100) + 1);
  const requiredProjectIds = activeModules.reduce<{ end: number; ids: number[] }>((state, module) => {
    const end = state.end + module.size;
    return { end, ids: [...state.ids, end] };
  }, { end: 0, ids: [] }).ids;
  const pendingRequiredProject = activeQuests.find((quest) => requiredProjectIds.includes(quest.id) && trackCompleted.includes(quest.id) && !trackBonus.includes(quest.id));
  const nextQuest = pendingRequiredProject ?? activeQuests.find((quest) => !trackCompleted.includes(quest.id));
  const pathComplete = completedCount === activeQuests.length && requiredProjectIds.every((id) => trackBonus.includes(id));
  const totalBadges = Object.values(progress.completed).reduce((total, ids) => total + ids.length, 0);
  const savedTrack = TRACKS.find((track) => track.id === journey.trackId) ?? TRACKS[0];
  const savedTrackPaces = savedTrack.id === "python" ? PYTHON_PACES : savedTrack.id === "genai" ? GENAI_PACES : SQL_PACES;
  const savedPace = savedTrackPaces.find((pace) => pace.id === journey.paceId) ?? savedTrackPaces[0];
  const profileDisplayName = clerkSignedIn ? clerkDisplayName : "Relay Apprentice";
  const profileInitial = profileDisplayName.trim().charAt(0).toUpperCase() || "R";
  const levelProgress = Math.max(0, progress.xp - 120) % 100;
  const xpToNextLevel = 100 - levelProgress;
  const trackProfileStats = TRACKS.map((track) => {
    const paces = track.id === "python" ? PYTHON_PACES : track.id === "genai" ? GENAI_PACES : SQL_PACES;
    const modules = track.id === "python" ? PYTHON_PACE_MODULES : track.id === "genai" ? GENAI_PACE_MODULES : SQL_PACE_MODULES;
    const completed = paces.reduce((sum, pace) => sum + (progress.completed[`${track.id}-${pace.id}`]?.length ?? 0), 0);
    const total = paces.reduce((sum, pace) => sum + pace.topics.length, 0);
    const projects = paces.reduce((sum, pace) => {
      let worldEnd = 0;
      const projectIds = modules[pace.id].map((module) => (worldEnd += module.size));
      const completedProjects = progress.bonus[`${track.id}-${pace.id}`] ?? [];
      return sum + projectIds.filter((id) => completedProjects.includes(id)).length;
    }, 0);
    return { ...track, completed, total, projects, percent: Math.round((completed / total) * 100) };
  });
  const totalProjects = trackProfileStats.reduce((sum, track) => sum + track.projects, 0);
  const activeAvatar = AVATARS.find((avatar) => avatar.id === progress.game.avatarId) ?? AVATARS[0];
  const activeWorlds = activeModules.reduce<Array<{ name: string; number: number; start: number; end: number; completed: number; size: number; projectComplete: boolean; unlocked: boolean }>>((worlds, module, index) => {
    const start = worlds.length ? worlds[worlds.length - 1].end + 1 : 1;
    const end = start + module.size - 1;
    const completed = trackCompleted.filter((id) => id >= start && id <= end).length;
    const previousWorld = worlds[index - 1];
    worlds.push({ name: module.name, number: index + 1, start, end, completed, size: module.size, projectComplete: trackBonus.includes(end), unlocked: index === 0 || Boolean(previousWorld?.projectComplete) });
    return worlds;
  }, []);
  const currentWorldIndex = Math.max(0, activeWorlds.findIndex((world) => (nextQuest?.id ?? activeQuest.id) >= world.start && (nextQuest?.id ?? activeQuest.id) <= world.end));
  const byteStory = pathComplete
    ? ["Every relay in this path is stable. The next frontier is ready when you are.", "I saved a map of every repair we made. That is what mastery looks like.", "Replay a world, explore another pace, or open your inventory to inspect the recovered artifacts."]
    : pendingRequiredProject
      ? [`${pendingRequiredProject.title} is understood. Now we need to prove it under pressure.`, `The guardian simulation is active in ${activeWorlds[currentWorldIndex]?.name ?? "this world"}. This is your boss mission.`, "Pass every runtime check and the next world gate will open."]
      : [`Signal detected in ${activeWorlds[currentWorldIndex]?.name ?? "this world"}. The next unstable system is ${nextQuest?.title ?? activeQuest.title}.`, "Each topic repairs part of the landscape. Watch the world node energize after your checkpoint.", "Theory gives us the map. Your choices and code bring the realm back online."];
  const {
    session: dailyQuestSession,
    setSession: setDailyQuestSession,
    clearSession: clearDailyQuestSession,
    todayKey,
    dailyQuestMode,
    completedToday: dailyQuestCompletedToday,
    preview: dailyQuestPreview,
  } = useDailyQuest({ progress, quests: activeQuests, trackId: activeTrack.id, paceId: activePaceId });
  const achievements = [
    { id: "first-signal", icon: "◇", name: "First Signal", detail: "Complete your first topic", unlocked: totalBadges >= 1 },
    { id: "badge-hunter", icon: "✦", name: "Badge Hunter", detail: "Recover 10 topic badges", unlocked: totalBadges >= 10 },
    { id: "world-restorer", icon: "◆", name: "World Restorer", detail: "Defeat a world boss", unlocked: totalProjects >= 1 },
    { id: "three-realms", icon: "△", name: "Three Realms", detail: "Study Python, GenAI, and SQL", unlocked: trackProfileStats.every((track) => track.completed > 0) },
    { id: "streak-runner", icon: "↟", name: "Streak Runner", detail: "Reach a 3-day learning streak", unlocked: progress.game.streakDays >= 3 },
    { id: "daily-runner", icon: "☼", name: "Daily Runner", detail: "Complete Daily Quests on 3 consecutive days", unlocked: progress.game.dailyQuestStreak >= 3 },
    { id: "path-master", icon: "◈", name: "Path Master", detail: "Complete an entire learning path", unlocked: Object.entries(progress.completed).some(([key, ids]) => {
      const [trackId, paceId] = key.split("-");
      const paces = trackId === "python" ? PYTHON_PACES : trackId === "genai" ? GENAI_PACES : trackId === "sql" ? SQL_PACES : [];
      const pace = paces.find((item) => item.id === paceId);
      return Boolean(pace && ids.length === pace.topics.length);
    }) },
  ];
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length;
  const focusedModule = activeTrack.id === "python"
    ? getPythonModule(activePythonPaceId, nextQuest?.id ?? activeQuest.id)
    : activeTrack.id === "genai"
      ? getGenAIModule(activeGenAIPaceId, nextQuest?.id ?? activeQuest.id)
      : getSQLModule(activeSQLPaceId, nextQuest?.id ?? activeQuest.id);
  const currentModule = activeTrack.id === "python"
    ? getPythonModule(activePythonPaceId, activeQuest.id)
    : activeTrack.id === "genai"
      ? getGenAIModule(activeGenAIPaceId, activeQuest.id)
      : getSQLModule(activeSQLPaceId, activeQuest.id);
  const mapWorld = activeWorlds[currentWorldIndex] ?? activeWorlds[0];
  const mapWorldMechanic = getWorldMechanic(activeTrack.id, mapWorld?.number ?? 1);
  const mapWorldSideMissions = mapWorld ? trackBonus.filter((id) => id >= mapWorld.start && id < mapWorld.end).length : 0;
  const mapWorldContractProgress = mapWorld
    ? Math.round(((mapWorld.completed + Math.min(1, mapWorldSideMissions) + (mapWorld.projectComplete ? 1 : 0)) / (mapWorld.size + 2)) * 100)
    : 0;
  const activeWorldMechanic = getWorldMechanic(activeTrack.id, currentModule.number);
  const worldPowerClaimKey = [todayKey, progressKey, "world-" + currentModule.number].join(":");
  const worldPowerUsed = progress.game.worldPowerClaims.includes(worldPowerClaimKey);
  const activeWorldSideMissions = trackBonus.filter((id) => id >= currentModule.start && id < currentModule.end).length;
  const activeWorldCharge = Math.min(100, Math.round(((trackCompleted.filter((id) => id >= currentModule.start && id <= currentModule.end).length + (activeWorldSideMissions * 2) + (trackBonus.includes(currentModule.end) ? 3 : 0)) / (currentModule.size + 5)) * 100));
  const isRequiredWorldProject = !dailyQuestMode && activeQuest.id === currentModule.end;
  const activeGenAILab = activeTrack.id === "genai"
    ? buildGenAILab(activeGenAIPace.topics[activeQuest.id - 1], isRequiredWorldProject, currentModule.name)
    : null;
  const activeChallenge = activeTrack.id === "python"
    ? buildPythonChallenge(activePythonPace.topics[activeQuest.id - 1], { required: isRequiredWorldProject, worldName: currentModule.name })
    : activeTrack.id === "sql"
      ? buildSQLChallenge(activeSQLPace.topics[activeQuest.id - 1], { required: isRequiredWorldProject, worldName: currentModule.name })
      : null;
  const bonusXp = dailyQuestMode ? DAILY_QUEST_XP : isRequiredWorldProject ? 75 : 20;
  const sidebarQuests = focusedModule
    ? activeQuests.filter((quest) => quest.id >= focusedModule.start && quest.id <= focusedModule.end)
    : activeQuests;
  const stageOrder: LessonStage[] = ["theory", "example", "quiz", "bonus"];
  const stageIndex = stageOrder.indexOf(lessonStage);
  const isStageComplete = (stage: LessonStage) => {
    if (stage === "bonus") return trackBonus.includes(activeQuest.id);
    return trackCompleted.includes(activeQuest.id);
  };

  const earnedBadges = activeQuests.filter((quest) => trackCompleted.includes(quest.id)).map((quest) => quest.badge);

  const emitAnalytics = (eventName: AnalyticsEventName, override: AnalyticsContext = {}) => {
    void trackAnalyticsEvent(eventName, {
      track: activeTrack.id,
      pace: activePaceId,
      topicId: activeQuest.id,
      worldNumber: currentModule.number,
      required: isRequiredWorldProject,
      ...override,
    }, clerkSignedIn ? getToken : undefined);
  };

  useEffect(() => {
    if (!clerkLoaded || analyticsSessionTracked.current) return;
    analyticsSessionTracked.current = true;
    void trackAnalyticsEvent("session_started", {}, clerkSignedIn ? getToken : undefined);
  }, [clerkLoaded, clerkSignedIn, getToken]);

  useEffect(() => {
    if (!tutorialOpen && !firstWorldCelebration) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setTutorialOpen(false);
      setFirstWorldCelebration(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [firstWorldCelebration, setTutorialOpen, tutorialOpen]);

  const playGameSound = (kind: "select" | "complete" | "boss" = "select") => {
    if (!progress.game.soundEnabled || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = kind === "boss" ? "sawtooth" : "square";
    oscillator.frequency.setValueAtTime(kind === "complete" ? 620 : kind === "boss" ? 180 : 360, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(kind === "complete" ? 980 : kind === "boss" ? 420 : 520, context.currentTime + .12);
    gain.gain.setValueAtTime(.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .16);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .17);
    oscillator.addEventListener("ended", () => void context.close(), { once: true });
  };

  const recordGameActivity = (baseProgress: PlayerProgress, kind: "topic" | "lab", worldProject = false) => {
    const currentDay = new Date();
    const today = currentDay.toISOString().slice(0, 10);
    const previousDay = new Date(currentDay);
    previousDay.setUTCDate(currentDay.getUTCDate() - 1);
    const yesterday = previousDay.toISOString().slice(0, 10);
    const sameDay = baseProgress.game.dailyDate === today;
    const dailyTopicsNext = (sameDay ? baseProgress.game.dailyTopics : 0) + (kind === "topic" ? 1 : 0);
    const dailyLabsNext = (sameDay ? baseProgress.game.dailyLabs : 0) + (kind === "lab" ? 1 : 0);
    const firstActivityToday = baseProgress.game.lastActiveDate !== today;
    const streakDays = firstActivityToday
      ? baseProgress.game.lastActiveDate === yesterday ? Math.max(1, baseProgress.game.streakDays + 1) : 1
      : baseProgress.game.streakDays;
    const dailyClaimedPreviously = sameDay && baseProgress.game.dailyClaimed;
    const totalCompletedNext = Object.values(baseProgress.completed).reduce((sum, ids) => sum + ids.length, 0);
    const inventory = new Set(baseProgress.game.inventory);
    inventory.add("Signal Compass");
    if (totalCompletedNext >= 1) inventory.add("Circuit Key");
    if (totalCompletedNext >= 5) inventory.add("Byte Beacon");
    if (totalCompletedNext >= 10) inventory.add("Archive Lens");
    if (worldProject) {
      inventory.add(activeTrack.label + " Relay Core");
      inventory.add(activeTrack.label + " · " + currentModule.name + " Relic");
    }
    if (kind === "lab") inventory.add("Runtime Shard");
    return {
      ...baseProgress,
      xp: baseProgress.xp,
      game: {
        ...baseProgress.game,
        streakDays,
        lastActiveDate: today,
        dailyDate: today,
        dailyTopics: dailyTopicsNext,
        dailyLabs: dailyLabsNext,
        dailyClaimed: dailyClaimedPreviously,
        inventory: [...inventory],
        updatedAt: baseProgress.game.updatedAt + 1,
      },
    };
  };

  const chooseAvatar = (avatarId: AvatarId) => {
    const avatar = AVATARS.find((item) => item.id === avatarId);
    if (!avatar || totalBadges < avatar.unlockAt) return;
    playGameSound("select");
    persistProgress({ ...progress, game: { ...progress.game, avatarId, updatedAt: progress.game.updatedAt + 1 } });
  };

  const toggleSound = () => {
    const soundEnabled = !progress.game.soundEnabled;
    persistProgress({ ...progress, game: { ...progress.game, soundEnabled, updatedAt: progress.game.updatedAt + 1 } });
    if (soundEnabled) window.setTimeout(() => playGameSound("select"), 0);
  };

  const saveSubmission = (result: ExecutionResult, stage: "attempt" | "submitted") => {
    if (!cloudUser) return;
    const passedChecks = result.tests.filter((test) => test.passed).length;
    const score = result.tests.length ? Math.round((passedChecks / result.tests.length) * 100) : result.passed ? 100 : 0;
    void getToken().then((token) => {
      if (!token) return;
      return fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({
          track: activeTrack.id,
          pace: activePaceId,
          topicId: activeQuest.id,
          topic: activeQuest.concept,
          stage,
          code,
          passed: result.passed,
          score,
          feedback: result.tests,
        }),
      });
    }).catch(() => undefined);
  };

  const resumeJourney = () => {
    let destination = journey;
    if (!destination.started) {
      const bestProgress = Object.entries(progress.completed)
        .filter(([key]) => key.includes("-"))
        .sort((left, right) => right[1].length - left[1].length)[0];
      if (bestProgress) {
        const [trackId, paceId] = bestProgress[0].split("-");
        destination = {
          trackId: trackId === "genai" || trackId === "sql" ? trackId : "python",
          paceId: paceId === "intermediate" || paceId === "expert" ? paceId : "beginner",
          started: true,
          tutorialComplete: true,
        };
      } else {
        destination = { trackId: goalRecommendation, paceId: paceRecommendation, started: true, tutorialComplete: false };
      }
    }
    setActiveTrackId(destination.trackId);
    if (destination.trackId === "python") {
      setActivePythonPaceId(destination.paceId);
      setHasChosenPythonPace(true);
    } else if (destination.trackId === "genai") {
      setActiveGenAIPaceId(destination.paceId);
      setHasChosenGenAIPace(true);
    } else {
      setActiveSQLPaceId(destination.paceId);
      setHasChosenSQLPace(true);
    }
    persistJourney(destination);
    emitAnalytics("journey_resumed", {
      track: destination.trackId,
      pace: destination.paceId,
      topicId: undefined,
      worldNumber: undefined,
      required: undefined,
    });
    setView("roadmap");
  };

  const skipTutorial = () => {
    persistJourney({ ...journey, trackId: activeTrack.id, paceId: activePaceId, started: true, tutorialComplete: true });
    emitAnalytics("tutorial_completed", { topicId: undefined, worldNumber: undefined, required: undefined });
    setTutorialOpen(false);
    setView("roadmap");
  };

  const startFirstLesson = () => {
    persistJourney({ ...journey, trackId: activeTrack.id, paceId: activePaceId, started: true, tutorialComplete: true });
    emitAnalytics("tutorial_completed", { topicId: undefined, worldNumber: undefined, required: undefined });
    setTutorialOpen(false);
    openQuest(activeQuests[0]);
  };

  const selectTrack = (track: Track) => {
    emitAnalytics("track_selected", { track: track.id, pace: undefined, topicId: undefined, worldNumber: undefined, required: undefined });
    clearRun();
    setActiveTrackId(track.id);
    setGoalRecommendation(track.id);
    persistJourney({ ...journey, trackId: track.id });
    if (track.id === "python" || track.id === "genai" || track.id === "sql") {
      if (track.id === "python") setHasChosenPythonPace(false);
      if (track.id === "genai") setHasChosenGenAIPace(false);
      if (track.id === "sql") setHasChosenSQLPace(false);
      setLessonStage("theory");
      setQuizAnswers({});
      setQuizResult("idle");
      setView("paces");
      return;
    }
  };

  const selectPace = (paceId: PythonPaceId) => {
    clearRun();
    const paceTrackId = activeTrack.id;
    const quests = paceTrackId === "sql"
      ? buildSQLPaceQuests(paceId)
      : paceTrackId === "genai"
        ? buildGenAIPaceQuests(paceId)
        : buildPythonPaceQuests(paceId);
    const firstQuest = quests[0];
    const key = `${paceTrackId}-${paceId}`;
    const completed = progress.completed[key] ?? [];
    emitAnalytics("pace_selected", { track: paceTrackId, pace: paceId, topicId: undefined, worldNumber: undefined, required: undefined });
    setActiveTrackId(paceTrackId);
    if (paceTrackId === "sql") {
      setActiveSQLPaceId(paceId);
      setHasChosenSQLPace(true);
    } else if (paceTrackId === "genai") {
      setActiveGenAIPaceId(paceId);
      setHasChosenGenAIPace(true);
    } else {
      setActivePythonPaceId(paceId);
      setHasChosenPythonPace(true);
    }
    setActiveQuestId(firstQuest.id);
    setCode(firstQuest.starterCode);
    setStatus(completed.includes(firstQuest.id) ? "complete" : "idle");
    setTerminal("Choose a topic when you are ready to begin.");
    setSceneStep(completed.includes(firstQuest.id) ? firstQuest.steps : 0);
    setLessonStage("theory");
    setQuizAnswers({});
    setQuizResult("idle");
    const nextJourney = { trackId: paceTrackId, paceId, started: true, tutorialComplete: journey.tutorialComplete };
    persistJourney(nextJourney);
    setTutorialStep(0);
    if (!journey.tutorialComplete && totalBadges === 0 && completed.length === 0) setTutorialOpen(true);
    setView("roadmap");
  };

  const isUnlocked = (quest: Quest) => {
    if (quest.id === 1 || trackCompleted.includes(quest.id)) return true;
    const previousId = quest.id - 1;
    if (!trackCompleted.includes(previousId)) return false;
    const previousModule = activeTrack.id === "python"
      ? getPythonModule(activePythonPaceId, previousId)
      : activeTrack.id === "genai"
        ? getGenAIModule(activeGenAIPaceId, previousId)
        : getSQLModule(activeSQLPaceId, previousId);
    return previousId !== previousModule.end || trackBonus.includes(previousId);
  };

  const openQuest = (quest: Quest, startAtProject = false) => {
    if (!isUnlocked(quest)) return;
    clearDailyQuestSession();
    const destinationModule = activeTrack.id === "python"
      ? getPythonModule(activePythonPaceId, quest.id)
      : activeTrack.id === "genai"
        ? getGenAIModule(activeGenAIPaceId, quest.id)
        : getSQLModule(activeSQLPaceId, quest.id);
    clearRun();
    setActiveQuestId(quest.id);
    if (startAtProject) {
      const projectModule = destinationModule;
      const projectLab = activeTrack.id === "genai" ? buildGenAILab(activeGenAIPace.topics[quest.id - 1], true, projectModule.name) : null;
      const projectChallenge = activeTrack.id === "python"
        ? buildPythonChallenge(activePythonPace.topics[quest.id - 1], { required: true, worldName: projectModule.name })
        : activeTrack.id === "sql"
          ? buildSQLChallenge(activeSQLPace.topics[quest.id - 1], { required: true, worldName: projectModule.name })
          : null;
      const projectComplete = trackBonus.includes(quest.id);
      setCode(projectLab?.starterCode ?? projectChallenge?.starterCode ?? quest.starterCode);
      setStatus(projectComplete ? "complete" : "idle");
      setTerminal(projectComplete ? "> Applied project already complete\n✓ Your project XP is saved." : "Required world project ready. Pass every hidden check to unlock the next world.");
      setSceneStep(projectComplete ? quest.steps : 0);
      setLessonStage("bonus");
      warmExecutionRuntime(activeTrack.id);
    } else {
      setCode(quest.starterCode);
      setStatus(trackCompleted.includes(quest.id) ? "complete" : "idle");
      setTerminal(trackCompleted.includes(quest.id) ? "Quest already complete. Replay it any time." : "Your output will appear here.");
      setSceneStep(trackCompleted.includes(quest.id) ? quest.steps : 0);
      setLessonStage("theory");
    }
    setQuizAnswers({});
    setQuizResult("idle");
    setWorldPowerHint("");
    setEliminatedQuizOptions({});
    setView("quest");
    emitAnalytics(startAtProject ? "lab_started" : "lesson_started", {
      topicId: quest.id,
      worldNumber: destinationModule.number,
      required: startAtProject || undefined,
    });
  };

  const enterWorld = (world: (typeof activeWorlds)[number]) => {
    if (!world.unlocked) return;
    playGameSound(world.projectComplete ? "complete" : "select");
    const nextWorldQuest = activeQuests.find((quest) => quest.id >= world.start && quest.id <= world.end && !trackCompleted.includes(quest.id));
    const bossPending = !nextWorldQuest && !trackBonus.includes(world.end);
    const destination = nextWorldQuest ?? activeQuests[world.end - 1];
    openQuest(destination, bossPending);
  };

  const runCode = async () => {
    const { controller, token: currentRun } = startRun();
    if (!code.trim()) {
      setStatus("error");
      setTerminal("> Nothing to run\n! Add a solution in the editor first.");
      return;
    }
    if (activeGenAILab) {
      const validationError = validateGenAILab(activeGenAILab, code);
      if (validationError) {
        setStatus("error");
        setTerminal("> Lab needs work\n! " + validationError);
        emitAnalytics("lab_run_failed");
        return;
      }
    }
    setStatus("running");
    setExecutionResult(null);
    if (activeTrack.id !== "genai") updateRuntimeReadiness(activeTrack.id, "preparing");
    setExecutionPhase(activeGenAILab ? "Evaluating grounding, tools, safety, and output quality…" : activeTrack.id === "sql" ? "Resetting and loading the topic-specific practice database…" : "Loading the Python runtime in an isolated worker… First run may take a few seconds.");
    setTerminal(activeGenAILab ? "> Contacting the controlled AI evaluator…" : activeTrack.id === "sql" ? "> Starting isolated PostgreSQL practice database…" : "> Starting isolated Python runtime…");
    setSceneStep(0);
    let result: ExecutionResult;
    try {
      const authToken = activeGenAILab && clerkSignedIn ? await getToken() ?? undefined : undefined;
      result = await executeLab({
        track: activeTrack.id,
        code,
        topic: activeQuest.concept,
        authToken,
        required: isRequiredWorldProject,
        challenge: activeChallenge?.runtime,
      }, controller.signal, (runtimeProgress) => {
        setExecutionPhase(runtimeProgress.detail);
        if (activeTrack.id !== "genai" && runtimeProgress.phase === "ready") updateRuntimeReadiness(activeTrack.id, "ready");
      });
    } catch (error) {
      result = {
        passed: false,
        stdout: "",
        error: error instanceof Error ? error.message : "The browser runtime could not start.",
        runtime: "controlled-local",
        durationMs: 0,
        tests: [],
      };
    }
    if (!isCurrentRun(currentRun)) return;
    finishRun();
    if (activeTrack.id !== "genai") updateRuntimeReadiness(activeTrack.id, result.runtime === "controlled-local" ? "error" : "ready");
    setExecutionResult(result);
    saveSubmission(result, "attempt");
    emitAnalytics(result.passed ? "lab_run_passed" : "lab_run_failed");

    if (!result.passed) {
      setSceneStep(0);
      setStatus("error");
      setTerminal(result.error ? "> Execution stopped\n! " + result.error : "> Test run complete\n! Review the failed checks below and try again.");
      return;
    }

    const alreadySubmitted = dailyQuestMode ? dailyQuestCompletedToday : trackBonus.includes(activeQuest.id);
    setSceneStep(activeQuest.steps);
    setStatus(alreadySubmitted ? "complete" : "ready");
    const runtimeName = result.runtime === "python-wasm"
      ? "REAL PYTHON · BROWSER SANDBOX"
      : result.runtime === "postgres-wasm"
        ? "REAL POSTGRESQL · PRACTICE DATABASE"
        : result.runtime === "hosted-model"
          ? "CONTROLLED HOSTED MODEL"
          : "CONTROLLED LOCAL EVALUATOR";
    setTerminal("> " + runtimeName + " · " + result.durationMs + "ms\n✓ All checks passed. Submit your " + (isRequiredWorldProject ? "world project" : "practice solution") + " when ready.");
  };

  const stopExecution = () => stopRuntimeExecution(activeTrack.id);

  const activateWorldPower = () => {
    if (lessonStage !== "quiz" || worldPowerUsed || quizResult === "passed") return;
    const unresolvedIndex = activeQuiz.findIndex((question, index) => quizAnswers[index] !== question.answer);
    if (unresolvedIndex < 0) {
      setWorldPowerHint("Every checkpoint node is already aligned. Submit your answers to stabilize the relay.");
      return;
    }

    const question = activeQuiz[unresolvedIndex];
    if (activeWorldMechanic.kind === "scan") {
      const decoys = question.options.map((_, index) => index).filter((index) => index !== question.answer).slice(0, Math.min(2, question.options.length - 1));
      const nextAnswers = { ...quizAnswers };
      if (decoys.includes(nextAnswers[unresolvedIndex])) delete nextAnswers[unresolvedIndex];
      setQuizAnswers(nextAnswers);
      setEliminatedQuizOptions((current) => ({ ...current, [unresolvedIndex]: decoys }));
      setWorldPowerHint(activeWorldMechanic.power + " isolated question " + (unresolvedIndex + 1) + " and removed " + decoys.length + " corrupted paths.");
    } else if (activeWorldMechanic.kind === "override") {
      setQuizAnswers((current) => ({ ...current, [unresolvedIndex]: question.answer }));
      setWorldPowerHint("Byte patched checkpoint node " + (unresolvedIndex + 1) + ". Inspect the repaired answer so you understand why it works.");
    } else {
      setWorldPowerHint(activeTheory.mentalModel + " Watch for this trap: " + activeTheory.commonMistake);
    }

    setQuizResult("idle");
    persistProgress({
      ...progress,
      game: {
        ...progress.game,
        worldPowerClaims: [...new Set([...progress.game.worldPowerClaims, worldPowerClaimKey])].slice(-300),
        updatedAt: progress.game.updatedAt + 1,
      },
    });
    setGameToast(activeWorldMechanic.power.toUpperCase() + " DEPLOYED · RECHARGES TOMORROW");
    emitAnalytics("world_power_used");
    playGameSound("select");
  };

  const submitQuiz = () => {
    if (Object.keys(quizAnswers).length < activeQuiz.length) {
      setQuizResult("incomplete");
      return;
    }

    const score = activeQuiz.filter((question, index) => quizAnswers[index] === question.answer).length;
    if (score !== activeQuiz.length) {
      setQuizResult("failed");
      emitAnalytics("checkpoint_failed");
      return;
    }

    if (!trackCompleted.includes(activeQuest.id)) {
      const nextProgress: PlayerProgress = {
        ...progress,
        xp: progress.xp + activeQuest.xp,
        completed: {
          ...progress.completed,
          [progressKey]: [...trackCompleted, activeQuest.id].sort((a, b) => a - b),
        },
      };
      persistProgress(recordGameActivity(nextProgress, "topic"));
      playGameSound("complete");
    }
    setQuizResult("passed");
    emitAnalytics("checkpoint_passed");
  };

  const openDailyQuest = () => {
    const quest = dailyQuestPreview;
    const questModule = activeTrack.id === "python"
      ? getPythonModule(activePythonPaceId, quest.id)
      : activeTrack.id === "genai"
        ? getGenAIModule(activeGenAIPaceId, quest.id)
        : getSQLModule(activeSQLPaceId, quest.id);
    const dailyLab = activeTrack.id === "genai"
      ? buildGenAILab(activeGenAIPace.topics[quest.id - 1], false, questModule.name)
      : null;
    const dailyChallenge = activeTrack.id === "python"
      ? buildPythonChallenge(activePythonPace.topics[quest.id - 1], { required: false, worldName: questModule.name })
      : activeTrack.id === "sql"
        ? buildSQLChallenge(activeSQLPace.topics[quest.id - 1], { required: false, worldName: questModule.name })
        : null;
    const key = [todayKey, activeTrack.id, activePaceId, quest.id].join(":");
    clearRun();
    setExecutionResult(null);
    setDailyQuestSession({ date: todayKey, key, questId: quest.id });
    setActiveQuestId(quest.id);
    setCode(dailyLab?.starterCode ?? dailyChallenge?.starterCode ?? quest.starterCode);
    setStatus(dailyQuestCompletedToday ? "complete" : "idle");
    setTerminal(dailyQuestCompletedToday
      ? "> Daily Quest already complete\n✓ Return tomorrow for a new challenge."
      : "Today's challenge is ready. Pass every check, then claim the Daily Quest reward.");
    setSceneStep(dailyQuestCompletedToday ? quest.steps : 0);
    setLessonStage("bonus");
    setQuizAnswers({});
    setQuizResult("idle");
    setView("quest");
    warmExecutionRuntime(activeTrack.id);
    void trackAnalyticsEvent("daily_quest_started", {
      track: activeTrack.id,
      pace: activePaceId,
      topicId: quest.id,
      worldNumber: questModule.number,
    }, clerkSignedIn ? getToken : undefined);
    playGameSound("select");
  };

  const openBonus = () => {
    const bonusAlreadyComplete = dailyQuestMode ? dailyQuestCompletedToday : trackBonus.includes(activeQuest.id);
    clearRun();
    setExecutionResult(null);
    setCode(activeGenAILab?.starterCode ?? activeChallenge?.starterCode ?? `# Optional challenge\n# Rebuild the solution without using the helper snippets.\n`);
    setStatus(bonusAlreadyComplete ? "complete" : "idle");
    setTerminal(bonusAlreadyComplete
      ? dailyQuestMode ? "> Daily Quest already complete\n✓ Return tomorrow for a new challenge." : "> Lab already complete\n✓ Your XP and progress are saved."
      : dailyQuestMode
        ? "Today's challenge is ready. Pass every check, then claim the Daily Quest reward."
        : activeGenAILab
          ? activeGenAILab.required
            ? "Required world project ready. Pass every rubric check to stabilize this world."
            : "Controlled AI practice lab ready. No personal API key or credits are needed."
          : activeTrack.id === "sql"
            ? isRequiredWorldProject ? "Required database project ready. Build the report view and pass every database-state check." : "Practice database ready. Run real PostgreSQL against a fresh dataset."
            : isRequiredWorldProject ? "Required Python project ready. Build the relay report and pass every hidden test." : "Python sandbox ready. Run real Python directly in your browser.");
    setSceneStep(bonusAlreadyComplete ? activeQuest.steps : 0);
    setLessonStage("bonus");
    warmExecutionRuntime(activeTrack.id);
    emitAnalytics(dailyQuestMode ? "daily_quest_started" : "lab_started");
  };

  const submitBonus = () => {
    if (status !== "ready" && status !== "complete") {
      setStatus("error");
      setTerminal("> Run required\n! Execute the current solution successfully before submitting it.");
      return;
    }
    if (dailyQuestMode && dailyQuestSession) {
      if (!dailyQuestCompletedToday) {
        const activityProgress = recordGameActivity({ ...progress, xp: progress.xp + DAILY_QUEST_XP }, "lab");
        const inventory = [...new Set([...activityProgress.game.inventory, "Daily Quest Cache"])];
        persistProgress({
          ...activityProgress,
          game: {
            ...activityProgress.game,
            dailyQuestDate: todayKey,
            dailyQuestId: dailyQuestSession.key,
            dailyQuestCompleted: true,
            dailyQuestStreak: getDailyQuestStreak(progress.game.dailyQuestDate, progress.game.dailyQuestStreak, todayKey),
            inventory,
            updatedAt: activityProgress.game.updatedAt + 1,
          },
        });
        emitAnalytics("daily_quest_completed");
        setGameToast("DAILY QUEST COMPLETE · +" + DAILY_QUEST_XP + " XP · STREAK EXTENDED");
        playGameSound("complete");
      }
      if (executionResult) saveSubmission(executionResult, "submitted");
      setStatus("complete");
      setSceneStep(activeQuest.steps);
      setTerminal("> Daily Quest complete!\n+ " + DAILY_QUEST_XP + " XP earned. A new challenge arrives at 00:00 UTC.");
      return;
    }
    const firstWorldRestoredNow = isRequiredWorldProject && currentModule.number === 1 && !trackBonus.includes(activeQuest.id);
    if (!trackBonus.includes(activeQuest.id)) {
      const nextProgress: PlayerProgress = {
        ...progress,
        xp: progress.xp + bonusXp,
        bonus: { ...progress.bonus, [progressKey]: [...trackBonus, activeQuest.id].sort((a, b) => a - b) },
      };
      persistProgress(recordGameActivity(nextProgress, "lab", isRequiredWorldProject));
      emitAnalytics("lab_completed");
      if (isRequiredWorldProject) emitAnalytics("world_completed");
      playGameSound(isRequiredWorldProject ? "boss" : "complete");
    }
    if (executionResult) saveSubmission(executionResult, "submitted");
    setStatus("complete");
    setSceneStep(activeQuest.steps);
    setTerminal(isRequiredWorldProject
      ? "> Applied project complete!\n+ 75 project XP earned. " + (isFinalQuest ? "This path is complete." : "The next world is unlocked.")
      : "> Optional challenge complete!\n+ " + bonusXp + " bonus XP earned.");
    if (firstWorldRestoredNow) setFirstWorldCelebration(true);
  };

  const openNextSection = () => {
    if (dailyQuestMode) {
      clearDailyQuestSession();
      setView("roadmap");
      return;
    }
    if (activeQuest.id < activeQuests.length) openQuest(activeQuests[activeQuest.id]);
    else setView("roadmap");
  };

  return (
    <main className={`app-shell track-${activeTrack.id}`}>
      <header className="topbar">
        <button className="brand" onClick={() => { clearDailyQuestSession(); setView("tracks"); }} aria-label="Open CodeCraft tracks">
          <span className="brand-cube" aria-hidden="true"><i /></span>
          <span>CODECRAFT</span>
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === "tracks" ? "active" : ""} onClick={() => { clearDailyQuestSession(); setView("tracks"); }}>Tracks</button>
          {isPacedTrack && <button className={view === "paces" ? "active" : ""} onClick={() => { clearDailyQuestSession(); setView("paces"); }}>Pace</button>}
          <button className={view === "roadmap" ? "active" : ""} onClick={() => { clearDailyQuestSession(); setView(isPacedTrack && !hasChosenActivePace ? "paces" : "roadmap"); }}>Roadmap</button>
          <button className={view === "quest" && !dailyQuestMode ? "active" : ""} onClick={() => openQuest(activeQuest)}>Quest</button>
          <button className={dailyQuestMode ? "active daily-nav" : "daily-nav"} onClick={openDailyQuest}>Daily Quest</button>
        </nav>
        <div className="player-stats">
          <button className="stat-chip profile-stat-trigger" onClick={openProfile} aria-label={`Open profile, ${progress.xp} XP`}><b>◆</b> {progress.xp} XP</button>
          <span className="stat-chip badge-count"><b>✦</b> {totalBadges}</span>
          <button className={`sound-toggle ${progress.game.soundEnabled ? "on" : "off"}`} onClick={toggleSound} aria-label={`${progress.game.soundEnabled ? "Mute" : "Enable"} game sounds`}>{progress.game.soundEnabled ? "♪" : "×"}</button>
          <button className={`avatar ${activeAvatar.id}`} onClick={openProfile} aria-haspopup="dialog" aria-expanded={profileOpen} aria-controls="codecraft-profile" aria-label={`Open ${profileDisplayName}'s profile, level ${level}`}>{activeAvatar.glyph}<small>LV {level}</small></button>
          {clerkSignedIn ? (
            <span className={`auth-account ${cloudState}`}>{cloudState === "syncing" ? "Syncing…" : cloudState === "error" ? "Sync error" : cloudState === "synced" ? "Cloud saved" : "Signed in"}</span>
          ) : (
            <SignInButton mode="modal"><button className={`auth-chip ${cloudState}`}>{clerkLoaded ? "Sign in to sync" : "Checking…"}</button></SignInButton>
          )}
        </div>
      </header>

      {gameToast && <div className="game-toast" role="status"><span>✦</span><strong>{gameToast}</strong><button onClick={() => setGameToast("")} aria-label="Dismiss reward notification">×</button></div>}

      <BetaFeedback
        context={{ track: activeTrack.id, pace: activePaceId, topicId: activeQuest.id, worldNumber: currentModule.number, required: isRequiredWorldProject }}
        getToken={getToken}
        signedIn={Boolean(clerkSignedIn)}
        worldPromptOpen={worldFeedbackPrompt}
        onDismissWorldPrompt={() => setWorldFeedbackPrompt(false)}
      />

      {tutorialOpen && (
        <div className="onboarding-backdrop">
          <section className="onboarding-dialog" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
            <header>
              <div><span>BYTE&apos;S QUICK START</span><strong>About 60 seconds</strong></div>
              <button onClick={skipTutorial} aria-label="Skip tutorial">Skip</button>
            </header>
            <FirstRunChecklist activeStep={2} />
            <div className="onboarding-progress"><i style={{ width: `${((tutorialStep + 1) / 3) * 100}%` }} /></div>
            {tutorialStep === 0 ? (
              <div className="onboarding-slide">
                <p>MISSION 01 / 03</p>
                <h2 id="onboarding-title">Your learning path is ready.</h2>
                <span>You chose <b>{activeTrack.label}</b> at the <b>{activePace.label}</b> pace. Your first world is <b>{activeModules[0].name}</b>.</span>
                <div className="onboarding-mission-card"><small>FIRST OBJECTIVE</small><strong>{activeQuests[0].title}</strong><p>{activeQuests[0].objective}</p></div>
              </div>
            ) : tutorialStep === 1 ? (
              <div className="onboarding-slide">
                <p>MISSION 02 / 03</p>
                <h2 id="onboarding-title">Every lesson follows one clear route.</h2>
                <div className="onboarding-loop">
                  <article><b>1</b><strong>Learn</strong><span>Understand the idea through rich theory.</span></article>
                  <article><b>2</b><strong>Example</strong><span>See the concept explained line by line.</span></article>
                  <article><b>3</b><strong>Checkpoint</strong><span>Pass a short required knowledge test.</span></article>
                  <article><b>4</b><strong>Practice</strong><span>Try optional code; world projects remain required.</span></article>
                </div>
              </div>
            ) : (
              <div className="onboarding-slide">
                <p>MISSION 03 / 03</p>
                <h2 id="onboarding-title">Repair systems and watch the realm respond.</h2>
                <div className="reward-explainer">
                  <article><span>XP</span><strong>Grow your level</strong><p>Lessons, labs, and daily missions earn signal XP.</p></article>
                  <article><span>BADGE</span><strong>Prove each topic</strong><p>A passed checkpoint restores its topic badge.</p></article>
                  <article><span>WORLD</span><strong>Defeat the project</strong><p>The final project in each world unlocks the next gate.</p></article>
                </div>
              </div>
            )}
            <footer>
              <button disabled={tutorialStep === 0} onClick={() => setTutorialStep((step) => Math.max(0, step - 1))}>Back</button>
              {tutorialStep < 2
                ? <button className="onboarding-primary" onClick={() => setTutorialStep((step) => Math.min(2, step + 1))}>Next</button>
                : <button className="onboarding-primary" onClick={startFirstLesson}>Start first lesson</button>}
            </footer>
          </section>
        </div>
      )}

      {firstWorldCelebration && (
        <div className="onboarding-backdrop celebration-backdrop">
          <section className="world-celebration" role="dialog" aria-modal="true" aria-labelledby="world-celebration-title">
            <div className="celebration-burst" aria-hidden="true"><i /><i /><i /><span>01</span></div>
            <p>FIRST WORLD RESTORED</p>
            <h2 id="world-celebration-title">{currentModule.name} is back online!</h2>
            <span>You completed every checkpoint and defeated the world project. The next realm gate is now open.</span>
            <div><article><small>PROJECT REWARD</small><strong>+75 XP</strong></article><article><small>UNIQUE RELIC</small><strong>{currentModule.name} Relic</strong></article></div>
            <footer><button onClick={() => { setFirstWorldCelebration(false); setWorldFeedbackPrompt(true); setView("roadmap"); }}>View restored world</button><button className="onboarding-primary" onClick={() => { setFirstWorldCelebration(false); setWorldFeedbackPrompt(true); openNextSection(); }}>{activeModules[1] ? `Enter ${activeModules[1].name}` : "Finish path"}</button></footer>
          </section>
        </div>
      )}

      <ProfilePanel
        open={profileOpen}
        signedIn={Boolean(clerkSignedIn)}
        email={clerkEmail}
        displayName={profileDisplayName}
        level={level}
        xpToNextLevel={xpToNextLevel}
        levelProgress={levelProgress}
        totalBadges={totalBadges}
        totalProjects={totalProjects}
        progress={progress}
        trackStats={trackProfileStats}
        avatars={AVATARS}
        activeAvatar={activeAvatar}
        achievements={achievements}
        unlockedAchievements={unlockedAchievements}
        editingName={editingName}
        firstNameDraft={firstNameDraft}
        lastNameDraft={lastNameDraft}
        nameSaveState={nameSaveState}
        nameError={nameError}
        savedSubmissions={savedSubmissions}
        submissionsState={submissionsState}
        onClose={closeProfile}
        onBeginNameEdit={beginNameEdit}
        onCancelNameEdit={cancelNameEdit}
        onFirstNameChange={setFirstNameDraft}
        onLastNameChange={setLastNameDraft}
        onSaveName={saveProfileName}
        onChooseAvatar={chooseAvatar}
        onManageAccount={() => { closeProfile(); clerk.openUserProfile(); }}
        onSignOut={() => { closeProfile(); void clerk.signOut({ redirectUrl: "/" }); }}
      />

      {view === "tracks" ? (
        <TrackPickerView
          journey={journey}
          totalBadges={totalBadges}
          savedTrackLabel={savedTrack.label}
          savedPaceLabel={savedPace.label}
          dailyQuest={{ completed: dailyQuestCompletedToday, title: dailyQuestPreview.title, trackLabel: activeTrack.label, paceLabel: activePace.label, streak: progress.game.dailyQuestStreak, onOpen: openDailyQuest }}
          progress={progress}
          recommendation={goalRecommendation}
          cloudUser={cloudUser}
          onResume={resumeJourney}
          onRecommend={setGoalRecommendation}
          onSelectTrack={selectTrack}
        />
      ) : view === "paces" ? (
        <PacePickerView
          track={activeTrack}
          paces={activePaces}
          progress={progress}
          totalBadges={totalBadges}
          recommendation={paceRecommendation}
          onBack={() => setView("tracks")}
          onRecommend={setPaceRecommendation}
          onSelect={selectPace}
        />
      ) : view === "roadmap" ? (
        <section className="roadmap-page">
          <section className={`world-hero ${activeTrack.id} ${isPacedTrack ? activePaceId : ""}`}>
            <div className="hero-sky" aria-hidden="true">
              <i className="pixel-cloud cloud-a" /><i className="pixel-cloud cloud-b" />
              <i className="voxel-mountain mountain-a" /><i className="voxel-mountain mountain-b" />
              <i className="floating-block block-a" /><i className="floating-block block-b" />
            </div>
            <div className="hero-copy">
              <p className="pixel-kicker">{isPacedTrack ? `${activePace.label.toUpperCase()} PATH · ${activeModules.length} WORLDS` : `WORLDS 01–02 · ${activeTrack.kicker}`}</p>
              <h1>{isPacedTrack ? <>Master the<br /><span>{activePace.label} Path</span></> : <>Enter the<br /><span>{activeTrack.world}</span></>}</h1>
              <p>{isPacedTrack ? `${activePace.description} ${activeTrack.mission} Explore ${activeModules.length} worlds and master ${activeQuests.length} ordered topics.` : `${activeTrack.description} ${activeTrack.mission} Cross two connected worlds and unlock eight signal badges.`}</p>
              <div className="hero-actions">
                <button className="primary-pixel" onClick={() => openQuest(nextQuest ?? activeQuests[0], Boolean(pendingRequiredProject))}>
                  {pendingRequiredProject ? "Finish world project" : pathComplete ? "Replay the trail" : completedCount ? "Continue adventure" : "Start adventure"}
                </button>
                {isPacedTrack && <button className="change-pace" onClick={() => setView("paces")}>Change pace</button>}
              </div>
            </div>
            <div className="hero-byte" aria-label="Byte the robot"><span>◆</span><b>BYTE</b></div>
          </section>
          {totalBadges === 0 && <div className="roadmap-first-run"><FirstRunChecklist activeStep={2} /><p><strong>Your map is ready.</strong> Learn the game loop, then begin the first highlighted topic.</p></div>}

          <WorldMap
            paceLabel={activePace.label}
            streakDays={progress.game.streakDays}
            inventoryCount={progress.game.inventory.length}
            unlockedAchievements={unlockedAchievements}
            achievementCount={achievements.length}
            storyStep={storyStep}
            byteStory={byteStory}
            world={mapWorld}
            worldContractProgress={mapWorldContractProgress}
            worldEvent={mapWorldMechanic.event}
            worldDescription={mapWorldMechanic.description}
            worldSideMissions={mapWorldSideMissions}
            worlds={activeWorlds}
            currentWorldIndex={currentWorldIndex}
            activeAvatar={activeAvatar}
            getWorldEvent={(worldNumber) => getWorldMechanic(activeTrack.id, worldNumber).event}
            onNextTransmission={() => { playGameSound("select"); setStoryStep((current) => (current + 1) % byteStory.length); }}
            onEnterWorld={enterWorld}
          />

          <div className="roadmap-layout">
            <section className="trail-panel">
              <div className="section-heading">
                <div><p className="pixel-kicker">YOUR RELAY ROUTE</p><h2>{isPacedTrack ? `${activeQuests.length} topics across ${activeModules.length} worlds.` : "Eight quests. Two realm relays to reconnect."}</h2></div>
                <div className="course-progress" aria-label={`${progressPercent}% course complete`}>
                  <span>{completedCount}/{activeQuests.length} {isPacedTrack ? "topics" : "quests"}</span>
                  <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}><i style={{ width: `${progressPercent}%` }} /></div>
                </div>
              </div>

              <div className="quest-trail">
                {activeQuests.map((quest) => {
                  const complete = trackCompleted.includes(quest.id);
                  const unlocked = isUnlocked(quest);
                  const paceModule = activeTrack.id === "python"
                    ? getPythonModule(activePythonPaceId, quest.id)
                    : activeTrack.id === "genai"
                      ? getGenAIModule(activeGenAIPaceId, quest.id)
                      : getSQLModule(activeSQLPaceId, quest.id);
                  const isModuleStart = isPacedTrack ? quest.id === paceModule?.start : quest.id === 1 || quest.id === 5;
                  const moduleUnlocked = isUnlocked(quest);
                  const worldNumber = isPacedTrack ? paceModule?.number ?? 1 : quest.id <= 4 ? 1 : 2;
                  const isWorldBoss = quest.id === paceModule?.end;
                  const projectPending = quest.id === paceModule?.end && complete && !trackBonus.includes(quest.id);
                  return (
                    <Fragment key={quest.id}>
                      {isModuleStart && <div className={`world-divider ${quest.id === 1 ? "world-one" : moduleUnlocked ? "unlocked" : "locked"}`}><span>WORLD {String(worldNumber).padStart(2, "0")}</span><div><strong>{isPacedTrack ? paceModule?.name : quest.id === 1 ? activeTrack.world : activeTrack.worldTwo}</strong><small>{moduleUnlocked ? isPacedTrack ? `TOPICS ${paceModule?.start}–${paceModule?.end} · ${activePace.label.toUpperCase()}` : quest.id === 1 ? "FOUNDATION RELAY · QUESTS 1–4" : "RELAY LINKED · ADVANCED REALM" : `COMPLETE WORLD ${worldNumber - 1} APPLIED PROJECT TO ENTER`}</small></div></div>}
                      <article className={`quest-card ${complete ? "complete" : ""} ${isWorldBoss ? "boss-gate" : ""} ${projectPending ? "project-pending" : ""} ${!unlocked ? "locked" : ""}`}>
                        <div className="quest-node"><span>{complete ? "✓" : unlocked ? quest.id : "▣"}</span></div>
                        <div className="quest-card-copy">
                          <p>WORLD {String(worldNumber).padStart(2, "0")} · {isPacedTrack ? `TOPIC ${String(quest.id).padStart(2, "0")}` : `CHAPTER ${String(quest.id <= 4 ? quest.id : quest.id - 4).padStart(2, "0")}`} · {quest.chapter.toUpperCase()}</p>
                          <h3>{quest.title}</h3>
                          <span>{quest.description}</span>
                          <div className="quest-rewards"><small>◆ {quest.xp} XP</small><small>✦ {quest.badge}</small>{isWorldBoss && <small>⚔ WORLD BOSS</small>}{projectPending && <small>⚡ PROJECT REQUIRED</small>}</div>
                        </div>
                        <button disabled={!unlocked} onClick={() => openQuest(quest, projectPending)}>
                          {projectPending ? "Enter boss" : complete ? "Replay" : unlocked ? isWorldBoss ? "Approach boss" : "Start" : "Locked"}
                        </button>
                      </article>
                    </Fragment>
                  );
                })}
                <div className="trail-end"><span>?</span><div><small>{isPacedTrack ? `NEXT ${activeTrack.label.toUpperCase()} PATH` : "FUTURE WORLD"}</small><strong>{isPacedTrack ? activePaceId === "beginner" ? "Intermediate" : activePaceId === "intermediate" ? "Expert" : "Specialization" : activeTrack.nextWorld}</strong><p>{isPacedTrack ? "Switch paths whenever you are ready—each path keeps separate progress." : "Coming after both current realm relays are online."}</p></div></div>
              </div>
            </section>

            <aside className="player-panel">
              <button className="profile-card" onClick={openProfile} aria-haspopup="dialog" aria-controls="codecraft-profile">
                <div className="profile-avatar">{profileInitial}<span>LV {level}</span></div>
                <div><p>PLAYER PROFILE · {cloudUser ? "CLOUD" : "LOCAL"}</p><h3>{profileDisplayName}</h3><span>{progress.xp} signal XP · {cloudUser ? cloudState === "error" ? "sync needs retry" : "cross-device save active" : "sign in to sync"}</span><small>Open profile →</small></div>
              </button>
              <div className="panel-section">
                <div className="panel-label"><span>SIGNAL ARCHIVE</span><b>{earnedBadges.length}/{activeQuests.length}</b></div>
                <div className="badge-shelf">
                  {sidebarQuests.map((quest) => <div className={trackCompleted.includes(quest.id) ? "earned" : ""} key={quest.id} title={quest.badge}>{trackCompleted.includes(quest.id) ? "✦" : "?"}</div>)}
                </div>
                <p className="panel-note">{focusedModule ? `Showing ${focusedModule.name}. Complete every topic to collect all ${activeQuests.length} signal badges.` : "Complete each chapter to recover its signal badge."}</p>
              </div>
              <div className={`daily-card ${dailyQuestCompletedToday ? "complete" : ""}`}>
                <p>DAILY QUEST · {progress.game.dailyQuestStreak} DAY STREAK</p>
                <strong>{dailyQuestPreview.title}</strong>
                <div><i className={dailyQuestCompletedToday ? "done" : ""} /></div>
                <span>{dailyQuestCompletedToday ? `Complete · +${DAILY_QUEST_XP} XP claimed` : `${activeTrack.label} · ${activePace.label} · +${DAILY_QUEST_XP} XP`}</span>
                <small>New deterministic challenge every day at 00:00 UTC.</small>
                <button onClick={openDailyQuest}>{dailyQuestCompletedToday ? "Replay challenge" : "Start daily quest"} →</button>
              </div>
              <div className="world-legend">
                <p>RELAY SKILLS</p>
                {sidebarQuests.map((quest) => <span key={quest.id}><i className={trackCompleted.includes(quest.id) ? "done" : ""} />{quest.concept}</span>)}
              </div>
            </aside>
          </div>
        </section>
      ) : (
        <section className="lesson-page">
          <div className="lesson-bar">
            <button onClick={() => { if (dailyQuestMode) clearDailyQuestSession(); setView("roadmap"); }}>{dailyQuestMode ? "← Close daily quest" : "← Roadmap"}</button>
            <div><span>{dailyQuestMode ? `DAILY QUEST / ${activeTrack.label.toUpperCase()} / ${activePace.label.toUpperCase()}` : `${activeTrack.label.toUpperCase()} / ${isPacedTrack ? `${activePace.label.toUpperCase()} / ` : ""}${activeQuest.chapter.toUpperCase()}`}</span><strong>{activeQuest.title}</strong></div>
            <div className="lesson-progress"><i style={{ width: dailyQuestMode ? dailyQuestCompletedToday ? "100%" : "50%" : `${((activeQuest.id - 1) / activeQuests.length) * 100}%` }} /></div>
            <span>{dailyQuestMode ? "UTC" : `${activeQuest.id} / ${activeQuests.length}`}</span>
          </div>

          {!dailyQuestMode && totalBadges === 0 && activeQuest.id === 1 && <div className="lesson-first-run"><FirstRunChecklist activeStep={3} /></div>}

          {dailyQuestMode ? (
            <section className={`daily-quest-brief ${dailyQuestCompletedToday ? "complete" : ""}`}>
              <div className="daily-quest-emblem" aria-hidden="true">☼<span>DQ</span></div>
              <div><p>TODAY&apos;S RELAY CHALLENGE</p><h1>{activeQuest.title}</h1><span>Pass every visible and hidden check. The first successful submission today awards XP and extends your streak.</span><div><b>{activeTrack.label}</b><b>{activePace.label}</b><b>5–15 min</b></div></div>
              <aside><small>REWARD</small><strong>+{DAILY_QUEST_XP} XP</strong><span>{progress.game.dailyQuestStreak} day streak</span><i>{dailyQuestCompletedToday ? "REWARD CLAIMED" : "AVAILABLE TODAY"}</i></aside>
            </section>
          ) : (
            <>
              <div className="curriculum-steps" aria-label="Lesson stages">
                {stageOrder.map((stage, index) => {
                  const done = index < stageIndex || isStageComplete(stage);
                  return <span className={index === stageIndex ? "active" : done ? "done" : ""} key={stage}><i>{done ? "✓" : index + 1}</i>{stage === "quiz" ? "Checkpoint" : stage === "bonus" ? isRequiredWorldProject ? "World project" : activeGenAILab ? "AI lab" : "Optional code" : stage[0].toUpperCase() + stage.slice(1)}</span>;
                })}
              </div>

              <div className={`quest-story-strip ${isRequiredWorldProject ? "boss-mission" : ""}`}>
                <span>◆<small>BYTE</small></span>
                <p><strong>{isRequiredWorldProject ? `BOSS MISSION · ${currentModule.name}` : `SYSTEM REPAIR · ${activeQuest.title}`}</strong>{isRequiredWorldProject ? "The world guardian is testing everything you learned here. Clear the checkpoint, then stabilize the live system to open the gate." : `This lesson controls one part of ${currentModule.name}. Complete the checkpoint and watch its realm signal turn on.`}</p>
                <div><i className={trackCompleted.includes(activeQuest.id) ? "active" : ""} /><i className={trackBonus.includes(activeQuest.id) ? "active" : ""} /></div>
              </div>

              <section className={"world-mechanic-banner power-" + activeWorldMechanic.kind} aria-label="Active world mechanic">
                <div><small>WORLD {String(currentModule.number).padStart(2, "0")} EVENT</small><strong>{activeWorldMechanic.event}</strong><p>{activeWorldMechanic.description}</p></div>
                <div className="world-charge"><span><b style={{ width: activeWorldCharge + "%" }} /></span><small>RELAY CHARGE {activeWorldCharge}%</small></div>
                <div><small>DAILY WORLD POWER</small><strong>{activeWorldMechanic.power}</strong><p>{activeWorldMechanic.effect}</p>{lessonStage === "quiz" ? <button onClick={activateWorldPower} disabled={worldPowerUsed || quizResult === "passed"}>{worldPowerUsed ? "Power recharging" : "Deploy power"}</button> : <em>Available at the checkpoint</em>}</div>
              </section>
            </>
          )}

          {lessonStage === "theory" ? (
            <TheoryLessonView
              quest={activeQuest}
              theory={activeTheory}
              enrichment={activeLessonEnrichment ?? null}
              trackIcon={activeTrack.icon}
              requiredProject={isRequiredWorldProject}
              genAILab={Boolean(activeGenAILab)}
              onContinue={() => setLessonStage("example")}
            />
          ) : lessonStage === "example" ? (
            <ExampleLessonView
              quest={activeQuest}
              enrichment={activeLessonEnrichment ?? null}
              trackId={activeTrack.id}
              onReview={() => setLessonStage("theory")}
              onCheckpoint={() => { setQuizAnswers({}); setQuizResult("idle"); setLessonStage("quiz"); }}
            />
          ) : lessonStage === "quiz" ? (
            <QuizLessonView
              quest={activeQuest}
              questions={activeQuiz}
              answers={quizAnswers}
              result={quizResult}
              eliminatedOptions={eliminatedQuizOptions}
              worldPowerHint={worldPowerHint}
              worldPowerName={activeWorldMechanic.power}
              requiredProject={isRequiredWorldProject}
              genAILab={Boolean(activeGenAILab)}
              onAnswer={(questionIndex, optionIndex) => { setQuizAnswers((current) => ({ ...current, [questionIndex]: optionIndex })); setQuizResult("idle"); }}
              onOpenBonus={openBonus}
              onNext={openNextSection}
              onSubmit={submitQuiz}
            />
          ) : (
            <LabWorkspaceView
              quest={activeQuest}
              trackId={activeTrack.id}
              genAILab={activeGenAILab}
              challenge={activeChallenge}
              dailyQuestMode={dailyQuestMode}
              dailyQuestCompleted={dailyQuestCompletedToday}
              requiredProject={isRequiredWorldProject}
              finalQuest={isFinalQuest}
              bonusXp={bonusXp}
              code={code}
              status={status}
              terminal={terminal}
              sceneStep={sceneStep}
              executionResult={executionResult}
              executionPhase={executionPhase}
              runtimeReadiness={runtimeReadiness}
              onReset={openBonus}
              onCodeChange={(value) => { setCode(value); setStatus("idle"); setExecutionResult(null); setTerminal(activeGenAILab ? "Lab changed. Run it through the controlled AI evaluator." : "Code changed. Run it to see what happens."); }}
              onRun={runCode}
              onStop={stopExecution}
              onSubmit={submitBonus}
              onNext={openNextSection}
            />
          )}
        </section>
      )}
    </main>
  );
}
