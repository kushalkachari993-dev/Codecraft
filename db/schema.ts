import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const learners = sqliteTable("learners", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const progressSnapshots = sqliteTable("progress_snapshots", {
  userId: text("user_id").primaryKey().references(() => learners.userId, { onDelete: "cascade" }),
  progressJson: text("progress_json").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const codeSubmissions = sqliteTable("code_submissions", {
  submissionId: text("submission_id").primaryKey(),
  userId: text("user_id").notNull().references(() => learners.userId, { onDelete: "cascade" }),
  track: text("track").notNull(),
  pace: text("pace").notNull(),
  topicId: integer("topic_id").notNull(),
  topic: text("topic").notNull(),
  stage: text("stage").notNull(),
  code: text("code").notNull(),
  passed: integer("passed", { mode: "boolean" }).notNull(),
  score: integer("score").notNull(),
  feedbackJson: text("feedback_json").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  index("code_submissions_user_topic_idx").on(table.userId, table.track, table.pace, table.topicId),
  index("code_submissions_user_created_idx").on(table.userId, table.createdAt),
]);

export const aiReviewUsage = sqliteTable("ai_review_usage", {
  userId: text("user_id").notNull().references(() => learners.userId, { onDelete: "cascade" }),
  usageDate: text("usage_date").notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.usageDate] }),
]);

export const analyticsEvents = sqliteTable("analytics_events", {
  eventId: text("event_id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userId: text("user_id"),
  eventName: text("event_name").notNull(),
  track: text("track"),
  pace: text("pace"),
  topicId: integer("topic_id"),
  worldNumber: integer("world_number"),
  required: integer("required", { mode: "boolean" }).notNull().default(false),
  occurredAt: integer("occurred_at").notNull(),
}, (table) => [
  index("analytics_events_name_time_idx").on(table.eventName, table.occurredAt),
  index("analytics_events_session_time_idx").on(table.sessionId, table.occurredAt),
  index("analytics_events_user_time_idx").on(table.userId, table.occurredAt),
  index("analytics_events_time_idx").on(table.occurredAt),
]);

export const betaFeedback = sqliteTable("beta_feedback", {
  feedbackId: text("feedback_id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userId: text("user_id"),
  category: text("category").notNull(),
  rating: integer("rating").notNull(),
  difficulty: text("difficulty"),
  message: text("message").notNull(),
  contactAllowed: integer("contact_allowed", { mode: "boolean" }).notNull().default(false),
  track: text("track"),
  pace: text("pace"),
  topicId: integer("topic_id"),
  worldNumber: integer("world_number"),
  status: text("status").notNull().default("new"),
  createdAt: integer("created_at").notNull(),
}, (table) => [
  index("beta_feedback_created_idx").on(table.createdAt),
  index("beta_feedback_session_created_idx").on(table.sessionId, table.createdAt),
  index("beta_feedback_user_created_idx").on(table.userId, table.createdAt),
]);

export const schemaMigrations = sqliteTable("schema_migrations", {
  version: integer("version").primaryKey(),
  name: text("name").notNull(),
  appliedAt: integer("applied_at").notNull(),
});
