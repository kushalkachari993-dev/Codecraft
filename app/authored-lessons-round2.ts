import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_TWO_LESSONS: Record<string, LessonEnrichment> = {
  "python:beginner:Lists": lesson(
    "Lists are Python's everyday structure for ordered, changing collections. Deliberate list operations prevent accidental mutation and make data pipelines easier to follow.",
    [
      { title: "Build the collection", body: "Square brackets create a list in a known order. append() adds one item; extend() adds each item from another iterable." },
      { title: "Address positions", body: "Indexes select one item and begin at zero; negative indexes count from the end. A slice normally returns a new shallow list." },
      { title: "Control mutation", body: "append(), pop(), and sort() change the existing object. Copy first when the caller must retain its original state." },
    ],
    [
      { question: "What is toolkit[-1] for ['scanner', 'cell', 'map']?", options: ["'scanner'", "'cell'", "'map'", "An IndexError"], answer: 2, explanation: "Index -1 selects the final list item." },
      { question: "Which operation adds 'cell' and 'map' as separate items?", options: ["toolkit.append(['cell', 'map'])", "toolkit.extend(['cell', 'map'])", "toolkit[0]", "toolkit.pop()"], answer: 1, explanation: "extend() consumes the supplied collection and adds each item separately." },
      { question: "Why use safe_copy = readings[:] before sorting?", options: ["To create a tuple", "To avoid changing the caller's list", "To remove duplicates", "To reverse the original"], answer: 1, explanation: "A full slice creates a shallow list copy that can be reordered independently." },
      { question: "Why is removing items while iterating over the same list risky?", options: ["Indexes shift and items can be skipped", "Lists become strings", "The loop always runs forever", "Python deletes the variable"], answer: 0, explanation: "Mutation shifts later positions while the iterator advances, producing skipped or confusing results." },
    ],
  ),
  "python:beginner:Tuples": lesson(
    "Tuples communicate that a small ordered record should not change. They fit coordinates, fixed return values, and safe unpacking into meaningful names.",
    [
      { title: "Pack a record", body: "Commas create a tuple. Parentheses improve readability, but a one-item tuple still requires a trailing comma." },
      { title: "Unpack by position", body: "x, y, z = coordinate binds each position to a name and fails when the number of values does not match." },
      { title: "Preserve intent", body: "Immutability prevents replacing positions, making a fixed coordinate contract clearer than a freely changing list." },
    ],
    [
      { question: "Which expression creates a one-item tuple?", options: ["(5)", "[5]", "(5,)", "tuple[5]"], answer: 2, explanation: "The comma creates the tuple; parentheses alone only group a value." },
      { question: "What happens in x, y = (10, 20, 30)?", options: ["x=10 and y=20", "Python raises an unpacking error", "y becomes (20, 30)", "30 is discarded"], answer: 1, explanation: "Basic unpacking requires the same number of target names and values." },
      { question: "Which value is best represented as a tuple?", options: ["A changing cart", "A fixed 3D coordinate", "An unordered tag collection", "A key-value profile"], answer: 1, explanation: "A coordinate has ordered positions and benefits from a fixed-size immutable representation." },
      { question: "Why can't coordinate[0] = 99 update a tuple?", options: ["Tuples use one-based indexes", "Tuple positions are immutable", "Only strings have indexes", "99 is too large"], answer: 1, explanation: "Construct a new tuple when a coordinate needs to change." },
    ],
  ),
  "python:beginner:Sets": lesson(
    "Sets make uniqueness and membership explicit. They replace nested duplicate checks with operations that directly express overlap and missing values.",
    [
      { title: "Keep unique values", body: "A set keeps one copy of each hashable value. Empty sets use set() because {} creates an empty dictionary." },
      { title: "Compare groups", body: "Union | combines groups, intersection & keeps shared values, and difference - keeps values present only on the left." },
      { title: "Display deliberately", body: "Membership checks are efficient, but set iteration order is not a presentation contract; sort when output order matters." },
    ],
    [
      { question: "What is {1, 1, 2, 3}?", options: ["{1, 1, 2, 3}", "{1, 2, 3}", "[1, 2, 3]", "An error"], answer: 1, explanation: "Sets retain unique values, so duplicate 1 appears once." },
      { question: "Which expression finds required badges not yet found?", options: ["required | found", "required & found", "required - found", "found - required"], answer: 2, explanation: "Difference keeps items on the left that are absent from the right." },
      { question: "How do you create an empty set?", options: ["{}", "[]", "set()", "()"], answer: 2, explanation: "{} creates an empty dictionary; set() creates an empty set." },
      { question: "Why sort a set before displaying it?", options: ["Set order is not a meaningful contract", "Sets cannot contain strings", "Sorting adds duplicates", "Membership stops working"], answer: 0, explanation: "Sets represent membership rather than position, so sorting supplies deterministic output." },
    ],
  ),
  "python:beginner:Dictionaries": lesson(
    "Dictionaries model records and lookups using meaningful keys. They are central to JSON-like data, configuration, counters, caches, and API payloads.",
    [
      { title: "Map keys to values", body: "Each unique hashable key identifies one value. Assigning an existing key updates that value." },
      { title: "Choose safe access", body: "Brackets suit required keys and raise KeyError; get() expresses that a key is optional and can provide a default." },
      { title: "Iterate with meaning", body: "items() supplies key-value pairs, while keys() and values() expose dynamic views of the mapping." },
    ],
    [
      { question: "What does profile.get('level', 1) return when level is absent?", options: ["KeyError", "None only", "1", "'level'"], answer: 2, explanation: "get() returns the supplied default for an absent key." },
      { question: "What happens when an existing dictionary key is assigned again?", options: ["A duplicate key is added", "Its value is replaced", "It becomes a list", "Python rejects it"], answer: 1, explanation: "Dictionary keys are unique, so assignment updates the existing mapping." },
      { question: "Which loop receives both keys and values?", options: ["for pair in profile:", "for key, value in profile.items():", "for value in profile.keys():", "for profile in value:"], answer: 1, explanation: "items() yields key-value pairs that can be unpacked." },
      { question: "When is profile['name'] preferable to profile.get('name')?", options: ["When name is required and absence should fail", "When name is optional", "When profile is a set", "When missing means zero"], answer: 0, explanation: "Bracket access makes the required-field invariant visible." },
    ],
  ),

  "sql:beginner:WHERE": lesson(
    "Filtering is where query correctness often succeeds or fails. A precise predicate limits returned data and the rows a later write could affect.",
    [
      { title: "Evaluate candidates", body: "WHERE evaluates its predicate for each candidate row and keeps only rows whose result is true." },
      { title: "Group mixed logic", body: "AND binds more tightly than OR. Parentheses make business rules explicit and safer to edit." },
      { title: "Respect unknown", body: "Comparisons involving NULL can be unknown and do not pass WHERE. Use IS NULL or IS NOT NULL." },
    ],
    [
      { question: "Which predicate returns online relays with power at least 80?", options: ["online = true OR power >= 80", "online = true AND power >= 80", "power < 80", "online IS NULL"], answer: 1, explanation: "AND requires both the online state and inclusive threshold." },
      { question: "Why group region = 'north' AND (status = 'weak' OR status = 'critical')?", options: ["To define which alternatives share the region rule", "To convert text", "To sort rows", "To create a transaction"], answer: 0, explanation: "Parentheses make the intended logic explicit instead of relying on precedence." },
      { question: "How should missing repaired_at values be tested?", options: ["repaired_at = NULL", "repaired_at <> NULL", "repaired_at IS NULL", "repaired_at = 'missing'"], answer: 2, explanation: "NULL uses IS NULL rather than equality." },
      { question: "What can a selective predicate improve besides correctness?", options: ["Font size", "The opportunity to use an index", "Column count", "The password"], answer: 1, explanation: "An index-compatible predicate can reduce rows inspected." },
    ],
  ),
  "sql:beginner:ORDER BY": lesson(
    "Applications cannot rely on accidental row order. Deterministic ordering keeps rankings, feeds, exports, and pagination stable when values tie.",
    [
      { title: "Choose direction", body: "ASC sorts lower to higher; DESC reverses direction for rankings such as strongest power first." },
      { title: "Break ties", body: "Additional expressions apply left to right. A stable unique tie-breaker prevents equal values from swapping." },
      { title: "Place missing values", body: "NULLS FIRST or NULLS LAST states where missing values belong." },
    ],
    [
      { question: "Without ORDER BY, what row order does SQL guarantee?", options: ["Insertion order", "Primary-key order", "No particular order", "Alphabetical order"], answer: 2, explanation: "A result is unordered unless the query defines ordering." },
      { question: "What does ORDER BY power DESC, relay_id ASC do?", options: ["Lowest power first", "Highest power first, then lower ID for ties", "Sort only by ID", "Remove duplicates"], answer: 1, explanation: "The first key ranks power; the second creates a deterministic tie-breaker." },
      { question: "Why add a unique tie-breaker to pagination?", options: ["To stabilize equal sort values", "To convert LIMIT to WHERE", "To add duplicates", "To avoid columns"], answer: 0, explanation: "Equal earlier keys otherwise may swap positions between requests." },
      { question: "Which clause puts missing repaired_at values last?", options: ["ORDER BY repaired_at DESC NULLS LAST", "WHERE repaired_at = NULL", "DISTINCT repaired_at", "LIMIT NULL"], answer: 0, explanation: "NULLS LAST explicitly places missing values after known timestamps." },
    ],
  ),
  "sql:beginner:LIMIT": lesson(
    "LIMIT controls result size but becomes predictable only with deterministic ordering. It fits previews and top-N queries, not as a substitute for efficient filtering.",
    [
      { title: "Define candidates", body: "FROM and WHERE determine which rows are eligible before LIMIT." },
      { title: "Order first", body: "ORDER BY defines which eligible rows count as newest, strongest, or otherwise first." },
      { title: "Cut the stream", body: "LIMIT returns only the requested number after ordering, though earlier work may still process many rows." },
    ],
    [
      { question: "Why is LIMIT 5 without ORDER BY unstable?", options: ["LIMIT cannot use numbers", "The database may return any five qualifying rows", "It returns zero", "It changes the table"], answer: 1, explanation: "No ordering contract defines which rows belong in the first five." },
      { question: "Which pattern expresses the two strongest relays?", options: ["LIMIT 2 ORDER BY power", "ORDER BY power DESC LIMIT 2", "WHERE LIMIT = 2", "DISTINCT 2 power"], answer: 1, explanation: "Order strongest first, then keep two." },
      { question: "Does LIMIT make every query inexpensive?", options: ["Yes", "No, filtering or sorting may still process many rows", "Only LIMIT 1", "Only text"], answer: 1, explanation: "The engine may do substantial work before identifying the limited result." },
      { question: "What is a common use for LIMIT?", options: ["Defining a key", "A deterministic preview or top-N result", "Granting permissions", "Changing types"], answer: 1, explanation: "LIMIT fits a product that intentionally needs only the first N ordered rows." },
    ],
  ),
  "sql:beginner:DISTINCT": lesson(
    "DISTINCT can express a real requirement for unique result combinations, but using it blindly can hide a faulty join or unclear model.",
    [
      { title: "Project the shape", body: "The SELECT list defines the expressions that make up each result row." },
      { title: "Compare complete rows", body: "DISTINCT removes duplicates based on the complete selected combination." },
      { title: "Investigate the cause", body: "Determine whether repeats are valid facts, expected relationships, or a join error before deduplicating." },
    ],
    [
      { question: "What does SELECT DISTINCT region, status compare?", options: ["Only region", "Only status", "The complete pair", "Every table column"], answer: 2, explanation: "DISTINCT applies to all selected expressions together." },
      { question: "When can DISTINCT hide a bug?", options: ["When duplicates come from an incorrect join", "When unique regions are required", "When one row exists", "When selecting a key"], answer: 0, explanation: "Deduplicating can conceal incorrect relationship logic." },
      { question: "Which query returns unique sector regions?", options: ["SELECT region FROM sectors", "SELECT DISTINCT region FROM sectors", "DELETE DUPLICATES region", "GROUP DISTINCT sectors"], answer: 1, explanation: "DISTINCT on region returns one row per unique value." },
      { question: "Why can DISTINCT cost work?", options: ["Hashing or sorting may identify duplicates", "It encrypts values", "It creates a table", "It always uses the network"], answer: 0, explanation: "The engine must compare or group result values." },
    ],
  ),
  "sql:beginner:Aggregates": lesson(
    "Aggregates turn records into operational measurements. Understanding granularity and NULL behavior prevents convincing but incorrect dashboards.",
    [
      { title: "Choose the measurement", body: "COUNT, SUM, AVG, MIN, and MAX answer different questions about input rows." },
      { title: "Predict NULL behavior", body: "COUNT(*) counts rows; COUNT(column) counts non-NULL values. Most aggregates ignore NULL inputs." },
      { title: "Recognize granularity", body: "Without GROUP BY, an aggregate query normally produces one summary row." },
    ],
    [
      { question: "How do COUNT(*) and COUNT(last_error) differ?", options: ["They do not", "The latter skips NULL last_error values", "COUNT(*) skips NULL rows", "The latter returns text"], answer: 1, explanation: "COUNT(expression) counts non-NULL values; COUNT(*) counts rows." },
      { question: "Which finds strongest power?", options: ["MIN(power)", "AVG(power)", "MAX(power)", "COUNT(power)"], answer: 2, explanation: "MAX returns the greatest non-NULL input." },
      { question: "What granularity has SELECT AVG(power) FROM relays?", options: ["One row per relay", "One summary row", "One column per table", "No rows"], answer: 1, explanation: "All inputs are summarized without grouping keys." },
      { question: "Why can AVG(power) differ from SUM(power)/COUNT(*) with NULL power?", options: ["AVG ignores NULL power while COUNT(*) includes those rows", "AVG sorts", "SUM returns text", "COUNT removes duplicates"], answer: 0, explanation: "AVG divides by non-NULL input count, not necessarily all rows." },
    ],
  ),

  "genai:beginner:Tokens": lesson(
    "Tokens determine what a model can fit, generate, and bill. Measuring real tokenization is safer than guessing from words or characters across languages and code.",
    [
      { title: "Encode text", body: "A model-specific tokenizer splits text into vocabulary units and maps them to integer IDs." },
      { title: "Observe boundaries", body: "Spaces, punctuation, names, code, and languages can produce very different token boundaries." },
      { title: "Budget both directions", body: "Instructions, input, evidence, history, and generated output all consume the token budget." },
    ],
    [
      { question: "Is one token always one word?", options: ["Yes", "No, it may be a word, fragment, or punctuation", "Only in code", "Only for nouns"], answer: 1, explanation: "Token boundaries depend on tokenizer and input." },
      { question: "What consumes a request's context budget?", options: ["Only the last sentence", "Input plus reserved or generated output", "Only punctuation", "Browser size"], answer: 1, explanation: "Prompt and continuation share the token workspace." },
      { question: "Why inspect real user tokenization?", options: ["Languages and identifiers tokenize differently", "Tokenizers are identical", "It guarantees truth", "It removes latency"], answer: 0, explanation: "Representative text exposes cost and limit behavior." },
      { question: "Safest model-specific token estimate?", options: ["Count spaces", "Use the target tokenizer", "Divide characters exactly", "Count sentences"], answer: 1, explanation: "The target tokenizer is authoritative." },
    ],
  ),
  "genai:beginner:Context windows": lesson(
    "Context is a limited working set, not unlimited memory. Selecting relevant evidence improves reliability, latency, and cost while preserving answer space.",
    [
      { title: "Account for fixed input", body: "System rules, tools, state, and the current request consume context before evidence." },
      { title: "Reserve output", body: "Keep enough tokens for the expected answer instead of filling the entire window with input." },
      { title: "Prioritize signal", body: "Rank, trim, or summarize evidence and measure supported-answer quality." },
    ],
    [
      { question: "With an 8,000-token window and 6,500 input tokens, what remains to budget?", options: ["Only CSS", "Generated output and runtime context", "Nothing", "Disk size"], answer: 1, explanation: "Input and output share the context limit." },
      { question: "Does filling a larger window always improve answers?", options: ["Yes", "No, irrelevant content can dilute signal", "Only for SQL", "Only at high temperature"], answer: 1, explanation: "More context can add distraction, latency, and cost." },
      { question: "What should context selection optimize?", options: ["Maximum tokens", "Relevant supported quality under cost and latency constraints", "Longest document", "Most repetition"], answer: 1, explanation: "Selection should maximize useful evidence within constraints." },
      { question: "What belongs in context when a fact is not reliable in parameters?", options: ["Relevant external evidence", "A random example", "Only model name", "Unused history"], answer: 0, explanation: "Grounded answers require supplied or retrieved evidence." },
    ],
  ),
  "genai:beginner:Generation parameters": lesson(
    "Generation settings shape variation, length, and stopping. Treating them as testable configuration avoids the myth that temperature controls truth.",
    [
      { title: "Shape sampling", body: "Temperature and top-p alter how probability mass is used; lower variation often suits structured tasks." },
      { title: "Bound output", body: "Maximum output tokens limits length, while stop sequences can end at a known boundary." },
      { title: "Test one change", body: "Hold prompt, evidence, and model stable while comparing settings on representative cases." },
    ],
    [
      { question: "What does lower temperature generally do?", options: ["Guarantees truth", "Often reduces sampling variation", "Adds context", "Trains the model"], answer: 1, explanation: "Temperature reshapes sampling probabilities, not factual verification." },
      { question: "Which setting bounds continuation length?", options: ["Maximum output tokens", "Model name", "System role", "Embedding dimension"], answer: 0, explanation: "The output-token cap limits newly generated tokens." },
      { question: "Why tune temperature and top-p separately first?", options: ["Combined effects are harder to attribute", "They are keys", "They remove prompts", "They always raise accuracy"], answer: 0, explanation: "One change at a time makes behavior easier to evaluate." },
      { question: "Can generation parameters repair missing evidence?", options: ["Yes", "No, evidence must be supplied", "Only with top-p zero", "Only for long output"], answer: 1, explanation: "Sampling controls do not create authoritative information." },
    ],
  ),
  "genai:beginner:Prompt engineering": lesson(
    "A production prompt is an executable specification. Clear goals, context boundaries, output contracts, and evaluations make behavior maintainable.",
    [
      { title: "State the task", body: "Define the goal, audience, allowed actions, and success criteria directly." },
      { title: "Separate inputs", body: "Keep stable system rules distinct from user requests and untrusted retrieved content." },
      { title: "Specify and test output", body: "Provide a schema, examples, and failure cases; version and evaluate prompt changes like code." },
    ],
    [
      { question: "What most directly reduces output-format ambiguity?", options: ["A longer greeting", "An explicit schema", "Higher temperature", "Repeated punctuation"], answer: 1, explanation: "A concrete contract states what downstream code expects." },
      { question: "Why separate system rules from retrieved documents?", options: ["To clarify authority and treat documents as untrusted evidence", "To increase font size", "To disable tokens", "To make documents instructions"], answer: 0, explanation: "External content should supply evidence, not override stable rules." },
      { question: "How should a production prompt change be evaluated?", options: ["One impressive demo", "Representative cases and known failures", "Only length", "Without prior versions"], answer: 1, explanation: "Repeatable evaluations reveal improvements and regressions." },
      { question: "What beats adding vague instructions repeatedly?", options: ["Clarifying task, constraints, evidence, and output", "Raising temperature", "Removing request", "More adjectives"], answer: 0, explanation: "Specific definitions address ambiguity directly." },
    ],
  ),
};

export function getRoundTwoLessonEnrichment(track: LearningTrackId, pace: string, topic: string) {
  return ROUND_TWO_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}

