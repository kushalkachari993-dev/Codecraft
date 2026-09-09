"use client";
import { useEffect, useState } from "react";
import type { JourneyPreferences } from "../hooks/use-journey";
import type { PlayerProgress } from "../progress";
import { lessonUrl, loadLearningMemory, MEMORY_EVENT, resumeLessonId, reviewAnswer, saveLearningMemory, type LearningMemory, type LessonVisit, type ReviewItem } from "../learning-memory";

type PathSummary = { lessons: { id: number; title: string }[]; projects: number[] };
async function loadPath(visit: LessonVisit): Promise<PathSummary> {
  if (visit.trackId === "cloud") {
    const { getCloudLessons } = await import("../cloud/catalog");
    return { lessons: getCloudLessons(visit.paceId), projects: [] };
  }
  if (visit.trackId === "backend") {
    const { getBackendLessons } = await import("../backend/curriculum");
    return { lessons: getBackendLessons(visit.paceId), projects: [] };
  }
  const catalog = await import("../codecraft-catalog");
  const lessons = visit.trackId === "python" ? catalog.buildPythonPaceQuests(visit.paceId) : visit.trackId === "genai" ? catalog.buildGenAIPaceQuests(visit.paceId) : catalog.buildSQLPaceQuests(visit.paceId);
  const getModule = visit.trackId === "python" ? catalog.getPythonModule : visit.trackId === "genai" ? catalog.getGenAIModule : catalog.getSQLModule;
  return { lessons: lessons.map(l => ({ id: l.id, title: l.concept })), projects: lessons.filter(l => getModule(visit.paceId, l.id).end === l.id).map(l => l.id) };
}
const labels = { python: "Python", genai: "GenAI", sql: "SQL", cloud: "Cloud Engineering", backend: "Backend Engineering" };
function ReviewCard({ item, onResult }: { item: ReviewItem; onResult: (key: string, correct: boolean) => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const order = item.options.map((_, i) => (i + item.misses) % item.options.length);
  return <article className="return-review-card">
    <p>{labels[item.trackId]} · {item.paceId} · {item.title}</p>
    <fieldset><legend>{item.question}</legend>{order.map(index => <label key={index}>
      <input type="radio" name={"review-" + item.key} checked={choice === index} onChange={() => { setChoice(index); setFeedback(""); }} />
      <span>{item.options[index]}</span>
    </label>)}</fieldset>
    <button disabled={choice === null} onClick={() => {
      const correct = choice === item.answer;
      setFeedback(correct ? "Reviewed successfully." : "Not yet. " + item.explanation);
      onResult(item.key, correct);
    }}>Check review</button>
    <p role="status">{feedback}</p>
    <a href={lessonUrl(item)}>Revisit the explanation →</a>
  </article>;
}
export default function ReturningLearning({ progress, journey, onResume }: { progress: PlayerProgress; journey: JourneyPreferences; onResume: (visit: Pick<JourneyPreferences, "trackId" | "paceId">) => void }) {
  const [memory, setMemory] = useState<LearningMemory | null>(null);
  const [path, setPath] = useState<{ key: string; value: PathSummary } | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const update = () => setMemory(loadLearningMemory());
    const timer = window.setTimeout(update, 0);
    window.addEventListener(MEMORY_EVENT, update);
    window.addEventListener("storage", update);
    return () => { clearTimeout(timer); window.removeEventListener(MEMORY_EVENT, update); window.removeEventListener("storage", update); };
  }, []);
  const bestKey = Object.entries(progress.completed).filter(([key, ids]) => key.includes("-") && ids.length).sort((a, b) => b[1].length - a[1].length)[0]?.[0];
  const fallback = bestKey?.split("-");
  const visit: LessonVisit | null = memory?.lastVisit ?? (journey.started ? { ...journey, lessonId: 1, title: "Your learning path" } : fallback ? {
    trackId: fallback[0] as LessonVisit["trackId"], paceId: fallback[1] as LessonVisit["paceId"], lessonId: 1, title: "Your learning path",
  } : null);
  const trackId = visit?.trackId;
  const paceId = visit?.paceId;
  useEffect(() => {
    if (!trackId || !paceId) return;
    let cancelled = false;
    void loadPath({ trackId, paceId, lessonId: 1, title: "" }).then(value => {
      if (!cancelled) setPath({ key: trackId + "-" + paceId, value });
    }).catch(() => { if (!cancelled) setMessage("The lesson list could not load. Open your roadmap to continue."); });
    return () => { cancelled = true; };
  }, [trackId, paceId]);
  if (!memory || !visit) return null;
  const key = visit.trackId + "-" + visit.paceId;
  const summary = path?.key === key ? path.value : null;
  const completed = progress.completed[key] ?? [];
  const labs = progress.bonus[key] ?? [];
  const nextId = summary ? resumeLessonId(summary.lessons.map(l => l.id), completed, labs, summary.projects, visit.lessonId) : undefined;
  const next = summary?.lessons.find(l => l.id === nextId);
  const demonstrated = summary?.lessons.filter(l => completed.includes(l.id)) ?? [];
  const needsProject = nextId && summary?.projects.includes(nextId) && completed.includes(nextId);
  const pending = memory.reviews.filter(r => !r.reviewed).sort((a, b) => b.misses - a.misses || a.updatedAt - b.updatedAt);
  return <section className="returning-learning" aria-label="Your learning dashboard">
    <div className="returning-heading"><div><p className="pixel-kicker">CONTINUE YOUR JOURNEY</p><h2>{labels[visit.trackId]} · {visit.paceId}</h2>
      <p>{next ? (needsProject ? "Finish your world project: " : "Up next: ") + next.title : nextId === null ? "Every lesson and required project in this path is complete." : "Finding your next lesson…"}</p></div>
      {next ? <a className="curriculum-next" href={lessonUrl({ ...visit, lessonId: next.id })} onClick={() => onResume(visit)}>Continue learning →</a> : <a href={"/roadmap/" + visit.trackId + "/" + visit.paceId} onClick={() => onResume(visit)}>Open roadmap →</a>}
    </div>
    {summary && <div className="returning-skills"><h3>What you’ve demonstrated</h3>
      <p>{demonstrated.length}/{summary.lessons.length} lesson checkpoints passed{summary.projects.length ? " · " + summary.projects.filter(id => labs.includes(id)).length + "/" + summary.projects.length + " world projects verified" : " · completion includes the lesson’s required practice"}</p>
      {demonstrated.length ? <ul>{demonstrated.slice(-3).map(l => <li key={l.id}>{l.title}</li>)}</ul> : <p>Complete a checkpoint to start building your record.</p>}
      <p>Completed checkpoints show practice evidence, not a certification of mastery.</p>
    </div>}
    <div className="returning-reviews"><h3>Practice what needs another look</h3><p>{pending.length ? pending.length + " missed questions to revisit. Answer without reopening the lesson first." : "No missed questions waiting. Future checkpoint mistakes will appear here."}</p>
      <p className="returning-note">This review queue and your last visited lesson are saved in this browser. Reviews do not award XP or unlock lessons.</p>
      <p role="status">{message}</p>
      {pending.slice(0, 5).map(item => <ReviewCard key={item.key} item={item} onResult={(reviewKey, correct) => {
        const current = loadLearningMemory();
        const nextMemory = reviewAnswer(current, reviewKey, correct);
        if (saveLearningMemory(nextMemory)) {
          setMemory(nextMemory);
          setMessage(correct ? "Review passed — " + item.explanation : "The question stays in your review queue.");
        } else setMessage("Browser storage is unavailable. Your review could not be saved.");
      }} />)}
      {pending.length > 5 && <p>Finish a review to bring the next question into view.</p>}
    </div>
  </section>;
}
