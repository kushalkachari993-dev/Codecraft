/// <reference lib="webworker" />

import { loadPyodide, type PyodideInterface } from "pyodide";
import type { WorkerExecutionRequest, WorkerExecutionResponse } from "./types";

declare const self: DedicatedWorkerGlobalScope;

let runtimePromise: Promise<PyodideInterface> | null = null;

function report(id: number, phase: "download" | "initialize" | "execute" | "test" | "ready", detail: string) {
  self.postMessage({ type: "progress", id, phase, detail } satisfies WorkerExecutionResponse);
}

function getRuntime(id: number) {
  if (!runtimePromise) {
    report(id, "download", "Downloading Python runtime files (about 14 MB)…");
    runtimePromise = loadPyodide({ indexURL: "/pyodide/" }).catch((error) => {
      runtimePromise = null;
      throw error;
    });
  } else {
    report(id, "initialize", "Reusing the warmed Python runtime…");
  }
  return runtimePromise;
}

self.onmessage = async (event: MessageEvent<WorkerExecutionRequest>) => {
  const { id } = event.data;
  const startedAt = performance.now();
  const output: string[] = [];

  try {
    const pyodide = await getRuntime(id);
    if (event.data.type === "prepare") {
      report(id, "ready", "Python runtime ready. Future runs reuse it instantly.");
      self.postMessage({ type: "ready", id, runtime: "python-wasm" } satisfies WorkerExecutionResponse);
      return;
    }

    const { code } = event.data;
    report(id, "initialize", "Creating a clean Python workspace…");
    pyodide.setStdout({ batched: (message) => output.push(message) });
    pyodide.setStderr({ batched: (message) => output.push(message) });
    const globals = pyodide.runPython("dict()");
    let result: unknown;
    try {
      report(id, "execute", "Running your Python code…");
      result = await pyodide.runPythonAsync(code, { globals });
      if (result !== undefined && result !== null && output.length === 0) output.push(String(result));
      (result as { destroy?: () => void } | null)?.destroy?.();

      report(id, "test", "Running visible checks and hidden tests…");
      const tests = (event.data.challenge?.requiredPatterns ?? []).map((requirement) => {
        const passed = new RegExp(requirement.pattern, requirement.flags).test(code);
        return { name: requirement.name, passed, detail: passed ? "Required construct detected." : "Required construct is missing.", hint: requirement.hint };
      });
      const minimumCodeLength = event.data.challenge?.minimumCodeLength ?? 0;
      if (minimumCodeLength) {
        const meaningfulLength = code.split("\n").map((line) => line.replace(/#.*/, "").trim()).join("").length;
        tests.unshift({
          name: "Meaningful solution",
          passed: meaningfulLength >= minimumCodeLength,
          detail: meaningfulLength >= minimumCodeLength ? "The solution contains a substantive implementation." : "The solution is still mostly placeholders or comments.",
          hint: "Replace the TODO and implement the requested behavior instead of returning a constant.",
        });
      }
      for (const hiddenTest of event.data.challenge?.pythonTests ?? []) {
        try {
          await pyodide.runPythonAsync(hiddenTest.code, { globals });
          tests.push({ name: hiddenTest.name, passed: true, detail: "Hidden behavior check passed.", hint: hiddenTest.hint });
        } catch (error) {
          tests.push({ name: hiddenTest.name, passed: false, detail: error instanceof Error ? error.message.split("\n").at(-1) ?? "Assertion failed." : "Assertion failed.", hint: hiddenTest.hint });
        }
      }

      const response: WorkerExecutionResponse = {
        type: "result",
        id,
        passed: tests.every((test) => test.passed),
        stdout: output.join("\n") || "Program completed with no printed output.",
        runtime: "python-wasm",
        durationMs: Math.round(performance.now() - startedAt),
        tests,
      };
      self.postMessage(response);
    } finally {
      globals.destroy();
    }
  } catch (error) {
    const response: WorkerExecutionResponse = {
      type: "result",
      id,
      passed: false,
      stdout: output.join("\n"),
      error: error instanceof Error ? error.message : "Python execution failed.",
      runtime: "python-wasm",
      durationMs: Math.round(performance.now() - startedAt),
      tests: [],
    };
    self.postMessage(response);
  }
};

export {};
