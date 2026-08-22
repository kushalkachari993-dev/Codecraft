export type ExecutionTrack = "python" | "sql" | "genai";

export type ExecutionRequest = {
  track: ExecutionTrack;
  code: string;
  topic: string;
  authToken?: string;
  required?: boolean;
  challenge?: ChallengeRuntimeSpec;
};

export type ChallengeTestResult = {
  name: string;
  passed: boolean;
  detail: string;
  hint?: string;
};

export type ResultTable = {
  columns: string[];
  rows: Array<Record<string, unknown>>;
};

export type SourceRequirement = { pattern: string; flags?: string; name: string; hint: string };
export type PythonHiddenTest = { name: string; code: string; hint: string };
export type SQLHiddenTest = {
  name: string;
  kind: "result-columns" | "result-min-rows" | "result-max-rows" | "result-value" | "database-value";
  columns?: string[];
  minRows?: number;
  maxRows?: number;
  column?: string;
  expected?: unknown;
  query?: string;
  hint: string;
};

export type ChallengeRuntimeSpec = {
  requiredPatterns: SourceRequirement[];
  minimumCodeLength?: number;
  pythonTests?: PythonHiddenTest[];
  sqlSetup?: string;
  sqlTests?: SQLHiddenTest[];
};

export type ExecutionResult = {
  passed: boolean;
  stdout: string;
  error?: string;
  runtime: "python-wasm" | "postgres-wasm" | "hosted-model" | "controlled-local";
  durationMs: number;
  tests: ChallengeTestResult[];
  table?: ResultTable;
};

export type RuntimeWorkerTrack = Extract<ExecutionTrack, "python" | "sql">;

export type RuntimeProgress = {
  phase: "download" | "initialize" | "database" | "execute" | "test" | "ready";
  detail: string;
};

export type WorkerExecutionRequest =
  | { type: "prepare"; id: number }
  | { type: "execute"; id: number; code: string; challenge?: ChallengeRuntimeSpec };

export type WorkerExecutionResponse =
  | ({ type: "progress"; id: number } & RuntimeProgress)
  | { type: "ready"; id: number; runtime: "python-wasm" | "postgres-wasm" }
  | (ExecutionResult & { type: "result"; id: number });
