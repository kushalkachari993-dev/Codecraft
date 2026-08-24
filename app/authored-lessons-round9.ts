import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_NINE_LESSONS: Record<string, LessonEnrichment> = {
  "python:intermediate:HTTP": lesson(
    "HTTP is the contract beneath web APIs: method, target, headers, status, and representation all carry independent meaning. Reliable clients account for timeouts, retries, idempotency, redirects, caching, and partial network failure.",
    [
      { title: "Model the exchange", body: "The method states intent, the URL identifies a resource, headers carry metadata, and the body carries an optional representation." },
      { title: "Interpret status deliberately", body: "2xx is successful processing, 3xx redirects, 4xx caller-facing failure, and 5xx service failure; application error bodies still require validation." },
      { title: "Retry safely", body: "Use timeouts on every request and retry only transient failures when the operation is idempotent or protected by an idempotency key." },
    ],
    [
      { question: "Which method is normally safe and idempotent for reading a resource?", options: ["GET", "POST", "PATCH", "CONNECT"], answer: 0, explanation: "GET should not request a state change and repeated identical calls should have the same intended effect." },
      { question: "Why must a client set a timeout?", options: ["Networks can stall indefinitely", "It validates JSON", "It encrypts traffic", "It creates retries"], answer: 0, explanation: "Without a deadline, one failed dependency can hold application resources indefinitely." },
      { question: "When is an automatic retry safest?", options: ["A transient failure on an idempotent operation", "Any failed payment POST", "A validation error", "An authentication failure"], answer: 0, explanation: "Idempotency prevents a repeated attempt from duplicating the intended effect." },
      { question: "Does a 200 response prove the body matches the expected schema?", options: ["No", "Yes", "Only for JSON", "Only over HTTPS"], answer: 0, explanation: "Transport success and application data validity are separate checks." },
    ],
  ),
  "python:intermediate:APIs": lesson(
    "An API is a versioned contract between independently changing systems. Strong clients authenticate safely, validate every response, page through collections, respect limits, distinguish error classes, and remain observable without leaking credentials.",
    [
      { title: "Treat the schema as a boundary", body: "Validate required fields, types, enums, pagination metadata, and error formats before domain code consumes external data." },
      { title: "Handle collection mechanics", body: "Follow documented cursors, stable ordering, and termination signals; protect against repeated cursors and unbounded page loops." },
      { title: "Plan compatibility", body: "Pin versions where possible, isolate provider adapters, monitor deprecations, and preserve unknown fields without silently trusting them." },
    ],
    [
      { question: "Where should an API token be stored?", options: ["A protected secret store or environment injection", "Source code", "Query string logs", "Browser HTML"], answer: 0, explanation: "Credentials should not be committed, displayed, or copied into routine telemetry." },
      { question: "What should stop cursor pagination?", options: ["The documented end signal or missing next cursor", "A guessed page number only", "The first duplicate item", "A timeout never"], answer: 0, explanation: "Clients follow the contract and should also detect repeated cursors defensively." },
      { question: "Why call raise_for_status or inspect status before parsing success data?", options: ["Error bodies may have a different schema", "JSON requires it", "It retries automatically", "It refreshes credentials"], answer: 0, explanation: "Failure responses must not be interpreted as normal resources." },
      { question: "What does rate limiting require?", options: ["Bounded backoff and request budgeting", "Infinite immediate retries", "Removing authentication", "Ignoring response headers"], answer: 0, explanation: "Clients should respect limits and avoid retry storms." },
    ],
  ),
  "python:intermediate:FastAPI": lesson(
    "FastAPI turns typed route boundaries into validated ASGI services. Production quality depends on explicit request and response models, dependency lifecycles, intentional HTTP errors, authentication, and avoiding blocking work in the async event loop.",
    [
      { title: "Validate at the edge", body: "Pydantic request models parse external values and response models prevent accidental field exposure while documenting the contract." },
      { title: "Inject scoped dependencies", body: "Depends supplies authentication, database sessions, and shared services with testable construction and reliable cleanup." },
      { title: "Match concurrency to work", body: "Async routes suit awaitable I/O; blocking libraries and CPU-heavy work require a thread pool, process, queue, or synchronous route strategy." },
    ],
    [
      { question: "What protects a response from exposing undeclared fields?", options: ["A response_model", "A route comment", "The function name", "CORS alone"], answer: 0, explanation: "Response validation and serialization constrain the public representation." },
      { question: "What is Depends useful for?", options: ["Explicit reusable dependencies such as auth and sessions", "Hiding global state", "Compiling Python", "Creating indexes"], answer: 0, explanation: "Dependency injection clarifies lifecycle and enables overrides in tests." },
      { question: "Should blocking database I/O run directly in an async route?", options: ["No, not on the event loop", "Yes, always", "Only with GET", "Only when authenticated"], answer: 0, explanation: "Blocking calls prevent the loop from serving other requests." },
      { question: "How should a missing resource normally be reported?", options: ["An intentional 404 HTTPException", "A raw KeyError", "A 200 with hidden failure", "An infinite retry"], answer: 0, explanation: "The API contract should expose a stable client-facing error." },
    ],
  ),
  "python:intermediate:SQL": lesson(
    "Python database code must preserve relational semantics and transaction boundaries rather than treating SQL as formatted text. Parameter binding, short-lived sessions, explicit commit or rollback, bounded result sets, and measured queries are core safety rules.",
    [
      { title: "Bind values, do not format them", body: "Placeholders keep data separate from SQL structure, protecting quoting, types, and injection boundaries." },
      { title: "Own the transaction", body: "Use a context manager or try/except/finally so success commits, failure rolls back, and the connection or cursor is always released." },
      { title: "Map intentionally", body: "Select explicit columns, convert rows at a repository boundary, page large results, and avoid leaking driver-specific objects through the application." },
    ],
    [
      { question: "How should a user-supplied name enter SQL?", options: ["As a bound parameter", "Through an f-string", "Through concatenation", "As a table name automatically"], answer: 0, explanation: "Binding preserves the separation between values and executable SQL." },
      { question: "What must happen after a transaction error?", options: ["Rollback before reuse", "Commit anyway", "Ignore it", "Close only after the next request"], answer: 0, explanation: "The transaction remains failed until rolled back." },
      { question: "Why select explicit columns?", options: ["To stabilize mapping and avoid unintended data exposure", "SELECT * never works", "To disable indexes", "To force one row"], answer: 0, explanation: "Explicit projections are durable contracts and reduce unnecessary transfer." },
      { question: "What belongs in a connection pool?", options: ["Reusable live connections with bounded checkout", "One cursor shared by every request", "SQL strings only", "User passwords"], answer: 0, explanation: "Pools amortize connection setup while enforcing capacity and lifecycle." },
    ],
  ),
  "python:intermediate:ORM": lesson(
    "An ORM maps objects and operations to relational queries, but it does not remove joins, transactions, constraints, or query cost. Effective use requires visibility into generated SQL, relationship loading, session identity, migrations, and database-enforced integrity.",
    [
      { title: "Understand the unit of work", body: "A session tracks loaded and changed entities, coordinates flush order, and wraps work in a transaction whose lifetime must match one application operation." },
      { title: "Choose loading strategy", body: "Lazy loading can create N+1 queries; joined, select-in, or explicit projection loading should match cardinality and required fields." },
      { title: "Keep schema authority", body: "Models describe mapping, while versioned migrations and database constraints define the durable production schema and invariants." },
    ],
    [
      { question: "What is the N+1 problem?", options: ["One parent query followed by one related query per row", "A failed migration", "An invalid primary key", "A connection timeout"], answer: 0, explanation: "Implicit relationship access can multiply query count with result size." },
      { question: "What should define production schema changes?", options: ["Reviewed versioned migrations", "Runtime model import side effects", "UI state", "A cache"], answer: 0, explanation: "Migrations provide an auditable and repeatable deployment path." },
      { question: "When should a session usually end?", options: ["At the application unit-of-work boundary", "After every attribute read", "Never", "Only after process shutdown"], answer: 0, explanation: "A bounded session keeps transactions and identity state understandable." },
      { question: "Does ORM validation replace database constraints?", options: ["No", "Yes", "Only for foreign keys", "Only for uniqueness"], answer: 0, explanation: "Concurrent and alternate writers require enforcement at the database boundary." },
    ],
  ),
  "sql:intermediate:Transactions": lesson(
    "Transactions make a multi-statement state change atomic: every required operation commits together or none becomes visible. They should be short, explicit, retry-aware, and free of user waits or remote network calls.",
    [
      { title: "Define one invariant boundary", body: "BEGIN starts the unit, statements enforce the intended transition, COMMIT publishes it, and ROLLBACK discards it after failure." },
      { title: "Use savepoints selectively", body: "A savepoint can roll back one optional portion while retaining earlier work, but it should not conceal a broken overall invariant." },
      { title: "Minimize held resources", body: "Long transactions retain snapshots and locks, delay cleanup, increase contention, and make failure recovery more expensive." },
    ],
    [
      { question: "What does ROLLBACK do?", options: ["Discards uncommitted transaction changes", "Deletes the database", "Commits a savepoint", "Releases only one row"], answer: 0, explanation: "The database returns the transaction's visible state to its starting point." },
      { question: "Why avoid network calls inside a transaction?", options: ["They extend uncertain lock and snapshot lifetime", "HTTP cannot run with SQL", "They disable constraints", "They always commit"], answer: 0, explanation: "External latency and failure make the critical database section longer and less predictable." },
      { question: "What does a savepoint enable?", options: ["Partial rollback within the current transaction", "Cross-database durability", "A new connection", "Automatic retry"], answer: 0, explanation: "ROLLBACK TO SAVEPOINT undoes work after that marker without ending the whole transaction." },
      { question: "Who must decide commit versus rollback?", options: ["The application transaction boundary", "The user interface stylesheet", "The query planner", "A log handler"], answer: 0, explanation: "Error handling must leave every transaction in an intentional terminal state." },
    ],
  ),
  "sql:intermediate:ACID": lesson(
    "ACID describes database transaction guarantees, not automatic business correctness. Atomicity, consistency, isolation, and durability arise from database mechanisms combined with valid application logic, constraints, configuration, and operations.",
    [
      { title: "Atomicity and consistency", body: "Atomicity prevents partial commit; consistency means each committed transition satisfies declared invariants and correct domain rules." },
      { title: "Isolation", body: "Concurrent transactions behave according to an isolation level whose permitted observations and aborts must match the protected invariant." },
      { title: "Durability", body: "A successful commit survives process failure through write-ahead logging and storage policy, while backups and replication address broader disaster scenarios." },
    ],
    [
      { question: "Which property prevents half a transfer from committing?", options: ["Atomicity", "Isolation", "Durability", "Caching"], answer: 0, explanation: "All statements in the transaction commit or roll back as a unit." },
      { question: "Does consistency create missing business constraints automatically?", options: ["No", "Yes", "Only at serializable", "Only with indexes"], answer: 0, explanation: "The database preserves rules that schema and transaction logic actually encode." },
      { question: "What supports durability in PostgreSQL?", options: ["Write-ahead logging and configured persistent storage", "A view", "A SELECT alias", "Client caching"], answer: 0, explanation: "WAL records changes needed to recover committed transactions." },
      { question: "Which ACID property concerns concurrent visibility?", options: ["Isolation", "Atomicity", "Durability", "Normalization"], answer: 0, explanation: "Isolation controls the effects transactions can observe from one another." },
    ],
  ),
  "sql:intermediate:Isolation levels": lesson(
    "Isolation levels balance concurrency against anomalies. PostgreSQL read committed takes a snapshot per statement, repeatable read holds a transaction snapshot, and serializable may abort work that cannot be ordered safely—requiring whole-transaction retries.",
    [
      { title: "Name the protected anomaly", body: "Choose a level from the invariant: nonrepeatable reads, write skew, lost decisions, and phantom-like effects matter differently to each workflow." },
      { title: "Understand PostgreSQL snapshots", body: "Read committed statements can see newer commits, while repeatable read provides one stable transaction snapshot and detects certain conflicting writes." },
      { title: "Retry serializable units", body: "Serialization failures are expected control flow; retry the complete transaction with bounded backoff and idempotent surrounding behavior." },
    ],
    [
      { question: "What snapshot does PostgreSQL read committed use?", options: ["A new snapshot for each statement", "One snapshot forever", "No snapshot", "One per table"], answer: 0, explanation: "Two statements in one transaction may observe different committed states." },
      { question: "What must an application do after a serialization failure?", options: ["Retry the whole transaction safely", "Commit partial work", "Ignore it", "Lower all constraints"], answer: 0, explanation: "The failed serializable transaction is aborted and must restart from the beginning." },
      { question: "What anomaly can serializable prevent beyond repeatable read?", options: ["Write skew violating a cross-row invariant", "Syntax errors", "Disk loss", "Invalid passwords"], answer: 0, explanation: "Serializable rejects executions that cannot match some serial order." },
      { question: "Should the strongest isolation always be selected blindly?", options: ["No; choose by invariant and handle contention and retries", "Yes", "Only for reads", "Only for tests"], answer: 0, explanation: "Stronger isolation has operational behavior that applications must support." },
    ],
  ),
  "sql:intermediate:Locks": lesson(
    "Locks coordinate conflicting access, but broad or inconsistent locking reduces concurrency and can deadlock. Good designs lock only needed rows, in a stable order, for a short transaction, with explicit wait or queue behavior.",
    [
      { title: "Let writes lock naturally", body: "UPDATE and DELETE acquire row locks; SELECT FOR UPDATE is for read-then-write decisions that must protect selected rows." },
      { title: "Choose wait behavior", body: "NOWAIT fails immediately, while SKIP LOCKED supports competing workers that may safely process different available jobs." },
      { title: "Prevent and recover from deadlocks", body: "Acquire resources in a consistent order, keep transactions short, and retry the chosen victim transaction when PostgreSQL detects a cycle." },
    ],
    [
      { question: "What does FOR UPDATE do?", options: ["Locks selected rows against conflicting updates", "Creates an index", "Commits automatically", "Locks the whole database always"], answer: 0, explanation: "It protects rows for a transaction that plans to update them." },
      { question: "When is SKIP LOCKED useful?", options: ["Multiple workers claiming independent queued jobs", "An account balance invariant", "Every report query", "Schema migration only"], answer: 0, explanation: "Workers can skip jobs currently owned by peers instead of waiting." },
      { question: "How does consistent lock order help?", options: ["It reduces cycles that cause deadlocks", "It removes transactions", "It speeds every SELECT", "It disables waits"], answer: 0, explanation: "Transactions acquiring the same resources in the same sequence are less likely to wait on each other cyclically." },
      { question: "What should happen after a deadlock victim error?", options: ["Retry the full transaction when safe", "Commit it", "Reuse its failed transaction", "Drop the table"], answer: 0, explanation: "PostgreSQL aborts one transaction to break the cycle." },
    ],
  ),
  "sql:intermediate:Functions/procedures": lesson(
    "Database functions and procedures package data-centric operations beside the data. Functions return values or sets and declare volatility; procedures are invoked with CALL and can support transaction control in appropriate contexts. Interfaces should remain narrow and versionable.",
    [
      { title: "Choose the routine kind", body: "Use a SQL function for a reusable query result, PL/pgSQL for procedural data logic, and a procedure for command-style operations where its semantics fit." },
      { title: "Declare behavioral metadata", body: "IMMUTABLE, STABLE, and VOLATILE tell the planner how results may vary; security-definer routines require a hardened search_path and strict grants." },
      { title: "Keep ownership clear", body: "Routines can protect data invariants and reduce round trips, but unrelated product orchestration and external calls remain application concerns." },
    ],
    [
      { question: "Which routine can be used directly in a SELECT expression?", options: ["A function", "A procedure only", "A trigger only", "A transaction"], answer: 0, explanation: "Functions return a value, row, or set consumable by SQL." },
      { question: "What does STABLE communicate?", options: ["Results do not change within one statement for the same inputs", "The function never reads data", "The function commits", "The result is cached forever"], answer: 0, explanation: "Volatility classification informs safe planning and repeated evaluation." },
      { question: "What is a risk of SECURITY DEFINER?", options: ["Privilege escalation through unsafe code or search_path", "It removes SQL types", "It disables parameters", "It cannot return data"], answer: 0, explanation: "The routine runs with owner privileges and must be carefully constrained." },
      { question: "How is a procedure invoked?", options: ["CALL", "SELECT only", "IMPORT", "EXPLAIN only"], answer: 0, explanation: "PostgreSQL procedures use the CALL statement." },
    ],
  ),
  "genai:intermediate:Guardrails": lesson(
    "Guardrails are independent controls around probabilistic behavior: input validation, policy checks, structured output, tool authorization, rate limits, sandboxing, monitoring, and human review. No single prompt or classifier is a complete safety boundary.",
    [
      { title: "Layer controls by stage", body: "Validate before the model, constrain generation and tools during execution, and inspect outputs and side effects before delivery." },
      { title: "Match controls to risk", body: "Low-risk formatting may need schema validation; consequential actions need identity-aware authorization, approval, limits, audit, and recovery." },
      { title: "Evaluate failures and friction", body: "Measure bypass rate, false positives, latency, user impact, and disagreements by scenario rather than declaring a guardrail finished after integration." },
    ],
    [
      { question: "What is the strongest guardrail for a privileged tool?", options: ["Backend authorization tied to identity and scope", "A warning in the prompt", "The tool name", "Model confidence"], answer: 0, explanation: "Permission must be enforced deterministically outside the model." },
      { question: "Why layer guardrails?", options: ["Different controls catch different failure modes", "One control is always perfect", "To increase tokens", "To remove evaluation"], answer: 0, explanation: "Defense in depth prevents one bypass or classifier error from becoming the entire security decision." },
      { question: "What should guardrail evaluation measure besides bypasses?", options: ["False positives and user impact", "Only model size", "Only prompt length", "Nothing"], answer: 0, explanation: "Overblocking can make a safe system unusable and conceal uneven effects." },
      { question: "Is structured output validation an authorization check?", options: ["No", "Yes", "Only for JSON", "Only for tools"], answer: 0, explanation: "A valid schema says nothing about whether the caller may perform the action." },
    ],
  ),
  "genai:intermediate:Prompt injection": lesson(
    "Prompt injection occurs when untrusted content attempts to alter model instructions or drive unauthorized actions. Because models process instructions and data in one channel, robust systems minimize authority, mark trust zones, constrain tools, and verify actions outside the model.",
    [
      { title: "Identify every untrusted source", body: "User text, retrieved pages, emails, files, tool results, image text, and prior memory can all contain hostile instruction-like content." },
      { title: "Keep data subordinate", body: "Delimit evidence, state its purpose, avoid treating it as policy, and never let content grant itself tool permissions or access to other data." },
      { title: "Limit consequences", body: "Use allowlisted tools, least privilege, argument validation, output encoding, approvals, and audit so a successful injection still cannot create an unauthorized effect." },
    ],
    [
      { question: "Can a stronger system prompt fully solve prompt injection?", options: ["No", "Yes", "Only with long context", "Only with RAG"], answer: 0, explanation: "Instruction hierarchy helps but cannot provide a deterministic isolation boundary inside model reasoning." },
      { question: "How should retrieved text be treated?", options: ["As untrusted evidence", "As authorization", "As developer policy", "As an API key"], answer: 0, explanation: "External content may intentionally contain malicious instructions." },
      { question: "What limits indirect prompt-injection impact?", options: ["Narrow authorized tools and approval for consequential actions", "More retrieved documents", "Automatic tool chaining", "Hidden logs"], answer: 0, explanation: "Constrained capabilities reduce the blast radius even when model behavior is manipulated." },
      { question: "What is an indirect injection source?", options: ["A malicious instruction inside a retrieved webpage", "A user asking directly", "A status code", "A typed function argument"], answer: 0, explanation: "The attacker places instructions in data the model later consumes." },
    ],
  ),
  "genai:intermediate:Security": lesson(
    "GenAI security combines normal application security with model-specific data, tool, prompt, and output risks. Identity, tenant isolation, secret handling, least privilege, secure parsing, audit, and incident response remain foundational.",
    [
      { title: "Threat-model trust boundaries", body: "Map assets, identities, model and tool calls, stores, logs, retrieval sources, external outputs, and every transition between trusted and untrusted zones." },
      { title: "Treat output as untrusted", body: "Generated SQL, HTML, commands, URLs, and tool arguments require validation, encoding, sandboxing, and authorization before another interpreter acts on them." },
      { title: "Protect data lifecycle", body: "Minimize prompts and logs, isolate tenants before retrieval, redact secrets, enforce retention and deletion, and include evaluation datasets and traces in the security perimeter." },
    ],
    [
      { question: "How should generated code be treated before execution?", options: ["As untrusted input requiring sandboxing and policy", "As trusted because a model wrote it", "As authentication", "As encrypted automatically"], answer: 0, explanation: "Model output can be incorrect or adversarially influenced." },
      { question: "Where must tenant filtering occur?", options: ["Before or within retrieval authorization, not after generation", "Only in the final answer", "Only in logs", "Nowhere"], answer: 0, explanation: "The model must never receive another tenant's candidate data." },
      { question: "What belongs in a GenAI threat model?", options: ["Traditional and model-specific assets, actors, boundaries, and effects", "Jailbreaks only", "Model benchmarks only", "UI colors"], answer: 0, explanation: "Ordinary vulnerabilities remain as important as prompt-specific risks." },
      { question: "Why protect traces and eval datasets?", options: ["They can contain prompts, outputs, identifiers, and secrets", "They cannot be deleted", "They are executable", "They replace backups"], answer: 0, explanation: "Observability data often duplicates sensitive production content." },
    ],
  ),
  "genai:intermediate:Streaming": lesson(
    "Streaming improves perceived latency by delivering typed events before completion, but creates partial-state, moderation, disconnect, backpressure, and cancellation concerns. The final committed result must remain distinguishable from an unfinished stream.",
    [
      { title: "Model typed events", body: "Text deltas, tool calls, citations, usage, errors, and completion signals have different schemas and must not be concatenated as raw text." },
      { title: "Propagate cancellation", body: "A client disconnect should cancel model and tool work where possible, close resources, record final status, and prevent a partial side effect from continuing unnoticed." },
      { title: "Handle partial safety", body: "Buffer structures and high-risk content until validated, moderate incrementally where appropriate, and clearly mark interrupted output as incomplete." },
    ],
    [
      { question: "What is time to first token?", options: ["Delay before the first streamed content event", "Total completion time", "Model training time", "Cache age"], answer: 0, explanation: "It measures perceived responsiveness separately from total latency." },
      { question: "Why are typed stream events important?", options: ["Tool and control events must not be rendered as ordinary text", "They reduce model size", "They authorize actions", "They eliminate disconnects"], answer: 0, explanation: "Consumers need explicit event semantics to process the stream safely." },
      { question: "What should happen on client cancellation?", options: ["Propagate cancellation and close downstream work", "Continue every tool silently", "Mark success", "Retry forever"], answer: 0, explanation: "Unneeded computation and side effects should stop promptly." },
      { question: "Is a partial streamed JSON object valid?", options: ["Not until the structure is complete and validated", "Always", "Only over HTTPS", "Only if cached"], answer: 0, explanation: "Incremental bytes may be syntactically and semantically incomplete." },
    ],
  ),
  "genai:intermediate:Caching": lesson(
    "GenAI caching reduces latency and cost across exact responses, semantic matches, embeddings, retrieval, and stable prefixes. Correctness depends on complete keys, tenant isolation, policy scope, freshness, invalidation, and observability.",
    [
      { title: "Choose the cache layer", body: "Exact caches suit repeated deterministic requests, semantic caches broaden matches with risk, and embedding or retrieval caches reuse intermediate computation." },
      { title: "Build a complete key", body: "Include tenant, user or permission scope, model, prompt and tool version, parameters, normalized input, source version, and safety policy where they affect output." },
      { title: "Control freshness", body: "Use TTLs, event invalidation, content hashes, stale-while-revalidate, and bypass rules for high-risk or rapidly changing answers; monitor hit quality, not only hit rate." },
    ],
    [
      { question: "What is the most serious missing cache-key field in a multi-tenant app?", options: ["Tenant and authorization scope", "A decorative label", "Screen size", "Log level"], answer: 0, explanation: "Cross-tenant cache reuse can disclose private data." },
      { question: "What is a semantic-cache tradeoff?", options: ["Broader hits can return a response for a meaningfully different request", "It only stores exact bytes", "It cannot expire", "It removes embeddings"], answer: 0, explanation: "Similarity thresholds trade reuse against correctness." },
      { question: "When should a cached answer be bypassed?", options: ["When freshness or risk requirements exceed the cache guarantee", "Whenever a hit exists", "Only at night", "Never"], answer: 0, explanation: "Some decisions require current authoritative evidence." },
      { question: "What should cache monitoring include?", options: ["Hit quality, staleness, isolation, latency, and cost", "Hit rate only", "Prompt length only", "Model name only"], answer: 0, explanation: "A high hit rate is harmful if cached responses are stale or mis-scoped." },
    ],
  ),
};

export function getRoundNineLessonEnrichment(track: LearningTrackId, pace: string, topic: string) {
  return ROUND_NINE_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
