import type { PlayerProgress } from "../progress";
import { DAILY_QUEST_XP, getDailyQuestStreak } from "../daily-quest";
import { CLOUD_PATHS, CLOUD_PATH_TOTAL, CLOUD_TRACK, cloudProgressKey, getCloudWorlds, type CloudPaceId } from "./track";

export function cloudCompleted(progress: PlayerProgress, paceId: CloudPaceId = "beginner") {
  const saved = new Set(progress.completed[cloudProgressKey(paceId)] ?? []);
  const completed: number[] = [];
  for (let id = 1; id <= CLOUD_PATH_TOTAL && saved.has(id); id += 1) completed.push(id);
  return completed;
}

export function isCloudLessonUnlocked(progress: PlayerProgress, id: number, paceId: CloudPaceId = "beginner") {
  return Number.isInteger(id) && id >= 1 && id <= CLOUD_PATH_TOTAL && id <= cloudCompleted(progress, paceId).length + 1;
}

export function cloudLessonXp(id: number, paceId: CloudPaceId = "beginner") {
  const base = paceId === "expert" ? 60 : paceId === "intermediate" ? 50 : 40;
  const project = paceId === "expert" ? 100 : paceId === "intermediate" ? 85 : 75;
  const capstone = paceId === "expert" ? 200 : paceId === "intermediate" ? 175 : 150;
  return id === CLOUD_PATH_TOTAL ? capstone : getCloudWorlds(paceId).some((world) => world.end === id) ? project : base;
}

export function cloudProfileStat(progress: PlayerProgress) {
  const completed = CLOUD_PATHS.flatMap((path) => cloudCompleted(progress, path.id));
  const projects = CLOUD_PATHS.reduce((total, path) => total + getCloudWorlds(path.id).filter((world) => cloudCompleted(progress, path.id).includes(world.end)).length, 0);
  return { id: "cloud" as const, icon: "CL", label: "Cloud Engineering", completed: completed.length, total: CLOUD_TRACK.total, projects, percent: Math.round(completed.length / CLOUD_TRACK.total * 100) };
}

export function completeCloudLesson(progress: PlayerProgress, id: number, paceId: CloudPaceId = "beginner", now = new Date()): PlayerProgress {
  if (!isCloudLessonUnlocked(progress, id, paceId) || cloudCompleted(progress, paceId).includes(id)) return progress;
  const key = cloudProgressKey(paceId);
  const ids = [...cloudCompleted(progress, paceId), id];
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  const world = getCloudWorlds(paceId).find((entry) => entry.end === id);
  const path = CLOUD_PATHS.find((entry) => entry.id === paceId) ?? CLOUD_PATHS[0];
  const reward = world ? path.label + " · " + world.name + " Uptime Cell" : "";
  const inventory = reward ? [...new Set([...progress.game.inventory, reward])] : progress.game.inventory;
  const streakDays = progress.game.lastActiveDate === today ? progress.game.streakDays : progress.game.lastActiveDate === yesterday ? progress.game.streakDays + 1 : 1;
  return {
    ...progress,
    xp: progress.xp + cloudLessonXp(id, paceId),
    completed: { ...progress.completed, [key]: ids },
    coding: { ...progress.coding, [key]: ids },
    bonus: { ...progress.bonus, [key]: ids.filter((entry) => getCloudWorlds(paceId).some((item) => item.end === entry)) },
    game: { ...progress.game, inventory, streakDays, lastActiveDate: today, dailyDate: today, dailyTopics: (progress.game.dailyDate === today ? progress.game.dailyTopics : 0) + 1, dailyLabs: (progress.game.dailyDate === today ? progress.game.dailyLabs : 0) + 1, dailyClaimed: progress.game.dailyDate === today && progress.game.dailyClaimed, updatedAt: now.getTime() },
  };
}

export function completeCloudDailyQuest(progress: PlayerProgress, paceId: CloudPaceId, lessonId: number, now = new Date()): PlayerProgress {
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
      dailyQuestId: "cloud-" + paceId + "-" + lessonId + "-" + today,
      dailyQuestCompleted: true,
      dailyQuestStreak: getDailyQuestStreak(progress.game.dailyQuestDate, progress.game.dailyQuestStreak, today),
      updatedAt: now.getTime(),
    },
  };
}
