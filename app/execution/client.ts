import type { ExecutionRequest, ExecutionResult, RuntimeProgress, RuntimeWorkerTrack, WorkerExecutionRequest, WorkerExecutionResponse } from "./types";

let requestId = 0;
const COLD_START_TIMEOUT = { python: 90_000, sql: 90_000 } satisfies Record<RuntimeWorkerTrack, number>;
const EXECUTION_TIMEOUT = { python: 30_000, sql: 30_000 } satisfies Record<RuntimeWorkerTrack, number>;

type RuntimePool = {
  worker: Worker | null;
  ready: boolean;
  preparing: Promise<void> | null;
};

const runtimePools: Record<RuntimeWorkerTrack, RuntimePool> = {
  python: { worker: null, ready: false, preparing: null },
  sql: { worker: null, ready: false, preparing: null },
};

function createRuntimeWorker(track: RuntimeWorkerTrack) {
  // The bundled python-runner.worker.ts entry is avoided because hosted module-worker URLs can be blocked before startup.
  return track === "python"
    ? new Worker("/python-runner.js", { name: "codecraft-python-runtime" })
    : new Worker(new URL("./sql-runner.worker.ts", import.meta.url), { type: "module" });
}

function getRuntimeWorker(track: RuntimeWorkerTrack) {
  const pool = runtimePools[track];
  pool.worker ??= createRuntimeWorker(track);
  return pool.worker;
}

export function resetLabRuntime(track?: RuntimeWorkerTrack) {
  const tracks: RuntimeWorkerTrack[] = track ? [track] : ["python", "sql"];
  for (const runtimeTrack of tracks) {
    runtimePools[runtimeTrack].worker?.terminate();
    runtimePools[runtimeTrack].worker = null;
    runtimePools[runtimeTrack].ready = false;
    runtimePools[runtimeTrack].preparing = null;
  }
}

function sendWorkerRequest(
  track: RuntimeWorkerTrack,
  request: Omit<WorkerExecutionRequest, "id">,
  timeoutMs: number,
  onProgress?: (progress: RuntimeProgress) => void,
  signal?: AbortSignal,
): Promise<ExecutionResult | null> {
  const id = ++requestId;
  const worker = getRuntimeWorker(track);

  return new Promise((resolve) => {
    let settled = false;
    const cleanup = () => {
      window.clearTimeout(timeout);
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      signal?.removeEventListener("abort", onAbort);
    };
    const finish = (result: ExecutionResult | null, reset = false) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (reset) resetLabRuntime(track);
      resolve(result);
    };
    const timeout = window.setTimeout(() => {
      finish({
        passed: false,
        stdout: "",
        error: request.type === "prepare"
          ? "The browser runtime took too long to prepare. Check your connection, disable blockers for this site, then try again."
          : "Execution stopped after reaching the safe time limit.",
        runtime: "controlled-local",
        durationMs: timeoutMs,
        tests: [],
      }, true);
    }, timeoutMs);

    function onMessage(event: MessageEvent<WorkerExecutionResponse>) {
      if (event.data.id !== id) return;
      if (event.data.type === "progress") {
        onProgress?.({ phase: event.data.phase, detail: event.data.detail });
        return;
      }
      if (event.data.type === "ready") {
        finish(null);
        return;
      }
      const { id: _id, type: _type, ...result } = event.data;
      void _id;
      void _type;
      finish(result);
    }
    function onError() {
      finish({
        passed: false,
        stdout: "",
        error: "The isolated runtime could not start. Check your browser console or reset the runtime and try again.",
        runtime: "controlled-local",
        durationMs: 0,
        tests: [],
      }, true);
    }
    function onAbort() {
      finish({
        passed: false,
        stdout: "",
        error: "Execution stopped by the learner.",
        runtime: "controlled-local",
        durationMs: 0,
        tests: [],
      }, true);
    }
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) {
      onAbort();
      return;
    }

    const workerRequest = { ...request, id } as WorkerExecutionRequest;
    worker.postMessage(workerRequest);
  });
}

export function prepareLabRuntime(
  track: RuntimeWorkerTrack,
  onProgress?: (progress: RuntimeProgress) => void,
  signal?: AbortSignal,
) {
  const pool = runtimePools[track];
  if (pool.ready) {
    onProgress?.({ phase: "ready", detail: track === "python" ? "Python runtime ready." : "PostgreSQL runtime ready." });
    return Promise.resolve();
  }
  if (pool.preparing) return pool.preparing;

  let preparation: Promise<ExecutionResult | null>;
  try {
    preparation = sendWorkerRequest(track, { type: "prepare" }, COLD_START_TIMEOUT[track], onProgress, signal);
  } catch (error) {
    resetLabRuntime(track);
    return Promise.reject(error instanceof Error ? error : new Error("The browser blocked the runtime worker."));
  }

  pool.preparing = preparation
    .then((failure) => {
      if (failure) throw new Error(failure.error ?? "Runtime preparation failed.");
      pool.ready = true;
    })
    .finally(() => {
      pool.preparing = null;
    });
  return pool.preparing;
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
      headers: {
        "content-type": "application/json",
        ...(request.authToken ? { authorization: `Bearer ${request.authToken}` } : {}),
      },
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

export async function executeLab(request: ExecutionRequest, signal?: AbortSignal, onProgress?: (progress: RuntimeProgress) => void): Promise<ExecutionResult> {
  if (request.track === "genai") return runGenAILab(request, signal);
  await prepareLabRuntime(request.track, onProgress, signal);
  const result = await sendWorkerRequest(
    request.track,
    { type: "execute", code: request.code, challenge: request.challenge },
    EXECUTION_TIMEOUT[request.track],
    onProgress,
    signal,
  );
  if (!result) throw new Error("The runtime returned no execution result.");
  return result;
}
