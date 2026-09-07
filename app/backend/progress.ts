import { DAILY_QUEST_XP, getDailyQuestStreak } from "../daily-quest";
import type { PlayerProgress } from "../progress";
import { BACKEND_PATHS, BACKEND_PATH_TOTAL, BACKEND_TRACK, backendProgressKey, getBackendWorlds, type BackendPaceId } from "./track";

export function backendCompleted(progress: PlayerProgress, paceId: BackendPaceId = "beginner") {
  const saved = new Set(progress.completed[backendProgressKey(paceId)] ?? []);
  const completed: number[] = [];
  for (let id = 1; id <= BACKEND_PATH_TOTAL && saved.has(id); id += 1) completed.push(id);
  return completed;
}

export function isBackendLessonUnlocked(progress: PlayerProgress, id: number, paceId: BackendPaceId = "beginner") {
  return Number.isInteger(id) && id >= 1 && id <= BACKEND_PATH_TOTAL && id <= backendCompleted(progress, paceId).length + 1;
}

export function backendLessonXp(id: number, paceId: BackendPaceId = "beginner") {
  const base = paceId === "expert" ? 60 : paceId === "intermediate" ? 50 : 40;
  const project = paceId === "expert" ? 100 : paceId === "intermediate" ? 85 : 75;
  const capstone = paceId === "expert" ? 200 : paceId === "intermediate" ? 175 : 150;
  return id === BACKEND_PATH_TOTAL ? capstone : getBackendWorlds(paceId).some((world) => world.end === id) ? project : base;
}

export function backendProfileStat(progress: PlayerProgress) {
  const completed = BACKEND_PATHS.flatMap((path) => backendCompleted(progress, path.id));
  const projects = BACKEND_PATHS.reduce((total, path) => total + getBackendWorlds(path.id).filter((world) => backendCompleted(progress, path.id).includes(world.end)).length, 0);
  return { id: "backend" as const, icon: "BE", label: "Backend Engineering", completed: completed.length, total: BACKEND_TRACK.total, projects, percent: Math.round(completed.length / BACKEND_TRACK.total * 100) };
}

export function completeBackendLesson(progress: PlayerProgress, id: number, paceId: BackendPaceId = "beginner", now = new Date()): PlayerProgress {
  if (!isBackendLessonUnlocked(progress, id, paceId) || backendCompleted(progress, paceId).includes(id)) return progress;
  const key = backendProgressKey(paceId);
  const ids = [...backendCompleted(progress, paceId), id];
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  const world = getBackendWorlds(paceId).find((entry) => entry.end === id);
  const path = BACKEND_PATHS.find((entry) => entry.id === paceId) ?? BACKEND_PATHS[0];
  const reward = world ? path.label + " · " + world.name + " Service Core" : "";
  const inventory = reward ? [...new Set([...progress.game.inventory, reward])] : progress.game.inventory;
  const streakDays = progress.game.lastActiveDate === today ? progress.game.streakDays : progress.game.lastActiveDate === yesterday ? progress.game.streakDays + 1 : 1;
  return {
    ...progress,
    xp: progress.xp + backendLessonXp(id, paceId),
    completed: { ...progress.completed, [key]: ids },
    coding: { ...progress.coding, [key]: ids },
    bonus: { ...progress.bonus, [key]: ids.filter((entry) => getBackendWorlds(paceId).some((item) => item.end === entry)) },
    game: { ...progress.game, inventory, streakDays, lastActiveDate: today, dailyDate: today, dailyTopics: (progress.game.dailyDate === today ? progress.game.dailyTopics : 0) + 1, dailyLabs: (progress.game.dailyDate === today ? progress.game.dailyLabs : 0) + 1, dailyClaimed: progress.game.dailyDate === today && progress.game.dailyClaimed, updatedAt: now.getTime() },
  };
}

export function completeBackendDailyQuest(progress: PlayerProgress, paceId: BackendPaceId, lessonId: number, now = new Date()): PlayerProgress {
  const today = now.toISOString().slice(0, 10);
  if (progress.game.dailyQuestDate === today && progress.game.dailyQuestCompleted) return progress;
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  const streakDays = progress.game.lastActiveDate === today ? progress.game.streakDays : progress.game.lastActiveDate === yesterday ? progress.game.streakDays + 1 : 1;
  return {
    ...progress,
    xp: progress.xp + DAILY_QUEST_XP,
    game: {
      ...progress.game,
      inventory: [...new Set([...progress.game.inventory, "Daily Quest Cache"])],
      streakDays,
      lastActiveDate: today,
      dailyDate: today,
      dailyTopics: (progress.game.dailyDate === today ? progress.game.dailyTopics : 0) + 1,
      dailyLabs: (progress.game.dailyDate === today ? progress.game.dailyLabs : 0) + 1,
      dailyClaimed: progress.game.dailyDate === today && progress.game.dailyClaimed,
      dailyQuestDate: today,
      dailyQuestId: "backend-" + paceId + "-" + lessonId + "-" + today,
      dailyQuestCompleted: true,
      dailyQuestStreak: getDailyQuestStreak(progress.game.dailyQuestDate, progress.game.dailyQuestStreak, today),
      updatedAt: now.getTime(),
    },
  };
}
