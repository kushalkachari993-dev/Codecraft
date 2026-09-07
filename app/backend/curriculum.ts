import { check, exactSet, field, type CloudLesson, type CloudPlan } from "../cloud/model";
import type { BackendPaceId } from "./track";

type SourceKey = "http" | "openapi" | "postgres" | "owasp" | "otel" | "sre" | "patterns" | "ddd";
type TopicSpec = {
  title: string;
  goal: string;
  boundary: string;
  failure: string;
  metric: string;
  controls: [string, string, string];
  source: SourceKey;
};

const SOURCES: Record<SourceKey, { label: string; url: string }> = {
  http: { label: "MDN HTTP guide", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
  openapi: { label: "OpenAPI Specification", url: "https://spec.openapis.org/oas/latest.html" },
  postgres: { label: "PostgreSQL documentation", url: "https://www.postgresql.org/docs/current/index.html" },
  owasp: { label: "OWASP Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/" },
  otel: { label: "OpenTelemetry documentation", url: "https://opentelemetry.io/docs/" },
  sre: { label: "Google SRE books", url: "https://sre.google/books/" },
  patterns: { label: "Cloud Design Patterns", url: "https://learn.microsoft.com/azure/architecture/patterns/" },
  ddd: { label: "Domain-driven design guidance", url: "https://learn.microsoft.com/azure/architecture/microservices/model/domain-analysis" },
};

const topic = (title: string, goal: string, boundary: string, failure: string, metric: string, controls: [string, string, string], source: SourceKey): TopicSpec => ({
  title, goal, boundary, failure, metric, controls, source,
});

const BEGINNER: TopicSpec[] = [
  topic("HTTP Request Lifecycle", "Trace a request from connection and routing through handler, dependency calls, and response.", "client-edge-handler", "an unbounded handler hides where time is spent", "request_duration_ms", ["correlation-id", "deadline", "structured-response"], "http"),
  topic("REST Resources and Methods", "Model resources and choose methods whose safety and idempotency match the operation.", "route-resource", "action-shaped endpoints blur retry and ownership semantics", "method_contract_violations", ["resource-nouns", "method-semantics", "idempotency-key"], "http"),
  topic("Status Codes and Error Contracts", "Return stable status codes and machine-readable errors without leaking internals.", "handler-error-envelope", "generic 200 responses make failures invisible to clients", "unclassified_error_rate", ["typed-error", "safe-message", "trace-id"], "http"),
  topic("Input Validation", "Validate shape, meaning, size, and authorization before data reaches core logic.", "transport-domain", "trusted-looking input crosses the boundary unchecked", "rejected_invalid_requests", ["schema-validation", "size-limit", "allow-list"], "owasp"),
  topic("API Contract Capstone", "Design and troubleshoot a versioned order API with predictable retries and errors.", "public-api-service", "a partial request creates duplicate orders during retry", "successful_order_rate", ["openapi-contract", "idempotency-key", "error-envelope"], "openapi"),
  topic("Relational Data Modeling", "Turn domain facts into keys, relationships, constraints, and explicit nullability.", "domain-relational-schema", "application-only rules allow impossible records", "constraint_violation_rate", ["primary-key", "foreign-key", "check-constraint"], "postgres"),
  topic("Queries and Repositories", "Keep persistence queries explicit, parameterized, and separated from transport concerns.", "service-repository", "string-built queries mix data access with request handling", "query_error_rate", ["parameterized-query", "narrow-interface", "row-mapping"], "postgres"),
  topic("Transactions", "Choose a transaction boundary that preserves one business invariant under failure.", "use-case-transaction", "partial writes expose a state the business forbids", "rollback_rate", ["atomic-boundary", "short-transaction", "invariant-check"], "postgres"),
  topic("Schema Migrations", "Roll schema changes forward and backward without assuming every instance changes at once.", "old-code-new-schema", "a destructive migration races the rolling application release", "migration_lock_seconds", ["expand-contract", "backfill", "compatibility-check"], "postgres"),
  topic("Durable Data Capstone", "Evolve an order schema while concurrent writers preserve inventory and payment invariants.", "api-transaction-database", "concurrent updates oversell inventory during a migration", "oversell_count", ["row-lock", "expand-contract", "reconciliation"], "postgres"),
  topic("Authentication and Sessions", "Verify identity with bounded sessions, secure cookies, and intentional revocation.", "browser-session-service", "a stolen long-lived token remains useful indefinitely", "invalid_session_acceptance", ["secure-cookie", "expiry", "revocation"], "owasp"),
  topic("Authorization Policies", "Decide each action from subject, resource, operation, and contextual policy.", "identity-resource-policy", "authentication is mistaken for permission", "denied_action_rate", ["default-deny", "resource-owner", "policy-test"], "owasp"),
  topic("Secrets and Configuration", "Load validated configuration at startup while keeping secret values out of code and logs.", "runtime-config-service", "a credential is committed or printed during startup", "secret_exposure_events", ["secret-reference", "startup-validation", "redaction"], "owasp"),
  topic("Application Layers and Dependency Injection", "Separate transport, use-case, domain, and adapter responsibilities behind testable seams.", "handler-usecase-adapter", "business rules depend directly on a framework or database client", "layer_boundary_violations", ["constructor-injection", "port-interface", "pure-domain"], "ddd"),
  topic("Secure Service Capstone", "Protect an account service from confused authorization, leaked secrets, and tightly coupled dependencies.", "client-policy-domain-adapter", "a valid user edits another tenant through an unchecked identifier", "cross_tenant_denials", ["policy-at-resource", "redacted-config", "dependency-port"], "owasp"),
  topic("Caching Fundamentals", "Choose cache keys, freshness, ownership, and invalidation before optimizing latency.", "service-cache-database", "stale or cross-user data is served from an incomplete key", "cache_stale_read_rate", ["complete-key", "bounded-ttl", "invalidate-on-write"], "patterns"),
  topic("Background Jobs", "Move slow work behind a durable queue with retry, idempotency, and dead-letter handling.", "api-queue-worker", "a retried job performs the same side effect twice", "oldest_message_age", ["operation-id", "bounded-retry", "dead-letter"], "patterns"),
  topic("Files and Object Storage", "Treat uploads as untrusted streams with size, type, naming, and access controls.", "upload-scanner-storage", "user-controlled content becomes publicly executable", "unsafe_upload_rejections", ["content-sniff", "random-name", "private-access"], "owasp"),
  topic("Logs, Metrics, and Traces", "Correlate structured signals around user journeys without recording sensitive payloads.", "request-telemetry", "uncorrelated logs describe symptoms but not the failing dependency", "trace_coverage_rate", ["correlation-id", "service-metadata", "payload-redaction"], "otel"),
  topic("Testing and Graceful Shutdown", "Test boundaries and stop accepting work before draining in-flight requests and jobs.", "listener-worker-dependencies", "deployment termination drops acknowledged work", "forced_termination_count", ["readiness-off", "drain-deadline", "contract-test"], "sre"),
  topic("Production Backend Capstone", "Assemble and troubleshoot a secure API, durable data path, queue, cache, and observable shutdown.", "edge-api-data-worker", "a release creates stale reads and loses queued work during termination", "completed_user_journeys", ["safe-contract", "durable-work", "end-to-end-trace"], "sre"),
];

const INTERMEDIATE: TopicSpec[] = [
  topic("Layered and Hexagonal Architecture", "Place policy at the center and keep delivery and infrastructure behind replaceable ports.", "domain-ports-adapters", "framework details spread into business decisions", "architecture_dependency_breaches", ["inward-dependencies", "port-contract", "adapter-test"], "ddd"),
  topic("Domain Modeling", "Represent business language, invariants, entities, values, and lifecycle transitions explicitly.", "bounded-domain-model", "an anemic model permits invalid state transitions", "invalid_transition_rate", ["aggregate-boundary", "value-object", "invariant-method"], "ddd"),
  topic("Repository and Unit of Work", "Coordinate persistence through narrow collection-like contracts and one intentional commit boundary.", "usecase-unit-of-work", "separate hidden commits produce partial business outcomes", "partial_commit_count", ["explicit-commit", "repository-port", "rollback-test"], "ddd"),
  topic("API Versioning and Compatibility", "Evolve APIs additively, measure consumer use, and remove behavior through a published lifecycle.", "provider-consumer-contract", "a field changes meaning while old clients remain active", "deprecated_version_traffic", ["additive-change", "consumer-test", "sunset-signal"], "openapi"),
  topic("Modular Service Capstone", "Split a growing service into modules with enforced ownership and a compatible external contract.", "api-modules-database", "modules share tables and bypass each other's invariants", "cross_module_write_count", ["module-api", "owned-data", "dependency-rule"], "ddd"),
  topic("Indexes and Query Plans", "Read execution plans and design selective indexes for measured access patterns.", "repository-query-planner", "an index looks plausible but increases writes without helping the critical query", "p95_query_ms", ["explain-analyze", "selective-index", "before-after-measure"], "postgres"),
  topic("Connection Pooling", "Bound database concurrency from capacity and queue requests instead of multiplying connections.", "instances-pool-database", "each instance opens an oversized pool and exhausts the database", "pool_wait_ms", ["global-budget", "acquire-timeout", "pool-metric"], "postgres"),
  topic("Concurrency and Locking", "Choose optimistic or pessimistic coordination from contention and invariant risk.", "concurrent-writers-row", "lost updates silently replace a valid concurrent change", "serialization_retry_rate", ["version-column", "bounded-lock", "conflict-test"], "postgres"),
  topic("Cache Invalidation", "Define cache authority, write ordering, freshness bounds, and stampede protection.", "service-cache-source", "many misses overload the source while stale entries survive writes", "cache_fill_concurrency", ["single-flight", "versioned-key", "write-invalidation"], "patterns"),
  topic("Data Performance Capstone", "Repair a slow checkout path across plans, pools, locks, and cache behavior.", "api-cache-pool-database", "a cache stampede and pool exhaustion amplify one slow query", "checkout_p99_ms", ["query-plan", "pool-budget", "stampede-control"], "postgres"),
  topic("Queue Delivery Semantics", "Design explicitly for at-least-once delivery, visibility timeouts, and poison messages.", "producer-broker-consumer", "a consumer assumes exactly-once delivery from the broker", "redelivery_rate", ["ack-after-commit", "visibility-timeout", "dead-letter"], "patterns"),
  topic("Idempotent Consumers", "Make a stable operation identity and its side effect commit atomically.", "message-dedup-sideeffect", "the worker crashes after the side effect but before acknowledgement", "duplicate_effect_count", ["idempotency-record", "atomic-effect", "replay-test"], "patterns"),
  topic("Transactional Outbox", "Publish state-change events from a durable outbox written with business data.", "transaction-outbox-relay", "database state commits but its event is lost", "outbox_lag_seconds", ["same-transaction", "relay-checkpoint", "dedupe-consumer"], "patterns"),
  topic("Sagas and Compensation", "Coordinate long workflows with explicit state, timeouts, and business compensation.", "services-saga-state", "technical rollback is assumed possible after an external side effect", "stuck_saga_count", ["state-machine", "compensating-action", "timeout-owner"], "patterns"),
  topic("Async Workflow Capstone", "Build an order workflow that survives duplicates, crashes, delayed events, and compensation.", "order-outbox-broker-saga", "payment succeeds while order state and notification diverge", "unreconciled_order_count", ["transactional-outbox", "idempotent-handler", "saga-reconciliation"], "patterns"),
  topic("Rate Limiting and Load Shedding", "Protect scarce work with fair quotas, concurrency limits, and explicit overload responses.", "caller-admission-service", "unbounded accepted work collapses latency for every caller", "rejected_overload_rate", ["token-bucket", "concurrency-cap", "retry-after"], "patterns"),
  topic("Timeouts, Retries, and Circuit Breakers", "Allocate a request deadline and retry only bounded, safe operations with jitter.", "service-dependency", "layered retries multiply traffic during dependency failure", "retry_amplification", ["deadline-budget", "jittered-retry", "circuit-breaker"], "patterns"),
  topic("Tracing, SLIs, and SLOs", "Measure user outcomes and connect error-budget signals to traces and owned actions.", "journey-sli-trace", "healthy infrastructure metrics hide failed user workflows", "error_budget_burn", ["user-sli", "burn-rate", "trace-link"], "sre"),
  topic("Safe Releases and Schema Change", "Promote one artifact while application and schema remain compatible throughout rollout.", "pipeline-app-schema", "new code requires a column before every instance and migration are ready", "rollback_success_rate", ["expand-contract", "canary", "rollback-plan"], "sre"),
  topic("Incident Response", "Use roles, a timeline, hypotheses, mitigations, and follow-up ownership during an incident.", "signal-incident-command", "responders make broad uncoordinated changes without preserving evidence", "time_to_mitigate", ["incident-commander", "decision-log", "bounded-mitigation"], "sre"),
  topic("Reliable Service Capstone", "Diagnose and stabilize an overloaded asynchronous service through evidence and safe change.", "edge-service-queue-database", "retry amplification exhausts the pool and grows the queue", "successful_journey_rate", ["admission-control", "retry-budget", "slo-verification"], "sre"),
];

const EXPERT: TopicSpec[] = [
  topic("Distributed Systems Trade-offs", "State which guarantees are required when latency, availability, and coordination conflict.", "client-replicated-system", "the design promises every desirable property without a failure model", "contract_violation_rate", ["failure-model", "explicit-guarantee", "degraded-mode"], "patterns"),
  topic("Consistency Models", "Choose linearizable, causal, session, or eventual behavior per operation and user expectation.", "operation-replicas", "eventual consistency is applied to a uniqueness invariant", "stale_read_window", ["operation-contract", "read-your-writes", "conflict-policy"], "patterns"),
  topic("Partitioning and Sharding", "Select a stable partition key, rebalance strategy, and hot-key control from access patterns.", "router-shards", "one celebrity tenant concentrates load on a single shard", "hottest_shard_ratio", ["cardinality-key", "virtual-shard", "hot-key-plan"], "patterns"),
  topic("Replication and Failover", "Define replication lag, promotion authority, fencing, and client recovery behavior.", "primary-replicas-clients", "two writable primaries accept conflicting state after a partition", "replication_lag_seconds", ["quorum-policy", "fencing-token", "failover-drill"], "patterns"),
  topic("Distributed Data Capstone", "Design a partitioned ledger with explicit consistency, replication, and regional recovery.", "ledger-router-replicas", "failover accepts stale writes and violates balance invariants", "ledger_divergence_count", ["strong-write-path", "fenced-failover", "reconciliation"], "patterns"),
  topic("Service Boundaries", "Split by business capability, data ownership, and change cadence rather than technical layers.", "capability-service-contract", "a shared database turns separate deployments into one coupled release", "cross_service_table_writes", ["business-capability", "owned-data", "contract-test"], "ddd"),
  topic("Event-Driven Architecture", "Publish meaningful facts with schemas, ordering scope, replay policy, and ownership.", "producer-event-consumers", "events expose internal tables and become remote procedure calls", "schema_break_rate", ["domain-event", "schema-version", "replay-policy"], "patterns"),
  topic("API Gateway and BFF", "Keep edge policy narrow while tailoring client composition without centralizing domain logic.", "clients-edge-services", "the gateway becomes a shared monolith that owns every business workflow", "gateway_change_frequency", ["edge-policy", "client-bff", "domain-in-service"], "patterns"),
  topic("Service Discovery and Routing", "Resolve healthy instances with bounded staleness, locality, and tested failure behavior.", "caller-discovery-instance", "stale endpoints receive traffic after health changes", "failed_route_rate", ["health-aware", "locality-policy", "outlier-ejection"], "patterns"),
  topic("Service Platform Capstone", "Design independently owned services with enforceable contracts, routing, and event governance.", "edge-services-event-bus", "hidden data and gateway coupling require coordinated releases", "independent_deploy_rate", ["owned-contract", "routing-policy", "event-governance"], "ddd"),
  topic("Capacity Modeling", "Translate arrival rate, service time, concurrency, and headroom into a testable capacity envelope.", "demand-queue-workers", "average traffic sizing ignores bursts and dependency saturation", "capacity_headroom", ["arrival-model", "saturation-test", "headroom-policy"], "sre"),
  topic("Multi-region Architecture", "Choose traffic, data, recovery, and consistency behavior for each regional failure mode.", "global-edge-regions", "active-active routing is claimed while the data layer has one regional writer", "regional_recovery_minutes", ["traffic-policy", "data-topology", "regional-drill"], "patterns"),
  topic("Backpressure and Admission Control", "Propagate overload upstream and prioritize bounded work before queues become outages.", "edge-service-dependency", "every layer buffers until memory and latency collapse", "inflight_request_count", ["bounded-queue", "priority-class", "load-shed"], "sre"),
  topic("Privacy, Tenancy, and Data Boundaries", "Enforce tenant context, purpose limits, retention, and deletion across every data path.", "identity-tenant-data", "a cache or background job loses tenant context", "cross_tenant_access_attempts", ["tenant-scope", "retention-policy", "deletion-audit"], "owasp"),
  topic("Global System Capstone", "Design a multi-region SaaS control plane with bounded capacity and tenant-safe degradation.", "global-edge-control-data", "regional failover overloads the survivor and crosses tenant boundaries", "tenant_journey_availability", ["capacity-reservation", "tenant-isolation", "degraded-mode"], "sre"),
  topic("Architecture Decision Records", "Capture context, forces, decision, consequences, and review triggers close to the system.", "decision-code-operations", "the chosen architecture survives after its assumptions have changed", "stale_decision_count", ["context-forces", "consequences", "review-trigger"], "ddd"),
  topic("Evolutionary Architecture", "Define fitness functions that continuously protect important qualities while structure changes.", "architecture-ci-runtime", "diagrams drift while coupling and latency regress unnoticed", "fitness_function_failures", ["dependency-test", "contract-test", "runtime-objective"], "ddd"),
  topic("Platform Contracts and Golden Paths", "Offer a paved path with versioned interfaces, escape hatches, ownership, and measured adoption.", "teams-platform-runtime", "a mandatory template freezes teams without reducing cognitive load", "golden_path_adoption", ["versioned-interface", "supported-default", "escape-review"], "sre"),
  topic("Cost and Performance Architecture", "Connect workload units to latency, capacity, and cost before choosing an optimization.", "request-capacity-cost", "resource cuts lower spend while violating the user objective", "cost_per_successful_journey", ["unit-cost", "performance-objective", "demand-scenario"], "sre"),
  topic("Chaos Experiments and Game Days", "Test a measurable resilience hypothesis with containment, abort conditions, and owned learning.", "hypothesis-fault-response", "an uncontrolled failure creates risk without producing reliable evidence", "hypothesis_pass_rate", ["blast-radius", "abort-threshold", "follow-up-owner"], "sre"),
  topic("Architecture Review Capstone", "Defend and troubleshoot a complete system through trade-offs, evidence, incidents, and evolution plans.", "users-platform-data-operations", "a polished diagram omits ownership, failure behavior, and verification", "verified_architecture_risks", ["decision-record", "incident-simulation", "fitness-functions"], "sre"),
];

const byPace: Record<BackendPaceId, TopicSpec[]> = { beginner: BEGINNER, intermediate: INTERMEDIATE, expert: EXPERT };

function buildLesson(spec: TopicSpec, id: number, paceId: BackendPaceId): CloudLesson {
  const timeout = 250 + ((id + (paceId === "expert" ? 2 : paceId === "intermediate" ? 1 : 0)) % 5) * 150;
  const retryLimit = spec.failure.includes("retry") || spec.title.includes("Queue") || spec.title.includes("Outbox") ? 2 : 1;
  const solution: CloudPlan = {
    boundary: spec.boundary,
    failure_mode: spec.failure,
    timeout_ms: timeout,
    retry_limit: retryLimit,
    idempotent: true,
    safeguards: [...spec.controls],
  };
  const starter: CloudPlan = {
    boundary: "implicit",
    failure_mode: "none-documented",
    timeout_ms: 10_000,
    retry_limit: 8,
    idempotent: false,
    safeguards: [spec.controls[0]],
  };
  return {
    id,
    title: spec.title,
    minutes: id % 5 === 0 || id === 21 ? 32 : paceId === "expert" ? 24 : paceId === "intermediate" ? 21 : 18,
    objective: spec.goal,
    story: `The ${spec.boundary} relay is producing ${spec.metric} evidence, but its failure contract is incomplete. Make the boundary, risk, and recovery behavior explicit before Byte restores traffic.`,
    concepts: [
      { title: "Name the contract", body: `${spec.goal} Treat ${spec.boundary} as a real ownership boundary: define inputs, outputs, deadlines, allowed failures, and the party responsible for recovery.` },
      { title: "Design for the failure", body: `The primary scenario is ${spec.failure}. Use ${spec.controls.join(", ")} as independent controls; one passing control never proves the whole user journey is safe.` },
      { title: "Verify with evidence", body: `Measure ${spec.metric}, preserve a correlation path, and compare normal, degraded, and recovery behavior. A design claim becomes credible only when an observable test can falsify it.` },
    ],
    example: JSON.stringify(solution, null, 2),
    exampleNote: `This review contract gives ${spec.boundary} a bounded ${timeout} ms deadline, at most ${retryLimit} retry${retryLimit === 1 ? "" : "s"}, stable operation identity, and three topic-specific safeguards.`,
    mistake: `Do not treat “${spec.failure}” as an implementation detail. If the architecture does not name the failure, callers invent incompatible timeout, retry, and recovery behavior.`,
    mission: `Repair the ${spec.boundary} contract, investigate the ${spec.metric} evidence, and statically review a realistic backend artifact.`,
    fields: [
      field("boundary", "string", `Exact ownership path for this lesson: ${spec.boundary}.`),
      field("failure_mode", "string", `The scenario the design must handle: ${spec.failure}.`),
      field("timeout_ms", "number", `A bounded ${timeout} ms deadline for the simulated operation.`),
      field("retry_limit", "number", `At most ${retryLimit} controlled retry${retryLimit === 1 ? "" : "s"}; never multiply retries across layers.`),
      field("idempotent", "boolean", "Whether the operation can safely observe the same request or message again."),
      field("safeguards", "strings", `The three required controls: ${spec.controls.join(", ")}.`),
    ],
    starter,
    solution,
    checks: [
      check("Boundary is explicit", `Set boundary to ${spec.boundary}.`, (plan) => plan.boundary === spec.boundary),
      check("Failure mode is documented", `Model the exact scenario: ${spec.failure}.`, (plan) => plan.failure_mode === spec.failure),
      check("Time and retry budget is bounded", `Use ${timeout} ms and no more than ${retryLimit} retries.`, (plan) => plan.timeout_ms === timeout && typeof plan.retry_limit === "number" && plan.retry_limit >= 0 && plan.retry_limit <= retryLimit),
      check("Repeat handling is safe", "Enable stable idempotent processing for retries, replays, and uncertain outcomes.", (plan) => plan.idempotent === true),
      check("Safeguards match the design", `Use exactly ${spec.controls.join(", ")}.`, (plan) => exactSet(plan.safeguards, spec.controls)),
    ],
    observations: (plan) => [
      `Boundary: ${String(plan.boundary)} · expected ${spec.boundary}.`,
      `Failure model: ${String(plan.failure_mode)}.`,
      `Deadline and retries: ${String(plan.timeout_ms)} ms / ${String(plan.retry_limit)}.`,
      `Primary signal: ${spec.metric}; idempotent=${String(plan.idempotent)}.`,
      `Safeguards: ${Array.isArray(plan.safeguards) ? plan.safeguards.join(" → ") : "not configured"}.`,
    ],
    source: SOURCES[spec.source],
  };
}

export const BACKEND_CURRICULA: Record<BackendPaceId, CloudLesson[]> = {
  beginner: BEGINNER.map((spec, index) => buildLesson(spec, index + 1, "beginner")),
  intermediate: INTERMEDIATE.map((spec, index) => buildLesson(spec, index + 1, "intermediate")),
  expert: EXPERT.map((spec, index) => buildLesson(spec, index + 1, "expert")),
};

export function getBackendLessons(paceId: BackendPaceId) {
  return BACKEND_CURRICULA[paceId];
}

export function getBackendLesson(paceId: BackendPaceId, id: number) {
  return getBackendLessons(paceId).find((lesson) => lesson.id === id);
}
