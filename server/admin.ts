import type { CodeCraftUser } from "../app/clerk-auth";
import type { CloudflareApplicationEnvironment } from "../infrastructure/cloudflare/environment";

function values(value: string | undefined) {
  return new Set((value ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean));
}

export function isCodeCraftAdmin(user: CodeCraftUser, environment: CloudflareApplicationEnvironment) {
  const userIds = values(environment.CODECRAFT_ADMIN_USER_IDS);
  const emails = values(environment.CODECRAFT_ADMIN_EMAILS);
  return userIds.has(user.userId.toLowerCase()) || Boolean(user.email && emails.has(user.email.toLowerCase()));
}
