import type {
  AiReviewReservation,
  LearnerIdentity,
  ProgressRepository,
  SubmissionFilter,
  SubmissionInput,
  SubmissionSummary,
} from "../../server/repositories/progress-repository";
import { applyD1Migrations } from "./migrations";

export class D1ProgressRepository implements ProgressRepository {
  constructor(private readonly db: D1Database) {}

  private async ready() {
    await applyD1Migrations(this.db);
  }

  async syncLearner(user: LearnerIdentity) {
    await this.ready();
    const now = Date.now();
    await this.db.prepare(
      "INSERT INTO learners (user_id, email, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, updated_at = excluded.updated_at",
    ).bind(user.userId, user.email, user.displayName, now, now).run();
  }

  async loadProgress(userId: string) {
    await this.ready();
    const row = await this.db.prepare("SELECT progress_json FROM progress_snapshots WHERE user_id = ?")
      .bind(userId).first<{ progress_json: string }>();
    return row?.progress_json ?? null;
  }

  async saveProgress(user: LearnerIdentity, progressJson: string) {
    await this.syncLearner(user);
    const now = Date.now();
    await this.db.prepare(
      "INSERT INTO progress_snapshots (user_id, progress_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET progress_json = excluded.progress_json, updated_at = excluded.updated_at",
    ).bind(user.userId, progressJson, now).run();
    return now;
  }

  async saveSubmission(user: LearnerIdentity, submission: SubmissionInput) {
    await this.ready();
    const now = Date.now();
    await this.db.batch([
      this.db.prepare(
        "INSERT INTO learners (user_id, email, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, updated_at = excluded.updated_at",
      ).bind(user.userId, user.email, user.displayName, now, now),
      this.db.prepare(
        "INSERT INTO code_submissions (submission_id, user_id, track, pace, topic_id, topic, stage, code, passed, score, feedback_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).bind(crypto.randomUUID(), user.userId, submission.track, submission.pace, submission.topicId, submission.topic, submission.stage, submission.code, submission.passed ? 1 : 0, submission.score, JSON.stringify(submission.feedback), now),
    ]);
    return now;
  }

  async listSubmissions(userId: string, filter?: SubmissionFilter) {
    await this.ready();
    const result = filter
      ? await this.db.prepare(
        "SELECT submission_id, track, pace, topic_id, topic, stage, passed, score, created_at FROM code_submissions WHERE user_id = ? AND track = ? AND pace = ? ORDER BY created_at DESC LIMIT 50",
      ).bind(userId, filter.track, filter.pace).all<SubmissionSummary>()
      : await this.db.prepare(
        "SELECT submission_id, track, pace, topic_id, topic, stage, passed, score, created_at FROM code_submissions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
      ).bind(userId).all<SubmissionSummary>();
    return result.results;
  }

  async deleteLearnerData(userId: string) {
    await this.ready();
    await this.db.batch([
      this.db.prepare("DELETE FROM ai_review_usage WHERE user_id = ?").bind(userId),
      this.db.prepare("DELETE FROM code_submissions WHERE user_id = ?").bind(userId),
      this.db.prepare("DELETE FROM progress_snapshots WHERE user_id = ?").bind(userId),
      this.db.prepare("DELETE FROM learners WHERE user_id = ?").bind(userId),
    ]);
  }

  async reserveAiReview(user: LearnerIdentity, dailyLimit: number): Promise<AiReviewReservation | null> {
    await this.syncLearner(user);
    const now = Date.now();
    const usageDate = new Date(now).toISOString().slice(0, 10);
    const row = await this.db.prepare(
      "INSERT INTO ai_review_usage (user_id, usage_date, review_count, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id, usage_date) DO UPDATE SET review_count = ai_review_usage.review_count + 1, updated_at = excluded.updated_at WHERE ai_review_usage.review_count < ? RETURNING review_count",
    ).bind(user.userId, usageDate, now, dailyLimit).first<{ review_count: number }>();
    return row ? { usageDate, count: Number(row.review_count) } : null;
  }

  async releaseAiReview(userId: string, usageDate: string) {
    await this.ready();
    await this.db.prepare(
      "UPDATE ai_review_usage SET review_count = MAX(0, review_count - 1), updated_at = ? WHERE user_id = ? AND usage_date = ?",
    ).bind(Date.now(), userId, usageDate).run();
  }

  async healthCheck() {
    try {
      await this.ready();
      const row = await this.db.prepare(
        "SELECT COUNT(*) AS table_count FROM sqlite_schema WHERE type = 'table' AND name IN ('learners', 'progress_snapshots', 'code_submissions', 'ai_review_usage')",
      ).first<{ table_count: number }>();
      return Number(row?.table_count) === 4;
    } catch {
      return false;
    }
  }
}
