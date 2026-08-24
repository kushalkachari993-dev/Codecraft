import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_FOURTEEN_LESSONS: Record<string, LessonEnrichment> = {
  "python:expert:Advanced typing": lesson(
    "Advanced typing makes relationships between values reviewable before execution. Protocols, generics, overloads, narrowing, and exhaustive unions improve API design only when annotations describe runtime truth rather than silencing uncertainty with Any or casts.",
    [
      { title: "Model behavior, not ancestry", body: "Protocols express the smallest structural capability a caller needs, allowing unrelated concrete types to satisfy the same contract without framework inheritance." },
      { title: "Preserve relationships", body: "Type variables and generics connect input and output types; bounded or constrained variables are more precise than broad unions that forget which value entered." },
      { title: "Narrow at trustworthy boundaries", body: "Validate unknown input, use discriminated unions and TypeGuard deliberately, and keep casts rare because a cast changes checker belief but performs no runtime verification." },
    ],
    [
      { question: "When is a Protocol preferable to a base class?", options: ["When callers need a behavior shared structurally by unrelated types", "When runtime validation is unnecessary", "Whenever inheritance is possible", "Only for integers"], answer: 0, explanation: "Protocols decouple consumers from nominal inheritance while retaining a checked contract." },
      { question: "What does TypeVar preserve?", options: ["A relationship between participating types", "Runtime memory ownership", "SQL isolation", "Thread scheduling"], answer: 0, explanation: "A generic API can return or combine the same specific type it receives." },
      { question: "What does cast() do at runtime?", options: ["Normally nothing", "Validates the object", "Converts the value", "Raises TypeError"], answer: 0, explanation: "cast changes static interpretation, so the underlying assumption still needs proof." },
      { question: "Why use a discriminated union?", options: ["A stable tag enables safe exhaustive narrowing", "It disables checking", "It makes every value optional", "It replaces validation"], answer: 0, explanation: "A literal discriminator lets each branch expose its own precise fields." },
    ],
  ),
  "python:expert:Production APIs": lesson(
    "A production API is a long-lived contract for identity, authorization, validation, side effects, errors, retries, quotas, observability, and evolution. Correct endpoint code is only one layer; reliability comes from enforcing invariants across transport, application logic, and persistence.",
    [
      { title: "Design the contract first", body: "Specify resources, schemas, status codes, error envelopes, pagination, compatibility, and deprecation rules before coupling clients to accidental implementation details." },
      { title: "Make mutations retry-safe", body: "Bind an idempotency key to caller, operation, and normalized request; persist the result atomically so a timeout retry cannot duplicate a business effect." },
      { title: "Operate the boundary", body: "Authenticate identity, authorize each resource action, validate size and shape, rate-limit fairly, propagate correlation IDs, set deadlines, and expose health separately from readiness." },
    ],
    [
      { question: "What must an idempotency record include?", options: ["Caller scope, request identity, and durable outcome", "Only a timestamp", "Only an HTTP method", "A random response"], answer: 0, explanation: "The server must recognize the same logical mutation and replay its recorded result safely." },
      { question: "Why separate authentication and authorization?", options: ["Knowing who acts does not prove they may act on this resource", "They are identical", "Authorization is client-side", "Authentication validates JSON"], answer: 0, explanation: "Every object-level action needs a policy decision after identity is established." },
      { question: "What is a compatibility break?", options: ["Changing a documented behavior clients depend on", "Adding internal logging", "Improving an index", "Rotating an internal worker"], answer: 0, explanation: "Contracts include semantics and failures, not just field names." },
      { question: "What should a readiness probe establish?", options: ["The instance can accept useful traffic", "The process exists", "Every downstream is permanently healthy", "The cache is empty"], answer: 0, explanation: "Readiness controls routing and should reflect the service's ability to serve its contract." },
    ],
  ),
  "python:expert:PostgreSQL engineering": lesson(
    "Python/PostgreSQL engineering joins application transaction boundaries to database constraints, plans, locks, pooling, and migrations. Safe code treats the database as the concurrency authority and keeps connections, retries, and schema evolution explicit.",
    [
      { title: "Put invariants in PostgreSQL", body: "Use types, NOT NULL, uniqueness, foreign keys, checks, and transactions so every client observes the same rules rather than trusting one Python code path." },
      { title: "Control transaction lifetime", body: "Parameterize values, acquire a pooled connection late, commit or rollback promptly, retry only recognized whole-transaction conflicts, and never wait for users while holding locks." },
      { title: "Evolve from evidence", body: "Inspect EXPLAIN ANALYZE and workload statistics, design indexes for complete access patterns, and use expand-migrate-contract releases for backward-compatible zero-downtime changes." },
    ],
    [
      { question: "Where should a cross-client uniqueness rule live?", options: ["A database unique constraint", "Only a Python if statement", "A cache", "A log"], answer: 0, explanation: "The database can arbitrate concurrent writers atomically." },
      { question: "What should be retried after a serialization failure?", options: ["The complete transaction from a clean state", "Only the last SQL line", "The commit forever", "Nothing under any condition"], answer: 0, explanation: "Earlier reads and decisions may be invalid and retries must be bounded." },
      { question: "Why keep transactions short?", options: ["They retain snapshots, locks, and pooled connections", "They disable constraints", "They shrink rows", "They compile Python"], answer: 0, explanation: "Long transactions increase contention and maintenance pressure." },
      { question: "What does expand-and-contract protect?", options: ["Old and new application versions during a rollout", "Only disk space", "Only unit tests", "Password hashing"], answer: 0, explanation: "Compatible intermediate schemas remove the need for an instantaneous coordinated switch." },
    ],
  ),
  "python:expert:Caching": lesson(
    "Caching improves latency and resilience by serving previously computed data, but creates a second truth with freshness, authorization, memory, and failure semantics. Cache design starts with the consistency contract and a complete key, not with choosing a TTL.",
    [
      { title: "Define identity and ownership", body: "Keys must include every behavior-changing dimension such as tenant, resource version, locale, permissions, model, and query normalization while avoiding sensitive raw data." },
      { title: "Choose a freshness protocol", body: "Use cache-aside, write-through, invalidation events, versioned keys, or bounded stale serving according to the harm of outdated data and the authority of the source." },
      { title: "Contain failure", body: "Coalesce misses, jitter expiry, bound entries and value size, use negative caching carefully, and ensure cache outage or poisoning cannot bypass authorization or overwhelm the origin." },
    ],
    [
      { question: "What makes a cache key complete?", options: ["It includes every input that can change the authorized result", "It is short", "It contains a timestamp", "It never expires"], answer: 0, explanation: "Missing tenant or permission dimensions can leak or return incorrect data." },
      { question: "What is a cache stampede?", options: ["Many clients recompute the same expired item simultaneously", "One stale value", "A type error", "A database backup"], answer: 0, explanation: "Request coalescing, leases, and expiry jitter reduce synchronized origin load." },
      { question: "When is stale-while-revalidate appropriate?", options: ["When bounded staleness is acceptable and explicitly measured", "For authorization decisions", "For every payment balance", "When no source exists"], answer: 0, explanation: "Freshness policy must follow product risk." },
      { question: "Why bound a local cache?", options: ["Unbounded retention can exhaust process memory", "It improves SQL syntax", "It removes races", "It encrypts values"], answer: 0, explanation: "Capacity, eviction, and object size are part of runtime safety." },
    ],
  ),
  "python:expert:Queues": lesson(
    "Queues separate acceptance from completion and absorb uneven load, but delivery can be delayed, repeated, reordered, or abandoned. Production consumers therefore need durable message contracts, idempotency, bounded retries, backpressure, observability, and explicit poison-message handling.",
    [
      { title: "Design the message contract", body: "Version the event name and payload, include stable message and business-operation IDs, record causation and trace context, and keep consumers tolerant during staged evolution." },
      { title: "Make consumption replay-safe", body: "Validate, authorize, perform the state transition and deduplication atomically where possible, then acknowledge only after the durable outcome is known." },
      { title: "Control backlog and failure", body: "Set concurrency from downstream capacity, monitor oldest-message age, use exponential backoff with jitter, cap attempts, quarantine poison work, and provide a reviewed replay path." },
    ],
    [
      { question: "What does at-least-once delivery require?", options: ["Idempotent or deduplicated consumers", "A belief that duplicates never occur", "One global worker", "No acknowledgments"], answer: 0, explanation: "A message may be redelivered after ambiguous failure." },
      { question: "When should a consumer acknowledge?", options: ["After the required outcome is durably recorded", "Immediately on receipt", "Before validation", "Only after queue deletion"], answer: 0, explanation: "Early acknowledgment can lose work during a crash." },
      { question: "What best reveals user-visible queue delay?", options: ["Oldest unprocessed message age", "Queue file size alone", "Worker PID", "Message title"], answer: 0, explanation: "Age measures how long accepted work waits before progress." },
      { question: "What belongs in a dead-letter workflow?", options: ["Bounded failed messages with diagnostics and controlled replay", "Every successful message", "Secrets in plain text", "Infinite automatic retries"], answer: 0, explanation: "Quarantine prevents one poison item from blocking healthy work." },
    ],
  ),
  "sql:expert:WAL": lesson(
    "PostgreSQL write-ahead logging records redo information before changed data pages reach durable storage. WAL makes crash recovery, physical replication, point-in-time recovery, and safe checkpoints possible, while volume, retention, and flush latency directly affect operations.",
    [
      { title: "Honor write-ahead order", body: "A commit becomes durable only after its WAL records reach the required persistence boundary; dirty heap or index pages may be written later." },
      { title: "Understand the consumers", body: "Crash recovery replays WAL after a checkpoint, standbys stream or archive it, and PITR combines a base backup with a continuous WAL chain." },
      { title: "Manage retention pressure", body: "Replication slots, archive failures, long recovery windows, full-page images, and write-heavy workloads can retain or generate WAL until storage is exhausted." },
    ],
    [
      { question: "Why is WAL written before data pages?", options: ["Recovery must have redo information before an uncheckpointed change reaches storage", "It sorts tables", "It removes transactions", "It replaces backups"], answer: 0, explanation: "Write-ahead ordering preserves recoverability through crashes and torn page writes." },
      { question: "What makes a commit durable?", options: ["Its WAL reaches the configured durable boundary", "The client formats JSON", "VACUUM runs", "A SELECT follows"], answer: 0, explanation: "Data files can lag because redo records can reconstruct their changes." },
      { question: "What can an inactive replication slot cause?", options: ["Unbounded WAL retention", "Automatic sharding", "Faster checkpoints", "Row deduplication"], answer: 0, explanation: "The primary retains segments the slot may still need." },
      { question: "Does WAL replace logical backups?", options: ["No", "Yes completely", "Only for schemas", "Only for indexes"], answer: 0, explanation: "Recovery strategy needs tested base backups, WAL continuity, and often logical export options." },
    ],
  ),
  "sql:expert:Recovery": lesson(
    "Recovery is an engineered path from failure to a verified service state. PostgreSQL crash recovery, base backups, archived WAL, timelines, restore points, and validation procedures must satisfy explicit recovery-point and recovery-time objectives rather than merely produce backup files.",
    [
      { title: "Match mechanisms to failures", body: "Crash recovery repairs one cluster after abrupt stop; restore handles lost or corrupted storage; point-in-time recovery replays to a target before a destructive event." },
      { title: "Preserve a complete chain", body: "Take consistent base backups, archive every required WAL segment, protect keys and metadata, monitor gaps, and retain artifacts long enough for the declared recovery window." },
      { title: "Prove the restore", body: "Regularly restore into isolation, select the correct timeline and target, promote deliberately, validate schema and business invariants, and record observed RPO and RTO." },
    ],
    [
      { question: "What does RPO bound?", options: ["Acceptable data loss measured in time", "Query latency", "Connection count", "Index width"], answer: 0, explanation: "The recovery point determines how far before the incident the restored data may be." },
      { question: "What does RTO bound?", options: ["Acceptable time to restore service", "WAL row count", "Password length", "Table count"], answer: 0, explanation: "Recovery time includes detection, restore, validation, and controlled return." },
      { question: "Why test restores?", options: ["A backup is not proven until it can restore required data within objectives", "To create more WAL", "To disable checksums", "To avoid monitoring"], answer: 0, explanation: "Unreadable artifacts, missing WAL, or undocumented dependencies otherwise remain hidden." },
      { question: "What should follow PITR before traffic returns?", options: ["Data and application invariant validation", "Immediate deletion of evidence", "Unbounded retries", "Dropping indexes"], answer: 0, explanation: "Technical recovery must be checked against business correctness." },
    ],
  ),
  "sql:expert:Replication": lesson(
    "Replication copies database change to additional nodes for availability, read scale, or migration, but does not remove lag, divergence, conflict, or data-loss decisions. Operators must know what is replicated, when acknowledgments occur, and how promotion changes topology.",
    [
      { title: "Choose physical or logical", body: "Physical streaming reproduces cluster-level WAL and suits close replicas; logical replication publishes selected table changes across more flexible versions and schemas." },
      { title: "Define acknowledgment semantics", body: "Asynchronous replication favors latency but can lose recent commits on primary failure; synchronous modes trade commit latency and availability for stronger durability." },
      { title: "Automate safe failover", body: "Monitor replay lag and data health, fence the old primary, choose a sufficiently current candidate, promote once, redirect clients, and rebuild topology without split brain." },
    ],
    [
      { question: "What can asynchronous failover lose?", options: ["Commits not yet replayed on the promoted standby", "All schemas by definition", "Every index", "Only SELECT statements"], answer: 0, explanation: "A primary may acknowledge locally before the standby receives its WAL." },
      { question: "What prevents split brain?", options: ["Fencing the former primary before accepting a new writer", "Adding more readers", "VACUUM", "A wider key"], answer: 0, explanation: "Only one authoritative write leader may remain reachable." },
      { question: "What is replication lag?", options: ["Distance between primary change and replica receipt/replay", "Query planning time", "Backup compression", "Index depth"], answer: 0, explanation: "Lag can make reads stale and affect failover data loss." },
      { question: "When is logical replication useful?", options: ["Selective table migration or controlled cross-version change streaming", "Copying temporary files", "Replacing constraints", "Avoiding primary keys always"], answer: 0, explanation: "Logical change events offer more selection and transformation than physical block replication." },
    ],
  ),
  "sql:expert:Partitioning": lesson(
    "Partitioning divides one logical table into physical children by a stable key. It improves lifecycle operations and selected query paths only when pruning aligns with predicates; it also adds routing, constraint, index, skew, and maintenance complexity.",
    [
      { title: "Choose the key from operations", body: "Range partition time-series data for retention, list partition bounded categories, or hash partition for distribution only after checking skew and common access patterns." },
      { title: "Design for pruning", body: "Queries must constrain the partition key in a planner-visible form; partitioning does not make scans inside each selected child faster by itself." },
      { title: "Automate the lifecycle", body: "Pre-create future partitions, attach and validate safely, build child indexes, monitor the default partition, archive or detach old data, and test uniqueness requirements." },
    ],
    [
      { question: "What is partition pruning?", options: ["Skipping child tables that cannot match the partition predicate", "Deleting old rows", "Removing columns", "Compressing WAL"], answer: 0, explanation: "The planner or executor can avoid irrelevant partitions when predicates expose the key." },
      { question: "Does partitioning automatically speed every query?", options: ["No", "Yes", "Only writes", "Only joins"], answer: 0, explanation: "Queries without useful pruning may touch many children and become more expensive." },
      { question: "Why pre-create time partitions?", options: ["Incoming rows need a valid destination before their time range arrives", "To disable indexes", "To remove backups", "To avoid constraints"], answer: 0, explanation: "Missing partitions can reject writes or overload a default child." },
      { question: "What is a common partitioning benefit?", options: ["Fast detach or drop for retention windows", "Global ordering without indexes", "Automatic sharding", "No maintenance"], answer: 0, explanation: "Whole-partition lifecycle operations avoid large row-by-row deletes." },
    ],
  ),
  "sql:expert:Sharding": lesson(
    "Sharding distributes rows across independent database nodes to exceed one node's capacity or isolate tenants. It turns local transactions, joins, uniqueness, balancing, backups, and failure recovery into distributed-system problems, so it should follow vertical and operational optimization.",
    [
      { title: "Select a durable shard key", body: "The key should distribute load, preserve common co-location, remain stable, and appear in requests; poor keys create hotspots or expensive scatter-gather queries." },
      { title: "Make routing authoritative", body: "Use a versioned shard map, validate tenant scope, handle moved ranges, and keep retries idempotent when a timeout leaves the destination outcome ambiguous." },
      { title: "Plan rebalancing and failure", body: "Copy and catch up data, dual-read or fence by protocol, cut over atomically, verify checksums, and retain rollback while respecting per-shard backup and recovery objectives." },
    ],
    [
      { question: "What is scatter-gather?", options: ["Querying multiple shards then merging results", "A local index scan", "A checkpoint", "A row lock"], answer: 0, explanation: "Requests without a routing key may fan out across the cluster." },
      { question: "What makes a good shard key?", options: ["Even load plus co-location for dominant transactions", "A constantly changing field", "A random secret", "The largest text column"], answer: 0, explanation: "Distribution and locality must be balanced against future growth." },
      { question: "Why is cross-shard uniqueness difficult?", options: ["Independent nodes cannot enforce one ordinary local unique index globally", "SQL lacks equality", "Rows have no keys", "WAL disables it"], answer: 0, explanation: "Global coordination or key construction is required." },
      { question: "When should sharding be introduced?", options: ["After evidence shows a single well-engineered node cannot meet the requirement", "At project creation", "Before schema design", "To fix every slow query"], answer: 0, explanation: "Sharding carries a permanent coordination and operational tax." },
    ],
  ),
  "genai:expert:Reliability": lesson(
    "GenAI reliability combines ordinary availability with semantic correctness under stochastic output, provider drift, overload, bad context, tool failure, and partial side effects. The system needs measurable service levels, bounded recovery, compatible degradation, and evaluation-backed fallbacks.",
    [
      { title: "Define multidimensional service levels", body: "Track success, groundedness, schema validity, safety, latency, availability, and cost per task slice; a fast fluent failure is not reliable service." },
      { title: "Bound every dependency", body: "Apply deadlines, retry budgets, circuit breakers, concurrency limits, load shedding, idempotency, and explicit fallback compatibility across models, retrieval, tools, and queues." },
      { title: "Exercise failure before release", body: "Replay provider errors, latency spikes, missing evidence, malformed tool output, duplicate delivery, and model-version changes while verifying degradation and recovery." },
    ],
    [
      { question: "Which failures should be retried?", options: ["Recognized transient failures within a bounded budget", "Every policy rejection", "Every malformed request", "All timeouts forever"], answer: 0, explanation: "Retries can amplify deterministic faults and overload unless classified and capped." },
      { question: "What makes a model fallback safe?", options: ["Verified compatibility with prompts, tools, schemas, safety, and quality", "A lower price", "A different name", "More tokens only"], answer: 0, explanation: "Fallbacks are alternate production paths and need their own evidence." },
      { question: "Why measure semantic reliability?", options: ["HTTP success can still contain unsupported or unusable output", "It replaces uptime", "It disables evaluation", "It shortens prompts"], answer: 0, explanation: "User-visible correctness is separate from transport availability." },
      { question: "What does load shedding protect?", options: ["Finite capacity and latency for prioritized work", "Prompt secrecy alone", "Training labels", "Database normalization"], answer: 0, explanation: "Rejecting or degrading low-priority work prevents total collapse." },
    ],
  ),
  "genai:expert:Advanced security": lesson(
    "Advanced GenAI security traces hostile data across prompts, retrieval, files, models, tools, code execution, memory, and outputs. Defenses must sit outside the model because untrusted content can influence reasoning but must never acquire authority, credentials, or unrestricted execution.",
    [
      { title: "Map source-to-sink paths", body: "Classify trusted policy, user data, retrieved content, tool results, generated code, and rendered output; then identify where each could reach secrets, actions, interpreters, or another tenant." },
      { title: "Isolate capabilities", body: "Use scoped short-lived credentials, egress-denied sandboxes, allowlisted tools, typed arguments, resource authorization, output encoding, file limits, and human approval for high-impact actions." },
      { title: "Continuously attack the chain", body: "Test direct and indirect injection, poisoned retrieval, parser confusion, data exfiltration, tool chaining, supply-chain changes, and cross-tenant memory with traceable regression cases." },
    ],
    [
      { question: "Can a prompt make untrusted text authoritative?", options: ["No", "Yes if repeated", "Yes for tools", "Only in RAG"], answer: 0, explanation: "Authority comes from external policy and authenticated context, not content claims." },
      { question: "Where should generated code execute?", options: ["A resource-limited ephemeral sandbox with denied capabilities by default", "The production host", "The user's database admin session", "A shared shell"], answer: 0, explanation: "Isolation constrains filesystem, network, CPU, memory, time, and secrets." },
      { question: "What is indirect prompt injection?", options: ["Hostile instructions embedded in retrieved or tool-provided content", "A long system prompt", "A model timeout", "Token counting"], answer: 0, explanation: "Data from external sources may attempt to redirect the agent or exfiltrate information." },
      { question: "Why use output encoding?", options: ["Model text can become executable in HTML, SQL, shell, or another interpreter", "It trains the model", "It removes authorization", "It guarantees truth"], answer: 0, explanation: "Every destination requires context-appropriate handling." },
    ],
  ),
  "genai:expert:Agent authorization": lesson(
    "Agent authorization evaluates the authenticated subject, delegated authority, requested action, target resource, purpose, risk, and current workflow state for every consequential step. The model may propose an action, but only deterministic policy and fresh user approval can permit it.",
    [
      { title: "Issue narrow capabilities", body: "Bind credentials to one tenant, tool, action, resource set, purpose, expiry, and spend or count limit instead of giving an agent a broad reusable service secret." },
      { title: "Authorize at execution time", body: "Validate typed arguments and current resource state immediately before the side effect; re-check after long waits because membership, consent, or object ownership may have changed." },
      { title: "Record accountable outcomes", body: "Use idempotency keys, approval receipts, policy version, actor chain, request digest, tool result, and terminal state so ambiguity can be reconciled without unsafe repetition." },
    ],
    [
      { question: "Who may grant tool authority?", options: ["An external policy system acting on authenticated delegation", "The language model", "Retrieved text", "A tool description"], answer: 0, explanation: "The component being constrained cannot be its own authority source." },
      { question: "Why reauthorize after a human pause?", options: ["Consent, roles, resource state, or risk may have changed", "Tokens expire grammatically", "The trace disappears", "The model forgets Python"], answer: 0, explanation: "Authorization is contextual and time-sensitive." },
      { question: "What should approval show?", options: ["The exact action, target, material effect, and scope", "A generic Continue button", "Hidden parameters", "Only model confidence"], answer: 0, explanation: "Informed consent requires a concrete preview of the consequential action." },
      { question: "What protects an ambiguous retry?", options: ["A stable idempotency key and outcome reconciliation", "A longer prompt", "A new user ID", "Skipping logs"], answer: 0, explanation: "A timeout may occur after the side effect succeeded." },
    ],
  ),
  "genai:expert:GenAI system design": lesson(
    "GenAI system design turns a user outcome into replaceable probabilistic and deterministic components with explicit trust boundaries, state ownership, evaluation, recovery, cost, and operations. The model is one dependency inside the product, not the architecture itself.",
    [
      { title: "Start from the outcome contract", body: "Define users, task slices, uncertainty, quality, safety, privacy, latency, availability, and cost before choosing a model, framework, retrieval pattern, or agent loop." },
      { title: "Separate control from generation", body: "Keep identity, authorization, validation, state transitions, budgets, idempotency, and side-effect execution deterministic while models classify, extract, draft, or propose within bounded schemas." },
      { title: "Design the operating loop", body: "Version prompts, models, data, tools, and policy; trace every boundary; evaluate offline and online; canary changes; degrade compatibly; collect consented feedback; and retain rollback." },
    ],
    [
      { question: "What should be designed before selecting a model?", options: ["The user outcome and measurable constraints", "A vector database", "An agent persona", "A GPU brand"], answer: 0, explanation: "Architecture choices must follow requirements rather than a preferred technology." },
      { question: "Which component should own authorization?", options: ["A deterministic service outside the model", "The generated answer", "The prompt examples", "The retrieval index"], answer: 0, explanation: "Probabilistic output cannot grant its own capabilities." },
      { question: "Why make model boundaries replaceable?", options: ["Providers, versions, cost, latency, and quality change", "Models never change", "It eliminates tests", "It guarantees zero migration work"], answer: 0, explanation: "Stable internal contracts reduce coupling and enable evaluated substitution." },
      { question: "What closes the production design loop?", options: ["Versioned telemetry, evaluation, feedback, canary, and rollback", "One prompt demo", "A larger context window", "A static benchmark alone"], answer: 0, explanation: "Operational evidence must drive controlled improvement after release." },
    ],
  ),
};

export function getRoundFourteenLessonEnrichment(track: LearningTrackId, pace: string, topic: string): LessonEnrichment | null {
  return ROUND_FOURTEEN_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
