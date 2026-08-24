import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_TWELVE_LESSONS: Record<string, LessonEnrichment> = {
  "python:expert:Object model": lesson(
    "Python's object model explains why classes, functions, modules, and values all support runtime inspection and delegation. Understanding identity, type, namespaces, binding, MRO, and attribute lookup turns seemingly magical behavior into a predictable protocol.",
    [
      { title: "Trace the namespaces", body: "An instance usually holds per-object state, its class holds shared behavior, and base classes extend the search through the method resolution order." },
      { title: "Follow attribute lookup", body: "Data descriptors take priority over instance storage, followed by non-data descriptors or class attributes and finally __getattr__ fallback." },
      { title: "Understand binding", body: "A function stored on a class is a descriptor; access through an instance produces a bound method carrying that instance as __self__." },
    ],
    [
      { question: "What three properties does every Python object have?", options: ["Identity, type, and value or state", "Only a variable name", "A file path and process", "A database row"], answer: 0, explanation: "Names reference objects; the object itself has identity, a governing type, and state or value." },
      { question: "Where is normal instance state usually stored?", options: ["The instance __dict__", "The class __mro__", "The module loader", "The call stack permanently"], answer: 0, explanation: "Unless slots or custom storage intervene, per-instance attributes live in a dictionary." },
      { question: "What is a bound method?", options: ["A function paired with the instance it was accessed through", "A frozen class", "A global lambda", "A copied module"], answer: 0, explanation: "Descriptor binding supplies the instance automatically as the first argument." },
      { question: "What determines cooperative multiple-inheritance lookup order?", options: ["The class MRO", "Dictionary insertion only", "File order only", "Object IDs"], answer: 0, explanation: "Python computes a consistent C3 method resolution order for the hierarchy." },
    ],
  ),
  "python:expert:Dunder methods": lesson(
    "Dunder methods connect user-defined types to Python syntax and built-in protocols. Expert implementation is less about adding every hook and more about preserving expected semantics for representation, equality, hashing, ordering, iteration, arithmetic, and resource management.",
    [
      { title: "Implement a coherent protocol", body: "Choose only operations the domain truly supports and return NotImplemented for unsupported cross-type comparisons so Python can try reflected behavior." },
      { title: "Keep equality and hashing aligned", body: "Equal objects must hash equally; values used for hashing must remain stable, so mutable value objects should normally be unhashable." },
      { title: "Separate user and developer views", body: "__repr__ should be unambiguous and diagnostic, while __str__ may be friendly; both must avoid expensive work or hidden side effects." },
    ],
    [
      { question: "What should __eq__ return for an unsupported type?", options: ["NotImplemented", "True", "An arbitrary hash", "Always raise TypeError"], answer: 0, explanation: "NotImplemented lets Python try the other operand or conclude the comparison safely." },
      { question: "What rule links equality and hashing?", options: ["Equal objects must have equal hashes", "Different objects must have unique hashes", "Mutable hashes are preferred", "Only strings may be hashed"], answer: 0, explanation: "Hash containers rely on equal keys reaching compatible lookup buckets." },
      { question: "Which hook powers len(value)?", options: ["__len__", "__size__", "__count__", "__items__"], answer: 0, explanation: "The built-in delegates to the length protocol's __len__ method." },
      { question: "Why avoid hidden I/O in __repr__?", options: ["Debuggers and logs may call it unexpectedly", "repr cannot return text", "It disables inheritance", "It changes the MRO"], answer: 0, explanation: "Representations should remain safe, fast, and dependable during failure investigation." },
    ],
  ),
  "python:expert:Descriptors": lesson(
    "Descriptors are reusable attribute policies implemented by objects defining __get__, __set__, or __delete__. They power methods, properties, slots, ORM fields, and validation while fitting into a precise precedence order that must avoid recursion and shared-instance state bugs.",
    [
      { title: "Know the two categories", body: "A data descriptor defines __set__ or __delete__ and outranks instance storage; a non-data descriptor can be shadowed by an instance attribute." },
      { title: "Name storage safely", body: "Use __set_name__ to derive a private storage key, then access instance.__dict__ directly rather than assigning through the public descriptor name." },
      { title: "Handle class access", body: "When __get__ receives instance=None, return the descriptor itself so introspection and class-level configuration remain possible." },
    ],
    [
      { question: "What makes a descriptor a data descriptor?", options: ["Defining __set__ or __delete__", "Defining __repr__ only", "Being stored in an instance", "Returning a number"], answer: 0, explanation: "Mutation hooks give the descriptor precedence over an instance dictionary entry." },
      { question: "When is __set_name__ called?", options: ["When the owning class is created", "Every attribute read", "At interpreter shutdown", "Only during pickling"], answer: 0, explanation: "Class creation tells the descriptor its owner and assigned attribute name." },
      { question: "What should __get__(None, owner) often return?", options: ["The descriptor object itself", "A new instance", "Always None", "The owner's __dict__"], answer: 0, explanation: "Class-level access should support introspection without requiring an instance value." },
      { question: "Why not store a field value directly on the descriptor object?", options: ["One descriptor is shared by all owning instances", "Descriptors cannot store attributes", "It changes syntax", "It disables validation"], answer: 0, explanation: "Per-instance values need instance-keyed storage or the instance dictionary." },
    ],
  ),
  "python:expert:Metaclasses": lesson(
    "A metaclass controls class creation the way a class controls instance creation. It can validate declarations, build registries, or transform namespaces, but it affects an entire hierarchy and should be chosen only when decorators or __init_subclass__ cannot express the invariant cleanly.",
    [
      { title: "Trace class construction", body: "Python chooses a metaclass, prepares the namespace, executes the class body, then calls metaclass creation and initialization before binding the class name." },
      { title: "Validate declarations", body: "A metaclass can reject missing fields, duplicate plugin codes, or invalid methods at import time, producing early and consistent failures." },
      { title: "Prefer the simplest hook", body: "Use a class decorator for one transformation, __init_subclass__ for hierarchy-local registration, and a metaclass only for deeper creation control or composition." },
    ],
    [
      { question: "What is the default metaclass for normal Python classes?", options: ["type", "object", "module", "property"], answer: 0, explanation: "type creates most classes and is itself a class." },
      { question: "When does metaclass validation commonly fail?", options: ["During class definition or import", "Only after every instance is deleted", "Only during hashing", "Only in another process"], answer: 0, explanation: "The class object is constructed immediately after its body executes." },
      { question: "Which simpler hook can register direct subclasses?", options: ["__init_subclass__", "__len__", "__missing__", "__enter__"], answer: 0, explanation: "A base class can react whenever a subclass is created without a custom metaclass." },
      { question: "What is a metaclass conflict?", options: ["Base classes require incompatible metaclasses", "Two instances compare equal", "A module imports twice", "A descriptor returns itself"], answer: 0, explanation: "The derived class needs a metaclass compatible with the metaclasses of every base." },
    ],
  ),
  "sql:expert:Query optimizer": lesson(
    "PostgreSQL's optimizer explores legal scans, join orders, and physical operators, then estimates cost from statistics and configuration. Plan quality depends heavily on cardinality estimates, parameter values, correlation, and available paths—not on SQL text aesthetics.",
    [
      { title: "Separate logical and physical plans", body: "SQL states the requested result; the optimizer rewrites equivalent expressions and selects scans, joins, aggregation, ordering, and parallel paths." },
      { title: "Follow cardinality", body: "Estimated rows feed almost every later cost decision, so histogram, most-common-value, null fraction, distinct count, and correlation errors compound through the tree." },
      { title: "Account for plan stability", body: "Generic versus custom prepared plans, changing data distribution, statistics targets, cost settings, and schema changes can alter the chosen path." },
    ],
    [
      { question: "What most strongly influences downstream plan cost estimates?", options: ["Estimated row counts", "SQL capitalization", "Alias length", "Comment style"], answer: 0, explanation: "Cardinality determines expected work for joins, sorts, aggregates, and repeated loops." },
      { question: "What is SQL's role relative to the optimizer?", options: ["It declares the result while the optimizer chooses physical execution", "It fixes one physical algorithm", "It disables statistics", "It guarantees an index scan"], answer: 0, explanation: "Relational equivalence permits many valid physical plans." },
      { question: "What can extended statistics describe?", options: ["Dependencies or correlation across columns", "Only table names", "Network latency", "User passwords"], answer: 0, explanation: "Single-column statistics can misestimate correlated predicates." },
      { question: "Why might a prepared statement use a generic plan?", options: ["To amortize planning when one plan is acceptable across values", "To ignore all indexes", "To remove parameters", "To force parallelism"], answer: 0, explanation: "PostgreSQL balances custom-plan benefit against repeated planning cost." },
    ],
  ),
  "sql:expert:Execution internals": lesson(
    "The PostgreSQL executor pulls tuples through a plan tree of scans, joins, sorts, aggregates, and materialization nodes. Actual work is revealed by rows, loops, buffers, temporary I/O, and per-node timing rather than the top-line duration alone.",
    [
      { title: "Read the tree bottom-up", body: "Child nodes produce tuples for parents; indentation shows ownership, and inclusive parent timing means child work must not be added blindly." },
      { title: "Multiply by loops", body: "Per-loop rows and time become significant when an inner node is executed thousands of times by a nested loop." },
      { title: "Locate material work", body: "Filters, heap fetches, sorts, hash batches, temporary blocks, and memory use reveal where tuples are discarded, revisited, or spilled." },
    ],
    [
      { question: "How do most executor nodes obtain rows?", options: ["By requesting tuples from child nodes", "By parsing CSS", "By creating a backup", "By contacting every client"], answer: 0, explanation: "PostgreSQL's iterator-style plan tree pulls data upward." },
      { question: "Why inspect loops?", options: ["Per-loop work may repeat many times", "Loops change table ownership", "They disable indexes", "They represent users"], answer: 0, explanation: "A small inner operation can dominate total work after multiplication." },
      { question: "What do rows removed by filter indicate?", options: ["Tuples produced then discarded at that node", "Rows deleted from the table", "Missing backups", "Index corruption"], answer: 0, explanation: "Large filter removal can reveal wasted scanning or a poorly placed predicate." },
      { question: "What can temporary read/write blocks signal?", options: ["A sort or hash operation spilled beyond memory", "A transaction committed", "A role logged in", "A view was created"], answer: 0, explanation: "Disk-backed temporary work is often slower than an in-memory operation." },
    ],
  ),
  "sql:expert:Advanced EXPLAIN": lesson(
    "Advanced EXPLAIN connects planning estimates with actual execution, buffers, WAL, I/O timing, settings, memory, parallel workers, and serialization formats. It is powerful evidence, but ANALYZE executes the statement and one warm run is not a workload benchmark.",
    [
      { title: "Capture safe evidence", body: "Use a transaction and rollback for write analysis, choose representative parameters, record cache state, and include BUFFERS, WAL, SETTINGS, and SUMMARY when relevant." },
      { title: "Diagnose estimate error", body: "Compare estimated and actual rows at the earliest divergent node before changing indexes or planner settings downstream." },
      { title: "Compare controlled runs", body: "Change one factor, repeat enough times, track planning and execution separately, and validate concurrency and production-scale data outside one plan capture." },
    ],
    [
      { question: "What crucial behavior does EXPLAIN ANALYZE add?", options: ["It executes the statement and records actual metrics", "It only formats SQL", "It creates statistics automatically", "It guarantees no writes"], answer: 0, explanation: "Write statements can change data unless protected by a rollback strategy." },
      { question: "What do shared hit blocks mean?", options: ["Pages were found in PostgreSQL's shared buffer cache", "Rows were updated", "Network packets arrived", "WAL was archived"], answer: 0, explanation: "Hits avoid a storage read but still represent buffer work." },
      { question: "What does the WAL option help measure?", options: ["Write-ahead-log records and bytes generated by execution", "Selectivity statistics", "Client rendering", "Object identity"], answer: 0, explanation: "It exposes durability-related write amplification for modifying statements." },
      { question: "Why is one warm plan insufficient?", options: ["It omits workload variance, cold cache, and concurrency", "Plans never include rows", "EXPLAIN cannot show indexes", "SQL cannot be benchmarked"], answer: 0, explanation: "Representative performance needs controlled repeated workload measurement." },
    ],
  ),
  "sql:expert:Join algorithms": lesson(
    "Nested-loop, hash, and merge joins implement relational matching with different requirements and failure modes. The best choice follows cardinality, ordering, equality support, indexes, memory, and rescans—not a universal ranking of algorithms.",
    [
      { title: "Recognize nested-loop strengths", body: "A small outer input paired with a cheap indexed inner lookup can outperform structures that must scan or build larger inputs." },
      { title: "Budget a hash join", body: "Equality joins can build a hash table from one side; poor estimates or low work_mem create multiple batches and temporary I/O." },
      { title: "Use ordered streams", body: "Merge joins consume compatible sorted inputs and can exploit existing index order, especially when both sides are large or ordered output helps." },
    ],
    [
      { question: "When is a nested loop often effective?", options: ["A small outer side with cheap indexed inner probes", "Two huge unindexed tables always", "Only non-equality joins never", "No join condition"], answer: 0, explanation: "The repeated inner operation remains cheap when few outer rows and selective indexes are present." },
      { question: "Which join requires an equality-compatible condition?", options: ["Hash join", "Every nested loop", "Cartesian join only", "No physical join"], answer: 0, explanation: "Hashing groups candidate rows by equality keys." },
      { question: "What can cause a hash join to batch?", options: ["The build table exceeds available hash memory", "An alias is too short", "The query uses SELECT", "A role is NOLOGIN"], answer: 0, explanation: "Partitions are written and revisited when the hash table cannot stay in memory." },
      { question: "What input property helps a merge join?", options: ["Both sides are ordered by compatible join keys", "Both sides are JSON only", "One side is empty always", "The query has no predicates"], answer: 0, explanation: "Merge joins advance through sorted streams without a hash table." },
    ],
  ),
  "sql:expert:Index internals": lesson(
    "PostgreSQL index access methods—B-tree, hash, GIN, GiST, SP-GiST, and BRIN—encode different operator semantics and physical tradeoffs. Index-only scans, page splits, deduplication, pending lists, visibility, bloat, and vacuum all connect logical access to storage maintenance.",
    [
      { title: "Match operators to an access method", body: "B-tree supports ordered equality and ranges, GIN suits multi-valued containment, GiST/SP-GiST support extensible spatial-like searches, and BRIN summarizes correlated block ranges." },
      { title: "Understand index-only limits", body: "An index can cover requested columns, but PostgreSQL still checks heap visibility unless the visibility map proves every tuple on a page is visible." },
      { title: "Price the write path", body: "Every index adds WAL, cache pressure, page changes, vacuum work, and possible bloat; monitor usage and retain only workload-justified structures." },
    ],
    [
      { question: "Which access method is the general default for equality, ranges, and ordering?", options: ["B-tree", "GIN only", "BRIN only", "A heap"], answer: 0, explanation: "B-tree operator classes cover common ordered comparisons." },
      { question: "Why may an index-only scan still visit the heap?", options: ["Visibility must be confirmed for pages not marked all-visible", "The index has keys", "The query uses equality", "The table has a primary key"], answer: 0, explanation: "MVCC visibility is not normally stored for each index entry." },
      { question: "When is BRIN often attractive?", options: ["A very large table whose values correlate with physical block order", "A tiny random lookup table", "Every JSON containment query", "A unique email constraint"], answer: 0, explanation: "Compact block summaries can skip broad physical ranges cheaply." },
      { question: "What causes index write amplification?", options: ["Each table change may update multiple index structures and WAL", "SELECT aliases", "Query comments", "View ownership"], answer: 0, explanation: "Read optimization consumes storage and ongoing mutation work." },
    ],
  ),
  "genai:expert:Context engineering": lesson(
    "Context engineering designs the model's complete information state: authority-ordered instructions, user input, retrieved evidence, tool schemas, memory, examples, budgets, and output contracts. Quality and safety depend on what enters, in which order, with what provenance and permissions.",
    [
      { title: "Separate authority from data", body: "System policy and deterministic authorization outrank user, retrieval, memory, and tool content; untrusted text cannot grant permissions or rewrite control rules." },
      { title: "Allocate a context budget", body: "Reserve tokens for response and tools, select the highest-value evidence, compress with traceability, and account for recency, redundancy, and lost-in-the-middle effects." },
      { title: "Evaluate the assembled state", body: "Test instruction adherence, evidence recall, conflict resolution, injection resistance, citation support, latency, and cost across complete context snapshots." },
    ],
    [
      { question: "Which content may grant a tool permission?", options: ["A deterministic authorization system", "A retrieved document", "A memory note", "A user claim alone"], answer: 0, explanation: "Untrusted content can request an action but cannot expand authority." },
      { question: "Why reserve output tokens before filling context?", options: ["The model needs capacity to complete the contracted response", "It trains the model", "It creates a vector index", "It rotates a secret"], answer: 0, explanation: "Overfilling input can truncate or prevent the required output." },
      { question: "What should survive context compression?", options: ["Critical facts, qualifiers, provenance, and uncertainty", "Only fluent wording", "All duplicated text", "Hidden permissions"], answer: 0, explanation: "Compression must preserve the evidence needed to support and audit claims." },
      { question: "What is a complete context evaluation unit?", options: ["The assembled instructions, evidence, memory, tools, and output contract", "Only the final prompt sentence", "Only model weights", "Only token count"], answer: 0, explanation: "Interactions among context components create many real failures." },
    ],
  ),
  "genai:expert:Advanced agents": lesson(
    "Advanced agents combine planning, typed tools, observation, state, evaluation, and deterministic policy. The model proposes uncertain decisions; the surrounding system enforces permissions, budgets, schemas, approvals, idempotency, and stop conditions.",
    [
      { title: "Use an explicit control loop", body: "Represent goal, state, available actions, observations, remaining budget, and terminal conditions so every transition can be inspected and replayed." },
      { title: "Constrain every tool", body: "Validate typed arguments, authorize against user and resource scope, require approval for high-impact actions, and attach idempotency keys to retryable writes." },
      { title: "Detect unproductive behavior", body: "Cap steps, cost, and wall time; detect repeated plans or observations; escalate ambiguity and preserve a partial audit trail rather than looping." },
    ],
    [
      { question: "Where should tool authorization be enforced?", options: ["Outside the model in deterministic application policy", "Inside retrieved text", "Only in a prompt reminder", "By the tool name"], answer: 0, explanation: "The reasoning component must not be able to grant itself authority." },
      { question: "What makes a retryable write safer?", options: ["An idempotency key and verified outcome", "A longer prompt", "More agents", "Hidden logging"], answer: 0, explanation: "Retries must not duplicate an already completed side effect." },
      { question: "What should stop a repeated no-progress loop?", options: ["A deterministic repetition and budget guard", "Higher temperature", "More memory forever", "An unbounded retry"], answer: 0, explanation: "The runtime should detect unchanged state or repeated action patterns." },
      { question: "What is an agent observation?", options: ["Typed state returned after an action or environment check", "A new permission", "A model weight", "A deployment secret"], answer: 0, explanation: "Observations update the loop but remain untrusted input requiring validation." },
    ],
  ),
  "genai:expert:Durable agents": lesson(
    "A durable agent can survive process crashes, long waits, approvals, rate limits, and retries without losing state or repeating side effects. Durability comes from persisted workflow state, idempotent activities, event history, leases, versioning, and explicit recovery semantics.",
    [
      { title: "Persist transition state", body: "Checkpoint the workflow after meaningful state changes with a version, status, inputs, outputs, pending activity, and authorization context." },
      { title: "Separate orchestration and activities", body: "Keep the workflow deterministic while side-effecting activities use idempotency keys, timeouts, retries, and recorded results." },
      { title: "Resume safely", body: "Use leases or compare-and-swap ownership, replay event history, handle code-version migration, and revalidate permissions after long pauses." },
    ],
    [
      { question: "What prevents a retried activity duplicating a write?", options: ["A stable idempotency key and outcome record", "More checkpoints alone", "A higher token limit", "A different model"], answer: 0, explanation: "The activity can recognize and return the already completed logical operation." },
      { question: "What should a durable workflow checkpoint include?", options: ["Versioned state and pending/finished transition information", "Only final prose", "Only process memory", "Only a timer"], answer: 0, explanation: "Recovery needs enough durable state to decide the next safe action." },
      { question: "Why use a lease for workflow ownership?", options: ["To prevent multiple workers acting concurrently on one execution", "To grant user permissions", "To compress context", "To train adapters"], answer: 0, explanation: "Exclusive time-bounded ownership reduces duplicate coordinators after failure." },
      { question: "What must happen after a long approval wait?", options: ["Revalidate current authorization and resource state", "Assume old permissions remain forever", "Delete event history", "Replay every side effect"], answer: 0, explanation: "Authority and the target may change while the workflow is suspended." },
    ],
  ),
  "genai:expert:Multi-agent systems": lesson(
    "Multi-agent systems divide work among specialized reasoning roles, but they also multiply handoff loss, latency, cost, authority paths, and failure modes. A coordinator needs bounded delegation, typed contracts, shared evidence rules, conflict resolution, and proof that parallelism beats one capable agent.",
    [
      { title: "Decompose independent work", body: "Delegate bounded subtasks with explicit inputs, deliverables, budgets, permissions, and stop conditions; keep tightly coupled reasoning together." },
      { title: "Control shared state", body: "Use versioned artifacts or an append-only event log, isolate write scopes, attach provenance, and prevent one agent's untrusted output becoming another's policy." },
      { title: "Resolve and evaluate", body: "Define validation, disagreement handling, merge authority, timeout behavior, and end-to-end metrics for quality, duplication, latency, cost, and unsafe actions." },
    ],
    [
      { question: "Which subtask is a good delegation candidate?", options: ["A bounded independent analysis with a clear deliverable", "One tightly coupled chain requiring constant shared reasoning", "An undefined goal", "A task with unlimited authority"], answer: 0, explanation: "Independence allows useful parallel work without heavy coordination." },
      { question: "What should an agent handoff contain?", options: ["Typed result, evidence, uncertainty, and provenance", "Only a confident sentence", "New permissions", "Hidden state"], answer: 0, explanation: "The receiver needs inspectable evidence and limits, not just unsupported conclusions." },
      { question: "Who should resolve conflicting agent writes?", options: ["A deterministic ownership or merge policy", "Whichever finishes last", "Every agent simultaneously", "Retrieved content"], answer: 0, explanation: "Explicit authority prevents race-dependent state corruption." },
      { question: "When is a multi-agent design justified?", options: ["When evaluation shows decomposition improves outcomes enough to cover coordination cost", "Whenever agents are available", "To avoid defining a workflow", "To bypass tool authorization"], answer: 0, explanation: "More agents are an architectural tradeoff, not an automatic quality upgrade." },
    ],
  ),
  "genai:expert:Advanced memory": lesson(
    "Advanced agent memory is a governed retrieval system, not an ever-growing transcript. It needs typed records, provenance, tenant isolation, consent, salience, conflict handling, decay, deletion, and evaluation for both helpful recall and harmful or stale influence.",
    [
      { title: "Separate memory types", body: "Keep working state, episodic events, semantic user facts, procedures, and durable workflow records distinct because they differ in authority and lifetime." },
      { title: "Gate writes and reads", body: "Validate source, consent, sensitivity, tenant, expiration, and confidence before storage; retrieve by task need and current authorization rather than similarity alone." },
      { title: "Reconcile lifecycle", body: "Detect contradictions, prefer authoritative recent evidence, decay uncertain facts, support user inspection and deletion, and propagate tombstones into derived indexes." },
    ],
    [
      { question: "What should long-term memory store by default?", options: ["Only governed facts useful for future tasks", "Every raw conversation forever", "Tool credentials", "Unverified retrieved instructions"], answer: 0, explanation: "Retention needs purpose, consent, sensitivity, and lifecycle controls." },
      { question: "Why attach provenance to a memory?", options: ["To evaluate authority, freshness, and correction", "To increase model parameters", "To bypass deletion", "To grant tool access"], answer: 0, explanation: "The source and time determine how a recalled claim should be trusted." },
      { question: "What must memory deletion include?", options: ["Primary records and derived retrieval indexes", "Only the visible UI row", "Only future prompts", "Only one cache replica"], answer: 0, explanation: "Derived embeddings or summaries can continue resurfacing deleted information." },
      { question: "How should conflicting memories be handled?", options: ["Apply explicit authority, recency, confidence, and user-correction rules", "Keep both hidden and choose randomly", "Always use the oldest", "Ask the model to grant authority"], answer: 0, explanation: "Deterministic reconciliation prevents stale or untrusted facts controlling behavior." },
    ],
  ),
};

export function getRoundTwelveLessonEnrichment(track: LearningTrackId, pace: string, topic: string): LessonEnrichment | null {
  return ROUND_TWELVE_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
