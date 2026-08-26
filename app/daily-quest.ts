export const DAILY_QUEST_XP = 30;

export function getDailyQuestIndex(date: string, track: string, pace: string, totalQuests: number) {
  if (!Number.isInteger(totalQuests) || totalQuests < 1) return 0;
  let hash = 2_166_136_261;
  for (const character of `${date}:${track}:${pace}`) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0) % totalQuests;
}

export function getDailyQuestStreak(previousDate: string, previousStreak: number, completionDate: string) {
  if (previousDate === completionDate) return Math.max(1, previousStreak);
  const completion = new Date(`${completionDate}T00:00:00.000Z`);
  completion.setUTCDate(completion.getUTCDate() - 1);
  const yesterday = completion.toISOString().slice(0, 10);
  return previousDate === yesterday ? Math.max(1, previousStreak + 1) : 1;
}
