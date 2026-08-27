"use client";

import { SignInButton } from "@clerk/react";
import type { FormEventHandler } from "react";
import type { AvatarId, PlayerProgress } from "../progress";
import type { SavedSubmission, SubmissionsState } from "../hooks/use-profile";

type AvatarOption = { id: AvatarId; name: string; glyph: string; description: string; unlockAt: number };
type ActiveAvatar = Pick<AvatarOption, "id" | "name" | "glyph">;
type TrackProfileStat = {
  id: "python" | "genai" | "sql";
  icon: string;
  label: string;
  completed: number;
  total: number;
  projects: number;
  percent: number;
};
type Achievement = { id: string; icon: string; name: string; detail: string; unlocked: boolean };

type ProfilePanelProps = {
  open: boolean;
  signedIn: boolean;
  email: string;
  displayName: string;
  level: number;
  xpToNextLevel: number;
  levelProgress: number;
  totalBadges: number;
  totalProjects: number;
  progress: PlayerProgress;
  trackStats: TrackProfileStat[];
  avatars: AvatarOption[];
  activeAvatar: ActiveAvatar;
  achievements: Achievement[];
  unlockedAchievements: number;
  editingName: boolean;
  firstNameDraft: string;
  lastNameDraft: string;
  nameSaveState: "idle" | "saving" | "saved" | "error";
  nameError: string;
  savedSubmissions: SavedSubmission[];
  submissionsState: SubmissionsState;
  onClose: () => void;
  onBeginNameEdit: () => void;
  onCancelNameEdit: () => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSaveName: FormEventHandler<HTMLFormElement>;
  onChooseAvatar: (avatarId: AvatarId) => void;
  onManageAccount: () => void;
  onSignOut: () => void;
};

export default function ProfilePanel(props: ProfilePanelProps) {
  if (!props.open) return null;

  return (
    <div className="profile-backdrop">
      <button className="profile-backdrop-dismiss" onClick={props.onClose} aria-label="Close profile" />
      <section className="profile-panel" id="codecraft-profile" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <button className="profile-close" onClick={props.onClose} aria-label="Close profile">×</button>
        <header className="profile-panel-hero">
          <div className={`profile-panel-avatar ${props.activeAvatar.id}`} aria-hidden="true">{props.activeAvatar.glyph}<small>LV {props.level}</small></div>
          <div>
            <p>CODECRAFT PLAYER PROFILE</p>
            <h2 id="profile-title">{props.displayName}</h2>
            <span>{props.signedIn ? props.email : "Local adventurer"}</span>
          </div>
          {props.signedIn && !props.editingName && <button className="edit-name-button" onClick={props.onBeginNameEdit}>Edit name</button>}
        </header>

        {props.editingName && props.signedIn && (
          <form className="profile-name-form" onSubmit={props.onSaveName}>
            <label><span>First or player name</span><input value={props.firstNameDraft} onChange={(event) => props.onFirstNameChange(event.target.value)} maxLength={60} autoComplete="given-name" /></label>
            <label><span>Last name</span><input value={props.lastNameDraft} onChange={(event) => props.onLastNameChange(event.target.value)} maxLength={60} autoComplete="family-name" /></label>
            {props.nameError && <p role="alert">{props.nameError}</p>}
            <div><button type="button" onClick={props.onCancelNameEdit}>Cancel</button><button type="submit" disabled={props.nameSaveState === "saving"}>{props.nameSaveState === "saving" ? "Saving…" : "Save name"}</button></div>
          </form>
        )}

        <div className="profile-stats-grid" aria-label="Player progress summary">
          <article><small>LEVEL</small><strong>{props.level}</strong><span>{props.xpToNextLevel} XP to next</span></article>
          <article><small>TOPICS</small><strong>{props.totalBadges}</strong><span>completed</span></article>
          <article><small>PROJECTS</small><strong>{props.totalProjects}</strong><span>worlds restored</span></article>
          <article><small>XP</small><strong>{props.progress.xp}</strong><span>signal earned</span></article>
        </div>

        <section className="profile-level-progress">
          <div><p>LEVEL {props.level} PROGRESS</p><span>{props.levelProgress}/100 XP</span></div>
          <div role="progressbar" aria-label={`Level ${props.level} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={props.levelProgress}><i style={{ width: `${props.levelProgress}%` }} /></div>
        </section>

        <section className="profile-track-summary">
          <div className="profile-section-heading"><div><p>Badges by track</p><span>Every completed topic restores one signal badge.</span></div><strong>{props.totalBadges} TOTAL</strong></div>
          <div className="profile-track-list">
            {props.trackStats.map((track) => (
              <article className={track.id} key={track.id}>
                <div className="profile-track-icon">{track.icon}</div>
                <div><strong>{track.label}</strong><span>{track.completed}/{track.total} badges · {track.projects} projects</span><div><i style={{ width: `${track.percent}%` }} /></div></div>
                <b>{track.percent}%</b>
              </article>
            ))}
          </div>
        </section>

        <section className="profile-loadout">
          <div className="profile-section-heading"><div><p>Avatar loadout</p><span>Choose the explorer representing you in the Code Realms.</span></div><strong>{props.activeAvatar.name.toUpperCase()}</strong></div>
          <div className="avatar-options">
            {props.avatars.map((avatar) => {
              const unlocked = props.totalBadges >= avatar.unlockAt;
              return <button className={`${avatar.id} ${props.progress.game.avatarId === avatar.id ? "selected" : ""}`} key={avatar.id} disabled={!unlocked} onClick={() => props.onChooseAvatar(avatar.id)}><span>{unlocked ? avatar.glyph : "▣"}</span><strong>{avatar.name}</strong><small>{unlocked ? avatar.description : `Unlock at ${avatar.unlockAt} badges`}</small></button>;
            })}
          </div>
        </section>

        <section className="profile-collection">
          <div className="profile-section-heading"><div><p>Inventory & achievements</p><span>Artifacts come from learning, labs, daily missions, and boss projects.</span></div><strong>{props.progress.game.inventory.length} ITEMS</strong></div>
          <div className="inventory-grid">
            {props.progress.game.inventory.map((item, index) => <div key={item}><span>{["◇", "◆", "✦", "◈"][index % 4]}</span><strong>{item}</strong></div>)}
          </div>
          <div className="achievement-grid" aria-label={`${props.unlockedAchievements} of ${props.achievements.length} achievements unlocked`}>
            {props.achievements.map((achievement) => <article className={achievement.unlocked ? "unlocked" : "locked"} key={achievement.id}><span>{achievement.unlocked ? achievement.icon : "?"}</span><div><strong>{achievement.name}</strong><small>{achievement.detail}</small></div></article>)}
          </div>
        </section>

        <section className="profile-submissions">
          <div className="profile-section-heading"><div><p>Saved submissions</p><span>Your latest cloud-saved lab attempts.</span></div>{props.savedSubmissions.length > 0 && <strong>{props.savedSubmissions.length} RECENT</strong>}</div>
          {!props.signedIn ? (
            <div className="profile-empty"><span>◇</span><p><strong>Sign in to save attempts</strong>Your local XP remains available, and future submissions will sync to your account.</p></div>
          ) : props.submissionsState === "loading" ? (
            <div className="profile-loading"><i /> Loading saved submissions…</div>
          ) : props.submissionsState === "error" ? (
            <div className="profile-empty"><span>!</span><p><strong>Submissions are temporarily unavailable</strong>Your current progress is still safe.</p></div>
          ) : props.savedSubmissions.length === 0 ? (
            <div className="profile-empty"><span>◇</span><p><strong>No saved submissions yet</strong>Run and submit an optional lab to create your first record.</p></div>
          ) : (
            <div className="submission-list">
              {props.savedSubmissions.slice(0, 8).map((submission) => (
                <article key={submission.submission_id}>
                  <span className={submission.passed ? "passed" : "failed"}>{submission.passed ? "✓" : "!"}</span>
                  <div><strong>{submission.topic}</strong><small>{submission.track.toUpperCase()} · {submission.pace.toUpperCase()} · {submission.stage === "submitted" ? "SUBMITTED" : "ATTEMPT"}</small></div>
                  <div><b>{submission.score}%</b><time dateTime={new Date(submission.created_at).toISOString()}>{new Date(submission.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time></div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="profile-account-actions">
          {props.signedIn ? (
            <>
              <button onClick={props.onManageAccount}>Manage Clerk account</button>
              <a href="/account/delete">Delete account</a>
              <button className="sign-out-button" onClick={props.onSignOut}>Sign out</button>
            </>
          ) : (
            <SignInButton mode="modal"><button onClick={props.onClose}>Sign in to sync and edit name</button></SignInButton>
          )}
        </footer>
        <div className="profile-policy-links"><a href="/privacy">Privacy</a><span>·</span><a href="/api/health">Service status</a>{props.signedIn && <><span>·</span><a href="/admin/analytics">Owner insights</a></>}</div>
      </section>
    </div>
  );
}
