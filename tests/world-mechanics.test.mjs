import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = (await Promise.all([
  readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/codecraft-catalog.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/components/world-map.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/components/lesson-stage-views.tsx", import.meta.url), "utf8"),
])).join("\n");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const progress = await readFile(new URL("../app/progress.ts", import.meta.url), "utf8");

test("worlds have track-specific events and active checkpoint powers", () => {
  assert.match(page, /const WORLD_MECHANICS/);
  for (const event of ["Syntax Storm", "Prompt Static", "Query Static", "Context Eclipse", "Lock Contention"]) assert.match(page, new RegExp(event));
  assert.match(page, /const activateWorldPower/);
  assert.match(page, /kind === "scan"/);
  assert.match(page, /kind === "override"/);
  assert.match(page, /activeTheory\.mentalModel/);
  assert.match(page, /RECHARGES TOMORROW/);
});

test("the roadmap exposes contracts, events, side missions, guardians, and relics", () => {
  for (const label of ["ACTIVE WORLD CONTRACT", "Repair knowledge nodes", "Recover a power cell", "Defeat the guardian", "UNIQUE RELIC"]) assert.match(page, new RegExp(label));
  assert.match(page, /world-event-tag/);
  assert.match(page, /currentModule\.name \+ " Relic"/);
  assert.match(css, /\.world-contract/);
  assert.match(css, /\.world-mechanic-banner/);
  assert.match(css, /\.world-power-result/);
});

test("daily world power claims survive local and cloud progress normalization", () => {
  assert.match(progress, /worldPowerClaims: string\[\]/);
  assert.match(progress, /source\.worldPowerClaims/);
  assert.match(progress, /localGame\.worldPowerClaims/);
  assert.match(progress, /cloudGame\.worldPowerClaims/);
  assert.match(page, /progress\.game\.worldPowerClaims\.includes/);
});

test("world mechanics remain responsive and eliminated decoys are accessible", () => {
  assert.match(page, /disabled=\{\(eliminatedOptions/);
  assert.match(css, /label\.eliminated/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.world-mechanic-banner/);
});
