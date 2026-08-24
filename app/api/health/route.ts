import { getCloudflareEnvironment, getProgressRepository } from "../../../infrastructure/cloudflare/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = crypto.randomUUID();
  const checkedAt = new Date().toISOString();
  const runtimeEnvironment = getCloudflareEnvironment();
  let database = false;

  try {
    database = await getProgressRepository().healthCheck();
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
