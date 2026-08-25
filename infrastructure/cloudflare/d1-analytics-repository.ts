import type {
  AnalyticsRepository,
  AnalyticsEventInput,
  BetaAnalyticsSummary,
  BetaFeedbackInput,
  AnalyticsFunnelRow,
  AnalyticsDailyRow,
  FeedbackCategoryRow,
  RecentFeedback,
} from "../../server/repositories/analytics-repository";
import { applyD1Migrations } from "./migrations";

const EVENT_LIMIT_PER_MINUTE = 60;
const FEEDBACK_LIMIT_PER_DAY = 5;
const RAW_EVENT_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

export class D1AnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly db: D1Database) {}

  private async ready() {
    await applyD1Migrations(this.db);
  }

  async recordEvent(input: AnalyticsEventInput, userId?: string) {
    await this.ready();
    const now = Date.now();
    const recent = await this.db.prepare(
      "SELECT COUNT(*) AS event_count FROM analytics_events WHERE session_id = ? AND occurred_at >= ?",
    ).bind(input.sessionId, now - 60_000).first<{ event_count: number }>();
    if (Number(recent?.event_count ?? 0) >= EVENT_LIMIT_PER_MINUTE) return "rate_limited" as const;

    await this.db.batch([
      this.db.prepare("DELETE FROM analytics_events WHERE occurred_at < ?").bind(now - RAW_EVENT_RETENTION_MS),
      this.db.prepare(
        "INSERT INTO analytics_events (event_id, session_id, user_id, event_name, track, pace, topic_id, world_number, required, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).bind(
        crypto.randomUUID(),
        input.sessionId,
        userId ?? null,
        input.eventName,
        input.track ?? null,
        input.pace ?? null,
        input.topicId ?? null,
        input.worldNumber ?? null,
        input.required ? 1 : 0,
        now,
      ),
    ]);
    return "recorded" as const;
  }

  async saveFeedback(input: BetaFeedbackInput, userId?: string) {
    await this.ready();
    const now = Date.now();
    const recent = await this.db.prepare(
      "SELECT COUNT(*) AS feedback_count FROM beta_feedback WHERE session_id = ? AND created_at >= ?",
    ).bind(input.sessionId, now - 86_400_000).first<{ feedback_count: number }>();
    if (Number(recent?.feedback_count ?? 0) >= FEEDBACK_LIMIT_PER_DAY) return "rate_limited" as const;

    await this.db.prepare(
      "INSERT INTO beta_feedback (feedback_id, session_id, user_id, category, rating, difficulty, message, contact_allowed, track, pace, topic_id, world_number, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)",
    ).bind(
      crypto.randomUUID(),
      input.sessionId,
      userId ?? null,
      input.category,
      input.rating,
      input.difficulty ?? null,
      input.message,
      input.contactAllowed ? 1 : 0,
      input.track ?? null,
      input.pace ?? null,
      input.topicId ?? null,
      input.worldNumber ?? null,
      now,
    ).run();
    return "recorded" as const;
  }

  async getSummary(sinceMs: number, windowDays: number): Promise<BetaAnalyticsSummary> {
    await this.ready();
    const totals = await this.db.prepare(
      "SELECT COUNT(*) AS events, COUNT(DISTINCT session_id) AS unique_sessions, COUNT(DISTINCT user_id) AS signed_in_learners FROM analytics_events WHERE occurred_at >= ?",
    ).bind(sinceMs).first<{ events: number; unique_sessions: number; signed_in_learners: number }>();
    const funnel = await this.db.prepare(
      "SELECT event_name, COUNT(*) AS event_count, COUNT(DISTINCT session_id) AS unique_sessions FROM analytics_events WHERE occurred_at >= ? GROUP BY event_name ORDER BY event_count DESC",
    ).bind(sinceMs).all<AnalyticsFunnelRow>();
    const daily = await this.db.prepare(
      "SELECT date(occurred_at / 1000, 'unixepoch') AS activity_date, COUNT(DISTINCT session_id) AS unique_sessions, COUNT(*) AS event_count FROM analytics_events WHERE occurred_at >= ? GROUP BY activity_date ORDER BY activity_date ASC",
    ).bind(sinceMs).all<AnalyticsDailyRow>();
    const feedbackTotals = await this.db.prepare(
      "SELECT COUNT(*) AS feedback_count, AVG(rating) AS average_rating FROM beta_feedback WHERE created_at >= ?",
    ).bind(sinceMs).first<{ feedback_count: number; average_rating: number | null }>();
    const categories = await this.db.prepare(
      "SELECT category, COUNT(*) AS feedback_count FROM beta_feedback WHERE created_at >= ? GROUP BY category ORDER BY feedback_count DESC",
    ).bind(sinceMs).all<FeedbackCategoryRow>();
    const recent = await this.db.prepare(
      "SELECT feedback_id, category, rating, difficulty, message, contact_allowed, track, pace, topic_id, world_number, status, created_at FROM beta_feedback WHERE created_at >= ? ORDER BY created_at DESC LIMIT 30",
    ).bind(sinceMs).all<RecentFeedback>();

    return {
      windowDays,
      totals: {
        events: Number(totals?.events ?? 0),
        uniqueSessions: Number(totals?.unique_sessions ?? 0),
        signedInLearners: Number(totals?.signed_in_learners ?? 0),
        feedback: Number(feedbackTotals?.feedback_count ?? 0),
        averageRating: feedbackTotals?.average_rating === null || feedbackTotals?.average_rating === undefined
          ? null
          : Number(Number(feedbackTotals.average_rating).toFixed(1)),
      },
      funnel: funnel.results.map((row) => ({ ...row, event_count: Number(row.event_count), unique_sessions: Number(row.unique_sessions) })),
      daily: daily.results.map((row) => ({ ...row, event_count: Number(row.event_count), unique_sessions: Number(row.unique_sessions) })),
      feedbackCategories: categories.results.map((row) => ({ ...row, feedback_count: Number(row.feedback_count) })),
      recentFeedback: recent.results,
    };
  }

  async deleteUserData(userId: string) {
    await this.ready();
    await this.db.batch([
      this.db.prepare("DELETE FROM analytics_events WHERE user_id = ?").bind(userId),
      this.db.prepare("DELETE FROM beta_feedback WHERE user_id = ?").bind(userId),
    ]);
  }

  async healthCheck() {
    try {
      await this.ready();
      const row = await this.db.prepare(
        "SELECT COUNT(*) AS table_count FROM sqlite_schema WHERE type = 'table' AND name IN ('analytics_events', 'beta_feedback')",
      ).first<{ table_count: number }>();
      return Number(row?.table_count) === 2;
    } catch {
      return false;
    }
  }
}
