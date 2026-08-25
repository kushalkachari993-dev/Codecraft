export type AnalyticsEventInput = {
  sessionId: string;
  eventName: string;
  track?: string;
  pace?: string;
  topicId?: number;
  worldNumber?: number;
  required?: boolean;
};

export type BetaFeedbackInput = {
  sessionId: string;
  category: string;
  rating: number;
  difficulty?: string;
  message: string;
  contactAllowed: boolean;
  track?: string;
  pace?: string;
  topicId?: number;
  worldNumber?: number;
};

export type AnalyticsFunnelRow = { event_name: string; event_count: number; unique_sessions: number };
export type AnalyticsDailyRow = { activity_date: string; unique_sessions: number; event_count: number };
export type FeedbackCategoryRow = { category: string; feedback_count: number };
export type RecentFeedback = {
  feedback_id: string;
  category: string;
  rating: number;
  difficulty: string | null;
  message: string;
  contact_allowed: number;
  track: string | null;
  pace: string | null;
  topic_id: number | null;
  world_number: number | null;
  status: string;
  created_at: number;
};

export type BetaAnalyticsSummary = {
  windowDays: number;
  totals: {
    events: number;
    uniqueSessions: number;
    signedInLearners: number;
    feedback: number;
    averageRating: number | null;
  };
  funnel: AnalyticsFunnelRow[];
  daily: AnalyticsDailyRow[];
  feedbackCategories: FeedbackCategoryRow[];
  recentFeedback: RecentFeedback[];
};

/** Analytics persistence port. Provider SDK types must not leak into application routes. */
export interface AnalyticsRepository {
  recordEvent(input: AnalyticsEventInput, userId?: string): Promise<"recorded" | "rate_limited">;
  saveFeedback(input: BetaFeedbackInput, userId?: string): Promise<"recorded" | "rate_limited">;
  getSummary(sinceMs: number, windowDays: number): Promise<BetaAnalyticsSummary>;
  deleteUserData(userId: string): Promise<void>;
  healthCheck(): Promise<boolean>;
}
