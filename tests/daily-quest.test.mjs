import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("daily quests rotate deterministically by UTC date, track, and pace", async () => {
  const source = await read("app/daily-quest.ts");
  assert.match(source, /date.*track.*pace/);
  assert.match(source, /Math\.imul/);
  assert.match(source, /totalQuests/);
  assert.match(source, /setUTCDate/);
});

test("daily quest button opens the existing real lab runtimes", async () => {
  const page = await read("app/learning-app.tsx");
  assert.match(page, /Daily Quest/);
  assert.match(page, /const openDailyQuest/);
  assert.match(page, /loadLabChallenge/);
  assert.match(page, /buildGenAILab/);
  assert.match(page, /setLessonStage\("bonus"\)/);
  assert.match(page, /warmExecutionRuntime/);
});

test("Cloud Daily Quests reuse the deterministic rotation and shared reward contract", async () => {
  const [cloudApp, cloudProgress, cloudRoute, landing] = await Promise.all([
    read("app/cloud/cloud-app.tsx"),
    read("app/cloud/progress.ts"),
    read("app/daily-quest/cloud/[paceId]/page.tsx"),
    read("app/track-landing-app.tsx"),
  ]);
  assert.match(cloudApp, /getDailyQuestIndex/);
  assert.match(cloudApp, /TODAY.*CLOUD RELAY CHALLENGE/);
  assert.match(cloudProgress, /completeCloudDailyQuest/);
  assert.match(cloudProgress, /getDailyQuestStreak/);
  assert.match(cloudProgress, /Daily Quest Cache/);
  assert.match(cloudRoute, /<CloudApp paceId={paceId} daily/);
  assert.match(landing, /cloudDailyLesson/);
  assert.doesNotMatch(landing, /Python Daily Quest/);
});

test("daily rewards are one per day, extend streaks, and sync with progress", async () => {
  const [page, progress, analytics] = await Promise.all([
    read("app/learning-app.tsx"),
    read("app/progress.ts"),
    read("app/analytics-events.ts"),
  ]);
  assert.match(page, /dailyQuestCompletedToday/);
  assert.match(page, /DAILY_QUEST_XP/);
  assert.match(page, /getDailyQuestStreak/);
  assert.match(progress, /dailyQuestDate/);
  assert.match(progress, /dailyQuestCompleted/);
  assert.match(progress, /dailyQuestStreak/);
  assert.match(progress, /sameDailyQuestDate/);
  assert.match(analytics, /daily_quest_started/);
  assert.match(analytics, /daily_quest_completed/);
});

test("daily quest launch and challenge briefing are responsive", async () => {
  const [page, css] = await Promise.all([
    Promise.all([read("app/learning-app.tsx"), read("app/components/daily-quest-card.tsx"), read("app/components/lesson-stage-views.tsx")]).then((parts) => parts.join("\n")),
    read("app/globals.css"),
  ]);
  assert.match(page, /daily-quest-launch/);
  assert.match(page, /daily-quest-brief/);
  assert.match(page, /Claim daily reward/);
  assert.match(css, /\.daily-quest-launch/);
  assert.match(css, /\.daily-quest-brief/);
  assert.match(css, /@media \(max-width: 680px\)/);
});
