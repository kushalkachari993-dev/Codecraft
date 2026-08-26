import { getCloudflareEnvironment } from "../../../../infrastructure/cloudflare/runtime";
import {
  clearTemporaryAdminCookie,
  createTemporaryAdminSession,
  isSameOriginRequest,
  passcodeMatches,
  temporaryAdminCookie,
} from "../../../../server/temporary-admin-session";

export const dynamic = "force-dynamic";

const failures = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 5;

function clientKey(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? "local";
}

function rateLimit(key: string) {
  const now = Date.now();
  const current = failures.get(key);
  if (!current || current.resetAt <= now) {
    failures.delete(key);
    return null;
  }
  return current.count >= MAX_FAILURES ? Math.ceil((current.resetAt - now) / 1000) : null;
}

function recordFailure(key: string) {
  const now = Date.now();
  const current = failures.get(key);
  failures.set(key, !current || current.resetAt <= now
    ? { count: 1, resetAt: now + WINDOW_MS }
    : { ...current, count: current.count + 1 });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 1_024) return Response.json({ error: "Request is too large." }, { status: 413 });

  const key = clientKey(request);
  const retryAfter = rateLimit(key);
  if (retryAfter) {
    return Response.json({ error: "Too many attempts. Try again later." }, { status: 429, headers: { "retry-after": String(retryAfter) } });
  }

  let passcode = "";
  try {
    const rawBody = await request.text();
    if (rawBody.length > 1_024) return Response.json({ error: "Request is too large." }, { status: 413 });
    const body = JSON.parse(rawBody) as { passcode?: unknown };
    passcode = typeof body.passcode === "string" ? body.passcode : "";
  } catch {
    return Response.json({ error: "Enter the owner passcode." }, { status: 400 });
  }

  const environment = getCloudflareEnvironment();
  if (!await passcodeMatches(passcode, environment.CODECRAFT_TEMP_ADMIN_PASSCODE)) {
    recordFailure(key);
    return Response.json({ error: "The owner passcode is incorrect." }, { status: 401 });
  }
  if (!environment.CODECRAFT_TEMP_ADMIN_SESSION_SECRET || environment.CODECRAFT_TEMP_ADMIN_SESSION_SECRET.length < 32) {
    return Response.json({ error: "Temporary owner access is not configured." }, { status: 503 });
  }

  failures.delete(key);
  const session = await createTemporaryAdminSession(environment.CODECRAFT_TEMP_ADMIN_SESSION_SECRET);
  return Response.json({ ok: true }, {
    headers: {
      "cache-control": "no-store",
      "set-cookie": temporaryAdminCookie(session, request),
    },
  });
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  return Response.json({ ok: true }, {
    headers: {
      "cache-control": "no-store",
      "set-cookie": clearTemporaryAdminCookie(request),
    },
  });
}
