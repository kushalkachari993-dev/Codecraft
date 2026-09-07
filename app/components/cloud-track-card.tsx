"use client";

import { CLOUD_TRACK } from "../cloud/track";
import { cloudProfileStat } from "../cloud/progress";
import type { PlayerProgress } from "../progress";

export default function CloudTrackCard({ progress, recommended = false }: { progress: PlayerProgress; recommended?: boolean }) {
  const completed = cloudProfileStat(progress).completed;
  return (
    <article className={`track-card cloud ${recommended ? "recommended" : ""}`}>
      <div className="track-art" aria-hidden="true"><span>CL</span><i /><i /></div>
      <div className="track-card-body">
        <div className="recommendation-badge">NEW · 3 PATHS</div>
        <p>CLOUD CITADEL</p><h2>Cloud Engineering</h2><strong>Beginner · Intermediate · Expert</strong>
        <span>Build cloud foundations, automate reliable delivery, and design secure production platforms through guided simulations.</span>
        <div className="track-fit"><small>BEST FIT</small><strong>Developers, delivery engineers, SREs, and platform builders.</strong></div>
        <div className="realm-signature"><small>REALM MISSION</small><p>Restore the Cloud Citadel from its first service to a governed self-service platform.</p><b>◆ Uptime cells</b></div>
        <div className="track-skills"><small>Foundations</small><small>Delivery</small><small>Reliability</small><small>Platform</small></div>
        <div className="track-card-progress"><div><i style={{ width: `${completed / CLOUD_TRACK.total * 100}%` }} /></div><span>{completed}/{CLOUD_TRACK.total} topics</span></div>
        <button onClick={() => window.location.assign("/tracks/cloud")}>Choose your Cloud path →</button>
      </div>
    </article>
  );
}
