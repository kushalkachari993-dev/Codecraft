/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { GENAI_PACES, buildGenAILab, validateGenAILab } from "../app/genai-curriculum";
import { getClerkUser } from "../app/clerk-auth";
import type { ChallengeTestResult } from "../app/execution/types";
import { getServerConfig } from "../server/config";
import { D1ProgressRepository } from "../infrastructure/cloudflare/d1-progress-repository";
import type { CloudflareApplicationEnvironment } from "../infrastructure/cloudflare/environment";
import { WorkersAiEvaluator } from "../infrastructure/cloudflare/workers-ai-evaluator";

interface Env extends CloudflareApplicationEnvironment {
  ASSETS: Fetcher;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

const requestWindows = new Map<string, { count: number; resetAt: number }>();
function takeGenAIRequest(request: Request, requestsPerMinute: number) {
  const now = Date.now();
  const key = request.headers.get("cf-connecting-ip") ?? "local";
  const current = requestWindows.get(key);
  if (!current || current.resetAt <= now) {
    requestWindows.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= requestsPerMinute) return false;
  current.count += 1;
  return true;
}

function buildGenAIRubric(requiredCalls: string[], code: string): ChallengeTestResult[] {
  const usesEveryTool = requiredCalls.every((tool) => new RegExp("\\b" + tool + "\\s*\\(", "i").test(code));
  const connectsEvidence = new RegExp("\\b(input_data|documents|evidence|context|state|cases|profile|traffic|sample)\\b", "i").test(code) && /\bresult\s*=/.test(code);
  const avoidsUnsafeExecution = !/\b(eval|exec|os\.system|subprocess|shell\s*=\s*true)\b/i.test(code);
  const reportsAResult = /\bprint\s*\(/.test(code) && new RegExp("\\b" + requiredCalls.at(-1) + "\\s*\\(", "i").test(code);
  return [
    { name: "Grounding", passed: connectsEvidence, detail: connectsEvidence ? "The result is connected to supplied lab evidence or state." : "The result is not visibly connected to the supplied context.", hint: "Derive result from input_data or another supplied evidence variable." },
    { name: "Tool usage", passed: usesEveryTool, detail: usesEveryTool ? "Every approved lab tool is used." : "One or more required tools are missing.", hint: "Use only the three approved tools shown in the lab panel." },
    { name: "Safety", passed: avoidsUnsafeExecution, detail: avoidsUnsafeExecution ? "No unsafe dynamic execution or shell access was requested." : "Unsafe dynamic execution was detected.", hint: "Remove eval, exec, subprocess, or shell execution and use the approved tools." },
    { name: "Output quality", passed: reportsAResult, detail: reportsAResult ? "The checked result is printed as a final report." : "The final checked report is incomplete.", hint: "Call the final validation tool and print its report." },
  ];
}

function controlledEvaluation(passed: boolean, reason: string) {
  return [
    "Controlled evaluator",
    "Result: " + (passed ? "PASS" : "NEEDS WORK"),
    "Evidence: " + reason,
    passed
      ? "One improvement: Explain why the chosen workflow satisfies the lab criteria."
      : "One improvement: Resolve the failed rubric checks before requesting model feedback.",
  ].join("\n");
}

async function handleGenAILab(request: Request, env: Env) {
  const config = getServerConfig(env);
  const repository = new D1ProgressRepository(env.DB);
  const evaluator = new WorkersAiEvaluator(env.AI, config.aiModel);
  if (request.method !== "POST") return Response.json({ error: "Method not allowed." }, { status: 405 });
  if (!takeGenAIRequest(request, config.genAiRequestsPerMinute)) return Response.json({ error: "Lab rate limit reached. Try again in one minute." }, { status: 429 });

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 24_000) return Response.json({ error: "Lab submission is too large." }, { status: 413 });

  try {
    const payload = await request.json() as { code?: unknown; topic?: unknown; required?: unknown };
    const code = typeof payload.code === "string" ? payload.code : "";
    const topicTitle = typeof payload.topic === "string" ? payload.topic.trim() : "";
    if (!code || code.length > 16_000) return Response.json({ error: "Submit between 1 and 16,000 characters." }, { status: 400 });

    const topic = GENAI_PACES.flatMap((pace) => pace.topics).find((item) => item.title === topicTitle);
    if (!topic) return Response.json({ error: "Unknown GenAI lab topic." }, { status: 400 });
    const lab = buildGenAILab(topic, payload.required === true, "CodeCraft world");
    const validationError = validateGenAILab(lab, code);
    if (validationError) return Response.json({ error: validationError }, { status: 422 });
    const tests = buildGenAIRubric(lab.requiredCalls, code);
    const passed = tests.every((test) => test.passed);

    if (!passed) {
      return Response.json({
        output: lab.mockOutput + "\n\n" + controlledEvaluation(false, "One or more deterministic rubric checks failed."),
        mode: "controlled-local",
        passed,
        tests,
      }, { headers: { "cache-control": "no-store" } });
    }

    const user = await getClerkUser(request, env);
    if (!user) {
      return Response.json({
        output: lab.mockOutput + "\n\n" + controlledEvaluation(true, `The deterministic rubric passed. Sign in to request one of ${config.aiReviewDailyLimit} daily AI coaching reviews.`),
        mode: "controlled-local",
        passed,
        tests,
        reviewsRemaining: null,
      }, { headers: { "cache-control": "no-store" } });
    }

    if (!evaluator.available) {
      return Response.json({
        output: lab.mockOutput + "\n\n" + controlledEvaluation(true, "The deterministic rubric passed. Hosted AI coaching is not enabled on this deployment."),
        mode: "controlled-local",
        passed,
        tests,
        reviewsRemaining: config.aiReviewDailyLimit,
      }, { headers: { "cache-control": "no-store" } });
    }

    const reservation = await repository.reserveAiReview(user, config.aiReviewDailyLimit);
    if (!reservation) {
      return Response.json({
        output: lab.mockOutput + "\n\n" + controlledEvaluation(true, `The deterministic rubric passed. Your ${config.aiReviewDailyLimit} AI coaching reviews for today have been used; they reset at 00:00 UTC.`),
        mode: "controlled-local",
        passed,
        tests,
        reviewsRemaining: 0,
      }, { headers: { "cache-control": "no-store" } });
    }

    try {
      const { feedback: output } = await evaluator.evaluate({
        topic: topic.title,
        learningGoal: topic.learningGoal,
        successCriteria: lab.successCriteria,
        submission: code,
      });
      if (output) {
        const reviewsRemaining = Math.max(0, config.aiReviewDailyLimit - reservation.count);
        return Response.json({
          output: "Hosted model evaluation\n\n" + output + `\n\nAI coaching reviews remaining today: ${reviewsRemaining}/${config.aiReviewDailyLimit}`,
          mode: "hosted-model",
          passed,
          tests,
          reviewsRemaining,
        }, { headers: { "cache-control": "no-store" } });
      }
      throw new Error("Hosted model returned no feedback.");
    } catch (error) {
      await repository.releaseAiReview(user.userId, reservation.usageDate);
      console.error(JSON.stringify({
        event: "genai_model_evaluation_failed",
        error: error instanceof Error ? error.name : "UnknownError",
      }));
    }

    return Response.json({
      output: lab.mockOutput + "\n\n" + controlledEvaluation(true, "The deterministic rubric passed. Hosted coaching was unavailable, so this attempt did not use a daily review."),
      mode: "controlled-local",
      passed,
      tests,
      reviewsRemaining: Math.max(0, config.aiReviewDailyLimit - reservation.count + 1),
    }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Invalid lab request." }, { status: 400 });
  }
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const PUBLIC_SHELL_PATHS = new Set(["/", "/tracks"]);

function isPublicShellRequest(request: Request, url: URL) {
  const accept = request.headers.get("accept") ?? "";
  return request.method === "GET"
    && PUBLIC_SHELL_PATHS.has(url.pathname)
    && accept.includes("text/html")
    && !request.headers.has("rsc")
    && !request.headers.has("next-router-state-tree");
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const cacheableShell = isPublicShellRequest(request, url);

    if (url.pathname === "/api/genai-lab") return handleGenAILab(request, env);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);
    if (!cacheableShell || !response.ok || response.headers.has("set-cookie")) return response;

    const headers = new Headers(response.headers);
    headers.set("cache-control", "public, max-age=0, s-maxage=600, stale-while-revalidate=86400");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};

export default worker;
