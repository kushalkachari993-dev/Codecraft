import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });
const q = (question: string, correct: string, distractors: [string, string, string], explanation: string) => ({ question, options: [correct, ...distractors], answer: 0, explanation });

const ROUND_SEVENTEEN_LESSONS: Record<string, LessonEnrichment> = {
  "python:expert:Distributed systems": lesson(
    "Distributed systems coordinate work across processes that fail independently, communicate with delay, and observe different versions of state. Python makes clients and workers easy to write, but production correctness comes from explicit ownership, idempotency, timeouts, durable messages, bounded retries, consistency choices, and recovery—not from hiding the network behind a function call.",
    [
      { title: "Design for partial failure", body: "Classify every remote outcome as success, definite failure, or unknown; attach deadlines, cancellation, bounded exponential backoff with jitter, circuit breaking, and idempotency keys so retries cannot silently duplicate business effects." },
      { title: "Own and replicate state deliberately", body: "Choose one authority for each invariant, partition with stable keys, state the consistency needed by each read, and use transactional outbox/inbox, deduplication, version checks, and reconciliation when work crosses boundaries." },
      { title: "Operate the whole flow", body: "Propagate trace and operation identifiers, measure queue age and saturation, enforce backpressure, test node and network failures, document recovery objectives, and make replay safe before treating the happy path as complete." },
    ],
    [
      q("Why must a timed-out write be treated as an unknown outcome?", "The server may have committed even though the response was lost", ["Timeouts always roll back", "The client owns server state", "TCP guarantees a reply"], "A safe retry therefore needs a stable idempotency key or a read that resolves the outcome."),
      q("What should own a cross-service business invariant?", "One explicit authoritative boundary", ["Every service independently", "The fastest cache", "The message broker UI"], "Splitting ownership creates races and contradictory decisions."),
      q("What does backpressure protect?", "A saturated dependency from unbounded incoming work", ["Only network encryption", "Schema migrations", "Source formatting"], "Bounded queues and admission control preserve latency and recovery capacity."),
      q("Why use a transactional outbox?", "State change and message intent commit atomically", ["It makes delivery exactly once", "It removes consumers", "It replaces monitoring"], "Consumers still need idempotency because publication can be retried."),
    ],
  ),
  "python:expert:Design patterns": lesson(
    "Design patterns are names for recurring collaboration structures, not decorations or mandatory class hierarchies. In Python, functions, protocols, context managers, decorators, and modules often express Strategy, Adapter, Repository, Unit of Work, Factory, and Observer more directly than textbook inheritance. A pattern is valuable only when it isolates a real axis of change or protects an invariant.",
    [
      { title: "Start from the pressure", body: "Name the changing policy, unstable dependency, lifecycle, transaction, or notification requirement first; then select the smallest pattern whose trade-offs match that pressure." },
      { title: "Use Python-shaped boundaries", body: "Prefer callables for Strategy, structural Protocols for ports, adapters for vendor formats, context managers for resource scope, and explicit composition roots for factories and dependency wiring." },
      { title: "Combine patterns around effects", body: "Repository plus Unit of Work can define persistence and transaction scope, while an outbox records integration events; test contracts and failure ordering rather than mocking every method call." },
    ],
    [
      q("When is Strategy useful?", "When one policy must vary behind a stable calling contract", ["Whenever a class exists", "To hide all data", "To remove tests"], "A callable or protocol is often enough to make the policy replaceable."),
      q("What does an Adapter protect?", "The application contract from an external interface or data shape", ["A database from backups", "A loop from iteration", "A package from versions"], "Translation stays at the edge instead of leaking vendor semantics inward."),
      q("What is pattern theater?", "Adding pattern-shaped indirection without a real change or invariant pressure", ["Testing a protocol", "Using composition", "Documenting a boundary"], "Extra indirection increases navigation and maintenance cost."),
      q("Why pair Repository with Unit of Work?", "To separate collection-like access from an explicit transaction boundary", ["To eliminate database constraints", "To guarantee distributed consensus", "To avoid domain behavior"], "The use case can own commit and rollback across repository operations."),
    ],
  ),
  "python:expert:Package design": lesson(
    "A Python package is a compatibility and trust boundary. Good design exposes a small coherent public API, points dependencies inward, avoids import-time side effects, publishes reproducible metadata, separates optional capabilities, and evolves through semantic promises that users can test and understand.",
    [
      { title: "Draw the public surface", body: "Choose documented import paths, re-export intentionally, define types and exceptions, keep internals private, and prevent cycles with layered modules and dependency-direction tests." },
      { title: "Make installation predictable", body: "Use pyproject.toml metadata, bounded core dependencies, extras for optional integrations, environment markers sparingly, deterministic builds, wheel and sdist checks, and no network or configuration work at import time." },
      { title: "Evolve safely", body: "Apply semantic versioning to observable behavior, deprecate with warnings and migration guidance, maintain changelogs and compatibility tests, sign or attest releases, scan dependencies, and plan ownership of security fixes." },
    ],
    [
      q("What belongs in a public package API?", "Only intentionally supported names and behavior", ["Every module global", "Build cache files", "All transitive dependencies"], "A smaller promise leaves room to improve internals safely."),
      q("Why use optional dependency extras?", "Users install integrations only when they need them", ["They remove version conflicts automatically", "They encrypt wheels", "They replace imports"], "The core remains lighter and has a smaller supply-chain surface."),
      q("What is harmful at import time?", "Network calls or irreversible configuration side effects", ["Defining functions", "Creating constants", "Declaring protocols"], "Imports should be fast, deterministic, and safe for tooling."),
      q("What should a breaking public behavior change trigger?", "A major-version plan with migration guidance", ["A silent patch release", "Deletion of tests", "A new private helper only"], "Version promises let consumers control upgrade risk."),
    ],
  ),
  "python:expert:Open source": lesson(
    "Open-source engineering combines code with licensing, governance, review, security response, release integrity, documentation, and community stewardship. A useful contribution solves a verified problem in the project's conventions, while sustainable maintainership makes authority, support boundaries, and vulnerability handling explicit.",
    [
      { title: "Read the social and legal contract", body: "Check the license, code of conduct, contribution guide, developer certificate or CLA, governance, support policy, roadmap, and issue history before proposing a change." },
      { title: "Contribute a reviewable slice", body: "Reproduce the problem, discuss larger changes early, add focused tests and documentation, preserve compatibility, write a clear rationale, and respond to review without expanding scope unnecessarily." },
      { title: "Maintain the trust chain", body: "Publish a SECURITY policy and private disclosure route, triage with severity and affected versions, coordinate fixes and advisories, protect release credentials, attest artifacts, rotate ownership, and prevent maintainer burnout." },
    ],
    [
      q("What should precede a large unsolicited pull request?", "Discussion with maintainers about problem, scope, and direction", ["A forced release", "Deleting issue templates", "Changing the license"], "Early alignment prevents wasted work and respects project governance."),
      q("Where should a suspected vulnerability be reported?", "Through the project's private security channel", ["A public issue with exploit details", "Only social media", "A dependency lockfile"], "Coordinated disclosure gives maintainers time to protect users."),
      q("What makes a contribution easy to review?", "Focused scope, reproduction, tests, rationale, and documentation", ["Many unrelated refactors", "No issue context", "Generated code only"], "Reviewers can verify one coherent change and its compatibility impact."),
      q("Why does governance matter?", "It explains decision authority, succession, and conflict resolution", ["It makes tests unnecessary", "It guarantees funding", "It removes licenses"], "Projects need predictable decisions beyond any one contributor."),
    ],
  ),
  "python:expert:Specialization": lesson(
    "Specialization turns broad Python competence into repeatable value in a domain such as backend systems, data, ML, automation, security, scientific computing, or developer tooling. Strong specialists remain T-shaped: they deepen domain constraints and operating evidence while preserving transferable foundations in testing, performance, security, architecture, and communication.",
    [
      { title: "Choose a problem field", body: "Map target roles and real workflows, identify durable concepts and current tools, assess gaps, and choose a depth thesis narrow enough to produce evidence within weeks rather than collecting unrelated tutorials." },
      { title: "Build an evidence ladder", body: "Progress from a focused lab to a production-shaped project, measurement report, design document, incident exercise, reusable package, and contribution; define acceptance criteria and feedback for every artifact." },
      { title: "Compound and transfer", body: "Track outcomes instead of hours, revisit fundamentals revealed by failures, teach what you learn, maintain a public or private portfolio, and periodically test whether expertise transfers to a new tool or constraint." },
    ],
    [
      q("What is a T-shaped specialist?", "Deep in one domain while retaining broad transferable engineering foundations", ["Expert in every library", "Focused only on syntax", "Unable to change tools"], "Depth creates leverage while breadth supports collaboration and sound trade-offs."),
      q("What is stronger evidence than course completion?", "A measured project with tests, decisions, and operational reflection", ["A longer bookmark list", "More copied snippets", "An unverified badge"], "Artifacts demonstrate applied judgment under constraints."),
      q("How should progress be measured?", "Against observable capabilities and artifact acceptance criteria", ["Only hours watched", "Number of tools installed", "Daily social posts"], "Outcome-based evidence exposes what can actually be done."),
      q("Why test transfer to another tool?", "It distinguishes durable understanding from memorized framework steps", ["To avoid specialization", "To remove documentation", "To guarantee a job"], "Underlying principles should survive changes in libraries and platforms."),
    ],
  ),
  "sql:expert:SQL vs NoSQL": lesson(
    "SQL versus NoSQL is a workload decision, not an ideology. Relational engines excel at declarative joins, constraints, and multi-record transactions; document, key-value, wide-column, graph, and search systems optimize different models and access patterns. The correct choice starts with invariants, query shapes, scale, change, consistency, and the team's ability to operate and recover the system.",
    [
      { title: "Model requirements before products", body: "List entities, invariants, transaction boundaries, read and write paths, latency and availability objectives, growth, geographic placement, retention, security, and analytical needs." },
      { title: "Evaluate the real engine", body: "Compare indexing, transactions, consistency, query evolution, schema enforcement, hot partitions, backups, point-in-time recovery, change feeds, observability, cost, and failure behavior—not category labels." },
      { title: "Pay the polyglot tax consciously", body: "If a derived search, cache, graph, or document store adds clear value, keep one source of truth and define propagation, idempotency, reconciliation, deletion, replay, ownership, and degraded-mode behavior." },
    ],
    [
      q("What should drive the initial database choice?", "Data invariants, access patterns, service objectives, and operations", ["Fashion", "Avoiding all schemas", "One benchmark screenshot"], "Technology follows the workload and failure contract."),
      q("Can a relational database store JSON documents?", "Yes, many relational systems support document values and indexes", ["Never", "Only without transactions", "Only in backups"], "Capabilities overlap, so compare concrete engines and workloads."),
      q("What is the main cost of polyglot persistence?", "Synchronization, consistency, recovery, and operational complexity", ["Fewer data models", "Automatic ownership", "No monitoring"], "Every additional store needs a reliable lifecycle and authority model."),
      q("When is a search engine a sensible secondary store?", "When specialized retrieval value justifies a replayable derived index", ["As the only source for financial balances", "To avoid backups", "For every primary-key lookup"], "The authoritative database should remain able to rebuild and reconcile the index."),
    ],
  ),
  "sql:expert:Multi-tenancy": lesson(
    "Multi-tenancy serves multiple customers from shared software while preserving confidentiality, integrity, performance fairness, lifecycle control, and recoverability. Isolation can use shared tables, schemas, databases, or clusters; each choice changes cost, connection pressure, migrations, noisy-neighbor risk, and the granularity of backup and restore.",
    [
      { title: "Make tenant identity structural", body: "Carry tenant_id through authentication context, primary and foreign keys, unique constraints, every query, cache key, job, event, log, and object path; reject missing context instead of defaulting it." },
      { title: "Layer isolation controls", body: "Use least-privilege roles, row-level security with disciplined session state, tenant-safe composite keys, application authorization, encrypted boundaries, resource quotas, and automated cross-tenant negative tests." },
      { title: "Design the tenant lifecycle", body: "Support provisioning, plan changes, per-tenant migrations, export, deletion, retention, legal holds, noisy-neighbor mitigation, audit trails, and tested restoration of one tenant without corrupting others." },
    ],
    [
      q("Why include tenant_id in a unique constraint?", "Uniqueness is usually scoped to one tenant", ["To remove indexes", "To expose tenant data", "To avoid authentication"], "For example, two tenants may legitimately use the same external key."),
      q("What risk remains with application-only filters?", "One missed predicate can expose another tenant's rows", ["Queries become encrypted", "Backups stop", "Constraints duplicate"], "Database-enforced isolation provides an important additional boundary."),
      q("What does database-per-tenant improve?", "Physical isolation and tenant-level restore options", ["Unlimited connections", "Zero migration work", "Automatic low cost"], "It also increases fleet, pooling, and migration overhead."),
      q("What must a background job carry?", "An explicit authenticated tenant context", ["Only a queue name", "The last web request", "A global default tenant"], "Async work is another data-access path that must preserve isolation."),
    ],
  ),
  "sql:expert:Zero-downtime migrations": lesson(
    "A zero-downtime migration changes schema and data while multiple application versions and background workers continue serving traffic. Safe migrations separate expand, backfill, validation, cutover, and contract phases; preserve compatibility; bound locks and resource use; and define evidence-based rollback or roll-forward paths.",
    [
      { title: "Expand compatibly", body: "Add nullable columns, new tables, compatible indexes, or permissive constraints first; deploy code that understands both representations and make writes idempotent before moving existing data." },
      { title: "Backfill and verify", body: "Process stable key ranges in small resumable batches, throttle against replication and latency, record checkpoints, handle concurrent writes, compare counts and checksums, then validate constraints without surprising long locks." },
      { title: "Cut over before contract", body: "Switch reads behind a reversible control, observe errors and drift through a compatibility window, stop old writers, and only in a later release remove old columns, indexes, code paths, and synchronization." },
    ],
    [
      q("Why must expand and contract be separate releases?", "Old and new application versions overlap during deployment", ["SQL forbids one release", "Backups need two tables", "Indexes require two servers"], "Immediate removal can break still-running old code or queued jobs."),
      q("What makes a backfill production-safe?", "Small resumable idempotent batches with throttling and progress evidence", ["One unbounded transaction", "Disabling monitoring", "Random updates without checkpoints"], "Bounded work limits locks, WAL, lag, and recovery cost."),
      q("When should a new NOT NULL rule be enforced?", "After data is backfilled, writers comply, and validation succeeds", ["Before the column exists", "During an unrelated incident", "Without checking old rows"], "The system must satisfy the invariant before enforcement."),
      q("What should happen before dropping the old column?", "All readers and writers have moved and drift remains zero through a compatibility window", ["Only the first new instance deploys", "One row is backfilled", "The index is cached"], "Contract is the last irreversible step."),
    ],
  ),
  "sql:expert:Database architecture": lesson(
    "Database architecture maps authoritative ownership, transactional boundaries, data models, derived stores, topology, consistency, security, observability, recovery, and evolution to product requirements. A diagram is not enough: every data flow needs semantics for failure, replay, deletion, reconciliation, capacity, and organizational ownership.",
    [
      { title: "Anchor on truth and invariants", body: "Assign each datum one source of truth, define transaction and consistency boundaries, choose schemas and constraints, estimate workload and growth, classify sensitive data, and set latency, availability, RPO, and RTO objectives." },
      { title: "Add derived systems intentionally", body: "Use replicas, caches, search, streams, warehouses, and feature stores for explicit read or analytical needs; define freshness, invalidation, ordering, idempotency, replay, reconciliation, access control, and deletion propagation." },
      { title: "Design evolution and operations", body: "Plan migrations, partitioning, pooling, backups, failover, capacity, observability, incident ownership, cost limits, and exit paths; test restoration and degraded modes before scale or failure forces the decision." },
    ],
    [
      q("What is the source of truth?", "The authoritative system allowed to decide a datum's value", ["Every cache equally", "The newest dashboard", "Any replica during lag"], "Derived stores must reconcile back to a clear authority."),
      q("What do RPO and RTO describe?", "Acceptable data loss and acceptable recovery time", ["Query syntax and row order", "Index width and depth", "Roles and permissions"], "They turn recovery expectations into testable architecture requirements."),
      q("What must accompany a cache?", "Ownership, key scope, freshness, invalidation, and degraded behavior", ["A second source of truth", "No expiry", "Shared tenant keys"], "A cache changes consistency and failure modes even when it improves latency."),
      q("Why test restore rather than only backup completion?", "A backup is valuable only if it can restore correct service within objectives", ["Restore changes SQL syntax", "Backups always corrupt", "Monitoring replaces recovery"], "Exercises expose missing data, credentials, ordering, and runbook steps."),
    ],
  ),
};

export function getRoundSeventeenLessonEnrichment(track: LearningTrackId, pace: string, topic: string): LessonEnrichment | null {
  return ROUND_SEVENTEEN_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
