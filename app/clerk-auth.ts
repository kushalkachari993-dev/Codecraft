import { createClerkClient } from "@clerk/backend";
import { CLERK_PUBLISHABLE_KEY } from "./clerk-config";

export type CodeCraftUser = {
  userId: string;
  displayName: string;
  email: string;
};

function usableSecret() {
  const runtimeEnvironment = typeof process === "undefined" ? undefined : process.env;
  const secret = runtimeEnvironment?.["CLERK_SECRET_KEY"];
  return secret && !secret.includes("replace_with_") ? secret : undefined;
}

export async function getClerkUser(request: Request): Promise<CodeCraftUser | null> {
  if (!CLERK_PUBLISHABLE_KEY) return null;

  try {
    const clerk = createClerkClient({
      publishableKey: CLERK_PUBLISHABLE_KEY,
      secretKey: usableSecret(),
    });
    const requestState = await clerk.authenticateRequest(request, {
      acceptsToken: "session_token",
      authorizedParties: [new URL(request.url).origin],
    });
    if (!requestState.isAuthenticated) return null;

    const auth = requestState.toAuth();
    if (!auth.userId) return null;
    const claims = auth.sessionClaims as Record<string, unknown>;
    const email = typeof claims.email === "string" ? claims.email : "";
    const displayName = typeof claims.full_name === "string"
      ? claims.full_name
      : typeof claims.first_name === "string"
        ? claims.first_name
        : email || "CodeCraft learner";
    return { userId: auth.userId, displayName, email };
  } catch {
    return null;
  }
}
