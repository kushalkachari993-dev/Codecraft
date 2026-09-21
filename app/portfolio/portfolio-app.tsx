"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Full document navigation matches the hosted CodeCraft routes. */

import { SignInButton, useAuth, useUser } from "@clerk/react";
import { useEffect, useMemo, useState } from "react";
import { useProgressSync } from "../hooks/use-progress-sync";
import { type PortfolioProjectProgress, type PortfolioTrackId } from "../progress";
import {
  PORTFOLIO_PROJECTS,
  PORTFOLIO_RUBRIC,
  buildPortfolioShowcase,
  decodePortfolioShowcase,
  encodePortfolioShowcase,
  portfolioProjectComplete,
  portfolioProjectProgress,
  portfolioProjectScore,
  type PortfolioShowcase,
} from "./catalog";

const RUBRIC_LEVELS = ["Not yet", "Emerging", "Ready", "Strong"];

function PublicShowcase({ showcase }: { showcase: PortfolioShowcase }) {
  const completed = showcase.projects.filter((project) => project.complete).length;
  return <main className="app-shell portfolio-shell">
    <header className="topbar portfolio-topbar"><a className="brand" href="/tracks" aria-label="Open CodeCraft tracks"><span className="brand-cube" aria-hidden="true"><i /></span><span>CODECRAFT</span></a><nav className="main-nav" aria-label="Main navigation"><a href="/tracks">Tracks</a><a className="active" href="/portfolio">Portfolio</a></nav><a className="auth-chip" href="/portfolio">Build yours →</a></header>
    <section className="portfolio-public">
      <div className="portfolio-public-hero"><p>VERIFIED CODECRAFT SHOWCASE</p><h1>{showcase.learner}</h1><span>{completed} portfolio-ready project{completed === 1 ? "" : "s"} · Shared {new Date(showcase.generatedAt).toLocaleDateString()}</span></div>
      {showcase.projects.length === 0 ? <div className="portfolio-empty"><strong>No project evidence shared yet</strong><p>This showcase link is valid, but its owner had not started a flagship project when it was created.</p></div> : <div className="portfolio-showcase-grid">{showcase.projects.map((summary) => { const project = PORTFOLIO_PROJECTS.find((entry) => entry.id === summary.id); if (!project) return null; return <article className={summary.complete ? "complete" : ""} key={summary.id}><div className="portfolio-card-icon">{project.icon}</div><div><small>{project.label.toUpperCase()} · {project.role.toUpperCase()}</small><h2>{project.title}</h2><p>{project.outcome}</p><div className="portfolio-skill-list">{project.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div><aside><strong>{summary.score}%</strong><span>{summary.milestones}/5 milestones</span><b>{summary.complete ? "PORTFOLIO READY" : "IN PROGRESS"}</b></aside></article>; })}</div>}
      <footer className="portfolio-public-footer"><p>Scores are learner-authored rubric results. Private evidence notes are never included in shared links.</p><a href="/portfolio">Start a CodeCraft portfolio →</a></footer>
    </section>
  </main>;
}

export default function PortfolioApp() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const displayName = user?.fullName ?? user?.firstName ?? "CodeCraft learner";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const { progress, persistProgress, progressReady, cloudState } = useProgressSync({ clerkLoaded: Boolean(isLoaded), clerkSignedIn: Boolean(isSignedIn), getToken, displayName, email });
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<PortfolioTrackId>("python");
  const [shareState, setShareState] = useState("");
  const [sharedRequested, setSharedRequested] = useState(false);
  const [showcase, setShowcase] = useState<PortfolioShowcase | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const token = new URL(window.location.href).searchParams.get("showcase");
      setSharedRequested(Boolean(token));
      setShowcase(token ? decodePortfolioShowcase(token) : null);
      setMounted(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const activeProject = PORTFOLIO_PROJECTS.find((project) => project.id === activeId) ?? PORTFOLIO_PROJECTS[0];
  const current = portfolioProjectProgress(progress, activeProject.id);
  const summaries = useMemo(() => PORTFOLIO_PROJECTS.map((definition) => {
    const project = portfolioProjectProgress(progress, definition.id);
    return { definition, project, score: portfolioProjectScore(project), complete: portfolioProjectComplete(project) };
  }), [progress]);
  const started = summaries.filter(({ project }) => project.completedMilestones.length || Object.values(project.evidence).some(Boolean) || Object.values(project.rubric).some((value) => value > 0)).length;
  const completed = summaries.filter(({ complete }) => complete).length;
  const averageScore = started ? Math.round(summaries.reduce((sum, item) => sum + (item.project.updatedAt ? item.score : 0), 0) / started) : 0;

  if (!mounted) return <main className="app-shell portfolio-shell"><p className="view-loading" role="status">Loading project portfolio…</p></main>;
  if (sharedRequested) return showcase ? <PublicShowcase showcase={showcase} /> : <main className="app-shell portfolio-shell"><section className="portfolio-invalid"><p>PORTFOLIO LINK ERROR</p><h1>This showcase link is invalid</h1><span>Ask its owner to create a fresh share link from their CodeCraft portfolio.</span><a href="/portfolio">Open your portfolio →</a></section></main>;

  const saveProject = (next: PortfolioProjectProgress) => {
    // This callback only runs in response to learner input and supplies conflict-resolution ordering for cloud sync.
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    persistProgress({ ...progress, portfolio: { projects: { ...progress.portfolio.projects, [activeProject.id]: { ...next, updatedAt: now } }, updatedAt: now } });
  };
  const setEvidence = (milestoneId: string, value: string) => saveProject({ ...current, evidence: { ...current.evidence, [milestoneId]: value } });
  const toggleMilestone = (milestoneId: string) => {
    const done = current.completedMilestones.includes(milestoneId);
    const completedMilestones = done ? current.completedMilestones.filter((id) => id !== milestoneId) : [...current.completedMilestones, milestoneId];
    saveProject({ ...current, completedMilestones });
  };
  const setRubric = (rubricId: string, score: number) => saveProject({ ...current, rubric: { ...current.rubric, [rubricId]: score } });

  const copyShareLink = async () => {
    const token = encodePortfolioShowcase(buildPortfolioShowcase(progress, displayName));
    const link = `${window.location.origin}/portfolio?showcase=${encodeURIComponent(token)}`;
    try { await navigator.clipboard.writeText(link); setShareState("Share link copied. Private notes were excluded."); }
    catch { setShareState("Copy was blocked. Open this page in a browser that allows clipboard access."); }
  };

  const downloadBundle = () => {
    const bundle = { exportedAt: new Date().toISOString(), learner: displayName, projects: PORTFOLIO_PROJECTS.map((definition) => ({ definition, progress: portfolioProjectProgress(progress, definition.id), score: portfolioProjectScore(portfolioProjectProgress(progress, definition.id)), portfolioReady: portfolioProjectComplete(portfolioProjectProgress(progress, definition.id)) })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "codecraft-portfolio-evidence.json"; link.click(); URL.revokeObjectURL(url);
  };

  return <main className="app-shell portfolio-shell">
    <header className="topbar portfolio-topbar"><a className="brand" href="/tracks" aria-label="Open CodeCraft tracks"><span className="brand-cube" aria-hidden="true"><i /></span><span>CODECRAFT</span></a><nav className="main-nav" aria-label="Main navigation"><a href="/tracks">Tracks</a><a className="active" href="/portfolio">Portfolio</a><a href="/profile">Profile</a></nav><div className="player-stats"><span className="stat-chip"><b>◆</b> {progress.xp} XP</span>{isSignedIn ? <span className={`auth-account ${cloudState}`}>{cloudState === "syncing" ? "Saving…" : cloudState === "error" ? "Sync error" : cloudState === "synced" ? "Cloud saved" : "Signed in"}</span> : <SignInButton mode="modal"><button className="auth-chip">{isLoaded ? "Sign in to sync" : "Checking…"}</button></SignInButton>}</div></header>
    <section className="portfolio-page" id="portfolio-content">
      <header className="portfolio-hero"><div><p>PORTFOLIO PROJECT SYSTEM</p><h1>Turn learning into <span>proof.</span></h1><p>Build one complete engineering case per track. Save milestone evidence, assess it against a clear rubric, and share the result without exposing private notes.</p></div><div className="portfolio-summary" aria-label="Portfolio progress"><article><strong>{started}</strong><span>started</span></article><article><strong>{completed}</strong><span>ready</span></article><article><strong>{averageScore}%</strong><span>average rubric</span></article></div></header>
      <section className="portfolio-actions" aria-label="Portfolio actions"><div><strong>{isSignedIn ? `Synced for ${displayName}` : "Saved on this device"}</strong><span>{isSignedIn ? "Project work follows your CodeCraft account." : "Sign in to carry project work across devices."}</span></div><button onClick={downloadBundle} disabled={!progressReady}>Download evidence bundle</button><button className="primary" onClick={copyShareLink} disabled={!progressReady || started === 0}>Copy share link</button>{shareState && <p role="status">{shareState}</p>}</section>
      <div className="portfolio-layout">
        <aside className="portfolio-project-list" aria-label="Flagship projects"><div><p>FLAGSHIP PROJECTS</p><span>Select a project to continue.</span></div>{summaries.map(({ definition, project, score, complete }) => <button className={`${activeId === definition.id ? "active" : ""} ${complete ? "complete" : ""}`} onClick={() => { setActiveId(definition.id); setShareState(""); }} key={definition.id}><span>{definition.icon}</span><div><strong>{definition.label}</strong><small>{project.completedMilestones.length}/5 milestones · {score}%</small></div><b>{complete ? "✓" : "→"}</b></button>)}</aside>
        <section className={`portfolio-workbench ${activeProject.id}`}>
          <header className="portfolio-project-hero"><div className="portfolio-card-icon">{activeProject.icon}</div><div><p>{activeProject.label.toUpperCase()} · {activeProject.role.toUpperCase()}</p><h2>{activeProject.title}</h2><span>{activeProject.outcome}</span></div><aside><strong>{portfolioProjectScore(current)}%</strong><span>{portfolioProjectComplete(current) ? "PORTFOLIO READY" : `${current.completedMilestones.length}/5 MILESTONES`}</span></aside></header>
          <section className="portfolio-brief"><div><small>PROJECT SCENARIO</small><p>{activeProject.scenario}</p></div><div><small>REVIEWER EXPECTS</small><ul>{activeProject.artifacts.map((artifact) => <li key={artifact}>{artifact}</li>)}</ul></div><div><small>SKILLS DEMONSTRATED</small><div className="portfolio-skill-list">{activeProject.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div></section>
          <section className="portfolio-milestones"><div className="portfolio-section-title"><p>01 · PROJECT MILESTONES</p><h3>Build the case in reviewable stages</h3><span>Evidence saves automatically. Add at least 40 characters before completing a milestone.</span></div>{activeProject.milestones.map((milestone, index) => { const done = current.completedMilestones.includes(milestone.id); const evidence = current.evidence[milestone.id] ?? ""; return <article className={done ? "done" : ""} key={milestone.id}><header><span>{done ? "✓" : String(index + 1).padStart(2, "0")}</span><div><small>{milestone.title}</small><strong>{milestone.deliverable}</strong></div></header><label htmlFor={`${activeProject.id}-${milestone.id}`}>Evidence note</label><p>{milestone.evidencePrompt}</p><textarea id={`${activeProject.id}-${milestone.id}`} value={evidence} onChange={(event) => setEvidence(milestone.id, event.target.value)} maxLength={1_200} rows={4} placeholder="Record a decision, artifact reference, test result, or reviewer instruction…" /><footer><span>{evidence.trim().length}/1200 characters</span><button aria-pressed={done} disabled={!done && evidence.trim().length < 40} onClick={() => toggleMilestone(milestone.id)}>{done ? "Reopen milestone" : "Mark evidence complete"}</button></footer></article>; })}</section>
          <section className="portfolio-rubric"><div className="portfolio-section-title"><p>02 · REVIEW RUBRIC</p><h3>Assess the evidence, not the effort</h3><span>A project becomes portfolio-ready when all milestones are complete and every dimension reaches Ready or Strong.</span></div>{PORTFOLIO_RUBRIC.map((dimension) => <article key={dimension.id}><div><strong>{dimension.label}</strong><p>{dimension.description}</p></div><div role="group" aria-label={`${dimension.label} score`}>{RUBRIC_LEVELS.map((label, score) => <button className={(current.rubric[dimension.id] ?? 0) === score ? "active" : ""} aria-pressed={(current.rubric[dimension.id] ?? 0) === score} onClick={() => setRubric(dimension.id, score)} key={label}><b>{score}</b><span>{label}</span></button>)}</div></article>)}</section>
          <footer className={`portfolio-readiness ${portfolioProjectComplete(current) ? "ready" : ""}`}><div><small>PROJECT STATUS</small><strong>{portfolioProjectComplete(current) ? "Portfolio ready" : "Evidence in progress"}</strong><p>{portfolioProjectComplete(current) ? "The milestone and rubric thresholds are complete. Download the evidence bundle or refresh your public share link." : "Complete all five milestones and score at least Ready in every rubric dimension."}</p></div><a href={`/roadmap/${activeProject.id}/expert`}>Review the expert roadmap →</a></footer>
        </section>
      </div>
    </section>
  </main>;
}
