import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_SIX_LESSONS: Record<string, LessonEnrichment> = {
  "python:intermediate:OOP": lesson(
    "Object-oriented design keeps state and the behavior that protects it behind an explicit interface. It is valuable when objects have identity, lifecycle, and invariants—not merely to wrap unrelated functions.",
    [
      { title: "Model one responsibility", body: "A class should represent a coherent concept whose methods operate on its state, rather than becoming a container for every utility." },
      { title: "Protect invariants", body: "Constructors and methods validate transitions so callers cannot create impossible states such as negative stored energy." },
      { title: "Prefer composition deliberately", body: "Has-a relationships often keep dependencies replaceable; inheritance is strongest when subtypes truly preserve the parent's behavioral contract." },
    ],
    [
      { question: "What does self refer to in an instance method?", options: ["The receiving object", "The class file", "A global variable", "The parent module"], answer: 0, explanation: "Python passes the instance as the first method argument by convention." },
      { question: "Where should an object's invariant be enforced?", options: ["At construction and every state-changing method", "Only in the UI", "Only in comments", "After serialization"], answer: 0, explanation: "Every mutation path must preserve valid state." },
      { question: "When is composition often preferable to inheritance?", options: ["When one object uses another service without being its subtype", "Whenever methods exist", "Only for numbers", "Never"], answer: 0, explanation: "Composition expresses has-a collaboration without claiming an is-a relationship." },
      { question: "What is encapsulation?", options: ["Exposing a controlled interface around internal state", "Making every attribute global", "Hiding all documentation", "Avoiding methods"], answer: 0, explanation: "Encapsulation reduces coupling and centralizes valid transitions." },
    ],
  ),
  "python:intermediate:Comprehensions": lesson(
    "Comprehensions express focused transformations and filters close to Python's collection vocabulary. Used carefully, they make intent compact without hiding complex control flow.",
    [
      { title: "Read in execution order", body: "A comprehension names the output expression, then iterates source clauses and applies filters, producing a new collection." },
      { title: "Choose the output type", body: "Square brackets create lists, braces create sets or dictionaries, and parentheses create a lazy generator expression." },
      { title: "Keep complexity visible", body: "One transformation and a small predicate are readable; nested branching or side effects belong in named functions and loops." },
    ],
    [
      { question: "What does {x for x in values} create?", options: ["A set", "A dictionary", "A tuple", "A list"], answer: 0, explanation: "A brace comprehension without key:value syntax creates a set." },
      { question: "Does a list comprehension mutate its source list?", options: ["No; it builds a new list", "Yes, always", "Only with if", "Only for strings"], answer: 0, explanation: "The source is iterated while a separate result collection is constructed." },
      { question: "When should a comprehension become a normal loop?", options: ["When nested logic or side effects obscure intent", "Whenever it filters", "Whenever it returns a list", "Never"], answer: 0, explanation: "Readability is the constraint, not minimum line count." },
      { question: "What does (transform(x) for x in values) create?", options: ["A lazy generator expression", "A tuple immediately", "A set", "A module"], answer: 0, explanation: "Parentheses retain lazy iteration rather than building every result at once." },
    ],
  ),
  "python:intermediate:Lambda": lesson(
    "Lambdas are small anonymous functions useful where an API expects a short callable. They are best for transparent expressions, while named functions communicate complex behavior and intent better.",
    [
      { title: "Return one expression", body: "A lambda evaluates and returns a single expression; statements such as assignments, try blocks, and multi-step validation do not belong inside it." },
      { title: "Use at callable boundaries", body: "Sorting keys, mapping functions, and short callbacks are common places where a local anonymous callable stays readable." },
      { title: "Watch variable capture", body: "Closures capture names by late binding, so lambdas created in loops may all observe the final loop value unless bound deliberately." },
    ],
    [
      { question: "What can a Python lambda contain?", options: ["One expression", "Multiple statements", "A class body", "A try/finally block"], answer: 0, explanation: "The lambda expression returns the value of its single expression." },
      { question: "Which is a good lambda use?", options: ["key=lambda relay: relay['power'] in sorted", "A 20-step parser", "Database migrations", "Complex exception handling"], answer: 0, explanation: "A short local key function makes the sorting intent clear." },
      { question: "Why can lambdas in loops capture an unexpected value?", options: ["Names are generally looked up when the lambda runs", "Lambdas cannot take arguments", "Loops delete variables", "Sorting changes closures"], answer: 0, explanation: "Late binding means each closure can see the loop variable's final value." },
      { question: "When should a lambda become def?", options: ["When naming, documentation, typing, or multi-step logic improves clarity", "Whenever it returns text", "Only in classes", "Never"], answer: 0, explanation: "A named function is a better interface for nontrivial behavior." },
    ],
  ),
  "python:intermediate:Iterators": lesson(
    "Iterators define Python's one-item-at-a-time traversal protocol. They support streaming and custom containers while making exhaustion and single-pass behavior explicit.",
    [
      { title: "Separate iterable and iterator", body: "iter(obj) requests an iterator; next(iterator) requests its next value; an iterable may create a fresh iterator for each traversal." },
      { title: "Signal completion", body: "An iterator raises StopIteration when exhausted, and for loops handle this protocol automatically." },
      { title: "Design state carefully", body: "An iterator stores its current position and is usually consumed once, so callers should not assume it can restart or be shared safely." },
    ],
    [
      { question: "What does iter(obj) request?", options: ["An iterator for obj", "The last item", "A copied list always", "A length"], answer: 0, explanation: "The iterable protocol returns an object implementing __next__." },
      { question: "How does an iterator signal exhaustion?", options: ["Raise StopIteration", "Return None always", "Raise ValueError", "Delete itself"], answer: 0, explanation: "Iteration machinery catches StopIteration to finish a loop." },
      { question: "Can every iterator be restarted?", options: ["No; many are single-pass", "Yes, with next", "Only dictionaries cannot", "Always after StopIteration"], answer: 0, explanation: "A fresh iterator must often be requested from the original iterable." },
      { question: "Why use an iterator for large data?", options: ["It can process values without loading the entire sequence", "It guarantees sorting", "It removes I/O", "It makes work O(1)"], answer: 0, explanation: "Lazy traversal controls peak memory, though total work remains." },
    ],
  ),
  "python:intermediate:Generators": lesson(
    "Generators make iterator state machines concise with yield. They enable streaming pipelines, but deferred execution changes when errors, cleanup, and side effects occur.",
    [
      { title: "Pause at yield", body: "Calling a generator function returns a generator without running its body; each next call resumes until the next yield." },
      { title: "Compose lazily", body: "Generator expressions and yield from connect stages without materializing intermediate collections." },
      { title: "Manage lifetime", body: "Resources opened inside generators may remain active while iteration is paused, so context boundaries and explicit closure matter." },
    ],
    [
      { question: "When does a generator function body begin running?", options: ["When iteration requests the first value", "At function definition", "Immediately when called in all cases", "After converting to text"], answer: 0, explanation: "The call creates the generator; next begins execution." },
      { question: "What does yield do?", options: ["Produces a value and preserves execution state", "Ends the process", "Creates a list", "Raises StopIteration immediately"], answer: 0, explanation: "Execution pauses with local state retained for resumption." },
      { question: "What does yield from another_iterable do?", options: ["Delegates successive values from that iterable", "Copies its module", "Sorts it", "Consumes only one value"], answer: 0, explanation: "yield from forwards the sub-iterator's values and completion behavior." },
      { question: "What is a generator tradeoff?", options: ["Low peak memory but single-pass deferred behavior", "Guaranteed random access", "No possible exceptions", "Automatic caching"], answer: 0, explanation: "Laziness delays computation and usually sacrifices indexing and replay." },
    ],
  ),

  "sql:intermediate:Advanced JOINs": lesson(
    "Advanced joins express predecessor links, missing relationships, per-row lookups, and other shapes that basic inner joins cannot capture cleanly. Cardinality must remain predictable at each junction.",
    [
      { title: "Join a table to itself", body: "A self-join uses distinct aliases to connect rows such as a relay and its predecessor while preserving the relationship direction." },
      { title: "Use anti- and semi-join intent", body: "EXISTS selects rows with a match; NOT EXISTS selects rows without one and avoids NOT IN's NULL surprises." },
      { title: "Reach for LATERAL when dependent", body: "A lateral subquery can use columns from each left row, enabling top-N-per-parent and dependent calculations." },
    ],
    [
      { question: "Why alias both sides of a self-join?", options: ["To distinguish the two logical row roles", "To create two tables", "To remove keys", "To force a cross join"], answer: 0, explanation: "Aliases clarify which instance represents the relay and which the predecessor." },
      { question: "Which pattern finds relays with no alerts?", options: ["WHERE NOT EXISTS (matching alert subquery)", "INNER JOIN alerts", "CROSS JOIN alerts", "WHERE alert_id = NULL"], answer: 0, explanation: "NOT EXISTS expresses the anti-join without NULL ambiguity." },
      { question: "What enables a LATERAL right-side query?", options: ["Referencing columns from the current left row", "Ignoring the left table", "Creating a permanent view", "Bypassing filters"], answer: 0, explanation: "LATERAL makes dependent per-row subqueries legal." },
      { question: "What predicts join row multiplication?", options: ["The uniqueness and match counts of join keys", "Selected colors", "Alias length", "ORDER BY alone"], answer: 0, explanation: "Each combination of matching rows appears in the result." },
    ],
  ),
  "sql:intermediate:Advanced subqueries": lesson(
    "Advanced subqueries express dependent existence, comparisons against sets, and nested calculations. Their NULL semantics and relationship to the outer row are central to correctness.",
    [
      { title: "Correlate on the real key", body: "A correlated subquery references the outer row through the intended relationship and returns a boolean or aggregate meaningful for that row." },
      { title: "Choose set comparisons", body: "ANY asks whether a comparison succeeds for at least one value, ALL requires every value, and EXISTS cares only about row presence." },
      { title: "Avoid NULL traps", body: "NOT IN can become UNKNOWN when the set contains NULL; NOT EXISTS is usually the clearer anti-match expression." },
    ],
    [
      { question: "What makes an advanced subquery correlated?", options: ["It references an outer-query value", "It uses two SELECTs", "It has an alias", "It returns a number"], answer: 0, explanation: "The inner evaluation depends on the current outer candidate." },
      { question: "What does > ALL(subquery) mean?", options: ["Greater than every returned non-NULL comparison value", "Greater than one arbitrary row", "Equal to the maximum always under NULLs", "The same as IN"], answer: 0, explanation: "ALL requires the comparison to hold across the set, with SQL's three-valued logic." },
      { question: "Why prefer NOT EXISTS for anti-matches?", options: ["It has clear row-existence semantics despite NULL values", "It always sorts faster", "It returns columns", "It creates indexes"], answer: 0, explanation: "A NULL in a NOT IN set can prevent true results." },
      { question: "Can an optimizer transform a correlated subquery?", options: ["Often, but meaning and NULL semantics still need correct SQL", "Never", "Only if it has LIMIT", "Only in views"], answer: 0, explanation: "Optimization does not excuse an incorrect logical expression." },
    ],
  ),
  "sql:intermediate:CTEs": lesson(
    "CTEs name intermediate relations so multi-stage transformations can be reasoned about and tested. They are statement-scoped structure, not automatically faster temporary tables.",
    [
      { title: "Name a meaningful stage", body: "A CTE should express a domain step such as active_relays or sector_health, keeping filters and grain explicit." },
      { title: "Compose stages", body: "Later CTEs can consume earlier ones, enabling readable pipelines without persisting intermediate data." },
      { title: "Understand planner behavior", body: "Modern PostgreSQL may inline eligible CTEs; MATERIALIZED and NOT MATERIALIZED can influence reuse and optimization boundaries." },
    ],
    [
      { question: "How long does a CTE exist?", options: ["For the statement that defines it", "Permanently", "Until server restart", "For the transaction as a table"], answer: 0, explanation: "WITH names are scoped to one SQL statement." },
      { question: "Does WITH always materialize the result?", options: ["No; eligible CTEs may be inlined", "Yes, always", "Only recursive CTEs never do", "Only SELECT cannot"], answer: 0, explanation: "Planner behavior depends on database version, references, and modifiers." },
      { question: "What makes a CTE valuable?", options: ["A clear named transformation stage", "Guaranteed index creation", "Permanent storage", "Removal of all subqueries"], answer: 0, explanation: "CTEs primarily improve composition and reasoning." },
      { question: "When can MATERIALIZED help?", options: ["When an expensive stage should be evaluated once and reused", "For every filter", "To create a schema", "To bypass locks"], answer: 0, explanation: "It may prevent repeated work but can also block useful predicate pushdown." },
    ],
  ),
  "sql:intermediate:Recursive CTEs": lesson(
    "Recursive CTEs traverse hierarchies and graphs in SQL. Safe traversal requires a clear anchor, progress through relationships, depth or path visibility, and explicit cycle protection.",
    [
      { title: "Seed with the anchor", body: "The non-recursive term selects starting rows and establishes the output column types." },
      { title: "Expand one layer", body: "The recursive term joins base data to rows found in the previous iteration and adds depth or path state." },
      { title: "Prevent cycles", body: "Track visited identifiers in a path, reject repeats, and optionally cap depth so malformed graphs cannot recurse indefinitely." },
    ],
    [
      { question: "What does the anchor term do?", options: ["Seeds initial rows for traversal", "Ends every recursion", "Creates an index", "Deletes cycles"], answer: 0, explanation: "Recursion begins from the anchor output." },
      { question: "What connects recursive iterations?", options: ["The recursive term references the CTE's prior output", "A permanent table copy", "ORDER BY", "A trigger"], answer: 0, explanation: "Each iteration expands from rows accumulated by the working relation." },
      { question: "Why carry a path array?", options: ["To detect repeated nodes and explain the route", "To change key types", "To improve display only", "To eliminate anchors"], answer: 0, explanation: "Visited identity tracking provides cycle protection and provenance." },
      { question: "Why use UNION ALL commonly?", options: ["It avoids unnecessary global deduplication when cycles are handled explicitly", "UNION cannot recurse", "It sorts every level", "It creates a view"], answer: 0, explanation: "UNION ALL preserves rows efficiently, while path logic controls repeated traversal." },
    ],
  ),

  "genai:intermediate:Hybrid search": lesson(
    "Hybrid search combines lexical precision for exact terms with semantic recall for paraphrases. Reliable fusion requires ranked-list methods and evaluation by query type rather than adding incomparable raw scores.",
    [
      { title: "Use complementary retrievers", body: "BM25-style lexical search captures identifiers and rare terms; embedding search captures conceptual similarity and vocabulary mismatch." },
      { title: "Fuse rankings safely", body: "Reciprocal rank fusion combines rank positions without assuming score scales are calibrated; weighted methods require explicit normalization." },
      { title: "Evaluate query slices", body: "Measure exact-identifier, natural-language, multilingual, and ambiguous queries separately because the best fusion balance differs." },
    ],
    [
      { question: "Where does lexical search often excel?", options: ["Exact identifiers and rare phrases", "Every paraphrase", "Image understanding", "Tool authorization"], answer: 0, explanation: "Token-level matching preserves exact vocabulary signals." },
      { question: "Why not directly add BM25 and cosine scores?", options: ["Their scales and meanings are not inherently comparable", "Cosine has no numbers", "BM25 is always zero", "Fusion forbids weights"], answer: 0, explanation: "Uncalibrated score addition creates unstable dominance." },
      { question: "What does reciprocal rank fusion use?", options: ["Each candidate's rank position", "Raw embedding dimensions", "Prompt temperature", "Document timestamps only"], answer: 0, explanation: "RRF rewards high ranks across lists using a simple reciprocal formula." },
      { question: "Why evaluate query categories separately?", options: ["Retriever strengths vary by intent and vocabulary", "Metrics cannot aggregate", "Every category uses another database", "It removes labels"], answer: 0, explanation: "Slices expose where fusion improves or harms retrieval." },
    ],
  ),
  "genai:intermediate:Reranking": lesson(
    "Reranking applies a more expensive relevance model to a bounded candidate set, improving precision after a fast high-recall search. Candidate depth and latency budgets determine its ceiling.",
    [
      { title: "Separate retrieval stages", body: "The first stage retrieves enough plausible candidates quickly; the reranker jointly evaluates query-document relevance in greater detail." },
      { title: "Tune candidate depth", body: "Too few candidates cap recall, while too many increase latency and cost without proportional precision gains." },
      { title: "Measure end-to-end value", body: "Track ranking metrics, grounded answer quality, latency percentiles, timeouts, and fallback behavior." },
    ],
    [
      { question: "Can reranking recover a missing candidate?", options: ["No", "Yes, from model memory", "Only with temperature", "Always"], answer: 0, explanation: "A second-stage model can only reorder candidates it receives." },
      { question: "Why are cross-encoders often stronger rerankers?", options: ["They model query-document interactions jointly", "They require no text", "They create database indexes", "They always run faster"], answer: 0, explanation: "Joint attention captures fine-grained relevance signals unavailable to independent embeddings." },
      { question: "What does candidate depth trade off?", options: ["Recall opportunity against latency and cost", "Schema against auth", "Tokens against file encoding", "Only storage"], answer: 0, explanation: "More candidates can include relevant evidence but require more scoring work." },
      { question: "What should happen if reranking times out?", options: ["Use a measured first-stage fallback or controlled failure", "Return random order", "Expose credentials", "Delete the index"], answer: 0, explanation: "Production design needs explicit degradation behavior." },
    ],
  ),
  "genai:intermediate:Advanced RAG": lesson(
    "Advanced RAG adapts retrieval to complex questions through routing, decomposition, iterative search, and context compression. Each added stage must earn its operational complexity through evaluation.",
    [
      { title: "Route by question needs", body: "Some questions need direct lookup, others need SQL, keyword search, multi-hop retrieval, or no retrieval; routing should be measurable and reversible." },
      { title: "Decompose multi-hop work", body: "Break questions into evidence needs, retrieve each step, preserve dependencies, and synthesize only after required facts are supported." },
      { title: "Control the loop", body: "Bound iterations, token cost, tools, and stopping conditions while tracing evidence and failure at every step." },
    ],
    [
      { question: "When is query decomposition useful?", options: ["When an answer requires multiple linked evidence steps", "For every one-word lookup", "To remove citations", "To bypass permissions"], answer: 0, explanation: "Multi-hop questions can be solved through explicit sub-questions and evidence dependencies." },
      { question: "Why begin with a simple RAG baseline?", options: ["It shows whether advanced stages create measurable improvement", "Advanced RAG cannot retrieve", "It removes evaluation", "It guarantees production"], answer: 0, explanation: "Without a baseline, added complexity has no demonstrated value." },
      { question: "What must an iterative retrieval loop include?", options: ["Budgets and stopping conditions", "Unlimited retries", "Hidden tools", "No trace"], answer: 0, explanation: "Bounds protect latency, cost, and reliability." },
      { question: "What is context compression meant to preserve?", options: ["Question-relevant supported evidence", "Every source token", "Only model opinions", "Prompt injection"], answer: 0, explanation: "Compression reduces irrelevant context without deleting necessary support or provenance." },
    ],
  ),
  "genai:intermediate:RAG evaluation": lesson(
    "RAG evaluation separates retrieval, context, generation, and citation quality so teams can locate failures instead of hiding them in one score. Automated judges need calibration against human decisions.",
    [
      { title: "Build representative cases", body: "Include frequent, rare, ambiguous, adversarial, permission-sensitive, unanswerable, and multi-hop questions with evidence expectations." },
      { title: "Measure each stage", body: "Use recall@k and ranking metrics for search, context relevance for assembly, and correctness, faithfulness, citation support, and abstention for answers." },
      { title: "Calibrate evaluation", body: "Compare synthetic judges with expert labels, track disagreement, version prompts and datasets, and use regression thresholds before release." },
    ],
    [
      { question: "What does retrieval recall@k ask?", options: ["Whether needed evidence appears in the top k", "Whether prose is fluent", "Whether latency is zero", "Whether citations are formatted"], answer: 0, explanation: "Recall measures evidence coverage in the candidate set." },
      { question: "What does faithfulness measure?", options: ["Whether answer claims are supported by supplied evidence", "Whether the source is popular", "Whether every answer is long", "Whether embeddings are normalized"], answer: 0, explanation: "Faithfulness detects unsupported use or invention beyond the context." },
      { question: "Why include unanswerable cases?", options: ["To evaluate abstention and evidence-gap behavior", "To inflate accuracy", "To remove retrieval", "To train production automatically"], answer: 0, explanation: "A safe system must decline when evidence cannot support an answer." },
      { question: "Why calibrate an LLM judge?", options: ["Judge outputs can be biased or inconsistent with human criteria", "Judges need no rubric", "Humans are always wrong", "It eliminates datasets"], answer: 0, explanation: "Agreement studies reveal reliability and systematic scoring errors." },
    ],
  ),
  "genai:intermediate:Production prompting": lesson(
    "Production prompts are versioned interfaces with trusted instructions, untrusted inputs, schemas, evaluation, ownership, and rollback. Treating them as deployed code makes changes safer and observable.",
    [
      { title: "Define authority boundaries", body: "Separate system policy, developer workflow, user requests, and retrieved evidence so untrusted content cannot silently become instruction." },
      { title: "Version the contract", body: "Record prompt template, model, tools, schema, decoding settings, and evaluation set as one releaseable behavior configuration." },
      { title: "Release with evidence", body: "Run regression and adversarial suites, compare against the current version, canary traffic, monitor failures, and retain a rollback path." },
    ],
    [
      { question: "Why version prompts?", options: ["Small text changes can materially alter system behavior", "Prompts never change", "Versioning reduces token count", "It replaces monitoring"], answer: 0, explanation: "History, evaluation, and rollback require stable prompt identities." },
      { question: "How should retrieved content be treated?", options: ["As untrusted evidence, clearly separated from instructions", "As system policy", "As authorized tool calls", "As secret configuration"], answer: 0, explanation: "Documents may contain conflicting or malicious instruction-like text." },
      { question: "What belongs in a prompt release configuration?", options: ["Template, model, tools, schema, parameters, and eval results", "Template text only", "User passwords", "One successful screenshot"], answer: 0, explanation: "Behavior depends on the complete inference contract." },
      { question: "What is a safe prompt rollout?", options: ["Evaluated, observable, gradual, and reversible", "Direct untracked production editing", "No regression set", "Unlimited canary traffic"], answer: 0, explanation: "Controlled rollout limits blast radius and provides evidence for promotion or rollback." },
    ],
  ),
};

export function getRoundSixLessonEnrichment(track: LearningTrackId, pace: string, topic: string) {
  return ROUND_SIX_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
