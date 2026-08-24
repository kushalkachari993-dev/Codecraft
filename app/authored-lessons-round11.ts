import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_ELEVEN_LESSONS: Record<string, LessonEnrichment> = {
  "python:intermediate:Concurrency intro": lesson(
    "Concurrency improves utilization when tasks spend time waiting, but it introduces scheduling, coordination, cancellation, and partial-failure behavior. A good design starts with the workload and a measured bottleneck instead of adding workers by instinct.",
    [
      { title: "Classify the workload", body: "Threads often suit blocking I/O, asyncio suits cooperative awaitable I/O, and processes can provide CPU parallelism with serialization and startup costs." },
      { title: "Bound the work", body: "Limit workers, queue size, timeouts, and retries so a slow dependency cannot turn local concurrency into remote overload." },
      { title: "Design failure semantics", body: "Choose whether to fail fast, collect per-item errors, cancel unfinished work, preserve input order, and make repeated operations idempotent." },
    ],
    [
      { question: "Which workload often benefits from a ThreadPoolExecutor?", options: ["Several blocking I/O calls", "One tiny arithmetic expression", "A task that must remain strictly serial", "Importing a constant"], answer: 0, explanation: "Threads can overlap waiting even when Python bytecode is not executing in parallel." },
      { question: "Why set max_workers deliberately?", options: ["To bound resource use and downstream pressure", "To guarantee zero failures", "To remove the GIL", "To deep-copy inputs"], answer: 0, explanation: "Unbounded work can exhaust sockets, memory, and dependency capacity." },
      { question: "What is parallelism?", options: ["Work executing at the same physical instant", "Only interleaving tasks", "Retrying an error", "Sorting a queue"], answer: 0, explanation: "Concurrency is overlapping progress; parallelism is simultaneous execution." },
      { question: "What should a fail-fast operation do after one fatal result?", options: ["Cancel work that has not started when possible", "Launch more workers", "Ignore every exception", "Commit partial output silently"], answer: 0, explanation: "Cancellation limits wasted work, while completed side effects still need explicit handling." },
    ],
  ),
  "python:intermediate:Project structure": lesson(
    "Project structure makes dependencies and ownership visible as a codebase grows. A src layout, cohesive packages, narrow public interfaces, tests, configuration, and executable entry points keep imports reproducible and changes local.",
    [
      { title: "Draw package boundaries", body: "Group behavior by domain responsibility, expose a small public API, and keep adapters such as database or HTTP code at replaceable edges." },
      { title: "Use an installable src layout", body: "Place importable code under src/package_name, tests outside it, and project metadata in pyproject.toml so tests exercise installed imports." },
      { title: "Separate configuration from code", body: "Declare dependencies and tools centrally, inject environment-specific values, and provide a clear CLI or application entry point." },
    ],
    [
      { question: "What problem does a src layout help reveal?", options: ["Imports that work only from the repository directory", "SQL deadlocks", "GPU memory pressure", "Hash collisions"], answer: 0, explanation: "Tests must import the installed package instead of accidentally finding root files." },
      { question: "What belongs in a package's public interface?", options: ["Stable capabilities callers should depend on", "Every implementation helper", "Secrets", "Generated caches"], answer: 0, explanation: "A narrow interface lets internal implementation change without spreading coupling." },
      { question: "What is pyproject.toml used for?", options: ["Build metadata, dependencies, and tool configuration", "Runtime user records", "Compiled bytecode only", "Database backups"], answer: 0, explanation: "Modern Python projects centralize packaging and many tool settings there." },
      { question: "Where should database-driver code usually live?", options: ["At an adapter boundary behind domain-facing functions", "Inside every domain model", "In test names", "In package metadata"], answer: 0, explanation: "An adapter isolates infrastructure details and makes testing easier." },
    ],
  ),
  "python:intermediate:PostgreSQL": lesson(
    "Python/PostgreSQL correctness depends on parameter binding, explicit transaction ownership, bounded connection use, database constraints, predictable result mapping, and retry decisions based on SQLSTATE—not on assembling SQL strings.",
    [
      { title: "Bind values safely", body: "Use driver placeholders and a separate parameter sequence; compose dynamic identifiers only through a trusted allowlist or driver identifier API." },
      { title: "Scope the transaction", body: "Checkout one connection for one short unit of work, commit success, roll back failure, and never hold a transaction while waiting for users or remote APIs." },
      { title: "Handle PostgreSQL semantics", body: "Use constraints as the final integrity boundary, map returned columns explicitly, and retry the complete transaction only for known transient SQLSTATE classes." },
    ],
    [
      { question: "How should a relay name enter an INSERT?", options: ["As a bound parameter", "Through an f-string", "Through concatenation", "As a SQL comment"], answer: 0, explanation: "Binding preserves types and prevents a value from becoming SQL syntax." },
      { question: "What should happen when a transaction raises an error?", options: ["Roll back before the connection is reused", "Commit anyway", "Leave it open", "Retry only the failed statement blindly"], answer: 0, explanation: "A failed transaction must return to a known state before release." },
      { question: "Why use database constraints in addition to Python validation?", options: ["They protect data from every concurrent writer", "They reduce package size", "They replace authentication", "They make all queries faster"], answer: 0, explanation: "Other services, migrations, and concurrent sessions can bypass one process's checks." },
      { question: "Which retry is safest?", options: ["The entire idempotent transaction after a recognized transient SQLSTATE", "Any statement after any exception", "A committed write without an idempotency rule", "A syntax error forever"], answer: 0, explanation: "Transaction-level retry preserves the intended unit of work and must avoid duplicate effects." },
    ],
  ),
  "sql:intermediate:N+1 problem": lesson(
    "N+1 queries turn one collection load into one additional round trip per row, so latency and database work grow with result size. The solution is a measured loading strategy—not automatically fetching an unlimited object graph.",
    [
      { title: "Detect the multiplier", body: "Count statements per request and trace repeated queries whose only changing value is a parent identifier." },
      { title: "Choose a bounded fix", body: "Use a join for one-to-one data, select-in batching for collections, aggregation for shaped results, or a dedicated projection for a stable screen." },
      { title: "Test query behavior", body: "Assert result correctness and a query-count budget, then measure row multiplication, transferred bytes, and memory after eager loading." },
    ],
    [
      { question: "What is the classic N+1 pattern?", options: ["One list query followed by one related query per row", "One query with one parameter", "A recursive CTE", "One failed transaction"], answer: 0, explanation: "The number of database round trips grows with the parent result count." },
      { question: "What often dominates many tiny queries?", options: ["Network and protocol round trips", "SQL capitalization", "Column aliases", "View names"], answer: 0, explanation: "Even fast individual lookups accumulate substantial request latency." },
      { question: "Why can joining every relationship be harmful?", options: ["It can multiply rows and fetch far more data than needed", "JOIN disables transactions", "JOIN ignores indexes always", "It removes constraints"], answer: 0, explanation: "Loading strategy must match cardinality and the actual response shape." },
      { question: "What regression check catches N+1 early?", options: ["A query-count assertion for a representative request", "A CSS screenshot", "A hash test", "A model temperature check"], answer: 0, explanation: "Correct results alone do not reveal the growing number of statements." },
    ],
  ),
  "sql:intermediate:Security": lesson(
    "Database security is layered across identity, least-privilege roles, network boundaries, TLS, secret rotation, parameterized SQL, row isolation, auditing, and protected backups. The application should not connect as an owner merely because setup is easier.",
    [
      { title: "Design roles by workload", body: "Separate migration, read, write, and administrative duties; grant only required schemas, tables, sequences, and operations, then revoke broad defaults." },
      { title: "Preserve data boundaries", body: "Carry tenant identity through every query and consider row-level security as defense in depth with carefully managed session context." },
      { title: "Protect every copy", body: "Rotate secrets, encrypt connections and backups, redact logs, audit privileged actions, and rehearse credential revocation." },
    ],
    [
      { question: "Which role should the normal application use?", options: ["A non-owner role with only required privileges", "A superuser", "The migration owner", "An anonymous public role"], answer: 0, explanation: "Least privilege limits the impact of application compromise or mistakes." },
      { question: "What does parameter binding prevent?", options: ["Values changing the SQL program structure", "Every authorization bug", "Backup loss", "Weak passwords"], answer: 0, explanation: "It is an injection control, not a complete security architecture." },
      { question: "What must row-level security still receive safely?", options: ["The correct tenant or user context", "A larger connection pool", "A JSON index", "A query screenshot"], answer: 0, explanation: "A reused connection with stale context can undermine otherwise correct policies." },
      { question: "Which assets belong inside the database security perimeter?", options: ["Backups, replicas, logs, and admin tools", "Only the primary tables", "Only passwords", "Only SQL source files"], answer: 0, explanation: "Secondary copies and operational surfaces can expose the same sensitive data." },
    ],
  ),
  "sql:intermediate:PostgreSQL deeper": lesson(
    "PostgreSQL exposes schemas, types, extensions, catalogs, MVCC behavior, planner statistics, and server settings as a coherent platform. Using these capabilities deliberately requires understanding ownership, lifecycle, portability, and operational visibility.",
    [
      { title: "Use schemas as namespaces", body: "Qualify security-sensitive objects, control CREATE and USAGE privileges, and keep search_path from silently resolving an unexpected object." },
      { title: "Read the catalogs", body: "pg_catalog and information_schema describe relations, indexes, routines, constraints, settings, and active work for inspection and automation." },
      { title: "Own extensions and types", body: "Treat extensions and custom types as versioned dependencies with installation, upgrade, backup, and compatibility plans." },
    ],
    [
      { question: "What does a PostgreSQL schema provide?", options: ["A namespace and privilege boundary within a database", "A separate server process", "A backup format", "A query plan"], answer: 0, explanation: "Schemas organize objects and participate in name resolution and access control." },
      { question: "Where is PostgreSQL's own metadata exposed?", options: ["System catalogs such as pg_catalog", "Only application logs", "Only configuration files", "A browser cache"], answer: 0, explanation: "Catalog relations let SQL inspect the database's structure and state." },
      { question: "Why control search_path?", options: ["Unqualified names can resolve to unintended objects", "It changes transaction isolation", "It compresses tables", "It enables JSON"], answer: 0, explanation: "Name resolution can create correctness and security surprises when writable schemas precede trusted ones." },
      { question: "How should an extension be treated?", options: ["As a versioned operational dependency", "As free syntax with no lifecycle", "As a client-only feature", "As a replacement for backups"], answer: 0, explanation: "Extension code and objects must be available and compatible across environments and restores." },
    ],
  ),
  "sql:intermediate:Query optimization": lesson(
    "Query optimization is an experimental workflow: capture a representative baseline, read estimates and actual work, change the dominant factor, and remeasure under realistic data and concurrency. A faster isolated SELECT may increase write cost or operational complexity.",
    [
      { title: "Capture the plan", body: "Use EXPLAIN ANALYZE safely with buffers, compare estimated and actual rows, inspect loops, filters, scans, joins, sorts, and spills." },
      { title: "Fix the cause", body: "Improve predicates, statistics, schema, or a workload-matched index rather than forcing a plan before understanding misestimation." },
      { title: "Measure the workload", body: "Compare p50 and tail latency, reads, writes, storage, cache state, concurrency, and maintenance before accepting the change." },
    ],
    [
      { question: "What does EXPLAIN ANALYZE do?", options: ["Executes the statement and reports actual plan behavior", "Only parses syntax", "Creates an index", "Cancels concurrent work"], answer: 0, explanation: "Because it runs the statement, writes require a safe transaction or non-production environment." },
      { question: "What does a large estimated-versus-actual row gap suggest?", options: ["A cardinality estimation problem", "A missing semicolon only", "An invalid password", "A failed backup"], answer: 0, explanation: "Statistics, correlation, or predicates may not describe the data well enough." },
      { question: "When is a new index justified?", options: ["When measured workload benefit outweighs write, storage, and maintenance cost", "For every column", "Whenever a query is long", "Only after disabling sequential scans"], answer: 0, explanation: "Indexes are workload-specific structures with ongoing costs." },
      { question: "Why benchmark with concurrency?", options: ["Contention and cache behavior may not appear in one query", "It changes SQL grammar", "It removes locks", "It guarantees linear scaling"], answer: 0, explanation: "Production performance is a property of the workload, not just one isolated plan." },
    ],
  ),
  "genai:expert:LLM inference": lesson(
    "LLM inference has a compute-heavy prefill phase and a memory-bandwidth-sensitive token-by-token decode phase. Capacity planning must combine prompt and output lengths, concurrency, batching, KV-cache size, quality, and tail latency.",
    [
      { title: "Separate prefill and decode", body: "Prefill processes prompt tokens in parallel and can be compute-bound; decode repeatedly reads model state for one new token and is often bandwidth-bound." },
      { title: "Schedule continuous batches", body: "Admit and interleave requests as slots free, while controlling token budgets, priorities, fairness, and head-of-line blocking." },
      { title: "Benchmark representative traffic", body: "Report time to first token, inter-token latency, end-to-end latency, throughput, cache pressure, concurrency, and sequence distributions together." },
    ],
    [
      { question: "Which phase processes the whole prompt?", options: ["Prefill", "Decode only", "Checkpointing", "Quantization calibration"], answer: 0, explanation: "Prefill builds representations and KV-cache entries for prompt tokens." },
      { question: "What often limits autoregressive decode?", options: ["Memory bandwidth", "SQL joins", "Tokenizer licensing", "DNS only"], answer: 0, explanation: "Each step reads substantial model state to produce one or a few tokens." },
      { question: "What does continuous batching improve?", options: ["Accelerator utilization across requests of different lengths", "Model factuality automatically", "Prompt security", "Training-data quality"], answer: 0, explanation: "The server can refill freed batch slots instead of waiting for an entire static batch." },
      { question: "Which metric reflects perceived response start?", options: ["Time to first token", "Model file size", "Training loss", "Adapter rank"], answer: 0, explanation: "TTFT captures queuing plus prompt processing before the first streamed output." },
    ],
  ),
  "genai:expert:Model serving": lesson(
    "Production model serving surrounds inference with routing, admission control, batching, health, warmup, autoscaling, versioned artifacts, canaries, isolation, observability, and rollback. A process answering one request is only the kernel of the platform.",
    [
      { title: "Protect capacity", body: "Estimate tokens and memory before admission, enforce queue and deadline policies, and reject or degrade gracefully before the fleet becomes unstable." },
      { title: "Manage model lifecycle", body: "Version model, tokenizer, runtime, quantization, prompt contract, and safety policy; warm replicas before traffic and retain the previous release." },
      { title: "Route with evidence", body: "Select replicas by health, model availability, cache capacity, priority, and locality while measuring errors, saturation, latency, and quality." },
    ],
    [
      { question: "What is admission control for?", options: ["Keeping accepted work within service capacity", "Training adapters", "Creating tokens", "Building indexes"], answer: 0, explanation: "Controlled rejection is safer than accepting work that causes fleet-wide timeout and memory failure." },
      { question: "Why warm a model replica before routing traffic?", options: ["Loading and kernel initialization can cause slow or failed first requests", "It changes the dataset", "It grants permissions", "It rotates secrets"], answer: 0, explanation: "Readiness should include model availability and representative inference, not process liveness alone." },
      { question: "What enables a reliable rollback?", options: ["Immutable versioned artifacts and retained capacity", "Overwriting the old model", "One mutable latest tag", "Deleting telemetry"], answer: 0, explanation: "The prior known-good serving stack must remain identifiable and deployable." },
      { question: "Which signal should autoscaling consider?", options: ["Queue delay and token workload in addition to utilization", "Request count only", "Repository stars", "Prompt spelling"], answer: 0, explanation: "Requests vary greatly in prompt and output work, so raw count is misleading." },
    ],
  ),
  "genai:expert:GPU fundamentals": lesson(
    "GPU performance comes from massive parallel execution fed by a hierarchy of registers, shared memory, caches, and high-bandwidth memory. Model speed depends on arithmetic intensity, precision, kernels, occupancy, and data movement—not utilization percentage alone.",
    [
      { title: "Fit the memory budget", body: "Account for weights, activations, KV cache, temporary workspaces, fragmentation, and runtime overhead at the target precision and concurrency." },
      { title: "Identify the limiter", body: "Use a profiler to distinguish compute saturation, memory-bandwidth pressure, communication, synchronization, and small-kernel launch overhead." },
      { title: "Match kernels to hardware", body: "Tensor-core paths, fused operations, layout, batch shape, and supported precision determine whether theoretical FLOPS become application throughput." },
    ],
    [
      { question: "What does VRAM capacity determine first?", options: ["Whether required model and runtime state fits", "Model truthfulness", "SQL consistency", "Prompt authorization"], answer: 0, explanation: "Weights, KV cache, activations, and workspaces must coexist in device memory." },
      { question: "Why is GPU utilization alone insufficient?", options: ["It does not identify compute, bandwidth, communication, or inefficient kernels", "It is always zero", "It measures database locks", "It includes model quality"], answer: 0, explanation: "A busy device can still deliver poor useful throughput for many different reasons." },
      { question: "What often benefits from operator fusion?", options: ["Reduced memory traffic and kernel-launch overhead", "More training data", "Longer licenses", "New API permissions"], answer: 0, explanation: "Combining operations can keep intermediate values on-chip and reduce launches." },
      { question: "What is arithmetic intensity?", options: ["Compute performed relative to data moved", "Number of prompts per user", "Context-window size only", "Replica count"], answer: 0, explanation: "It helps indicate whether a workload is more likely compute- or memory-bound." },
    ],
  ),
  "genai:expert:Distributed inference": lesson(
    "Distributed inference uses replicas or shards across accelerators when one device cannot fit the model or meet throughput. Tensor, pipeline, data, and expert parallelism make different communication, placement, latency, balance, and failure tradeoffs.",
    [
      { title: "Choose the parallel dimension", body: "Replicas scale independent requests, tensor parallelism splits layer math, pipeline parallelism splits layers, and expert parallelism routes tokens to selected experts." },
      { title: "Map the topology", body: "Place communication-heavy groups on fast interconnects, measure collective latency and bandwidth, and avoid crossing slow links without a quantified reason." },
      { title: "Plan failure and imbalance", body: "Define shard health, coordinated restart, request retry boundaries, expert hotspots, pipeline bubbles, capacity headroom, and degraded modes." },
    ],
    [
      { question: "Which strategy copies the full model to serve independent requests?", options: ["Data-parallel replicas", "Tensor parallelism", "Pipeline parallelism", "Expert routing"], answer: 0, explanation: "Replicas increase aggregate capacity when each device or group can host the model." },
      { question: "What can dominate tensor-parallel inference?", options: ["Frequent collective communication", "CSS size", "SQL vacuum", "Dataset licensing only"], answer: 0, explanation: "Layer computations require accelerators to exchange partial results repeatedly." },
      { question: "What is a pipeline bubble?", options: ["Idle stage time caused by pipeline scheduling or imbalance", "A tokenizer error", "A cache key", "A safety label"], answer: 0, explanation: "Uneven stage durations and insufficient microbatches leave some accelerators waiting." },
      { question: "Why benchmark on the target interconnect?", options: ["Topology can determine whether sharding helps or hurts", "It changes model weights", "It prevents every failure", "It creates provenance"], answer: 0, explanation: "Communication costs vary dramatically between links and placements." },
    ],
  ),
  "genai:expert:Advanced RAG": lesson(
    "Advanced RAG routes questions across vector, lexical, relational, graph, document, and tool sources while preserving authorization, freshness, provenance, and claim-level evidence. Extra architecture is justified only when it beats a simpler measured baseline.",
    [
      { title: "Route by evidence need", body: "Classify intent and send exact identifiers to structured sources, semantic concepts to retrieval indexes, relationships to graphs, and live state to authorized tools." },
      { title: "Carry provenance", body: "Attach source identity, version, timestamp, access decision, retrieval method, and passage boundaries through ranking and synthesis." },
      { title: "Evaluate the full path", body: "Measure routing, retrieval recall, ranking, citation support, answer correctness, latency, cost, freshness, and access isolation against simpler alternatives." },
    ],
    [
      { question: "Where should an exact account balance usually come from?", options: ["An authorized transactional source or tool", "A vector index snapshot", "Model memory", "An unrelated web page"], answer: 0, explanation: "Live structured facts require the authoritative system and current access decision." },
      { question: "What does evidence provenance include?", options: ["Source identity, version, timestamp, and passage or record", "Only a generated citation number", "Only model name", "Only token count"], answer: 0, explanation: "Lineage must connect claims to the exact evidence state used." },
      { question: "When is graph retrieval especially useful?", options: ["Questions whose answer depends on explicit multi-hop relationships", "Every similarity lookup", "Only image generation", "Simple arithmetic"], answer: 0, explanation: "Graphs expose typed connections and paths that flattened chunks may obscure." },
      { question: "When should a complex federated RAG design be adopted?", options: ["After evaluations show meaningful benefit over a simpler baseline", "Before defining the use case", "Whenever more databases exist", "To avoid authorization"], answer: 0, explanation: "Complexity must pay for itself in measured quality, reliability, or operational requirements." },
    ],
  ),
};

export function getRoundElevenLessonEnrichment(track: LearningTrackId, pace: string, topic: string): LessonEnrichment | null {
  return ROUND_ELEVEN_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
