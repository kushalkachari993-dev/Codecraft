interface D1Migration {
  version: number;
  name: string;
  statements: string[];
}

// Keep this runtime manifest aligned with the reviewed SQL files in drizzle/.
// Statements are idempotent so an existing pre-migration database can be adopted safely.
const migrations: D1Migration[] = [
  {
    version: 1,
    name: "initial_progress_and_submissions",
    statements: [
      "CREATE TABLE IF NOT EXISTS learners (user_id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL, display_name TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
      "CREATE TABLE IF NOT EXISTS progress_snapshots (user_id TEXT PRIMARY KEY NOT NULL REFERENCES learners(user_id) ON DELETE CASCADE, progress_json TEXT NOT NULL, updated_at INTEGER NOT NULL)",
      "CREATE TABLE IF NOT EXISTS code_submissions (submission_id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES learners(user_id) ON DELETE CASCADE, track TEXT NOT NULL, pace TEXT NOT NULL, topic_id INTEGER NOT NULL, topic TEXT NOT NULL, stage TEXT NOT NULL, code TEXT NOT NULL, passed INTEGER NOT NULL, score INTEGER NOT NULL, feedback_json TEXT NOT NULL, created_at INTEGER NOT NULL)",
      "CREATE INDEX IF NOT EXISTS code_submissions_user_topic_idx ON code_submissions(user_id, track, pace, topic_id)",
      "CREATE INDEX IF NOT EXISTS code_submissions_user_created_idx ON code_submissions(user_id, created_at)",
    ],
  },
  {
    version: 2,
    name: "ai_review_usage",
    statements: [
      "CREATE TABLE IF NOT EXISTS ai_review_usage (user_id TEXT NOT NULL REFERENCES learners(user_id) ON DELETE CASCADE, usage_date TEXT NOT NULL, review_count INTEGER DEFAULT 0 NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY(user_id, usage_date))",
    ],
  },
  {
    version: 3,
    name: "schema_migration_tracking",
    statements: [],
  },
  {
    version: 4,
    name: "beta_analytics_and_feedback",
    statements: [
      "CREATE TABLE IF NOT EXISTS analytics_events (event_id TEXT PRIMARY KEY NOT NULL, session_id TEXT NOT NULL, user_id TEXT, event_name TEXT NOT NULL, track TEXT, pace TEXT, topic_id INTEGER, world_number INTEGER, required INTEGER DEFAULT 0 NOT NULL, occurred_at INTEGER NOT NULL)",
      "CREATE INDEX IF NOT EXISTS analytics_events_name_time_idx ON analytics_events(event_name, occurred_at)",
      "CREATE INDEX IF NOT EXISTS analytics_events_session_time_idx ON analytics_events(session_id, occurred_at)",
      "CREATE INDEX IF NOT EXISTS analytics_events_user_time_idx ON analytics_events(user_id, occurred_at)",
      "CREATE INDEX IF NOT EXISTS analytics_events_time_idx ON analytics_events(occurred_at)",
      "CREATE TABLE IF NOT EXISTS beta_feedback (feedback_id TEXT PRIMARY KEY NOT NULL, session_id TEXT NOT NULL, user_id TEXT, category TEXT NOT NULL, rating INTEGER NOT NULL, difficulty TEXT, message TEXT NOT NULL, contact_allowed INTEGER DEFAULT 0 NOT NULL, track TEXT, pace TEXT, topic_id INTEGER, world_number INTEGER, status TEXT DEFAULT 'new' NOT NULL, created_at INTEGER NOT NULL)",
      "CREATE INDEX IF NOT EXISTS beta_feedback_created_idx ON beta_feedback(created_at)",
      "CREATE INDEX IF NOT EXISTS beta_feedback_session_created_idx ON beta_feedback(session_id, created_at)",
      "CREATE INDEX IF NOT EXISTS beta_feedback_user_created_idx ON beta_feedback(user_id, created_at)",
    ],
  },
];

let schemaReady: Promise<void> | null = null;

export function applyD1Migrations(db: D1Database): Promise<void> {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    await db.prepare("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, applied_at INTEGER NOT NULL)").run();
    const applied = await db.prepare("SELECT version FROM schema_migrations").all<{ version: number }>();
    const appliedVersions = new Set(applied.results.map((row) => Number(row.version)));

    for (const migration of migrations) {
      if (appliedVersions.has(migration.version)) continue;
      await db.batch([
        ...migration.statements.map((statement) => db.prepare(statement)),
        db.prepare("INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)")
          .bind(migration.version, migration.name, Date.now()),
      ]);
    }
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });
  return schemaReady;
}
