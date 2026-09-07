"use client";

import type { PlayerProgress } from "../progress";
import { getCloudLessons } from "./catalog";
import { cloudCompleted } from "./progress";
import { CLOUD_PATHS, type CloudPaceId } from "./track";

const PACE_MATCH: Record<CloudPaceId, string> = {
  beginner: "I am new to deploying applications.",
  intermediate: "I know core services and want delivery practice.",
  expert: "I design or operate production platforms.",
};

export default function CloudPacePicker({ progress, ready, recommendation, onRecommend, onSelect }: {
  progress: PlayerProgress;
  ready: boolean;
  recommendation: CloudPaceId;
  onRecommend: (paceId: CloudPaceId) => void;
  onSelect: (paceId: CloudPaceId) => void;
}) {
  return (
    <section className="python-pace-picker cloud-pace-picker" id="cloud-content">
      <div className="pace-picker-hero">
        <button onClick={() => window.location.assign("/tracks")}>← All tracks</button>
        <p className="pixel-kicker">CLOUD ENGINEERING TRAIL · CHOOSE YOUR PATH</p>
        <h1>Choose your<br /><span>Cloud Engineering pace</span></h1>
        <p>Start where you are. Each level has 21 interactive topics across four worlds, and progress is saved separately for every path.</p>
      </div>
      <section className="pace-recommender" aria-labelledby="cloud-pace-recommender-title">
        <div><p>PACE FINDER</p><h2 id="cloud-pace-recommender-title">How familiar are you with cloud engineering?</h2></div>
        <div>{CLOUD_PATHS.map((path) => <button className={recommendation === path.id ? "active" : ""} onClick={() => onRecommend(path.id)} key={path.id}><strong>{path.id}</strong><span>{PACE_MATCH[path.id]}</span></button>)}</div>
        <p>Recommended path: <strong>{CLOUD_PATHS.find((path) => path.id === recommendation)?.label}</strong>. You can switch later without losing progress.</p>
      </section>
      <div className="pace-grid">
        {CLOUD_PATHS.map((path, index) => {
          const topics = getCloudLessons(path.id);
          const completed = ready ? cloudCompleted(progress, path.id).length : 0;
          const percent = Math.round(completed / topics.length * 100);
          return (
            <article className={"pace-card " + path.id + (recommendation === path.id ? " recommended" : "")} key={path.id}>
              <div className="pace-card-art" aria-hidden="true"><span>{index + 1}</span><i /><i /><b>{path.estimatedLevel}</b></div>
              <div className="pace-card-body">
                <div className={"recommendation-badge " + (recommendation === path.id ? "" : "recommendation-placeholder")} aria-hidden={recommendation !== path.id}>RECOMMENDED START</div>
                <div className="pace-tier"><span>PATH {String(index + 1).padStart(2, "0")}</span><small>{topics.length} TOPICS</small></div>
                <h2>{path.label}</h2><strong>{path.tagline}</strong><p>{path.description}</p>
                <div className="pace-for"><small>RECOMMENDED FOR</small><span>{path.recommendedFor}</span></div>
                <div className="pace-topic-preview">{topics.slice(0, 5).map((topic) => <span key={topic.title}>{topic.title}</span>)}<span>+{topics.length - 5} more</span></div>
                <div className="pace-card-progress"><div role="progressbar" aria-label={path.label + " progress"} aria-valuemin={0} aria-valuemax={topics.length} aria-valuenow={completed}><i style={{ width: percent + "%" }} /></div><span>{ready ? completed + "/" + topics.length + " complete" : "Loading…"}</span></div>
                <button className="pace-card-cta" disabled={!ready} onClick={() => onSelect(path.id)}>{!ready ? "Loading progress…" : completed ? "Continue " + path.label : "Start " + path.label} →</button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="pace-picker-note"><span>◇</span><p><strong>Not sure where to begin?</strong>Start with Beginner. Every lab is a deterministic simulation, so no cloud account or charges are required.</p></div>
    </section>
  );
}
