"use client";

import { SignInButton, useAuth } from "@clerk/react";
import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import type { BetaAnalyticsSummary } from "../../../server/repositories/analytics-repository";

type LoadState = "checking" | "loading" | "ready" | "locked" | "denied" | "error";
type AdminAnalyticsSummary = BetaAnalyticsSummary & { accessMode: "clerk" | "temporary" };

const labels: Record<string, string> = {
  session_started: "Sessions",
  track_selected: "Track selections",
  pace_selected: "Pace selections",
  journey_resumed: "Journey resumes",
  tutorial_completed: "Tutorial completions",
  lesson_started: "Lessons opened",
  checkpoint_passed: "Checkpoints passed",
  checkpoint_failed: "Checkpoints failed",
  lab_started: "Labs opened",
  lab_run_passed: "Lab runs passed",
  lab_run_failed: "Lab runs failed",
  lab_completed: "Labs completed",
  world_power_used: "World powers used",
  world_completed: "Worlds completed",
};

export default function AnalyticsAdminPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [state, setState] = useState<LoadState>("checking");
  const [summary, setSummary] = useState<AdminAnalyticsSummary | null>(null);
  const [days, setDays] = useState(30);
  const [message, setMessage] = useState("");
  const [passcode, setPasscode] = useState("");

  const loadSummary = useCallback(async (signal?: AbortSignal) => {
    try {
      const token = isSignedIn ? await getToken() : null;
      const response = await fetch(`/api/admin/analytics?days=${days}`, {
        signal,
        credentials: "same-origin",
        headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      const payload = await response.json() as AdminAnalyticsSummary & { error?: string };
      if (response.status === 401) {
        setState("locked");
        setMessage(payload.error ?? "Owner access required.");
        return;
      }
      if (response.status === 403) {
        setState("denied");
        setMessage(payload.error ?? "Owner access required.");
        return;
      }
      if (!response.ok) throw new Error(payload.error ?? "Analytics could not be loaded.");
      setSummary(payload);
      setState("ready");
    } catch (error: unknown) {
      if ((error as { name?: string }).name === "AbortError") return;
      setState("error");
      setMessage(error instanceof Error ? error.message : "Analytics could not be loaded.");
    }
  }, [days, getToken, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    const controller = new AbortController();
    void Promise.resolve().then(() => loadSummary(controller.signal));
    return () => controller.abort();
  }, [isLoaded, loadSummary]);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const response = await fetch("/api/admin/session", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    const payload = await response.json() as { error?: string };
    setPasscode("");
    if (!response.ok) {
      setState("locked");
      setMessage(payload.error ?? "Temporary owner access could not be unlocked.");
      return;
    }
    await loadSummary();
  }

  async function lockTemporarySession() {
    await fetch("/api/admin/session", { method: "DELETE", credentials: "same-origin" });
    setSummary(null);
    setState("locked");
    setMessage("Temporary owner access was cleared.");
  }

  const funnel = new Map(summary?.funnel.map((row) => [row.event_name, row]) ?? []);
  const sessions = Math.max(1, funnel.get("session_started")?.unique_sessions ?? summary?.totals.uniqueSessions ?? 1);
  const conversion = (event: string) => Math.round(((funnel.get(event)?.unique_sessions ?? 0) / sessions) * 100);

  return (
    <main className="legal-page analytics-page">
      <Link className="legal-back" href="/">&larr; Return to CodeCraft</Link>
      <header className="legal-hero analytics-hero">
        <p>CODECRAFT / OWNER CONSOLE</p>
        <h1>Beta insights</h1>
        <span>Privacy-safe learning events and direct player feedback.</span>
      </header>

      {!isLoaded || state === "checking" ? (
        <section><p>Checking owner access&hellip;</p></section>
      ) : state === "locked" ? (
        <section className="owner-access-panel">
          <h2>Owner access required</h2>
          <p>{message}</p>
          <form className="owner-passcode-form" onSubmit={unlock}>
            <label htmlFor="owner-passcode">Temporary beta owner passcode</label>
            <div>
              <input id="owner-passcode" type="password" autoComplete="current-password" value={passcode} onChange={(event) => setPasscode(event.target.value)} required minLength={16} />
              <button className="legal-primary-button" type="submit">Unlock insights</button>
            </div>
          </form>
          <p className="owner-access-divider">or use the permanent account path</p>
          <SignInButton mode="modal"><button className="legal-primary-button">Sign in with Clerk</button></SignInButton>
          <small>This passcode fallback is temporary and will be removed after production Clerk is verified.</small>
        </section>
      ) : state === "denied" || state === "error" ? (
        <section>
          <h2>{state === "denied" ? "Owner access required" : "Dashboard unavailable"}</h2>
          <p>{message}</p>
          {state === "denied" && <p>Sign out of the non-owner Clerk account, or use a separate browser session for the temporary owner passcode.</p>}
        </section>
      ) : state !== "ready" || !summary ? (
        <section><p>Loading beta signals&hellip;</p></section>
      ) : (
        <>
          <section className="analytics-controls">
            <div><h2>Last {days} days</h2><p>Raw event rows are automatically removed after 90 days.</p></div>
            <div className="analytics-control-actions">
              <label><span>Window</span><select value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select></label>
              {summary.accessMode === "temporary" && <button className="legal-primary-button" onClick={lockTemporarySession}>Lock temporary access</button>}
            </div>
          </section>
          <section className="analytics-stat-grid">
            <article><small>ACTIVE SESSIONS</small><strong>{summary.totals.uniqueSessions}</strong><span>{summary.totals.signedInLearners} signed-in learners</span></article>
            <article><small>LEARNING EVENTS</small><strong>{summary.totals.events}</strong><span>predefined events only</span></article>
            <article><small>FEEDBACK</small><strong>{summary.totals.feedback}</strong><span>{summary.totals.averageRating === null ? "No ratings yet" : `${summary.totals.averageRating}/5 average`}</span></article>
            <article><small>FIRST WORLD</small><strong>{conversion("world_completed")}%</strong><span>session-to-world conversion</span></article>
          </section>
          <section>
            <div className="analytics-section-heading"><div><h2>Learning funnel</h2><p>Unique sessions reaching each milestone.</p></div></div>
            <div className="analytics-funnel">
              {["session_started", "track_selected", "pace_selected", "lesson_started", "checkpoint_passed", "lab_completed", "world_completed"].map((event) => {
                const row = funnel.get(event);
                const percent = conversion(event);
                return <article key={event}><div><strong>{labels[event]}</strong><span>{row?.unique_sessions ?? 0} sessions / {row?.event_count ?? 0} events</span></div><b>{percent}%</b><i><span style={{ width: `${percent}%` }} /></i></article>;
              })}
            </div>
          </section>
          <section>
            <div className="analytics-section-heading"><div><h2>Daily activity</h2><p>Sessions and events by UTC day.</p></div></div>
            <div className="analytics-daily">{summary.daily.length ? summary.daily.map((row) => <article key={row.activity_date}><span>{row.activity_date}</span><strong>{row.unique_sessions} players</strong><small>{row.event_count} events</small></article>) : <p>No learning events in this window yet.</p>}</div>
          </section>
          <section>
            <div className="analytics-section-heading"><div><h2>Recent feedback</h2><p>Messages never include code, prompts, answers, names, or emails.</p></div><strong>{summary.totals.feedback} TOTAL</strong></div>
            <div className="analytics-feedback-list">{summary.recentFeedback.length ? summary.recentFeedback.map((item) => <article key={item.feedback_id}><header><strong>{"*".repeat(item.rating)}{".".repeat(5 - item.rating)}</strong><span>{item.category.toUpperCase()} / {new Date(item.created_at).toLocaleDateString()}</span></header><p>{item.message}</p><footer>{[item.track, item.pace, item.world_number ? `World ${item.world_number}` : null, item.topic_id ? `Topic ${item.topic_id}` : null, item.difficulty?.replaceAll("_", " ")].filter(Boolean).join(" / ") || "General beta feedback"}{item.contact_allowed ? " / Follow-up allowed" : ""}</footer></article>) : <p>No feedback received yet.</p>}</div>
          </section>
        </>
      )}
    </main>
  );
}
