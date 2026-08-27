"use client";

import { DAILY_QUEST_XP } from "../daily-quest";

type DailyQuestCardProps = {
  completed: boolean;
  title: string;
  trackLabel: string;
  paceLabel: string;
  streak: number;
  onOpen: () => void;
};

export default function DailyQuestCard({ completed, title, trackLabel, paceLabel, streak, onOpen }: DailyQuestCardProps) {
  return (
    <section className={`daily-quest-launch ${completed ? "complete" : ""}`} aria-labelledby="daily-quest-title">
      <div className="daily-quest-emblem" aria-hidden="true">☼<span>{String(new Date().getUTCDate()).padStart(2, "0")}</span></div>
      <div><p>DAILY QUEST · RESETS 00:00 UTC</p><h2 id="daily-quest-title">{title}</h2><span>{trackLabel} · {paceLabel} · 5–15 minute challenge</span></div>
      <div className="daily-quest-reward"><small>TODAY&apos;S REWARD</small><strong>+{DAILY_QUEST_XP} XP</strong><span>{streak} day streak</span></div>
      <button onClick={onOpen}>{completed ? "Replay today's quest" : "Open daily quest"} →</button>
    </section>
  );
}
