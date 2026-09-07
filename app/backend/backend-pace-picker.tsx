"use client";

import type { PlayerProgress } from "../progress";
import { getBackendLessons } from "./curriculum";
import { backendCompleted } from "./progress";
import { BACKEND_PATHS, type BackendPaceId } from "./track";

const PACE_MATCH: Record<BackendPaceId, string> = {
  beginner: "I can code, but I am new to complete server-side applications.",
  intermediate: "I have built APIs and want reliable production practices.",
  expert: "I design distributed systems or lead architecture decisions.",
};

export default function BackendPacePicker({ progress, ready, recommendation, onRecommend, onSelect }: {
  progress: PlayerProgress;
  ready: boolean;
  recommendation: BackendPaceId;
  onRecommend: (paceId: BackendPaceId) => void;
  onSelect: (paceId: BackendPaceId) => void;
}) {
  return (
    <section className="python-pace-picker cloud-pace-picker backend-pace-picker" id="backend-content">
      <div className="pace-picker-hero">
        <button onClick={() => window.location.assign("/tracks")}>← All tracks</button>
        <p className="pixel-kicker">SERVICE FOUNDRY · CHOOSE YOUR PATH</p>
        <h1>Choose your<br /><span>Backend Engineering pace</span></h1>
        <p>Start where you are. Each level has 21 interactive topics across four worlds, and progress is saved separately for every path.</p>
      </div>
      <section className="pace-recommender" aria-labelledby="backend-pace-recommender-title">
        <div><p>PACE FINDER</p><h2 id="backend-pace-recommender-title">How familiar are you with backend engineering?</h2></div>
        <div>{BACKEND_PATHS.map((path) => <button className={recommendation === path.id ? "active" : ""} onClick={() => onRecommend(path.id)} key={path.id}><strong>{path.id}</strong><span>{PACE_MATCH[path.id]}</span></button>)}</div>
        <p>Recommended path: <strong>{BACKEND_PATHS.find((path) => path.id === recommendation)?.label}</strong>. You can switch later without losing progress.</p>
      </section>
      <div className="pace-grid">
        {BACKEND_PATHS.map((path, index) => {
          const topics = getBackendLessons(path.id);
          const completed = ready ? backendCompleted(progress, path.id).length : 0;
          const percent = Math.round(completed / topics.length * 100);
          return (
            <article className={"pace-card " + path.id + (recommendation === path.id ? " recommended" : "")} key={path.id}>
              <div className="pace-card-art" aria-hidden="true"><span>{index + 1}</span><i /><i /><b>{path.estimatedLevel}</b></div>
              <div className="pace-card-body">
                <div className={"recommendation-badge " + (recommendation === path.id ? "" : "recommendation-placeholder")} aria-hidden={recommendation !== path.id}>RECOMMENDED START</div>
                <div className="pace-tier"><span>PATH {String(index + 1).padStart(2, "0")}</span><small>{topics.length} TOPICS</small></div>
                <h2>{path.label}</h2><strong>{path.tagline}</strong><p>{path.description}</p>
                <div className="pace-for"><small>RECOMMENDED FOR</small><span>{path.recommendedFor}</span></div>
                <div className="pace-topic-preview">{topics.slice(0, 5).map((lesson) => <span key={lesson.title}>{lesson.title}</span>)}<span>+{topics.length - 5} more</span></div>
                <div className="pace-card-progress"><div role="progressbar" aria-label={path.label + " progress"} aria-valuemin={0} aria-valuemax={topics.length} aria-valuenow={completed}><i style={{ width: percent + "%" }} /></div><span>{ready ? completed + "/" + topics.length + " complete" : "Loading…"}</span></div>
                <button className="pace-card-cta" disabled={!ready} onClick={() => onSelect(path.id)}>{!ready ? "Loading progress…" : completed ? "Continue " + path.label : "Start " + path.label} →</button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="pace-picker-note"><span>◇</span><p><strong>Not sure where to begin?</strong>Start with Beginner. Every exercise is a deterministic local simulation—no server, database, queue, or external account is required.</p></div>
    </section>
  );
}
