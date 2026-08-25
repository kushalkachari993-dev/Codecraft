import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("track and pace recommendations reserve equal card space", () => {
  assert.match(page, /goalRecommendation === track\.id \? "" : "recommendation-placeholder"/);
  assert.match(page, /paceRecommendation === pace\.id \? "" : "recommendation-placeholder"/);
  assert.match(css, /\.recommendation-placeholder \{ visibility: hidden; \}/);
});

test("desktop selection cards stretch equally and anchor actions", () => {
  assert.match(css, /\.track-grid[^}]*align-items: stretch/);
  assert.match(css, /\.pace-grid[^}]*align-items: stretch/);
  assert.match(css, /\.track-card[^}]*grid-template-rows: 178px 1fr[^}]*height: 100%/);
  assert.match(css, /\.pace-card[^}]*grid-template-rows: 150px 1fr[^}]*height: 100%/);
  assert.match(css, /\.track-card-progress[^}]*margin: auto 0 17px/);
  assert.match(css, /\.pace-card-progress[^}]*margin: auto 0 16px/);
});

test("stacked cards remove reserved recommendation space", () => {
  assert.match(css, /@media \(max-width: 1000px\)[\s\S]*\.recommendation-placeholder \{ display: none; \}/);
});
