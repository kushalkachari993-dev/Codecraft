import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("guides a first learner from recommendation to first lesson", async () => {
  const page = (await Promise.all([read("app/page.tsx"), read("app/codecraft-catalog.tsx"), read("app/components/journey-views.tsx"), read("app/hooks/use-journey.ts")])).join("\n");
  assert.match(page, /codecraft-journey-v1/);
  assert.match(page, /What do you want to build/);
  assert.match(page, /How familiar are you with/);
  assert.match(page, /Choose a track/);
  assert.match(page, /Set your pace/);
  assert.match(page, /Learn the game loop/);
  assert.match(page, /Complete your first lesson/);
  assert.match(page, /About 60 seconds/);
  assert.match(page, /Every lesson follows one clear route/);
  assert.match(page, /Start first lesson/);
  assert.match(page, /startFirstLesson/);
});

test("supports returning learners and explains the game economy", async () => {
  const page = (await Promise.all([read("app/page.tsx"), read("app/codecraft-catalog.tsx"), read("app/components/journey-views.tsx"), read("app/hooks/use-journey.ts")])).join("\n");
  assert.match(page, /CONTINUE YOUR JOURNEY/);
  assert.match(page, /Continue where I left off/);
  assert.match(page, /resumeJourney/);
  assert.match(page, /Grow your level/);
  assert.match(page, /Prove each topic/);
  assert.match(page, /Defeat the project/);
});

test("celebrates the first restored world and remains responsive", async () => {
  const [page, styles] = await Promise.all([read("app/page.tsx"), read("app/globals.css")]);
  assert.match(page, /firstWorldRestoredNow/);
  assert.match(page, /FIRST WORLD RESTORED/);
  assert.match(page, /firstWorldCelebration/);
  assert.match(page, /activeModules\[1\]/);
  assert.match(styles, /\.onboarding-backdrop/);
  assert.match(styles, /\.world-celebration/);
  assert.match(styles, /@media \(max-width: 760px\)/);
});


test("keeps page orchestration split across domain hooks and view components", async () => {
  const [page, journeyViews] = await Promise.all([
    read("app/page.tsx"),
    read("app/components/journey-views.tsx"),
  ]);
  const boundaries = page + "\n" + journeyViews;
  const requiredBoundaries = [
    "useJourney",
    "useProgressSync",
    "useProfile",
    "useLabRuntime",
    "useDailyQuest",
    "TrackPickerView",
    "ProfilePanel",
    "WorldMap",
    "TheoryLessonView",
    "DailyQuestCard",
  ];

  for (const boundary of requiredBoundaries) {
    assert.match(boundaries, new RegExp(boundary));
  }

  assert.ok(page.split("\n").length < 1400, "page.tsx should remain an orchestration layer");
});
