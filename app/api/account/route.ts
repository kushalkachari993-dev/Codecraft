import { env } from "cloudflare:workers";
import { getClerkUser, getCodeCraftClerkClient } from "../../clerk-auth";
import type { ClerkRuntimeEnvironment } from "../../clerk-config";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "cache-control": "no-store" };

export async function DELETE(request: Request) {
  const requestId = crypto.randomUUID();
  const runtimeEnvironment = env as unknown as ClerkRuntimeEnvironment;
  const user = await getClerkUser(request, runtimeEnvironment);
  if (!user) {
    return Response.json({ error: "Sign in before deleting your account.", requestId }, { status: 401, headers: noStoreHeaders });
  }

  const clerk = getCodeCraftClerkClient(runtimeEnvironment);
  if (!clerk) {
    console.error(JSON.stringify({ event: "account_delete_configuration_error", requestId }));
    return Response.json({ error: "Account deletion is temporarily unavailable.", requestId }, { status: 503, headers: noStoreHeaders });
  }

  try {
    const { ensureProgressSchema, getD1 } = await import("../../../db");
    const db = getD1();
    await ensureProgressSchema(db);
    await db.batch([
      db.prepare("DELETE FROM ai_review_usage WHERE user_id = ?").bind(user.userId),
      db.prepare("DELETE FROM code_submissions WHERE user_id = ?").bind(user.userId),
      db.prepare("DELETE FROM progress_snapshots WHERE user_id = ?").bind(user.userId),
      db.prepare("DELETE FROM learners WHERE user_id = ?").bind(user.userId),
    ]);
    await clerk.users.deleteUser(user.userId);
    console.info(JSON.stringify({ event: "account_deleted", requestId }));
    return Response.json({ deleted: true, requestId }, { headers: noStoreHeaders });
  } catch (error) {
    console.error(JSON.stringify({
      event: "account_delete_failed",
      requestId,
      error: error instanceof Error ? error.name : "UnknownError",
    }));
    return Response.json({ error: "We could not finish deleting the account. Retry or contact the site owner.", requestId }, { status: 500, headers: noStoreHeaders });
  }
}
