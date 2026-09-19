"use client";

import { frontendProfileStat } from "../frontend/progress";
import { FRONTEND_TRACK } from "../frontend/track";
import type { PlayerProgress } from "../progress";

export default function FrontendTrackCard({ progress, recommended = false }: { progress: PlayerProgress; recommended?: boolean }) {
  const completed = frontendProfileStat(progress).completed;
  return <article className={`track-card frontend ${recommended ? "recommended" : ""}`}>
    <div className="track-art" aria-hidden="true"><span>FE</span><i /><i /></div>
    <div className="track-card-body">
      <div className="recommendation-badge">NEW · 3 PATHS</div>
      <p>INTERFACE NEXUS</p><h2>Frontend Web Development</h2><strong>Beginner · Intermediate · Expert</strong>
      <span>Build accessible responsive interfaces, engineer tested product experiences, and design secure frontend platforms.</span>
      <div className="track-fit"><small>BEST FIT</small><strong>Web learners, UI developers, product engineers, and aspiring frontend architects.</strong></div>
      <div className="realm-signature"><small>REALM MISSION</small><p>Restore the Interface Nexus from semantic documents to an offline-capable production application.</p><b>◆ Interface cores</b></div>
      <div className="track-skills"><small>HTML & CSS</small><small>JavaScript</small><small>Accessibility</small><small>Performance</small></div>
      <div className="track-card-progress"><div><i style={{ width: `${completed / FRONTEND_TRACK.total * 100}%` }} /></div><span>{completed}/{FRONTEND_TRACK.total} topics</span></div>
      <button onClick={() => window.location.assign("/tracks/frontend")}>Choose your Frontend path →</button>
    </div>
  </article>;
}
