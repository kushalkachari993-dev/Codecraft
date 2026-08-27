"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExecutionResult, RuntimeProgress, RuntimeWorkerTrack } from "../execution/types";
import { ensureRuntimeCacheWorker, shouldPrewarmRuntime } from "../execution/runtime-cache";

export type RunState = "idle" | "running" | "ready" | "error" | "complete";
export type RuntimeReadiness = "idle" | "preparing" | "ready" | "error";
export type RuntimeTrack = "python" | "genai" | "sql";

export function useLabRuntime(initialCode: string, prewarmTrack: RuntimeTrack | null = null) {
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<RunState>("idle");
  const [terminal, setTerminal] = useState("Your output will appear here.");
  const [sceneStep, setSceneStep] = useState(0);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionPhase, setExecutionPhase] = useState("");
  const [runtimeReadiness, setRuntimeReadiness] = useState<Record<RuntimeWorkerTrack, RuntimeReadiness>>({ python: "idle", sql: "idle" });
  const runToken = useRef(0);
  const executionAbort = useRef<AbortController | null>(null);
  const requestedPrewarms = useRef(new Set<RuntimeWorkerTrack>());

  useEffect(() => () => {
    runToken.current += 1;
    executionAbort.current?.abort();
  }, []);

  const updateRuntimeReadiness = useCallback((track: RuntimeWorkerTrack, readiness: RuntimeReadiness) => {
    setRuntimeReadiness((current) => ({ ...current, [track]: readiness }));
  }, []);

  const clearRun = () => {
    runToken.current += 1;
    executionAbort.current?.abort();
    executionAbort.current = null;
    setExecutionPhase("");
    setExecutionResult(null);
  };

  const startRun = () => {
    executionAbort.current?.abort();
    const controller = new AbortController();
    executionAbort.current = controller;
    const token = runToken.current + 1;
    runToken.current = token;
    return { controller, token };
  };

  const isCurrentRun = (token: number) => token === runToken.current;

  const finishRun = () => {
    executionAbort.current = null;
    setExecutionPhase("");
  };

  const warmExecutionRuntime = useCallback((track: RuntimeTrack) => {
    if (track === "genai") return;
    updateRuntimeReadiness(track, "preparing");
    setExecutionPhase(track === "python"
      ? "Downloading and compiling Python once for this browser tab…"
      : "Downloading and compiling PostgreSQL once for this browser tab…");
    void ensureRuntimeCacheWorker().then(() => import("../execution/client")).then(({ prepareLabRuntime }) => prepareLabRuntime(track, (progress: RuntimeProgress) => {
      setExecutionPhase(progress.detail);
      if (progress.phase === "ready") updateRuntimeReadiness(track, "ready");
    })).then(() => {
      updateRuntimeReadiness(track, "ready");
      setExecutionPhase(track === "python" ? "Python runtime ready." : "PostgreSQL runtime ready.");
    }).catch(() => {
      updateRuntimeReadiness(track, "error");
      setExecutionPhase("Runtime preparation paused. Run the lab to retry.");
    });
  }, [updateRuntimeReadiness]);

  useEffect(() => {
    void ensureRuntimeCacheWorker();
  }, []);

  useEffect(() => {
    if (!prewarmTrack || prewarmTrack === "genai" || requestedPrewarms.current.has(prewarmTrack) || !shouldPrewarmRuntime()) return;
    const warm = () => {
      requestedPrewarms.current.add(prewarmTrack);
      warmExecutionRuntime(prewarmTrack);
    };
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(warm, { timeout: 4_000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(warm, 1_500);
    return () => window.clearTimeout(timeoutId);
  }, [prewarmTrack, warmExecutionRuntime]);

  const stopExecution = (track: RuntimeTrack) => {
    runToken.current += 1;
    executionAbort.current?.abort();
    executionAbort.current = null;
    setExecutionPhase("");
    if (track !== "genai") updateRuntimeReadiness(track, "idle");
    setStatus("idle");
    setTerminal("> Execution stopped by learner.\nEdit or reset the lab when you are ready.");
  };

  return {
    code,
    setCode,
    status,
    setStatus,
    terminal,
    setTerminal,
    sceneStep,
    setSceneStep,
    executionResult,
    setExecutionResult,
    executionPhase,
    setExecutionPhase,
    runtimeReadiness,
    updateRuntimeReadiness,
    clearRun,
    startRun,
    isCurrentRun,
    finishRun,
    warmExecutionRuntime,
    stopExecution,
  };
}
