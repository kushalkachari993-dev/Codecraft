export const PROGRESS_KEYS = [
  "python", "python-beginner", "python-intermediate", "python-expert",
  "genai", "genai-beginner", "genai-intermediate", "genai-expert",
  "sql", "sql-beginner", "sql-intermediate", "sql-expert",
] as const;

export type AvatarId = "relay-scout" | "signal-mage" | "core-runner";
export type GameProfile = {
  avatarId: AvatarId;
  soundEnabled: boolean;
  streakDays: number;
  lastActiveDate: string;
  dailyDate: string;
  dailyTopics: number;
  dailyLabs: number;
  dailyClaimed: boolean;
  dailyQuestDate: string;
  dailyQuestId: string;
  dailyQuestCompleted: boolean;
  dailyQuestStreak: number;
  inventory: string[];
  worldPowerClaims: string[];
  updatedAt: number;
};

export type PlayerProgress = {
  xp: number;
  completed: Record<string, number[]>;
  coding: Record<string, number[]>;
  bonus: Record<string, number[]>;
  game: GameProfile;
};

export const DEFAULT_GAME_PROFILE: GameProfile = {
  avatarId: "relay-scout",
  soundEnabled: true,
  streakDays: 0,
  lastActiveDate: "",
  dailyDate: "",
  dailyTopics: 0,
  dailyLabs: 0,
  dailyClaimed: false,
  dailyQuestDate: "",
  dailyQuestId: "",
  dailyQuestCompleted: false,
  dailyQuestStreak: 0,
  inventory: ["Signal Compass"],
  worldPowerClaims: [],
  updatedAt: 0,
};

export const DEFAULT_PROGRESS: PlayerProgress = {
  xp: 120,
  completed: Object.fromEntries(PROGRESS_KEYS.map((key) => [key, []])),
  coding: Object.fromEntries(PROGRESS_KEYS.map((key) => [key, []])),
  bonus: Object.fromEntries(PROGRESS_KEYS.map((key) => [key, []])),
  game: DEFAULT_GAME_PROFILE,
};

function cleanIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is number => Number.isInteger(item) && item > 0 && item <= 1000))].sort((a, b) => a - b);
}

function cleanBucket(value: unknown): Record<string, number[]> {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries(PROGRESS_KEYS.map((key) => [key, cleanIds(source[key])]));
}

function cleanGame(value: unknown): GameProfile {
  const source = value && typeof value === "object" ? value as Partial<GameProfile> : {};
  const avatarId: AvatarId = source.avatarId === "signal-mage" || source.avatarId === "core-runner" ? source.avatarId : "relay-scout";
  return {
    avatarId,
    soundEnabled: source.soundEnabled !== false,
    streakDays: Number.isInteger(source.streakDays) ? Math.max(0, Math.min(10_000, Number(source.streakDays))) : 0,
    lastActiveDate: typeof source.lastActiveDate === "string" ? source.lastActiveDate.slice(0, 10) : "",
    dailyDate: typeof source.dailyDate === "string" ? source.dailyDate.slice(0, 10) : "",
    dailyTopics: Number.isInteger(source.dailyTopics) ? Math.max(0, Math.min(100, Number(source.dailyTopics))) : 0,
    dailyLabs: Number.isInteger(source.dailyLabs) ? Math.max(0, Math.min(100, Number(source.dailyLabs))) : 0,
    dailyClaimed: source.dailyClaimed === true,
    dailyQuestDate: typeof source.dailyQuestDate === "string" ? source.dailyQuestDate.slice(0, 10) : "",
    dailyQuestId: typeof source.dailyQuestId === "string" ? source.dailyQuestId.slice(0, 120) : "",
    dailyQuestCompleted: source.dailyQuestCompleted === true,
    dailyQuestStreak: Number.isInteger(source.dailyQuestStreak) ? Math.max(0, Math.min(10_000, Number(source.dailyQuestStreak))) : 0,
    inventory: Array.isArray(source.inventory)
      ? [...new Set(source.inventory.filter((item): item is string => typeof item === "string" && item.length > 0 && item.length <= 80))].slice(0, 100)
      : [...DEFAULT_GAME_PROFILE.inventory],
    worldPowerClaims: Array.isArray(source.worldPowerClaims)
      ? [...new Set(source.worldPowerClaims.filter((item): item is string => typeof item === "string" && item.length > 0 && item.length <= 120))].slice(-300)
      : [],
    updatedAt: typeof source.updatedAt === "number" && Number.isFinite(source.updatedAt) ? Math.max(0, Math.floor(source.updatedAt)) : 0,
  };
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
    game: cleanGame(source.game),
  };
}

export function mergeProgress(local: PlayerProgress, cloud: PlayerProgress): PlayerProgress {
  const mergeBucket = (left: Record<string, number[]>, right: Record<string, number[]>) =>
    Object.fromEntries(PROGRESS_KEYS.map((key) => [key, cleanIds([...(left[key] ?? []), ...(right[key] ?? [])])]));
  const localGame = cleanGame(local.game);
  const cloudGame = cleanGame(cloud.game);
  const newestGame = localGame.updatedAt >= cloudGame.updatedAt ? localGame : cloudGame;
  const sameDailyDate = localGame.dailyDate && localGame.dailyDate === cloudGame.dailyDate;
  const sameDailyQuestDate = localGame.dailyQuestDate && localGame.dailyQuestDate === cloudGame.dailyQuestDate;
  return {
    xp: Math.max(local.xp, cloud.xp),
    completed: mergeBucket(local.completed, cloud.completed),
    coding: mergeBucket(local.coding, cloud.coding),
    bonus: mergeBucket(local.bonus, cloud.bonus),
    game: {
      ...newestGame,
      streakDays: Math.max(localGame.streakDays, cloudGame.streakDays),
      dailyTopics: sameDailyDate ? Math.max(localGame.dailyTopics, cloudGame.dailyTopics) : newestGame.dailyTopics,
      dailyLabs: sameDailyDate ? Math.max(localGame.dailyLabs, cloudGame.dailyLabs) : newestGame.dailyLabs,
      dailyClaimed: sameDailyDate ? localGame.dailyClaimed || cloudGame.dailyClaimed : newestGame.dailyClaimed,
      dailyQuestDate: sameDailyQuestDate ? localGame.dailyQuestDate : newestGame.dailyQuestDate,
      dailyQuestId: sameDailyQuestDate
        ? localGame.dailyQuestCompleted ? localGame.dailyQuestId : cloudGame.dailyQuestId
        : newestGame.dailyQuestId,
      dailyQuestCompleted: sameDailyQuestDate
        ? localGame.dailyQuestCompleted || cloudGame.dailyQuestCompleted
        : newestGame.dailyQuestCompleted,
      dailyQuestStreak: Math.max(localGame.dailyQuestStreak, cloudGame.dailyQuestStreak),
      inventory: [...new Set([...localGame.inventory, ...cloudGame.inventory])],
      worldPowerClaims: [...new Set([...localGame.worldPowerClaims, ...cloudGame.worldPowerClaims])].slice(-300),
    },
  };
}
