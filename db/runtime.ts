let schemaReady: Promise<void> | null = null;

export function ensureProgressSchema(db: D1Database): Promise<void> {
  if (schemaReady) return schemaReady;
  schemaReady = db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS learners (user_id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL, display_name TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS progress_snapshots (user_id TEXT PRIMARY KEY NOT NULL REFERENCES learners(user_id) ON DELETE CASCADE, progress_json TEXT NOT NULL, updated_at INTEGER NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS code_submissions (submission_id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES learners(user_id) ON DELETE CASCADE, track TEXT NOT NULL, pace TEXT NOT NULL, topic_id INTEGER NOT NULL, topic TEXT NOT NULL, stage TEXT NOT NULL, code TEXT NOT NULL, passed INTEGER NOT NULL, score INTEGER NOT NULL, feedback_json TEXT NOT NULL, created_at INTEGER NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS ai_review_usage (user_id TEXT NOT NULL REFERENCES learners(user_id) ON DELETE CASCADE, usage_date TEXT NOT NULL, review_count INTEGER DEFAULT 0 NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY(user_id, usage_date))"),
    db.prepare("CREATE INDEX IF NOT EXISTS code_submissions_user_topic_idx ON code_submissions(user_id, track, pace, topic_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS code_submissions_user_created_idx ON code_submissions(user_id, created_at)"),
  ]).then(() => undefined).catch((error) => {
    schemaReady = null;
    throw error;
  });
  return schemaReady;
}
