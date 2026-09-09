import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const moduleUrls = new Map();
async function moduleUrl(url) {
  if (moduleUrls.has(url.href)) return moduleUrls.get(url.href);
  const source = await readFile(url, "utf8");
  let code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  for (const match of [...code.matchAll(/from ["']([^"']+)["']/g)]) {
    const target = match[1].startsWith(".") ? await moduleUrl(new URL(match[1] + ".ts", url)) : import.meta.resolve(match[1]);
    code = code.replace(match[0], "from " + JSON.stringify(target));
  }
  const result = "data:text/javascript;base64," + Buffer.from(code).toString("base64");
  moduleUrls.set(url.href, result);
  return result;
}
const load = async path => import(await moduleUrl(new URL("../" + path, import.meta.url)));
const memory = await load("app/learning-memory.ts");
const { LESSON_DEPTH, getLessonDepth } = await load("app/lesson-depth.ts");
const visit = { trackId: "python", paceId: "beginner", lessonId: 2, title: "Variables" };
const question = getLessonDepth("python", "beginner", "Variables").questions[0];
const empty = () => ({ lastVisit: null, reviews: [] });

test("resume retains an unfinished world project after its checkpoint passes", () => {
  assert.equal(memory.resumeLessonId([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5], [], [5], 6), 5);
  assert.equal(memory.resumeLessonId([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5], [5], [5], 5), 6);
});
test("resume never skips a gap, follows the actual path order, and handles completion", () => {
  assert.equal(memory.resumeLessonId([1, 2, 3], [1, 3], [], [], 3), 2);
  assert.equal(memory.resumeLessonId([1, 2, 3], [], [], [], 3), 1);
  assert.equal(memory.resumeLessonId([1, 2, 3], [1], [], [], 2), 2);
  assert.equal(memory.resumeLessonId([1, 2, 3], [1, 2, 3], [3], [3], 1), null);
  assert.equal(memory.resumeLessonId([], [], [], []), null);
});
test("missed questions deduplicate, keep counts, resolve and reopen", () => {
  let state = memory.addMissedQuestion(empty(), visit, question, 1);
  state = memory.addMissedQuestion(state, visit, question, 2);
  assert.equal(state.reviews.length, 1);
  assert.equal(state.reviews[0].misses, 2);
  const key = state.reviews[0].key;
  state = memory.reviewAnswer(state, key, false, 3);
  assert.equal(state.reviews[0].misses, 3);
  assert.equal(state.reviews[0].reviewed, false);
  state = memory.reviewAnswer(state, key, true, 4);
  assert.equal(state.reviews[0].reviewed, true);
  assert.equal(state.reviews[0].misses, 3);
  state = memory.addMissedQuestion(state, visit, question, 5);
  assert.equal(state.reviews[0].reviewed, false);
  assert.equal(state.reviews[0].misses, 4);
  assert.deepEqual(Object.keys(state).sort(), ["lastVisit", "reviews"]);
});
test("review identity separates tracks and keeps at most 100 recent questions", () => {
  let state = memory.addMissedQuestion(empty(), visit, question);
  state = memory.addMissedQuestion(state, { ...visit, trackId: "sql" }, question);
  assert.equal(state.reviews.length, 2);
  for (let i = 0; i < 101; i++) state = memory.addMissedQuestion(state, visit, { ...question, question: "Question " + i }, i);
  assert.equal(state.reviews.length, 100);
  assert.equal(state.reviews[0].question, "Question 1");
  assert.equal(state.reviews[99].question, "Question 100");
});
test("malformed storage cannot produce a lesson link or invalid answer", () => {
  const valid = memory.addMissedQuestion(empty(), visit, question).reviews[0];
  for (const patch of [{ trackId: "../admin" }, { paceId: "invalid" }, { lessonId: -1 }, { title: "" }]) {
    assert.equal(memory.normalizeMemory({ lastVisit: { ...visit, ...patch } }).lastVisit, null);
    assert.equal(memory.normalizeMemory({ reviews: [{ ...valid, ...patch }] }).reviews.length, 0);
  }
  for (const patch of [{ options: [] }, { options: ["a", null] }, { answer: 9 }, { answer: 1.5 }, { reviewed: "yes" }, { misses: -1 }, { updatedAt: NaN }]) {
    assert.equal(memory.normalizeMemory({ reviews: [{ ...valid, ...patch }] }).reviews.length, 0);
  }
  assert.deepEqual(memory.normalizeMemory(null), empty());
  assert.equal(memory.lessonUrl(visit), "/lesson/python/beginner/2");
});
test("browser storage reloads review state, signals updates and fails safely", () => {
  const prior = globalThis.window;
  const entries = new Map();
  const events = [];
  try {
    globalThis.window = { localStorage: { getItem: k => entries.get(k) ?? null, setItem: (k, v) => entries.set(k, v) }, dispatchEvent: event => events.push(event.type) };
    assert.equal(memory.rememberLesson(visit), true);
    assert.equal(memory.recordMissedQuestion(visit, question), true);
    assert.deepEqual(memory.loadLearningMemory().lastVisit, visit);
    assert.equal(memory.loadLearningMemory().reviews.length, 1);
    assert.deepEqual(events, [memory.MEMORY_EVENT, memory.MEMORY_EVENT]);
    entries.set("codecraft-learning-memory-v1", "{broken");
    assert.deepEqual(memory.loadLearningMemory(), empty());
    globalThis.window.localStorage = { getItem() { throw Error("blocked"); }, setItem() { throw Error("full"); } };
    assert.deepEqual(memory.loadLearningMemory(), empty());
    assert.equal(memory.saveLearningMemory(empty()), false);
  } finally {
    if (prior === undefined) delete globalThis.window;
    else globalThis.window = prior;
  }
});
test("the audit covers two beginner lessons per track with 30 explained questions", () => {
  assert.equal(LESSON_DEPTH.length, 10);
  for (const track of ["python", "genai", "sql", "cloud", "backend"]) {
    assert.equal(LESSON_DEPTH.filter(d => d.track === track).length, 2);
  }
  const keys = new Set();
  for (const pack of LESSON_DEPTH) {
    keys.add(pack.track + ":" + pack.title);
    assert.equal(getLessonDepth(pack.track, "beginner", pack.title), pack);
    assert.equal(getLessonDepth(pack.track, "expert", pack.title), undefined);
    assert.ok(pack.explanation.length > 100 && pack.reasoning.length > 100 && pack.example.includes("\n"));
    assert.equal(new URL(pack.source).protocol, "https:");
    assert.equal(pack.questions.length, 3);
    for (const q of pack.questions) {
      assert.equal(new Set(q.options).size, 3);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 3);
      assert.ok(q.question.length > 35 && q.explanation.length > 50);
    }
  }
  assert.equal(keys.size, 10);
});
test("audited quizzes reach the lesson bundle without removing original walkthroughs", async () => {
  const { getAuthoredLessonEnrichment } = await load("app/lesson-enrichment-bundle.ts");
  const { getLessonEnrichment } = await load("app/authored-lessons.ts");
  for (const pack of LESSON_DEPTH.filter(d => ["python", "sql", "genai"].includes(d.track))) {
    const original = getLessonEnrichment(pack.track, "beginner", pack.title);
    const current = getAuthoredLessonEnrichment(pack.track, "beginner", pack.title);
    assert.ok(original);
    assert.deepEqual(current.quiz, pack.questions);
    assert.deepEqual(current.walkthrough.slice(0, original.walkthrough.length), original.walkthrough);
    assert.equal(current.walkthrough.at(-1).body, pack.reasoning);
    assert.equal(current.whyItMatters, original.whyItMatters);
  }
});
