"use client";

import { backendProfileStat } from "../backend/progress";
import { BACKEND_TRACK } from "../backend/track";
import type { PlayerProgress } from "../progress";

export default function BackendTrackCard({ progress, recommended = false }: { progress: PlayerProgress; recommended?: boolean }) {
  const completed = backendProfileStat(progress).completed;
  return (
    <article className={`track-card backend ${recommended ? "recommended" : ""}`}>
      <div className="track-art" aria-hidden="true"><span>BE</span><i /><i /></div>
      <div className="track-card-body">
        <div className="recommendation-badge">NEW · 3 PATHS</div>
        <p>SERVICE FOUNDRY</p><h2>Backend Engineering</h2><strong>Beginner · Intermediate · Expert</strong>
        <span>Build dependable APIs and data paths, operate reliable services, and make defensible system-design decisions.</span>
        <div className="track-fit"><small>BEST FIT</small><strong>Application developers, backend engineers, and aspiring system architects.</strong></div>
        <div className="realm-signature"><small>REALM MISSION</small><p>Restore the Service Foundry from its first HTTP contract to a globally resilient platform.</p><b>◆ Service cores</b></div>
        <div className="track-skills"><small>APIs</small><small>Data</small><small>Reliability</small><small>System Design</small></div>
        <div className="track-card-progress"><div><i style={{ width: `${completed / BACKEND_TRACK.total * 100}%` }} /></div><span>{completed}/{BACKEND_TRACK.total} topics</span></div>
        <button onClick={() => window.location.assign("/tracks/backend")}>Choose your Backend path →</button>
      </div>
    </article>
  );
}
