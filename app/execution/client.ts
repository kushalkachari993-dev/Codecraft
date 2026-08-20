import type { ExecutionRequest, ExecutionResult, WorkerExecutionRequest, WorkerExecutionResponse } from "./types";

let requestId = 0;

function runWorker(worker: Worker, code: string, challenge: ExecutionRequest["challenge"], timeoutMs: number, signal?: AbortSignal): Promise<ExecutionResult> {
  const id = ++requestId;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: ExecutionResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      worker.terminate();
      resolve(result);
    };
    const timeout = window.setTimeout(() => {
      finish({
        passed: false,
        stdout: "",
        error: "Execution stopped after reaching the safe time limit.",
        runtime: "controlled-local",
        durationMs: timeoutMs,
        tests: [],
      });
    }, timeoutMs);

    worker.addEventListener("message", function onMessage(event: MessageEvent<WorkerExecutionResponse>) {
      if (event.data.id !== id) return;
      worker.removeEventListener("message", onMessage);
      const { id: _id, ...result } = event.data;
      void _id;
      finish(result);
    });
    worker.addEventListener("error", () => finish({
      passed: false,
      stdout: "",
      error: "The isolated runtime could not start. Reset the lab and try again.",
      runtime: "controlled-local",
      durationMs: 0,
      tests: [],
    }), { once: true });
    signal?.addEventListener("abort", () => finish({
      passed: false,
      stdout: "",
      error: "Execution stopped by the learner.",
      runtime: "controlled-local",
      durationMs: 0,
      tests: [],
    }), { once: true });
    if (signal?.aborted) {
      finish({ passed: false, stdout: "", error: "Execution stopped by the learner.", runtime: "controlled-local", durationMs: 0, tests: [] });
      return;
    }

    const workerRequest: WorkerExecutionRequest = { id, code, challenge };
    worker.postMessage(workerRequest);
  });
}

async function runGenAILab(request: ExecutionRequest, signal?: AbortSignal): Promise<ExecutionResult> {
  const startedAt = performance.now();
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = window.setTimeout(abort, 15_000);
  try {
    const response = await fetch("/api/genai-lab", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: request.code, topic: request.topic, required: request.required ?? false }),
      signal: controller.signal,
    });
    const payload = await response.json() as { output?: string; error?: string; mode?: "hosted-model" | "controlled-local"; passed?: boolean; tests?: ExecutionResult["tests"] };
    return {
      passed: response.ok && payload.passed !== false,
      stdout: payload.output ?? "",
      error: response.ok ? undefined : payload.error ?? "The controlled AI lab could not run.",
      runtime: payload.mode ?? "controlled-local",
      durationMs: Math.round(performance.now() - startedAt),
      tests: payload.tests ?? [],
    };
  } catch {
    return {
      passed: false,
      stdout: "",
      error: "The controlled AI service is temporarily unavailable.",
      runtime: "controlled-local",
      durationMs: Math.round(performance.now() - startedAt),
      tests: [],
    };
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export function executeLab(request: ExecutionRequest, signal?: AbortSignal): Promise<ExecutionResult> {
  if (request.track === "genai") return runGenAILab(request, signal);
  const worker = request.track === "python"
    ? new Worker(new URL("./python-runner.worker.ts", import.meta.url), { type: "module" })
    : new Worker(new URL("./sql-runner.worker.ts", import.meta.url), { type: "module" });
  return runWorker(worker, request.code, request.challenge, request.track === "python" ? 20_000 : 12_000, signal);
}
