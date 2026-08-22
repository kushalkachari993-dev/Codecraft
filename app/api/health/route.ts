import { env } from "cloudflare:workers";
import type { ClerkRuntimeEnvironment } from "../../clerk-config";

export const dynamic = "force-dynamic";

type HealthEnvironment = ClerkRuntimeEnvironment & {
  DB?: D1Database;
  AI?: unknown;
};

export async function GET() {
  const requestId = crypto.randomUUID();
  const checkedAt = new Date().toISOString();
  const runtimeEnvironment = env as unknown as HealthEnvironment;
  let database = false;

  try {
    const row = await runtimeEnvironment.DB?.prepare(
      "SELECT COUNT(*) AS table_count FROM sqlite_schema WHERE type = 'table' AND name IN ('learners', 'progress_snapshots', 'code_submissions', 'ai_review_usage')",
    ).first<{ table_count: number }>();
    database = Number(row?.table_count) === 4;
  } catch (error) {
    console.error(JSON.stringify({
      event: "health_database_failed",
      requestId,
      error: error instanceof Error ? error.name : "UnknownError",
    }));
  }

  const clerkPublishable = runtimeEnvironment.VITE_CLERK_PUBLISHABLE_KEY ?? "";
  const clerkSecret = runtimeEnvironment.CLERK_SECRET_KEY ?? "";
  const authentication = clerkPublishable.startsWith("pk_live_") && clerkSecret.startsWith("sk_live_");
  const status = database && authentication ? "healthy" : "degraded";

  return Response.json({
    status,
    checkedAt,
    requestId,
    checks: {
      database,
      authentication,
      aiEvaluator: runtimeEnvironment.AI ? "hosted" : "deterministic-fallback",
    },
  }, {
    status: status === "healthy" ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}
