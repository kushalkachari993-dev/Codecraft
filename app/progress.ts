export const PROGRESS_KEYS = [
  "python", "python-beginner", "python-intermediate", "python-expert",
  "genai", "genai-beginner", "genai-intermediate", "genai-expert",
  "sql", "sql-beginner", "sql-intermediate", "sql-expert",
] as const;

export type PlayerProgress = {
  xp: number;
  completed: Record<string, number[]>;
  coding: Record<string, number[]>;
  bonus: Record<string, number[]>;
};

export const DEFAULT_PROGRESS: PlayerProgress = {
  xp: 120,
  completed: Object.fromEntries(PROGRESS_KEYS.map((key) => [key, []])),
  coding: Object.fromEntries(PROGRESS_KEYS.map((key) => [key, []])),
  bonus: Object.fromEntries(PROGRESS_KEYS.map((key) => [key, []])),
};

function cleanIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is number => Number.isInteger(item) && item > 0 && item <= 1000))].sort((a, b) => a - b);
}

function cleanBucket(value: unknown): Record<string, number[]> {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries(PROGRESS_KEYS.map((key) => [key, cleanIds(source[key])]));
}

export function normalizeProgress(value: unknown): PlayerProgress {
  const source = value && typeof value === "object" ? value as Partial<PlayerProgress> : {};
  const xp = typeof source.xp === "number" && Number.isFinite(source.xp)
    ? Math.max(DEFAULT_PROGRESS.xp, Math.min(10_000_000, Math.floor(source.xp)))
    : DEFAULT_PROGRESS.xp;
  return {
    xp,
    completed: cleanBucket(source.completed),
    coding: cleanBucket(source.coding),
    bonus: cleanBucket(source.bonus),
  };
}

export function mergeProgress(local: PlayerProgress, cloud: PlayerProgress): PlayerProgress {
  const mergeBucket = (left: Record<string, number[]>, right: Record<string, number[]>) =>
    Object.fromEntries(PROGRESS_KEYS.map((key) => [key, cleanIds([...(left[key] ?? []), ...(right[key] ?? [])])]));
  return {
    xp: Math.max(local.xp, cloud.xp),
    completed: mergeBucket(local.completed, cloud.completed),
    coding: mergeBucket(local.coding, cloud.coding),
    bonus: mergeBucket(local.bonus, cloud.bonus),
  };
}
