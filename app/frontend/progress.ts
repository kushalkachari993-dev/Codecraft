import { DAILY_QUEST_XP, getDailyQuestStreak } from "../daily-quest";
import type { PlayerProgress } from "../progress";
import { FRONTEND_PATHS, FRONTEND_PATH_TOTAL, FRONTEND_TRACK, frontendProgressKey, getFrontendWorlds, type FrontendPaceId } from "./track";

export function frontendCompleted(progress: PlayerProgress, paceId: FrontendPaceId = "beginner") {
  const saved = new Set(progress.completed[frontendProgressKey(paceId)] ?? []);
  const completed: number[] = [];
  for (let id = 1; id <= FRONTEND_PATH_TOTAL && saved.has(id); id += 1) completed.push(id);
  return completed;
}
export const isFrontendLessonUnlocked = (progress: PlayerProgress, id: number, paceId: FrontendPaceId = "beginner") => Number.isInteger(id) && id >= 1 && id <= FRONTEND_PATH_TOTAL && id <= frontendCompleted(progress, paceId).length + 1;
export function frontendLessonXp(id: number, paceId: FrontendPaceId = "beginner") {
  const base = paceId === "expert" ? 60 : paceId === "intermediate" ? 50 : 40;
  const project = paceId === "expert" ? 100 : paceId === "intermediate" ? 85 : 75;
  const capstone = paceId === "expert" ? 200 : paceId === "intermediate" ? 175 : 150;
  return id === FRONTEND_PATH_TOTAL ? capstone : getFrontendWorlds(paceId).some((world) => world.end === id) ? project : base;
}
export function frontendProfileStat(progress: PlayerProgress) {
  const completed = FRONTEND_PATHS.flatMap((path) => frontendCompleted(progress, path.id));
  const projects = FRONTEND_PATHS.reduce((total, path) => total + getFrontendWorlds(path.id).filter((world) => frontendCompleted(progress, path.id).includes(world.end)).length, 0);
  return { id: "frontend" as const, icon: "FE", label: "Frontend Web Development", completed: completed.length, total: FRONTEND_TRACK.total, projects, percent: Math.round(completed.length / FRONTEND_TRACK.total * 100) };
}
export function completeFrontendLesson(progress: PlayerProgress, id: number, paceId: FrontendPaceId = "beginner", now = new Date()): PlayerProgress {
  if (!isFrontendLessonUnlocked(progress, id, paceId) || frontendCompleted(progress, paceId).includes(id)) return progress;
  const key = frontendProgressKey(paceId);
  const ids = [...frontendCompleted(progress, paceId), id];
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  const world = getFrontendWorlds(paceId).find((entry) => entry.end === id);
  const path = FRONTEND_PATHS.find((entry) => entry.id === paceId) ?? FRONTEND_PATHS[0];
  const reward = world ? path.label + " · " + world.name + " Interface Core" : "";
  return { ...progress, xp: progress.xp + frontendLessonXp(id, paceId), completed: { ...progress.completed, [key]: ids }, coding: { ...progress.coding, [key]: ids }, bonus: { ...progress.bonus, [key]: ids.filter((entry) => getFrontendWorlds(paceId).some((item) => item.end === entry)) }, game: { ...progress.game, inventory: reward ? [...new Set([...progress.game.inventory, reward])] : progress.game.inventory, streakDays: progress.game.lastActiveDate === today ? progress.game.streakDays : progress.game.lastActiveDate === yesterday ? progress.game.streakDays + 1 : 1, lastActiveDate: today, dailyDate: today, dailyTopics: (progress.game.dailyDate === today ? progress.game.dailyTopics : 0) + 1, dailyLabs: (progress.game.dailyDate === today ? progress.game.dailyLabs : 0) + 1, dailyClaimed: progress.game.dailyDate === today && progress.game.dailyClaimed, updatedAt: now.getTime() } };
}
export function completeFrontendDailyQuest(progress: PlayerProgress, paceId: FrontendPaceId, lessonId: number, now = new Date()): PlayerProgress {
  const today = now.toISOString().slice(0, 10);
  if (progress.game.dailyQuestDate === today && progress.game.dailyQuestCompleted) return progress;
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  return { ...progress, xp: progress.xp + DAILY_QUEST_XP, game: { ...progress.game, inventory: [...new Set([...progress.game.inventory, "Daily Quest Cache"])], streakDays: progress.game.lastActiveDate === today ? progress.game.streakDays : progress.game.lastActiveDate === yesterday ? progress.game.streakDays + 1 : 1, lastActiveDate: today, dailyDate: today, dailyTopics: (progress.game.dailyDate === today ? progress.game.dailyTopics : 0) + 1, dailyLabs: (progress.game.dailyDate === today ? progress.game.dailyLabs : 0) + 1, dailyClaimed: progress.game.dailyDate === today && progress.game.dailyClaimed, dailyQuestDate: today, dailyQuestId: "frontend-" + paceId + "-" + lessonId + "-" + today, dailyQuestCompleted: true, dailyQuestStreak: getDailyQuestStreak(progress.game.dailyQuestDate, progress.game.dailyQuestStreak, today), updatedAt: now.getTime() } };
}
