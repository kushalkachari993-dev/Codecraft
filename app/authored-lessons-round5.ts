import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_FIVE_LESSONS: Record<string, LessonEnrichment> = {
  "python:beginner:Basic DSA": lesson(
    "Data structures and algorithms determine how clearly and efficiently a program stores, finds, and transforms information. Choosing by operation matters more than memorizing names.",
    [
      { title: "Match structure to operations", body: "Lists support ordered traversal, sets support fast membership and uniqueness, dictionaries map keys to values, and stacks or queues control processing order." },
      { title: "State the invariant", body: "An algorithm becomes easier to reason about when you identify what remains true after every step, such as processed items never re-entering a queue." },
      { title: "Test shape and boundaries", body: "Use empty, single-item, duplicate, already-sorted, and large inputs because correctness often fails at structural edges." },
    ],
    [
      { question: "Which structure best supports unique membership checks?", options: ["set", "list used only by index", "string", "float"], answer: 0, explanation: "A set represents unique hashed values and usually provides constant-time membership." },
      { question: "What does LIFO describe?", options: ["The last item added is removed first", "Items are alphabetized", "The smallest item is removed", "Every item is duplicated"], answer: 0, explanation: "Stacks use last-in, first-out ordering." },
      { question: "Why name an algorithm invariant?", options: ["It supports reasoning about correctness through each step", "It makes input unnecessary", "It guarantees O(1)", "It replaces tests"], answer: 0, explanation: "An invariant links local steps to the intended final result." },
      { question: "Which edge case commonly exposes data-structure bugs?", options: ["Empty input", "Only the visible example", "A renamed function", "A comment"], answer: 0, explanation: "Empty inputs often reveal unsafe indexing or missing initialization." },
    ],
  ),
  "python:beginner:Big-O basics": lesson(
    "Big-O provides a shared language for how resource use grows as inputs increase. It helps reject designs that work on samples but collapse at production scale.",
    [
      { title: "Focus on growth", body: "O(1), O(log n), O(n), O(n log n), and O(n²) describe dominant growth, not exact runtime in seconds." },
      { title: "Count repeated work", body: "One full traversal is typically O(n); nested full traversals are often O(n²); repeated halving commonly produces O(log n)." },
      { title: "Include space and context", body: "An algorithm may trade memory for speed, and constants, data distribution, implementation, and input bounds still matter." },
    ],
    [
      { question: "What is list membership generally?", options: ["O(n)", "O(1) always", "O(log n) always", "O(n²) always"], answer: 0, explanation: "A list may require scanning every element until a match or the end." },
      { question: "What pattern often produces O(n²)?", options: ["A full loop nested inside another full loop", "One dictionary lookup", "Returning a constant", "Halving the input"], answer: 0, explanation: "Each of n outer steps can perform n inner steps." },
      { question: "Does O(n) predict exact milliseconds?", options: ["No; it describes asymptotic growth", "Yes, n milliseconds", "Only for Python", "Only for databases"], answer: 0, explanation: "Hardware, constants, and implementation determine actual time." },
      { question: "Why can O(n) extra space be acceptable?", options: ["It may replace a much slower repeated search", "Memory has no cost", "It makes all code constant time", "Big-O ignores tradeoffs"], answer: 0, explanation: "A lookup structure can deliberately exchange memory for improved runtime." },
    ],
  ),
  "python:beginner:Basic recursion": lesson(
    "Recursion expresses problems defined in smaller versions of themselves, including trees and divide-and-conquer algorithms. Clear base cases and progress prevent infinite calls and stack exhaustion.",
    [
      { title: "Define the base case", body: "The smallest valid input returns directly and stops further calls." },
      { title: "Make measurable progress", body: "Every recursive call must move closer to the base case, such as a smaller index, shorter list, or child node." },
      { title: "Understand the call stack", body: "Each unfinished call keeps local state until its child returns, so recursion depth consumes memory and Python does not optimize tail calls." },
    ],
    [
      { question: "What stops recursive expansion?", options: ["A base case", "A global variable", "An import", "A set always"], answer: 0, explanation: "The base case resolves without another recursive call." },
      { question: "What must each recursive step do?", options: ["Move toward the base case", "Repeat the identical input", "Create a module", "Catch every exception"], answer: 0, explanation: "Progress ensures the recursion terminates." },
      { question: "Why can deep recursion fail in Python?", options: ["Calls consume stack frames and Python limits recursion depth", "Lists cannot be recursive", "Functions cannot return", "Big-O prevents it"], answer: 0, explanation: "Python protects the process from unbounded call-stack growth." },
      { question: "When is iteration often preferable?", options: ["When the problem is a simple long linear scan", "Whenever a tree exists", "Only for empty input", "Never"], answer: 0, explanation: "A loop can avoid call overhead and recursion-depth limits for linear work." },
    ],
  ),

  "sql:beginner:Subqueries": lesson(
    "Subqueries let one query produce values or rows consumed by another. Correctness depends on matching scalar, set, and existence operators to the inner result shape.",
    [
      { title: "Know the returned shape", body: "A scalar subquery must return at most one value, IN consumes a set of values, and EXISTS asks only whether a matching row exists." },
      { title: "Correlate deliberately", body: "A correlated subquery references the outer row and may execute conceptually once per candidate, making both meaning and performance important." },
      { title: "Prefer clarity with evidence", body: "JOIN, CTE, and subquery forms can express similar logic; choose a correct readable form, then inspect the plan for important workloads." },
    ],
    [
      { question: "Which operator fits a subquery returning many sector IDs?", options: ["IN", "=", "IS NULL", "LIMIT without comparison"], answer: 0, explanation: "IN compares the outer value with a set returned by the inner query." },
      { question: "What does EXISTS evaluate?", options: ["Whether the inner query returns at least one row", "The first text value", "The row count as output", "Sort order"], answer: 0, explanation: "EXISTS is a boolean existence test and ignores projected values." },
      { question: "What makes a subquery correlated?", options: ["It references a column from the outer query", "It uses parentheses", "It returns text", "It contains ORDER BY"], answer: 0, explanation: "The inner expression depends on the current outer row." },
      { question: "Why can = fail with a multi-row subquery?", options: ["A scalar comparison expects at most one value", "Equality cannot compare numbers", "Subqueries cannot filter", "The table needs a view"], answer: 0, explanation: "Use an operator whose expected shape matches the subquery result." },
    ],
  ),
  "sql:beginner:String functions": lesson(
    "String functions normalize, combine, and inspect text near the data. They are useful for reporting and cleanup, but filters must consider collation, Unicode, and index behavior.",
    [
      { title: "Transform without mutating", body: "Functions in SELECT such as TRIM, LOWER, UPPER, REPLACE, and LENGTH calculate output values unless used in an UPDATE." },
      { title: "Treat patterns carefully", body: "LIKE and ILIKE use wildcard semantics; user-provided patterns may require escaping and unanchored searches can be expensive." },
      { title: "Plan indexed normalization", body: "Applying LOWER to every stored value may bypass a normal index; consistent stored normalization or an expression index can help." },
    ],
    [
      { question: "What does TRIM normally remove?", options: ["Leading and trailing spaces", "All internal spaces", "NULL rows", "Duplicate rows"], answer: 0, explanation: "TRIM removes characters at the edges, using spaces by default." },
      { question: "Which PostgreSQL operator performs case-insensitive pattern matching?", options: ["ILIKE", "GROUP BY", "IS DISTINCT", "CASCADE"], answer: 0, explanation: "ILIKE is PostgreSQL's case-insensitive form of LIKE." },
      { question: "Does UPPER(name) change stored names in SELECT?", options: ["No; it transforms the result value", "Yes, permanently", "Only with ORDER BY", "Only for primary keys"], answer: 0, explanation: "A SELECT expression does not mutate table data." },
      { question: "Why might WHERE lower(name)=... miss a normal name index?", options: ["The indexed expression differs from the filtered expression", "LOWER deletes values", "Text cannot be indexed", "WHERE ignores indexes"], answer: 0, explanation: "An expression index on lower(name) or normalized storage may be needed." },
    ],
  ),
  "sql:beginner:Date functions": lesson(
    "Time logic affects reporting, expiration, scheduling, and incident analysis. Correct systems distinguish calendar dates, local wall time, durations, and absolute instants.",
    [
      { title: "Choose temporal types", body: "date stores a calendar day, timestamp stores date and time without zone semantics, and timestamptz represents an instant normalized for comparison." },
      { title: "Group on explicit boundaries", body: "date_trunc aligns timestamps to an hour, day, or month; reporting zones should be chosen before deriving local periods." },
      { title: "Use interval semantics", body: "Calendar intervals such as one month are not fixed seconds, and daylight-saving transitions make local-day arithmetic different from 24 hours." },
    ],
    [
      { question: "What does timestamptz represent in PostgreSQL?", options: ["An absolute instant displayed in the session zone", "A zone name stored with every value", "A date only", "A fixed text string"], answer: 0, explanation: "PostgreSQL normalizes the instant and renders it in the active time zone." },
      { question: "What does date_trunc('day', captured_at) do?", options: ["Aligns the timestamp to its day boundary", "Deletes old rows", "Adds 24 hours", "Converts it to text only"], answer: 0, explanation: "date_trunc zeroes smaller time fields at the requested precision." },
      { question: "Why choose the reporting timezone before grouping by day?", options: ["The same instant can fall on different local dates", "Timezones change row IDs", "GROUP BY requires text", "Dates are always UTC"], answer: 0, explanation: "Local calendar boundaries depend on timezone." },
      { question: "Is interval '1 month' always the same seconds?", options: ["No; calendar months have different lengths", "Yes, exactly 30 days", "Only in UTC", "Only for dates"], answer: 0, explanation: "Calendar arithmetic follows month boundaries rather than a fixed duration." },
    ],
  ),
  "sql:beginner:Basic schema design": lesson(
    "Schema design converts durable domain rules into tables, keys, types, constraints, and relationships. A good schema supports lifecycle changes and common queries without repeating facts.",
    [
      { title: "Identify entities and facts", body: "Give each table one clear subject, a stable identity, and columns whose values describe that subject or relationship." },
      { title: "Encode integrity", body: "Use appropriate types, NOT NULL, UNIQUE, CHECK, primary keys, and foreign keys so invalid states cannot enter through another writer." },
      { title: "Test real workflows", body: "Walk through creates, reads, updates, deletes, retention, reporting, and expected growth before finalizing the design." },
    ],
    [
      { question: "What should one table usually represent?", options: ["One clear entity or relationship", "An entire screen", "Every application field", "One query only"], answer: 0, explanation: "A focused subject makes ownership and invariants understandable." },
      { question: "Where should a relay reading value live?", options: ["On a readings row related to a relay", "Repeated on the sector", "Inside the relay name", "In a comma-separated column"], answer: 0, explanation: "A reading is an event or measurement with its own identity and time." },
      { question: "Why test update and delete workflows during design?", options: ["Lifecycle rules expose missing relationships and constraints", "Schemas only support inserts", "It improves colors", "It removes migrations"], answer: 0, explanation: "A design must remain correct as records change or retire." },
      { question: "What is a warning sign of duplicated facts?", options: ["The same real-world value must be updated in many rows", "A table has a primary key", "A query uses a join", "A timestamp has a timezone"], answer: 0, explanation: "Repeated facts create inconsistency when only some copies are updated." },
    ],
  ),

  "genai:intermediate:Transformers deeper": lesson(
    "Production model behavior emerges from stacked attention, residual, normalization, and feed-forward operations—not a single interpretable component. Understanding the data flow helps diagnose context, latency, and representation limits.",
    [
      { title: "Follow the residual stream", body: "Each block reads and updates token representations through residual additions, letting many layers contribute information without replacing the entire signal." },
      { title: "Separate attention and transformation", body: "Multi-head attention mixes information across token positions, while feed-forward networks transform each position's representation independently." },
      { title: "Interpret cautiously", body: "Attention weights and individual heads can reveal patterns, but they are not complete causal explanations and may change across prompts or layers." },
    ],
    [
      { question: "What does self-attention primarily mix?", options: ["Information across token positions", "Database rows", "Model API credentials", "Only output tokens"], answer: 0, explanation: "Queries, keys, and values let each position gather weighted information from permitted positions." },
      { question: "What is the residual connection's role?", options: ["Carry existing representation while adding a block update", "Remove token order", "Choose the tokenizer", "Store documents"], answer: 0, explanation: "Residual addition preserves a signal path through deep stacks." },
      { question: "Where does a feed-forward sublayer usually operate?", options: ["On each token position with shared parameters", "Across database shards", "Only on the first token", "Before tokenization"], answer: 0, explanation: "The same MLP transformation is applied position-wise after attention mixing." },
      { question: "Why avoid assigning one human meaning to a head?", options: ["Learned behavior is distributed and context-dependent", "Heads contain no parameters", "Every head is identical", "Attention is random"], answer: 0, explanation: "Observed patterns may be partial, prompt-sensitive, and supported by other components." },
    ],
  ),
  "genai:intermediate:Embeddings deeper": lesson(
    "Embedding engineering selects the representation, metric, normalization, and evaluation strategy for a real retrieval task. Small configuration choices can change rankings and downstream answer quality substantially.",
    [
      { title: "Respect model contracts", body: "Some models use different query and document instructions or prefixes; mixing them incorrectly degrades alignment." },
      { title: "Align metric and normalization", body: "Cosine, dot product, and Euclidean distance can rank differently; normalized vectors make cosine and dot-product rankings closely related." },
      { title: "Evaluate the whole path", body: "Use labeled query-document pairs, recall and ranking metrics, hard negatives, content-length slices, and downstream grounded-answer evaluation." },
    ],
    [
      { question: "Why use task-specific query/document prefixes when required?", options: ["They tell the model which retrieval role to encode", "They reduce vector dimensions", "They encrypt content", "They replace metadata"], answer: 0, explanation: "Asymmetric embedding models learn different representations for search queries and candidate documents." },
      { question: "What does L2 normalization do?", options: ["Scales vectors to unit length", "Sorts documents", "Removes dimensions", "Creates labels"], answer: 0, explanation: "Each vector is divided by its magnitude, making direction the primary comparison." },
      { question: "What is a hard negative?", options: ["An irrelevant candidate that looks deceptively relevant", "A deleted vector", "A missing API key", "A zero token"], answer: 0, explanation: "Hard negatives test whether the embedding distinguishes close but incorrect content." },
      { question: "Why pair retrieval metrics with answer tests?", options: ["Good ranking does not guarantee the generator uses evidence correctly", "Recall measures generation", "Answer tests replace labels", "Vectors contain final prose"], answer: 0, explanation: "End-to-end quality depends on both retrieval and evidence use." },
    ],
  ),
  "genai:intermediate:Document ingestion": lesson(
    "Ingestion is the reliability boundary between heterogeneous source files and the retrieval index. Provenance, extraction quality, versioning, permissions, and retry behavior determine whether later answers can be trusted.",
    [
      { title: "Extract structure, not just text", body: "Preserve headings, tables, lists, page locations, and reading order because these structures carry meaning used by chunking and citations." },
      { title: "Assign stable identity", body: "Track source id, version, content hash, parser version, permissions, and timestamps so updates and deletions reach every derived chunk." },
      { title: "Make failures observable", body: "Quarantine corrupt or low-quality extraction, record partial results, retry safely, and prevent incomplete documents from silently entering production search." },
    ],
    [
      { question: "Why preserve headings during extraction?", options: ["They provide semantic structure for chunks and retrieval", "They reduce all files to one line", "They replace source IDs", "They grant permissions"], answer: 0, explanation: "Headings convey hierarchy and context beyond raw token sequence." },
      { question: "What enables deletion of every chunk from an obsolete document?", options: ["Stable source identity and version linkage", "Higher top-k", "More overlap", "Temperature zero"], answer: 0, explanation: "Derived records must remain traceable to their source lifecycle." },
      { question: "What should happen to a partially parsed document?", options: ["Record and quarantine or retry it according to policy", "Index it silently", "Discard all logs", "Treat it as complete"], answer: 0, explanation: "Visible failure states prevent corrupt evidence from appearing authoritative." },
      { question: "Why store parser version?", options: ["Extraction behavior can change and require reproducible reprocessing", "It selects the LLM", "It controls Git", "It replaces content hashes"], answer: 0, explanation: "Versioning explains differences and supports controlled backfills." },
    ],
  ),
  "genai:intermediate:Chunking": lesson(
    "Chunk boundaries determine which evidence can be retrieved and whether it remains meaningful outside its source. Chunking is therefore an evaluated retrieval design, not a formatting afterthought.",
    [
      { title: "Prefer semantic boundaries", body: "Sections, paragraphs, table units, code blocks, and speaker turns often preserve meaning better than arbitrary character windows." },
      { title: "Balance size and overlap", body: "Small chunks improve targeting but may lose context; large chunks preserve context but dilute similarity and consume more tokens." },
      { title: "Keep hierarchy available", body: "Store parent links, neighboring positions, titles, and source metadata so retrieval can expand a precise match into sufficient context." },
    ],
    [
      { question: "What is a risk of very small chunks?", options: ["They can lose definitions and surrounding context", "They cannot be embedded", "They always cost more storage than documents", "They prevent metadata"], answer: 0, explanation: "A fragment may match terms but lack enough meaning to answer correctly." },
      { question: "What is a risk of very large chunks?", options: ["Relevant evidence can be diluted and context cost increases", "They lose all text", "They have no source", "They disable filters"], answer: 0, explanation: "Large units contain more unrelated content and consume more context tokens." },
      { question: "Why store a parent section id?", options: ["To expand a precise hit with broader context", "To change vector dimensions", "To authorize every user", "To remove overlap"], answer: 0, explanation: "Parent-child retrieval preserves both targeting and explanatory context." },
      { question: "How should chunk size be chosen?", options: ["Evaluate it on representative retrieval and answer tasks", "Use one global magic number", "Match the file byte size", "Maximize overlap"], answer: 0, explanation: "Content types and questions need empirical tuning." },
    ],
  ),
  "genai:intermediate:Retrieval engineering": lesson(
    "Retrieval engineering coordinates query understanding, lexical and semantic indexes, filters, ranking, deduplication, and context assembly. Instrumenting each stage makes evidence loss diagnosable.",
    [
      { title: "Transform the query carefully", body: "Rewrite ambiguity, expand terminology, or decompose intent while retaining the original query for traceability and fallback." },
      { title: "Retrieve inside boundaries", body: "Apply tenant, permission, language, freshness, source-type, and product filters before candidate evidence reaches generation." },
      { title: "Assemble useful context", body: "Deduplicate candidates, preserve source diversity, expand neighboring context, respect token budgets, and record why each passage was selected." },
    ],
    [
      { question: "Why retain the original query after rewriting?", options: ["For traceability, evaluation, and fallback", "To double token cost", "To remove intent", "To avoid filters"], answer: 0, explanation: "The system needs to explain and compare how transformation affected retrieval." },
      { question: "When should authorization filters be applied?", options: ["Before candidates are exposed to later stages", "After the answer is shown", "Only during evaluation", "Never in semantic search"], answer: 0, explanation: "Retrieval must not surface evidence the requester cannot access." },
      { question: "Why deduplicate retrieved passages?", options: ["Repeated evidence wastes context and reduces source diversity", "Duplicates are always false", "It retrains embeddings", "It changes permissions"], answer: 0, explanation: "Near-identical chunks can crowd out distinct useful evidence." },
      { question: "What should a retrieval trace reveal?", options: ["Candidates and changes at each pipeline stage", "Only the final prose", "Hidden credentials", "The model's private reasoning"], answer: 0, explanation: "Stage-level observability shows where relevant evidence was gained or lost." },
    ],
  ),
};

export function getRoundFiveLessonEnrichment(track: LearningTrackId, pace: string, topic: string) {
  return ROUND_FIVE_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
