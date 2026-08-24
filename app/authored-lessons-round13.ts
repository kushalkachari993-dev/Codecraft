import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_THIRTEEN_LESSONS: Record<string, LessonEnrichment> = {
  "python:expert:Memory internals": lesson(
    "Python memory behavior emerges from object headers, references, allocator arenas, container over-allocation, interning, and implementation-specific optimizations. Measuring retained object graphs matters more than treating shallow size as total ownership.",
    [
      { title: "Account for object structure", body: "An object includes type and reference metadata in addition to payload; containers store references whose targets may be shared with other owners." },
      { title: "Distinguish logical and resident memory", body: "CPython's allocator may retain arenas for reuse, so freed objects do not guarantee an immediate operating-system RSS decrease." },
      { title: "Measure the retention path", body: "Use tracemalloc snapshots, allocation diffs, and reference investigation around a representative workload instead of extrapolating from sys.getsizeof alone." },
    ],
    [
      { question: "What does sys.getsizeof(container) usually omit?", options: ["The full recursive size of referenced objects", "The container header", "The type pointer", "The shallow allocation"], answer: 0, explanation: "It reports shallow size and shared child objects need explicit ownership accounting." },
      { question: "Why may RSS remain high after objects are freed?", options: ["The allocator can retain arenas for reuse", "Garbage collection never works", "Every object is global", "Tuples leak by definition"], answer: 0, explanation: "Released Python blocks may stay within process-managed arenas." },
      { question: "What is interning?", options: ["Reusing one immutable object for equivalent values in selected cases", "Deep-copying every string", "Writing objects to disk", "Disabling references"], answer: 0, explanation: "Interning can reduce duplicates but is an optimization with limited guarantees." },
      { question: "Which tool tracks Python allocation snapshots?", options: ["tracemalloc", "asyncio", "sqlite3", "hashlib"], answer: 0, explanation: "tracemalloc records allocation traces and supports snapshot comparison." },
    ],
  ),
  "python:expert:Garbage collection": lesson(
    "CPython combines immediate reference counting with a cyclic garbage collector. Correct cleanup still requires explicit context managers because finalization timing, cycles, resurrection, interpreter shutdown, and non-memory resources cannot safely depend on collection.",
    [
      { title: "Separate the mechanisms", body: "Reference counts reclaim most objects when ownership reaches zero, while generational cycle detection finds unreachable reference loops." },
      { title: "Break retention deliberately", body: "Caches, callbacks, globals, tracebacks, tasks, and closures often keep objects reachable; inspect referrers and apply weak references only when ownership semantics fit." },
      { title: "Close resources explicitly", body: "Use with, async with, try/finally, or close methods for files, sockets, locks, and transactions instead of relying on __del__." },
    ],
    [
      { question: "What does CPython use for most immediate reclamation?", options: ["Reference counting", "Only a stop-the-world tracing collector", "Disk paging", "Asyncio"], answer: 0, explanation: "Counts reaching zero commonly trigger deallocation immediately." },
      { question: "What is the cyclic collector for?", options: ["Unreachable objects that reference one another", "Sorting lists", "Closing every socket", "Compiling bytecode"], answer: 0, explanation: "A cycle can keep every member's reference count above zero despite being unreachable." },
      { question: "Why avoid relying on __del__ for critical cleanup?", options: ["Finalization timing and shutdown conditions are unreliable", "It cannot be defined", "It always runs twice", "It removes context managers"], answer: 0, explanation: "External resources need deterministic release paths." },
      { question: "What does a weak reference avoid?", options: ["Keeping its target alive by ownership", "All race conditions", "Every memory allocation", "Type checking"], answer: 0, explanation: "Weak references observe objects without contributing a strong reference." },
    ],
  ),
  "python:expert:GIL/runtime model": lesson(
    "The CPython runtime coordinates bytecode evaluation, threads, frames, exceptions, imports, and memory management. The traditional GIL protects interpreter state but does not make application operations atomic or remove the need for locks; runtime behavior also evolves across Python builds.",
    [
      { title: "Know what the GIL covers", body: "In standard CPython one thread executes Python bytecode at a time per interpreter, while blocking I/O and selected native code may release the lock." },
      { title: "Do not infer data safety", body: "Thread switches can occur between logical steps, compound updates are not transactions, and C extensions may have their own concurrency rules." },
      { title: "Choose by workload and runtime", body: "Threads overlap I/O, processes provide isolation and CPU parallelism, asyncio schedules cooperative I/O, and free-threaded builds require explicit compatibility review." },
    ],
    [
      { question: "Does the GIL make a multi-step shared update safe?", options: ["No", "Yes, always", "Only for dictionaries", "Only with two threads"], answer: 0, explanation: "Logical operations can interleave and invariants still need synchronization." },
      { question: "When can another Python thread often run?", options: ["While one thread blocks on I/O that releases the GIL", "Only after process exit", "Never", "Only during imports"], answer: 0, explanation: "I/O wrappers commonly release interpreter execution so another thread can progress." },
      { question: "Why use processes for CPU-bound Python code?", options: ["Separate interpreters can execute on multiple cores", "They share every object automatically", "They remove serialization", "They guarantee lower latency"], answer: 0, explanation: "Process isolation avoids one interpreter lock but adds IPC and memory costs." },
      { question: "What must change for free-threaded execution?", options: ["Extension and application thread-safety must be reviewed", "Nothing ever", "SQL becomes invalid", "Async code stops working"], answer: 0, explanation: "Removing implicit interpreter serialization exposes previously hidden races." },
    ],
  ),
  "python:expert:Advanced threading": lesson(
    "Advanced threading is coordination engineering: ownership, locks, conditions, queues, cancellation, backpressure, exception propagation, and shutdown. Threads suit overlapping blocking work, but shared mutable state and unbounded submission create race and resource failures.",
    [
      { title: "Minimize shared ownership", body: "Prefer immutable messages and Queue handoff; when state must be shared, protect one documented invariant with a small lock scope and consistent lock order." },
      { title: "Bound producers and workers", body: "Use finite queues, worker counts, deadlines, and rejection or blocking policies so production cannot outrun processing indefinitely." },
      { title: "Engineer shutdown", body: "Signal cancellation, stop producers, drain or discard by policy, join non-daemon workers, surface exceptions, and never leave resources locked." },
    ],
    [
      { question: "Which primitive naturally transfers work between threads?", options: ["queue.Queue", "A global list without a lock", "os.fork only", "A descriptor"], answer: 0, explanation: "Queue provides synchronized put/get operations and optional capacity." },
      { question: "Why keep a lock scope small?", options: ["To reduce contention while protecting one clear invariant", "To make operations non-atomic", "To disable errors", "To increase worker count"], answer: 0, explanation: "Locks should cover the necessary state transition, not unrelated slow work." },
      { question: "What commonly prevents deadlocks?", options: ["A consistent global lock acquisition order", "Longer timeouts only", "More daemon threads", "Removing logs"], answer: 0, explanation: "Cycles cannot form when every participant acquires resources in the same order." },
      { question: "Why avoid daemon threads for required work?", options: ["The process may exit without cleanup or completion", "They cannot run functions", "They use processes", "They never share state"], answer: 0, explanation: "Daemon threads are abandoned at interpreter shutdown." },
    ],
  ),
  "python:expert:Multiprocessing": lesson(
    "Multiprocessing provides isolated interpreters and CPU parallelism at the cost of startup, serialization, copied state, IPC, and operational complexity. Task size, start method, memory behavior, failure recovery, and deterministic shutdown decide whether it outperforms serial work.",
    [
      { title: "Budget serialization", body: "Process arguments and results generally cross a pickle boundary; keep tasks coarse enough to amortize transfer and avoid non-picklable closures or live resources." },
      { title: "Choose the start method", body: "spawn creates a fresh interpreter, fork copies process state with important thread/resource hazards, and platform defaults affect portability." },
      { title: "Control lifecycle", body: "Guard entry points, bound workers and queued tasks, propagate failures, apply timeouts, close pools, and terminate only with a clear partial-work policy." },
    ],
    [
      { question: "What cost often dominates tiny process-pool tasks?", options: ["Scheduling and serialization overhead", "Dictionary lookup", "A local addition", "String formatting only"], answer: 0, explanation: "Cross-process coordination can exceed the useful computation." },
      { question: "Why use if __name__ == '__main__'?", options: ["To prevent child startup from recursively running process creation", "To enable hashing", "To release the GIL", "To create SQL indexes"], answer: 0, explanation: "Spawn imports the main module in child interpreters." },
      { question: "What does process isolation mean?", options: ["Normal Python objects are not automatically shared", "Every global update is visible", "No IPC is possible", "Failures cannot occur"], answer: 0, explanation: "Communication needs serialization, shared memory, queues, pipes, or external storage." },
      { question: "When is a process pool most promising?", options: ["Coarse CPU-bound independent tasks", "Thousands of microsecond tasks", "One blocking socket only", "A shared mutable GUI"], answer: 0, explanation: "Substantial computation can amortize process and transfer overhead." },
    ],
  ),
  "python:expert:Advanced Asyncio": lesson(
    "Advanced asyncio depends on structured concurrency, cancellation-safe cleanup, deadlines, backpressure, task ownership, and isolation of blocking work. Awaiting is a cooperative scheduling boundary, not a guarantee of fairness, parallel CPU execution, or automatic resource safety.",
    [
      { title: "Own task lifetimes", body: "Use TaskGroup or another structured scope so child success, failure, cancellation, and cleanup remain attached to the parent operation." },
      { title: "Propagate cancellation", body: "Apply deadlines at boundaries, let CancelledError unwind after cleanup, and avoid catching BaseException or suppressing cancellation accidentally." },
      { title: "Apply backpressure", body: "Bound queues and concurrency with Queue or Semaphore, cancel upstream work on disconnect, and move blocking/CPU work off the event-loop thread." },
    ],
    [
      { question: "What does TaskGroup provide?", options: ["A structured lifetime and failure boundary for related tasks", "CPU parallelism automatically", "A database transaction", "Permanent background tasks"], answer: 0, explanation: "The parent waits for and coordinates the child task group." },
      { question: "What should code usually do after cancellation cleanup?", options: ["Re-raise or allow CancelledError to propagate", "Convert it to success", "Start an unbounded retry", "Block forever"], answer: 0, explanation: "Suppressing cancellation breaks caller deadlines and shutdown." },
      { question: "Where should blocking I/O run?", options: ["In a compatible thread or executor, not directly on the event loop", "Inside every coroutine directly", "Only in a signal handler", "In a descriptor"], answer: 0, explanation: "Blocking the loop prevents all other coroutines from making progress." },
      { question: "How does a bounded async queue help?", options: ["It propagates backpressure to producers", "It removes memory limits", "It makes CPU work parallel", "It grants tool permissions"], answer: 0, explanation: "Producers must wait rather than creating unlimited pending work." },
    ],
  ),
  "sql:expert:Storage internals": lesson(
    "PostgreSQL maps logical rows onto heap pages, tuple headers, relation forks, TOAST storage, free-space maps, visibility maps, and indexes. Physical size and locality include version churn, alignment, page fill, indexes, and auxiliary storage—not just declared column widths.",
    [
      { title: "Trace a heap tuple", body: "A row version carries transaction visibility metadata and line-pointer placement inside a fixed-size page; UPDATE generally creates a new version." },
      { title: "Follow auxiliary storage", body: "Large values may be compressed or moved to TOAST, while FSM guides placement and VM marks pages useful for vacuum and index-only scans." },
      { title: "Measure each fork", body: "Compare heap, indexes, TOAST, and total relation size, then relate growth to workload, fillfactor, updates, and maintenance." },
    ],
    [
      { question: "Where do PostgreSQL table rows normally live?", options: ["Heap pages", "Only indexes", "WAL only", "Client memory"], answer: 0, explanation: "Indexes point to tuple locations in the heap for ordinary tables." },
      { question: "What is TOAST for?", options: ["Compressing or storing oversized attributes out of line", "Joining tables", "Granting roles", "Scheduling vacuum"], answer: 0, explanation: "Large variable-width values may not fit conveniently in the main heap tuple." },
      { question: "What does the visibility map track?", options: ["Pages whose tuples are all visible and/or frozen", "User passwords", "Join order", "Network routes"], answer: 0, explanation: "It supports vacuum decisions and heap avoidance for index-only scans." },
      { question: "Why can an UPDATE increase storage?", options: ["MVCC creates a new tuple version", "SQL text is saved in the row", "Every update creates a database", "Indexes disappear"], answer: 0, explanation: "The old version remains until no snapshot needs it and vacuum can reclaim space." },
    ],
  ),
  "sql:expert:MVCC": lesson(
    "MVCC lets readers and writers overlap by storing row versions and applying snapshot visibility rules. It reduces read/write blocking but still uses locks for writes, creates dead tuples, and lets long transactions delay vacuum, freeze progress, and storage reuse.",
    [
      { title: "Read through a snapshot", body: "A snapshot records visible transaction boundaries; tuple xmin/xmax and transaction status decide which version the statement or transaction may see." },
      { title: "Update by versioning", body: "An update creates a replacement tuple and marks the old version, with HOT updates possible when indexed columns are unchanged and page space permits." },
      { title: "Protect cleanup", body: "Monitor old transactions, replication slots, and idle-in-transaction sessions because they can preserve old versions and increase bloat or wraparound pressure." },
    ],
    [
      { question: "What determines which tuple version a query sees?", options: ["Its snapshot and tuple transaction metadata", "Only wall-clock time", "Index name", "Connection pool size"], answer: 0, explanation: "MVCC visibility follows transaction IDs and snapshot rules." },
      { question: "Does MVCC remove write locks?", options: ["No", "Yes", "Only for primary keys", "Only after vacuum"], answer: 0, explanation: "Writers still coordinate conflicting row changes and other operations." },
      { question: "What can prevent removal of old row versions?", options: ["A long-running transaction whose snapshot may still need them", "A short alias", "A GIN index only", "A SELECT list"], answer: 0, explanation: "Vacuum cannot reclaim versions visible to an active snapshot." },
      { question: "When is a HOT update possible?", options: ["Indexed columns do not change and the page has room", "Every update", "Only after restart", "When all indexes are dropped"], answer: 0, explanation: "Heap-only tuple chaining avoids new index entries under those conditions." },
    ],
  ),
  "sql:expert:Vacuum": lesson(
    "VACUUM is correctness and maintenance infrastructure: it marks dead tuple space reusable, advances freezing against transaction-ID wraparound, updates visibility information, and can analyze statistics. Autovacuum must be tuned per workload rather than disabled when it becomes visible.",
    [
      { title: "Separate reclaim from shrink", body: "Regular vacuum makes internal space reusable but usually does not return relation files to the operating system; rewriting options have stronger locks and costs." },
      { title: "Tune from churn", body: "Threshold plus scale factor can be too slow for large high-churn tables; monitor dead tuples, modification rate, duration, cost delay, and freeze age." },
      { title: "Remove blockers", body: "Old snapshots, abandoned transactions, and replication slots can hold xmin back; solve retention before blaming vacuum throughput." },
    ],
    [
      { question: "What does regular VACUUM primarily do with dead space?", options: ["Marks it reusable inside the relation", "Always shrinks the file", "Deletes the table", "Creates replicas"], answer: 0, explanation: "Physical compaction to the OS usually requires different, more disruptive operations." },
      { question: "Why is anti-wraparound vacuum mandatory?", options: ["Transaction ID visibility must remain correct", "It improves CSS", "It rotates API keys", "It creates indexes"], answer: 0, explanation: "Unfrozen old transaction IDs risk catastrophic visibility ambiguity." },
      { question: "What can hold back vacuum cleanup?", options: ["Long transactions or stale replication slots", "Column aliases", "Prepared statements alone", "A small result set"], answer: 0, explanation: "Old xmin horizons mean row versions may still be required." },
      { question: "What does VACUUM ANALYZE additionally refresh?", options: ["Planner statistics", "Application passwords", "WAL archives", "Table ownership"], answer: 0, explanation: "ANALYZE samples data distributions for cardinality estimates." },
    ],
  ),
  "sql:expert:Advanced transactions": lesson(
    "Advanced transaction design coordinates retries, idempotency, savepoints, advisory locks, and remote side effects without pretending one PostgreSQL commit can atomically control the network. Outbox/inbox patterns and explicit state machines bridge local durability to distributed workflows.",
    [
      { title: "Commit local intent and event", body: "Write domain state and an outbox record in one transaction, then deliver asynchronously with retries and a stable event identifier." },
      { title: "Make consumers idempotent", body: "Record processed message IDs or use an inbox so duplicate delivery cannot repeat the logical transition." },
      { title: "Retry the unit safely", body: "On serialization or deadlock abort, roll back and retry the complete transaction with a bounded policy, fresh snapshot, and idempotency protection." },
    ],
    [
      { question: "Can a PostgreSQL transaction atomically commit an arbitrary HTTP call?", options: ["No", "Yes, always", "Only with JSONB", "Only in serializable mode"], answer: 0, explanation: "The remote system does not participate in the local database commit." },
      { question: "What does the outbox pattern guarantee locally?", options: ["Business state and delivery intent commit together", "Exactly-once global execution automatically", "No retries", "Zero latency"], answer: 0, explanation: "A worker can later publish durable undelivered events." },
      { question: "Why use an inbox or processed-event key?", options: ["To make duplicate message delivery idempotent", "To increase lock duration", "To disable transactions", "To avoid constraints"], answer: 0, explanation: "At-least-once delivery must not repeat the business effect." },
      { question: "What should a serialization retry rerun?", options: ["The complete transaction decision", "Only the last UPDATE", "The already committed remote action", "A random statement"], answer: 0, explanation: "A new snapshot may change every read-dependent decision." },
    ],
  ),
  "sql:expert:Deadlocks": lesson(
    "A deadlock is a cycle of transactions each holding a resource another needs. PostgreSQL detects the cycle and aborts one participant, but prevention depends on short transactions, consistent lock order, narrow lock scope, and retry-safe application logic.",
    [
      { title: "Reconstruct the wait graph", body: "Read the deadlock report to identify processes, statements, lock types, and the exact resource acquisition sequence that formed the cycle." },
      { title: "Remove cyclic order", body: "Sort entity identifiers and acquire locks in one canonical order across every code path; avoid waiting on remote work while holding database locks." },
      { title: "Recover correctly", body: "Roll back the aborted transaction, apply bounded randomized backoff, rerun the complete idempotent unit, and track deadlock rate as an engineering signal." },
    ],
    [
      { question: "What does PostgreSQL do after detecting a deadlock?", options: ["Aborts one transaction to break the cycle", "Waits forever", "Commits both", "Drops the tables"], answer: 0, explanation: "One participant receives a deadlock-detected error and must roll back." },
      { question: "What prevents many multi-row deadlocks?", options: ["Acquiring rows in a consistent key order", "Increasing lock timeout", "More indexes only", "Longer transactions"], answer: 0, explanation: "A global order removes the circular wait direction." },
      { question: "Why does a longer lock timeout not solve a deadlock?", options: ["A cycle cannot resolve through waiting alone", "Timeouts create indexes", "Locks are read-only", "Deadlocks occur only at startup"], answer: 0, explanation: "At least one transaction must release resources by aborting." },
      { question: "How should the application recover?", options: ["Retry the complete safe transaction with bounded backoff", "Commit partial work", "Retry forever immediately", "Ignore the error"], answer: 0, explanation: "The aborted unit lost all work and must make its decision again." },
    ],
  ),
  "genai:expert:Evaluation engineering": lesson(
    "Evaluation engineering turns product intent into versioned datasets, metrics, graders, baselines, confidence intervals, release gates, and production feedback. A useful evaluation predicts real failures, resists leakage, and explains which behavior changed rather than producing one vanity score.",
    [
      { title: "Define the behavior contract", body: "Decompose quality into correctness, groundedness, completeness, safety, style, latency, and cost with scenario-specific pass criteria." },
      { title: "Build trustworthy data", body: "Collect representative slices, hard cases, adversarial cases, temporal holdouts, and human labels with provenance, rubrics, disagreement review, and leakage control." },
      { title: "Operate the gate", body: "Compare against a baseline with uncertainty, inspect slice regressions, calibrate automated graders, version everything, and connect escaped failures back into the suite." },
    ],
    [
      { question: "What makes an evaluation actionable?", options: ["It maps product behavior to explicit pass/fail evidence", "It has one large number", "It uses only synthetic easy prompts", "It never changes"], answer: 0, explanation: "Teams need to know which requirement regressed and why." },
      { question: "Why maintain temporal holdouts?", options: ["To reduce training and prompt-development leakage", "To increase context length", "To avoid baselines", "To grant tools"], answer: 0, explanation: "Repeated exposure can turn a test into development data." },
      { question: "What should an LLM judge be calibrated against?", options: ["A reviewed human-labeled sample", "Itself only", "Model price", "Token count"], answer: 0, explanation: "Automated graders have bias, inconsistency, and rubric failure modes." },
      { question: "Why inspect slices?", options: ["Aggregate improvements can hide severe subgroup regressions", "Slices reduce storage", "They replace metrics", "They disable confidence intervals"], answer: 0, explanation: "Critical use cases need their own visibility and gates." },
    ],
  ),
  "genai:expert:Agent evaluation": lesson(
    "Agent evaluation must judge trajectories and outcomes: planning, tool selection, argument correctness, authorization, state transitions, recovery, cost, and side effects. Final-answer quality alone can hide unsafe or wasteful paths that happened to end successfully.",
    [
      { title: "Instrument the trajectory", body: "Capture observations, decisions, tool calls, approvals, state changes, retries, costs, and terminal reason with sensitive data controls." },
      { title: "Use controlled environments", body: "Provide deterministic mock tools, fault injection, seeded state, and resettable sandboxes so success and side effects can be verified reproducibly." },
      { title: "Score multiple layers", body: "Evaluate task outcome, path efficiency, policy compliance, recovery, idempotency, calibration, and human escalation across scenario and risk slices." },
    ],
    [
      { question: "Why evaluate an agent trajectory?", options: ["A correct final answer can conceal unsafe actions or wasted loops", "Only token counts matter", "Tools never fail", "Outcomes are irrelevant"], answer: 0, explanation: "Process-level behavior determines safety, cost, and reliability." },
      { question: "What makes a tool sandbox useful for evaluation?", options: ["Side effects and failures are deterministic and inspectable", "It grants production access", "It removes authorization", "It trains the model"], answer: 0, explanation: "Repeatable state lets tests assert both actions and outcomes." },
      { question: "What should a high-risk scenario test?", options: ["Approval and authorization before the action", "Only response fluency", "Only latency", "Only memory recall"], answer: 0, explanation: "The agent must not cross deterministic action boundaries." },
      { question: "Which metric detects inefficient looping?", options: ["Steps or tool calls to successful completion", "Final punctuation", "Model parameter count", "Database size"], answer: 0, explanation: "Path length and repeated actions reveal costly no-progress behavior." },
    ],
  ),
  "genai:expert:Observability": lesson(
    "GenAI observability connects requests, retrieval, model calls, tool actions, policy decisions, latency, tokens, cost, quality signals, and feedback in one privacy-aware trace. It must support debugging without turning prompts, secrets, or user data into a new exposure surface.",
    [
      { title: "Trace the full request", body: "Link a request ID through routing, context assembly, retrieval, model generation, agent steps, tool calls, validation, and response delivery." },
      { title: "Separate signals", body: "Metrics reveal trends, traces explain one path, logs capture discrete events, and evaluation/feedback measures semantic quality that infrastructure telemetry cannot." },
      { title: "Govern telemetry", body: "Redact or tokenize sensitive fields, restrict access, set retention, sample intentionally, log policy decisions instead of secrets, and support deletion obligations." },
    ],
    [
      { question: "What does a distributed trace provide?", options: ["The causal path and timing of one request across components", "Only aggregate CPU", "A training dataset", "A user permission"], answer: 0, explanation: "Spans connect retrieval, model, and tool work into one debuggable timeline." },
      { question: "Can latency and error metrics prove answer correctness?", options: ["No", "Yes", "Only for RAG", "Only with streaming"], answer: 0, explanation: "Semantic quality needs evaluations, feedback, or reviewed signals." },
      { question: "What should logs avoid by default?", options: ["Raw secrets and unnecessary personal content", "Request identifiers", "Error categories", "Timing"], answer: 0, explanation: "Observability systems are high-volume data stores and need minimization." },
      { question: "Why attach model and prompt versions to traces?", options: ["To attribute regressions to the exact release configuration", "To increase generation randomness", "To disable caching", "To create roles"], answer: 0, explanation: "Without version lineage, comparing behavior across deployments is unreliable." },
    ],
  ),
  "genai:expert:Cost optimization": lesson(
    "GenAI cost optimization preserves required quality and reliability while reducing unnecessary tokens, model work, retrieval, tool calls, retries, and idle capacity. Unit economics must include infrastructure, evaluation, moderation, observability, and human review—not API price alone.",
    [
      { title: "Measure cost per useful outcome", body: "Attribute input/output tokens, cache reads, retrieval, tools, accelerators, retries, and review to tenant, feature, model version, and successful task." },
      { title: "Remove waste in order", body: "Shorten redundant context, cache safe stable prefixes/results, batch when latency allows, stop loops, route simple tasks down, and optimize serving utilization." },
      { title: "Keep quality gates", body: "Compare savings against correctness, groundedness, safety, tail latency, fallback rate, and customer value; reject cheaper regressions that create downstream work." },
    ],
    [
      { question: "What is the best primary cost denominator?", options: ["A successful useful product outcome", "One raw request", "One server process", "One character"], answer: 0, explanation: "Retries, failures, and low-quality results distort request-level price." },
      { question: "What is a safe first optimization target?", options: ["Redundant context and repeated avoidable calls", "Safety checks", "Authorization", "All evaluation"], answer: 0, explanation: "Waste can often be removed without reducing capability or controls." },
      { question: "Why segment cost by tenant or feature?", options: ["Aggregate averages hide expensive workflows and misuse", "It changes model weights", "It guarantees profit", "It removes storage"], answer: 0, explanation: "Attribution reveals which outcomes drive spend and value." },
      { question: "When should a smaller model be routed a task?", options: ["When evaluations show it meets the task's quality and risk requirements", "Whenever it is cheaper", "For every high-risk action", "Without monitoring"], answer: 0, explanation: "Cost routing needs capability and safety evidence, plus fallback." },
    ],
  ),
  "genai:expert:Model routing": lesson(
    "Model routing selects among models, tools, retrieval, caches, and fallback paths using task requirements, risk, capability, latency, cost, availability, and tenant policy. A router is a production decision system requiring calibration, exploration controls, and end-to-end evaluation.",
    [
      { title: "Extract routing features safely", body: "Use intent, modality, context length, required tools, risk class, latency tier, tenant policy, and uncertainty without leaking sensitive content into logs or training." },
      { title: "Route with guardrails", body: "Enforce hard capability and authorization constraints first, then choose among eligible paths using calibrated quality, cost, and availability estimates." },
      { title: "Learn without destabilizing", body: "Shadow new policies, bound exploration, preserve sticky behavior where needed, record counterfactual candidates, and retain deterministic fallback and rollback." },
    ],
    [
      { question: "What should happen before cost-based model selection?", options: ["Filter by required capability, safety, and policy constraints", "Choose the cheapest model", "Ignore modality", "Disable fallback"], answer: 0, explanation: "Ineligible paths must never win merely because they are inexpensive." },
      { question: "Why calibrate router confidence?", options: ["Fallback thresholds need predicted confidence to match actual success", "It increases context length", "It removes tools", "It creates embeddings"], answer: 0, explanation: "Overconfidence sends difficult tasks to paths unlikely to succeed." },
      { question: "What is shadow routing?", options: ["Scoring a candidate policy without letting it control the response", "Hiding every trace", "Routing without authorization", "Deleting the baseline"], answer: 0, explanation: "It gathers comparative evidence with low production impact." },
      { question: "What should a router fallback handle?", options: ["Low confidence, overload, failure, or missing capability", "Only punctuation", "Only cache hits", "Only training loss"], answer: 0, explanation: "Fallback is part of reliability and must itself be bounded and observed." },
    ],
  ),
};

export function getRoundThirteenLessonEnrichment(track: LearningTrackId, pace: string, topic: string): LessonEnrichment | null {
  return ROUND_THIRTEEN_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
