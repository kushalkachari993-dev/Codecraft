import { getClerkUser } from "../../clerk-auth";
import { normalizeProgress } from "../../progress";
import { getCloudflareEnvironment, getProgressRepository } from "../../../infrastructure/cloudflare/runtime";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getClerkUser(request, getCloudflareEnvironment());
  if (!user) {
    return Response.json({ user: null, progress: null, storage: "local" }, { headers: { "cache-control": "no-store" } });
  }

  const repository = getProgressRepository();
  await repository.syncLearner(user);
  const progressJson = await repository.loadProgress(user.userId);
  let progress = null;
  if (progressJson) {
    try {
      progress = normalizeProgress(JSON.parse(progressJson));
    } catch {
      progress = null;
    }
  }
  return Response.json({
    user: { displayName: user.displayName, email: user.email },
    progress,
    storage: "cloud",
  }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  const user = await getClerkUser(request, getCloudflareEnvironment());
  if (!user) return Response.json({ error: "Sign in to sync progress." }, { status: 401 });

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 80_000) return Response.json({ error: "Progress payload is too large." }, { status: 413 });
  try {
    const payload = await request.json() as { progress?: unknown };
    const progress = normalizeProgress(payload.progress);
    const now = await getProgressRepository().saveProgress(user, JSON.stringify(progress));
    return Response.json({ saved: true, updatedAt: now }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Invalid progress payload." }, { status: 400 });
  }
}
