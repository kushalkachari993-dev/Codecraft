export type ExecutionTrack = "python" | "sql" | "genai";

export type ExecutionRequest = {
  track: ExecutionTrack;
  code: string;
  topic: string;
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

export type WorkerExecutionRequest = {
  id: number;
  code: string;
  challenge?: ChallengeRuntimeSpec;
};

export type WorkerExecutionResponse = ExecutionResult & { id: number };
