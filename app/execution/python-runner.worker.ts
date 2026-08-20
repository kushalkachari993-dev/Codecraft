/// <reference lib="webworker" />

import { loadPyodide, type PyodideInterface } from "pyodide";
import type { WorkerExecutionRequest, WorkerExecutionResponse } from "./types";

declare const self: DedicatedWorkerGlobalScope;

let runtimePromise: Promise<PyodideInterface> | null = null;

function getRuntime() {
  runtimePromise ??= loadPyodide({ indexURL: "/pyodide/" });
  return runtimePromise;
}

self.onmessage = async (event: MessageEvent<WorkerExecutionRequest>) => {
  const { id, code } = event.data;
  const startedAt = performance.now();
  const output: string[] = [];

  try {
    const pyodide = await getRuntime();
    pyodide.setStdout({ batched: (message) => output.push(message) });
    pyodide.setStderr({ batched: (message) => output.push(message) });
    const result = await pyodide.runPythonAsync(code);
    if (result !== undefined && result !== null && output.length === 0) output.push(String(result));
    result?.destroy?.();

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
        await pyodide.runPythonAsync(hiddenTest.code);
        tests.push({ name: hiddenTest.name, passed: true, detail: "Hidden behavior check passed.", hint: hiddenTest.hint });
      } catch (error) {
        tests.push({ name: hiddenTest.name, passed: false, detail: error instanceof Error ? error.message.split("\n").at(-1) ?? "Assertion failed." : "Assertion failed.", hint: hiddenTest.hint });
      }
    }

    const response: WorkerExecutionResponse = {
      id,
      passed: tests.every((test) => test.passed),
      stdout: output.join("\n") || "Program completed with no printed output.",
      runtime: "python-wasm",
      durationMs: Math.round(performance.now() - startedAt),
      tests,
    };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerExecutionResponse = {
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
