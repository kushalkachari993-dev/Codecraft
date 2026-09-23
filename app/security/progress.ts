import { DAILY_QUEST_XP, getDailyQuestStreak } from "../daily-quest";
import type { PlayerProgress } from "../progress";
import { SECURITY_PATHS, SECURITY_PATH_TOTAL, SECURITY_TRACK, getSecurityWorlds, securityProgressKey, type SecurityPaceId } from "./track";

export function securityCompleted(progress: PlayerProgress, paceId: SecurityPaceId = "beginner") {
  const saved = new Set(progress.completed[securityProgressKey(paceId)] ?? []);
  const completed: number[] = [];
  for (let id = 1; id <= SECURITY_PATH_TOTAL && saved.has(id); id += 1) completed.push(id);
  return completed;
}
export function isSecurityLessonUnlocked(progress: PlayerProgress, id: number, paceId: SecurityPaceId = "beginner") {
  return Number.isInteger(id) && id >= 1 && id <= SECURITY_PATH_TOTAL && id <= securityCompleted(progress, paceId).length + 1;
}
export function securityLessonXp(id: number, paceId: SecurityPaceId = "beginner") {
  const base = paceId === "expert" ? 60 : paceId === "intermediate" ? 50 : 40;
  const project = paceId === "expert" ? 100 : paceId === "intermediate" ? 85 : 75;
  const capstone = paceId === "expert" ? 200 : paceId === "intermediate" ? 175 : 150;
  return id === SECURITY_PATH_TOTAL ? capstone : getSecurityWorlds(paceId).some((world) => world.end === id) ? project : base;
}
export function securityProfileStat(progress: PlayerProgress) {
  const completed = SECURITY_PATHS.flatMap((path) => securityCompleted(progress, path.id));
  const projects = SECURITY_PATHS.reduce((total, path) => total + getSecurityWorlds(path.id).filter((world) => securityCompleted(progress, path.id).includes(world.end)).length, 0);
  return { id: "security" as const, icon: "SE", label: "Cybersecurity Engineering", completed: completed.length, total: SECURITY_TRACK.total, projects, percent: Math.round(completed.length / SECURITY_TRACK.total * 100) };
}
export function completeSecurityLesson(progress: PlayerProgress, id: number, paceId: SecurityPaceId = "beginner", now = new Date()): PlayerProgress {
  if (!isSecurityLessonUnlocked(progress, id, paceId) || securityCompleted(progress, paceId).includes(id)) return progress;
  const key = securityProgressKey(paceId);
  const ids = [...securityCompleted(progress, paceId), id];
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  const world = getSecurityWorlds(paceId).find((entry) => entry.end === id);
  const path = SECURITY_PATHS.find((entry) => entry.id === paceId) ?? SECURITY_PATHS[0];
  const reward = world ? path.label + " · " + world.name + " Trust Core" : "";
  const inventory = reward ? [...new Set([...progress.game.inventory, reward])] : progress.game.inventory;
  const streakDays = progress.game.lastActiveDate === today ? progress.game.streakDays : progress.game.lastActiveDate === yesterday ? progress.game.streakDays + 1 : 1;
  return {
    ...progress,
    xp: progress.xp + securityLessonXp(id, paceId),
    completed: { ...progress.completed, [key]: ids },
    coding: { ...progress.coding, [key]: ids },
    bonus: { ...progress.bonus, [key]: ids.filter((entry) => getSecurityWorlds(paceId).some((item) => item.end === entry)) },
    game: { ...progress.game, inventory, streakDays, lastActiveDate: today, dailyDate: today, dailyTopics: (progress.game.dailyDate === today ? progress.game.dailyTopics : 0) + 1, dailyLabs: (progress.game.dailyDate === today ? progress.game.dailyLabs : 0) + 1, dailyClaimed: progress.game.dailyDate === today && progress.game.dailyClaimed, updatedAt: now.getTime() },
  };
}
export function completeSecurityDailyQuest(progress: PlayerProgress, paceId: SecurityPaceId, lessonId: number, now = new Date()): PlayerProgress {
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
      streakDays, lastActiveDate: today, dailyDate: today,
      dailyTopics: (progress.game.dailyDate === today ? progress.game.dailyTopics : 0) + 1,
      dailyLabs: (progress.game.dailyDate === today ? progress.game.dailyLabs : 0) + 1,
      dailyClaimed: progress.game.dailyDate === today && progress.game.dailyClaimed,
      dailyQuestDate: today,
      dailyQuestId: "security-" + paceId + "-" + lessonId + "-" + today,
      dailyQuestCompleted: true,
      dailyQuestStreak: getDailyQuestStreak(progress.game.dailyQuestDate, progress.game.dailyQuestStreak, today),
      updatedAt: now.getTime(),
    },
  };
}
