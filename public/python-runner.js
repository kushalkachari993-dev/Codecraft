/* CodeCraft Python sandbox worker.
 * Same-origin entry avoids deployment-specific bundled worker URLs.
 */

let runtimePromise = null;
const PYODIDE_INDEX_URL = "/pyodide-314.0.5/";

function report(id, phase, detail) {
  self.postMessage({ type: "progress", id, phase, detail });
}

function getRuntime(id) {
  if (!runtimePromise) {
    report(id, "download", "Downloading Python runtime files (about 14 MB)...");
    runtimePromise = import(`${PYODIDE_INDEX_URL}pyodide.mjs`)
      .then(({ loadPyodide }) => loadPyodide({ indexURL: PYODIDE_INDEX_URL }))
      .catch((error) => {
        runtimePromise = null;
        throw error;
      });
  } else {
    report(id, "initialize", "Reusing the warmed Python runtime...");
  }
  return runtimePromise;
}

function sourceChecks(code, challenge) {
  const tests = (challenge?.requiredPatterns ?? []).map((requirement) => {
    const passed = new RegExp(requirement.pattern, requirement.flags).test(code);
    return {
      name: requirement.name,
      passed,
      detail: passed ? "Required construct detected." : "Required construct is missing.",
      hint: requirement.hint,
    };
  });
  const minimumCodeLength = challenge?.minimumCodeLength ?? 0;
  if (minimumCodeLength) {
    const meaningfulLength = code.split("\n").map((line) => line.replace(/#.*/, "").trim()).join("").length;
    tests.unshift({
      name: "Meaningful solution",
      passed: meaningfulLength >= minimumCodeLength,
      detail: meaningfulLength >= minimumCodeLength
        ? "The solution contains a substantive implementation."
        : "The solution is still mostly placeholders or comments.",
      hint: "Replace the TODO and implement the requested behavior instead of returning a constant.",
    });
  }
  return tests;
}

self.onmessage = async (event) => {
  const { id } = event.data;
  const startedAt = performance.now();
  const output = [];

  try {
    const pyodide = await getRuntime(id);
    if (event.data.type === "prepare") {
      report(id, "ready", "Python runtime ready. Future runs reuse it.");
      self.postMessage({ type: "ready", id, runtime: "python-wasm" });
      return;
    }

    const { code, challenge } = event.data;
    report(id, "initialize", "Creating a clean Python workspace...");
    pyodide.setStdout({ batched: (message) => output.push(message) });
    pyodide.setStderr({ batched: (message) => output.push(message) });
    const globals = pyodide.runPython("dict()");
    try {
      report(id, "execute", "Running your Python code...");
      const result = await pyodide.runPythonAsync(code, { globals });
      if (result !== undefined && result !== null && output.length === 0) output.push(String(result));
      result?.destroy?.();

      report(id, "test", "Running visible checks and hidden tests...");
      const tests = sourceChecks(code, challenge);
      for (const hiddenTest of challenge?.pythonTests ?? []) {
        try {
          await pyodide.runPythonAsync(hiddenTest.code, { globals });
          tests.push({ name: hiddenTest.name, passed: true, detail: "Hidden behavior check passed.", hint: hiddenTest.hint });
        } catch (error) {
          tests.push({
            name: hiddenTest.name,
            passed: false,
            detail: error instanceof Error ? error.message.split("\n").at(-1) ?? "Assertion failed." : "Assertion failed.",
            hint: hiddenTest.hint,
          });
        }
      }

      self.postMessage({
        type: "result",
        id,
        passed: tests.every((test) => test.passed),
        stdout: output.join("\n") || "Program completed with no printed output.",
        runtime: "python-wasm",
        durationMs: Math.round(performance.now() - startedAt),
        tests,
      });
    } finally {
      globals.destroy();
    }
  } catch (error) {
    self.postMessage({
      type: "result",
      id,
      passed: false,
      stdout: output.join("\n"),
      error: error instanceof Error ? error.message : "Python execution failed.",
      runtime: "python-wasm",
      durationMs: Math.round(performance.now() - startedAt),
      tests: [],
    });
  }
};
