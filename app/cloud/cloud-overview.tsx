"use client";

import Link from "next/link";
import DailyQuestCard from "../components/daily-quest-card";
import { getDailyQuestIndex } from "../daily-quest";
import type { PlayerProgress } from "../progress";
import { getCloudLessons } from "./catalog";
import { CLOUD_PATH_TOTAL, getCloudPath, getCloudWorlds, type CloudPaceId } from "./track";
import { cloudCompleted, isCloudLessonUnlocked } from "./progress";

const lessonPath = (paceId: CloudPaceId, id: number) => "/lesson/cloud/" + paceId + "/" + id;
const worldStyles = ["beginner", "intermediate", "expert", "expert"];
const pathMissions: Record<CloudPaceId, Array<{ label: string; title: string; detail: string }>> = {
  beginner: [
    { label: "RECEIVE THE REQUEST", title: "HTTPS edge", detail: "Give users a secure route to your service." },
    { label: "RUN THE SERVICE", title: "Python API", detail: "Release a healthy container and test recovery." },
    { label: "PROTECT THE DATA", title: "Private database", detail: "Permit the app and deny untrusted traffic." },
    { label: "OPERATE AND RECOVER", title: "Service control", detail: "Own async work, cost signals, and tested data recovery." },
  ],
  intermediate: [
    { label: "DECLARE THE SYSTEM", title: "Reviewed infrastructure", detail: "Turn repeatable environments into protected change plans." },
    { label: "DELIVER ONE ARTIFACT", title: "Trusted pipeline", detail: "Promote signed bytes through a safe rollout." },
    { label: "PROVE RELIABILITY", title: "SLO and recovery", detail: "Alert on user impact and exercise restoration." },
    { label: "CONTROL PRODUCTION", title: "Runtime feedback loop", detail: "Reconcile drift, scale on demand, and test incidents safely." },
  ],
  expert: [
    { label: "GOVERN THE FOUNDATION", title: "Platform boundaries", detail: "Scale accounts, networks, policies, and evidence." },
    { label: "VERIFY EVERY REQUEST", title: "Zero-trust delivery", detail: "Bind workload identity to trusted artifacts and paths." },
    { label: "OPERATE THE PLATFORM", title: "Resilience command", detail: "Lead recovery, incidents, and cloud unit economics." },
    { label: "RUN THE COMMONS", title: "Platform product", detail: "Govern tenants, data, capacity, APIs, and developer outcomes." },
  ],
};

export default function CloudOverview({ paceId, progress, ready }: {
  paceId: CloudPaceId; progress: PlayerProgress; ready: boolean;
}) {
  const path = getCloudPath(paceId);
  const lessonsForPath = getCloudLessons(paceId);
  const worlds = getCloudWorlds(paceId);
  const completed = ready ? cloudCompleted(progress, paceId) : [];
  const nextId = Math.min(completed.length + 1, CLOUD_PATH_TOTAL);
  const pathDone = completed.length === CLOUD_PATH_TOTAL;
  const today = new Date().toISOString().slice(0, 10);
  const dailyLesson = lessonsForPath[getDailyQuestIndex(today, "cloud", paceId, lessonsForPath.length)];
  const dailyCompleted = ready && progress.game.dailyQuestDate === today && progress.game.dailyQuestCompleted;
  return (
    <section className="python-pace-picker cloud-path-picker" id="cloud-content">
      <div className="pace-picker-hero">
        <button onClick={() => window.location.assign("/tracks/cloud")}>← Cloud paths</button>
        <p className="pixel-kicker">CLOUD CITADEL · {path.title.toUpperCase()}</p>
        <h1>Explore your<br /><span>{path.label} roadmap</span></h1>
        <p>{path.description} Learn each concept, repair a relay plan, and complete the world project to continue.</p>
      </div>
      <DailyQuestCard completed={dailyCompleted} title={dailyLesson.title} trackLabel="Cloud Engineering" paceLabel={path.label} streak={progress.game.dailyQuestStreak} onOpen={() => window.location.assign("/daily-quest/cloud/" + paceId)} />
      <section className="journey-resume cloud-path-resume" aria-label="Cloud path progress">
        <div><span>{pathDone ? "PATH COMPLETE" : "YOUR CLOUD JOURNEY"}</span><h2>{completed.length}/{CLOUD_PATH_TOTAL} lessons completed</h2><p>{pathDone ? path.title + " complete. Revisit a world or replay the final project." : CLOUD_PATH_TOTAL + " lessons · " + worlds.length + " worlds · " + worlds.length + " required projects"}</p></div>
        <button disabled={!ready} onClick={() => window.location.assign(lessonPath(paceId, nextId))}>{!ready ? "Loading progress…" : pathDone ? "Revisit the capstone →" : completed.length ? "Continue lesson " + nextId + " →" : "Start first lesson →"}</button>
      </section>
      <div className="pace-grid">
        {worlds.map((world, index) => {
          const lessons = lessonsForPath.filter((lesson) => lesson.id >= world.start && lesson.id <= world.end);
          const count = completed.filter((id) => id >= world.start && id <= world.end).length;
          const unlocked = ready && isCloudLessonUnlocked(progress, world.start, paceId);
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
                    const available = ready && isCloudLessonUnlocked(progress, lesson.id, paceId);
                    const done = completed.includes(lesson.id);
                    const label = <><span aria-hidden="true">{done ? "✓" : String(lesson.id).padStart(2, "0")}</span><span>{lesson.title}<small>{lesson.minutes} min · {done ? "Complete" : available ? "Ready" : "Locked"}</small></span></>;
                    return <li key={lesson.id} className={done ? "done" : available ? "available" : "locked"}>{available ? <Link href={lessonPath(paceId, lesson.id)}>{label}</Link> : <div>{label}</div>}</li>;
                  })}
                </ol>
                <div className="pace-card-progress"><div role="progressbar" aria-label={world.name + " progress"} aria-valuemin={0} aria-valuemax={lessons.length} aria-valuenow={count}><i style={{ width: count / lessons.length * 100 + "%" }} /></div><span>{count}/{lessons.length} complete</span></div>
                <button className="pace-card-cta" disabled={!unlocked} onClick={() => window.location.assign(lessonPath(paceId, destination))}>{!ready ? "Loading progress…" : count === lessons.length ? "Explore restored world →" : unlocked ? "Enter " + world.name + " →" : "Complete world " + index + " to unlock"}</button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="codecraft-lore" aria-label="Your final Cloud mission">
        {pathMissions[paceId].map((mission, index) => <article key={mission.label}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{mission.label}</small><strong>{mission.title}</strong><p>{mission.detail}</p></div></article>)}
      </div>
      <div className="pace-picker-note cloud-path-note"><span>◇</span><p><strong>Simulation-only labs · No cloud account required</strong>Practice with fictional JSON relay plans. The capstone models a deployment; no real infrastructure is created.</p></div>
      <div className="cloud-path-links"><Link href="/tracks/cloud">Choose another Cloud path →</Link><Link href="/tracks/python">Python track →</Link><span>{path.title} · Guest progress saves in this browser</span></div>
    </section>
  );
}
