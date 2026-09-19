"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Document navigation avoids the hosted router's broken lesson transitions. */
import DailyQuestCard from "../components/daily-quest-card";
import { getDailyQuestIndex } from "../daily-quest";
import type { PlayerProgress } from "../progress";
import { getFrontendLessons } from "./curriculum";
import { frontendCompleted, isFrontendLessonUnlocked } from "./progress";
import { FRONTEND_PATH_TOTAL, getFrontendPath, getFrontendWorlds, type FrontendPaceId } from "./track";

const lessonPath = (paceId: FrontendPaceId, id: number) => "/lesson/frontend/" + paceId + "/" + id;
const worldStyles = ["beginner", "intermediate", "expert", "expert"];
const pathMissions: Record<FrontendPaceId, Array<{ label: string; title: string; detail: string }>> = {
  beginner: [
    { label: "STRUCTURE THE WEB", title: "Meaningful document", detail: "Connect browser behavior to semantic HTML and resilient media." },
    { label: "COMPOSE THE LAYOUT", title: "Responsive system", detail: "Use cascade, spacing, typography, Flexbox, and Grid deliberately." },
    { label: "INCLUDE EVERY USER", title: "Operable interface", detail: "Build responsive forms, feedback, focus, and keyboard paths." },
    { label: "CONNECT THE DATA", title: "Interactive dashboard", detail: "Manage JavaScript state, events, requests, and recovery." },
  ],
  intermediate: [
    { label: "TYPE THE FOUNDATION", title: "Dependable modules", detail: "Control packages, types, async work, and browser storage." },
    { label: "BUILD THE PRODUCT", title: "Composable flows", detail: "Coordinate components, routes, forms, and cached data." },
    { label: "PROVE THE QUALITY", title: "Layered evidence", detail: "Use unit, component, E2E, accessibility, and visual tests." },
    { label: "SHIP THE EXPERIENCE", title: "Measured application", detail: "Use browser APIs, honest states, motion, and performance budgets." },
  ],
  expert: [
    { label: "CONTROL THE RUNTIME", title: "Rendering architecture", detail: "Own scheduling, memory, type APIs, and framework boundaries." },
    { label: "GOVERN THE SYSTEM", title: "Interface platform", detail: "Scale component, token, CSS, locale, and accessibility contracts." },
    { label: "ACCELERATE DELIVERY", title: "Resilient rendering", detail: "Protect critical paths, caching, offline state, and streams." },
    { label: "DEFEND THE PRODUCT", title: "Trusted release", detail: "Harden DOM, policy, sessions, analytics, previews, and rollback." },
  ],
};

export default function FrontendOverview({ paceId, progress, ready }: { paceId: FrontendPaceId; progress: PlayerProgress; ready: boolean }) {
  const path = getFrontendPath(paceId); const lessonsForPath = getFrontendLessons(paceId); const worlds = getFrontendWorlds(paceId); const completed = ready ? frontendCompleted(progress, paceId) : []; const nextId = Math.min(completed.length + 1, FRONTEND_PATH_TOTAL); const pathDone = completed.length === FRONTEND_PATH_TOTAL;
  const today = new Date().toISOString().slice(0, 10); const dailyLesson = lessonsForPath[getDailyQuestIndex(today, "frontend", paceId, lessonsForPath.length)]; const dailyCompleted = ready && progress.game.dailyQuestDate === today && progress.game.dailyQuestCompleted;
  return <section className="python-pace-picker cloud-path-picker backend-path-picker frontend-path-picker" id="frontend-content">
    <div className="pace-picker-hero"><button onClick={() => window.location.assign("/tracks/frontend")}>← Frontend paths</button><p className="pixel-kicker">INTERFACE NEXUS · {path.title.toUpperCase()}</p><h1>Explore your<br /><span>{path.label} roadmap</span></h1><p>{path.description} Learn each concept, investigate realistic browser evidence, repair a static artifact, and complete the world project to continue.</p></div>
    <DailyQuestCard completed={dailyCompleted} title={dailyLesson.title} trackLabel="Frontend Web Development" paceLabel={path.label} streak={progress.game.dailyQuestStreak} onOpen={() => window.location.assign("/daily-quest/frontend/" + paceId)} />
    <section className="journey-resume cloud-path-resume" aria-label="Frontend path progress"><div><span>{pathDone ? "PATH COMPLETE" : "YOUR FRONTEND JOURNEY"}</span><h2>{completed.length}/{FRONTEND_PATH_TOTAL} lessons completed</h2><p>{pathDone ? path.title + " complete. Revisit a world or replay the final architecture review." : FRONTEND_PATH_TOTAL + " lessons · " + worlds.length + " worlds · " + worlds.length + " required projects"}</p></div><button disabled={!ready} onClick={() => window.location.assign(lessonPath(paceId, nextId))}>{!ready ? "Loading progress…" : pathDone ? "Revisit the capstone →" : completed.length ? "Continue lesson " + nextId + " →" : "Start first lesson →"}</button></section>
    <div className="pace-grid">{worlds.map((world, index) => { const lessons = lessonsForPath.filter((lesson) => lesson.id >= world.start && lesson.id <= world.end); const count = completed.filter((id) => id >= world.start && id <= world.end).length; const unlocked = ready && isFrontendLessonUnlocked(progress, world.start, paceId); const current = nextId >= world.start && nextId <= world.end; const destination = count === lessons.length ? world.start : Math.max(world.start, nextId); return <article className={"pace-card cloud-world-card " + worldStyles[index] + (current ? " recommended" : "")} key={world.id}>
      <div className="pace-card-art" aria-hidden="true"><span>{count === lessons.length ? "✓" : world.id}</span><i /><i /><b>{count === lessons.length ? "RESTORED" : unlocked ? "UNLOCKED" : "LOCKED"}</b></div><div className="pace-card-body"><div className={"recommendation-badge " + (current ? "" : "recommendation-placeholder")} aria-hidden={!current}>{pathDone ? "PATH RESTORED" : "YOUR NEXT WORLD"}</div><div className="pace-tier"><span>WORLD {String(world.id).padStart(2, "0")}</span><small>{lessons.length} LESSONS</small></div><h2>{world.name}</h2><strong>{world.focus}</strong><p>{world.summary}</p><div className="pace-for"><small>WORLD PROJECT</small><span>{lessons[lessons.length - 1].title}</span></div><ol className="cloud-world-lessons" start={world.start}>{lessons.map((lesson) => { const available = ready && isFrontendLessonUnlocked(progress, lesson.id, paceId); const done = completed.includes(lesson.id); const label = <><span aria-hidden="true">{done ? "✓" : String(lesson.id).padStart(2, "0")}</span><span>{lesson.title}<small>{lesson.minutes} min · {done ? "Complete" : available ? "Ready" : "Locked"}</small></span></>; return <li key={lesson.id} className={done ? "done" : available ? "available" : "locked"}>{available ? <a href={lessonPath(paceId, lesson.id)}>{label}</a> : <div>{label}</div>}</li>; })}</ol><div className="pace-card-progress"><div role="progressbar" aria-label={world.name + " progress"} aria-valuemin={0} aria-valuemax={lessons.length} aria-valuenow={count}><i style={{ width: count / lessons.length * 100 + "%" }} /></div><span>{count}/{lessons.length} complete</span></div><button className="pace-card-cta" disabled={!unlocked} onClick={() => window.location.assign(lessonPath(paceId, destination))}>{!ready ? "Loading progress…" : count === lessons.length ? "Explore restored world →" : unlocked ? "Enter " + world.name + " →" : "Complete world " + index + " to unlock"}</button></div>
    </article>; })}</div>
    <div className="codecraft-lore" aria-label="Your final Frontend mission">{pathMissions[paceId].map((mission, index) => <article key={mission.label}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{mission.label}</small><strong>{mission.title}</strong><p>{mission.detail}</p></div></article>)}</div>
    <div className="pace-picker-note cloud-path-note"><span>◇</span><p><strong>Static labs · No new platform required</strong>Practice with fictional browser contracts, HTML, CSS, TypeScript, release policies, traces, accessibility diffs, bundle reports, and incident timelines. Submitted code is never executed.</p></div>
    <div className="cloud-path-links"><a href="/tracks/frontend">Choose another Frontend path →</a><a href="/tracks/backend">Backend Engineering track →</a><span>{path.title} · Guest progress saves in this browser</span></div>
  </section>;
}
