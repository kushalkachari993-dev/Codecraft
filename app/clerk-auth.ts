import { createClerkClient } from "@clerk/backend";
import { getClerkPublishableKey, type ClerkRuntimeEnvironment } from "./clerk-config";

export type CodeCraftUser = {
  userId: string;
  displayName: string;
  email: string;
};

function usableSecret(runtimeEnvironment?: ClerkRuntimeEnvironment) {
  const processEnvironment = typeof process === "undefined" ? undefined : process.env;
  const secret = runtimeEnvironment?.CLERK_SECRET_KEY || processEnvironment?.["CLERK_SECRET_KEY"];
  return secret && !secret.includes("replace_with_") ? secret : undefined;
}

export function getCodeCraftClerkClient(runtimeEnvironment?: ClerkRuntimeEnvironment) {
  const publishableKey = getClerkPublishableKey(runtimeEnvironment);
  const secretKey = usableSecret(runtimeEnvironment);
  if (!publishableKey || !secretKey) return null;
  return createClerkClient({ publishableKey, secretKey });
}

export async function getClerkUser(request: Request, runtimeEnvironment?: ClerkRuntimeEnvironment): Promise<CodeCraftUser | null> {
  const publishableKey = getClerkPublishableKey(runtimeEnvironment);
  if (!publishableKey) return null;

  try {
    const clerk = createClerkClient({
      publishableKey,
      secretKey: usableSecret(runtimeEnvironment),
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
