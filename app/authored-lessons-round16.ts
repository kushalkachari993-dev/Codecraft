import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });
const q = (question: string, correct: string, distractors: [string, string, string], explanation: string) => ({ question, options: [correct, ...distractors], answer: 0, explanation });

const ROUND_SIXTEEN_LESSONS: Record<string, LessonEnrichment> = {
  "python:expert:CPython internals": lesson(
    "CPython implements the Python language with C-level object layouts, reference counts, code objects, frames, an evaluation loop, allocators, imports, and extension interfaces. Understanding these layers helps diagnose memory, execution, and compatibility without mistaking one implementation detail for a language guarantee.",
    [
      { title: "Follow the compilation pipeline", body: "Source is tokenized and parsed into an AST, compiled into immutable code objects, and executed in frames that connect instructions, globals, builtins, locals, tracing state, and exception handling." },
      { title: "Connect objects to memory", body: "Every CPython object begins with identity metadata including a type and reference count; containers hold references, small-object allocators reuse arenas, and the cyclic collector supplements immediate reference counting." },
      { title: "Respect the implementation boundary", body: "Inspect sys.implementation, frames, code attributes, tracemalloc, disassembly, and extension behavior for diagnosis, but isolate assumptions because free-threaded builds and new Python releases can change internals." },
    ],
    [
      q("What executes a function body in CPython?", "A frame evaluating a code object", ["The AST directly", "A database transaction", "The garbage collector"], "The code object stores executable metadata while the frame holds one active execution state."),
      q("What does a CPython object header contain?", "Runtime metadata such as its type and reference count", ["Every referenced child inline", "Source code", "A network socket"], "Payload and referenced objects are represented separately from the common header."),
      q("Why check sys.implementation?", "Behavior may be CPython-specific rather than guaranteed by Python", ["It enables SQL", "It changes syntax", "It removes versioning"], "Other Python implementations may use different evaluators and memory strategies."),
      q("What does an extension releasing the GIL permit?", "Other threads can execute while its native work proceeds", ["Shared state becomes automatically safe", "Processes share memory", "Bytecode disappears"], "Application and extension data still need correct synchronization."),
    ],
  ),
  "python:expert:Bytecode": lesson(
    "Bytecode is CPython's version-specific instruction representation inside code objects. Disassembly reveals how source constructs load names, call functions, branch, iterate, and manage the evaluation stack, but opcode counts alone do not predict performance because specialization, native calls, memory, and workload dominate.",
    [
      { title: "Read code-object evidence", body: "Inspect co_consts, co_names, co_varnames, co_freevars, co_cellvars, flags, source positions, and nested code objects to connect instructions with lexical scope and runtime dependencies." },
      { title: "Trace stack effects", body: "Use dis.get_instructions and dis.stack_effect to follow values through loads, binary operations, calls, jumps, returns, and exception regions while remembering caches and adaptive specialization vary by release." },
      { title: "Use bytecode diagnostically", body: "Compare semantic behavior and measured profiles before and after a change; never patch raw instructions as a stable application API or treat fewer opcodes as proof of lower latency." },
    ],
    [
      q("Where is bytecode stored?", "In a function's code object", ["In its instance dictionary", "Only in the AST", "In a database page"], "Functions reference immutable code objects containing instructions and metadata."),
      q("What does dis.get_instructions provide?", "Structured instruction records", ["A performance guarantee", "A secure sandbox", "Source control history"], "Each record exposes opcode, argument, offset, and source-position information."),
      q("Why is bytecode version-specific?", "CPython may add, remove, combine, or specialize instructions", ["Python syntax changes every run", "Code objects are mutable", "SQL controls opcodes"], "Opcode-level tooling must target the running interpreter version."),
      q("Do fewer instructions guarantee faster code?", "No", ["Yes always", "Only for loops", "Only with one function"], "Native calls, allocation, caches, branch behavior, and input shape determine real cost."),
    ],
  ),
  "python:expert:AST": lesson(
    "The abstract syntax tree represents Python's grammatical and semantic structure before code generation. AST tools can audit, lint, instrument, or transform programs reliably, but parsing is not validation and compiling untrusted trees still grants full Python execution capability.",
    [
      { title: "Inspect structure instead of text", body: "Use ast.parse, NodeVisitor, ast.walk, and explicit node fields to identify imports, calls, names, assignments, branches, comprehensions, and source locations across nested syntax." },
      { title: "Transform with invariants", body: "NodeTransformer may replace nodes, but transformations must preserve evaluation order, scoping, contexts such as Load and Store, exception behavior, and accurate locations through copy_location and fix_missing_locations." },
      { title: "Keep a security boundary", body: "Define a strict allowlist for a tiny expression language and interpret it yourself when possible; ast.literal_eval handles only literals and still needs resource limits, while compile and exec are not sandboxes." },
    ],
    [
      q("Why use an AST instead of regex for Python rewriting?", "The AST preserves nested grammatical structure", ["Regex cannot read text", "ASTs execute automatically", "It removes tests"], "Structural nodes distinguish constructs that text patterns cannot reliably parse."),
      q("What must follow generated nodes without locations?", "ast.fix_missing_locations before compilation", ["A database commit", "A GIL release", "A network call"], "The compiler expects coherent source-location metadata."),
      q("Is ast.parse a security check?", "No", ["Yes", "Only for imports", "Only for literals"], "Parsing accepts dangerous constructs; policy must inspect and constrain semantics."),
      q("What does ast.literal_eval allow?", "Python literal structures rather than arbitrary calls", ["Any expression safely", "Shell commands", "Imports"], "It narrows code execution risk but untrusted input still needs size and depth limits."),
    ],
  ),
  "python:expert:Architecture": lesson(
    "Python architecture assigns responsibilities, dependencies, state, and failure handling to explicit boundaries. Sustainable systems keep domain rules independent of frameworks, place side effects behind ports, make transactions and messages visible, and enforce dependency direction through packages and tests.",
    [
      { title: "Separate policy from mechanism", body: "Keep entities and use cases focused on business invariants, define typed ports for persistence, clocks, identity, queues, and external APIs, and implement adapters at the infrastructure edge." },
      { title: "Own each state transition", body: "One application operation should define authorization, validation, transaction scope, idempotency, domain events, outbox publication, errors, and observability instead of scattering them across controllers and models." },
      { title: "Evolve boundaries with evidence", body: "Prefer a modular monolith until independent scaling or ownership justifies distribution; use architecture tests, public package surfaces, dependency injection, contract tests, and recorded decision documents to prevent accidental coupling." },
    ],
    [
      q("Which layer should depend on a web framework?", "An outer adapter layer", ["Core domain entities", "Every value object", "Database constraints"], "Dependency direction keeps domain policy portable and testable."),
      q("What is a port?", "A contract the application uses for an external capability", ["A concrete database driver", "A global singleton", "A deployment region"], "Adapters implement the contract for a particular technology."),
      q("When should a service be split?", "When measured scaling, failure isolation, ownership, or release needs justify distribution", ["At project creation", "Whenever a module exists", "To avoid interfaces"], "Network boundaries add latency, partial failure, and operational cost."),
      q("Why use an outbox?", "Business state and message intent commit atomically", ["To replace transactions", "To store secrets", "To remove idempotency"], "A relay can publish later without losing or duplicating the logical event."),
    ],
  ),
  "sql:expert:Performance engineering": lesson(
    "Database performance engineering models production-like data, concurrency, transactions, cache state, and service objectives, then identifies the dominant limit across plans, locks, WAL, vacuum, storage, CPU, memory, and application behavior. One fast query in isolation is not a capacity result.",
    [
      { title: "Define the workload and baseline", body: "Capture operation mix, parameter distributions, dataset scale and skew, concurrency, think time, connection behavior, warm and cold cache, latency percentiles, throughput, errors, and resource headroom." },
      { title: "Locate the bottleneck", body: "Correlate EXPLAIN ANALYZE BUFFERS WAL, pg_stat_statements, wait events, lock graphs, I/O timing, checkpoints, autovacuum, bloat estimates, replication lag, pool waits, and operating-system saturation." },
      { title: "Change one hypothesis", body: "Test query shape, indexes, statistics, schema, partitioning, batching, transaction scope, caching, or capacity in a controlled environment; remeasure reads, writes, tails, storage, recovery, and operational cost." },
    ],
    [
      q("Why benchmark with concurrency?", "Contention and queueing may not appear in single-query tests", ["It removes locks", "It guarantees production parity", "It shrinks tables"], "Connections compete for CPU, I/O, memory, and row or relation locks."),
      q("What does EXPLAIN ANALYZE add?", "Actual execution timing and row counts", ["A backup", "Automatic optimization", "A security policy"], "Comparison with estimates reveals misestimation and expensive nodes."),
      q("Why inspect p95 and p99?", "Tail latency captures slow user-visible behavior hidden by averages", ["They exclude slow queries", "They count rows", "They replace throughput"], "Contention and rare parameter shapes often dominate the tail."),
      q("What should follow an index addition?", "Remeasure query gains plus write, storage, and maintenance cost", ["Assume success", "Disable vacuum", "Remove constraints"], "Indexes accelerate selected reads while taxing every relevant write."),
    ],
  ),
  "sql:expert:Keyset pagination": lesson(
    "Keyset pagination resumes from the complete last ordering coordinate instead of discarding an increasing OFFSET. Correct implementation needs a deterministic unique order, matching composite comparison and index direction, opaque validated cursors, snapshot expectations, and separate forward/backward rules.",
    [
      { title: "Build a total order", body: "Append a unique immutable tie-breaker such as primary key to the business sort columns, define NULL placement explicitly, and encode every ordering value plus direction and filter version in the cursor." },
      { title: "Seek with the same shape", body: "For descending (created_at, id), fetch the next page with the matching row comparison less than the cursor, identical ORDER BY directions, LIMIT one extra, and an index beginning with filters then seek keys." },
      { title: "Define change semantics", body: "Concurrent inserts and updates can shift a live feed; document whether pagination is live, bounded by an initial watermark, or served from a stable snapshot, and reject stale or tampered cursors." },
    ],
    [
      q("Why include a unique tie-breaker?", "Rows sharing the primary sort value must not be skipped or repeated", ["To encrypt the cursor", "To avoid indexes", "To enable OFFSET"], "The cursor must identify one exact position in a total order."),
      q("What must match the seek predicate?", "The ORDER BY column sequence and direction", ["The table name only", "The page size only", "The connection pool"], "Mismatched comparison and ordering can create gaps or duplicates."),
      q("Why fetch page size plus one?", "To determine whether another page exists without a separate count", ["To lock all rows", "To update the cursor", "To increase duplicates"], "The extra row is a bounded continuation signal."),
      q("What is a limitation of keyset pagination?", "Arbitrary page-number jumps are not natural", ["It cannot use indexes", "It requires one row", "It only works ascending"], "It follows a sequence from a known coordinate rather than counting skipped rows."),
    ],
  ),
  "sql:expert:OLTP vs OLAP": lesson(
    "OLTP protects frequent small concurrent state changes; OLAP scans and aggregates large historical sets. Mixing them without isolation lets analytical scans consume CPU, memory, I/O, locks, and cache needed by user transactions, while blindly separating them introduces freshness and pipeline responsibilities.",
    [
      { title: "Recognize workload contracts", body: "OLTP favors indexed point access, normalized integrity, short transactions, high concurrency, and predictable tails; OLAP favors columnar or sequential processing, dimensional models, large joins, and throughput over one scan." },
      { title: "Choose an isolation strategy", body: "Use read replicas, warehouses, lakehouses, resource groups, materialized aggregates, or bounded analytical windows based on freshness, consistency, transformation, scale, and cost." },
      { title: "Govern the data path", body: "Capture changes with snapshots plus CDC, preserve ordering and idempotency, handle schema evolution and deletion, reconcile source totals, monitor lag, and identify which system owns each business truth." },
    ],
    [
      q("What characterizes OLTP?", "Small low-latency concurrent transactions with strong integrity", ["Only full-table scans", "No indexes", "Append-only files only"], "Operational systems serve current business state and mutations."),
      q("What characterizes OLAP?", "Large scans, joins, and aggregations over historical data", ["One-row updates", "Locking one account", "Request authentication"], "Analytical systems optimize exploration and reporting throughput."),
      q("Why offload analytics from a primary?", "Heavy scans can compete with latency-sensitive transactional work", ["Replicas remove freshness", "SQL differs", "Backups require it"], "Resource contention can degrade critical user operations."),
      q("What does CDC need for correctness?", "Ordering, replay safety, schema handling, and reconciliation", ["Only a network socket", "No primary keys", "Infinite retention"], "Distributed delivery may repeat, lag, or evolve."),
    ],
  ),
  "sql:expert:Dimensional modeling": lesson(
    "Dimensional modeling expresses analytical events at an explicit grain in fact tables and surrounds them with conformed descriptive dimensions. Correctness depends on never mixing grains, defining additive behavior, handling unknown members and late data, and preserving historical dimension meaning.",
    [
      { title: "Declare the fact grain first", body: "State exactly what one row represents—such as one relay reading per minute—then choose foreign keys, degenerate dimensions, event timestamps, measures, and uniqueness rules consistent with that grain." },
      { title: "Design dimensions for history", body: "Use stable warehouse surrogate keys, retain source natural keys, create conformed dimensions, and choose Type 1 overwrite, Type 2 effective-date history, or another explicit strategy per attribute." },
      { title: "Load and test reliably", body: "Resolve facts to the dimension version valid at event time, create unknown members, handle late-arriving dimensions and facts idempotently, reconcile counts and sums, and test joins for fanout." },
    ],
    [
      q("What must be decided before fact measures?", "The exact row grain", ["Dashboard color", "Connection count", "Backup compression"], "Every key and measure must describe the same event level."),
      q("What does an SCD Type 2 row preserve?", "Historical attribute versions with effective periods", ["Only the latest value", "Query plans", "WAL segments"], "Facts can join to the description that was valid when the event occurred."),
      q("What is a conformed dimension?", "A shared definition used consistently across fact tables", ["A temporary table", "A duplicate fact", "A cache entry"], "Common dimensions make metrics comparable across business processes."),
      q("Why use an unknown dimension member?", "Facts can load without losing referential integrity while a dimension is unresolved", ["To hide errors permanently", "To remove keys", "To duplicate totals"], "The pipeline can later restate or update according to policy."),
    ],
  ),
  "sql:expert:Distributed SQL": lesson(
    "Distributed SQL presents relational transactions across replicated ranges, but consensus, placement, clocks, network distance, hotspot keys, and distributed coordination determine real semantics and latency. SQL syntax compatibility does not make it a drop-in replacement for one PostgreSQL node.",
    [
      { title: "Map data to failure domains", body: "Choose replication factor, quorum, regions, leaseholder or leader placement, survival goals, and locality keys so dominant reads and writes avoid unnecessary wide-area consensus." },
      { title: "Minimize coordination", body: "Co-locate transactionally related rows, avoid monotonic hotspots, keep transactions short, understand isolation and retry errors, and use stable idempotency for whole-transaction re-execution." },
      { title: "Validate operational semantics", body: "Test schema-change behavior, secondary indexes, foreign keys, sequences, backup and restore, change feeds, connection pools, failover, consistency, latency tails, and cost under node and region failure." },
    ],
    [
      q("Why are cross-region writes slower?", "Consensus and transaction coordination cross network distance", ["SQL parsing changes", "Rows become text", "Indexes disappear"], "Durable agreement cannot beat the latency of required messages."),
      q("What creates a range hotspot?", "A key pattern concentrating writes on one leader or range", ["Even hash distribution", "Read-only replicas", "A backup file"], "Monotonic keys can route recent writes to one shard."),
      q("How should a retryable distributed transaction restart?", "From the complete transaction with bounded idempotent logic", ["Only the commit", "Only the last statement", "Forever"], "Reads and decisions from the aborted attempt may no longer be valid."),
      q("What must SQL compatibility testing include?", "Transactions, constraints, indexes, migrations, backups, and failure semantics", ["Only SELECT syntax", "Only a connection string", "Only data types"], "Operational and edge behavior varies substantially between systems."),
    ],
  ),
};

export function getRoundSixteenLessonEnrichment(track: LearningTrackId, pace: string, topic: string): LessonEnrichment | null {
  return ROUND_SIXTEEN_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
