import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
