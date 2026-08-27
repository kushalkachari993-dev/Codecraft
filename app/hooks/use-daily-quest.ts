"use client";

import { useState } from "react";
import { getDailyQuestIndex } from "../daily-quest";
import type { PlayerProgress } from "../progress";

export type DailyQuestSession = { date: string; key: string; questId: number };

type DailyQuestOptions<Quest> = {
  progress: PlayerProgress;
  quests: Quest[];
  trackId: "python" | "genai" | "sql";
  paceId: "beginner" | "intermediate" | "expert";
};

export function useDailyQuest<Quest>({ progress, quests, trackId, paceId }: DailyQuestOptions<Quest>) {
  const [session, setSession] = useState<DailyQuestSession | null>(null);
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyQuestMode = session?.date === todayKey;
  const completedToday = progress.game.dailyQuestDate === todayKey && progress.game.dailyQuestCompleted;
  const preview = quests[getDailyQuestIndex(todayKey, trackId, paceId, quests.length)] ?? quests[0];

  return {
    session,
    setSession,
    clearSession: () => setSession(null),
    todayKey,
    dailyQuestMode,
    completedToday,
    preview,
  };
}
