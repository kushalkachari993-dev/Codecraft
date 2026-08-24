"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { SignInButton, useAuth, useClerk, useUser } from "@clerk/react";
import { PYTHON_PACES, type PythonPaceId, type PythonTopic } from "./python-curriculum";
import { GENAI_PACES, buildGenAILab, validateGenAILab, type GenAIPaceId, type GenAITopic } from "./genai-curriculum";
import { SQL_PACES, type SQLPaceId, type SQLTopic } from "./sql-curriculum";
import { executeLab, prepareLabRuntime } from "./execution/client";
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
import type { ExecutionResult, RuntimeProgress, RuntimeWorkerTrack } from "./execution/types";
import { DEFAULT_PROGRESS, mergeProgress, normalizeProgress, type AvatarId, type PlayerProgress } from "./progress";

type RunState = "idle" | "running" | "ready" | "error" | "complete";
type RuntimeReadiness = "idle" | "preparing" | "ready" | "error";
type View = "tracks" | "paces" | "roadmap" | "quest";
type LessonStage = "theory" | "example" | "quiz" | "bonus";

type Quest = {
  id: number;
  chapter: string;
  title: string;
  concept: string;
  description: string;
  objective: string;
  guide: string;
  starterCode: string;
  snippets: Array<{ label: string; code: string }>;
  xp: number;
  badge: string;
  scene: "movement" | "bridge" | "supplies" | "vault";
  steps: number;
  validate: (code: string) => string | null;
};

type QuizQuestion = { question: string; options: string[]; answer: number; explanation: string };
type TheoryContent = {
  overview: string;
  deeper: string;
  keyIdeas: Array<{ title: string; body: string }>;
  mentalModel: string;
  commonMistake: string;
  checkYourself: string[];
};
type CloudUser = { displayName: string; email: string };
type CloudState = "checking" | "local" | "syncing" | "synced" | "error";
type SavedSubmission = {
  submission_id: string;
  track: Track["id"];
  pace: PythonPaceId;
  topic_id: number;
  topic: string;
  stage: "attempt" | "submitted";
  passed: number | boolean;
  score: number;
  created_at: number;
};
type SubmissionsState = "idle" | "loading" | "ready" | "error";

type Track = {
  id: "python" | "genai" | "sql";
  label: string;
  world: string;
  kicker: string;
  description: string;
  outcome: string;
  mission: string;
  energy: string;
  icon: string;
  worldTwo: string;
  nextWorld: string;
};

const TRACKS: Track[] = [
  { id: "python", label: "Python", world: "Logic Highlands", worldTwo: "The Function Relay", kicker: "PYTHON TRAIL", description: "Learn programming foundations while Byte restores the living systems of the Code Realms.", outcome: "Commands · Loops · Functions · Collections", mission: "Repair the Logic Relay and reconnect every automation node.", energy: "Lumen shards", icon: "Py", nextWorld: "Object Odyssey" },
  { id: "genai", label: "GenAI", world: "Prompt Frontier", worldTwo: "The Agent Foundry", kicker: "AI EXPLORER TRAIL", description: "Learn how to prompt, guide, structure, and evaluate intelligent systems across a fractured signal frontier.", outcome: "Prompts · Grounding · Tools · Evaluation", mission: "Rebuild the Signal Archive and teach its agents to respond reliably.", energy: "Echo cores", icon: "AI", nextWorld: "Multimodal Metropolis" },
  { id: "sql", label: "SQL", world: "Data Depths", worldTwo: "The Analytics Citadel", kicker: "DATABASE TRAIL", description: "Explore a buried data realm using queries that reveal, connect, and analyze its records.", outcome: "SELECT · JOIN · Subqueries · Windows", mission: "Restore the Data Nexus and recover the realm's lost records.", energy: "Index crystals", icon: "DB", nextWorld: "Performance Nexus" },
];

const AVATARS: Array<{ id: AvatarId; name: string; glyph: string; description: string; unlockAt: number }> = [
  { id: "relay-scout", name: "Relay Scout", glyph: "◇", description: "Fast, curious, and tuned to hidden signals.", unlockAt: 0 },
  { id: "signal-mage", name: "Signal Mage", glyph: "✦", description: "Channels knowledge into powerful system repairs.", unlockAt: 5 },
  { id: "core-runner", name: "Core Runner", glyph: "◆", description: "Built for world projects and deep system missions.", unlockAt: 15 },
];

const PYTHON_PACE_XP: Record<PythonPaceId, number> = { beginner: 35, intermediate: 60, expert: 90 };
const PYTHON_PACE_BADGES: Record<PythonPaceId, string> = { beginner: "Trail", intermediate: "Forge", expert: "Mastery" };
const PYTHON_PACE_MODULES: Record<PythonPaceId, Array<{ name: string; size: number }>> = {
  beginner: [
    { name: "Spawn Point", size: 5 },
    { name: "Inventory Basics", size: 4 },
    { name: "Logic Vaults", size: 5 },
    { name: "Builder Toolkit", size: 7 },
    { name: "Algorithm Grove", size: 3 },
  ],
  intermediate: [
    { name: "Object Workshop", size: 5 },
    { name: "Pythonic Forge", size: 5 },
    { name: "Standard Library Citadel", size: 6 },
    { name: "Web Gateway", size: 5 },
    { name: "Algorithm Arena", size: 5 },
    { name: "Project Foundry", size: 3 },
  ],
  expert: [
    { name: "Object Core", size: 4 },
    { name: "Runtime Depths", size: 6 },
    { name: "Type & API Forge", size: 5 },
    { name: "Deployment Citadel", size: 6 },
    { name: "CPython Lab", size: 4 },
    { name: "Systems Frontier", size: 5 },
  ],
};

function getPythonModule(paceId: PythonPaceId, questId: number) {
  let start = 1;
  for (const [index, module] of PYTHON_PACE_MODULES[paceId].entries()) {
    const end = start + module.size - 1;
    if (questId >= start && questId <= end) return { ...module, number: index + 1, start, end };
    start = end + 1;
  }
  return { ...PYTHON_PACE_MODULES[paceId][0], number: 1, start: 1, end: PYTHON_PACE_MODULES[paceId][0].size };
}

function buildPythonPaceQuests(paceId: PythonPaceId): Quest[] {
  const pace = PYTHON_PACES.find((item) => item.id === paceId) ?? PYTHON_PACES[0];
  const scenes: Quest["scene"][] = ["movement", "bridge", "supplies", "vault"];

  return pace.topics.map((topic, index) => ({
    id: index + 1,
    chapter: topic.title,
    title: topic.title,
    concept: topic.title,
    description: topic.summary,
    objective: topic.learningGoal,
    guide: topic.summary,
    starterCode: topic.example,
    snippets: [],
    xp: PYTHON_PACE_XP[paceId] + Math.floor(index / 6) * 5,
    badge: `${topic.title} ${PYTHON_PACE_BADGES[paceId]}`,
    scene: scenes[index % scenes.length],
    steps: 3 + (index % 2),
    validate: (code) => {
      const meaningfulCode = code
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .join("");
      return meaningfulCode.length >= 8
        ? null
        : `Add a small working example that demonstrates ${topic.title}.`;
    },
  }));
}

function buildPythonTheory(topic: PythonTopic): TheoryContent {
  return {
    overview: topic.summary,
    deeper: topic.learningGoal,
    keyIdeas: topic.keyIdeas,
    mentalModel: topic.mentalModel,
    commonMistake: topic.commonMistake,
    checkYourself: [
      `Can I explain ${topic.title} in my own words?`,
      "Can I predict what the example will do before running it?",
      "Can I identify when this idea is useful in a real project?",
    ],
  };
}

const GENAI_PACE_XP: Record<GenAIPaceId, number> = { beginner: 40, intermediate: 70, expert: 100 };
const GENAI_PACE_BADGES: Record<GenAIPaceId, string> = { beginner: "Signal", intermediate: "Systems", expert: "Architect" };
const GENAI_PACE_MODULES: Record<GenAIPaceId, Array<{ name: string; size: number }>> = {
  beginner: [
    { name: "Intelligence Foundations", size: 5 },
    { name: "Token & Context Lab", size: 4 },
    { name: "Reliable Model Gateway", size: 5 },
    { name: "Retrieval Frontier", size: 4 },
  ],
  intermediate: [
    { name: "Transformer Systems", size: 5 },
    { name: "Search & RAG Grid", size: 5 },
    { name: "Agent Relay", size: 5 },
    { name: "Workflow Graphs", size: 5 },
    { name: "Safety & Scale", size: 5 },
  ],
  expert: [
    { name: "Model Engine", size: 5 },
    { name: "Inference Grid", size: 5 },
    { name: "Context & Agent Core", size: 5 },
    { name: "Evaluation Operations", size: 5 },
    { name: "Reliability & Security", size: 4 },
    { name: "Platform Frontier", size: 4 },
  ],
};

function getGenAIModule(paceId: GenAIPaceId, questId: number) {
  let start = 1;
  for (const [index, module] of GENAI_PACE_MODULES[paceId].entries()) {
    const end = start + module.size - 1;
    if (questId >= start && questId <= end) return { ...module, number: index + 1, start, end };
    start = end + 1;
  }
  return { ...GENAI_PACE_MODULES[paceId][0], number: 1, start: 1, end: GENAI_PACE_MODULES[paceId][0].size };
}

function buildGenAIPaceQuests(paceId: GenAIPaceId): Quest[] {
  const pace = GENAI_PACES.find((item) => item.id === paceId) ?? GENAI_PACES[0];
  const scenes: Quest["scene"][] = ["vault", "movement", "bridge", "supplies"];

  return pace.topics.map((topic, index) => ({
    id: index + 1,
    chapter: topic.title,
    title: topic.title,
    concept: topic.title,
    description: topic.summary,
    objective: topic.learningGoal,
    guide: topic.summary,
    starterCode: topic.example,
    snippets: [],
    xp: GENAI_PACE_XP[paceId] + Math.floor(index / 5) * 5,
    badge: topic.title + " " + GENAI_PACE_BADGES[paceId],
    scene: scenes[index % scenes.length],
    steps: 3 + (index % 2),
    validate: (code) => {
      const meaningfulCode = code
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .join("");
      return meaningfulCode.length >= 8
        ? null
        : "Add a small working example that demonstrates " + topic.title + ".";
    },
  }));
}

function buildGenAITheory(topic: GenAITopic): TheoryContent {
  return {
    overview: topic.summary,
    deeper: topic.learningGoal,
    keyIdeas: topic.keyIdeas,
    mentalModel: topic.mentalModel,
    commonMistake: topic.commonMistake,
    checkYourself: [
      "Can I explain " + topic.title + " in my own words?",
      "Can I trace where this concept fits in a complete GenAI system?",
      "Can I name one failure mode and the control that addresses it?",
    ],
  };
}

const SQL_PACE_XP: Record<SQLPaceId, number> = { beginner: 40, intermediate: 70, expert: 100 };
const SQL_PACE_BADGES: Record<SQLPaceId, string> = { beginner: "Query", intermediate: "Engineer", expert: "Architect" };
const SQL_PACE_MODULES: Record<SQLPaceId, Array<{ name: string; size: number }>> = {
  beginner: [
    { name: "Data Foundations", size: 5 },
    { name: "Query Relay", size: 5 },
    { name: "Aggregation Lab", size: 5 },
    { name: "Integrity Network", size: 4 },
    { name: "Relational Design", size: 4 },
  ],
  intermediate: [
    { name: "Advanced Query Grid", size: 4 },
    { name: "Analytical Engine", size: 5 },
    { name: "Schema & Index Lab", size: 4 },
    { name: "Transaction Core", size: 5 },
    { name: "Automation & Data", size: 4 },
    { name: "Production Access", size: 4 },
  ],
  expert: [
    { name: "Optimizer Core", size: 5 },
    { name: "Storage & Concurrency", size: 5 },
    { name: "Durability Grid", size: 5 },
    { name: "Production Platform", size: 5 },
    { name: "Performance & Analytics", size: 5 },
    { name: "Architecture Frontier", size: 4 },
  ],
};

function getSQLModule(paceId: SQLPaceId, questId: number) {
  let start = 1;
  for (const [index, module] of SQL_PACE_MODULES[paceId].entries()) {
    const end = start + module.size - 1;
    if (questId >= start && questId <= end) return { ...module, number: index + 1, start, end };
    start = end + 1;
  }
  return { ...SQL_PACE_MODULES[paceId][0], number: 1, start: 1, end: SQL_PACE_MODULES[paceId][0].size };
}

function buildSQLPaceQuests(paceId: SQLPaceId): Quest[] {
  const pace = SQL_PACES.find((item) => item.id === paceId) ?? SQL_PACES[0];
  const scenes: Quest["scene"][] = ["supplies", "vault", "bridge", "movement"];

  return pace.topics.map((topic, index) => ({
    id: index + 1,
    chapter: topic.title,
    title: topic.title,
    concept: topic.title,
    description: topic.summary,
    objective: topic.learningGoal,
    guide: topic.summary,
    starterCode: topic.example,
    snippets: [],
    xp: SQL_PACE_XP[paceId] + Math.floor(index / 5) * 5,
    badge: topic.title + " " + SQL_PACE_BADGES[paceId],
    scene: scenes[index % scenes.length],
    steps: 3 + (index % 2),
    validate: (code) => {
      const meaningfulCode = code
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("--") && !line.startsWith("#"))
        .join("");
      return meaningfulCode.length >= 8
        ? null
        : "Add a small working SQL example that demonstrates " + topic.title + ".";
    },
  }));
}

function buildSQLTheory(topic: SQLTopic): TheoryContent {
  return {
    overview: topic.summary,
    deeper: topic.learningGoal,
    keyIdeas: topic.keyIdeas,
    mentalModel: topic.mentalModel,
    commonMistake: topic.commonMistake,
    checkYourself: [
      "Can I explain " + topic.title + " in my own words?",
      "Can I predict the rows or system behavior before running the example?",
      "Can I name the correctness or performance risk this concept addresses?",
    ],
  };
}

function rotateQuizOptions(question: QuizQuestion, offset: number): QuizQuestion {
  const shift = offset % question.options.length;
  return {
    ...question,
    options: [...question.options.slice(shift), ...question.options.slice(0, shift)],
    answer: (question.answer - shift + question.options.length) % question.options.length,
  };
}

function buildQuiz(quest: Quest, authored: QuizQuestion[] | null = null): QuizQuestion[] {
  if (authored) return authored;
  const firstCodeLine = quest.starterCode.split("\n").find((line) => line.trim() && !line.trim().startsWith("#")) ?? quest.starterCode;
  return [
    {
      question: `What is the main idea behind ${quest.concept}?`,
      options: [quest.guide, "It changes the visual theme of the editor.", "It skips the program and completes the quest.", "It stores progress without running code."],
      answer: 0,
      explanation: quest.guide,
    },
    {
      question: "Which line is part of a correct solution for this section?",
      options: [firstCodeLine, "skip_quest()", "answer = always_true", "delete_world()"],
      answer: 0,
      explanation: `The solution begins with: ${firstCodeLine}`,
    },
    {
      question: "What should the finished program accomplish?",
      options: [quest.objective, "Only display a decorative message", "Unlock every track immediately", "Run without using the lesson concept"],
      answer: 0,
      explanation: `The section objective is: ${quest.objective}.`,
    },
  ].map((question, index) => rotateQuizOptions(question, quest.id + index));
}

function loadProgress(): PlayerProgress {
  try {
    const saved = window.localStorage.getItem("codecraft-progress-v3");
    if (saved) {
      return normalizeProgress(JSON.parse(saved));
    }

    const previous = window.localStorage.getItem("codecraft-progress-v2");
    if (previous) {
      const parsed = JSON.parse(previous) as { xp?: number; completed?: number[] };
      return normalizeProgress({
        xp: Number.isFinite(parsed.xp) ? Number(parsed.xp) : DEFAULT_PROGRESS.xp,
        completed: { python: Array.isArray(parsed.completed) ? parsed.completed : [] },
        coding: { python: Array.isArray(parsed.completed) ? parsed.completed : [] },
      });
    }

    const legacyXp = Number(window.localStorage.getItem("codecraft-xp"));
    return Number.isFinite(legacyXp) && legacyXp > 0
      ? normalizeProgress({ xp: legacyXp })
      : DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export default function Home() {
  const { getToken, isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useAuth();
  const clerk = useClerk();
  const { user: clerkProfile } = useUser();
  const [view, setView] = useState<View>("tracks");
  const [activeTrackId, setActiveTrackId] = useState<Track["id"]>("python");
  const [activePythonPaceId, setActivePythonPaceId] = useState<PythonPaceId>("beginner");
  const [activeGenAIPaceId, setActiveGenAIPaceId] = useState<GenAIPaceId>("beginner");
  const [activeSQLPaceId, setActiveSQLPaceId] = useState<SQLPaceId>("beginner");
  const [hasChosenPythonPace, setHasChosenPythonPace] = useState(false);
  const [hasChosenGenAIPace, setHasChosenGenAIPace] = useState(false);
  const [hasChosenSQLPace, setHasChosenSQLPace] = useState(false);
  const [activeQuestId, setActiveQuestId] = useState(1);
  const [code, setCode] = useState(() => buildPythonPaceQuests("beginner")[0].starterCode);
  const [status, setStatus] = useState<RunState>("idle");
  const [terminal, setTerminal] = useState("Your output will appear here.");
  const [sceneStep, setSceneStep] = useState(0);
  const [progress, setProgress] = useState<PlayerProgress>(() => typeof window === "undefined" ? DEFAULT_PROGRESS : loadProgress());
  const [lessonStage, setLessonStage] = useState<LessonStage>("theory");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<"idle" | "incomplete" | "passed" | "failed">("idle");
  const runToken = useRef(0);
  const executionAbort = useRef<AbortController | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionPhase, setExecutionPhase] = useState("");
  const [runtimeReadiness, setRuntimeReadiness] = useState<Record<RuntimeWorkerTrack, RuntimeReadiness>>({ python: "idle", sql: "idle" });
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [cloudState, setCloudState] = useState<CloudState>("checking");
  const [progressReady, setProgressReady] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [firstNameDraft, setFirstNameDraft] = useState("");
  const [lastNameDraft, setLastNameDraft] = useState("");
  const [nameSaveState, setNameSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [nameError, setNameError] = useState("");
  const [savedSubmissions, setSavedSubmissions] = useState<SavedSubmission[]>([]);
  const [submissionsState, setSubmissionsState] = useState<SubmissionsState>("idle");
  const [storyStep, setStoryStep] = useState(0);
  const [gameToast, setGameToast] = useState("");
  const clerkDisplayName = clerkProfile?.fullName
    ?? clerkProfile?.firstName
    ?? clerkProfile?.primaryEmailAddress?.emailAddress
    ?? "CodeCraft learner";
  const clerkEmail = clerkProfile?.primaryEmailAddress?.emailAddress ?? "";

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
    ?? getRoundTwelveLessonEnrichment(activeTrack.id, activePaceId, activeQuest.title);
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
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyTopics = progress.game.dailyDate === todayKey ? progress.game.dailyTopics : 0;
  const dailyLabs = progress.game.dailyDate === todayKey ? progress.game.dailyLabs : 0;
  const achievements = [
    { id: "first-signal", icon: "◇", name: "First Signal", detail: "Complete your first topic", unlocked: totalBadges >= 1 },
    { id: "badge-hunter", icon: "✦", name: "Badge Hunter", detail: "Recover 10 topic badges", unlocked: totalBadges >= 10 },
    { id: "world-restorer", icon: "◆", name: "World Restorer", detail: "Defeat a world boss", unlocked: totalProjects >= 1 },
    { id: "three-realms", icon: "△", name: "Three Realms", detail: "Study Python, GenAI, and SQL", unlocked: trackProfileStats.every((track) => track.completed > 0) },
    { id: "streak-runner", icon: "↟", name: "Streak Runner", detail: "Reach a 3-day streak", unlocked: progress.game.streakDays >= 3 },
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
  const isRequiredWorldProject = activeQuest.id === currentModule.end;
  const activeGenAILab = activeTrack.id === "genai"
    ? buildGenAILab(activeGenAIPace.topics[activeQuest.id - 1], isRequiredWorldProject, currentModule.name)
    : null;
  const activeChallenge = activeTrack.id === "python"
    ? buildPythonChallenge(activePythonPace.topics[activeQuest.id - 1], { required: isRequiredWorldProject, worldName: currentModule.name })
    : activeTrack.id === "sql"
      ? buildSQLChallenge(activeSQLPace.topics[activeQuest.id - 1], { required: isRequiredWorldProject, worldName: currentModule.name })
      : null;
  const bonusXp = isRequiredWorldProject ? 75 : 20;
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

  useEffect(() => {
    if (!clerkLoaded) return;
    const controller = new AbortController();
    const localProgress = loadProgress();
    void Promise.resolve().then(async () => {
      if (!clerkSignedIn) {
        setCloudUser(null);
        setCloudState("local");
        setProgressReady(true);
        return null;
      }
      const token = await getToken();
      if (!token) throw new Error("Clerk session token is unavailable");
      return fetch("/api/progress", { signal: controller.signal, headers: { accept: "application/json", authorization: `Bearer ${token}` } });
    })
      .then(async (response) => {
        if (!response) return null;
        if (!response.ok) throw new Error("Progress lookup failed");
        return response.json() as Promise<{ user: CloudUser | null; progress: PlayerProgress | null }>;
      })
      .then((payload) => {
        if (!payload) return;
        if (!payload.user) {
          setCloudState("local");
          return;
        }
        const merged = mergeProgress(localProgress, normalizeProgress(payload.progress));
        window.localStorage.setItem("codecraft-progress-v3", JSON.stringify(merged));
        window.localStorage.setItem("codecraft-xp", String(merged.xp));
        setProgress(merged);
        setCloudUser({ displayName: clerkDisplayName, email: clerkEmail });
        setCloudState("syncing");
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") setCloudState("local");
      })
      .finally(() => setProgressReady(true));
    return () => {
      controller.abort();
      runToken.current += 1;
      executionAbort.current?.abort();
    };
  }, [clerkDisplayName, clerkEmail, clerkLoaded, clerkSignedIn, getToken]);

  useEffect(() => {
    if (!progressReady || !cloudUser || !clerkSignedIn) return;
    const saveTimer = window.setTimeout(() => {
      setCloudState("syncing");
      void getToken().then((token) => {
        if (!token) throw new Error("Clerk session token is unavailable");
        return fetch("/api/progress", {
          method: "PUT",
          headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
          body: JSON.stringify({ progress }),
        });
      }).then((response) => {
        if (!response.ok) throw new Error("Cloud save failed");
        setCloudState("synced");
      }).catch(() => setCloudState("error"));
    }, 650);
    return () => window.clearTimeout(saveTimer);
  }, [clerkSignedIn, cloudUser, getToken, progress, progressReady]);

  useEffect(() => {
    if (!profileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!profileOpen || !clerkSignedIn) return;
    const controller = new AbortController();
    void Promise.resolve()
      .then(() => {
        setSubmissionsState("loading");
        return getToken();
      })
      .then((token) => {
        if (!token) throw new Error("Clerk session token is unavailable");
        return fetch("/api/submissions", {
          signal: controller.signal,
          headers: { accept: "application/json", authorization: `Bearer ${token}` },
        });
      })
      .then((response) => {
        if (!response.ok) throw new Error("Submissions lookup failed");
        return response.json() as Promise<{ submissions?: SavedSubmission[] }>;
      })
      .then((payload) => {
        setSavedSubmissions(Array.isArray(payload.submissions) ? payload.submissions : []);
        setSubmissionsState("ready");
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") setSubmissionsState("error");
      });
    return () => controller.abort();
  }, [clerkSignedIn, getToken, profileOpen]);

  const persistProgress = (nextProgress: PlayerProgress) => {
    const normalized = normalizeProgress(nextProgress);
    window.localStorage.setItem("codecraft-progress-v3", JSON.stringify(normalized));
    window.localStorage.setItem("codecraft-xp", String(normalized.xp));
    setProgress(normalized);
  };

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
    const dailyRewardEarned = dailyTopicsNext >= 1 && !dailyClaimedPreviously;
    const totalCompletedNext = Object.values(baseProgress.completed).reduce((sum, ids) => sum + ids.length, 0);
    const inventory = new Set(baseProgress.game.inventory);
    inventory.add("Signal Compass");
    if (totalCompletedNext >= 1) inventory.add("Circuit Key");
    if (totalCompletedNext >= 5) inventory.add("Byte Beacon");
    if (totalCompletedNext >= 10) inventory.add("Archive Lens");
    if (worldProject) inventory.add(`${activeTrack.label} Relay Core`);
    if (kind === "lab") inventory.add("Runtime Shard");
    if (dailyRewardEarned) {
      inventory.add("Daily Signal Cache");
      setGameToast("DAILY MISSION COMPLETE · +25 XP · Signal Cache recovered");
    }
    return {
      ...baseProgress,
      xp: baseProgress.xp + (dailyRewardEarned ? 25 : 0),
      game: {
        ...baseProgress.game,
        streakDays,
        lastActiveDate: today,
        dailyDate: today,
        dailyTopics: dailyTopicsNext,
        dailyLabs: dailyLabsNext,
        dailyClaimed: dailyClaimedPreviously || dailyRewardEarned,
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

  const openProfile = () => {
    setFirstNameDraft(clerkProfile?.firstName ?? "");
    setLastNameDraft(clerkProfile?.lastName ?? "");
    setNameSaveState("idle");
    setNameError("");
    setSavedSubmissions([]);
    setSubmissionsState(clerkSignedIn ? "loading" : "idle");
    setEditingName(false);
    setProfileOpen(true);
  };

  const beginNameEdit = () => {
    setFirstNameDraft(clerkProfile?.firstName ?? "");
    setLastNameDraft(clerkProfile?.lastName ?? "");
    setNameSaveState("idle");
    setNameError("");
    setEditingName(true);
  };

  const closeProfile = () => {
    setEditingName(false);
    setProfileOpen(false);
  };

  const saveProfileName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clerkProfile) return;
    const firstName = firstNameDraft.trim();
    const lastName = lastNameDraft.trim();
    if (!firstName) {
      setNameSaveState("error");
      setNameError("Enter a first name or player name.");
      return;
    }
    setNameSaveState("saving");
    setNameError("");
    try {
      await clerkProfile.update({ firstName, lastName: lastName || null });
      await clerkProfile.reload();
      setNameSaveState("saved");
      setEditingName(false);
    } catch {
      setNameSaveState("error");
      setNameError("We could not save that name. Check it and try again.");
    }
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

  const clearRun = () => {
    runToken.current += 1;
    executionAbort.current?.abort();
    executionAbort.current = null;
    setExecutionPhase("");
    setExecutionResult(null);
  };

  const updateRuntimeReadiness = (track: RuntimeWorkerTrack, readiness: RuntimeReadiness) => {
    setRuntimeReadiness((current) => ({ ...current, [track]: readiness }));
  };

  const warmExecutionRuntime = (track: Track["id"]) => {
    if (track === "genai") return;
    updateRuntimeReadiness(track, "preparing");
    setExecutionPhase(track === "python"
      ? "Downloading and compiling Python once for this browser tab…"
      : "Downloading and compiling PostgreSQL once for this browser tab…");
    void prepareLabRuntime(track, (progress: RuntimeProgress) => {
      setExecutionPhase(progress.detail);
      if (progress.phase === "ready") updateRuntimeReadiness(track, "ready");
    }).then(() => {
      updateRuntimeReadiness(track, "ready");
      setExecutionPhase(track === "python" ? "Python runtime ready." : "PostgreSQL runtime ready.");
    }).catch(() => {
      updateRuntimeReadiness(track, "error");
      setExecutionPhase("Runtime preparation paused. Run the lab to retry.");
    });
  };

  const selectTrack = (track: Track) => {
    clearRun();
    setActiveTrackId(track.id);
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
    clearRun();
    setActiveQuestId(quest.id);
    if (startAtProject) {
      const projectModule = activeTrack.id === "python"
        ? getPythonModule(activePythonPaceId, quest.id)
        : activeTrack.id === "genai"
          ? getGenAIModule(activeGenAIPaceId, quest.id)
          : getSQLModule(activeSQLPaceId, quest.id);
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
    setView("quest");
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
    executionAbort.current?.abort();
    const controller = new AbortController();
    executionAbort.current = controller;
    const currentRun = runToken.current + 1;
    runToken.current = currentRun;
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
    if (currentRun !== runToken.current) return;
    executionAbort.current = null;
    setExecutionPhase("");
    if (activeTrack.id !== "genai") updateRuntimeReadiness(activeTrack.id, result.runtime === "controlled-local" ? "error" : "ready");
    setExecutionResult(result);
    saveSubmission(result, "attempt");

    if (!result.passed) {
      setSceneStep(0);
      setStatus("error");
      setTerminal(result.error ? "> Execution stopped\n! " + result.error : "> Test run complete\n! Review the failed checks below and try again.");
      return;
    }

    const alreadySubmitted = trackBonus.includes(activeQuest.id);
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

  const stopExecution = () => {
    runToken.current += 1;
    executionAbort.current?.abort();
    executionAbort.current = null;
    setExecutionPhase("");
    if (activeTrack.id !== "genai") updateRuntimeReadiness(activeTrack.id, "idle");
    setStatus("idle");
    setTerminal("> Execution stopped by learner.\nEdit or reset the lab when you are ready.");
  };

  const submitQuiz = () => {
    if (Object.keys(quizAnswers).length < activeQuiz.length) {
      setQuizResult("incomplete");
      return;
    }

    const score = activeQuiz.filter((question, index) => quizAnswers[index] === question.answer).length;
    if (score !== activeQuiz.length) {
      setQuizResult("failed");
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
  };

  const openBonus = () => {
    clearRun();
    setExecutionResult(null);
    setCode(activeGenAILab?.starterCode ?? activeChallenge?.starterCode ?? `# Optional challenge\n# Rebuild the solution without using the helper snippets.\n`);
    setStatus(trackBonus.includes(activeQuest.id) ? "complete" : "idle");
    setTerminal(trackBonus.includes(activeQuest.id)
      ? "> Lab already complete\n✓ Your XP and progress are saved."
      : activeGenAILab
        ? activeGenAILab.required
          ? "Required world project ready. Pass every rubric check to stabilize this world."
          : "Controlled AI practice lab ready. No personal API key or credits are needed."
        : activeTrack.id === "sql"
          ? isRequiredWorldProject ? "Required database project ready. Build the report view and pass every database-state check." : "Practice database ready. Run real PostgreSQL against a fresh dataset."
          : isRequiredWorldProject ? "Required Python project ready. Build the relay report and pass every hidden test." : "Python sandbox ready. Run real Python directly in your browser.");
    setSceneStep(trackBonus.includes(activeQuest.id) ? activeQuest.steps : 0);
    setLessonStage("bonus");
    warmExecutionRuntime(activeTrack.id);
  };

  const submitBonus = () => {
    if (status !== "ready" && status !== "complete") {
      setStatus("error");
      setTerminal("> Run required\n! Execute the current solution successfully before submitting it.");
      return;
    }
    if (!trackBonus.includes(activeQuest.id)) {
      const nextProgress: PlayerProgress = {
        ...progress,
        xp: progress.xp + bonusXp,
        bonus: { ...progress.bonus, [progressKey]: [...trackBonus, activeQuest.id].sort((a, b) => a - b) },
      };
      persistProgress(recordGameActivity(nextProgress, "lab", isRequiredWorldProject));
      playGameSound(isRequiredWorldProject ? "boss" : "complete");
    }
    if (executionResult) saveSubmission(executionResult, "submitted");
    setStatus("complete");
    setSceneStep(activeQuest.steps);
    setTerminal(isRequiredWorldProject
      ? "> Applied project complete!\n+ 75 project XP earned. " + (isFinalQuest ? "This path is complete." : "The next world is unlocked.")
      : "> Optional challenge complete!\n+ " + bonusXp + " bonus XP earned.");
  };

  const openNextSection = () => {
    if (activeQuest.id < activeQuests.length) openQuest(activeQuests[activeQuest.id]);
    else setView("roadmap");
  };

  return (
    <main className={`app-shell track-${activeTrack.id}`}>
      <header className="topbar">
        <button className="brand" onClick={() => setView("tracks")} aria-label="Open CodeCraft tracks">
          <span className="brand-cube" aria-hidden="true"><i /></span>
          <span>CODECRAFT</span>
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === "tracks" ? "active" : ""} onClick={() => setView("tracks")}>Tracks</button>
          {isPacedTrack && <button className={view === "paces" ? "active" : ""} onClick={() => setView("paces")}>Pace</button>}
          <button className={view === "roadmap" ? "active" : ""} onClick={() => setView(isPacedTrack && !hasChosenActivePace ? "paces" : "roadmap")}>Roadmap</button>
          <button className={view === "quest" ? "active" : ""} onClick={() => openQuest(activeQuest)}>Quest</button>
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

      {profileOpen && (
        <div className="profile-backdrop">
          <button className="profile-backdrop-dismiss" onClick={closeProfile} aria-label="Close profile" />
          <section className="profile-panel" id="codecraft-profile" role="dialog" aria-modal="true" aria-labelledby="profile-title">
            <button className="profile-close" onClick={closeProfile} aria-label="Close profile">×</button>
            <header className="profile-panel-hero">
              <div className={`profile-panel-avatar ${activeAvatar.id}`} aria-hidden="true">{activeAvatar.glyph}<small>LV {level}</small></div>
              <div>
                <p>CODECRAFT PLAYER PROFILE</p>
                <h2 id="profile-title">{profileDisplayName}</h2>
                <span>{clerkSignedIn ? clerkEmail : "Local adventurer"}</span>
              </div>
              {clerkSignedIn && !editingName && <button className="edit-name-button" onClick={beginNameEdit}>Edit name</button>}
            </header>

            {editingName && clerkSignedIn && (
              <form className="profile-name-form" onSubmit={saveProfileName}>
                <label><span>First or player name</span><input value={firstNameDraft} onChange={(event) => setFirstNameDraft(event.target.value)} maxLength={60} autoComplete="given-name" /></label>
                <label><span>Last name</span><input value={lastNameDraft} onChange={(event) => setLastNameDraft(event.target.value)} maxLength={60} autoComplete="family-name" /></label>
                {nameError && <p role="alert">{nameError}</p>}
                <div><button type="button" onClick={() => setEditingName(false)}>Cancel</button><button type="submit" disabled={nameSaveState === "saving"}>{nameSaveState === "saving" ? "Saving…" : "Save name"}</button></div>
              </form>
            )}

            <div className="profile-stats-grid" aria-label="Player progress summary">
              <article><small>LEVEL</small><strong>{level}</strong><span>{xpToNextLevel} XP to next</span></article>
              <article><small>TOPICS</small><strong>{totalBadges}</strong><span>completed</span></article>
              <article><small>PROJECTS</small><strong>{totalProjects}</strong><span>worlds restored</span></article>
              <article><small>XP</small><strong>{progress.xp}</strong><span>signal earned</span></article>
            </div>

            <section className="profile-level-progress">
              <div><p>LEVEL {level} PROGRESS</p><span>{levelProgress}/100 XP</span></div>
              <div role="progressbar" aria-label={`Level ${level} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={levelProgress}><i style={{ width: `${levelProgress}%` }} /></div>
            </section>

            <section className="profile-track-summary">
              <div className="profile-section-heading"><div><p>Badges by track</p><span>Every completed topic restores one signal badge.</span></div><strong>{totalBadges} TOTAL</strong></div>
              <div className="profile-track-list">
                {trackProfileStats.map((track) => (
                  <article className={track.id} key={track.id}>
                    <div className="profile-track-icon">{track.icon}</div>
                    <div><strong>{track.label}</strong><span>{track.completed}/{track.total} badges · {track.projects} projects</span><div><i style={{ width: `${track.percent}%` }} /></div></div>
                    <b>{track.percent}%</b>
                  </article>
                ))}
              </div>
            </section>

            <section className="profile-loadout">
              <div className="profile-section-heading"><div><p>Avatar loadout</p><span>Choose the explorer representing you in the Code Realms.</span></div><strong>{activeAvatar.name.toUpperCase()}</strong></div>
              <div className="avatar-options">
                {AVATARS.map((avatar) => {
                  const unlocked = totalBadges >= avatar.unlockAt;
                  return <button className={`${avatar.id} ${progress.game.avatarId === avatar.id ? "selected" : ""}`} key={avatar.id} disabled={!unlocked} onClick={() => chooseAvatar(avatar.id)}><span>{unlocked ? avatar.glyph : "▣"}</span><strong>{avatar.name}</strong><small>{unlocked ? avatar.description : `Unlock at ${avatar.unlockAt} badges`}</small></button>;
                })}
              </div>
            </section>

            <section className="profile-collection">
              <div className="profile-section-heading"><div><p>Inventory & achievements</p><span>Artifacts come from learning, labs, daily missions, and boss projects.</span></div><strong>{progress.game.inventory.length} ITEMS</strong></div>
              <div className="inventory-grid">
                {progress.game.inventory.map((item, index) => <div key={item}><span>{["◇", "◆", "✦", "◈"][index % 4]}</span><strong>{item}</strong></div>)}
              </div>
              <div className="achievement-grid" aria-label={`${unlockedAchievements} of ${achievements.length} achievements unlocked`}>
                {achievements.map((achievement) => <article className={achievement.unlocked ? "unlocked" : "locked"} key={achievement.id}><span>{achievement.unlocked ? achievement.icon : "?"}</span><div><strong>{achievement.name}</strong><small>{achievement.detail}</small></div></article>)}
              </div>
            </section>

            <section className="profile-submissions">
              <div className="profile-section-heading"><div><p>Saved submissions</p><span>Your latest cloud-saved lab attempts.</span></div>{savedSubmissions.length > 0 && <strong>{savedSubmissions.length} RECENT</strong>}</div>
              {!clerkSignedIn ? (
                <div className="profile-empty"><span>◇</span><p><strong>Sign in to save attempts</strong>Your local XP remains available, and future submissions will sync to your account.</p></div>
              ) : submissionsState === "loading" ? (
                <div className="profile-loading"><i /> Loading saved submissions…</div>
              ) : submissionsState === "error" ? (
                <div className="profile-empty"><span>!</span><p><strong>Submissions are temporarily unavailable</strong>Your current progress is still safe.</p></div>
              ) : savedSubmissions.length === 0 ? (
                <div className="profile-empty"><span>◇</span><p><strong>No saved submissions yet</strong>Run and submit an optional lab to create your first record.</p></div>
              ) : (
                <div className="submission-list">
                  {savedSubmissions.slice(0, 8).map((submission) => (
                    <article key={submission.submission_id}>
                      <span className={submission.passed ? "passed" : "failed"}>{submission.passed ? "✓" : "!"}</span>
                      <div><strong>{submission.topic}</strong><small>{submission.track.toUpperCase()} · {submission.pace.toUpperCase()} · {submission.stage === "submitted" ? "SUBMITTED" : "ATTEMPT"}</small></div>
                      <div><b>{submission.score}%</b><time dateTime={new Date(submission.created_at).toISOString()}>{new Date(submission.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time></div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <footer className="profile-account-actions">
              {clerkSignedIn ? (
                <>
                  <button onClick={() => { closeProfile(); clerk.openUserProfile(); }}>Manage Clerk account</button>
                  <a href="/account/delete">Delete account</a>
                  <button className="sign-out-button" onClick={() => { closeProfile(); void clerk.signOut({ redirectUrl: "/" }); }}>Sign out</button>
                </>
              ) : (
                <SignInButton mode="modal"><button onClick={closeProfile}>Sign in to sync and edit name</button></SignInButton>
              )}
            </footer>
            <div className="profile-policy-links"><a href="/privacy">Privacy</a><span>·</span><a href="/api/health">Service status</a></div>
          </section>
        </div>
      )}

      {view === "tracks" ? (
        <section className="track-picker">
          <div className="track-picker-hero">
            <p className="pixel-kicker">ORIGINAL CODE REALMS · CHOOSE YOUR MISSION</p>
            <h1>Repair the Core Relay.<br /><span>Master real code.</span></h1>
            <p>The Code Realms have fallen out of sync. Join Byte, restore their systems one concept at a time, and turn knowledge into power.</p>
          </div>
          <div className="track-grid">
            {TRACKS.map((track) => {
              const trackPaces = track.id === "python" ? PYTHON_PACES : track.id === "genai" ? GENAI_PACES : SQL_PACES;
              const total = trackPaces.reduce((sum, pace) => sum + pace.topics.length, 0);
              const completed = trackPaces.reduce((sum, pace) => sum + (progress.completed[`${track.id}-${pace.id}`]?.length ?? 0), 0);
              const percent = Math.round((completed / total) * 100);
              return (
                <article className={`track-card ${track.id}`} key={track.id}>
                  <div className="track-art" aria-hidden="true"><span>{track.icon}</span><i /><i /></div>
                  <div className="track-card-body">
                    <p>{track.kicker}</p>
                    <h2>{track.label}</h2>
                    <strong>Beginner · Intermediate · Expert</strong>
                    <span>{track.description}</span>
                    <div className="realm-signature"><small>REALM MISSION</small><p>{track.mission}</p><b>◆ {track.energy}</b></div>
                    <div className="track-skills">{track.outcome.split(" · ").map((skill) => <small key={skill}>{skill}</small>)}</div>
                    <div className="track-card-progress"><div><i style={{ width: `${percent}%` }} /></div><span>{completed}/{total} topics</span></div>
                    <button onClick={() => selectTrack(track)}>Choose your pace →</button>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="codecraft-lore" aria-label="CodeCraft universe">
            <article><span>01</span><div><small>YOUR GUIDE</small><strong>Byte</strong><p>A relay guardian who turns your code into actions inside each realm.</p></div></article>
            <article><span>02</span><div><small>YOUR POWER</small><strong>Signal shards</strong><p>Earned through understanding, checkpoints, and optional practice.</p></div></article>
            <article><span>03</span><div><small>YOUR MISSION</small><strong>The Core Relay</strong><p>Reconnect every realm and return knowledge to the network.</p></div></article>
          </div>
          <div className="track-picker-note"><span>◆</span><p><strong>{cloudUser ? "Progress synced across devices" : "Progress stays with you"}</strong>{cloudUser ? `Signed in as ${cloudUser.displayName}. Local progress was merged safely with your cloud save.` : "Your XP, badges, and restored systems stay on this device. Sign in above to migrate and sync them."}</p></div>
        </section>
      ) : view === "paces" ? (
        <section className={`python-pace-picker ${activeTrack.id}-pace-picker`}>
          <div className="pace-picker-hero">
            <button onClick={() => setView("tracks")}>← All tracks</button>
            <p className="pixel-kicker">{activeTrack.label.toUpperCase()} TRAIL · CHOOSE YOUR PATH</p>
            <h1>Choose your<br /><span>{activeTrack.label} pace</span></h1>
            <p>Start where you are. You can switch paths at any time, and progress is saved separately for every level.</p>
          </div>
          <div className="pace-grid">
            {activePaces.map((pace, index) => {
              const completed = progress.completed[`${activeTrack.id}-${pace.id}`]?.length ?? 0;
              const percent = Math.round((completed / pace.topics.length) * 100);
              return (
                <article className={`pace-card ${pace.id}`} key={pace.id}>
                  <div className="pace-card-art" aria-hidden="true"><span>{index + 1}</span><i /><i /><b>{pace.estimatedLevel}</b></div>
                  <div className="pace-card-body">
                    <div className="pace-tier"><span>PATH {String(index + 1).padStart(2, "0")}</span><small>{pace.topics.length} TOPICS</small></div>
                    <h2>{pace.label}</h2>
                    <strong>{pace.tagline}</strong>
                    <p>{pace.description}</p>
                    <div className="pace-for"><small>RECOMMENDED FOR</small><span>{pace.recommendedFor}</span></div>
                    <div className="pace-topic-preview">
                      {pace.topics.slice(0, 5).map((topic) => <span key={topic.title}>{topic.title}</span>)}
                      <span>+{pace.topics.length - 5} more</span>
                    </div>
                    <div className="pace-card-progress"><div><i style={{ width: `${percent}%` }} /></div><span>{completed}/{pace.topics.length} complete</span></div>
                    <button className="pace-card-cta" onClick={() => selectPace(pace.id)}>{completed ? `Continue ${pace.label}` : `Start ${pace.label}`} →</button>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="pace-picker-note"><span>◇</span><p><strong>Not sure where to begin?</strong>Start with Beginner. Completing one path is not required before exploring another.</p></div>
        </section>
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

          <section className="realm-command-center" aria-labelledby="realm-map-title">
            <header className="realm-command-header">
              <div><p className="pixel-kicker">LIVE REALM MAP · {activePace.label.toUpperCase()} PATH</p><h2 id="realm-map-title">Travel through the restored worlds</h2><span>Select any unlocked world. Your checkpoints and projects visibly energize its relay.</span></div>
              <div className="game-hud"><article><small>STREAK</small><strong>{progress.game.streakDays} DAYS</strong></article><article><small>INVENTORY</small><strong>{progress.game.inventory.length} ITEMS</strong></article><article><small>ACHIEVEMENTS</small><strong>{unlockedAchievements}/{achievements.length}</strong></article></div>
            </header>

            <div className="byte-comm">
              <span className="byte-comm-face">◆<small>BYTE</small></span>
              <div><p>GUIDE TRANSMISSION {storyStep + 1}/{byteStory.length}</p><strong>{byteStory[storyStep % byteStory.length]}</strong></div>
              <button onClick={() => { playGameSound("select"); setStoryStep((current) => (current + 1) % byteStory.length); }}>Next transmission →</button>
            </div>

            <div className="realm-map" style={{ "--world-count": activeWorlds.length } as CSSProperties}>
              <div className="realm-route" aria-hidden="true"><i style={{ width: `${activeWorlds.length > 1 ? (currentWorldIndex / (activeWorlds.length - 1)) * 100 : 100}%` }} /></div>
              {activeWorlds.map((world, index) => {
                const percent = Math.round((world.completed / world.size) * 100);
                const restored = world.completed === world.size && world.projectComplete;
                const bossReady = world.completed === world.size && !world.projectComplete;
                return (
                  <button className={`realm-world-node ${restored ? "restored" : bossReady ? "boss-ready" : world.unlocked ? "active" : "locked"} ${index === currentWorldIndex ? "player-here" : ""}`} key={world.name} onClick={() => enterWorld(world)} disabled={!world.unlocked}>
                    {index === currentWorldIndex && <span className={`map-player ${activeAvatar.id}`}>{activeAvatar.glyph}<small>YOU</small></span>}
                    <span className="realm-world-art" aria-hidden="true"><i /><i /><b>{restored ? "✓" : bossReady ? "!" : world.unlocked ? world.number : "▣"}</b></span>
                    <small>WORLD {String(world.number).padStart(2, "0")}</small>
                    <strong>{world.name}</strong>
                    <p>{restored ? "Relay fully restored" : bossReady ? "Boss project ready" : world.unlocked ? `${world.completed}/${world.size} systems repaired` : "Locked by previous boss"}</p>
                    <div><i style={{ width: `${restored ? 100 : percent}%` }} /></div>
                    <em>{restored ? "EXPLORE" : bossReady ? "ENTER BOSS" : world.unlocked ? "TRAVEL" : "LOCKED"}</em>
                  </button>
                );
              })}
            </div>
          </section>

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
              <div className="daily-card">
                <p>DAILY MISSION · {progress.game.streakDays} DAY STREAK</p>
                <strong>Restore one system</strong>
                <div><i className={dailyTopics >= 1 ? "done" : ""} /></div>
                <span>{dailyTopics >= 1 ? "Complete · +25 XP cache recovered" : `${dailyTopics} / 1 topics today`}</span>
                <small>Side objective: complete a lab · {dailyLabs}/1</small>
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
            <button onClick={() => setView("roadmap")}>← Roadmap</button>
            <div><span>{activeTrack.label.toUpperCase()} / {isPacedTrack ? `${activePace.label.toUpperCase()} / ` : ""}{activeQuest.chapter.toUpperCase()}</span><strong>{activeQuest.title}</strong></div>
            <div className="lesson-progress"><i style={{ width: `${((activeQuest.id - 1) / activeQuests.length) * 100}%` }} /></div>
            <span>{activeQuest.id} / {activeQuests.length}</span>
          </div>

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

          {lessonStage === "theory" ? (
            <section className="learning-screen">
              <div className="learning-main">
                <p className="pixel-kicker">STEP 1 · LEARN THE IDEA</p>
                <h1>{activeQuest.concept}</h1>
                <p className="learning-lead">{activeTheory.overview}</p>
                <div className="theory-foundation">
                  <span>CORE EXPLANATION</span>
                  <p>{activeTheory.deeper}</p>
                {activeLessonEnrichment && <div className="theory-foundation lesson-impact">
                  <span>WHY THIS MATTERS</span>
                  <p>{activeLessonEnrichment.whyItMatters}</p>
                </div>}
                </div>
                <div className="theory-heading"><span>KNOWLEDGE BLOCKS</span><h2>Build the concept piece by piece</h2></div>
                <div className="theory-grid rich">
                  {activeTheory.keyIdeas.map((idea, index) => <article key={idea.title}><span>0{index + 1}</span><div><h2>{idea.title}</h2><p>{idea.body}</p></div></article>)}
                </div>
                <div className="theory-insights">
                  <article className="mental-model"><span>◇ MENTAL MODEL</span><h2>Picture it this way</h2><p>{activeTheory.mentalModel}</p></article>
                  <article className="mistake-note"><span>! COMMON MISTAKE</span><h2>Watch out for this</h2><p>{activeTheory.commonMistake}</p></article>
                </div>
                <div className="theory-checklist">
                  <div><span>✓</span><div><small>QUICK SELF-CHECK</small><h2>Before you continue, ask yourself:</h2></div></div>
                  <ul>{activeTheory.checkYourself.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <button className="curriculum-next" onClick={() => setLessonStage("example")}>See an explained example →</button>
              </div>
              <aside className="learning-aside"><div className="lesson-orb">{activeTrack.icon}</div><p>SECTION GOAL</p><strong>{activeQuest.objective}</strong><span>Learn the idea, study an example, then prove your understanding.</span><div className="aside-route"><small>YOUR ROUTE</small><b>Learn</b><i /> <b>Example</b><i /> <b>Quiz</b><i /> <b>{isRequiredWorldProject ? "Project" : activeGenAILab ? "AI lab" : "Optional code"}</b></div></aside>
            </section>
          ) : lessonStage === "example" ? (
            <section className="learning-screen example-screen">
              <div className="learning-main">
                <p className="pixel-kicker">STEP 2 · EXAMPLE WALKTHROUGH</p>
                <h1>See {activeQuest.concept} in action</h1>
                <p className="learning-lead">Here is a complete, read-only example. Follow the idea line by line, then take the knowledge checkpoint.</p>
                <div className="example-code"><div><span>EXAMPLE.{activeTrack.id === "sql" ? "SQL" : "PY"}</span><small>READ ONLY</small></div><pre>{activeQuest.starterCode}</pre></div>
                <div className="walkthrough-list">
                  {(activeLessonEnrichment?.walkthrough ?? [
                    { title: "Set up the instruction", body: "The first meaningful line introduces the data, command, or query the program needs." },
                    { title: "Apply the concept", body: `The program uses ${activeQuest.concept.toLowerCase()} to perform the section's main job.` },
                    { title: "Check the result", body: `A correct run should: ${activeQuest.objective.toLowerCase()}.` },
                  ]).map((step, index) => <article key={step.title}><b>{index + 1}</b><p><strong>{step.title}</strong>{step.body}</p></article>)}
                </div>
                <div className="curriculum-actions"><button onClick={() => setLessonStage("theory")}>← Review theory</button><button className="curriculum-next" onClick={() => { setQuizAnswers({}); setQuizResult("idle"); setLessonStage("quiz"); }}>Take the checkpoint →</button></div>
              </div>
              <aside className="learning-aside example-aside"><p>FIELD NOTE</p><strong>Examples are maps, not answers to memorize.</strong><span>Notice the structure and explain what each part contributes. Coding practice is optional after the quiz.</span></aside>
            </section>
          ) : lessonStage === "quiz" ? (
            <section className="quiz-screen">
              <div className="quiz-heading"><p className="pixel-kicker">STEP 3 · REQUIRED CHECKPOINT</p><h1>Prove what you learned</h1><span>{isRequiredWorldProject ? `Answer all ${activeQuiz.length} questions correctly, then complete the applied project to stabilize this world.` : `Answer all ${activeQuiz.length} questions correctly to unlock the next section. No coding is required.`}</span></div>
              <div className="quiz-list">
                {activeQuiz.map((question, questionIndex) => (
                  <fieldset key={question.question}><legend><span>{questionIndex + 1}</span>{question.question}</legend>
                    {question.options.map((option, optionIndex) => <label className={quizAnswers[questionIndex] === optionIndex ? "selected" : ""} key={option}><input type="radio" name={`question-${questionIndex}`} checked={quizAnswers[questionIndex] === optionIndex} onChange={() => { setQuizAnswers((current) => ({ ...current, [questionIndex]: optionIndex })); setQuizResult("idle"); }} /><i>{String.fromCharCode(65 + optionIndex)}</i><span>{option}</span></label>)}
                    {quizResult !== "idle" && quizAnswers[questionIndex] !== undefined && <p className={quizAnswers[questionIndex] === question.answer ? "correct" : "incorrect"}>{quizAnswers[questionIndex] === question.answer ? `✓ Correct — ${question.explanation}` : `✕ ${question.explanation}`}</p>}
                  </fieldset>
                ))}
              </div>
              <div className={`quiz-result ${quizResult}`}><p>{quizResult === "passed" ? isRequiredWorldProject ? `Checkpoint passed! The ${activeQuest.badge} badge is yours. Finish the world project to continue.` : `Checkpoint passed! +${activeQuest.xp} signal XP and the ${activeQuest.badge} badge are yours.` : quizResult === "failed" ? "Some answers need another look. Review the explanations and try again." : quizResult === "incomplete" ? "Answer every question before submitting." : isRequiredWorldProject ? "A required applied project follows this checkpoint." : "The optional practice lab appears after you stabilize this system."}</p>
                {quizResult === "passed" ? isRequiredWorldProject ? <div><button className="curriculum-next" onClick={openBonus}>Start required world project →</button></div> : <div><button onClick={openBonus}>{activeGenAILab ? "Try optional AI lab +20 XP" : "Try optional coding +20 XP"}</button><button className="curriculum-next" onClick={openNextSection}>Skip bonus · Next section →</button></div> : <button className="curriculum-next" onClick={submitQuiz}>Check answers</button>}
              </div>
            </section>
          ) : (
          <div className="lesson-workspace">
            <section className="lesson-content">
              <div className="lesson-copy">
                <p className="pixel-kicker">{isRequiredWorldProject ? "WORLD BOSS · REQUIRED PROJECT" : "OPTIONAL SIDE MISSION"} · +{bonusXp} XP</p>
                <h1>{activeGenAILab?.title ?? activeChallenge?.title ?? "Optional coding challenge"}</h1>
                <p>{activeGenAILab?.brief ?? activeChallenge?.instructions ?? `Rebuild the ${activeQuest.concept} solution from a blank editor. This practice does not block your progress to the next section.`}</p>
                <div className="objective-card"><span>◆</span><div><small>YOUR OBJECTIVE</small><strong>{activeQuest.objective}</strong></div></div>
                <div className="guide-card"><span>?</span><p><strong>Field guide</strong>{activeQuest.guide}</p></div>
                {activeGenAILab && (
                  <div className={`genai-lab-kit ${activeGenAILab.required ? "required-project" : ""}`}>
                    <div className="genai-lab-meta"><span>{activeGenAILab.labType}</span><b>CONTROLLED AI LAB</b><small>NO PERSONAL API KEY · NO CREDITS</small></div>
                    <div className="genai-lab-resources">
                      <article><strong>SUPPLIED DATA</strong><div className="genai-lab-chips">{activeGenAILab.dataFiles.map((file) => <span key={file}>{file}</span>)}</div></article>
                      <article><strong>LAB TOOLS</strong><div className="genai-lab-chips">{activeGenAILab.tools.map((tool) => <span key={tool}>{tool}</span>)}</div></article>
                    </div>
                    <div className="genai-lab-criteria"><strong>SUCCESS CRITERIA</strong><ul>{activeGenAILab.successCriteria.map((criterion) => <li key={criterion}>✓ {criterion}</li>)}</ul></div>
                  </div>
                )}
                {activeChallenge && (
                  <div className="challenge-kit">
                    {activeChallenge.dataPreview && <div className="challenge-data"><strong>PRACTICE DATABASE</strong><div>{activeChallenge.dataPreview.map((item) => <span key={item}>{item}</span>)}</div></div>}
                    <div className="visible-examples">
                      {activeChallenge.visibleExamples.map((example) => <article key={example.label + example.input}><strong>{example.label}</strong><p><small>INPUT</small><code>{example.input}</code></p><p><small>EXPECTED</small><code>{example.output}</code></p></article>)}
                    </div>
                    <div className="hidden-check-note"><span>◈</span><p><strong>{(activeChallenge.runtime.pythonTests?.length ?? activeChallenge.runtime.sqlTests?.length ?? 0) + activeChallenge.runtime.requiredPatterns.length} HIDDEN CHECKS</strong>Run the solution to receive precise pass/fail feedback and targeted hints.</p></div>
                  </div>
                )}
              </div>

              <div className={`simulator scene-${activeQuest.scene} ${status}`} aria-label={`${activeQuest.title} CodeCraft realm simulation`}>
                <div className="sim-sky"><i /><i /></div>
                <div className="sim-status"><span>{status === "error" ? "!" : status === "complete" ? "✓" : status === "ready" ? "◆" : status === "running" ? "▶" : "○"}</span>{status === "running" ? "Byte is syncing your code…" : status === "ready" ? "Relay objective reached — submit it!" : status === "complete" ? "System restored!" : status === "error" ? "Check the terminal for a hint." : "Run your code to energize the realm."}</div>
                <div className="sim-stage">
                  <div className="ground left-ground" /><div className="ground right-ground" />
                  <div className="target">{activeQuest.scene === "vault" ? "✦" : activeQuest.scene === "supplies" ? "▤" : "◆"}</div>
                  <div className="path-blocks">
                    {Array.from({ length: activeQuest.steps }).map((_, index) => <i className={sceneStep > index ? "active" : ""} key={index} />)}
                  </div>
                  <span className={`byte step-${sceneStep}`}>▣<b>BYTE</b></span>
                </div>
                <div className="sim-footer">LIVE CODE-REALM SIMULATION · CORE RELAY LINK</div>
              </div>
            </section>

            <section className="coding-station">
              <div className="editor-topbar">
                <div><span className="file-dot">◆</span><strong>{activeGenAILab?.fileName ?? (activeTrack.id === "sql" ? "query.sql" : "main.py")}</strong></div>
                <button onClick={openBonus}>↺ {activeTrack.id === "sql" ? "Reset database & code" : activeTrack.id === "python" ? "Reset code" : "Reset lab"}</button>
              </div>
              <div className="snippet-tray bonus-tray">{activeGenAILab ? "CONTROLLED AI RUNTIME · deterministic checks unlimited · 3 signed-in AI coaching reviews daily" : activeTrack.id === "sql" ? "REAL POSTGRESQL · warmed worker, fresh seeded database on every run" : "REAL PYTHON · warmed isolated browser worker with clean state per run"}</div>
              {activeTrack.id !== "genai" && status !== "running" && runtimeReadiness[activeTrack.id] !== "idle" && (
                <div className={`runtime-loader runtime-${runtimeReadiness[activeTrack.id]}`} role="status" aria-live="polite">
                  <i />
                  <span><strong>{runtimeReadiness[activeTrack.id] === "ready" ? "RUNTIME READY" : runtimeReadiness[activeTrack.id] === "error" ? "PRELOAD PAUSED" : activeTrack.id === "python" ? "PREPARING PYTHON" : "PREPARING DATABASE"}</strong>{executionPhase}</span>
                </div>
              )}
              {status === "running" && <div className="runtime-loader" role="status" aria-live="polite"><i /><span><strong>{activeTrack.id === "python" ? "PREPARING PYTHON" : activeTrack.id === "sql" ? "PREPARING DATABASE" : "EVALUATING LAB"}</strong>{executionPhase}</span></div>}
              <div className={`code-window ${status === "error" ? "has-error" : ""}`}>
                <div className="line-numbers" aria-hidden="true">{code.split("\n").map((_, index) => <span key={index}>{index + 1}</span>)}</div>
                <textarea
                  value={code}
                  onChange={(event) => { setCode(event.target.value); setStatus("idle"); setExecutionResult(null); setTerminal(activeGenAILab ? "Lab changed. Run it through the controlled AI evaluator." : "Code changed. Run it to see what happens."); }}
                  onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") runCode(); }}
                  aria-label={`${activeQuest.title} code editor`}
                  spellCheck={false}
                />
              </div>
              <div className="editor-actions">
                <span>Ctrl + Enter to run</span>
                {status === "running" ? <button className="stop-execution" onClick={stopExecution}>■ Stop execution</button> : <button className="run-secondary" onClick={runCode}>▶ {activeGenAILab ? "Evaluate lab" : activeTrack.id === "sql" ? "Run SQL" : "Run Python"}</button>}
                <button className="submit-primary" onClick={submitBonus} disabled={status !== "ready" && status !== "complete"}>Submit {isRequiredWorldProject ? "boss project" : activeGenAILab ? "practice lab" : "optional challenge"}</button>
              </div>
              <div className={`terminal ${status}`}>
                <div><span>{activeGenAILab ? "CONTROLLED AI EVALUATOR" : activeTrack.id === "sql" ? "POSTGRESQL OUTPUT" : "PYTHON OUTPUT"}</span><i>{status === "running" ? "RUNNING" : status.toUpperCase()}</i></div>
                <pre>{terminal}</pre>
                {executionResult && (
                  <div className="execution-details">
                    <section className="execution-output"><h3>OUTPUT <small>{executionResult.durationMs}ms</small></h3><pre>{executionResult.stdout || "No stdout was produced."}</pre></section>
                    {executionResult.table && <section className="result-table-panel"><h3>RESULT TABLE <small>{executionResult.table.rows.length} rows</small></h3><div><table><thead><tr>{executionResult.table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{executionResult.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{executionResult.table!.columns.map((column) => <td key={column}>{row[column] === null || row[column] === undefined ? <i>NULL</i> : String(row[column])}</td>)}</tr>)}</tbody></table></div></section>}
                    <section className="test-results"><h3>{activeGenAILab ? "EVALUATION RUBRIC" : "TEST RESULTS"} <small>{executionResult.tests.filter((test) => test.passed).length}/{executionResult.tests.length} passed</small></h3><div>{executionResult.tests.map((test) => <article className={test.passed ? "passed" : "failed"} key={test.name}><span>{test.passed ? "✓" : "!"}</span><p><strong>{test.name}</strong>{test.detail}{!test.passed && test.hint && <small>Hint: {test.hint}</small>}</p></article>)}</div></section>
                    {executionResult.error && <section className="execution-error"><h3>ERROR</h3><pre>{executionResult.error}</pre></section>}
                  </div>
                )}
              </div>
              {status === "complete" && (
                <div className="quest-complete-banner">
                  <div><span>✦</span><p><small>{isRequiredWorldProject ? "WORLD BOSS DEFEATED" : "SIDE MISSION COMPLETE"}</small><strong>+{bonusXp} {isRequiredWorldProject ? "project" : "bonus"} XP</strong></p></div>
                  <button onClick={openNextSection}>{isRequiredWorldProject ? isFinalQuest ? "Finish path" : "Enter next world" : "Next section"} →</button>
                </div>
              )}
            </section>
          </div>
          )}
        </section>
      )}
    </main>
  );
}
