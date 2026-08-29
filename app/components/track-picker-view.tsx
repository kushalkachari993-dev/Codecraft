"use client";

import type { JourneyPreferences, JourneyTrackId } from "../hooks/use-journey";
import type { PlayerProgress } from "../progress";
import { TRACK_MATCH, TRACK_TOPIC_TOTALS, TRACKS, type Track } from "../track-catalog";
import DailyQuestCard from "./daily-quest-card";

function FirstRunChecklist({ activeStep }: { activeStep: number }) {
  const steps = ["Choose a track", "Set your pace", "Learn the game loop", "Complete your first lesson"];
  return (
    <ol className="first-run-checklist" aria-label="Getting started progress">
      {steps.map((step, index) => <li className={index < activeStep ? "done" : index === activeStep ? "active" : ""} key={step}><span>{index < activeStep ? "OK" : index + 1}</span><strong>{step}</strong></li>)}
    </ol>
  );
}

export default function TrackPickerView({ journey, totalBadges, savedTrackLabel, savedPaceLabel, dailyQuest, progress, recommendation, cloudUser, onResume, onRecommend, onSelectTrack }: {
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
          const totals = TRACK_TOPIC_TOTALS[track.id];
          const total = totals.beginner + totals.intermediate + totals.expert;
          const completed = (Object.keys(totals) as Array<keyof typeof totals>).reduce((sum, paceId) => sum + (progress.completed[`${track.id}-${paceId}`]?.length ?? 0), 0);
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
