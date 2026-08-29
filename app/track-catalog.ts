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

export const TRACK_TOPIC_TOTALS: Record<Track["id"], Record<"beginner" | "intermediate" | "expert", number>> = {
  python: { beginner: 24, intermediate: 29, expert: 30 },
  genai: { beginner: 18, intermediate: 25, expert: 28 },
  sql: { beginner: 23, intermediate: 26, expert: 29 },
};
