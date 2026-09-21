import { check, exactSet, field, type CloudLesson, type CloudPlan } from "../cloud/model";
import { getDataEnrichment } from "./enrichment";
import type { DataPaceId } from "./track";

type SourceKey = "fundamentals" | "sql" | "parquet" | "warehouse" | "orchestration" | "spark" | "streaming" | "governance" | "reliability";
type TopicSpec = { title: string; goal: string; boundary: string; failure: string; signal: string; controls: [string, string, string]; source: SourceKey };
const SOURCES: Record<SourceKey, { label: string; url: string }> = {
  fundamentals: { label: "Google Cloud data engineering fundamentals", url: "https://cloud.google.com/learn/what-is-data-engineering" },
  sql: { label: "PostgreSQL data definition documentation", url: "https://www.postgresql.org/docs/current/ddl.html" },
  parquet: { label: "Apache Parquet documentation", url: "https://parquet.apache.org/docs/" },
  warehouse: { label: "Kimball dimensional modeling techniques", url: "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/" },
  orchestration: { label: "Apache Airflow core concepts", url: "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/index.html" },
  spark: { label: "Apache Spark SQL performance tuning", url: "https://spark.apache.org/docs/latest/sql-performance-tuning.html" },
  streaming: { label: "Apache Kafka design documentation", url: "https://kafka.apache.org/documentation/#design" },
  governance: { label: "NIST Privacy Framework", url: "https://www.nist.gov/privacy-framework" },
  reliability: { label: "Google SRE workbook", url: "https://sre.google/workbook/table-of-contents/" },
};
const t = (title: string, goal: string, boundary: string, failure: string, signal: string, controls: [string, string, string], source: SourceKey): TopicSpec => ({ title, goal, boundary, failure, signal, controls, source });

const BEGINNER: TopicSpec[] = [
  t("How Data Systems Work", "Trace data from a source through ingestion, storage, transformation, and consumption.", "source-to-consumer", "ownership is unclear when a record changes between stages", "reconciled_record_rate", ["source-contract", "stage-lineage", "consumer-check"], "fundamentals"),
  t("Structured, Semi-structured, and Unstructured Data", "Choose handling strategies from data shape instead of file extension alone.", "payload-to-schema", "nested or free-form fields are flattened without an explicit rule", "classified_payload_rate", ["shape-profile", "schema-boundary", "raw-retention"], "fundamentals"),
  t("CSV, JSON, and Parquet", "Select row, document, or columnar formats from exchange and analytical access patterns.", "file-to-reader", "a format choice creates ambiguous parsing or expensive scans", "valid_read_rate", ["explicit-dialect", "schema-annotation", "column-pruning"], "parquet"),
  t("Data Types, Nulls, and Encoding", "Preserve meaning across types, missing values, time zones, and character encodings.", "bytes-to-values", "invalid bytes and sentinel values become plausible business data", "typed_record_rate", ["utf8-check", "null-policy", "type-cast-audit"], "fundamentals"),
  t("Project: Repair a File-Ingestion Pipeline", "Repair a file ingestion flow and prove row, schema, and quarantine outcomes.", "landing-to-staging", "bad rows either stop the whole batch or disappear silently", "reconciled_batch_rate", ["manifest-count", "quarantine-path", "schema-test"], "fundamentals"),
  t("Schemas and Constraints", "Translate data expectations into named types, required fields, uniqueness, and checks.", "record-to-table", "invalid records pass because validation exists only in one transform", "constraint_pass_rate", ["required-field", "domain-check", "named-constraint"], "sql"),
  t("Primary and Foreign Keys", "Use keys to identify records and enforce valid relationships.", "entity-to-relationship", "duplicates and orphaned rows make aggregates contradictory", "referential_integrity_rate", ["stable-primary-key", "foreign-key", "orphan-test"], "sql"),
  t("Normalization and Denormalization", "Balance update correctness against read simplicity from measured workloads.", "operational-to-analytical-model", "copied attributes drift across tables", "attribute_consistency_rate", ["normalized-source", "documented-duplication", "refresh-rule"], "sql"),
  t("Fact and Dimension Tables", "Declare fact grain and connect measures to conformed descriptive dimensions.", "event-to-star-schema", "mixed grains double-count measures", "grain_violation_count", ["grain-statement", "surrogate-key", "measure-test"], "warehouse"),
  t("Project: Model an E-commerce Dataset", "Model orders, items, customers, and products for trustworthy business questions.", "commerce-events-to-marts", "returns and repeated order lines inflate revenue", "reconciled_revenue", ["order-item-grain", "return-treatment", "dimension-history"], "warehouse"),
  t("ETL versus ELT", "Choose where transformation runs based on governance, cost, latency, and engine capabilities.", "source-to-transform-engine", "raw sensitive data lands where policy forbids it", "policy_compliant_loads", ["landing-policy", "transform-location", "audit-boundary"], "fundamentals"),
  t("Extracting Data Safely", "Read changing sources with bounded windows, pagination, snapshots, and rate limits.", "source-api-to-landing", "page boundaries skip or repeat records during concurrent updates", "extraction_reconciliation", ["stable-cursor", "bounded-window", "source-count"], "fundamentals"),
  t("Cleaning and Transforming Records", "Make deterministic transformations that preserve raw evidence and reject ambiguous fixes.", "raw-to-curated", "automatic cleaning changes values without traceable rules", "accepted_record_rate", ["pure-transform", "reject-reason", "raw-link"], "fundamentals"),
  t("Idempotent Loads and Deduplication", "Design retries and reruns that converge on one correct target state.", "batch-to-target", "a retry appends duplicate business events", "duplicate_key_count", ["batch-id", "merge-key", "replay-test"], "sql"),
  t("Project: Build a Repeatable Batch Pipeline", "Connect extraction, transformation, loading, and replay into one verifiable batch.", "source-to-curated-batch", "partial success cannot be safely resumed", "repeatable_batch_rate", ["immutable-input", "atomic-publish", "run-manifest"], "reliability"),
  t("Data Warehouses and Data Lakes", "Choose storage layers by access, governance, and workload rather than labels.", "landing-to-serving", "raw and curated data share one undefined trust level", "classified_dataset_rate", ["layer-contract", "catalog-entry", "serving-boundary"], "warehouse"),
  t("Partitioning and File Organization", "Partition on useful pruning dimensions while controlling cardinality and file size.", "dataset-to-storage-layout", "high-cardinality partitions create thousands of tiny files", "bytes_scanned_per_query", ["partition-key", "target-file-size", "pruning-test"], "parquet"),
  t("Scheduling and Dependencies", "Express data availability dependencies and time windows explicitly.", "upstream-to-downstream-run", "a downstream job runs before its complete input window arrives", "on_time_complete_runs", ["data-dependency", "window-boundary", "late-input-policy"], "orchestration"),
  t("Data Quality Checks", "Test freshness, volume, schema, uniqueness, validity, and relationships at useful boundaries.", "dataset-to-quality-gate", "one row-count check gives false confidence", "quality_rule_coverage", ["freshness-rule", "uniqueness-rule", "relationship-rule"], "reliability"),
  t("Pipeline Logging and Failure Recovery", "Record run identity, stage outcomes, counts, errors, and safe recovery actions.", "run-to-operator", "logs cannot connect a failed record to its batch and retry", "mean_recovery_minutes", ["correlation-id", "stage-metrics", "resume-point"], "reliability"),
  t("Capstone: Raw Files to Analytics Warehouse", "Deliver a governed, replay-safe path from raw files to tested analytical tables.", "raw-zone-to-warehouse", "the happy path passes but a late corrupt file breaks trust", "trusted_dataset_slo", ["lineage-manifest", "quality-gate", "recovery-drill"], "warehouse"),
];

const INTERMEDIATE: TopicSpec[] = [
  t("Directed Acyclic Graphs", "Model work as acyclic tasks with explicit data dependencies.", "task-graph-to-run", "hidden file dependencies create cycles or race conditions", "deterministic_run_rate", ["acyclic-graph", "declared-edge", "task-contract"], "orchestration"),
  t("Scheduling and Time Windows", "Separate logical data intervals from wall-clock trigger time.", "schedule-to-data-interval", "a run processes the wrong day around midnight or daylight changes", "window_accuracy_rate", ["logical-date", "closed-interval", "timezone-policy"], "orchestration"),
  t("Parameters and Environment Configuration", "Keep runtime parameters typed, bounded, and separate from code and secrets.", "configuration-to-task", "an environment override silently changes a production dataset", "validated_config_rate", ["typed-parameter", "environment-scope", "secret-reference"], "orchestration"),
  t("Retries, Timeouts, and Backfills", "Bound retries and backfills while preventing duplicate side effects.", "failed-task-to-recovery", "layered retries multiply writes across a large backfill", "safe_retry_rate", ["idempotent-task", "retry-budget", "backfill-limit"], "reliability"),
  t("Project: Repair a Failed Workflow DAG", "Diagnose dependency, window, and retry failures in a multi-stage workflow.", "dag-incident-to-recovery", "rerunning the whole graph duplicates published partitions", "recovered_interval_count", ["failed-task-scope", "partition-commit", "backfill-proof"], "orchestration"),
  t("Object Storage Architecture", "Design immutable landing, curated, and serving prefixes with ownership and lifecycle.", "object-key-to-dataset", "writers overwrite objects that readers still reference", "immutable_object_rate", ["immutable-key", "layer-prefix", "retention-policy"], "parquet"),
  t("Columnar Storage and Compression", "Choose row groups, encodings, and compression from query and value patterns.", "records-to-columnar-file", "oversized row groups block pruning and inflate memory", "scan_efficiency", ["row-group-size", "statistics", "compression-codec"], "parquet"),
  t("Partition Design and Pruning", "Make partition filters align with common bounded queries.", "query-to-partition-layout", "queries scan every partition despite a selective time filter", "partition_pruning_rate", ["predicate-alignment", "bounded-cardinality", "scan-plan-check"], "parquet"),
  t("Small-file Problems and Compaction", "Compact safely without losing records or exposing partial output.", "small-files-to-compacted-set", "readers see both old and new files and double-count data", "healthy_file_ratio", ["snapshot-publish", "target-size", "obsolete-cleanup"], "parquet"),
  t("Project: Optimize a Partitioned Data Lake", "Reduce scan cost and file overhead while preserving snapshot correctness.", "lake-layout-to-query", "an optimization lowers bytes but breaks incremental writers", "cost_per_successful_query", ["partition-evidence", "compaction-plan", "reader-compatibility"], "parquet"),
  t("Distributed Execution Fundamentals", "Reason about stages, partitions, locality, memory, and parallelism.", "logical-plan-to-workers", "one partition dominates a stage while workers sit idle", "stage_balance_ratio", ["partition-profile", "bounded-parallelism", "spill-monitor"], "spark"),
  t("Transformations, Actions, and Lazy Evaluation", "Predict when work executes and avoid accidental repeated computation.", "transformation-plan-to-action", "multiple actions recompute an expensive lineage", "recomputed_stage_count", ["plan-inspection", "intentional-cache", "single-publish"], "spark"),
  t("Shuffles and Data Movement", "Identify wide dependencies and control network, serialization, and spill cost.", "partition-to-partition-exchange", "an unnecessary repartition moves the full dataset", "shuffle_bytes", ["partition-preservation", "exchange-plan", "spill-threshold"], "spark"),
  t("Join Strategies and Data Skew", "Choose broadcast, sort-merge, or partitioned joins from sizes and key distribution.", "left-and-right-datasets", "a hot key overloads one executor and delays the job", "p95_partition_duration", ["size-statistics", "skew-profile", "join-plan"], "spark"),
  t("Project: Diagnose a Slow Distributed Job", "Use plan, stage, and partition evidence to repair a slow job.", "execution-plan-to-runtime", "tuning guesses add resources without removing the bottleneck", "runtime_per_input_gb", ["plan-diff", "skew-metric", "before-after-run"], "spark"),
  t("Incremental Loading and Watermarks", "Process only new or changed records without missing late arrivals.", "source-change-to-target-window", "a timestamp watermark skips records committed late", "incremental_reconciliation", ["durable-watermark", "lookback-window", "dedupe-key"], "reliability"),
  t("Change Data Capture", "Apply inserts, updates, deletes, ordering, and snapshots from a change log.", "source-log-to-target", "out-of-order updates resurrect deleted records", "cdc_apply_accuracy", ["source-position", "operation-order", "delete-policy"], "streaming"),
  t("Data Contracts and Schema Evolution", "Version producer-consumer expectations and classify compatible changes.", "producer-schema-to-consumer", "a renamed field becomes null without failing the pipeline", "contract_compatibility_rate", ["versioned-schema", "compatibility-check", "consumer-owner"], "governance"),
  t("Testing, Lineage, and Observability", "Combine code tests, data tests, lineage, metrics, and alerts into diagnosis.", "change-to-data-outcome", "an alert reports bad data but not the producing run or downstream impact", "time_to_lineage_root_cause", ["test-pyramid", "run-lineage", "actionable-alert"], "reliability"),
  t("Cost and Performance Optimization", "Optimize total useful work using workload, scan, compute, storage, and SLA evidence.", "workload-to-cost", "a cheaper job misses freshness or shifts cost downstream", "cost_per_fresh_dataset", ["unit-cost", "slo-guardrail", "before-after-baseline"], "reliability"),
  t("Capstone: Production Incremental Analytics Platform", "Ship an observable incremental platform with contracts, lineage, quality, and cost controls.", "source-changes-to-analytics", "backfill and live ingestion produce conflicting versions", "platform_reliability_slo", ["incremental-protocol", "contract-gate", "operational-runbook"], "reliability"),
];
const EXPERT: TopicSpec[] = [
  t("Event-driven Data Architecture", "Define durable events, ownership, delivery semantics, and downstream independence.", "domain-event-to-consumers", "an event is an undocumented database row disguised as integration", "event_contract_adoption", ["event-owner", "immutable-fact", "consumer-decoupling"], "streaming"),
  t("Topics, Partitions, and Ordering", "Partition for throughput while preserving only the ordering guarantees the domain needs.", "event-key-to-partition", "a changing key breaks per-entity ordering", "ordering_violation_count", ["stable-key", "partition-count-plan", "order-scope"], "streaming"),
  t("Producers, Consumers, and Consumer Groups", "Coordinate delivery, offsets, rebalances, and idempotent processing.", "producer-to-consumer-group", "a rebalance repeats side effects after processing but before commit", "duplicate_effect_rate", ["idempotent-sink", "offset-ownership", "rebalance-test"], "streaming"),
  t("Event Time, Watermarks, and Late Data", "Define completeness from event time and an explicit lateness policy.", "event-time-to-window", "late records are silently dropped after a short watermark", "late_record_accuracy", ["event-timestamp", "lateness-budget", "correction-path"], "streaming"),
  t("Project: Recover a Broken Event Stream", "Restore a stream with ordering, duplicates, late data, and replay evidence.", "event-log-to-state", "replay repairs one consumer but corrupts another non-idempotent sink", "replay_success_rate", ["bounded-replay", "sink-idempotency", "state-reconciliation"], "streaming"),
  t("Lakehouse Architecture", "Combine object storage with table metadata, transactions, and multiple compute engines.", "objects-to-table-snapshot", "engines read raw files without a consistent snapshot", "snapshot_read_rate", ["table-protocol", "catalog-pointer", "engine-compatibility"], "parquet"),
  t("Transactional Data-lake Tables", "Guarantee atomic commits, isolation, concurrency, and snapshot recovery.", "writers-to-table-log", "two writers publish conflicting manifests", "commit_conflict_rate", ["optimistic-concurrency", "atomic-metadata", "snapshot-rollback"], "parquet"),
  t("Schema Evolution and Compatibility", "Evolve columns and types without corrupting historical reads or consumers.", "schema-version-to-readers", "position-based readers swap renamed columns", "compatible_read_rate", ["stable-field-id", "evolution-policy", "mixed-version-test"], "governance"),
  t("Compaction, Clustering, and Metadata", "Control file layout and metadata growth without blocking writers.", "table-maintenance-to-readers", "maintenance rewrites collide with ingestion and expire active snapshots", "maintenance_success_rate", ["snapshot-aware-rewrite", "clustering-signal", "safe-retention"], "parquet"),
  t("Project: Design a Reliable Lakehouse Table", "Design commit, evolution, layout, maintenance, and recovery for one critical table.", "events-to-lakehouse-table", "optimization and governance rules conflict across engines", "reliable_table_slo", ["transaction-protocol", "compatibility-suite", "maintenance-runbook"], "parquet"),
  t("Data Classification and PII", "Classify fields by sensitivity, purpose, residency, and retention.", "field-to-policy", "sensitive attributes copy into unrestricted derived datasets", "classified_sensitive_field_rate", ["field-classification", "purpose-tag", "retention-rule"], "governance"),
  t("Encryption and Access Boundaries", "Use layered encryption, least privilege, separation, and auditable access.", "identity-to-dataset", "a shared service role gives every pipeline every dataset", "least_privilege_coverage", ["workload-identity", "dataset-scope", "access-audit"], "governance"),
  t("Catalogs, Ownership, and Lineage", "Make datasets discoverable with accountable owners and usable column-level lineage.", "dataset-to-catalog", "lineage graphs have edges but no owner or operational context", "owned_dataset_rate", ["named-owner", "column-lineage", "run-link"], "governance"),
  t("Data Quality Frameworks", "Standardize rule types, severity, ownership, response, and trend analysis.", "dataset-to-trust-score", "hundreds of checks alert without business priority or response", "actionable_quality_alert_rate", ["rule-tier", "owner-routing", "trend-baseline"], "reliability"),
  t("Project: Investigate a Data-trust Incident", "Trace a bad executive metric through lineage, ownership, quality, and access evidence.", "metric-to-source", "teams patch dashboards while the producing dataset remains wrong", "root_cause_minutes", ["lineage-trace", "impact-scope", "corrective-control"], "governance"),
  t("Multi-tenant Data Platforms", "Isolate teams, workloads, metadata, quotas, and failures on shared infrastructure.", "tenant-to-platform", "one tenant's backfill starves critical production workloads", "tenant_slo_isolation", ["identity-boundary", "resource-quota", "failure-domain"], "reliability"),
  t("Self-service Pipelines and Golden Paths", "Offer paved workflows with safe defaults, escape hatches, and ownership.", "team-intent-to-pipeline", "a template hides operational responsibilities until an incident", "golden_path_success_rate", ["validated-template", "owner-contract", "escape-review"], "reliability"),
  t("Data SLOs and Platform Observability", "Define freshness, completeness, correctness, and availability from consumer outcomes.", "pipeline-signals-to-slo", "green task status hides stale or incorrect data", "consumer_slo_attainment", ["consumer-indicator", "error-budget", "dependency-map"], "reliability"),
  t("Disaster Recovery and Replay", "Plan metadata, data, code, checkpoints, and replay across failure domains.", "regional-failure-to-recovery", "backups exist but cannot reproduce processing positions", "recovery_point_and_time", ["metadata-backup", "offset-checkpoint", "replay-drill"], "reliability"),
  t("Capacity and Cost Governance", "Allocate shared capacity with forecasts, quotas, unit economics, and exceptions.", "demand-to-capacity", "reserved capacity sits idle while burst jobs miss deadlines", "cost_per_slo_unit", ["workload-forecast", "quota-policy", "showback"], "reliability"),
  t("Capstone: Governed Real-time Data Platform", "Defend a multi-tenant streaming and lakehouse platform across trust, SLO, recovery, and cost.", "producers-to-governed-products", "a regional incident exposes weak replay, ownership, and tenancy boundaries", "governed_platform_slo", ["contracted-ingress", "tenant-isolation", "recovery-game-day"], "reliability"),
];

function exampleFor(spec: TopicSpec, paceId: DataPaceId) {
  const enrichment = getDataEnrichment(spec.title);
  return `# ${spec.title} · ${paceId} case\ncase_type: ${enrichment.label}\nscenario: ${enrichment.scenario}\nevidence: ${enrichment.evidence}\nboundary: ${spec.boundary}\ndecision: ${enrichment.decision}\nproof: ${enrichment.proof}`;
}

function buildLesson(spec: TopicSpec, id: number, paceId: DataPaceId, all: TopicSpec[]): CloudLesson {
  const freshness = paceId === "expert" ? 5 + (id % 3) * 5 : paceId === "intermediate" ? 30 + (id % 3) * 15 : 120 + (id % 3) * 60;
  const solution: CloudPlan = { boundary: spec.boundary, failure_mode: spec.failure, freshness_minutes: freshness, replay_safe: true, quarantine_enabled: true, quality_checks: [...spec.controls] };
  const starter: CloudPlan = { boundary: "implicit", failure_mode: "happy-path-only", freshness_minutes: 1440, replay_safe: false, quarantine_enabled: false, quality_checks: [spec.controls[0]] };
  const isProject = [5, 10, 15, 21].includes(id);
  const enrichment = getDataEnrichment(spec.title);
  const start = id === 21 ? 16 : id - 4;
  const world = all.slice(start - 1, id);
  return {
    id, title: spec.title, minutes: isProject ? 34 : paceId === "expert" ? 25 : paceId === "intermediate" ? 22 : 19,
    objective: spec.goal,
    story: `The ${spec.boundary} boundary is missing a trustworthy ${spec.signal} signal. Trace the data before Byte restores this section of the Data Grid.`,
    concepts: [
      { title: "Model the data boundary", body: `${spec.goal} In this case, ${enrichment.scenario} Name the producer, consumer, record grain, time semantics, and accountable owner before selecting a tool.` },
      { title: "Read the evidence", body: `${enrichment.evidence}. This evidence narrows the failure to ${spec.boundary}; it does not yet prove why ${spec.failure}.` },
      { title: "Make the engineering decision", body: `${enrichment.decision} Keep ${spec.controls.join(", ")} independently observable so a repair can be reviewed, replayed, and reversed.` },
      { title: "Prove the outcome", body: `${enrichment.proof} Use ${spec.signal} as the leading signal, then reconcile input, accepted, rejected, late, and published records at consumer-visible boundaries.` },
    ],
    exampleLabel: enrichment.label, example: exampleFor(spec, paceId),
    exampleNote: `The decision follows the observed ${enrichment.evidence} signal and defines a falsifiable proof: ${enrichment.proof} This is an educational review, not a deployable pipeline.`,
    mistake: `Treating a green task or a familiar tool as proof of correctness while ${spec.failure}. The lesson requires evidence at the actual ${spec.boundary} boundary.`,
    practice: { prompt: `${enrichment.scenario} Using only “${enrichment.evidence}”, state the leading hypothesis, one competing hypothesis, and the smallest safe test that separates them.`, deliverable: `Write a ${spec.title.toLowerCase()} decision record containing grain, owner, interval, reconciliation equation, rejected-record policy, replay boundary, and one rejected alternative.`, success: enrichment.proof },
    projectStages: isProject ? [
      { title: `Profile ${world[0].title}`, brief: `Capture grain, ownership, counts, and a reproducible failure at ${world[0].boundary}.`, evidence: `a source-to-stage reconciliation tied to ${world[0].signal}` },
      { title: `Connect ${world[1].title} and ${world[2].title}`, brief: "Build the smallest vertical slice that preserves both contracts, including rejected and late records.", evidence: "one accepted case, one rejected case, and one compatibility decision" },
      { title: `Stress ${world[3].title}`, brief: "Simulate partial output, retry, backfill, and consumer reads without hiding intermediate state.", evidence: "before/after counts and a replay trace" },
      { title: `Defend ${spec.title}`, brief: "Combine the world's design, incident evidence, artifact repair, quality gates, and rollback or replay rule.", evidence: "three decisions, one investigation, two static repairs, and an operator runbook" },
    ] : undefined,
    mission: `Repair the ${spec.boundary} data contract, justify the tradeoff with ${spec.signal}, and complete both the topic-aligned artifact review and pipeline simulation.`,
    fields: [
      field("boundary", "string", `Exact data boundary: ${spec.boundary}.`), field("failure_mode", "string", `Observed failure: ${spec.failure}.`),
      field("freshness_minutes", "number", `Maximum ${freshness}-minute simulated freshness objective.`), field("replay_safe", "boolean", "Whether a retry or backfill converges safely."),
      field("quarantine_enabled", "boolean", "Whether rejected records remain inspectable without entering trusted output."), field("quality_checks", "strings", `Required controls: ${spec.controls.join(", ")}.`),
    ], starter, solution,
    checks: [
      check("Boundary is explicit", `Set boundary to ${spec.boundary}.`, (plan) => plan.boundary === spec.boundary),
      check("Failure is modeled", `Use the exact scenario: ${spec.failure}.`, (plan) => plan.failure_mode === spec.failure),
      check("Freshness is bounded", `Set freshness_minutes to ${freshness}.`, (plan) => plan.freshness_minutes === freshness),
      check("Recovery preserves evidence", "Enable replay safety and quarantine.", (plan) => plan.replay_safe === true && plan.quarantine_enabled === true),
      check("Quality controls match", `Use exactly ${spec.controls.join(", ")}.`, (plan) => exactSet(plan.quality_checks, spec.controls)),
    ],
    observations: (plan) => [`Boundary: ${String(plan.boundary)}.`, `Failure: ${String(plan.failure_mode)}.`, `Freshness objective: ${String(plan.freshness_minutes)} minutes.`, `Replay-safe=${String(plan.replay_safe)} · quarantine=${String(plan.quarantine_enabled)}.`, `Quality controls: ${Array.isArray(plan.quality_checks) ? plan.quality_checks.join(" → ") : "not configured"}.`],
    source: SOURCES[spec.source],
  };
}

export const DATA_CURRICULA: Record<DataPaceId, CloudLesson[]> = {
  beginner: BEGINNER.map((spec, index) => buildLesson(spec, index + 1, "beginner", BEGINNER)),
  intermediate: INTERMEDIATE.map((spec, index) => buildLesson(spec, index + 1, "intermediate", INTERMEDIATE)),
  expert: EXPERT.map((spec, index) => buildLesson(spec, index + 1, "expert", EXPERT)),
};
export const getDataLessons = (paceId: DataPaceId) => DATA_CURRICULA[paceId];
export const getDataLesson = (paceId: DataPaceId, id: number) => getDataLessons(paceId).find((lesson) => lesson.id === id);
