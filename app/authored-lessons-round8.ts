import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_EIGHT_LESSONS: Record<string, LessonEnrichment> = {
  "python:intermediate:Collections": lesson(
    "The collections module provides containers whose behavior communicates the operation: counting, grouping, queues, layered configuration, and lightweight records. Choosing the right container removes manual bookkeeping and makes performance expectations visible.",
    [
      { title: "Count and group", body: "Counter represents frequencies and supports multiset operations; defaultdict creates a first value from a factory when grouping truly expects missing keys." },
      { title: "Work at both ends", body: "deque supports efficient append and pop operations on either end, bounded histories through maxlen, and queue-style processing." },
      { title: "Use semantics deliberately", body: "namedtuple and ChainMap can clarify read models and layered lookup, but specialized behavior should match the domain rather than merely shorten code." },
    ],
    [
      { question: "Which container is designed for frequency counts?", options: ["Counter", "deque", "ChainMap", "tuple"], answer: 0, explanation: "Counter maps hashable values to integer counts and includes useful tally operations." },
      { question: "Why choose deque for a queue?", options: ["Both-end operations are efficient", "It sorts automatically", "It validates types", "It stores files"], answer: 0, explanation: "popleft avoids the shifting cost of removing the first item from a list." },
      { question: "What risk comes with defaultdict?", options: ["Reading a missing key can create an entry", "It cannot store lists", "It removes duplicates", "It is immutable"], answer: 0, explanation: "Automatic creation is useful for grouping but can conceal invalid lookups." },
      { question: "What does deque(maxlen=3) do when full?", options: ["Drops items from the opposite end as new ones arrive", "Raises on every append", "Expands forever", "Sorts the queue"], answer: 0, explanation: "A bounded deque naturally models a rolling history." },
    ],
  ),
  "python:intermediate:Itertools": lesson(
    "itertools builds lazy stream pipelines in C-backed, composable pieces. It is valuable when data is large or unbounded and when products, groups, chains, or slices would otherwise need custom iterator machinery.",
    [
      { title: "Compose lazily", body: "chain, map-like tools, filters, and islice transform or bound a stream without loading every value into memory." },
      { title: "Respect grouping rules", body: "groupby groups consecutive equal keys, so global grouping normally requires sorting by the same key first." },
      { title: "Bound infinite sources", body: "count, cycle, and repeat never finish on their own; connect them only to consumers with an explicit stopping condition." },
    ],
    [
      { question: "What does itertools.chain return?", options: ["One lazy iterator over several inputs", "A nested list", "A dictionary", "A sorted tuple"], answer: 0, explanation: "chain advances through each iterable without eagerly copying all values." },
      { question: "What must usually precede groupby for global groups?", options: ["Sorting by the grouping key", "A random shuffle", "list.reverse", "A decorator"], answer: 0, explanation: "groupby only combines adjacent items sharing a key." },
      { question: "How can an infinite count iterator be consumed safely?", options: ["Bound it with islice or another stopping rule", "Pass it directly to list", "Call len", "Use deepcopy"], answer: 0, explanation: "An eager unbounded consumer would never finish." },
      { question: "Which tool creates Cartesian combinations?", options: ["product", "compress", "accumulate", "tee"], answer: 0, explanation: "product emits tuples from every combination of the supplied inputs." },
    ],
  ),
  "python:intermediate:Functools": lesson(
    "functools changes how callables are adapted, dispatched, cached, and composed. Used with clear contracts, these tools remove wrappers and repeated work; used carelessly, they can hide stale state or surprising dispatch.",
    [
      { title: "Cache pure work", body: "cache and lru_cache reuse results for hashable arguments; correctness requires outputs to depend only on the represented inputs." },
      { title: "Create focused callables", body: "partial binds selected arguments while preserving a normal callable interface for the remaining parameters." },
      { title: "Dispatch by type", body: "singledispatch selects registered implementations from the first argument's runtime type and keeps a required general fallback." },
    ],
    [
      { question: "When is @cache unsafe?", options: ["When results depend on hidden mutable state", "When arguments are integers", "When recursion is used", "When a result is returned"], answer: 0, explanation: "A cached answer can become stale if unrepresented state changes." },
      { question: "What does partial do?", options: ["Pre-fills selected callable arguments", "Runs a function in parallel", "Creates a class", "Catches exceptions"], answer: 0, explanation: "The resulting callable supplies bound values plus future call arguments." },
      { question: "Which argument controls singledispatch selection?", options: ["The first runtime argument", "The return type", "Every keyword equally", "The function name"], answer: 0, explanation: "Registered implementations are resolved from the type of the first argument." },
      { question: "Why might lru_cache have a maxsize?", options: ["To bound retained entries", "To validate annotations", "To add retries", "To change recursion order"], answer: 0, explanation: "A bounded cache prevents unlimited growth for a large argument space." },
    ],
  ),
  "python:intermediate:Pythonic coding": lesson(
    "Pythonic code uses familiar language protocols and standard helpers to reveal intent. The goal is maintainable clarity—direct iteration, unpacking, truthiness, EAFP, and small expressions—not maximum compression.",
    [
      { title: "Iterate over meaning", body: "Use enumerate for positions, zip for aligned sequences, and dictionary iteration methods instead of manually indexing collections." },
      { title: "Use protocols", body: "Truth testing, iteration, context management, and containment let custom and built-in objects participate in the same readable control flow." },
      { title: "Prefer focused EAFP", body: "Attempt an expected operation and catch the narrow anticipated exception when pre-checking would duplicate work or race with state changes." },
    ],
    [
      { question: "What replaces range(len(items)) when both index and value are needed?", options: ["enumerate(items)", "zip(items)", "sorted(items)", "reversed(items)"], answer: 0, explanation: "enumerate yields index-value pairs directly." },
      { question: "What is a safe EAFP pattern?", options: ["Catch the specific expected exception around a narrow operation", "Catch BaseException around a whole program", "Ignore every failure", "Retry forever"], answer: 0, explanation: "Narrow handling avoids hiding unrelated defects." },
      { question: "When is a clever one-liner unpythonic?", options: ["When it increases the reader's mental load", "Whenever it uses a comprehension", "Whenever it calls a built-in", "Never"], answer: 0, explanation: "Pythonic style optimizes communication, not line count." },
      { question: "What does zip normally do at the shorter input?", options: ["Stops", "Raises automatically", "Repeats values", "Pads with zero"], answer: 0, explanation: "Use strict=True when unequal lengths should be treated as an error." },
    ],
  ),
  "python:intermediate:Testing": lesson(
    "Automated tests preserve behavioral contracts while code changes. A strong suite covers representative paths, boundaries, failures, and integration seams without tying every assertion to private implementation details.",
    [
      { title: "Arrange, act, assert", body: "Create controlled inputs, perform one behavior, and assert observable outcomes so a failure points to one promise." },
      { title: "Choose test levels", body: "Fast unit tests isolate rules, integration tests prove collaborators work together, and a smaller end-to-end layer protects critical journeys." },
      { title: "Control nondeterminism", body: "Inject clocks, randomness, files, and networks; use fakes or fixtures at boundaries and retain a few tests against real integrations." },
    ],
    [
      { question: "What should a behavioral test primarily assert?", options: ["Externally observable outcomes", "Private local variable names", "Exact line count", "The mock call graph only"], answer: 0, explanation: "Tests should survive harmless refactoring while protecting the contract." },
      { question: "What is a boundary case for an inclusive threshold of 70?", options: ["Exactly 70", "Only 1000", "A comment", "The function name"], answer: 0, explanation: "Boundary values distinguish >= from > and frequently reveal defects." },
      { question: "Why can excessive mocking weaken a test?", options: ["It may prove mocks agree without real integration", "Mocks always run slowly", "Mocks cannot return data", "They remove assertions"], answer: 0, explanation: "Mock contracts can drift from actual collaborators." },
      { question: "What makes a test isolated?", options: ["It controls inputs and leaves no state affecting another test", "It runs last", "It has one line", "It never uses fixtures"], answer: 0, explanation: "Independent tests remain repeatable in any order." },
    ],
  ),
  "python:intermediate:Logging": lesson(
    "Logging creates an operational record that helps reconstruct behavior after execution. Useful logs are structured, appropriately leveled, correlated across requests, and scrubbed of secrets and unnecessary personal data.",
    [
      { title: "Log events, not prose puzzles", body: "Use stable event names and fields such as request_id, relay_id, duration, and outcome so humans and machines can filter them." },
      { title: "Choose severity", body: "DEBUG supports diagnosis, INFO records normal milestones, WARNING marks recoverable concern, and ERROR records a failed operation needing attention." },
      { title: "Configure at the application edge", body: "Libraries obtain module loggers; the application selects handlers, formats, destinations, retention, and redaction policy." },
    ],
    [
      { question: "What makes a log correlatable?", options: ["A stable request or trace identifier", "A random adjective", "A longer stack trace always", "The source filename only"], answer: 0, explanation: "A correlation ID connects events produced by one distributed operation." },
      { question: "Which level fits a failed request that cannot complete?", options: ["ERROR", "DEBUG", "INFO", "NOTSET"], answer: 0, explanation: "ERROR communicates that the current operation failed." },
      { question: "What should not be logged?", options: ["Passwords and raw access tokens", "An event name", "A duration", "A public status code"], answer: 0, explanation: "Logs spread widely and must not become a credential store." },
      { question: "Who normally configures handlers for a reusable library?", options: ["The consuming application", "Every library module independently", "The end user through print", "The database trigger"], answer: 0, explanation: "Central configuration prevents duplicated or conflicting outputs." },
    ],
  ),
  "sql:intermediate:Normalization": lesson(
    "Normalization assigns each fact one authoritative home according to keys and dependencies. It prevents insert, update, and deletion anomalies while keeping relationships explicit; denormalization is a measured exception with a synchronization plan.",
    [
      { title: "Identify facts and keys", body: "A relation represents one kind of fact, and every non-key attribute should describe the candidate key rather than another non-key attribute." },
      { title: "Remove repeating dependencies", body: "Separate reusable entities such as sectors from relays and reference them with keys instead of copying sector descriptions into every relay row." },
      { title: "Denormalize consciously", body: "Duplicate or precomputed values only for a proven access need, with ownership, refresh behavior, consistency monitoring, and repair." },
    ],
    [
      { question: "What anomaly occurs when a sector name must change in many relay rows?", options: ["Update anomaly", "Window frame", "Deadlock always", "Index-only scan"], answer: 0, explanation: "Duplicated facts can be updated inconsistently." },
      { question: "What does third normal form broadly prevent?", options: ["Non-key attributes depending on other non-key attributes", "Primary keys", "Foreign keys", "All joins"], answer: 0, explanation: "Transitive dependencies place separate facts in one relation." },
      { question: "Is denormalization always wrong?", options: ["No; it needs evidence and a consistency plan", "Yes", "Only PostgreSQL allows it", "It removes data"], answer: 0, explanation: "It is an operational tradeoff rather than a substitute for modeling." },
      { question: "Why use a junction table?", options: ["To model a many-to-many relationship", "To sort rows", "To replace transactions", "To store logs only"], answer: 0, explanation: "The junction records associations using foreign keys to both entities." },
    ],
  ),
  "sql:intermediate:Schema design": lesson(
    "Schema design translates real workflows into durable identities, constraints, histories, ownership, and lifecycle rules. A useful model supports writes, reads, corrections, deletion, and future migration rather than only today's dashboard.",
    [
      { title: "Model state and events", body: "Current-state tables answer what is true now; append-oriented event tables preserve what happened and when." },
      { title: "Encode integrity", body: "Primary, foreign, unique, not-null, and check constraints keep invalid states out regardless of which application path performs a write." },
      { title: "Design for lifecycle", body: "Review creation, updates, ownership transfer, retention, soft or hard deletion, auditing, and migrations before committing to table boundaries." },
    ],
    [
      { question: "Where should a universal invariant be enforced?", options: ["In the database constraint as well as useful application checks", "Only in CSS", "Only in documentation", "Only in analytics"], answer: 0, explanation: "Database enforcement protects every writer and race condition." },
      { question: "Why separate event history from current state?", options: ["They answer different questions and have different write patterns", "Events cannot have keys", "State cannot be queried", "To avoid timestamps"], answer: 0, explanation: "Mutable snapshots and append-only history serve distinct access and retention needs." },
      { question: "What should tenant ownership affect?", options: ["Keys, constraints, queries, and authorization boundaries", "Only table comments", "Only UI labels", "Nothing"], answer: 0, explanation: "Isolation must be visible and enforceable throughout the model." },
      { question: "What is a schema-design review scenario?", options: ["Trace create, update, delete, and restore workflows", "Only count columns", "Pick short names", "Avoid all migrations"], answer: 0, explanation: "Concrete lifecycle walkthroughs expose missing constraints and ambiguous ownership." },
    ],
  ),
  "sql:intermediate:Indexes": lesson(
    "Indexes accelerate selected predicates, joins, and orderings by maintaining an auxiliary access path. Each index consumes storage and write work, so it should match demonstrated query patterns and be verified through plans and usage.",
    [
      { title: "Match the query shape", body: "For a B-tree, equality columns commonly lead, followed by range or ordering columns; direction and column order should match frequent access." },
      { title: "Use selective forms", body: "Partial indexes exclude irrelevant rows, expression indexes support computed predicates, and INCLUDE can cover returned values without changing search keys." },
      { title: "Measure the tradeoff", body: "Check plan selection, table size, write amplification, duplicate indexes, and production usage before keeping an index indefinitely." },
    ],
    [
      { question: "What is an index's primary cost?", options: ["Extra storage and maintenance on writes", "It removes constraints", "It disables sorting", "It prevents transactions"], answer: 0, explanation: "Every insert, update, or delete may need corresponding index work." },
      { question: "When is a partial index useful?", options: ["When frequent queries target a stable subset such as online rows", "When every row must be included", "To store backups", "To replace a view"], answer: 0, explanation: "The predicate keeps the structure smaller and focused on matching queries." },
      { question: "Does CREATE INDEX guarantee the optimizer will use it?", options: ["No", "Yes, always", "Only for text", "Only after restart"], answer: 0, explanation: "The planner compares estimated costs and may prefer another access path." },
      { question: "Why does composite column order matter?", options: ["B-tree prefix and ordering behavior follows key order", "SQL reads names alphabetically", "It changes table columns", "It removes duplicates automatically"], answer: 0, explanation: "An index beginning with sector_id serves different access patterns from one beginning with power." },
    ],
  ),
  "sql:intermediate:EXPLAIN ANALYZE": lesson(
    "EXPLAIN ANALYZE executes a statement and shows the chosen plan with actual rows, loops, and timing. Comparing estimates with reality reveals statistics, selectivity, and plan-shape problems, but execution makes it unsafe for unguarded destructive statements.",
    [
      { title: "Read plans as trees", body: "Child nodes produce rows for parents; total parent time includes descendant work, and loops multiply per-loop row and timing figures." },
      { title: "Compare estimated and actual rows", body: "Large mismatches can signal stale statistics, correlated columns, skewed data, or predicates the planner cannot estimate well." },
      { title: "Measure beyond one run", body: "Use BUFFERS, stable representative parameters, warm and cold context, and production-scale data rather than overfitting to a tiny lab table." },
    ],
    [
      { question: "Does EXPLAIN ANALYZE run the statement?", options: ["Yes", "No", "Only SELECT keywords", "Only indexes"], answer: 0, explanation: "Actual measurements require execution, including side effects for write statements." },
      { question: "What does a large estimated-versus-actual row mismatch suggest?", options: ["A cardinality estimation problem", "A syntax error always", "No statistics are needed", "The query did not run"], answer: 0, explanation: "Bad row estimates can lead to poor join and scan choices." },
      { question: "How should loops be interpreted?", options: ["Per-loop figures may need multiplication to understand total work", "They are comments", "They always mean recursion", "They report index count"], answer: 0, explanation: "Nested plan nodes can execute repeatedly for outer rows." },
      { question: "What does BUFFERS add?", options: ["Block hit, read, dirtied, and written information", "Python memory objects", "Table constraints", "User permissions"], answer: 0, explanation: "Buffer data distinguishes CPU work from storage access patterns." },
    ],
  ),
  "genai:intermediate:Agent workflows": lesson(
    "Agent workflows combine deterministic nodes with model decisions at the few places where interpretation or planning is genuinely uncertain. Explicit states, edges, approvals, retries, and compensation make the system understandable and operable.",
    [
      { title: "Map deterministic and model nodes", body: "Parsing, authorization, persistence, and known business rules stay in code; model nodes handle ambiguous classification, synthesis, or plan choice." },
      { title: "Specify every edge", body: "Transitions define success, retryable failure, terminal failure, timeout, cancellation, and human-review paths rather than relying on free-form continuation." },
      { title: "Design side effects for recovery", body: "Use idempotency keys, checkpoints, and compensating actions so a resumed workflow does not duplicate irreversible work." },
    ],
    [
      { question: "Where should deterministic authorization live?", options: ["Application workflow code", "A model prompt alone", "Retrieved documents", "The chat history"], answer: 0, explanation: "Permissions require consistent enforcement outside probabilistic output." },
      { question: "What makes a workflow resumable?", options: ["Persisted checkpoints and replay-safe nodes", "A longer system prompt", "Unlimited context", "No state"], answer: 0, explanation: "The system must know the last durable state and safely repeat interrupted work." },
      { question: "What belongs on a workflow edge?", options: ["A defined transition condition and failure policy", "Only a decorative label", "A secret", "Unbounded recursion"], answer: 0, explanation: "Explicit routing turns behavior into an inspectable state machine." },
      { question: "When should a model node be avoided?", options: ["When a stable deterministic rule solves the step", "When text is involved", "When tools exist", "When evaluation is possible"], answer: 0, explanation: "Deterministic code is cheaper, repeatable, and easier to verify where ambiguity is absent." },
    ],
  ),
  "genai:intermediate:LangChain": lesson(
    "LangChain supplies composable model, prompt, retriever, tool, and runnable interfaces. It can speed integration, but domain rules, observability, provider errors, and security boundaries must remain visible rather than disappearing behind framework convenience.",
    [
      { title: "Compose typed stages", body: "Runnable pipelines connect prompt preparation, model calls, parsing, and branches while keeping the data shape at each boundary explicit." },
      { title: "Isolate provider adapters", body: "Wrap framework-specific integrations behind application-owned interfaces so upgrades and provider changes do not spread through domain logic." },
      { title: "Trace real execution", body: "Inspect prompts, retrieval inputs, model metadata, parsed outputs, latency, errors, and token use at each stage rather than debugging one opaque chain." },
    ],
    [
      { question: "Who owns business rules when using LangChain?", options: ["The application", "The framework automatically", "The model provider", "The vector database"], answer: 0, explanation: "Framework abstractions compose operations but do not define product policy." },
      { question: "Why isolate framework adapters?", options: ["To reduce coupling to versions and providers", "To remove tests", "To expose secrets", "To make errors opaque"], answer: 0, explanation: "A narrow boundary contains ecosystem churn." },
      { question: "What should an output parser do?", options: ["Validate and transform model output into the expected structure", "Authorize bank transfers", "Hide invalid output", "Train the model"], answer: 0, explanation: "Parsing is a boundary check, not a permission system." },
      { question: "What is a warning sign in a chain?", options: ["Domain behavior is hidden inside opaque callbacks", "Stages have typed inputs", "Errors are traced", "Versions are pinned"], answer: 0, explanation: "Hidden logic becomes difficult to test and migrate." },
    ],
  ),
  "genai:intermediate:LangGraph": lesson(
    "LangGraph models long-running, branching, and cyclic agent work as a state graph. Typed state, explicit edges, checkpoints, interrupts, and replay-safe nodes make pause, approval, recovery, and inspection first-class.",
    [
      { title: "Define state and reducers", body: "A typed state schema names durable fields; reducers specify how parallel or repeated node updates combine rather than relying on accidental dictionary mutation." },
      { title: "Control cycles", body: "Conditional edges route from evidence, and every cycle has measurable exit conditions, step limits, and an escalation path." },
      { title: "Checkpoint side effects", body: "Persist before and after consequential boundaries, assign thread or run identities, and make retried nodes idempotent." },
    ],
    [
      { question: "Why use a checkpointer?", options: ["To resume and inspect durable graph state", "To increase temperature", "To remove node errors", "To store API keys in prompts"], answer: 0, explanation: "Checkpoints let execution pause and recover between graph steps." },
      { question: "What must every graph cycle have?", options: ["A bounded termination or escalation rule", "A different model each pass", "No state", "A global variable"], answer: 0, explanation: "Unbounded cycles create runaway cost and non-termination." },
      { question: "What is a reducer for?", options: ["Combining updates to a state field predictably", "Compressing model weights", "Deleting checkpoints", "Choosing authentication"], answer: 0, explanation: "Reducers define merge behavior for accumulated or concurrent updates." },
      { question: "How should a retried side-effect node behave?", options: ["Idempotently or with a recorded compensation strategy", "Duplicate the effect", "Forget prior state", "Skip authorization"], answer: 0, explanation: "Recovery must not repeat external consequences accidentally." },
    ],
  ),
  "genai:intermediate:MCP": lesson(
    "The Model Context Protocol standardizes how AI clients discover and use tools, resources, and prompts from servers. Standardization improves interoperability, but server identity, user intent, authorization, argument validation, and returned content remain trust decisions.",
    [
      { title: "Negotiate capabilities", body: "Clients initialize a connection and discover only the tools, resources, prompts, and protocol features the server advertises." },
      { title: "Treat schemas as interfaces", body: "Tool names, descriptions, and input schemas guide selection, while the client still validates values, identity, scope, and whether execution is allowed." },
      { title: "Separate data from authority", body: "Resources and tool results may contain untrusted instruction-like text; they provide evidence, not permission to invoke additional actions." },
    ],
    [
      { question: "Does an MCP tool schema grant authorization?", options: ["No", "Yes, always", "Only for read tools", "Only locally"], answer: 0, explanation: "Schemas describe calls; the client and backend enforce identity and permissions." },
      { question: "What should happen before a consequential MCP call?", options: ["Validate user intent, identity, scope, and arguments", "Trust the tool name", "Execute every advertised tool", "Copy credentials into context"], answer: 0, explanation: "Protocol connectivity does not remove application authorization." },
      { question: "How should returned content be treated?", options: ["As potentially untrusted data", "As system instructions", "As automatic approval", "As a secret"], answer: 0, explanation: "External content may be incorrect or adversarial." },
      { question: "What improves MCP interoperability?", options: ["Standard capability discovery and structured schemas", "One vendor-only prompt", "Raw shell access", "No error model"], answer: 0, explanation: "Clients can integrate servers through a consistent protocol surface." },
    ],
  ),
  "genai:intermediate:Evaluation": lesson(
    "Evaluation turns GenAI quality and risk into repeatable release evidence. Representative datasets, deterministic checks, calibrated graders, slice-level metrics, and human review expose regressions that a handful of favorite prompts cannot.",
    [
      { title: "Define the task contract", body: "Each case includes inputs, context, expected facts or behavior, rubric, metadata, and the failure severity relevant to the product." },
      { title: "Layer graders", body: "Use exact checks for schemas and citations, task metrics where valid, model graders with calibrated rubrics, and expert review for ambiguous or high-risk judgments." },
      { title: "Gate and monitor", body: "Compare versions with confidence intervals and slices, set hard safety thresholds, and continue evaluating sampled production behavior and drift." },
    ],
    [
      { question: "What makes an evaluation dataset representative?", options: ["It covers real frequency, difficulty, risk, and user slices", "It contains only easy demos", "It has the longest prompts", "It never changes"], answer: 0, explanation: "Aggregate scores are meaningful only when cases reflect the deployed task distribution and risks." },
      { question: "Why calibrate a model grader?", options: ["To measure agreement and bias against trusted judgments", "To make it deterministic automatically", "To remove the rubric", "To authorize tools"], answer: 0, explanation: "A grader is another model and can be inconsistent or systematically biased." },
      { question: "What should be a hard release gate?", options: ["A non-negotiable safety or correctness threshold", "One aesthetic preference", "The highest token count", "A random example"], answer: 0, explanation: "Critical failures should not be averaged away by strong performance elsewhere." },
      { question: "Why report metrics by slice?", options: ["Overall averages can hide failures for important groups or tasks", "Slices always raise scores", "It removes test cases", "It changes the model"], answer: 0, explanation: "Breakdowns reveal targeted regressions and uneven reliability." },
    ],
  ),
};

export function getRoundEightLessonEnrichment(track: LearningTrackId, pace: string, topic: string) {
  return ROUND_EIGHT_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
