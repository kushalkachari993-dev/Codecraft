"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Document navigation avoids the hosted router's broken lesson transitions. */
import DailyQuestCard from "../components/daily-quest-card";
import { getDailyQuestIndex } from "../daily-quest";
import type { PlayerProgress } from "../progress";
import { getBackendLessons } from "./curriculum";
import { backendCompleted, isBackendLessonUnlocked } from "./progress";
import { BACKEND_PATH_TOTAL, getBackendPath, getBackendWorlds, type BackendPaceId } from "./track";

const lessonPath = (paceId: BackendPaceId, id: number) => "/lesson/backend/" + paceId + "/" + id;
const worldStyles = ["beginner", "intermediate", "expert", "expert"];
const pathMissions: Record<BackendPaceId, Array<{ label: string; title: string; detail: string }>> = {
  beginner: [
    { label: "RECEIVE THE REQUEST", title: "Stable API", detail: "Validate input and return a predictable contract." },
    { label: "PROTECT THE DATA", title: "Durable model", detail: "Preserve invariants while the schema evolves." },
    { label: "ENFORCE TRUST", title: "Secure service", detail: "Bind identity and policy to the requested resource." },
    { label: "OPERATE THE PATH", title: "Observable backend", detail: "Own async work, tests, shutdown, and recovery." },
  ],
  intermediate: [
    { label: "SHAPE THE DOMAIN", title: "Modular service", detail: "Keep policy behind stable, testable boundaries." },
    { label: "TUNE THE DATA PATH", title: "Measured persistence", detail: "Use plans, pools, locks, and caches deliberately." },
    { label: "DELIVER ASYNC WORK", title: "Reliable events", detail: "Survive retries, duplicates, and partial outcomes." },
    { label: "CONTROL PRODUCTION", title: "Service reliability", detail: "Protect capacity, release safely, and lead incidents." },
  ],
  expert: [
    { label: "DISTRIBUTE THE DATA", title: "Explicit guarantees", detail: "Choose consistency, shards, replicas, and recovery." },
    { label: "DEFINE THE SERVICES", title: "Owned boundaries", detail: "Evolve contracts without hiding operational coupling." },
    { label: "DESIGN FOR REGIONS", title: "Global control", detail: "Model capacity, backpressure, privacy, and tenancy." },
    { label: "EVOLVE THE SYSTEM", title: "Architecture practice", detail: "Verify decisions with fitness functions and game days." },
  ],
};

export default function BackendOverview({ paceId, progress, ready }: { paceId: BackendPaceId; progress: PlayerProgress; ready: boolean }) {
  const path = getBackendPath(paceId);
  const lessonsForPath = getBackendLessons(paceId);
  const worlds = getBackendWorlds(paceId);
  const completed = ready ? backendCompleted(progress, paceId) : [];
  const nextId = Math.min(completed.length + 1, BACKEND_PATH_TOTAL);
  const pathDone = completed.length === BACKEND_PATH_TOTAL;
  const today = new Date().toISOString().slice(0, 10);
  const dailyLesson = lessonsForPath[getDailyQuestIndex(today, "backend", paceId, lessonsForPath.length)];
  const dailyCompleted = ready && progress.game.dailyQuestDate === today && progress.game.dailyQuestCompleted;
  return (
    <section className="python-pace-picker cloud-path-picker backend-path-picker" id="backend-content">
      <div className="pace-picker-hero">
        <button onClick={() => window.location.assign("/tracks/backend")}>← Backend paths</button>
        <p className="pixel-kicker">SERVICE FOUNDRY · {path.title.toUpperCase()}</p>
        <h1>Explore your<br /><span>{path.label} roadmap</span></h1>
        <p>{path.description} Learn each concept, investigate realistic evidence, repair a nested artifact, and complete the world project to continue.</p>
      </div>
      <DailyQuestCard completed={dailyCompleted} title={dailyLesson.title} trackLabel="Backend Engineering" paceLabel={path.label} streak={progress.game.dailyQuestStreak} onOpen={() => window.location.assign("/daily-quest/backend/" + paceId)} />
      <section className="journey-resume cloud-path-resume" aria-label="Backend path progress">
        <div><span>{pathDone ? "PATH COMPLETE" : "YOUR BACKEND JOURNEY"}</span><h2>{completed.length}/{BACKEND_PATH_TOTAL} lessons completed</h2><p>{pathDone ? path.title + " complete. Revisit a world or replay the final architecture review." : BACKEND_PATH_TOTAL + " lessons · " + worlds.length + " worlds · " + worlds.length + " required projects"}</p></div>
        <button disabled={!ready} onClick={() => window.location.assign(lessonPath(paceId, nextId))}>{!ready ? "Loading progress…" : pathDone ? "Revisit the capstone →" : completed.length ? "Continue lesson " + nextId + " →" : "Start first lesson →"}</button>
      </section>
      <div className="pace-grid">
        {worlds.map((world, index) => {
          const lessons = lessonsForPath.filter((lesson) => lesson.id >= world.start && lesson.id <= world.end);
          const count = completed.filter((id) => id >= world.start && id <= world.end).length;
          const unlocked = ready && isBackendLessonUnlocked(progress, world.start, paceId);
          const current = nextId >= world.start && nextId <= world.end;
          const destination = count === lessons.length ? world.start : Math.max(world.start, nextId);
          return (
            <article className={"pace-card cloud-world-card " + worldStyles[index] + (current ? " recommended" : "")} key={world.id}>
              <div className="pace-card-art" aria-hidden="true"><span>{count === lessons.length ? "✓" : world.id}</span><i /><i /><b>{count === lessons.length ? "RESTORED" : unlocked ? "UNLOCKED" : "LOCKED"}</b></div>
              <div className="pace-card-body">
                <div className={"recommendation-badge " + (current ? "" : "recommendation-placeholder")} aria-hidden={!current}>{pathDone ? "PATH RESTORED" : "YOUR NEXT WORLD"}</div>
                <div className="pace-tier"><span>WORLD {String(world.id).padStart(2, "0")}</span><small>{lessons.length} LESSONS</small></div>
                <h2>{world.name}</h2><strong>{world.focus}</strong><p>{world.summary}</p>
                <div className="pace-for"><small>WORLD PROJECT</small><span>{lessons[lessons.length - 1].title}</span></div>
                <ol className="cloud-world-lessons" start={world.start}>
                  {lessons.map((lesson) => {
                    const available = ready && isBackendLessonUnlocked(progress, lesson.id, paceId);
                    const done = completed.includes(lesson.id);
                    const label = <><span aria-hidden="true">{done ? "✓" : String(lesson.id).padStart(2, "0")}</span><span>{lesson.title}<small>{lesson.minutes} min · {done ? "Complete" : available ? "Ready" : "Locked"}</small></span></>;
                    return <li key={lesson.id} className={done ? "done" : available ? "available" : "locked"}>{available ? <a href={lessonPath(paceId, lesson.id)}>{label}</a> : <div>{label}</div>}</li>;
                  })}
                </ol>
                <div className="pace-card-progress"><div role="progressbar" aria-label={world.name + " progress"} aria-valuemin={0} aria-valuemax={lessons.length} aria-valuenow={count}><i style={{ width: count / lessons.length * 100 + "%" }} /></div><span>{count}/{lessons.length} complete</span></div>
                <button className="pace-card-cta" disabled={!unlocked} onClick={() => window.location.assign(lessonPath(paceId, destination))}>{!ready ? "Loading progress…" : count === lessons.length ? "Explore restored world →" : unlocked ? "Enter " + world.name + " →" : "Complete world " + index + " to unlock"}</button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="codecraft-lore" aria-label="Your final Backend mission">
        {pathMissions[paceId].map((mission, index) => <article key={mission.label}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{mission.label}</small><strong>{mission.title}</strong><p>{mission.detail}</p></div></article>)}
      </div>
      <div className="pace-picker-note cloud-path-note"><span>◇</span><p><strong>Simulation-only labs · No backend platform required</strong>Practice with fictional service plans, OpenAPI contracts, migrations, event schemas, logs, traces, and incident timelines. Nothing is executed against a live system.</p></div>
      <div className="cloud-path-links"><a href="/tracks/backend">Choose another Backend path →</a><a href="/tracks/cloud">Cloud Engineering track →</a><span>{path.title} · Guest progress saves in this browser</span></div>
    </section>
  );
}
