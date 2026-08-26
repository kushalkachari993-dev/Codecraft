import { getClerkUser, getCodeCraftClerkClient } from "../../../clerk-auth";
import { isCodeCraftAdmin } from "../../../../server/admin";
import { verifyTemporaryAdminSession } from "../../../../server/temporary-admin-session";
import { getAnalyticsRepository, getCloudflareEnvironment } from "../../../../infrastructure/cloudflare/runtime";

export const dynamic = "force-dynamic";
const noStoreHeaders = { "cache-control": "no-store" };

export async function GET(request: Request) {
  const environment = getCloudflareEnvironment();
  const authenticatedUser = await getClerkUser(request, environment);
  let clerkAdmin = false;
  let user = authenticatedUser;

  if (user && !user.email && environment.CODECRAFT_ADMIN_EMAILS) {
    try {
      const clerk = getCodeCraftClerkClient(environment);
      const profile = clerk ? await clerk.users.getUser(user.userId) : null;
      const email = profile?.primaryEmailAddress?.emailAddress ?? "";
      user = { ...user, email };
    } catch {
      // The user ID allowlist still works if Clerk profile lookup is unavailable.
    }
  }

  if (user) clerkAdmin = isCodeCraftAdmin(user, environment);
  const temporaryAdmin = !clerkAdmin
    && await verifyTemporaryAdminSession(request, environment.CODECRAFT_TEMP_ADMIN_SESSION_SECRET);

  if (!clerkAdmin && !temporaryAdmin && authenticatedUser) {
    return Response.json({ error: "This dashboard is limited to the CodeCraft owner." }, { status: 403, headers: noStoreHeaders });
  }
  if (!clerkAdmin && !temporaryAdmin) {
    return Response.json({ error: "Sign in with Clerk or enter the temporary owner passcode." }, { status: 401, headers: noStoreHeaders });
  }

  const days = Math.max(7, Math.min(90, Number(new URL(request.url).searchParams.get("days")) || 30));
  const summary = await getAnalyticsRepository().getSummary(Date.now() - days * 86_400_000, days);
  return Response.json({ ...summary, accessMode: clerkAdmin ? "clerk" : "temporary" }, { headers: noStoreHeaders });
}
