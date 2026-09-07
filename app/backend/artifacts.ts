import type { CloudArtifact, CloudArtifactCheck, CloudArtifactResult } from "../cloud/artifacts";
import type { CloudLesson } from "../cloud/model";
import type { BackendPaceId } from "./track";

const MAX_ARTIFACT_LENGTH = 24_000;
const artifactCheck = (name: string, hint: string, test: (source: string) => boolean): CloudArtifactCheck => ({ name, hint, test });
const slug = (lesson: CloudLesson) => lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42);
const controls = (lesson: CloudLesson) => Array.isArray(lesson.solution.safeguards) ? lesson.solution.safeguards.map(String) : [];

function parseObject(source: string) {
  try {
    const parsed: unknown = JSON.parse(source);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch { return null; }
}

function openApiArtifact(lesson: CloudLesson, secure: boolean): string {
  const route = "/v1/" + slug(lesson);
  return `openapi: 3.1.0
info:
  title: CodeCraft ${lesson.title} API
  version: 1.0.0
paths:
  ${route}:
    post:
      operationId: ${slug(lesson).replace(/-/g, "_")}
      parameters:
        - in: header
          name: ${secure ? "Idempotency-Key" : "Debug-Mode"}
          required: true
          schema:
            type: string
      responses:
        "201":
          description: Accepted outcome
          headers:
            Trace-Id:
              schema:
                type: string
        "400":
          description: Invalid request
        "409":
          description: Conflicting or repeated operation
        "500":
          description: Safe internal error envelope
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
security:${secure ? "\n  - bearerAuth: []" : " []"}
x-codecraft-controls:
${controls(lesson).map((entry) => `  - ${entry}`).join("\n")}`;
}

function jsonConfigArtifact(lesson: CloudLesson, secure: boolean): string {
  return JSON.stringify({
    service: { name: "relay-api", boundary: secure ? lesson.solution.boundary : "implicit", environment: "training" },
    resilience: { timeout_ms: secure ? lesson.solution.timeout_ms : 10_000, retry_limit: secure ? lesson.solution.retry_limit : 9, idempotent: secure },
    telemetry: { correlation_header: secure ? "Trace-Id" : "", metric: secure ? `codecraft.${slug(lesson)}.outcomes` : "requests", redact_payloads: secure },
    security: { default_deny: secure, log_secrets: !secure },
    safeguards: secure ? controls(lesson) : controls(lesson).slice(0, 1),
  }, null, 2);
}

function sqlArtifact(lesson: CloudLesson, secure: boolean): string {
  const table = "cc_" + slug(lesson).replace(/-/g, "_").slice(0, 24);
  return `-- ${lesson.title} · ${secure ? "reviewed migration" : "injected migration risk"}
${secure ? "BEGIN;\nSET LOCAL lock_timeout = '2s';\nSET LOCAL statement_timeout = '30s';" : "DROP TABLE IF EXISTS production_records;"}

CREATE TABLE IF NOT EXISTS ${table} (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  operation_key text NOT NULL,
  state text NOT NULL CHECK (state IN ('pending', 'complete', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ${table}_operation_unique UNIQUE (tenant_id, operation_key)
);

COMMENT ON TABLE ${table} IS 'CodeCraft static training artifact: ${lesson.title.replace(/'/g, "")}' ;
${secure ? `COMMIT;

-- PostgreSQL requires CONCURRENTLY outside a transaction block.
CREATE INDEX CONCURRENTLY IF NOT EXISTS ${table}_tenant_created_idx
  ON ${table} (tenant_id, created_at DESC);` : `CREATE INDEX ${table}_state_idx ON ${table} (state);
-- transaction and compatibility controls intentionally missing`}`;
}

function eventArtifact(lesson: CloudLesson, secure: boolean): string {
  return JSON.stringify({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: lesson.title + "Event",
    type: "object",
    additionalProperties: false,
    required: secure ? ["event_id", "event_type", "occurred_at", "tenant_id", "data"] : ["data"],
    properties: {
      event_id: { type: "string", format: "uuid" },
      event_type: { const: "codecraft." + slug(lesson) + ".v1" },
      occurred_at: { type: "string", format: "date-time" },
      tenant_id: { type: "string", format: "uuid" },
      data: { type: "object", additionalProperties: false, required: ["operation_key", "status"], properties: { operation_key: { type: "string", minLength: 8 }, status: { enum: ["pending", "complete", "failed"] } } },
    },
    delivery: { semantics: "at-least-once", idempotency_key: secure ? "event_id" : "", max_attempts: secure ? 3 : 99, dead_letter: secure },
  }, null, 2);
}

function artifactForKind(lesson: CloudLesson, kind: number, secure: boolean) {
  if (kind === 0) return openApiArtifact(lesson, secure);
  if (kind === 1) return jsonConfigArtifact(lesson, secure);
  if (kind === 2) return sqlArtifact(lesson, secure);
  return eventArtifact(lesson, secure);
}

export function getBackendArtifact(paceId: BackendPaceId, lesson: CloudLesson): CloudArtifact {
  const kind = (lesson.id - 1 + (paceId === "intermediate" ? 1 : paceId === "expert" ? 2 : 0)) % 4;
  const files = ["openapi.yaml", "service.config.json", "migration.sql", "event.schema.json"];
  const labels = ["OpenAPI contract", "Nested service configuration", "PostgreSQL migration", "Event and delivery contract"];
  const languages = ["OpenAPI YAML", "JSON", "PostgreSQL SQL", "JSON Schema"];
  const artifactKinds: CloudArtifact["kind"][] = ["cicd", "iam", "terraform", "iam"];
  const checks: CloudArtifactCheck[][] = [
    [
      artifactCheck("OpenAPI version is explicit", "Declare OpenAPI 3.1.0 at the document root.", (source) => /^openapi:\s*3\.1\.0\s*$/m.test(source)),
      artifactCheck("Operation is stable and retry-safe", "Keep an operationId and require Idempotency-Key.", (source) => /operationId:\s*[a-z0-9_]+/i.test(source) && /name:\s*Idempotency-Key/i.test(source)),
      artifactCheck("Failure responses are documented", "Document validation, conflict, and safe server failures.", (source) => /"400":/.test(source) && /"409":/.test(source) && /"500":/.test(source)),
      artifactCheck("Authentication and tracing are visible", "Require bearerAuth and expose a Trace-Id response header.", (source) => /security:\s*\n\s*-\s*bearerAuth:/m.test(source) && /Trace-Id:/i.test(source)),
    ],
    [
      artifactCheck("Boundary is named", "Set service.boundary to the lesson boundary rather than implicit.", (source) => parseObject(source)?.service !== undefined && source.includes(`"boundary": "${String(lesson.solution.boundary)}"`)),
      artifactCheck("Resilience budget is bounded", "Use the lesson timeout and retry budget.", (source) => source.includes(`"timeout_ms": ${String(lesson.solution.timeout_ms)}`) && source.includes(`"retry_limit": ${String(lesson.solution.retry_limit)}`)),
      artifactCheck("Telemetry is correlatable and redacted", "Configure Trace-Id and redact payloads.", (source) => /"correlation_header":\s*"Trace-Id"/.test(source) && /"redact_payloads":\s*true/.test(source)),
      artifactCheck("Security fails closed", "Enable default deny and never log secret values.", (source) => /"default_deny":\s*true/.test(source) && /"log_secrets":\s*false/.test(source)),
    ],
    [
      artifactCheck("Migration is transactional and bounded", "Use BEGIN/COMMIT with local lock and statement timeouts.", (source) => /\bBEGIN\s*;/i.test(source) && /\bCOMMIT\s*;/i.test(source) && /lock_timeout/i.test(source) && /statement_timeout/i.test(source)),
      artifactCheck("Destructive shortcuts are absent", "Do not drop production tables in a forward migration.", (source) => !/\bDROP\s+TABLE\b/i.test(source)),
      artifactCheck("Integrity is enforced in the database", "Keep the primary key, tenant key, state check, and unique operation constraint.", (source) => /PRIMARY KEY/i.test(source) && /tenant_id\s+uuid\s+NOT NULL/i.test(source) && /CHECK\s*\(/i.test(source) && /UNIQUE\s*\(/i.test(source)),
      artifactCheck("Critical access path is indexed safely", "Create the tenant/time index concurrently.", (source) => /CREATE\s+INDEX\s+CONCURRENTLY\s+IF\s+NOT\s+EXISTS/i.test(source)),
    ],
    [
      artifactCheck("Event envelope is complete", "Require identity, type, time, tenant, and data fields.", (source) => ["event_id", "event_type", "occurred_at", "tenant_id", "data"].every((key) => source.includes(`"${key}"`))),
      artifactCheck("Schema rejects accidental fields", "Set additionalProperties to false on the envelope and data object.", (source) => (source.match(/"additionalProperties":\s*false/g) ?? []).length >= 2),
      artifactCheck("Delivery is duplicate-safe", "Use event_id as the idempotency key with at-least-once delivery.", (source) => /"semantics":\s*"at-least-once"/.test(source) && /"idempotency_key":\s*"event_id"/.test(source)),
      artifactCheck("Retries terminate safely", "Bound attempts and enable dead-letter handling.", (source) => /"max_attempts":\s*3/.test(source) && /"dead_letter":\s*true/.test(source)),
    ],
  ];
  return {
    kind: artifactKinds[kind],
    label: labels[kind],
    filename: files[kind],
    language: languages[kind],
    brief: `Review a nested ${labels[kind].toLowerCase()} for ${lesson.title}. Repair the injected reliability, security, and operability gaps without executing it.`,
    starter: artifactForKind(lesson, kind, false),
    solution: artifactForKind(lesson, kind, true),
    checks: checks[kind],
  };
}

export function evaluateBackendArtifact(artifact: CloudArtifact, source: string): CloudArtifactResult {
  if (!source.trim()) return { passed: false, error: "The artifact is empty.", checks: [] };
  if (source.length > MAX_ARTIFACT_LENGTH) return { passed: false, error: "Keep the training artifact under 24,000 characters.", checks: [] };
  if (source.includes("\0")) return { passed: false, error: "Null bytes are not allowed in training artifacts.", checks: [] };
  if (artifact.filename.endsWith(".json") && !parseObject(source)) return { passed: false, error: "The artifact must be one valid JSON object.", checks: [] };
  if (artifact.filename.endsWith(".yaml") && (/\t/.test(source) || !/^openapi:\s*3\./m.test(source))) return { passed: false, error: "The OpenAPI artifact needs space-indented YAML and an explicit version.", checks: [] };
  if (artifact.filename.endsWith(".sql") && !/;\s*(?:--[^\n]*\s*)*$/m.test(source)) return { passed: false, error: "The migration needs complete semicolon-terminated SQL statements.", checks: [] };
  const checks = artifact.checks.map((entry) => ({ name: entry.name, hint: entry.hint, passed: entry.test(source) }));
  return { passed: checks.length > 0 && checks.every((entry) => entry.passed), checks };
}
