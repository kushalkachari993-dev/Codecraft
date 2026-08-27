import { PYTHON_PACES, type PythonPaceId, type PythonTopic } from "./python-curriculum";
import { GENAI_PACES, type GenAIPaceId, type GenAITopic } from "./genai-curriculum";
import { SQL_PACES, type SQLPaceId, type SQLTopic } from "./sql-curriculum";
import type { AvatarId } from "./progress";

export type Quest = {
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

export type QuizQuestion = { question: string; options: string[]; answer: number; explanation: string };
export type TheoryContent = {
  overview: string;
  deeper: string;
  keyIdeas: Array<{ title: string; body: string }>;
  mentalModel: string;
  commonMistake: string;
  checkYourself: string[];
};
export type Track = {
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

export type WorldPowerKind = "scan" | "recall" | "override";
export type WorldMechanic = {
  event: string;
  power: string;
  kind: WorldPowerKind;
  description: string;
  effect: string;
};

export const TRACKS: Track[] = [
  { id: "python", label: "Python", world: "Logic Highlands", worldTwo: "The Function Relay", kicker: "PYTHON TRAIL", description: "Learn programming foundations while Byte restores the living systems of the Code Realms.", outcome: "Commands · Loops · Functions · Collections", mission: "Repair the Logic Relay and reconnect every automation node.", energy: "Lumen shards", icon: "Py", nextWorld: "Object Odyssey" },
  { id: "genai", label: "GenAI", world: "Prompt Frontier", worldTwo: "The Agent Foundry", kicker: "AI EXPLORER TRAIL", description: "Learn how to prompt, guide, structure, and evaluate intelligent systems across a fractured signal frontier.", outcome: "Prompts · Grounding · Tools · Evaluation", mission: "Rebuild the Signal Archive and teach its agents to respond reliably.", energy: "Echo cores", icon: "AI", nextWorld: "Multimodal Metropolis" },
  { id: "sql", label: "SQL", world: "Data Depths", worldTwo: "The Analytics Citadel", kicker: "DATABASE TRAIL", description: "Explore a buried data realm using queries that reveal, connect, and analyze its records.", outcome: "SELECT · JOIN · Subqueries · Windows", mission: "Restore the Data Nexus and recover the realm's lost records.", energy: "Index crystals", icon: "DB", nextWorld: "Performance Nexus" },
];

export const TRACK_MATCH: Record<Track["id"], string> = {
  python: "Best for programming foundations, automation, APIs, and backend development.",
  genai: "Best for prompts, RAG, agents, evaluation, and production AI applications.",
  sql: "Best for analytics, databases, data engineering, and performance work.",
};
export const PACE_MATCH: Record<PythonPaceId, string> = {
  beginner: "New to the subject or rebuilding foundations",
  intermediate: "Comfortable with the basics and ready to build",
  expert: "Preparing for production systems and architecture",
};

const WORLD_MECHANICS: Record<Track["id"], WorldMechanic[]> = {
  python: [
    { event: "Syntax Storm", power: "Signal Scanner", kind: "scan", description: "Corrupted syntax is hiding valid paths among noisy decoys.", effect: "Remove two incorrect checkpoint choices." },
    { event: "Inventory Fog", power: "Memory Cache", kind: "recall", description: "The world periodically hides what each tool is meant to do.", effect: "Recall a lesson model and expose a dangerous mistake." },
    { event: "Logic Lock", power: "Byte Override", kind: "override", description: "A logic gate must be patched before the relay can continue.", effect: "Byte repairs one unanswered checkpoint node." },
    { event: "Debug Rift", power: "Trace Scanner", kind: "scan", description: "False traces split the program into unstable branches.", effect: "Remove two incorrect checkpoint choices." },
    { event: "Algorithm Wilds", power: "Pattern Cache", kind: "recall", description: "Repeated structures are concealed by shifting terrain.", effect: "Recall the mental model behind the current topic." },
    { event: "Runtime Breach", power: "Core Override", kind: "override", description: "The runtime is resisting the final system repair.", effect: "Byte repairs one unanswered checkpoint node." },
  ],
  genai: [
    { event: "Prompt Static", power: "Intent Scanner", kind: "scan", description: "Ambiguous signals are producing convincing but incorrect paths.", effect: "Remove two incorrect checkpoint choices." },
    { event: "Context Eclipse", power: "Context Cache", kind: "recall", description: "Vital context has fallen outside the active signal window.", effect: "Recover the topic mental model and safety warning." },
    { event: "Agent Loop", power: "Loop Override", kind: "override", description: "An agent is repeating a broken decision cycle.", effect: "Byte repairs one unanswered checkpoint node." },
    { event: "Grounding Drift", power: "Source Scanner", kind: "scan", description: "Unsupported claims are leaking into the archive.", effect: "Remove two incorrect checkpoint choices." },
    { event: "Evaluation Fog", power: "Rubric Cache", kind: "recall", description: "The success criteria have been scattered across the frontier.", effect: "Recover the topic mental model and safety warning." },
    { event: "Routing Failure", power: "Model Override", kind: "override", description: "The wrong system is answering the realm requests.", effect: "Byte repairs one unanswered checkpoint node." },
  ],
  sql: [
    { event: "Query Static", power: "Planner Scanner", kind: "scan", description: "Decoy query paths are blocking the correct result set.", effect: "Remove two incorrect checkpoint choices." },
    { event: "Schema Fog", power: "Schema Cache", kind: "recall", description: "Table relationships have faded from the data map.", effect: "Recover the topic mental model and common query trap." },
    { event: "Lock Contention", power: "Transaction Override", kind: "override", description: "A blocked transaction is freezing the world relay.", effect: "Byte repairs one unanswered checkpoint node." },
    { event: "Index Rift", power: "Index Scanner", kind: "scan", description: "The fastest path is buried among expensive plans.", effect: "Remove two incorrect checkpoint choices." },
    { event: "Plan Eclipse", power: "Explain Cache", kind: "recall", description: "The optimizer reasoning is hidden from the expedition.", effect: "Recover the topic mental model and common query trap." },
    { event: "Recovery Breach", power: "WAL Override", kind: "override", description: "The final data checkpoint needs a safe recovery patch.", effect: "Byte repairs one unanswered checkpoint node." },
  ],
};

export function getWorldMechanic(trackId: Track["id"], worldNumber: number): WorldMechanic {
  const mechanics = WORLD_MECHANICS[trackId];
  return mechanics[(Math.max(1, worldNumber) - 1) % mechanics.length];
}

export function FirstRunChecklist({ activeStep }: { activeStep: number }) {
  const steps = ["Choose a track", "Set your pace", "Learn the game loop", "Complete your first lesson"];
  return (
    <ol className="first-run-checklist" aria-label="Getting started progress">
      {steps.map((step, index) => <li className={index < activeStep ? "done" : index === activeStep ? "active" : ""} key={step}><span>{index < activeStep ? "OK" : index + 1}</span><strong>{step}</strong></li>)}
    </ol>
  );
}

export const AVATARS: Array<{ id: AvatarId; name: string; glyph: string; description: string; unlockAt: number }> = [
  { id: "relay-scout", name: "Relay Scout", glyph: "◇", description: "Fast, curious, and tuned to hidden signals.", unlockAt: 0 },
  { id: "signal-mage", name: "Signal Mage", glyph: "✦", description: "Channels knowledge into powerful system repairs.", unlockAt: 5 },
  { id: "core-runner", name: "Core Runner", glyph: "◆", description: "Built for world projects and deep system missions.", unlockAt: 15 },
];

const PYTHON_PACE_XP: Record<PythonPaceId, number> = { beginner: 35, intermediate: 60, expert: 90 };
const PYTHON_PACE_BADGES: Record<PythonPaceId, string> = { beginner: "Trail", intermediate: "Forge", expert: "Mastery" };
export const PYTHON_PACE_MODULES: Record<PythonPaceId, Array<{ name: string; size: number }>> = {
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

export function getPythonModule(paceId: PythonPaceId, questId: number) {
  let start = 1;
  for (const [index, module] of PYTHON_PACE_MODULES[paceId].entries()) {
    const end = start + module.size - 1;
    if (questId >= start && questId <= end) return { ...module, number: index + 1, start, end };
    start = end + 1;
  }
  return { ...PYTHON_PACE_MODULES[paceId][0], number: 1, start: 1, end: PYTHON_PACE_MODULES[paceId][0].size };
}

export function buildPythonPaceQuests(paceId: PythonPaceId): Quest[] {
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

export function buildPythonTheory(topic: PythonTopic): TheoryContent {
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
export const GENAI_PACE_MODULES: Record<GenAIPaceId, Array<{ name: string; size: number }>> = {
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

export function getGenAIModule(paceId: GenAIPaceId, questId: number) {
  let start = 1;
  for (const [index, module] of GENAI_PACE_MODULES[paceId].entries()) {
    const end = start + module.size - 1;
    if (questId >= start && questId <= end) return { ...module, number: index + 1, start, end };
    start = end + 1;
  }
  return { ...GENAI_PACE_MODULES[paceId][0], number: 1, start: 1, end: GENAI_PACE_MODULES[paceId][0].size };
}

export function buildGenAIPaceQuests(paceId: GenAIPaceId): Quest[] {
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

export function buildGenAITheory(topic: GenAITopic): TheoryContent {
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
export const SQL_PACE_MODULES: Record<SQLPaceId, Array<{ name: string; size: number }>> = {
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

export function getSQLModule(paceId: SQLPaceId, questId: number) {
  let start = 1;
  for (const [index, module] of SQL_PACE_MODULES[paceId].entries()) {
    const end = start + module.size - 1;
    if (questId >= start && questId <= end) return { ...module, number: index + 1, start, end };
    start = end + 1;
  }
  return { ...SQL_PACE_MODULES[paceId][0], number: 1, start: 1, end: SQL_PACE_MODULES[paceId][0].size };
}

export function buildSQLPaceQuests(paceId: SQLPaceId): Quest[] {
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

export function buildSQLTheory(topic: SQLTopic): TheoryContent {
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

export function rotateQuizOptions(question: QuizQuestion, offset: number): QuizQuestion {
  const shift = offset % question.options.length;
  return {
    ...question,
    options: [...question.options.slice(shift), ...question.options.slice(0, shift)],
    answer: (question.answer - shift + question.options.length) % question.options.length,
  };
}

export function buildQuiz(quest: Quest, authored: QuizQuestion[] | null = null): QuizQuestion[] {
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
