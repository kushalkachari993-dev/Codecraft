import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_TEN_LESSONS: Record<string, LessonEnrichment> = {
  "python:intermediate:DSA": lesson(
    "Data structures are decisions about access patterns, not containers chosen by habit. The right structure makes an invariant obvious and an operation cheap; the wrong one hides complexity until production scale exposes it.",
    [
      { title: "Start from operations", body: "List required reads, inserts, removals, ordering, and membership checks before choosing list, deque, heap, set, or dictionary." },
      { title: "Protect an invariant", body: "A stack removes the newest item, a queue removes the oldest, and a heap exposes an extreme value; keep that promise after every mutation." },
      { title: "Include real costs", body: "Reason about time, memory, copying, cache locality, and worst-case behavior rather than relying on a single Big-O label." },
    ],
    [
      { question: "Which structure gives efficient removal from both ends?", options: ["collections.deque", "A list from index zero", "A tuple", "A frozen set"], answer: 0, explanation: "A deque is designed for amortized constant-time appends and pops at either end." },
      { question: "What should determine a data-structure choice first?", options: ["The operations and invariants the program needs", "The shortest type name", "Alphabetical order", "The largest possible container"], answer: 0, explanation: "Access patterns and correctness constraints define which tradeoffs matter." },
      { question: "Why can a set speed up duplicate detection?", options: ["Membership is usually amortized O(1)", "It sorts every value", "It never uses memory", "It accepts only integers"], answer: 0, explanation: "Hash-based lookup usually avoids scanning every previously seen value." },
      { question: "What does an invariant describe?", options: ["A property that remains true after every valid operation", "A temporary debug message", "A package version", "A random test input"], answer: 0, explanation: "Invariants let operations be implemented and tested against a stable contract." },
    ],
  ),
  "python:intermediate:Trees/Graphs": lesson(
    "Trees and graphs model relationships: hierarchies, dependencies, routes, and state transitions. Correct traversal requires an explicit frontier, a visited policy, and a representation suited to sparse or dense connections.",
    [
      { title: "Represent the edges", body: "Adjacency dictionaries are natural for sparse graphs; matrices offer direct edge lookup but consume space proportional to every possible pair." },
      { title: "Choose the frontier", body: "A queue produces breadth-first layers and shortest unweighted paths, while a stack or recursion produces depth-first exploration." },
      { title: "Reconstruct safely", body: "Record each discovered node's parent, mark nodes when enqueued, and walk parents backward only after the target is reached." },
    ],
    [
      { question: "Which traversal finds a shortest path in an unweighted graph?", options: ["Breadth-first search", "Depth-first search always", "In-order traversal", "Hash sorting"], answer: 0, explanation: "BFS explores nodes in nondecreasing edge distance from the start." },
      { question: "Why keep a visited set in a general graph?", options: ["To prevent cycles and repeated work", "To make edges directed", "To balance a tree", "To allocate every possible edge"], answer: 0, explanation: "Graphs may cycle or converge on one node through many paths." },
      { question: "When should BFS usually mark a node visited?", options: ["When it is enqueued", "Only after all traversal ends", "Every time it is dequeued", "Before reading the graph"], answer: 0, explanation: "Marking on discovery prevents the same node entering the frontier multiple times." },
      { question: "What does an adjacency list optimize for?", options: ["Sparse graphs", "Only complete graphs", "No-edge graphs only", "Numeric node names"], answer: 0, explanation: "It stores existing neighbors rather than space for all possible pairs." },
    ],
  ),
  "python:intermediate:Algorithms": lesson(
    "An algorithm is a precise method whose correctness and resource use can be explained independently of one successful example. Production choices balance input shape, stability, mutation, failure behavior, and measured complexity.",
    [
      { title: "State preconditions", body: "Say whether input must be sorted, unique, nonnegative, connected, or bounded; reject or document values outside that contract." },
      { title: "Prove progress", body: "Identify a loop invariant and a quantity that moves toward termination, then reason about the empty and smallest inputs." },
      { title: "Measure the whole result", body: "Account for runtime, auxiliary space, output size, recursion depth, stability, and whether the caller's data is mutated." },
    ],
    [
      { question: "What makes binary search valid?", options: ["A sorted search space and a shrinking interval", "A set input", "Recursion only", "Random pivots"], answer: 0, explanation: "Ordering lets each comparison safely discard half of the remaining interval." },
      { question: "What is a stable sort?", options: ["Equal keys keep their original relative order", "It never allocates memory", "It is always O(1)", "It works only on numbers"], answer: 0, explanation: "Stability preserves meaningful prior ordering among equal comparison keys." },
      { question: "Why test an algorithm with empty input?", options: ["Boundary inputs expose initialization and termination mistakes", "It proves every complexity bound", "It disables mutation", "It creates a benchmark"], answer: 0, explanation: "Empty collections often reveal assumptions about a first element or loop execution." },
      { question: "What should accompany a complexity claim?", options: ["The operation, input measure, and case being described", "Only the letter O", "A screenshot", "A package import"], answer: 0, explanation: "O(n) is meaningful only when the measured resource and input size are clear." },
    ],
  ),
  "python:intermediate:Memory concepts": lesson(
    "Python variables reference objects rather than containing independent copies. Aliasing, mutability, object lifetime, eager materialization, and shallow versus deep copying determine whether data stays isolated and whether memory remains bounded.",
    [
      { title: "Separate identity from equality", body: "Two references can point to one object even when two other objects compare equal; use is for identity and == for value semantics." },
      { title: "Copy at the right boundary", body: "A shallow copy separates the outer container but shares nested objects; make immutable snapshots or copy deeper only when ownership requires it." },
      { title: "Keep work lazy when possible", body: "Iterators stream one value at a time, while list conversion retains every result; choose deliberately based on reuse and memory limits." },
    ],
    [
      { question: "What does a shallow list copy duplicate?", options: ["The outer list, while nested object references remain shared", "Every nested object recursively", "Nothing", "Only immutable elements"], answer: 0, explanation: "Shallow copying creates a new container but reuses its element references." },
      { question: "What should is compare?", options: ["Object identity", "Numeric magnitude", "Sorted order", "String contents generally"], answer: 0, explanation: "Identity asks whether both references point to the exact same object." },
      { question: "Why use a generator for a large stream?", options: ["It can avoid retaining all produced values", "It guarantees parallelism", "It deep-copies values", "It disables exceptions"], answer: 0, explanation: "Lazy iteration can keep memory proportional to the active item rather than total output." },
      { question: "Which value is a useful immutable snapshot?", options: ["A tuple built from the current items", "The original mutable list", "A global alias", "A list view that is later edited"], answer: 0, explanation: "A tuple prevents changes to the snapshot's outer sequence." },
    ],
  ),
  "python:intermediate:Hashing": lesson(
    "Hashing powers dictionaries and sets by mapping stable keys into buckets. Correctness depends on the equality/hash contract; performance depends on distribution, resizing, and collision handling rather than an absolute constant-time guarantee.",
    [
      { title: "Honor the key contract", body: "Objects that compare equal must produce equal hashes, and fields participating in hashing must not change while the object is a key." },
      { title: "Expect collisions", body: "Different keys may share a hash; the table resolves collisions and confirms equality, so a hash is never a unique identifier." },
      { title: "Design deterministic output", body: "Use hashing for membership or grouping, then sort or retain explicit insertion order when an external result needs a stable order." },
    ],
    [
      { question: "What must be true when a == b?", options: ["hash(a) == hash(b)", "a and b are the same object", "Both are strings", "Their hashes are unique"], answer: 0, explanation: "Equal keys must address the same logical lookup path." },
      { question: "Why are mutable lists not dictionary keys?", options: ["Their contents and equality can change", "They are always empty", "They cannot contain numbers", "Dictionaries reject sequences"], answer: 0, explanation: "Changing a hashed key would make its stored bucket inconsistent with lookup." },
      { question: "Does a shared hash prove two keys are equal?", options: ["No, collisions are expected", "Yes, always", "Only for sets", "Only after resizing"], answer: 0, explanation: "Hash tables use equality checks to distinguish colliding keys." },
      { question: "What is typical dictionary lookup complexity?", options: ["Amortized O(1)", "Guaranteed O(1) under every attack", "Always O(n log n)", "Always O(n²)"], answer: 0, explanation: "Good distribution and resizing make normal lookup constant on average, not unconditionally." },
    ],
  ),
  "sql:intermediate:Triggers": lesson(
    "Triggers enforce or record behavior close to data, even when multiple applications write it. That reach is powerful but implicit, so trigger timing, row versus statement scope, recursion, transaction behavior, and observability must be deliberate.",
    [
      { title: "Choose timing and scope", body: "BEFORE row triggers can validate or alter NEW, AFTER row triggers observe the final row, and statement triggers run once regardless of affected row count." },
      { title: "Use OLD and NEW precisely", body: "Compare only relevant columns and add a WHEN condition so unchanged updates do not create misleading audit events." },
      { title: "Keep effects bounded", body: "Avoid remote calls and deep trigger chains; document ownership, test bulk operations, and ensure failures roll back with the parent transaction." },
    ],
    [
      { question: "Which trigger is natural for auditing a completed row update?", options: ["AFTER UPDATE FOR EACH ROW", "BEFORE SELECT", "AFTER SELECT", "A client-side timer"], answer: 0, explanation: "An AFTER row trigger can record the final values in the same transaction." },
      { question: "What do OLD and NEW represent during UPDATE?", options: ["The previous and proposed row values", "Two schemas", "Two transactions", "Index pages"], answer: 0, explanation: "They expose the transition the trigger is evaluating." },
      { question: "Why add a trigger WHEN condition?", options: ["To avoid work when relevant values did not change", "To commit early", "To create a new connection", "To disable constraints"], answer: 0, explanation: "Filtering at trigger invocation reduces noise and unnecessary execution." },
      { question: "What happens if a trigger raises an error?", options: ["The surrounding statement or transaction can roll back", "The trigger commits independently", "The error is always ignored", "Only the audit row rolls back"], answer: 0, explanation: "Triggers run inside the transaction that caused them unless an external mechanism is involved." },
    ],
  ),
  "sql:intermediate:JSON/JSONB": lesson(
    "JSONB adds flexible nested attributes without abandoning relational keys, constraints, and transactions. Good designs keep frequently joined or constrained facts typed, validate document shape, and index only the paths real queries use.",
    [
      { title: "Choose the boundary", body: "Use columns for stable identity, relationships, and heavily queried facts; use JSONB for variable payload details with a documented schema." },
      { title: "Use operators intentionally", body: "-> returns JSON, ->> returns text, @> tests containment, and jsonb_set creates an updated document rather than mutating it in place." },
      { title: "Index measured access", body: "A GIN index helps containment, while expression indexes target one extracted path; both add storage and write cost." },
    ],
    [
      { question: "Which operator extracts a JSON field as text?", options: ["->>", "->", "@>", "#="], answer: 0, explanation: "The double-arrow text operator is convenient for comparison and display." },
      { question: "What does JSONB containment use?", options: ["@>", "LIKE only", "UNION", "VACUUM"], answer: 0, explanation: "The left JSONB value contains the right JSONB shape when @> is true." },
      { question: "Which data usually belongs in a typed column?", options: ["A frequently joined and constrained customer_id", "Rare provider metadata", "A variable debug payload", "An optional experimental flag bundle"], answer: 0, explanation: "Stable relational facts benefit from types, references, and targeted statistics." },
      { question: "What is a cost of a JSONB index?", options: ["Additional storage and write maintenance", "JSON becomes invalid", "Transactions stop working", "Primary keys disappear"], answer: 0, explanation: "Indexes improve selected reads by adding persistent structures that writes must update." },
    ],
  ),
  "sql:intermediate:Application DB access": lesson(
    "The application/database boundary controls untrusted values, finite connections, transaction ownership, cancellation, retries, and result mapping. Reliability comes from making those policies explicit rather than scattering raw queries through handlers.",
    [
      { title: "Bind every value", body: "Driver parameters preserve types and keep data out of executable SQL; identifiers require an allowlist or safe composition API rather than value placeholders." },
      { title: "Bound resources", body: "Use a sized connection pool, short checkout lifetime, statement and transaction timeouts, cancellation propagation, and health metrics." },
      { title: "Own one unit of work", body: "Begin, commit, or roll back at a clear application boundary, translate known database errors, and retry only safe complete transactions." },
    ],
    [
      { question: "How should a user value enter a query?", options: ["Through a driver parameter", "Through string concatenation", "Through an f-string", "Through a comment"], answer: 0, explanation: "Binding separates values from the SQL program and preserves type handling." },
      { question: "Can a value placeholder safely choose a table name?", options: ["No; identifiers need allowlisted composition", "Yes, in every driver", "Only inside SELECT", "Only for public tables"], answer: 0, explanation: "Placeholders bind values, not SQL grammar such as table or column identifiers." },
      { question: "Why bound a connection pool?", options: ["Database connections are finite resources", "It encrypts columns", "It replaces transactions", "It sorts results"], answer: 0, explanation: "Unbounded connection creation can overload the database and application." },
      { question: "What should happen after an exception in a transaction?", options: ["Roll back before releasing or reusing it", "Commit partial work", "Keep it open forever", "Retry one statement blindly"], answer: 0, explanation: "Rollback restores a known transaction state before the connection returns to the pool." },
    ],
  ),
  "sql:intermediate:ORM": lesson(
    "An ORM can centralize mapping and unit-of-work behavior, but every convenient relationship access still becomes SQL. Teams must inspect query count, loading strategy, transaction scope, migrations, constraints, and concurrency semantics.",
    [
      { title: "Read the generated SQL", body: "Log or profile queries in development, verify projections and predicates, and use EXPLAIN for important paths rather than guessing from object code." },
      { title: "Control relationship loading", body: "Lazy loading can cause N+1 queries; joined or select-in loading reduces round trips but may duplicate rows or fetch too much." },
      { title: "Keep durable rules in the database", body: "Use versioned migrations, foreign keys, unique constraints, and transaction isolation because not every writer passes through one ORM process." },
    ],
    [
      { question: "What is an N+1 query pattern?", options: ["One parent query plus one relationship query per parent", "One transaction with two statements", "A composite index", "A failed migration"], answer: 0, explanation: "Implicit lazy loads multiply database round trips with result size." },
      { question: "What should define production schema history?", options: ["Reviewed versioned migrations", "Runtime model imports only", "Browser cache", "Generated HTML"], answer: 0, explanation: "Migrations make schema transitions auditable and repeatable." },
      { question: "Does an ORM replace foreign-key constraints?", options: ["No", "Yes", "Only for writes", "Only with one service"], answer: 0, explanation: "The database must protect integrity across concurrent and alternate writers." },
      { question: "Why project only needed columns?", options: ["To reduce transfer and stabilize the mapping contract", "To disable the optimizer", "To force a table scan", "To avoid parameters"], answer: 0, explanation: "Narrow queries reduce work and avoid exposing or coupling to unrelated fields." },
    ],
  ),
  "genai:expert:Transformer internals": lesson(
    "Transformer expertise means tracing tensor shapes and information flow through embeddings, masked attention, residual streams, normalization, and feed-forward blocks. This is essential for debugging quality, memory, latency, and cache behavior instead of treating the model as one opaque call.",
    [
      { title: "Trace one block", body: "Follow token representations through Q/K/V projections, scaled dot-product attention, masking, output projection, residual addition, normalization, and the MLP." },
      { title: "Account for position and masking", body: "Position information distinguishes order, while causal and padding masks define which key positions each query may attend to." },
      { title: "Reason about inference state", body: "A KV cache reuses prior keys and values during decoding, reducing repeated computation while growing memory with sequence length, layers, heads, and precision." },
    ],
    [
      { question: "Why divide attention logits by the square root of head dimension?", options: ["To keep softmax inputs at a manageable scale", "To add positional order", "To remove masking", "To quantize weights"], answer: 0, explanation: "Scaling prevents dot products from growing so large that softmax becomes overly saturated." },
      { question: "What does a causal mask prevent?", options: ["A token attending to future tokens", "A token attending to itself", "All cross-token interaction", "Embedding lookup"], answer: 0, explanation: "Autoregressive training and decoding must not reveal later sequence positions." },
      { question: "What does the KV cache store?", options: ["Prior attention keys and values", "Only generated text", "Training gradients", "Optimizer states"], answer: 0, explanation: "Cached K/V tensors avoid recomputing the prefix at every decoding step." },
      { question: "Why are residual connections important?", options: ["They preserve and update an information stream across layers", "They tokenize text", "They choose the loss", "They shard a database"], answer: 0, explanation: "Each sublayer contributes a change while the main representation retains a direct path." },
    ],
  ),
  "genai:expert:LLM training": lesson(
    "LLM training is a coupled data, systems, and evaluation pipeline. Dataset mixture, deduplication, tokenization, packing, objective, optimizer state, distributed communication, checkpoints, and contamination controls jointly determine what a loss curve actually means.",
    [
      { title: "Build governed data", body: "Record provenance and licensing, filter sensitive or low-quality material, deduplicate across splits, and freeze evaluation sets before training decisions." },
      { title: "Budget the computation", body: "Sequence length, token count, parameter count, precision, activation memory, optimizer state, and parallelism define cost and failure modes." },
      { title: "Evaluate beyond loss", body: "Track held-out loss plus capability, safety, memorization, bias, contamination, and regression suites at reproducible checkpoints." },
    ],
    [
      { question: "Why deduplicate across training and evaluation data?", options: ["To reduce contamination and misleading scores", "To increase sequence length", "To disable tokenization", "To remove checkpoints"], answer: 0, explanation: "Memorized evaluation examples make measured generalization unreliable." },
      { question: "What does sequence packing improve?", options: ["Utilization by reducing padding waste", "Label quality automatically", "Model licensing", "Network authorization"], answer: 0, explanation: "Packing combines shorter examples into fixed-length training sequences more efficiently." },
      { question: "Why save optimizer state in a training checkpoint?", options: ["To resume the optimization trajectory", "To serve tokens faster", "To create prompts", "To build an index"], answer: 0, explanation: "Weights alone do not include momentum and other state needed for faithful continuation." },
      { question: "What should complement validation loss?", options: ["Capability, safety, contamination, and regression evaluations", "Only training throughput", "Only parameter count", "Only one anecdotal prompt"], answer: 0, explanation: "A scalar objective cannot capture every desired or harmful behavior." },
    ],
  ),
  "genai:expert:Fine-tuning": lesson(
    "Fine-tuning changes model behavior through curated examples and therefore deserves a decision gate, clean data splits, a baseline, safety evaluation, versioned artifacts, and rollback. It is not a substitute for fresh knowledge retrieval or deterministic business rules.",
    [
      { title: "Choose the right lever", body: "Use prompting for instructions, RAG for changing facts, tools for actions, and fine-tuning for repeatable learned behavior that examples can demonstrate." },
      { title: "Design the dataset", body: "Specify the target behavior, remove conflicting labels and leakage, preserve hard negatives, and split by entity or time when random rows would leak context." },
      { title: "Gate the release", body: "Compare with the base model on quality and safety slices, test catastrophic regressions, record lineage, canary traffic, and retain immediate rollback." },
    ],
    [
      { question: "Which problem is usually better suited to RAG than fine-tuning?", options: ["Frequently changing private facts", "A stable response format", "A learned writing convention", "Repeated classification style"], answer: 0, explanation: "Retrieval can update knowledge without retraining model weights." },
      { question: "Why establish a base-model baseline first?", options: ["To measure whether fine-tuning actually improves the target", "To delete the test set", "To guarantee lower cost", "To avoid versioning"], answer: 0, explanation: "Without a comparable baseline, gains and regressions cannot be attributed." },
      { question: "What should remain separate from training data?", options: ["A representative final evaluation set", "All useful examples", "The tokenizer", "The model card"], answer: 0, explanation: "A held-out set provides a less biased estimate of release behavior." },
      { question: "What enables safe rollback?", options: ["Versioned model, adapter, data, config, and evaluation artifacts", "Overwriting the previous model", "One prompt screenshot", "Removing observability"], answer: 0, explanation: "Lineage and immutable releases make the prior known-good state recoverable." },
    ],
  ),
  "genai:expert:LoRA/QLoRA/PEFT": lesson(
    "Parameter-efficient fine-tuning adapts a frozen base model with small trainable components. LoRA's rank and target modules control capacity; QLoRA also quantizes the frozen base during training, reducing memory while introducing precision and deployment tradeoffs.",
    [
      { title: "Locate the adaptation", body: "Choose target projection modules intentionally, set rank and scaling from measured capacity needs, and keep the base model identifier immutable." },
      { title: "Separate training precision", body: "QLoRA stores frozen base weights at low precision while computing and optimizing adapters at suitable precision; calibration and hardware support still matter." },
      { title: "Manage adapter lifecycle", body: "Version adapters with tokenizer and base model, evaluate each independently, and test both merged and unmerged serving paths before promotion." },
    ],
    [
      { question: "What does LoRA usually train?", options: ["Small low-rank updates while base weights remain frozen", "Every base parameter", "Only the tokenizer vocabulary", "The retrieval index"], answer: 0, explanation: "Low-rank adapter matrices provide a compact learned update to selected layers." },
      { question: "What does LoRA rank control?", options: ["The capacity and parameter count of the update", "Context-window length", "Number of training files", "API rate limit"], answer: 0, explanation: "Higher rank can express a richer update but uses more memory and compute." },
      { question: "What distinguishes QLoRA?", options: ["A quantized frozen base with trainable adapters", "No trainable parameters", "A larger tokenizer only", "Retrieval during every gradient step"], answer: 0, explanation: "QLoRA reduces base-weight memory while retaining higher-precision adapter optimization." },
      { question: "Why record the exact base-model revision with an adapter?", options: ["Adapters depend on compatible underlying weights", "It changes SQL isolation", "It removes evaluation", "It creates authorization"], answer: 0, explanation: "Applying an adapter to a different base can produce invalid or degraded behavior." },
    ],
  ),
  "genai:expert:Quantization": lesson(
    "Quantization trades numeric precision for smaller model memory, lower bandwidth, and sometimes faster inference. A useful choice depends on model components, calibration data, hardware kernels, task-level quality, context length, and measured end-to-end latency—not bits alone.",
    [
      { title: "Choose what to quantize", body: "Weights, activations, and KV cache have different sensitivity and runtime effects; select per-channel or group-wise schemes based on kernel support." },
      { title: "Calibrate representatively", body: "Post-training quantization uses calibration examples to choose scales and clipping; unrepresentative samples can hide large errors on rare inputs." },
      { title: "Benchmark the serving path", body: "Compare quality slices, memory, prefill and decode latency, throughput, power, and operational compatibility on the actual target hardware." },
    ],
    [
      { question: "What is the main purpose of quantization?", options: ["Represent values with fewer bits to reduce resource use", "Increase parameter count", "Replace evaluation", "Add retrieval"], answer: 0, explanation: "Lower-precision representations reduce model footprint and memory traffic." },
      { question: "Why does calibration data matter for post-training quantization?", options: ["It helps choose ranges and scales that preserve representative behavior", "It trains a new tokenizer", "It grants tool permissions", "It creates checkpoints"], answer: 0, explanation: "Observed activation distributions guide how real values map into limited numeric levels." },
      { question: "Does a smaller model file guarantee lower latency?", options: ["No; kernel and hardware support determine realized speed", "Yes, always", "Only for SQL", "Only without batching"], answer: 0, explanation: "Unsupported conversions or dequantization overhead can erase theoretical gains." },
      { question: "What must a quantized release be compared against?", options: ["The original model on representative quality and system metrics", "Only another file size", "One successful prompt", "Training loss from a different dataset"], answer: 0, explanation: "A controlled baseline exposes both quality loss and actual operational benefit." },
    ],
  ),
};

export function getRoundTenLessonEnrichment(track: LearningTrackId, pace: string, topic: string): LessonEnrichment | null {
  return ROUND_TEN_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
