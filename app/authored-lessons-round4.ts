import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_FOUR_LESSONS: Record<string, LessonEnrichment> = {
  "python:beginner:Files": lesson(
    "Files let a program preserve information between runs and exchange data with other systems. Safe file handling prevents lost data, leaked resources, and encoding bugs.",
    [
      { title: "Choose the right representation", body: "Use text for human-readable characters and binary mode for exact bytes such as images or archives." },
      { title: "Control the lifecycle", body: "A with block closes the file even when reading, parsing, or writing raises an exception." },
      { title: "Protect existing data", body: "Read, write, and append modes have different effects; write mode truncates an existing file before new content is stored." },
    ],
    [
      { question: "Why use with open(...) as file?", options: ["It guarantees closure", "It encrypts the file", "It makes every path valid", "It disables errors"], answer: 0, explanation: "The context manager releases the file resource on both success and failure." },
      { question: "Which mode adds text without erasing existing content?", options: ["r", "w", "a", "rb"], answer: 2, explanation: "Append mode writes at the end while preserving current contents." },
      { question: "Why specify UTF-8 for text files?", options: ["To communicate a consistent character encoding", "To make files executable", "To prevent all corruption", "To create binary output"], answer: 0, explanation: "Explicit encoding avoids platform-dependent text interpretation." },
      { question: "What does Path.read_text() return?", options: ["A text string", "A file handle", "A database row", "A byte count only"], answer: 0, explanation: "read_text reads and decodes the complete file into a string." },
    ],
  ),
  "python:beginner:Modules": lesson(
    "Modules create explicit namespaces and reusable boundaries. They keep programs understandable as features grow and prevent import-time side effects from surprising callers.",
    [
      { title: "Organize related behavior", body: "Each Python file is a module whose functions, classes, and constants can be imported by other code." },
      { title: "Prefer visible namespaces", body: "import math keeps origin clear through math.sqrt; selective imports are useful when the source remains unambiguous." },
      { title: "Separate import from execution", body: "The __name__ == '__main__' guard runs demo or command-line behavior only when the file is executed directly." },
    ],
    [
      { question: "What is the main benefit of a module namespace?", options: ["It groups related names and shows their origin", "It removes all dependencies", "It makes variables global", "It replaces testing"], answer: 0, explanation: "Namespaces organize definitions and reduce accidental name collisions." },
      { question: "When is __name__ equal to '__main__'?", options: ["When the file is executed directly", "Whenever it is imported", "Only inside a class", "After pip install"], answer: 0, explanation: "Imported modules receive their module name; the entry script receives __main__." },
      { question: "What can happen if a local file is named json.py?", options: ["It may shadow the standard json module", "It becomes encrypted", "Python ignores it", "It is automatically packaged"], answer: 0, explanation: "Import resolution can find the local file instead of the intended library module." },
      { question: "Which import keeps the module origin most visible?", options: ["import statistics", "from statistics import *", "exec(statistics)", "global statistics"], answer: 0, explanation: "Qualified calls such as statistics.mean retain namespace context." },
    ],
  ),
  "python:beginner:Git basics": lesson(
    "Git gives a project reviewable history and recoverable checkpoints. Small, intentional commits make collaboration, debugging, and safe experimentation much easier.",
    [
      { title: "Inspect before selecting", body: "git status shows changed and untracked files, while git diff reveals the unstaged content you are considering." },
      { title: "Stage one coherent change", body: "git add places selected changes into the staging area; git diff --staged previews the exact next snapshot." },
      { title: "Record intent", body: "A focused commit message explains why the snapshot exists, while secrets, generated files, and local environments stay ignored." },
    ],
    [
      { question: "What does git add do?", options: ["Selects changes for the next commit", "Uploads to production", "Deletes history", "Runs tests"], answer: 0, explanation: "git add updates the staging area; it does not create or publish the commit." },
      { question: "Which command previews staged changes?", options: ["git diff --staged", "git init", "git clone --delete", "git clean"], answer: 0, explanation: "The staged diff is the best review of the exact snapshot about to be committed." },
      { question: "Why should commits be focused?", options: ["They are easier to review and revert", "They use no storage", "They hide mistakes", "They eliminate merge conflicts"], answer: 0, explanation: "A coherent snapshot makes intent and later reversal clearer." },
      { question: "What belongs in .gitignore?", options: ["Generated files, local environments, and secrets that should not be tracked", "Every source file", "Commit messages", "Remote branches"], answer: 0, explanation: "Ignored local or generated artifacts keep the repository reproducible and safe." },
    ],
  ),
  "python:beginner:Virtual environments": lesson(
    "Virtual environments isolate a project's interpreter-facing packages from other projects. This prevents incompatible versions and makes setup predictable across machines.",
    [
      { title: "Create project isolation", body: "python -m venv .venv builds an environment with its own Python and package installation location." },
      { title: "Verify, do not assume", body: "Activation changes shell resolution; checking sys.executable confirms which interpreter a command will actually use." },
      { title: "Recreate instead of sharing", body: "The .venv directory is machine-specific and disposable; share dependency declarations rather than committing the environment." },
    ],
    [
      { question: "What does activation primarily change?", options: ["Which python and pip the shell resolves", "The source language", "Git history", "Operating-system permissions"], answer: 0, explanation: "Activation prepends the environment's executable directory to shell lookup." },
      { question: "How can you verify the active interpreter?", options: ["Inspect sys.executable", "Read README only", "Run git status", "Rename .venv"], answer: 0, explanation: "sys.executable reports the actual Python executable running the check." },
      { question: "Should .venv normally be committed?", options: ["No; recreate it from declared dependencies", "Yes; always", "Only its binaries", "Only on Windows"], answer: 0, explanation: "Environment files are large and platform-specific, while dependency declarations are portable." },
      { question: "Why can two projects need separate environments?", options: ["They may require incompatible package versions", "Python permits only one file", "Git requires it", "It increases network speed"], answer: 0, explanation: "Isolation lets each project satisfy its own dependency constraints." },
    ],
  ),
  "python:beginner:Dependency basics": lesson(
    "Dependency declarations turn a locally working program into a reproducible project. Version choices also carry compatibility, maintenance, and security consequences.",
    [
      { title: "Install through the intended interpreter", body: "python -m pip ties the package operation to the Python executable you selected or activated." },
      { title: "Declare direct needs", body: "Record the packages the application intentionally depends on, then use a lock or fully resolved file when exact reproduction matters." },
      { title: "Maintain the dependency set", body: "Review release notes, compatibility, licenses, vulnerabilities, and unused packages instead of treating installation as permanent." },
    ],
    [
      { question: "Why prefer python -m pip over a bare pip command?", options: ["It makes the target interpreter explicit", "It bypasses package indexes", "It installs without permissions", "It removes version constraints"], answer: 0, explanation: "The module invocation uses pip belonging to that Python interpreter." },
      { question: "What is a direct dependency?", options: ["A package the project intentionally uses", "Every transitive package", "The Python file name", "A Git branch"], answer: 0, explanation: "Direct dependencies express deliberate application requirements." },
      { question: "What does a version constraint communicate?", options: ["The package releases considered compatible", "A secret token", "The install directory only", "The operating system user"], answer: 0, explanation: "Constraints bound acceptable releases for reproducibility and compatibility." },
      { question: "Why review dependencies over time?", options: ["Compatibility and security conditions change", "Installed code never changes", "To avoid all testing", "To make imports global"], answer: 0, explanation: "Updates can fix vulnerabilities or break behavior, so upgrades need deliberate validation." },
    ],
  ),
  "python:beginner:JSON": lesson(
    "JSON is a common boundary format for APIs, files, and messages. Correct serialization and validation prevent Python-specific assumptions from leaking across systems.",
    [
      { title: "Know the type mapping", body: "JSON objects, arrays, strings, numbers, booleans, and null map to Python dict, list, str, numeric types, bool, and None." },
      { title: "Parse and serialize deliberately", body: "json.loads reads text into Python values; json.dumps produces JSON text and may reject values such as sets or custom objects." },
      { title: "Validate after parsing", body: "Syntactically valid JSON can still miss required keys, contain incorrect types, or violate domain rules." },
    ],
    [
      { question: "What does json.loads accept?", options: ["JSON text", "A database connection", "A module name", "A Git commit"], answer: 0, explanation: "loads deserializes a string, bytes, or bytearray containing JSON." },
      { question: "What does JSON null become in Python?", options: ["None", "False always", "An empty string", "NaN"], answer: 0, explanation: "The standard decoder maps null to None." },
      { question: "Why validate parsed JSON?", options: ["Valid syntax does not guarantee the required schema or meaning", "Parsing deletes types", "JSON has no strings", "Validation changes the file encoding"], answer: 0, explanation: "Structural and business rules remain application responsibilities." },
      { question: "Which Python value is not JSON-serializable by default?", options: ["A set", "A list", "A string", "A boolean"], answer: 0, explanation: "JSON has no set type, so it needs an intentional conversion." },
    ],
  ),
  "python:beginner:Debugging basics": lesson(
    "Debugging is a disciplined process of turning symptoms into reproducible evidence and locating the smallest incorrect assumption. It is more reliable than changing code at random.",
    [
      { title: "Make the failure repeatable", body: "Capture the exact input, environment, expected result, actual result, and traceback before changing behavior." },
      { title: "Narrow the search", body: "Use small experiments, assertions, logs, and a debugger to find the first point where state diverges from expectation." },
      { title: "Prove the repair", body: "Add a regression test for the failing case, fix the cause, and verify nearby behavior so the same defect cannot silently return." },
    ],
    [
      { question: "What is the first useful debugging goal?", options: ["Reproduce the failure consistently", "Rewrite everything", "Suppress the exception", "Add random print statements"], answer: 0, explanation: "A reliable reproduction creates a stable experiment for diagnosis." },
      { question: "What does a traceback show?", options: ["The call path and failure location", "Only package versions", "Git history", "Network speed"], answer: 0, explanation: "Traceback frames show how execution reached the exception." },
      { question: "Why add a regression test?", options: ["It proves the failing case stays fixed", "It hides logs", "It replaces diagnosis", "It changes production data"], answer: 0, explanation: "The test preserves the expected behavior that exposed the defect." },
      { question: "Which is a useful narrowing technique?", options: ["Check state at the boundary between working and failing stages", "Change several unrelated functions", "Ignore input data", "Delete error handling"], answer: 0, explanation: "Boundary checks isolate where correct state first becomes incorrect." },
    ],
  ),

  "sql:beginner:Foreign keys": lesson(
    "Foreign keys prevent references to missing parent records and make entity lifecycles explicit. They preserve integrity even when multiple applications write to the database.",
    [
      { title: "Reference a stable identity", body: "The child column points to a unique or primary key whose type and meaning match the relationship." },
      { title: "Choose lifecycle behavior", body: "ON DELETE and ON UPDATE actions such as RESTRICT, CASCADE, and SET NULL encode what should happen to dependent rows." },
      { title: "Support the relationship", body: "PostgreSQL does not automatically index the referencing column, so common joins and parent changes may need a child-side index." },
    ],
    [
      { question: "What does a foreign key prevent?", options: ["A child referencing a missing parent", "Duplicate text everywhere", "All deadlocks", "Slow queries automatically"], answer: 0, explanation: "The constraint verifies that the referenced key exists, unless the child value is allowed to be NULL." },
      { question: "When is ON DELETE CASCADE appropriate?", options: ["When child records should share the parent's lifecycle", "For every relationship", "When deletion must always fail", "To sort rows"], answer: 0, explanation: "Cascade is deliberate ownership semantics, not a default convenience." },
      { question: "Does PostgreSQL automatically index the child foreign-key column?", options: ["No", "Yes, always", "Only for text", "Only after a join"], answer: 0, explanation: "The referenced key is indexed by uniqueness, but the referencing column often needs a separate index." },
      { question: "What should referenced and referencing columns share?", options: ["Compatible type and identity meaning", "The same display name", "The same NULL count", "The same row order"], answer: 0, explanation: "A relationship must connect values representing the same identity domain." },
    ],
  ),
  "sql:beginner:Constraints": lesson(
    "Constraints keep invalid state out of persistent storage regardless of which service performs the write. They turn critical business invariants into inspectable database rules.",
    [
      { title: "Choose the invariant", body: "NOT NULL requires presence, UNIQUE prevents duplicate keys, CHECK validates row expressions, and keys enforce identity and relationships." },
      { title: "Name important rules", body: "Descriptive constraint names make migration failures and application error messages easier to interpret." },
      { title: "Keep rules authoritative", body: "Frontend validation improves feedback, but database constraints remain the final protection against races and alternate writers." },
    ],
    [
      { question: "Which constraint enforces charge from 0 through 100?", options: ["CHECK (charge BETWEEN 0 AND 100)", "ORDER BY charge", "DEFAULT 100", "INDEX charge"], answer: 0, explanation: "A CHECK constraint rejects rows whose predicate is false." },
      { question: "Why retain database constraints when the UI validates?", options: ["Other writers and concurrent requests can bypass UI checks", "Constraints improve colors", "SQL requires both", "They replace error handling"], answer: 0, explanation: "The database is the shared authority for all write paths." },
      { question: "What does NOT NULL distinguish?", options: ["Required presence", "Uniqueness", "Referential integrity", "Sort direction"], answer: 0, explanation: "NOT NULL rejects absence but does not prevent duplicate present values." },
      { question: "Why name a constraint?", options: ["To identify the failed invariant clearly", "To create a view", "To encrypt its column", "To avoid migrations"], answer: 0, explanation: "Stable names improve diagnostics and schema maintenance." },
    ],
  ),
  "sql:beginner:Relationships": lesson(
    "Relationship design determines what connections are legal and how many rows can participate. Correct cardinality avoids duplicated facts and unqueryable comma-separated identifiers.",
    [
      { title: "Start from domain cardinality", body: "One-to-one, one-to-many, and many-to-many describe business rules, not merely how a diagram looks." },
      { title: "Enforce the shape", body: "A foreign key models the route, UNIQUE can limit it to one-to-one, and a junction table represents many-to-many." },
      { title: "Store relationship facts", body: "Junction tables can include attributes such as assigned_at or role because those facts belong to the connection." },
    ],
    [
      { question: "How is many-to-many normally modeled?", options: ["A junction table with two foreign keys", "Comma-separated IDs", "Duplicate parent columns", "A file"], answer: 0, explanation: "One junction row represents one association between the two entities." },
      { question: "What can enforce one-to-one on a foreign key?", options: ["UNIQUE", "ORDER BY", "HAVING", "LIMIT 1 in every query"], answer: 0, explanation: "A uniqueness constraint prevents multiple child rows from referencing the same parent key." },
      { question: "Where should assigned_at for a membership live?", options: ["On the membership junction row", "In both entity names", "In a comma-separated list", "Only in application memory"], answer: 0, explanation: "The timestamp describes the relationship itself." },
      { question: "What determines cardinality?", options: ["The real domain rule", "Column order", "Table color", "Query formatting"], answer: 0, explanation: "Schema constraints should encode how the business says entities may connect." },
    ],
  ),
  "sql:beginner:JOINs": lesson(
    "JOINs assemble related facts without duplicating storage. Predicting match behavior and cardinality is essential for correct reports, APIs, and updates.",
    [
      { title: "Define the route", body: "The ON clause connects compatible keys; similar column names alone do not prove a valid relationship." },
      { title: "Choose preservation behavior", body: "INNER JOIN keeps matched combinations, while LEFT JOIN also keeps unmatched rows from the left with NULL right-side values." },
      { title: "Predict row multiplication", body: "A parent appears once per matching child, so aggregation after a one-to-many join must account for repeated rows." },
    ],
    [
      { question: "What does INNER JOIN keep?", options: ["Matching row combinations", "Every left row", "Every right row", "Only NULL rows"], answer: 0, explanation: "Rows without a match on either side are omitted from an inner join result." },
      { question: "Which join preserves every sector even without relays?", options: ["sectors LEFT JOIN relays", "sectors INNER JOIN relays", "relays CROSS JOIN sectors", "relays JOIN without ON"], answer: 0, explanation: "Putting sectors on the left and using LEFT JOIN preserves all sector rows." },
      { question: "Why can a join return more rows than the parent table?", options: ["One parent can match multiple children", "JOIN always duplicates randomly", "Keys are ignored", "NULL creates copies"], answer: 0, explanation: "The result contains one combined row for each valid match." },
      { question: "What belongs in ON?", options: ["The relationship between compatible keys", "Final display ordering", "Application secrets", "Only aggregate filters"], answer: 0, explanation: "ON expresses how rows from the two inputs correspond." },
    ],
  ),

  "genai:beginner:Embeddings": lesson(
    "Embeddings convert meaning into vectors that support semantic search, clustering, recommendation, and deduplication. Their usefulness depends on the model, data, similarity measure, and evaluation—not visual intuition.",
    [
      { title: "Create comparable representations", body: "Use the same embedding model and preprocessing for queries and indexed content so vector dimensions and semantics align." },
      { title: "Measure proximity", body: "Cosine similarity or another model-appropriate metric ranks vectors by direction or distance; a score is relative, not universal truth." },
      { title: "Evaluate on the real task", body: "Test representative queries, domain language, multilingual inputs, and failure cases before choosing thresholds or models." },
    ],
    [
      { question: "Why embed queries and documents with the same model?", options: ["They must share a compatible vector space", "It makes text shorter", "It guarantees truth", "It removes indexing"], answer: 0, explanation: "Similarity is meaningful only when both representations use the same learned space." },
      { question: "What does a high cosine similarity suggest?", options: ["Similar vector direction", "Guaranteed factual agreement", "Identical source text", "Authorization"], answer: 0, explanation: "It indicates proximity under the embedding representation, not proof of truth or identity." },
      { question: "How should an embedding model be selected?", options: ["Evaluate it on representative retrieval tasks", "Choose the largest vector", "Use one threshold from another domain", "Ignore language coverage"], answer: 0, explanation: "Task-specific evaluation reveals whether the representation serves the intended content and queries." },
      { question: "What must an embedding index record alongside vectors?", options: ["Stable source identity and useful metadata", "Only colors", "API secrets", "Generated answers only"], answer: 0, explanation: "Metadata connects retrieved vectors back to authoritative content and filtering fields." },
    ],
  ),
  "genai:beginner:Vector DB basics": lesson(
    "A vector database stores embeddings with identifiers and metadata, then performs nearest-neighbor search at useful scale. Reliable retrieval also needs filtering, update, deletion, and source-version discipline.",
    [
      { title: "Design the record", body: "Store a stable id, vector, original text reference, source metadata, permissions, and embedding-model version." },
      { title: "Search approximately", body: "Indexes such as HNSW trade exactness, memory, build cost, and latency to retrieve likely nearest neighbors quickly." },
      { title: "Maintain consistency", body: "Re-embed changed content, delete obsolete vectors, isolate tenants, and filter permissions before results reach generation." },
    ],
    [
      { question: "What does top-k vector search return?", options: ["The k nearest indexed candidates under the search metric", "The k newest documents", "Guaranteed correct answers", "All matching SQL rows"], answer: 0, explanation: "Top-k retrieves candidate neighbors for later inspection or reranking." },
      { question: "Why store embedding-model version?", options: ["Vectors from changed models may be incompatible", "It encrypts records", "It replaces metadata", "It guarantees low latency"], answer: 0, explanation: "Versioning supports controlled re-indexing and avoids mixing representation spaces." },
      { question: "When should permission filtering occur?", options: ["Before unauthorized content is returned to generation", "After showing the answer", "Only during ingestion", "Never for vectors"], answer: 0, explanation: "Semantic search must preserve the same access controls as source data." },
      { question: "What is an approximate-neighbor tradeoff?", options: ["Recall versus latency and resource use", "Syntax versus encoding", "Authentication versus JSON", "Temperature versus tokens"], answer: 0, explanation: "Index parameters balance retrieval quality, speed, memory, and construction cost." },
    ],
  ),
  "genai:beginner:Basic RAG": lesson(
    "Retrieval-augmented generation supplies selected external evidence to a model at request time. It improves access to current or private knowledge, but only when retrieval and answer grounding are evaluated separately.",
    [
      { title: "Retrieve relevant evidence", body: "Convert the user question into a search request, apply access filters, and return a bounded set of source passages." },
      { title: "Generate from evidence", body: "Prompt the model to use supplied passages, cite sources, distinguish instructions from evidence, and abstain when support is missing." },
      { title: "Measure both stages", body: "Evaluate retrieval recall and ranking as well as answer correctness, citation support, latency, and failure handling." },
    ],
    [
      { question: "What are the two primary RAG stages?", options: ["Retrieval and grounded generation", "Training and deployment", "Login and billing", "Sorting and deletion"], answer: 0, explanation: "The system first selects evidence, then uses it to construct an answer." },
      { question: "Can RAG guarantee factual answers?", options: ["No; retrieval and generation can both fail", "Yes, always", "Only with long prompts", "Only without citations"], answer: 0, explanation: "Missing, irrelevant, or misused evidence can still produce wrong answers." },
      { question: "Why evaluate retrieval separately?", options: ["Generation cannot use evidence that was never retrieved", "Retrieval has no effect", "It reduces all cost to zero", "It trains the model"], answer: 0, explanation: "Stage-level metrics reveal whether failure began in search or answer construction." },
      { question: "What should happen when evidence is insufficient?", options: ["Abstain or clearly report the evidence gap", "Invent a likely answer", "Remove citations", "Increase temperature"], answer: 0, explanation: "Explicit insufficiency is safer than unsupported completion." },
    ],
  ),
  "genai:beginner:Multimodal basics": lesson(
    "Multimodal systems combine text, images, audio, or video to solve tasks that one modality cannot capture alone. Production reliability depends on modality-specific preprocessing, evidence, accessibility, and safety.",
    [
      { title: "Represent each modality", body: "Inputs need suitable decoding, resizing, sampling, transcription, or feature extraction before joint reasoning." },
      { title: "Preserve provenance", body: "Track which frame, region, timestamp, transcript span, or document passage supports each important finding." },
      { title: "Test modality failures", body: "Evaluate blurry images, missing audio, conflicting text, adversarial media, accessibility needs, latency, and privacy." },
    ],
    [
      { question: "What makes a system multimodal?", options: ["It processes or relates more than one input or output modality", "It uses many prompts", "It has multiple users", "It stores vectors"], answer: 0, explanation: "Modalities include forms such as text, images, audio, and video." },
      { question: "Why preserve timestamps or image regions?", options: ["To connect findings to inspectable evidence", "To increase randomness", "To hide source data", "To remove preprocessing"], answer: 0, explanation: "Fine-grained provenance makes important claims reviewable." },
      { question: "What should happen if a required image is unreadable?", options: ["Report the limitation or request a better input", "Invent its contents", "Trust accompanying text automatically", "Increase top-k"], answer: 0, explanation: "The system should expose missing evidence rather than fabricate perception." },
      { question: "Which is a multimodal production concern?", options: ["Privacy and consent for captured media", "Only font choice", "SQL row order only", "Git commit size"], answer: 0, explanation: "Media can contain faces, voices, locations, documents, and other sensitive information." },
    ],
  ),
};

export function getRoundFourLessonEnrichment(track: LearningTrackId, pace: string, topic: string) {
  return ROUND_FOUR_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}
