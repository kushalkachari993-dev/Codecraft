"use client";

import { GENAI_PACES } from "../genai-curriculum";
import type { JourneyPaceId, JourneyPreferences, JourneyTrackId } from "../hooks/use-journey";
import { PYTHON_PACES } from "../python-curriculum";
import type { PlayerProgress } from "../progress";
import { SQL_PACES } from "../sql-curriculum";
import { FirstRunChecklist, PACE_MATCH, TRACK_MATCH, TRACKS, type Track } from "../codecraft-catalog";
import DailyQuestCard from "./daily-quest-card";

type Pace = {
  id: JourneyPaceId;
  label: string;
  tagline: string;
  description: string;
  estimatedLevel: string;
  recommendedFor: string;
  topics: Array<{ title: string }>;
};

export function TrackPickerView({ journey, totalBadges, savedTrackLabel, savedPaceLabel, dailyQuest, progress, recommendation, cloudUser, onResume, onRecommend, onSelectTrack }: {
  journey: JourneyPreferences;
  totalBadges: number;
  savedTrackLabel: string;
  savedPaceLabel: string;
  dailyQuest: { completed: boolean; title: string; trackLabel: string; paceLabel: string; streak: number; onOpen: () => void };
  progress: PlayerProgress;
  recommendation: JourneyTrackId;
  cloudUser: { displayName: string } | null;
  onResume: () => void;
  onRecommend: (trackId: JourneyTrackId) => void;
  onSelectTrack: (track: Track) => void;
}) {
  return (
    <section className="track-picker">
      <div className="track-picker-hero">
        <p className="pixel-kicker">ORIGINAL CODE REALMS · CHOOSE YOUR MISSION</p>
        <h1>Repair the Core Relay.<br /><span>Master real code.</span></h1>
        <p>The Code Realms have fallen out of sync. Join Byte, restore their systems one concept at a time, and turn knowledge into power.</p>
      </div>
      {(journey.started || totalBadges > 0) && <section className="journey-resume"><div><span>CONTINUE YOUR JOURNEY</span><h2>{journey.started ? `${savedTrackLabel} / ${savedPaceLabel}` : "Return to your most active path"}</h2><p>Your next unlocked topic, world project, and rewards are waiting.</p></div><button onClick={onResume}>Continue where I left off</button></section>}
      <DailyQuestCard {...dailyQuest} />
      {totalBadges === 0 && <FirstRunChecklist activeStep={0} />}
      <section className="track-recommender" aria-labelledby="track-recommender-title">
        <div><p>NEED A RECOMMENDATION?</p><h2 id="track-recommender-title">What do you want to build?</h2></div>
        <div>
          <button className={recommendation === "python" ? "active" : ""} onClick={() => onRecommend("python")}><strong>Programming foundations</strong><span>Software, automation, APIs</span></button>
          <button className={recommendation === "genai" ? "active" : ""} onClick={() => onRecommend("genai")}><strong>AI applications</strong><span>RAG, agents, evaluation</span></button>
          <button className={recommendation === "sql" ? "active" : ""} onClick={() => onRecommend("sql")}><strong>Data systems</strong><span>Analysis, databases, scale</span></button>
        </div>
      </section>
      <div className="track-grid">
        {TRACKS.map((track) => {
          const paces = track.id === "python" ? PYTHON_PACES : track.id === "genai" ? GENAI_PACES : SQL_PACES;
          const total = paces.reduce((sum, pace) => sum + pace.topics.length, 0);
          const completed = paces.reduce((sum, pace) => sum + (progress.completed[`${track.id}-${pace.id}`]?.length ?? 0), 0);
          const percent = Math.round((completed / total) * 100);
          return (
            <article className={`track-card ${track.id} ${recommendation === track.id ? "recommended" : ""}`} key={track.id}>
              <div className="track-art" aria-hidden="true"><span>{track.icon}</span><i /><i /></div>
              <div className="track-card-body">
                <div className={"recommendation-badge " + (recommendation === track.id ? "" : "recommendation-placeholder")} aria-hidden={recommendation !== track.id}>RECOMMENDED FOR YOUR GOAL</div>
                <p>{track.kicker}</p><h2>{track.label}</h2><strong>Beginner · Intermediate · Expert</strong><span>{track.description}</span>
                <div className="track-fit"><small>BEST FIT</small><strong>{TRACK_MATCH[track.id]}</strong></div>
                <div className="realm-signature"><small>REALM MISSION</small><p>{track.mission}</p><b>◆ {track.energy}</b></div>
                <div className="track-skills">{track.outcome.split(" · ").map((skill) => <small key={skill}>{skill}</small>)}</div>
                <div className="track-card-progress"><div><i style={{ width: `${percent}%` }} /></div><span>{completed}/{total} topics</span></div>
                <button onClick={() => onSelectTrack(track)}>Choose your pace →</button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="codecraft-lore" aria-label="CodeCraft universe"><article><span>01</span><div><small>YOUR GUIDE</small><strong>Byte</strong><p>A relay guardian who turns your code into actions inside each realm.</p></div></article><article><span>02</span><div><small>YOUR POWER</small><strong>Signal shards</strong><p>Earned through understanding, checkpoints, and optional practice.</p></div></article><article><span>03</span><div><small>YOUR MISSION</small><strong>The Core Relay</strong><p>Reconnect every realm and return knowledge to the network.</p></div></article></div>
      <div className="track-picker-note"><span>◆</span><p><strong>{cloudUser ? "Progress synced across devices" : "Progress stays with you"}</strong>{cloudUser ? `Signed in as ${cloudUser.displayName}. Local progress was merged safely with your cloud save.` : "Your XP, badges, and restored systems stay on this device. Sign in above to migrate and sync them."}</p></div>
    </section>
  );
}

export function PacePickerView({ track, paces, progress, totalBadges, recommendation, onBack, onRecommend, onSelect }: {
  track: Track;
  paces: Pace[];
  progress: PlayerProgress;
  totalBadges: number;
  recommendation: JourneyPaceId;
  onBack: () => void;
  onRecommend: (paceId: JourneyPaceId) => void;
  onSelect: (paceId: JourneyPaceId) => void;
}) {
  return (
    <section className={`python-pace-picker ${track.id}-pace-picker`}>
      <div className="pace-picker-hero"><button onClick={onBack}>← All tracks</button><p className="pixel-kicker">{track.label.toUpperCase()} TRAIL · CHOOSE YOUR PATH</p><h1>Choose your<br /><span>{track.label} pace</span></h1><p>Start where you are. You can switch paths at any time, and progress is saved separately for every level.</p></div>
      {totalBadges === 0 && <FirstRunChecklist activeStep={1} />}
      <section className="pace-recommender" aria-labelledby="pace-recommender-title"><div><p>PACE FINDER</p><h2 id="pace-recommender-title">How familiar are you with {track.label}?</h2></div><div>{(Object.keys(PACE_MATCH) as JourneyPaceId[]).map((paceId) => <button className={recommendation === paceId ? "active" : ""} onClick={() => onRecommend(paceId)} key={paceId}><strong>{paceId}</strong><span>{PACE_MATCH[paceId]}</span></button>)}</div><p>Recommended path: <strong>{recommendation[0].toUpperCase() + recommendation.slice(1)}</strong>. You can switch later without losing progress.</p></section>
      <div className="pace-grid">
        {paces.map((pace, index) => {
          const completed = progress.completed[`${track.id}-${pace.id}`]?.length ?? 0;
          const percent = Math.round((completed / pace.topics.length) * 100);
          return <article className={`pace-card ${pace.id} ${recommendation === pace.id ? "recommended" : ""}`} key={pace.id}><div className="pace-card-art" aria-hidden="true"><span>{index + 1}</span><i /><i /><b>{pace.estimatedLevel}</b></div><div className="pace-card-body"><div className={"recommendation-badge " + (recommendation === pace.id ? "" : "recommendation-placeholder")} aria-hidden={recommendation !== pace.id}>RECOMMENDED START</div><div className="pace-tier"><span>PATH {String(index + 1).padStart(2, "0")}</span><small>{pace.topics.length} TOPICS</small></div><h2>{pace.label}</h2><strong>{pace.tagline}</strong><p>{pace.description}</p><div className="pace-for"><small>RECOMMENDED FOR</small><span>{pace.recommendedFor}</span></div><div className="pace-topic-preview">{pace.topics.slice(0, 5).map((topic) => <span key={topic.title}>{topic.title}</span>)}<span>+{pace.topics.length - 5} more</span></div><div className="pace-card-progress"><div><i style={{ width: `${percent}%` }} /></div><span>{completed}/{pace.topics.length} complete</span></div><button className="pace-card-cta" onClick={() => onSelect(pace.id)}>{completed ? `Continue ${pace.label}` : `Start ${pace.label}`} →</button></div></article>;
        })}
      </div>
      <div className="pace-picker-note"><span>◇</span><p><strong>Not sure where to begin?</strong>Start with Beginner. Completing one path is not required before exploring another.</p></div>
    </section>
  );
}
