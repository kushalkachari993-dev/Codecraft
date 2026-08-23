import type { LearningTrackId, LessonEnrichment } from "./authored-lessons";

const lesson = (whyItMatters: string, walkthrough: LessonEnrichment["walkthrough"], quiz: LessonEnrichment["quiz"]): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const ROUND_THREE_LESSONS: Record<string, LessonEnrichment> = {
  "python:beginner:Conditions": lesson(
    "Conditions turn domain rules into explicit paths. Correct branch order prevents valid code from silently classifying users, payments, or system states incorrectly.",
    [
      { title: "Evaluate in order", body: "Python checks if and elif expressions from top to bottom and runs only the first true branch." },
      { title: "Use truth deliberately", body: "False, None, zero, and empty collections are falsy, but explicit comparisons often communicate business intent better." },
      { title: "Make branches exclusive", body: "Place specific thresholds before broad ones and use else for the remaining valid state." },
    ],
    [
      { question: "Why should shield <= 0 be checked before shield < 4?", options: ["The specific offline case would otherwise be swallowed by the broader test", "Python requires negative numbers first", "elif runs before if", "It changes shield"], answer: 0, explanation: "A non-positive shield also satisfies shield < 4, so the specific branch must come first." },
      { question: "Which value is falsy?", options: ["[0]", "'false'", "[]", "-1"], answer: 2, explanation: "An empty list is falsy; the other values are non-empty or non-zero." },
      { question: "How many branches run in one if/elif/else chain?", options: ["Every true branch", "At most one", "Exactly two", "None ever"], answer: 1, explanation: "Python runs the first true branch and skips the rest of that chain." },
      { question: "What defines the statements inside a Python branch?", options: ["Semicolons", "Indentation", "Parentheses", "File names"], answer: 1, explanation: "Python uses indentation to define each suite of statements." },
    ],
  ),
  "python:beginner:Loops": lesson(
    "Loops express repeated work without duplicated code. Choosing a for or while loop and defining termination clearly prevents missed records and runaway execution.",
    [
      { title: "Choose the driver", body: "Use for when consuming an iterable; use while when repetition depends on a condition that changes over time." },
      { title: "Control an iteration", body: "continue skips the remainder of the current iteration; break exits the loop entirely." },
      { title: "Prove termination", body: "A while loop needs state that moves toward a false condition on every relevant path." },
    ],
    [
      { question: "Which loop naturally processes every reading in a list?", options: ["for reading in readings", "while True with no break", "if readings", "try readings"], answer: 0, explanation: "A for loop directly consumes each iterable item." },
      { question: "What does continue do?", options: ["Ends the function", "Skips to the next iteration", "Stops every loop", "Repeats the same item forever"], answer: 1, explanation: "continue skips the remaining body for the current iteration." },
      { question: "What does break do?", options: ["Exits the nearest loop", "Returns a value", "Restarts Python", "Creates a range"], answer: 0, explanation: "break immediately leaves the nearest enclosing loop." },
      { question: "What makes while energy > 0 unsafe if the body never changes energy?", options: ["The condition may never become false", "while cannot use numbers", "Energy becomes text", "The loop runs once"], answer: 0, explanation: "Without progress toward termination, the loop can continue indefinitely." },
    ],
  ),
  "python:beginner:Functions": lesson(
    "Functions create testable boundaries around behavior. Clear parameters and return values reduce duplication and let callers combine small operations into larger systems.",
    [
      { title: "Define inputs", body: "Parameters name a function's expected inputs; call arguments provide actual values, including optional defaults." },
      { title: "Produce an output", body: "return sends a value to the caller and stops the current function call." },
      { title: "Keep one purpose", body: "A focused function has a precise name, a small contract, and behavior that can be tested independently." },
    ],
    [
      { question: "What is the difference between a parameter and an argument?", options: ["A parameter is in the definition; an argument is supplied at a call", "They are unrelated types", "Arguments exist only globally", "Parameters print values"], answer: 0, explanation: "Parameters describe input slots; arguments fill them for a particular call." },
      { question: "What happens after return executes?", options: ["The function continues", "The function ends and sends the value to its caller", "Python exits", "Every variable becomes global"], answer: 1, explanation: "return immediately completes that function call." },
      { question: "Why return a calculation instead of only printing it?", options: ["Callers can reuse the value", "Printing is always an error", "Return changes input types", "It creates a loop"], answer: 0, explanation: "A returned result can participate in further computation and tests." },
      { question: "What is a good sign of a focused function?", options: ["It performs one clearly named job", "It changes many global variables", "It handles the whole application", "It has no inputs or output"], answer: 0, explanation: "Single-purpose functions are easier to understand, test, and reuse." },
    ],
  ),
  "python:beginner:Scope": lesson(
    "Scope makes dependencies and state ownership predictable. Passing values and returning results is safer than allowing distant code to mutate hidden global state.",
    [
      { title: "Start locally", body: "Names assigned inside a function normally belong to that call and are unavailable after it returns." },
      { title: "Search outward", body: "Name lookup follows Local, Enclosing, Global, then Built-in scopes—the LEGB rule." },
      { title: "Expose dependencies", body: "Function parameters reveal required state; return values reveal outputs without unnecessary global mutation." },
    ],
    [
      { question: "Where does Python first look for a name inside a function?", options: ["Built-ins", "Global scope", "Local scope", "Another file"], answer: 2, explanation: "LEGB lookup begins in the current local scope." },
      { question: "What normally happens to a local variable after its function call ends?", options: ["It remains directly accessible globally", "Its local binding is no longer accessible", "It becomes a built-in", "It is written to disk"], answer: 1, explanation: "Local bindings belong to that invocation's scope." },
      { question: "Why prefer parameters over reading unrelated globals?", options: ["Dependencies become explicit and testable", "Parameters are faster in every case", "Globals cannot contain numbers", "It prevents returns"], answer: 0, explanation: "Explicit inputs make behavior easier to reason about and isolate." },
      { question: "Assigning rate = 3 inside a function normally creates what?", options: ["A local rate binding", "A guaranteed update to global rate", "A syntax error", "A module"], answer: 0, explanation: "Assignment inside a function creates a local binding unless declared global or nonlocal." },
    ],
  ),
  "python:beginner:Exceptions": lesson(
    "Exceptions separate a function's promised behavior from cases it cannot satisfy. Specific errors and targeted recovery keep failures visible instead of silently corrupting results.",
    [
      { title: "Raise a contract error", body: "raise signals that valid output cannot be produced, such as when an input violates the documented requirements." },
      { title: "Catch specifically", body: "Handle only exceptions the current layer can recover from or translate meaningfully." },
      { title: "Use structured cleanup", body: "else runs after a successful try; finally runs on both success and failure for required cleanup." },
    ],
    [
      { question: "Why is bare except: risky?", options: ["It can hide programming errors and interrupts", "It catches nothing", "It requires a return", "It creates global state"], answer: 0, explanation: "Catching everything obscures unexpected bugs and makes diagnosis difficult." },
      { question: "Which exception does int('relay') raise?", options: ["KeyError", "ValueError", "IndexError", "StopIteration"], answer: 1, explanation: "The string cannot be interpreted as an integer value." },
      { question: "When does a try block's else run?", options: ["When no exception was raised", "Only after failure", "Before try", "Instead of finally"], answer: 0, explanation: "else isolates work that should occur only after successful protected operations." },
      { question: "When should a function raise ValueError?", options: ["When an argument has an unacceptable value", "Whenever it prints", "When a key is absent from every dictionary", "Only at program startup"], answer: 0, explanation: "ValueError communicates that a value violates the function's accepted domain." },
    ],
  ),

  "sql:beginner:GROUP BY": lesson(
    "GROUP BY defines the grain of a report. Choosing the right grouping keys prevents metrics from being accidentally duplicated or summarized at the wrong level.",
    [
      { title: "Choose the grain", body: "Grouping keys describe what one output row represents, such as one row per relay status." },
      { title: "Measure each group", body: "Aggregate functions are calculated independently for rows sharing the same grouping-key values." },
      { title: "Keep expressions valid", body: "Each selected expression must be grouped, aggregated, or functionally determined under supported database rules." },
    ],
    [
      { question: "What does GROUP BY status produce with COUNT(*)?", options: ["One row per source row", "One count per distinct status", "One column per table", "Only one row always"], answer: 1, explanation: "Each distinct grouping key becomes one aggregate output group." },
      { question: "What controls aggregate result granularity?", options: ["The grouping keys", "The table name length", "ORDER BY only", "The password"], answer: 0, explanation: "Grouping keys define what each summary row represents." },
      { question: "Why is SELECT status, name, COUNT(*) GROUP BY status invalid?", options: ["name is neither grouped nor aggregated", "COUNT cannot be used", "status is text", "GROUP BY must be first"], answer: 0, explanation: "The database cannot choose one arbitrary name to represent a status group." },
      { question: "What happens when another grouping column is added?", options: ["Groups may become more detailed and numerous", "All aggregates disappear", "Rows are deleted", "NULL is forbidden"], answer: 0, explanation: "Additional keys subdivide existing groups and change the output grain." },
    ],
  ),
  "sql:beginner:HAVING": lesson(
    "HAVING filters completed groups, while WHERE filters source rows. Placing a condition at the right stage is essential for both meaning and efficiency.",
    [
      { title: "Filter source rows", body: "WHERE removes individual rows before grouping and aggregation." },
      { title: "Build summaries", body: "GROUP BY forms groups and aggregate functions calculate their measurements." },
      { title: "Filter group results", body: "HAVING retains groups according to aggregate conditions such as COUNT(*) >= 2." },
    ],
    [
      { question: "Which clause filters AVG(power) >= 80 after grouping?", options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], answer: 1, explanation: "HAVING can filter based on aggregate results." },
      { question: "Where should online = true usually be applied before grouping?", options: ["WHERE", "HAVING only", "SELECT alias", "CREATE TABLE"], answer: 0, explanation: "It is a row-level condition and should normally reduce input rows before aggregation." },
      { question: "What is the logical order?", options: ["HAVING then WHERE then GROUP BY", "WHERE then GROUP BY then HAVING", "GROUP BY then FROM", "LIMIT then WHERE"], answer: 1, explanation: "Rows are filtered, grouped, measured, then group results are filtered." },
      { question: "Why not place every condition in HAVING?", options: ["Row filters may do unnecessary aggregation work and obscure intent", "HAVING cannot use numbers", "It deletes indexes", "It changes types"], answer: 0, explanation: "Row-level predicates belong earlier where they reduce work and state the intended stage." },
    ],
  ),
  "sql:beginner:NULL": lesson(
    "NULL represents missing or unknown information, not an empty value. Correct three-valued logic prevents records from silently disappearing from filters and metrics.",
    [
      { title: "Represent absence", body: "NULL differs from zero, empty text, false, and not-applicable domain values." },
      { title: "Use three-valued logic", body: "Comparisons can be true, false, or unknown; WHERE retains only true results." },
      { title: "Replace deliberately", body: "COALESCE returns the first non-NULL expression, but a replacement is valid only when it matches domain meaning." },
    ],
    [
      { question: "Why does last_error = NULL not find missing errors?", options: ["Equality with NULL is unknown", "NULL is text", "The column needs sorting", "Errors cannot be NULL"], answer: 0, explanation: "Use IS NULL because ordinary equality cannot establish that two unknowns are equal." },
      { question: "Which predicate finds known last_error values?", options: ["last_error <> NULL", "last_error IS NOT NULL", "last_error = ''", "NOT last_error"], answer: 1, explanation: "IS NOT NULL explicitly tests presence." },
      { question: "What does COALESCE(last_error, 'none') do?", options: ["Deletes NULL rows", "Returns last_error or 'none' when it is NULL", "Changes the stored column", "Counts errors"], answer: 1, explanation: "COALESCE selects the first non-NULL expression for the query result." },
      { question: "Does NULL mean the same as zero?", options: ["Always", "No, zero is known while NULL represents absence or unknown", "Only in COUNT", "Only for text"], answer: 1, explanation: "Zero is a concrete numeric value; NULL carries different semantics." },
    ],
  ),
  "sql:beginner:CASE": lesson(
    "CASE turns ordered business rules into derived values. Careful branch order and a fallback make classifications complete and reproducible.",
    [
      { title: "Check in order", body: "Searched CASE evaluates WHEN conditions from top to bottom and returns the first matching result." },
      { title: "Return compatible values", body: "THEN and ELSE expressions should resolve to a coherent output type." },
      { title: "Cover the remainder", body: "ELSE defines behavior for unmatched rows; omitting it produces NULL for those cases." },
    ],
    [
      { question: "Why put power >= 90 before power >= 60?", options: ["The broader >=60 branch would otherwise catch high power first", "CASE requires descending text", "90 is always first", "It changes power"], answer: 0, explanation: "CASE stops at the first match, so specific high tiers precede broader thresholds." },
      { question: "What happens when no WHEN matches and ELSE is absent?", options: ["The row is deleted", "CASE returns NULL", "The query fails", "The first branch runs"], answer: 1, explanation: "The default result of an unmatched CASE without ELSE is NULL." },
      { question: "What does CASE create?", options: ["A derived expression value", "A permanent column automatically", "A transaction", "An index"], answer: 0, explanation: "CASE is an expression used in SELECT, ORDER BY, aggregates, and other expression contexts." },
      { question: "Why keep THEN results type-compatible?", options: ["The expression needs one resolvable result type", "CASE only supports text", "It sorts faster always", "It prevents WHERE"], answer: 0, explanation: "The database must determine a common type for the CASE result." },
    ],
  ),
  "sql:beginner:Primary keys": lesson(
    "A stable row identity supports references, updates, deduplication, and audits. Primary-key choice should survive ordinary attribute changes throughout the record lifecycle.",
    [
      { title: "Guarantee uniqueness", body: "A primary key rejects duplicate identities and implicitly requires every key value to be non-NULL." },
      { title: "Choose stability", body: "Display names, emails, and mutable business labels often need uniqueness but make fragile permanent identities." },
      { title: "Reference records", body: "Other tables use the primary key as the durable target of foreign-key relationships." },
    ],
    [
      { question: "What two properties does a primary key enforce?", options: ["Uniqueness and non-nullability", "Sorting and encryption", "Text and length", "Caching and backup"], answer: 0, explanation: "Every row must have one unique, present primary-key value." },
      { question: "Why is a mutable email often a poor sole primary key?", options: ["Identity should remain stable when ordinary attributes change", "Emails cannot be unique", "Keys must be integers", "Text cannot be indexed"], answer: 0, explanation: "Changing a primary identity complicates every reference and history record." },
      { question: "What is a surrogate key?", options: ["A system-assigned identity without domain meaning", "A duplicated name", "A nullable description", "A query alias"], answer: 0, explanation: "Surrogate keys such as identity numbers provide stable technical identity." },
      { question: "Can a table have multiple primary keys?", options: ["Yes, unlimited", "It has one primary-key constraint, which may contain multiple columns", "Only if empty", "Only for text"], answer: 1, explanation: "A composite primary key uses several columns within one primary-key constraint." },
    ],
  ),

  "genai:beginner:Hallucinations": lesson(
    "Fluent language can conceal unsupported claims. Grounding, verification, and abstention policies are necessary whenever incorrect output can affect decisions.",
    [
      { title: "Separate fluency from support", body: "A well-formed answer is not evidence that its claims follow from authoritative sources." },
      { title: "Match the control to risk", body: "Retrieval, calculators, deterministic checks, citations, and human review address different failure modes." },
      { title: "Allow abstention", body: "When evidence is insufficient, a controlled system should say so rather than invent a plausible continuation." },
    ],
    [
      { question: "What defines a hallucination?", options: ["Any long answer", "Unsupported or incorrect output presented plausibly", "A slow API", "A structured response"], answer: 1, explanation: "The core issue is unsupported or false content, not style or length." },
      { question: "Does telling a model 'be accurate' eliminate hallucinations?", options: ["Yes", "No, grounding and verification controls are still required", "Only at temperature zero", "Only for JSON"], answer: 1, explanation: "An instruction alone cannot supply missing evidence or guarantee correctness." },
      { question: "What should happen when required evidence is absent?", options: ["Invent the most likely answer", "Return an insufficient-evidence state", "Increase temperature", "Hide the source"], answer: 1, explanation: "Explicit abstention is safer than unsupported completion." },
      { question: "Why validate high-risk claims outside the model?", options: ["Model confidence is not proof", "Models cannot output text", "Validation increases tokens only", "Sources are always wrong"], answer: 0, explanation: "External authoritative checks establish support independently of generated confidence." },
    ],
  ),
  "genai:beginner:LLM APIs": lesson(
    "An LLM API is a remote dependency with credentials, quotas, latency, changing models, and untrusted output. Production integration must handle the whole contract.",
    [
      { title: "Build the request", body: "Choose a model, messages or input, response format, tools, and bounded generation settings." },
      { title: "Protect the gateway", body: "Keep secret credentials on a trusted server and apply authentication, quotas, timeouts, and size limits." },
      { title: "Handle outcomes", body: "Parse success responses, validate output, and classify rate limits, timeouts, retries, and permanent failures." },
    ],
    [
      { question: "Where should a secret LLM API key normally live?", options: ["Browser JavaScript", "A trusted server-side secret store", "A public repository", "The prompt"], answer: 1, explanation: "Browser code and repositories expose credentials to users or attackers." },
      { question: "Which failure often merits bounded retry with backoff?", options: ["A transient rate limit", "An invalid API key forever", "A malformed local schema", "A forbidden request"], answer: 0, explanation: "Transient rate limits may recover, while permanent configuration errors need correction." },
      { question: "How should model output be treated?", options: ["Trusted executable code", "Untrusted input requiring validation", "A database constraint", "Always factual"], answer: 1, explanation: "Remote generation can be malformed, unsafe, or unsupported and must be checked." },
      { question: "Why pin or configure model identifiers deliberately?", options: ["Model behavior and availability can change", "Identifiers reduce all cost", "Models need CSS", "It disables errors"], answer: 0, explanation: "Explicit model selection and migration testing help control behavior changes." },
    ],
  ),
  "genai:beginner:Conversation state": lesson(
    "Conversation continuity is an application responsibility. Selecting relevant state avoids sending unlimited transcripts and gives users control over durable personal information.",
    [
      { title: "Represent turns", body: "Store messages with roles, content, timestamps, and any tool events needed to reconstruct the interaction." },
      { title: "Select active context", body: "Keep recent and relevant turns, summarize older material carefully, and exclude unrelated or sensitive data." },
      { title: "Separate durability", body: "Temporary request context differs from long-term memory, which needs consent, retention, editing, and deletion controls." },
    ],
    [
      { question: "Are most basic model API calls inherently aware of prior calls?", options: ["Yes", "No, state must be supplied or managed explicitly", "Only for Python", "Only at low temperature"], answer: 1, explanation: "Stateless requests require the application or platform conversation object to carry selected history." },
      { question: "Why not resend an unlimited transcript?", options: ["It adds cost, distraction, privacy risk, and context pressure", "Models reject all history", "Old text cannot tokenize", "It disables tools"], answer: 0, explanation: "Unbounded history can degrade both operations and relevance." },
      { question: "What distinguishes durable memory from current context?", options: ["Durable memory persists across sessions and needs lifecycle controls", "They are identical", "Context is always public", "Memory has no user data"], answer: 0, explanation: "Persistence introduces consent, retention, correction, and deletion responsibilities." },
      { question: "What should a summary preserve?", options: ["Task-relevant facts and unresolved commitments", "Every exact token", "Only greetings", "Hidden system secrets"], answer: 0, explanation: "A useful summary compresses history without dropping information needed for future behavior." },
    ],
  ),
  "genai:beginner:Structured outputs": lesson(
    "Machine-readable outputs reduce parsing ambiguity and create a validation boundary. Schema compliance improves shape, but factual and safety checks remain separate.",
    [
      { title: "Design a small schema", body: "Use clear field names, constrained types, required properties, enums, and bounds that match downstream needs." },
      { title: "Request constrained output", body: "Use the provider's structured-output or schema feature instead of asking free-form text to resemble JSON." },
      { title: "Validate semantics", body: "Handle refusal, invalid data, unsupported claims, and retry or fallback policy after structural validation." },
    ],
    [
      { question: "What does a schema guarantee most directly?", options: ["Factual truth", "Output shape and types", "Tool authorization", "Source quality"], answer: 1, explanation: "Schema enforcement concerns structure, not whether values are correct." },
      { question: "Why prefer a small explicit schema?", options: ["It is easier for the model and application to satisfy and validate", "Large schemas are illegal", "It removes tokens entirely", "It trains the model"], answer: 0, explanation: "Focused contracts reduce ambiguity and failure surface." },
      { question: "What should happen after parsing valid JSON?", options: ["Trust every field", "Validate required semantics and safety", "Execute strings as code", "Discard the schema"], answer: 1, explanation: "Syntactic validity does not establish factual, domain, or authorization correctness." },
      { question: "What should the application handle explicitly?", options: ["Refusals and validation failures", "Only perfect output", "Only punctuation", "No error states"], answer: 0, explanation: "Robust boundaries include retry, repair, fallback, and user-facing failure behavior." },
    ],
  ),
  "genai:beginner:Tool calling": lesson(
    "Tool calling connects probabilistic reasoning to real actions. Trusted application code—not the model—must authorize, validate, execute, and audit every consequential operation.",
    [
      { title: "Offer narrow tools", body: "A clear name, description, and constrained parameter schema help the model propose an appropriate call." },
      { title: "Enforce authority", body: "The application checks user permission, arguments, policy, rate limits, and confirmation before execution." },
      { title: "Close the loop", body: "Return bounded tool results to the model, record the trace, and prevent untrusted output from becoming new instructions." },
    ],
    [
      { question: "Who should execute a proposed tool call?", options: ["The model directly", "Trusted application code after validation", "The prompt text", "Any retrieved document"], answer: 1, explanation: "The model proposes; the controlled application remains execution authority." },
      { question: "What improves tool-selection quality?", options: ["Clear descriptions and parameter schemas", "Hidden permissions", "Unbounded arguments", "More decorative text"], answer: 0, explanation: "Precise contracts help the model distinguish when and how each tool applies." },
      { question: "What must precede a consequential tool action?", options: ["Authorization and argument validation", "Higher temperature", "A longer conversation", "JSON alone"], answer: 0, explanation: "Valid structure does not prove permission or policy compliance." },
      { question: "Why keep an audit trace?", options: ["To explain proposed and executed actions and investigate failures", "To increase hallucinations", "To expose secrets", "To bypass consent"], answer: 0, explanation: "A trace supports debugging, accountability, evaluation, and incident response." },
    ],
  ),
};

export function getRoundThreeLessonEnrichment(track: LearningTrackId, pace: string, topic: string) {
  return ROUND_THREE_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}

