import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_SEVEN_LESSONS: Record<string, LessonEnrichment> = {
  "python:intermediate:Decorators": lesson(
    "Decorators add reusable behavior at a callable boundary without scattering the same checks, timing, or logging through every function. A good decorator preserves the wrapped contract and remains transparent to callers.",
    [
      { title: "Transform a callable", body: "Decoration evaluates at definition time: the original callable is passed to the decorator and the returned callable is bound to the function name." },
      { title: "Forward transparently", body: "A general wrapper accepts *args and **kwargs, returns the original result, and uses functools.wraps to preserve metadata and introspection." },
      { title: "Parameterize in layers", body: "A decorator factory captures configuration, returns the decorator, and then creates a wrapper for each decorated function." },
    ],
    [
      { question: "What does @audit place in the decorated function's name?", options: ["The callable returned by audit", "The original source text", "A module", "A class instance always"], answer: 0, explanation: "Decorator syntax rebinds the name to audit(original_function)." },
      { question: "Why use functools.wraps?", options: ["To preserve metadata and __wrapped__", "To make every call async", "To catch all errors", "To remove arguments"], answer: 0, explanation: "wraps keeps names, documentation, annotations, and the link to the wrapped callable." },
      { question: "What should a transparent wrapper do with a return value?", options: ["Return it to the caller", "Print and discard it", "Convert it to text", "Cache it forever"], answer: 0, explanation: "Dropping the result silently changes the function's contract." },
      { question: "When is a decorator factory useful?", options: ["When decoration needs configuration", "When a function has no name", "Only for classes", "Only for recursion"], answer: 0, explanation: "The outer factory captures settings used by the actual decorator." },
    ],
  ),
  "python:intermediate:Closures": lesson(
    "Closures create small configured callables whose captured values survive after the outer function returns. They support focused function factories and private state without introducing a class for every tiny behavior.",
    [
      { title: "Capture lexical bindings", body: "An inner function closes over names from its defining scope; the binding is retained as long as the function remains reachable." },
      { title: "Bind loop values deliberately", body: "Closures capture variables rather than historical values, so a default argument or factory call is needed when creating callbacks in a loop." },
      { title: "Control mutation", body: "Use nonlocal only when a closure intentionally owns changing state; expose a narrow operation instead of leaking the captured object." },
    ],
    [
      { question: "What survives inside a returned closure?", options: ["Referenced enclosing bindings", "Every local in the program", "Only globals", "The outer call stack frame as text"], answer: 0, explanation: "Referenced lexical bindings remain available to the inner function." },
      { question: "Why can callbacks built in a loop share the final value?", options: ["They resolve the same captured variable later", "Loops copy functions", "Python removes defaults", "Closures cannot use numbers"], answer: 0, explanation: "Late lookup sees the loop variable's final binding unless each value is bound deliberately." },
      { question: "What does nonlocal permit?", options: ["Rebinding an enclosing function variable", "Changing a module import", "Creating a class", "Skipping validation"], answer: 0, explanation: "nonlocal targets the nearest enclosing function scope containing that name." },
      { question: "When might a class be clearer than a closure?", options: ["When state has several operations and lifecycle rules", "Whenever one value is captured", "Never", "Only when printing"], answer: 0, explanation: "A named object can make multi-operation mutable state easier to inspect and extend." },
    ],
  ),
  "python:intermediate:Context managers": lesson(
    "Context managers make resource lifetime explicit and guarantee cleanup across normal completion, early return, and exceptions. They turn fragile paired setup and teardown calls into one visible with boundary.",
    [
      { title: "Enter and exit", body: "__enter__ prepares or returns the managed resource; __exit__ always receives control as the with block ends and decides whether an exception propagates." },
      { title: "Use try and finally", body: "A generator-based manager created with contextlib.contextmanager places acquisition before yield and cleanup in finally." },
      { title: "Do not hide failures", body: "Returning truthy from __exit__ suppresses an exception, so managers should do so only for an intentional, narrow recovery policy." },
    ],
    [
      { question: "What guarantee does with provide?", options: ["The exit hook runs when the block is left", "The operation cannot fail", "Files are stored forever", "Exceptions are always suppressed"], answer: 0, explanation: "The protocol centralizes cleanup even when control leaves through an exception." },
      { question: "Where should cleanup go in a generator context manager?", options: ["A finally block after yield", "Before acquisition", "Only after return", "In a global variable"], answer: 0, explanation: "finally covers both successful and exceptional block exits." },
      { question: "What does a truthy __exit__ return mean?", options: ["Suppress the active exception", "Retry the block", "Close Python", "Commit a database automatically"], answer: 0, explanation: "False or None allows the exception to propagate." },
      { question: "Which resource benefits from a context manager?", options: ["A lock that must always be released", "An immutable integer", "A comment", "A type annotation"], answer: 0, explanation: "Resources with paired acquisition and release are ideal candidates." },
    ],
  ),
  "python:intermediate:Type hints": lesson(
    "Type hints make interfaces reviewable and let static analysis detect incompatible paths before runtime. They are gradual documentation and tooling contracts, not automatic runtime conversion or validation.",
    [
      { title: "Annotate boundaries", body: "Parameters and returns carry the highest value because they explain what callers provide and what successful execution produces." },
      { title: "Model absence and variation", body: "Use unions, None, Literal, protocols, and typed containers to describe real possibilities instead of falling back to Any." },
      { title: "Narrow before use", body: "Checks such as is not None and isinstance let a type checker prove which operations are valid along a control-flow branch." },
    ],
    [
      { question: "Do annotations validate values at runtime by default?", options: ["No", "Yes, always", "Only lists", "Only return values"], answer: 0, explanation: "Python stores annotations but ordinary calls do not enforce them." },
      { question: "What does str | None communicate?", options: ["A string or absence", "A list of strings", "An invalid annotation", "A hidden exception"], answer: 0, explanation: "The union requires callers to account for None." },
      { question: "Why avoid unnecessary Any?", options: ["It disables useful checking through that value", "It makes code slower", "It forbids imports", "It is a database type"], answer: 0, explanation: "Any permits essentially every operation and propagates uncertainty." },
      { question: "What is structural typing with a Protocol?", options: ["Matching required behavior without explicit inheritance", "Serializing a class", "Checking exact memory layout", "A test runner"], answer: 0, explanation: "A compatible object supplies the protocol's declared members regardless of its base classes." },
    ],
  ),
  "python:intermediate:Dataclasses": lesson(
    "Dataclasses remove repetitive record-model plumbing while keeping fields, defaults, validation, and value semantics visible. They fit domain data, but do not replace services whose identity and behavior dominate their fields.",
    [
      { title: "Declare the data contract", body: "Annotated fields drive generated initialization, representation, and equality; options such as frozen and order select intentional value behavior." },
      { title: "Create safe defaults", body: "Use field(default_factory=...) for lists, dictionaries, and other mutable values so each instance receives independent storage." },
      { title: "Validate after initialization", body: "__post_init__ can enforce cross-field invariants; frozen records use object.__setattr__ only for carefully derived initialization values." },
    ],
    [
      { question: "Why use default_factory=list?", options: ["Each instance gets a fresh list", "The field becomes immutable", "Lists become tuples", "It removes __init__"], answer: 0, explanation: "A shared mutable default would couple otherwise independent instances." },
      { question: "What commonly runs after generated initialization?", options: ["__post_init__", "__enter__", "__next__", "__missing__"], answer: 0, explanation: "Dataclasses call __post_init__ after assigning generated constructor fields." },
      { question: "What does frozen=True communicate?", options: ["Instances have value-like immutable intent", "The class cannot be imported", "Fields have no types", "Equality is disabled"], answer: 0, explanation: "Attribute reassignment is blocked, supporting value semantics." },
      { question: "When is a dataclass a poor fit?", options: ["When the abstraction is mostly behavior and lifecycle", "When a record has three fields", "When equality matters", "When defaults exist"], answer: 0, explanation: "A behavior-heavy service should not be forced into a record-oriented abstraction." },
    ],
  ),
  "sql:intermediate:Window functions": lesson(
    "Window functions calculate across related rows without collapsing them into one row per group. They power ranking, running totals, comparisons, and rolling metrics while preserving row-level detail.",
    [
      { title: "Define the window", body: "PARTITION BY creates independent groups and ORDER BY defines sequence; neither changes the final output order unless the query also orders its result." },
      { title: "Choose ranking semantics", body: "ROW_NUMBER is unique, RANK leaves gaps after ties, and DENSE_RANK keeps consecutive ranks after ties." },
      { title: "Control the frame", body: "Aggregate windows may need an explicit ROWS frame so peers with equal ordering values do not unexpectedly share a range-based frame." },
    ],
    [
      { question: "What distinguishes a window aggregate from GROUP BY?", options: ["It preserves individual rows", "It cannot sum", "It creates a table", "It changes data"], answer: 0, explanation: "Window results are added to each qualifying row rather than reducing rows." },
      { question: "Which function assigns unique sequential numbers through ties?", options: ["ROW_NUMBER", "RANK", "DENSE_RANK", "COUNT"], answer: 0, explanation: "ROW_NUMBER always increments once per row." },
      { question: "Does ORDER BY inside OVER guarantee final display order?", options: ["No; use an outer ORDER BY", "Yes, always", "Only with SUM", "Only in a view"], answer: 0, explanation: "Window ordering controls calculation, not result presentation." },
      { question: "Why specify ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW?", options: ["To define a row-by-row running frame", "To remove partitions", "To create an index", "To suppress NULL"], answer: 0, explanation: "An explicit ROWS frame avoids peer behavior from the default range frame." },
    ],
  ),
  "sql:intermediate:Set operations": lesson(
    "Set operations combine complete query results according to membership. They are useful when sources share a compatible shape and the desired rule is union, intersection, or difference rather than row-by-row joining.",
    [
      { title: "Align columns", body: "Each branch returns the same column count in compatible positions; aliases and final ordering come from the combined result." },
      { title: "Choose duplicate behavior", body: "UNION removes duplicates, UNION ALL preserves them, INTERSECT keeps common rows, and EXCEPT keeps rows found only on the left." },
      { title: "Order once", body: "A final ORDER BY applies to the combined relation; branch-local ordering needs parentheses and usually a limiting reason." },
    ],
    [
      { question: "Which operation preserves duplicate rows?", options: ["UNION ALL", "UNION", "INTERSECT", "EXCEPT"], answer: 0, explanation: "ALL skips duplicate elimination and retains every input row." },
      { question: "What must set-operation branches agree on?", options: ["Column count and compatible types by position", "Table names", "Row count", "Indexes"], answer: 0, explanation: "The database aligns set-operation columns positionally." },
      { question: "What does EXCEPT return?", options: ["Left rows absent from the right result", "Every right row", "Matching columns joined", "Only duplicates"], answer: 0, explanation: "EXCEPT implements relational difference." },
      { question: "Where does the final ORDER BY belong?", options: ["After the combined expression", "Inside every SELECT only", "Before UNION", "In a trigger"], answer: 0, explanation: "The combined relation is sorted as one final result." },
    ],
  ),
  "sql:intermediate:Advanced aggregation": lesson(
    "Advanced aggregation produces multiple analytical levels and conditional metrics in a single declarative result. FILTER, grouping sets, rollups, and distinct measures make summaries explicit without duplicated scans.",
    [
      { title: "Aggregate conditionally", body: "FILTER attaches a predicate to one aggregate, allowing several metrics with different conditions to share the same grouped input." },
      { title: "Generate grouping levels", body: "GROUPING SETS declares exact subtotal shapes; ROLLUP adds hierarchical subtotals and a grand total in a predictable order." },
      { title: "Label subtotal rows", body: "GROUPING distinguishes a subtotal-produced NULL from a real stored NULL so reports can label levels safely." },
    ],
    [
      { question: "What does COUNT(*) FILTER (WHERE online) express?", options: ["A conditional count inside the group", "A window frame", "A table constraint", "A recursive step"], answer: 0, explanation: "Only rows satisfying the filter contribute to that aggregate." },
      { question: "Why use GROUPING SETS?", options: ["To request several grouping levels in one query", "To create indexes", "To update groups", "To remove columns"], answer: 0, explanation: "It is a declarative alternative to multiple aggregate queries joined with UNION ALL." },
      { question: "Why is COALESCE alone unsafe for subtotal labels?", options: ["A real NULL and subtotal NULL can look identical", "It cannot handle text", "It sorts rows", "It changes table data"], answer: 0, explanation: "GROUPING identifies whether NULL was introduced by aggregation." },
      { question: "What does ROLLUP(region, sector) include?", options: ["Detail groups, region subtotals, and a grand total", "Only sector rows", "Only a grand total", "Cartesian products"], answer: 0, explanation: "ROLLUP follows the declared hierarchy from detailed to progressively broader levels." },
    ],
  ),
  "sql:intermediate:Views": lesson(
    "Views give a stable query interface over underlying tables, centralizing reusable joins, filters, and naming. They improve consistency but do not inherently store results or remove the need to secure base data.",
    [
      { title: "Publish a relation", body: "A normal view stores a query definition and evaluates it against current base data whenever queried." },
      { title: "Design a stable contract", body: "Choose explicit columns and durable semantics so consumers do not depend on accidental base-table details." },
      { title: "Preserve security boundaries", body: "Grant view access intentionally and understand invoker or definer behavior; a view is not automatically a row-level authorization system." },
    ],
    [
      { question: "Does a normal view store its result rows?", options: ["No; it stores a query definition", "Yes, always", "Only NULL rows", "Only after an index"], answer: 0, explanation: "Current base data is read when the view is queried." },
      { question: "Why avoid SELECT * in a public view contract?", options: ["Base schema changes can silently alter the interface", "It cannot return rows", "It disables WHERE", "It creates duplicates"], answer: 0, explanation: "Explicit columns stabilize names, order, and exposure." },
      { question: "What is a strong reason to create a view?", options: ["Reuse a governed relational definition", "Make every query faster automatically", "Replace backups", "Bypass permissions"], answer: 0, explanation: "Views centralize repeatable query semantics." },
      { question: "Can a view be queried like a table?", options: ["Yes, as a derived relation", "No", "Only from triggers", "Only once"], answer: 0, explanation: "Consumers can filter, join, and select from its exposed columns." },
    ],
  ),
  "sql:intermediate:Materialized views": lesson(
    "Materialized views persist query results for faster repeated reads at the cost of freshness, storage, and refresh work. They suit expensive, read-heavy summaries whose acceptable staleness is explicit.",
    [
      { title: "Persist a snapshot", body: "Creation executes the defining query and stores its rows; base-table changes are invisible until a refresh." },
      { title: "Plan refresh behavior", body: "Choose event-driven or scheduled refresh, monitor duration and age, and decide what readers see during replacement." },
      { title: "Enable concurrent refresh carefully", body: "PostgreSQL concurrent refresh requires a suitable unique index and trades extra work for keeping reads available." },
    ],
    [
      { question: "What is the main tradeoff of a materialized view?", options: ["Faster reads for potentially stale stored results", "No storage for slower reads", "Automatic transactions", "No refresh work"], answer: 0, explanation: "Persistence reduces repeated computation but separates the result from current base data." },
      { question: "How do base-table changes reach the stored result?", options: ["Through REFRESH MATERIALIZED VIEW", "Through SELECT", "Through GRANT", "They appear instantly"], answer: 0, explanation: "The snapshot must be refreshed explicitly or by scheduled application logic." },
      { question: "What supports PostgreSQL concurrent refresh?", options: ["A qualifying unique index", "A trigger on every column", "A recursive CTE", "A temporary table"], answer: 0, explanation: "The index lets PostgreSQL identify rows while readers continue using the old snapshot." },
      { question: "What should an operator monitor?", options: ["Refresh success, duration, and data age", "Only row colors", "Python versions", "Browser cache alone"], answer: 0, explanation: "Freshness is part of the materialized view's product contract." },
    ],
  ),
  "genai:intermediate:Model selection": lesson(
    "Model selection is a system decision across quality, latency, cost, context, modality, tool behavior, safety, and operational reliability. Representative evaluations matter more than leaderboard averages.",
    [
      { title: "Start from task slices", body: "Build cases for common, difficult, high-risk, multilingual, long-context, and tool-using requests before comparing candidates." },
      { title: "Measure the whole path", body: "Evaluate end-to-end success, tail latency, token use, structured-output validity, and fallback behavior under realistic application settings." },
      { title: "Route only with evidence", body: "A smaller default plus escalation can save cost, but routing errors and added complexity must be included in the evaluation." },
    ],
    [
      { question: "What should drive model selection?", options: ["Representative application evaluations", "One public leaderboard", "Parameter count alone", "The newest name"], answer: 0, explanation: "The best candidate depends on the product's exact task and operational constraints." },
      { question: "Which latency measure catches slow user experiences?", options: ["Tail latency such as p95", "Only the fastest request", "Model file size", "Average prompt length only"], answer: 0, explanation: "Percentiles expose the slow end hidden by an average." },
      { question: "What must a routing evaluation include?", options: ["Router mistakes and fallback outcomes", "Only the large model score", "Only input price", "No edge cases"], answer: 0, explanation: "Misrouting can erase expected quality and cost benefits." },
      { question: "When should a model be rejected despite high average quality?", options: ["When it fails a non-negotiable safety or reliability threshold", "When it is measurable", "When it supports tools", "When it has documentation"], answer: 0, explanation: "Hard constraints gate candidates before weighted optimization." },
    ],
  ),
  "genai:intermediate:Agents": lesson(
    "Agents are justified when the application cannot know the exact action sequence in advance and a model must choose among bounded tools. The application—not the model—owns permissions, budgets, and consequences.",
    [
      { title: "Define the goal and finish", body: "Give the agent a measurable objective, success evidence, and explicit states for completed, failed, cancelled, or waiting for approval." },
      { title: "Expose narrow tools", body: "Tool schemas should represent small authorized operations with validated arguments, idempotency rules, and clear error results." },
      { title: "Match autonomy to risk", body: "Read-only reversible work can proceed further; costly, destructive, or externally visible actions need policy checks and human confirmation." },
    ],
    [
      { question: "When is an agent preferable to a fixed workflow?", options: ["When valid action sequences depend on evolving observations", "Whenever an LLM is used", "For every API call", "When no goal exists"], answer: 0, explanation: "Agents add value at uncertain decision points, not to rename deterministic pipelines." },
      { question: "Who enforces tool authorization?", options: ["Application code", "The model's confidence", "Retrieved text", "The user interface color"], answer: 0, explanation: "Authorization must be deterministic and identity-aware outside model output." },
      { question: "What is a safe tool design?", options: ["Narrow scope, typed input, explicit effects", "One unrestricted shell", "Hidden arguments", "Unlimited retries"], answer: 0, explanation: "Constrained operations reduce ambiguity and blast radius." },
      { question: "Which action most needs approval?", options: ["Sending a customer refund", "Reading a public FAQ", "Ranking local candidates", "Formatting text"], answer: 0, explanation: "Material external side effects deserve an explicit authorization checkpoint." },
    ],
  ),
  "genai:intermediate:Agent loops": lesson(
    "An agent loop turns uncertain work into bounded observe-decide-act cycles. Reliability comes from explicit state, normalized results, stop conditions, and budgets rather than hoping the model eventually declares success.",
    [
      { title: "Observe structured state", body: "Each step receives the goal, current plan, relevant evidence, tool outcomes, remaining budgets, and unresolved blockers." },
      { title: "Execute one authorized action", body: "Validate the proposed action, run it through the application, and return a typed success or error observation." },
      { title: "Stop deterministically", body: "Completion evidence, step and cost limits, repeated-action detection, cancellation, and escalation rules prevent infinite or wasteful loops." },
    ],
    [
      { question: "Why impose a step limit?", options: ["To bound cost and non-termination", "To improve spelling", "To create memory", "To remove tools"], answer: 0, explanation: "A probabilistic controller can repeat or wander without an external breaker." },
      { question: "What should a tool error become?", options: ["A normalized observation with retryability information", "A hidden string", "Automatic success", "A new system prompt"], answer: 0, explanation: "Structured errors support predictable policy and recovery decisions." },
      { question: "What proves completion?", options: ["Application-checkable evidence", "The phrase 'done' alone", "Maximum tokens used", "One attempted action"], answer: 0, explanation: "The application should verify the objective's terminal condition." },
      { question: "What detects a stuck agent?", options: ["Repeated identical actions or unchanged state", "A longer prompt", "More temperature", "Removing logs"], answer: 0, explanation: "Loop guards can identify lack of progress and escalate or stop." },
    ],
  ),
  "genai:intermediate:Agent state": lesson(
    "Explicit agent state makes a run inspectable, replayable, resumable, and testable. It separates durable facts and workflow status from transient prose in the conversation.",
    [
      { title: "Use a typed schema", body: "Record goal, plan, observations, pending action, approvals, budgets, status, and version so invalid transitions can be rejected." },
      { title: "Treat transitions as events", body: "Append facts and derive current state where practical; include idempotency keys so retries do not duplicate side effects." },
      { title: "Separate secrets and access", body: "Store credentials in protected execution infrastructure and retain only references or scoped authorization decisions in model-visible state." },
    ],
    [
      { question: "Why version an agent-state schema?", options: ["Persisted runs may outlive code changes", "To increase randomness", "To expose secrets", "To avoid validation"], answer: 0, explanation: "Versioning enables migration and safe resume across application releases." },
      { question: "What belongs outside model-visible state?", options: ["Raw tool credentials", "The goal", "A public tool result", "Remaining step budget"], answer: 0, explanation: "Secrets should be injected only at the trusted execution boundary." },
      { question: "What prevents duplicate side effects after retry?", options: ["Idempotency keys and recorded outcomes", "Higher temperature", "Longer context", "A different avatar"], answer: 0, explanation: "The executor can recognize that the same operation already completed." },
      { question: "What is a valid state transition?", options: ["One allowed by the workflow schema and policy", "Any model-generated JSON", "Any long response", "Only completion"], answer: 0, explanation: "Application validation protects state-machine invariants." },
    ],
  ),
  "genai:intermediate:Memory": lesson(
    "Agent memory is a governed retrieval system, not a hidden copy of every conversation. Useful memory is scoped, consented, attributable, refreshable, and deletable, with relevance and staleness treated as evaluation problems.",
    [
      { title: "Separate memory roles", body: "Working memory supports the current run, episodic memory records selected events, semantic memory stores durable facts, and profile memory holds user-approved preferences." },
      { title: "Write selectively", body: "A policy decides what is worth retaining, its source, tenant and user scope, sensitivity, expiry, and whether user confirmation is required." },
      { title: "Retrieve and verify", body: "Rank candidates by relevance, recency, authority, and scope; surface provenance and allow current user input to correct stale memory." },
    ],
    [
      { question: "What should determine a memory write?", options: ["An explicit retention policy", "Every token automatically", "Model curiosity", "Available disk space alone"], answer: 0, explanation: "Selective retention limits privacy risk and irrelevant retrieval." },
      { question: "Why attach provenance?", options: ["To judge origin, authority, and correction needs", "To enlarge prompts", "To hide deletion", "To replace consent"], answer: 0, explanation: "A remembered fact needs an inspectable source and time." },
      { question: "What must a multi-tenant memory query enforce?", options: ["Tenant and user scope before retrieval", "Only similarity", "One global index", "No expiration"], answer: 0, explanation: "Similarity search is not an authorization boundary." },
      { question: "What should happen when a user corrects a stored preference?", options: ["Update or supersede the stale memory with traceability", "Keep both as equally true", "Ignore the user", "Delete the entire account automatically"], answer: 0, explanation: "Memory needs lifecycle controls for correction as well as creation and deletion." },
    ],
  ),
};

export function getRoundSevenLessonEnrichment(track: LearningTrackId, pace: string, topic: string) {
  return ROUND_SEVEN_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
