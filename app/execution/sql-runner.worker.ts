/// <reference lib="webworker" />

import { PGlite } from "@electric-sql/pglite";
import type { ChallengeTestResult, ResultTable, WorkerExecutionRequest, WorkerExecutionResponse } from "./types";

declare const self: DedicatedWorkerGlobalScope;

let runtimePromise: Promise<void> | null = null;

function report(id: number, phase: "download" | "initialize" | "database" | "execute" | "test" | "ready", detail: string) {
  self.postMessage({ type: "progress", id, phase, detail } satisfies WorkerExecutionResponse);
}

function prepareRuntime(id: number) {
  if (!runtimePromise) {
    report(id, "download", "Downloading PostgreSQL runtime files (about 17 MB)…");
    runtimePromise = (async () => {
      const warmup = await PGlite.create("memory://");
      await warmup.close();
    })().catch((error) => {
      runtimePromise = null;
      throw error;
    });
  } else {
    report(id, "initialize", "Reusing the warmed PostgreSQL runtime…");
  }
  return runtimePromise;
}

const PRACTICE_SCHEMA = `
CREATE TABLE sectors (sector_id bigint PRIMARY KEY, name text NOT NULL, region text NOT NULL);
CREATE TABLE relays (
  relay_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sector_id bigint REFERENCES sectors(sector_id),
  predecessor_id bigint,
  name text NOT NULL,
  online boolean NOT NULL DEFAULT false,
  power numeric(10,2) NOT NULL,
  efficiency numeric(5,2) NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'stable',
  last_error text,
  repaired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE readings (reading_id bigint PRIMARY KEY, relay_id bigint REFERENCES relays(relay_id), value numeric(10,2), captured_at timestamptz, valid boolean);
CREATE TABLE alerts (alert_id bigint PRIMARY KEY, relay_id bigint REFERENCES relays(relay_id), open boolean, severity text);
CREATE TABLE users (user_id bigint PRIMARY KEY, name text, email text UNIQUE, active boolean DEFAULT true);
CREATE TABLE orders (order_id bigint PRIMARY KEY, user_id bigint REFERENCES users(user_id), total numeric(10,2), status text, created_at timestamptz DEFAULT now());
CREATE TABLE relay_events (event_id bigint PRIMARY KEY, relay_id bigint REFERENCES relays(relay_id), event_type text, occurred_at timestamptz, payload jsonb);
CREATE TABLE outbox (event_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, event_type text, payload jsonb, created_at timestamptz DEFAULT now());

INSERT INTO sectors VALUES (1, 'Aurora', 'north'), (2, 'Ember', 'south'), (3, 'Tidal', 'north');
INSERT INTO relays (sector_id, predecessor_id, name, online, power, efficiency, status, last_error, repaired_at, created_at) VALUES
  (1, NULL, 'Aurora Prime', true, 96, .98, 'critical', NULL, now(), now() - interval '2 days'),
  (1, 1, 'Aurora Edge', true, 82, .91, 'stable', NULL, NULL, now() - interval '1 day'),
  (2, 1, 'Ember Gate', false, 44, .73, 'weak', 'coolant', NULL, now() - interval '4 hours'),
  (3, 2, 'Tidal Link', true, 68, .88, 'stable', NULL, now(), now());
INSERT INTO readings VALUES
  (1, 1, 96.2, now() - interval '2 hours', true),
  (2, 1, 94.8, now() - interval '1 hour', true),
  (3, 2, 82.1, now() - interval '30 minutes', true),
  (4, 3, 44.0, now() - interval '15 minutes', false);
INSERT INTO alerts VALUES (1, 3, true, 'high'), (2, 1, false, 'low');
INSERT INTO users VALUES (1, 'Nova', 'nova@example.test', true), (2, 'Kiro', 'kiro@example.test', true), (3, 'Mira', 'mira@example.test', false);
INSERT INTO orders VALUES (101, 1, 125.50, 'paid', now() - interval '3 days'), (102, 1, 42.00, 'open', now()), (103, 2, 310.25, 'paid', now() - interval '1 day');
INSERT INTO relay_events VALUES
  (1, 1, 'online', now() - interval '2 days', '{"source":"repair"}'),
  (2, 3, 'offline', now() - interval '4 hours', '{"source":"sensor"}');
`;

type QueryResult = {
  rows?: Record<string, unknown>[];
  fields?: Array<{ name: string }>;
  affectedRows?: number;
};

function formatResults(results: QueryResult[]) {
  if (!results.length) return "Query completed successfully.";
  return results.map((result, index) => {
    if (result.rows?.length) {
      return "Result " + (index + 1) + " (" + result.rows.length + " rows)\n" + JSON.stringify(result.rows, null, 2);
    }
    return "Statement " + (index + 1) + " completed" + (typeof result.affectedRows === "number" ? " · " + result.affectedRows + " rows affected" : "") + ".";
  }).join("\n\n");
}

function normalizeRows(rows: Record<string, unknown>[] = []) {
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, typeof value === "bigint" ? Number(value) : value])));
}

function resultTable(result?: QueryResult): ResultTable | undefined {
  if (!result?.rows) return undefined;
  const rows = normalizeRows(result.rows);
  const columns = result.fields?.map((field) => field.name) ?? Object.keys(rows[0] ?? {});
  return { columns, rows };
}

function sameValue(actual: unknown, expected: unknown) {
  if (Array.isArray(expected)) {
    const actualArray = Array.isArray(actual) ? actual : [actual];
    return JSON.stringify([...actualArray].map(String).sort()) === JSON.stringify([...expected].map(String).sort());
  }
  return String(actual) === String(expected);
}

async function gradeSQL(database: PGlite, code: string, table: ResultTable | undefined, request: WorkerExecutionRequest) {
  const tests: ChallengeTestResult[] = (request.challenge?.requiredPatterns ?? []).map((requirement) => {
    const passed = new RegExp(requirement.pattern, requirement.flags).test(code);
    return { name: requirement.name, passed, detail: passed ? "Required SQL construct detected." : "Required SQL construct is missing.", hint: requirement.hint };
  });
  const minimumCodeLength = request.challenge?.minimumCodeLength ?? 0;
  if (minimumCodeLength) {
    const meaningfulLength = code.split("\n").map((line) => line.replace(/--.*/, "").trim()).join("").length;
    tests.unshift({
      name: "Meaningful solution",
      passed: meaningfulLength >= minimumCodeLength,
      detail: meaningfulLength >= minimumCodeLength ? "The submission contains a substantive SQL solution." : "The query is still mostly placeholders or comments.",
      hint: "Complete the requested query or database object instead of submitting a trivial statement.",
    });
  }

  for (const test of request.challenge?.sqlTests ?? []) {
    let passed = false;
    let detail = "Check failed.";
    if (test.kind === "result-columns") {
      const missing = (test.columns ?? []).filter((column) => !table?.columns.includes(column));
      passed = missing.length === 0;
      detail = passed ? "Returned the required columns." : "Missing columns: " + missing.join(", ");
    } else if (test.kind === "result-min-rows" || test.kind === "result-max-rows") {
      const count = table?.rows.length ?? 0;
      const meetsMinimum = test.minRows === undefined || count >= test.minRows;
      const meetsMaximum = test.maxRows === undefined || count <= test.maxRows;
      passed = meetsMinimum && meetsMaximum;
      detail = "Returned " + count + " row" + (count === 1 ? "" : "s") + ".";
    } else if (test.kind === "result-value") {
      const values = (table?.rows ?? []).map((row) => row[test.column ?? ""]);
      const actual = Array.isArray(test.expected) ? values : values[0];
      passed = sameValue(actual, test.expected);
      detail = passed ? "Result value matches the mission." : "Received " + JSON.stringify(actual) + ".";
    } else if (test.kind === "result-ordered-values") {
      const actual = (table?.rows ?? []).map((row) => String(row[test.column ?? ""]));
      const expected = Array.isArray(test.expected) ? test.expected.map(String) : [String(test.expected)];
      passed = JSON.stringify(actual) === JSON.stringify(expected);
      detail = passed ? "Result values are in the required order." : "Received order " + JSON.stringify(actual) + ".";
    } else if (test.kind === "database-value" && test.query) {
      const queryResult = await database.query(test.query) as { rows: Record<string, unknown>[] };
      const values = normalizeRows(queryResult.rows).map((row) => row[test.column ?? Object.keys(row)[0]]);
      const actual = Array.isArray(test.expected) ? values : values[0];
      passed = sameValue(actual, test.expected);
      detail = passed ? "Database state matches the mission." : "Database state returned " + JSON.stringify(actual) + ".";
    }
    tests.push({ name: test.name, passed, detail, hint: test.hint });
  }
  return tests;
}

self.onmessage = async (event: MessageEvent<WorkerExecutionRequest>) => {
  const { id } = event.data;
  const startedAt = performance.now();
  let database: PGlite | null = null;

  try {
    await prepareRuntime(id);
    if (event.data.type === "prepare") {
      report(id, "ready", "PostgreSQL runtime ready. Each run gets a fresh practice database.");
      self.postMessage({ type: "ready", id, runtime: "postgres-wasm" } satisfies WorkerExecutionResponse);
      return;
    }

    const { code } = event.data;
    report(id, "database", "Creating a fresh in-memory practice database…");
    database = await PGlite.create("memory://");
    report(id, "database", "Loading the topic-specific tables and sample data…");
    await database.exec(PRACTICE_SCHEMA);
    if (event.data.challenge?.sqlSetup) await database.exec(event.data.challenge.sqlSetup);
    report(id, "execute", "Running your SQL statements…");
    const results = await database.exec(code) as QueryResult[];
    const visibleResult = [...results].reverse().find((result) => result.rows);
    const table = resultTable(visibleResult);
    report(id, "test", "Checking result rows and database state…");
    const tests = await gradeSQL(database, code, table, event.data);
    const response: WorkerExecutionResponse = {
      type: "result",
      id,
      passed: tests.every((test) => test.passed),
      stdout: table ? "Query completed successfully and returned " + table.rows.length + " structured row" + (table.rows.length === 1 ? "." : "s.") : formatResults(results),
      runtime: "postgres-wasm",
      durationMs: Math.round(performance.now() - startedAt),
      tests,
      table,
    };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerExecutionResponse = {
      type: "result",
      id,
      passed: false,
      stdout: "",
      error: error instanceof Error ? error.message : "SQL execution failed.",
      runtime: "postgres-wasm",
      durationMs: Math.round(performance.now() - startedAt),
      tests: [],
    };
    self.postMessage(response);
  } finally {
    await database?.close();
  }
};

export {};
