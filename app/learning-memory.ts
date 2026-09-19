import type { JourneyPaceId, JourneyTrackId } from "./hooks/use-journey";

export type ReviewQuestion = { question: string; options: string[]; answer: number; explanation: string };
export type LessonVisit = { trackId: JourneyTrackId; paceId: JourneyPaceId; lessonId: number; title: string };
export type ReviewItem = LessonVisit & ReviewQuestion & { key: string; misses: number; reviewed: boolean; updatedAt: number };
export type LearningMemory = { lastVisit: LessonVisit | null; reviews: ReviewItem[] };
const STORAGE_KEY = "codecraft-learning-memory-v1";
export const MEMORY_EVENT = "codecraft-learning-memory";
const tracks = ["python", "genai", "sql", "cloud", "backend", "frontend"];
const paces = ["beginner", "intermediate", "expert"];
const text = (v: unknown, limit: number): v is string => typeof v === "string" && v.length > 0 && v.length <= limit;
function validVisit(v: unknown): v is LessonVisit {
  if (!v || typeof v !== "object") return false;
  const x = v as LessonVisit;
  return tracks.includes(x.trackId) && paces.includes(x.paceId) && Number.isInteger(x.lessonId) && x.lessonId > 0 && x.lessonId <= 1000 && text(x.title, 200);
}
export function normalizeMemory(value: unknown): LearningMemory {
  const source = value && typeof value === "object" ? value as Partial<LearningMemory> : {};
  const reviews = Array.isArray(source.reviews) ? source.reviews.filter((r): r is ReviewItem =>
    validVisit(r) && text(r.key, 2000) && text(r.question, 1600) && text(r.explanation, 3000) &&
    Array.isArray(r.options) && r.options.length >= 2 && r.options.length <= 6 && r.options.every(o => text(o, 1600)) &&
    Number.isInteger(r.answer) && r.answer >= 0 && r.answer < r.options.length &&
    Number.isFinite(r.updatedAt) && Number.isInteger(r.misses) && r.misses > 0 && typeof r.reviewed === "boolean"
  ).slice(-100) : [];
  return { lastVisit: validVisit(source.lastVisit) ? source.lastVisit : null, reviews };
}
export function loadLearningMemory(): LearningMemory {
  try { return normalizeMemory(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}")); }
  catch { return { lastVisit: null, reviews: [] }; }
}
export function saveLearningMemory(memory: LearningMemory): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeMemory(memory)));
    window.dispatchEvent(new Event(MEMORY_EVENT));
    return true;
  } catch { return false; }
}
export function rememberLesson(visit: LessonVisit) {
  return saveLearningMemory({ ...loadLearningMemory(), lastVisit: visit });
}
export function addMissedQuestion(memory: LearningMemory, visit: LessonVisit, question: ReviewQuestion, now = Date.now()): LearningMemory {
  const key = [visit.trackId, visit.paceId, visit.lessonId, question.question].join(":");
  const old = memory.reviews.find(r => r.key === key);
  return normalizeMemory({ ...memory, reviews: [...memory.reviews.filter(r => r.key !== key), {
    ...visit, ...question, key, misses: (old?.misses ?? 0) + 1, reviewed: false, updatedAt: now,
  }] });
}
export function recordMissedQuestion(visit: LessonVisit, question: ReviewQuestion) {
  return saveLearningMemory(addMissedQuestion(loadLearningMemory(), visit, question));
}
export function reviewAnswer(memory: LearningMemory, key: string, correct: boolean, now = Date.now()): LearningMemory {
  return { ...memory, reviews: memory.reviews.map(r => r.key === key ? { ...r, reviewed: correct, misses: r.misses + (correct ? 0 : 1), updatedAt: now } : r) };
}
export function lessonUrl(visit: LessonVisit) {
  return `/lesson/${visit.trackId}/${visit.paceId}/${visit.lessonId}`;
}
// Resume the first unfinished requirement, including a passed checkpoint whose world project is still due.
export function resumeLessonId(ids: number[], completed: number[], labs: number[], projectIds: number[], lastId?: number): number | null {
  const pending = ids.find(id => !completed.includes(id) || (projectIds.includes(id) && !labs.includes(id)));
  if (pending === undefined) return null;
  if (lastId && ids.includes(lastId) && lastId <= pending && !completed.includes(lastId)) return lastId;
  return pending;
}
