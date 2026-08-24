import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });
const q = (question: string, correct: string, distractors: [string, string, string], explanation: string) => ({ question, options: [correct, ...distractors], answer: 0, explanation });

const ROUND_FIFTEEN_LESSONS: Record<string, LessonEnrichment> = {
  "python:expert:Docker": lesson(
    "A production container is a reproducible, minimal, non-root runtime artifact—not a portable virtual machine. Secure Docker engineering controls build context, dependency provenance, layer reuse, signals, filesystem permissions, health, secrets, and the exact boundary between image and environment.",
    [
      { title: "Build a deterministic artifact", body: "Pin a small trusted base by digest where policy requires it, copy dependency manifests before source, use BuildKit caches or wheel stages, and keep compilers and credentials out of the final stage." },
      { title: "Run with least privilege", body: "Create a numeric non-root user, use a read-only root filesystem where possible, write only to mounted temporary paths, drop Linux capabilities, and inject configuration and secrets at runtime." },
      { title: "Design the process contract", body: "Use exec-form commands, handle SIGTERM, expose readiness separately from liveness, declare resource limits externally, emit logs to standard streams, and produce an SBOM and vulnerability evidence." },
    ],
    [
      q("Why use a multi-stage build?", "To keep build tools and temporary artifacts out of the runtime image", ["To store secrets permanently", "To run as root", "To disable caching"], "Only the required runtime files cross into the final stage."),
      q("Where should production secrets enter?", "At runtime through a managed secret boundary", ["In an ENV layer", "Inside source control", "In image labels"], "Image history and registries are not secret stores."),
      q("Why use an exec-form CMD?", "Signals reach the application process predictably", ["It adds a shell", "It expands every variable", "It grants capabilities"], "Direct execution avoids an unnecessary shell as PID 1."),
      q("What does a non-root user reduce?", "The impact of a container escape or application compromise", ["Image size to zero", "All network risk", "The need for authorization"], "Least privilege limits what a compromised process can alter."),
    ],
  ),
  "python:expert:CI/CD": lesson(
    "CI/CD is a controlled evidence and promotion system. A trustworthy pipeline validates untrusted changes, creates one immutable artifact, signs and inventories it, moves that same artifact through environments, gates risk, and keeps a tested rollback path.",
    [
      { title: "Order feedback by cost", body: "Run formatting, lint, types, unit tests, dependency policy, and secret scanning before slower integration, migration, security, and end-to-end suites; isolate forked code from privileged credentials." },
      { title: "Build once and attest", body: "Bind source revision, dependencies, test evidence, SBOM, signature, configuration schema, and migration plan to one content-addressed artifact rather than rebuilding for each environment." },
      { title: "Release progressively", body: "Promote with approvals proportional to risk, canary a small cohort, evaluate health and business SLIs, pause automatically on regression, and roll back application and compatible schema safely." },
    ],
    [
      q("What should move from staging to production?", "The same immutable tested artifact", ["A fresh untested rebuild", "The developer working tree", "Only logs"], "Rebuilding breaks the chain between evidence and deployment."),
      q("Why restrict secrets on pull requests from forks?", "The submitted code is untrusted and could exfiltrate them", ["Forks cannot run tests", "Secrets improve lint", "It reduces image layers"], "CI executes contributor-controlled code."),
      q("What is a canary release?", "A limited production exposure measured before wider rollout", ["A local unit test", "A backup format", "A permanent feature flag"], "Small blast radius turns monitoring into a release gate."),
      q("What should a rollback plan include?", "Artifact, configuration, schema compatibility, trigger, and ownership", ["Only a redeploy command", "Only the previous tag", "No database consideration"], "Application rollback can fail when data contracts changed incompatibly."),
    ],
  ),
  "python:expert:Cloud": lesson(
    "Cloud architecture composes failure-prone managed services under identity, network, quota, cost, and regional constraints. Production readiness comes from replaceable compute, external durable state, least-privilege workload identity, bounded dependencies, capacity planning, and tested failure behavior—not from moving one server image.",
    [
      { title: "Design for replacement", body: "Keep services stateless between requests, store durable state externally, make startup automated and idempotent, drain gracefully, and assume zones, instances, and network paths can disappear." },
      { title: "Use identity as the perimeter", body: "Issue short-lived workload identities, restrict service and data actions, segment networks, encrypt in transit and at rest, rotate keys, and record auditable policy decisions." },
      { title: "Engineer elasticity and cost", body: "Scale on demand and saturation signals, cap concurrency, reserve headroom, define quotas and budgets, attribute unit cost, and test regional degradation and dependency throttling." },
    ],
    [
      q("Where should durable state live for replaceable compute?", "An external managed durable store", ["The instance filesystem only", "Process memory", "A container layer"], "Instances may be restarted or replaced without notice."),
      q("What credential should a workload prefer?", "A short-lived narrowly scoped workload identity", ["A shared permanent admin key", "A developer password", "A public token"], "Ephemeral least-privilege identity reduces leakage impact."),
      q("What can autoscaling fail to protect?", "A saturated downstream database or hard quota", ["Any HTTP endpoint", "Every log line", "DNS syntax"], "Scaling callers can amplify pressure on finite dependencies."),
      q("What does the shared-responsibility model mean?", "The provider secures underlying services while the customer secures configuration and workloads", ["The provider owns every application bug", "The customer operates all hardware", "No one manages identity"], "Managed infrastructure does not remove application and configuration duties."),
    ],
  ),
  "python:expert:Security": lesson(
    "Python security is an architecture property spanning identity, authorization, input, output, dependencies, secrets, deserialization, subprocesses, files, networks, logging, and incident response. Secure defaults and least privilege keep one bug from becoming a complete compromise.",
    [
      { title: "Model trust boundaries", body: "Identify subjects, assets, entry points, interpreters, data stores, external services, and privilege transitions; trace how attacker-controlled bytes could reach a sensitive sink." },
      { title: "Use safe primitives", body: "Parameterize SQL, encode for the output context, avoid eval and unsafe pickle or YAML, pass subprocess arguments without a shell, normalize and constrain file paths, and use constant-time secret comparisons." },
      { title: "Operate the controls", body: "Patch dependencies, generate an SBOM, scan secrets, rotate credentials, log security decisions without sensitive values, rate-limit abuse, rehearse response, and preserve forensic evidence." },
    ],
    [
      q("What is the difference between authentication and authorization?", "Authentication identifies; authorization permits a specific action on a resource", ["They are identical", "Authorization parses JSON", "Authentication encrypts databases"], "A signed-in user may still lack object-level permission."),
      q("Why avoid shell=True with untrusted input?", "Shell metacharacters can turn data into commands", ["It disables Python types", "It always runs slowly", "It removes logs"], "Direct argument arrays preserve the intended process boundary."),
      q("Is parsing untrusted pickle safe?", "No, deserialization can execute attacker-controlled code", ["Yes if the file is small", "Yes inside a web request", "Only on Linux"], "Use a constrained data format and explicit schema validation."),
      q("What does defense in depth provide?", "Independent controls that limit impact when one control fails", ["A replacement for patching", "Automatic correctness", "One global credential"], "Layered boundaries reduce single-point compromise."),
    ],
  ),
  "python:expert:Observability": lesson(
    "Observability lets operators explain user-visible behavior from logs, metrics, traces, profiles, and deployment context. Useful telemetry follows a service question, correlates work across boundaries, protects sensitive data, controls cardinality and cost, and connects alerts to owned response actions.",
    [
      { title: "Define service signals", body: "Measure request rate, errors, latency distributions, saturation, queue age, dependency health, and domain success with SLIs and SLOs that represent real user journeys." },
      { title: "Correlate structured evidence", body: "Propagate trace and request IDs, record bounded structured fields, link logs to spans and exemplars, attach release and feature versions, and distinguish expected cancellation from faults." },
      { title: "Make telemetry operable", body: "Redact and minimize sensitive data, avoid user IDs or arbitrary paths as metric labels, sample intentionally, set retention by purpose, alert on symptoms and error-budget burn, and maintain runbooks." },
    ],
    [
      q("Which metric labels are dangerous?", "Unbounded values such as raw user IDs or request paths", ["A finite status class", "A bounded region", "A known release channel"], "High cardinality increases cost and can make queries unusable."),
      q("What does a trace show?", "The causal path and timing of work across components", ["Only disk capacity", "Only source code", "A backup chain"], "Spans connect distributed operations for one request."),
      q("What should an alert target?", "A user-visible symptom or fast error-budget burn with an owner", ["Every log message", "CPU above zero", "An unowned dashboard"], "Actionable alerts reduce noise and focus response."),
      q("Why attach release version to telemetry?", "Regressions can be correlated with the exact change", ["It encrypts traces", "It removes sampling", "It creates retries"], "Operational evidence must identify behavior-affecting artifacts."),
    ],
  ),
  "python:expert:Performance": lesson(
    "Performance engineering optimizes measured user outcomes across latency percentiles, throughput, memory, CPU, I/O, contention, and cost. Representative workloads, stable experiments, profiling, and regression budgets matter more than isolated microbenchmarks or clever syntax.",
    [
      { title: "Create a workload model", body: "Capture input sizes and distributions, concurrency, warm and cold states, cache behavior, dependencies, hardware, service objectives, and a baseline before changing implementation." },
      { title: "Locate the limiting resource", body: "Use wall-time and CPU profiles, allocation snapshots, flame graphs, database plans, lock and queue telemetry, and system counters to distinguish compute, memory, I/O, and contention." },
      { title: "Verify the whole-system tradeoff", body: "Optimize algorithms and avoided work first, then batching, caching, serialization, concurrency, or native paths; remeasure tails, correctness, memory, cost, and maintainability under load." },
    ],
    [
      q("Why use p95 or p99 latency?", "Averages hide slow experiences in the tail", ["Percentiles remove outliers", "They guarantee throughput", "They replace traces"], "Users often experience contention and queueing in the tail."),
      q("What is the first optimization step?", "Measure a representative baseline and profile the bottleneck", ["Rewrite in another language", "Add threads", "Increase every cache"], "Evidence prevents optimizing code that does not limit the outcome."),
      q("Why include warmup in benchmarks?", "Compilation, caches, pools, and allocation state can change later samples", ["Warmup disables CPU", "It removes data", "It guarantees production parity"], "Cold and steady-state behavior should be measured deliberately."),
      q("What can higher concurrency reduce?", "Throughput and latency when contention or saturation grows", ["Only source size", "Type safety", "Artifact immutability"], "More workers can increase scheduling, lock, memory, and downstream pressure."),
    ],
  ),
  "sql:expert:Connection pooling": lesson(
    "Connection pooling protects PostgreSQL from session creation cost and unbounded concurrency. Pool capacity is a database-wide budget across every application replica; acquisition latency, transaction hygiene, session state, failover, and pooling mode determine whether it improves or damages reliability.",
    [
      { title: "Budget connections globally", body: "Reserve sessions for administration and maintenance, divide the remainder across services and replicas, and cap application concurrency from measured query duration and database capacity." },
      { title: "Match the pooling mode", body: "Session pooling preserves prepared and temporary state; transaction pooling improves multiplexing but requires session-state discipline; statement pooling cannot support multi-statement transactions." },
      { title: "Reset and observe", body: "Rollback abandoned transactions, reset changed settings, validate connections, enforce acquisition and statement deadlines, drain during failover, and track queue depth, wait time, utilization, churn, and errors." },
    ],
    [
      q("Why can a larger pool reduce performance?", "Too many active sessions increase memory, scheduling, lock, and I/O contention", ["Connections remove indexes", "Pooling disables transactions", "SQL becomes untyped"], "Database capacity is finite and concurrency has a saturation point."),
      q("What can transaction pooling break?", "Reliance on session-local state between transactions", ["Primary keys", "Simple committed statements", "Parameterized values"], "The next transaction may use a different server session."),
      q("What should happen to an abandoned transaction?", "Rollback before returning the connection", ["Keep it open", "Commit automatically", "Give it to another tenant"], "Leaked transactional state can contaminate the next borrower."),
      q("What metric exposes pool pressure?", "Connection acquisition wait time", ["Table name length", "WAL filename", "Column count alone"], "Waiting callers reveal that demand exceeds available sessions."),
    ],
  ),
  "sql:expert:Caching architecture": lesson(
    "Database caching spans PostgreSQL shared buffers, operating-system cache, application caches, replicas, materialized results, and edge layers. Each copy needs identity, authorization scope, freshness, invalidation, capacity, stampede control, and failure semantics tied to the source of truth.",
    [
      { title: "Place the cache deliberately", body: "Cache immutable assets at edges, reusable object or query results near applications, and expensive derived sets in maintained tables or materialized views according to access and consistency needs." },
      { title: "Specify the consistency contract", body: "Use complete tenant-aware keys, versioned values, write-through or invalidation events, bounded TTLs, and monotonic or read-your-writes paths where product correctness requires them." },
      { title: "Protect origin and cache", body: "Coalesce misses, jitter expiry, cap value and key cardinality, reject poisoned entries, degrade when cache is unavailable, and monitor hit usefulness, staleness, eviction, load time, and origin amplification." },
    ],
    [
      q("What must a multitenant cache key include?", "Tenant and every authorization or query dimension affecting the result", ["Only row count", "Only current time", "A shared global prefix"], "Incomplete keys can leak data across scopes."),
      q("What is request coalescing?", "One loader refreshes an item while concurrent misses wait for its result", ["Deleting all entries", "Duplicating every request", "Disabling expiry"], "It prevents a stampede on the database."),
      q("What can a high hit rate hide?", "Frequently served stale or low-value results", ["Every query plan", "Connection leaks", "Backup gaps only"], "Cache effectiveness needs correctness and latency context."),
      q("When are versioned keys useful?", "When a data or schema version can make old entries unreachable atomically", ["To avoid capacity limits", "To grant authorization", "To replace encryption"], "Changing a namespace can provide safe broad invalidation."),
    ],
  ),
  "sql:expert:High availability": lesson(
    "High availability preserves database service through defined failures within explicit RPO and RTO. Replication alone is insufficient: safe HA requires detection, quorum assumptions, fencing, promotion, client routing, capacity, failback, and repeated drills that include the application.",
    [
      { title: "Define the failure envelope", body: "Decide which node, disk, zone, region, network partition, operator error, or dependency failures the system must survive and what data loss and outage are acceptable for each." },
      { title: "Preserve one writer", body: "Use reliable health evidence and quorum, fence the old primary before promotion, select a sufficiently current standby, update routing with bounded convergence, and reject stale writers." },
      { title: "Prove the full failover", body: "Exercise application reconnection, in-flight transaction ambiguity, connection-pool drain, replica capacity, cache behavior, scheduled jobs, monitoring, and controlled failback—not only database promotion." },
    ],
    [
      q("Why fence the old primary?", "To prevent two writable primaries from diverging", ["To accelerate VACUUM", "To compress backups", "To add indexes"], "A network partition can otherwise create split brain."),
      q("Is a standby a backup?", "No, it can replicate deletion, corruption, or malicious change", ["Yes always", "Only if synchronous", "Only for indexes"], "Recovery from logical damage needs independent retained history."),
      q("What should an HA drill include?", "Client reconnection and business validation after promotion", ["Only a ping", "Only replica creation", "Only CPU metrics"], "Users need a correct service, not merely a promoted process."),
      q("What does synchronous replication trade?", "Commit latency and availability for stronger acknowledged durability", ["Schema for storage", "Indexes for locks", "Backups for caching"], "Commits may wait for remote acknowledgment and stall if required standbys fail."),
    ],
  ),
  "sql:expert:Backup/PITR": lesson(
    "Backup and point-in-time recovery preserve independent historical copies that can restore after physical loss, corruption, deletion, or compromise. A recovery strategy is only real when encrypted artifacts, keys, base backups, WAL continuity, retention, timelines, and application invariants are restored in regular drills.",
    [
      { title: "Map backups to objectives", body: "Use physical base backups plus WAL for full-cluster PITR, logical exports for selective or portable recovery, and immutable off-account copies according to RPO, RTO, retention, and threat model." },
      { title: "Protect the recovery chain", body: "Monitor every archived WAL segment, verify checksums, encrypt with separately recoverable keys, restrict deletion, preserve catalogs and configuration, and test the oldest promised restore point." },
      { title: "Restore to evidence", body: "Recover in isolation to a timestamp or named restore point, follow the correct timeline, promote deliberately, validate constraints and business totals, rotate compromised credentials, and document measured recovery time." },
    ],
    [
      q("What does PITR require after a base backup?", "An unbroken sequence of required WAL through the target time", ["Only table names", "One replica", "A cache dump"], "Missing one segment can stop replay before the recovery target."),
      q("Why keep an immutable off-account backup?", "Primary credentials or infrastructure compromise should not erase recovery copies", ["To improve query plans", "To reduce row locks", "To replace encryption"], "Backup isolation addresses destructive control-plane incidents."),
      q("What proves a backup?", "A complete timed restore with data and application validation", ["A successful upload", "A file listing", "A green storage metric"], "Creation evidence does not prove recoverability."),
      q("What should backup retention follow?", "Business, legal, security, RPO, and recovery-window requirements", ["Available disk alone", "One default TTL", "Current cache size"], "Retention is a product and risk decision."),
    ],
  ),
  "sql:expert:Monitoring": lesson(
    "Database monitoring connects workload outcomes to query latency, locks, sessions, replication, WAL, checkpoints, vacuum, storage, and host resources. Useful telemetry uses rates and percentiles, controls sensitive query data and label cardinality, and links every alert to an owner and diagnostic runbook.",
    [
      { title: "Start with service indicators", body: "Measure successful transaction rate, latency percentiles, error-budget burn, connection acquisition, oldest queue age, replica staleness, and business correctness before relying on CPU or disk averages." },
      { title: "Use PostgreSQL evidence", body: "Correlate pg_stat_activity, pg_stat_database, pg_stat_statements, lock graphs, progress views, replication views, logs, plans, checkpoints, WAL generation, autovacuum, bloat estimates, and storage growth." },
      { title: "Make alerts actionable", body: "Record baselines, use rates for cumulative counters, aggregate and redact query fingerprints, alert on sustained symptoms with context, and maintain tested steps for overload, blocking, lag, space exhaustion, and failover." },
    ],
    [
      q("Why calculate rates from PostgreSQL counters?", "Many statistics accumulate since reset and need a time window", ["Rates encrypt data", "Counters contain no values", "It disables sampling"], "A raw total does not reveal current workload intensity."),
      q("What does pg_stat_activity help reveal?", "Current sessions, states, waits, and transaction age", ["Only backup contents", "Only schema ownership", "Only disk firmware"], "It is central to diagnosing live blocking and leaked transactions."),
      q("Why normalize query fingerprints?", "To group workload without storing every literal value", ["To remove indexes", "To change results", "To create replicas"], "Aggregation improves usefulness and privacy."),
      q("What should accompany a database alert?", "Threshold context, ownership, and a tested runbook", ["Only a red icon", "An unbounded log dump", "A schema migration"], "Alerts must lead to a safe diagnostic and response path."),
    ],
  ),
  "genai:expert:Distributed systems": lesson(
    "GenAI workflows inherit partial failure, concurrency, queueing, consistency, and replay problems from distributed systems, amplified by expensive stochastic dependencies and consequential tools. State ownership, idempotency, backpressure, durable transitions, and ambiguity handling must remain deterministic outside the model.",
    [
      { title: "Assume ambiguous outcomes", body: "A timeout says the caller did not observe completion, not that nothing happened; use operation IDs, durable receipts, status reconciliation, and safe retries for model jobs and side effects." },
      { title: "Own state transitions", body: "Persist versioned workflow state and append-only events around queue publication, tool execution, approvals, checkpoints, terminal outcomes, and compensation so workers can resume without prompt memory." },
      { title: "Control finite capacity", body: "Bound queues and concurrency, prioritize by product contract, propagate deadlines and cancellation, shed overload, isolate tenants, and measure queue age, success per attempt, saturation, and cost." },
    ],
    [
      q("What does a network timeout prove?", "Only that the caller did not receive a timely result", ["The remote action failed", "The remote action succeeded", "The queue is empty"], "The outcome may be successful, failed, or still running."),
      q("Why use idempotency keys for tools?", "A replay should not duplicate the same business effect", ["To increase temperature", "To extend context", "To bypass authorization"], "Delivery and retry are commonly at least once."),
      q("What does backpressure prevent?", "Unbounded accepted work from overwhelming finite model and tool capacity", ["All semantic errors", "Every provider outage", "Prompt injection alone"], "Queues must reflect downstream throughput and service priority."),
      q("Where should durable workflow state live?", "An external versioned store with explicit ownership", ["Only in model context", "Only in logs", "Only in one worker's memory"], "Workers and processes can restart or duplicate delivery."),
    ],
  ),
  "genai:expert:Docker/Kubernetes/GPU": lesson(
    "GPU platform engineering aligns container artifacts, drivers, CUDA, model runtime, weights, scheduling, topology, probes, rollout, autoscaling, and cost. A process using a GPU is not automatically a production inference service; readiness must prove the exact model can serve within its contract.",
    [
      { title: "Build a compatible artifact", body: "Pin framework, CUDA user-space libraries, tokenizer, runtime, and model manifest; keep drivers on the host boundary, scan and sign images, run non-root, and fetch verified weights through controlled storage." },
      { title: "Schedule scarce accelerators", body: "Declare GPU resources, memory needs, topology and interconnect constraints, node labels and taints, quotas, priorities, disruption budgets, and isolation for shared or partitioned devices." },
      { title: "Operate model readiness", body: "Separate startup, liveness, and readiness; warm kernels and weights, run a bounded inference probe, drain requests before termination, canary versions, and scale on queue, tokens, memory, and latency rather than CPU alone." },
    ],
    [
      q("Where does the GPU driver normally belong?", "On the compatible host boundary exposed to the container", ["Baked as an arbitrary image copy", "Inside the prompt", "In a database row"], "Kernel-level driver compatibility differs from user-space CUDA libraries."),
      q("What should readiness prove?", "The loaded model can accept and complete bounded inference", ["The container process exists", "A port opened once", "The image downloaded"], "Traffic should arrive only after weights, runtime, and memory are usable."),
      q("Why scale inference on queue and token signals?", "CPU utilization may not represent GPU saturation or work size", ["GPUs have no memory", "Tokens are always equal", "It disables batching"], "Prompt and output lengths strongly influence capacity."),
      q("What protects availability during node maintenance?", "Replicas, draining, and a disruption budget with spare capacity", ["One large pod", "Ignoring termination", "Deleting probes"], "Planned disruption still needs enough ready serving capacity."),
    ],
  ),
  "genai:expert:LLMOps": lesson(
    "LLMOps governs every behavior-affecting artifact—application code, prompts, models, adapters, tokenizers, datasets, indexes, tools, policies, graders, and configurations—from experiment through evaluation, promotion, telemetry, incident response, rollback, and retirement.",
    [
      { title: "Establish lineage", body: "Assign immutable versions and ownership to source data, transformations, training, prompts, retrieval snapshots, evaluation sets, grader calibration, model/runtime artifacts, policies, and release evidence." },
      { title: "Promote through evidence", body: "Compare a candidate with its baseline on frozen task and risk slices, require security and cost gates, approve material risk, canary the complete artifact bundle, and preserve environment parity." },
      { title: "Operate the lifecycle", body: "Trace production behavior to versions, monitor quality drift and cost, manage incidents and provider changes, roll back compatible bundles, deprecate consumers, honor deletion, and retain auditable decisions." },
    ],
    [
      q("What must an LLM release identify?", "Every artifact that can change behavior", ["Only application code", "Only the provider name", "Only temperature"], "Prompts, data, tools, policies, models, and graders all affect outcomes."),
      q("Why promote an artifact bundle?", "Individually compatible versions may not be compatible as a system", ["To avoid evaluation", "To remove rollback", "To hide lineage"], "The tested combination is the unit of release evidence."),
      q("What should trigger rollback?", "A predefined quality, safety, reliability, or cost regression", ["Any single token", "A new dashboard", "A successful canary"], "Release gates require explicit measurable stop conditions."),
      q("Why version graders?", "Changing evaluation judgment changes release decisions", ["Graders never drift", "They are only UI", "It reduces storage"], "Measurement infrastructure is itself a governed artifact."),
    ],
  ),
  "genai:expert:Production feedback loops": lesson(
    "Production feedback loops convert consented outcomes, corrections, incidents, human review, and sampled traces into trusted evaluation cases and controlled product changes. Raw feedback is sparse, biased, gameable, privacy-sensitive, and not automatically a training label.",
    [
      { title: "Capture interpretable signals", body: "Record task and version context, explicit user intent, downstream outcome, correction, trace reference, consent, tenant and retention scope, while minimizing content and offering review or deletion." },
      { title: "Triage before labeling", body: "Separate product, retrieval, model, policy, tool, data, and UX failures; deduplicate incidents; sample silent successes; adjudicate ambiguous cases; and protect train, validation, and holdout boundaries." },
      { title: "Close the measured loop", body: "Turn recurring failures into regression tests, propose the smallest change, compare with a baseline, canary, monitor affected and adjacent slices, and attribute whether the expected user outcome improved without new harm." },
    ],
    [
      q("Why is thumbs-down not automatically a label?", "It lacks reliable intent, failure cause, and desired correction", ["Users cannot give feedback", "It contains no timestamp", "Models ignore labels"], "Signals need context and often adjudication."),
      q("Why sample successful interactions?", "Failure-only data gives a biased view of production behavior", ["To delete incidents", "To bypass consent", "To raise temperature"], "Monitoring needs representative denominators and counterexamples."),
      q("What prevents evaluation leakage?", "Versioned lineage and separation of development and holdout cases", ["Longer prompts", "More retries", "One global dataset"], "Repeated optimization on a test set destroys its predictive value."),
      q("When is a feedback-loop change complete?", "After evaluated and monitored outcome improvement without unacceptable regressions", ["After collecting a comment", "After changing a prompt", "After retraining once"], "The loop closes on measured product impact."),
    ],
  ),
};

export function getRoundFifteenLessonEnrichment(track: LearningTrackId, pace: string, topic: string): LessonEnrichment | null {
  return ROUND_FIFTEEN_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
