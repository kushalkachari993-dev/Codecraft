"use client";
import type { PlayerProgress } from "../progress";
import { securityProfileStat } from "../security/progress";
import { SECURITY_TRACK } from "../security/track";

export default function SecurityTrackCard({ progress, recommended = false }: { progress: PlayerProgress; recommended?: boolean }) {
  const completed = securityProfileStat(progress).completed;
  return <article className={`track-card security ${recommended ? "recommended" : ""}`}><div className="track-art" aria-hidden="true"><span>SE</span><i /><i /></div><div className="track-card-body"><div className={"recommendation-badge " + (recommended ? "" : "recommendation-placeholder")} aria-hidden={!recommended}>RECOMMENDED FOR YOUR GOAL</div><p>TRUST CITADEL</p><h2>Cybersecurity Engineering</h2><strong>Beginner · Intermediate · Expert</strong><span>Understand attack paths, build defensible controls, investigate evidence, and recover safely.</span><div className="track-fit"><small>BEST FIT</small><strong>Developers, cloud engineers, and system owners who want practical security judgment.</strong></div><div className="realm-signature"><small>REALM MISSION</small><p>Protect the Core Relay without breaking legitimate user journeys.</p><b>◆ TRUST SIGNAL</b></div><div className="track-skills"><small>Secure design</small><small>Identity & delivery</small><small>Detection & response</small></div><div className="track-card-progress"><div><i style={{ width: `${completed / SECURITY_TRACK.total * 100}%` }} /></div><span>{completed}/{SECURITY_TRACK.total} topics</span></div><button onClick={() => window.location.assign("/tracks/security")}>Choose your Security path →</button></div></article>;
}
