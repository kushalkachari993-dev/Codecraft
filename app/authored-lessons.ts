export type LearningTrackId = "python" | "genai" | "sql";

export type AuthoredQuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type LessonEnrichment = {
  whyItMatters: string;
  walkthrough: Array<{ title: string; body: string }>;
  quiz: AuthoredQuizQuestion[];
};

const lesson = (
  whyItMatters: string,
  walkthrough: LessonEnrichment["walkthrough"],
  quiz: LessonEnrichment["quiz"],
): LessonEnrichment => ({ whyItMatters, walkthrough, quiz });

const FIRST_WORLD_LESSONS: Record<string, LessonEnrichment> = {
  "python:beginner:Environment": lesson(
    "A program is only reproducible when you know which interpreter runs it, where it runs, and which files and packages it can see. Environment awareness prevents the classic ‘works on my machine’ failure.",
    [
      { title: "Ask the interpreter", body: "python --version identifies the executable responding to the command. python -c can run a tiny diagnostic without creating a file." },
      { title: "Choose experiment or program", body: "Use the REPL for disposable questions. Put repeatable behavior in a .py file so it can be reviewed, tested, and rerun." },
      { title: "Resolve the path", body: "The terminal’s current directory determines which relative script and data paths Python opens. Confirm it before blaming the code." },
    ],
    [
      { question: "A package installs successfully, but your script still says it is missing. What should you check first?", options: ["Whether the editor theme changed", "Whether pip and python refer to the same interpreter", "Whether the script contains a list", "Whether the terminal is maximized"], answer: 1, explanation: "Packages belong to a particular interpreter environment; pip and python can point to different installations." },
      { question: "When is the Python REPL the better tool?", options: ["For a reusable production service", "For storing a multi-file project", "For testing a small expression immediately", "For pinning dependencies"], answer: 2, explanation: "The REPL is designed for quick, disposable experiments and immediate feedback." },
      { question: "You run python tools/report.py and it cannot find data/input.csv. What is the most likely issue?", options: ["Relative paths begin at the current working directory", "Python cannot read CSV files", "Scripts cannot have folders", "The interpreter only accepts absolute code"], answer: 0, explanation: "Relative paths are normally resolved from the process working directory, not automatically from the script’s folder." },
      { question: "Which command gives the clearest first confirmation of the active Python version?", options: ["python --version", "python install", "script --python", "version.py --run"], answer: 0, explanation: "python --version asks the selected interpreter to report its version." },
    ],
  ),
  "python:beginner:Variables": lesson(
    "Names let programs express changing state without repeating literal values. Clear variable names make later conditions, calculations, and debugging understandable.",
    [
      { title: "Evaluate the right side", body: "Python first calculates the expression to the right of =, such as energy + 3." },
      { title: "Bind the result", body: "The name on the left is then bound to that result. Assignment is an action, not a statement that two things are forever equal." },
      { title: "Read the next state", body: "Later lines see the most recent binding, so energy += 3 is a concise state update." },
    ],
    [
      { question: "After energy = 8 followed by energy += 3, what is energy?", options: ["8", "3", "11", "The text '8 + 3'"], answer: 2, explanation: "The augmented assignment reads the current value, adds 3, and rebinds energy to 11." },
      { question: "Which name best communicates its purpose?", options: ["x", "n1", "remaining_energy", "thing"], answer: 2, explanation: "Descriptive snake_case names communicate meaning at the point of use." },
      { question: "What does total = subtotal + tax do first?", options: ["Deletes subtotal", "Evaluates subtotal + tax", "Makes all three names equal", "Converts the values to strings"], answer: 1, explanation: "Python evaluates the right-hand expression before binding its result to total." },
      { question: "Which statement about Python variables is accurate?", options: ["A name can be rebound to a new value", "Every name has one permanent type", "Names must contain a number", "Assignment always copies an entire object"], answer: 0, explanation: "Python names are bindings and can later refer to a different value." },
    ],
  ),
  "python:beginner:Data types": lesson(
    "Types protect meaning. They determine which operations are valid, how values compare, and whether input from files, forms, and APIs must be converted before use.",
    [
      { title: "Inspect the values", body: "items is an int, price is a float, is_open is a bool, and sector is None. type(value) makes this visible while learning or debugging." },
      { title: "Predict valid operations", body: "Numbers can be added arithmetically; strings concatenate text. The same + symbol behaves according to the operands’ types." },
      { title: "Convert at the boundary", body: "Input often arrives as text. Convert it once with int(), float(), or another deliberate parser before performing domain operations." },
    ],
    [
      { question: "A form supplies age as the string '18'. What should happen before numeric comparison?", options: ["Compare it directly with 18", "Convert it with int() after validating the input", "Wrap 18 in a list", "Replace it with None"], answer: 1, explanation: "External input commonly arrives as text; validated conversion gives the value numeric behavior." },
      { question: "Which value represents the intentional absence of a value?", options: ["0", "False", "''", "None"], answer: 3, explanation: "None is Python’s dedicated singleton for no value or not yet available." },
      { question: "Why does '4' + '2' produce '42'?", options: ["Python guesses incorrectly", "Both operands are strings, so + concatenates them", "Strings are secretly integers", "The result is always 6"], answer: 1, explanation: "The operands’ string type selects concatenation rather than arithmetic addition." },
      { question: "Which statement is a boolean value rather than boolean-looking text?", options: ["'True'", "\"false\"", "True", "'yes'"], answer: 2, explanation: "True without quotes is the bool value; quoted forms are strings." },
    ],
  ),
  "python:beginner:Operators": lesson(
    "Operators turn values into decisions and calculations. Correct grouping matters because a program can run successfully while producing the wrong business result.",
    [
      { title: "Calculate", body: "7 * 3 evaluates before assignment, producing the numeric score 21." },
      { title: "Compare", body: "score >= 20 and score != 25 each produce booleans rather than changing score." },
      { title: "Combine safely", body: "and requires both conditions. Membership with in answers whether a value occurs in a collection; parentheses make mixed rules explicit." },
    ],
    [
      { question: "What does 17 // 5 return?", options: ["3.4", "3", "2", "85"], answer: 1, explanation: "Floor division // returns the whole-number floor of the quotient." },
      { question: "Which expression is true only when power is at least 70 and the relay is online?", options: ["power >= 70 or online", "power > 70", "power >= 70 and online", "not online"], answer: 2, explanation: "and requires both the threshold comparison and online state to be true." },
      { question: "Why add parentheses to a long mixed expression?", options: ["They make the intended grouping explicit", "They convert the result to text", "They disable short-circuiting", "They create a tuple every time"], answer: 0, explanation: "Explicit grouping makes precedence easier to verify and maintain." },
      { question: "What does 'relay' in 'relay station' evaluate to?", options: ["'relay'", "0", "True", "None"], answer: 2, explanation: "The membership operator returns a boolean indicating whether the substring occurs." },
    ],
  ),
  "python:beginner:Strings": lesson(
    "Almost every program handles human-readable data. Reliable string cleaning and formatting keeps names, logs, messages, and imported data consistent.",
    [
      { title: "Create the message", body: "An f-string evaluates the expression inside braces and inserts its formatted value into new text." },
      { title: "Use sequence operations", body: "Indexing reads one character and slicing copies a range. Positions begin at zero." },
      { title: "Keep the returned value", body: "Methods such as strip(), upper(), and replace() create new strings because strings are immutable." },
    ],
    [
      { question: "After name = ' nova ' and name.strip(), what is stored in name?", options: ["'nova'", "' nova '", "None", "An error"], answer: 1, explanation: "strip() returns a new string; without assignment, the original name binding is unchanged." },
      { question: "Which expression produces 'Welcome, Nova!' when name is 'Nova'?", options: ["'Welcome, {name}!'", "f'Welcome, {name}!'", "name[Welcome]", "format + name"], answer: 1, explanation: "The f prefix makes expressions inside braces evaluate and interpolate." },
      { question: "What does 'signal'[1:4] return?", options: ["'sig'", "'ign'", "'gna'", "'ignal'"], answer: 1, explanation: "A slice includes index 1 and stops before index 4, giving characters i, g, n." },
      { question: "Why can’t text[0] = 'S' update a Python string?", options: ["Index zero is invalid", "Strings are immutable", "Only numbers can be indexed", "Text must be in a tuple"], answer: 1, explanation: "Individual characters cannot be replaced in place; create a new string instead." },
    ],
  ),

  "sql:beginner:Database basics": lesson(
    "Applications depend on databases for durable, shared state. Knowing what the DBMS guarantees helps you decide which rules belong in SQL, which belong in application code, and how failures should be handled.",
    [
      { title: "Separate data from manager", body: "The database is the organized data; the DBMS is the service that stores it, coordinates users, checks rules, and recovers after failure." },
      { title: "Model related facts", body: "A relational schema describes tables, columns, keys, and relationships rather than treating all information as one document." },
      { title: "Ask with SQL", body: "A query states the result or state change you want. The DBMS plans how to carry it out while preserving its guarantees." },
    ],
    [
      { question: "Which responsibility belongs to a database management system?", options: ["Choosing the website’s font", "Coordinating concurrent reads and writes", "Drawing application icons", "Compiling Python bytecode"], answer: 1, explanation: "A DBMS manages storage, concurrency, durability, access, and query execution." },
      { question: "What is a schema?", options: ["The structure and rules describing stored data", "A single result row", "A database password", "A browser cache"], answer: 0, explanation: "A schema defines organized database objects such as tables, columns, keys, and constraints." },
      { question: "Why is a database more than a file?", options: ["It always uses the cloud", "It coordinates rules, transactions, access, and recovery", "It contains only numbers", "It cannot be backed up"], answer: 1, explanation: "A database service protects shared state under concurrent use and failures." },
      { question: "What should primarily drive database selection?", options: ["The newest logo", "Popularity alone", "Workload, consistency, scale, and operational needs", "The shortest product name"], answer: 2, explanation: "Technology choice should follow the system’s actual guarantees and workload." },
    ],
  ),
  "sql:beginner:Tables/rows/columns": lesson(
    "Good tables make facts easy to validate and difficult to misunderstand. A focused table reduces duplication and gives every row a clear identity.",
    [
      { title: "Name the subject", body: "relays represents one entity type. The table name should make the meaning of every row obvious." },
      { title: "Define attributes", body: "relay_id, name, and online are columns. Their names and types define what facts each row may record." },
      { title: "Identify occurrences", body: "Each row represents one relay. A primary key distinguishes it from every other row, even when names match." },
    ],
    [
      { question: "In a relays table, what should one row normally represent?", options: ["One relay", "Every table in the database", "One column type", "The SQL language"], answer: 0, explanation: "Rows are individual occurrences of the subject represented by the table." },
      { question: "What does a column define?", options: ["A complete application", "An attribute and its permitted domain", "A backup schedule", "The order rows must be stored"], answer: 1, explanation: "A column names an attribute and its type constrains the values it can hold." },
      { question: "Why should a table have a primary key?", options: ["To color the result", "To uniquely identify each row", "To make every column text", "To avoid all joins"], answer: 1, explanation: "A primary key gives every row a stable, unique identity." },
      { question: "What is a warning sign in table design?", options: ["A focused subject", "Explicit columns", "Repeated facts about unrelated entities", "A meaningful key"], answer: 2, explanation: "Mixing unrelated entities and repeating facts usually signals unclear modeling." },
    ],
  ),
  "sql:beginner:Data types": lesson(
    "Column types are executable documentation and protection. They prevent invalid values, enable correct comparisons, and influence storage and indexing.",
    [
      { title: "Preserve meaning", body: "numeric is suitable for exact measured values; boolean represents two-state facts; timestamptz represents an instant with timezone-aware conversion." },
      { title: "Choose requirements", body: "Range, precision, timezone behavior, and allowed operations matter more than choosing the type you use most often." },
      { title: "Avoid hidden conversion", body: "Comparing unlike types can fail, lose precision, or prevent indexes from helping. Store domain values in their native type." },
    ],
    [
      { question: "Which type best represents whether a relay is valid?", options: ["text", "boolean", "numeric", "timestamp"], answer: 1, explanation: "A two-state true/false fact is represented directly by boolean." },
      { question: "Why is storing dates as arbitrary text risky?", options: ["Text cannot be stored", "Validation, ordering, and date operations become unreliable", "Dates never need indexes", "Text automatically changes timezone"], answer: 1, explanation: "A date/time type validates values and supplies chronological operations and ordering." },
      { question: "What should determine numeric precision?", options: ["The column name length", "The domain’s range and accuracy requirements", "The number of tables", "The UI color palette"], answer: 1, explanation: "The real-world domain determines acceptable range, scale, and precision." },
      { question: "What can an implicit conversion harm?", options: ["Only comments", "Correctness and index use", "Table names", "User passwords only"], answer: 1, explanation: "Implicit casts can change comparison behavior and make indexed columns unusable for efficient lookup." },
    ],
  ),
  "sql:beginner:CRUD": lesson(
    "Nearly every product action becomes a data read or write. Precise CRUD statements protect users from broad accidental changes and give applications a way to confirm outcomes.",
    [
      { title: "Create and read", body: "INSERT adds an intended row; SELECT retrieves a deliberate result shape to confirm or display it." },
      { title: "Update precisely", body: "UPDATE changes existing rows. A narrow WHERE predicate determines exactly which records may change." },
      { title: "Delete deliberately", body: "DELETE removes matching rows. Preview the predicate and consider relationships, authorization, and transactions first." },
    ],
    [
      { question: "Which statement modifies existing rows?", options: ["SELECT", "UPDATE", "CREATE DATABASE", "ORDER BY"], answer: 1, explanation: "UPDATE changes column values on rows selected by its predicate." },
      { question: "What is the main danger of DELETE FROM relays;?", options: ["It returns too many columns", "It can delete every row", "It creates a duplicate table", "It sorts rows"], answer: 1, explanation: "Without a WHERE clause, DELETE targets all rows the user is authorized to remove." },
      { question: "How should an application confirm a write?", options: ["Assume success", "Return or query the affected identity and state", "Change the page background", "Run SELECT * on every table"], answer: 1, explanation: "Returning or reading the affected data provides an explicit, inspectable outcome." },
      { question: "CRUD by itself does not define which concern?", options: ["Create/read/update/delete operations", "Authorization and transaction policy", "Data modification", "Data retrieval"], answer: 1, explanation: "CRUD names operations; security, concurrency, and transaction guarantees require additional design." },
    ],
  ),
  "sql:beginner:SELECT": lesson(
    "SELECT defines the data contract returned to an application. Explicit projections keep that contract understandable and stable as schemas evolve.",
    [
      { title: "Choose the source", body: "FROM relays identifies the relation supplying candidate rows." },
      { title: "Shape each row", body: "The select list chooses columns and expressions. power * efficiency calculates a value for each candidate row." },
      { title: "Name derived values", body: "AS output gives the calculated expression a stable name that callers and result tables can understand." },
    ],
    [
      { question: "Which clause controls the columns and expressions in the result?", options: ["SELECT list", "COMMIT", "DELETE", "CREATE INDEX"], answer: 0, explanation: "The expressions following SELECT define each result row’s shape." },
      { question: "Why alias power * efficiency AS output?", options: ["To delete the original columns", "To give the calculated value a useful result name", "To make it a primary key", "To hide all rows"], answer: 1, explanation: "An alias creates a readable column label for a derived expression." },
      { question: "Why prefer explicit columns over SELECT * in application code?", options: ["Explicit columns form a clearer, more stable contract", "SELECT * cannot return rows", "Explicit columns bypass permissions", "SELECT * always deletes data"], answer: 0, explanation: "Explicit projections avoid accidental dependencies on column order or newly added fields." },
      { question: "What does FROM identify?", options: ["The result alias only", "The source relation or relations", "A password", "The transaction log"], answer: 1, explanation: "FROM identifies the tables, views, or derived relations supplying data to the query." },
    ],
  ),

  "genai:beginner:AI/ML basics": lesson(
    "Choosing the simplest reliable method saves data, compute, money, and risk. Not every automation needs a learned model, and not every learned model needs a generative interface.",
    [
      { title: "Name the capability", body: "AI is the broad product behavior: for example, routing a support request to the right team." },
      { title: "Choose the method", body: "A deterministic rule may solve a stable case. Machine learning becomes useful when patterns must be learned from representative examples." },
      { title: "Measure the system", body: "Compare the model and complete workflow against a baseline using task-relevant quality, cost, latency, and safety measures." },
    ],
    [
      { question: "Which statement best describes machine learning?", options: ["Every if statement", "A method that learns useful patterns from data", "A database backup", "A user-interface framework"], answer: 1, explanation: "Machine learning is one approach within AI that fits patterns or behavior from data." },
      { question: "A fixed tax rule is completely specified and rarely changes. What should you try first?", options: ["A large generative model", "A deterministic implementation", "Unlabeled model training", "Image generation"], answer: 1, explanation: "A clear deterministic rule is usually cheaper, easier to test, and more reliable for this case." },
      { question: "Why compare a model with a baseline?", options: ["To prove every model is better", "To measure whether added complexity creates real value", "To avoid collecting metrics", "To increase token count"], answer: 1, explanation: "A baseline reveals whether the learned system improves the outcome enough to justify its cost and risk." },
      { question: "Where does a model fit in a product?", options: ["It is always the entire product", "It is one component connected to data, rules, evaluation, and user experience", "It replaces all software", "It removes the need for monitoring"], answer: 1, explanation: "Useful AI products surround the model with data pipelines, controls, evaluation, and product logic." },
    ],
  ),
  "genai:beginner:Neural network basics": lesson(
    "Neural-network vocabulary makes model behavior less mysterious. It helps you distinguish training from inference and reason about why data and objectives matter.",
    [
      { title: "Forward pass", body: "Inputs move through weighted layers and activations to produce a prediction." },
      { title: "Measure error", body: "A loss function converts the difference between prediction and target into a training signal." },
      { title: "Adjust parameters", body: "Gradients indicate how parameter changes would affect loss; an optimizer applies small updates across many examples." },
    ],
    [
      { question: "What happens during inference?", options: ["The model primarily uses learned parameters to produce outputs", "Every parameter is deleted", "Training data is automatically corrected", "The network becomes a database"], answer: 0, explanation: "Inference runs the learned transformations; training is the process that adjusts their parameters." },
      { question: "What does a loss function provide during training?", options: ["A UI layout", "A measure of prediction error", "A network connection", "A token dictionary only"], answer: 1, explanation: "Loss summarizes how poorly predictions satisfy the training objective." },
      { question: "What do gradients describe?", options: ["How parameter changes affect loss", "Which user owns a file", "How to tokenize SQL", "The model’s product price"], answer: 0, explanation: "Gradients supply direction and sensitivity information used by an optimizer." },
      { question: "Why doesn’t a larger network guarantee a better system?", options: ["Parameters cannot learn", "Data, objective, evaluation, and deployment constraints still determine usefulness", "Large models produce no output", "Only one-layer networks work"], answer: 1, explanation: "Capacity alone cannot fix poor data, an unsuitable objective, weak evaluation, or system constraints." },
    ],
  ),
  "genai:beginner:NLP basics": lesson(
    "Language is ambiguous and context-dependent. Defining the exact NLP task and evaluation method prevents fluent-looking outputs from being mistaken for correct ones.",
    [
      { title: "Define the task", body: "Classification, extraction, retrieval, translation, summarization, and generation require different output contracts." },
      { title: "Represent language", body: "Text must become numerical tokens or features before a statistical model can process it." },
      { title: "Evaluate real variation", body: "Test domain vocabulary, dialects, ambiguity, rare cases, and changes over time—not only clean benchmark examples." },
    ],
    [
      { question: "Which task should return named fields found in a document?", options: ["Information extraction", "Image resizing", "Database vacuum", "Audio playback"], answer: 0, explanation: "Extraction maps relevant spans or meanings into a defined set of fields." },
      { question: "Why must text be represented numerically?", options: ["Models operate on numerical representations", "Words are invalid data", "It makes every answer correct", "It removes ambiguity completely"], answer: 0, explanation: "Model operations are mathematical, so language is encoded into numerical representations." },
      { question: "Why is fluent generated text not sufficient evidence of correctness?", options: ["Fluency measures style, not factual support", "Fluent text cannot contain verbs", "Correct text is always short", "Generation never uses context"], answer: 0, explanation: "A model can generate plausible language that is unsupported or wrong; correctness needs task-specific evidence and checks." },
      { question: "What should evaluation data reflect?", options: ["Only one easy demo", "Real users, domains, language variation, and important failure cases", "Only training examples", "The model name"], answer: 1, explanation: "Representative evaluation reveals behavior under the conditions the product will actually face." },
    ],
  ),
  "genai:beginner:Transformers": lesson(
    "Transformers underpin modern language models. A correct high-level model of attention and position helps you understand context limits, architecture choices, and later retrieval lessons.",
    [
      { title: "Represent tokens", body: "Each token starts as a vector. Position information is added so order can influence the computation." },
      { title: "Route context", body: "Attention calculates content-dependent weights, allowing each token representation to combine relevant information from other allowed positions." },
      { title: "Transform and repeat", body: "Feed-forward transformations and repeated layers refine the contextual representations used for understanding or generation." },
    ],
    [
      { question: "What problem does positional information address?", options: ["Attention alone does not encode token order", "Models cannot use numbers", "Tokens cannot have vectors", "It encrypts the prompt"], answer: 0, explanation: "Position signals let the architecture distinguish different token orders." },
      { question: "Does attention make every token use every other token equally?", options: ["Yes, always", "No, learned content-dependent weights determine influence", "Only during SQL queries", "Only for the first token"], answer: 1, explanation: "Attention weights vary with the query, key, mask, layer, and input content." },
      { question: "Which architecture is naturally suited to autoregressive text generation?", options: ["Decoder-style transformer", "A static CSS file", "A relational constraint", "A lossless image codec"], answer: 0, explanation: "Decoder-style transformers use causal masking to predict continuations token by token." },
      { question: "What does an attention mask control?", options: ["Which token relationships are allowed", "The price of an API", "The color of embeddings", "Database permissions"], answer: 0, explanation: "Masks prevent attention to padding or future positions, depending on the architecture and task." },
    ],
  ),
  "genai:beginner:LLM fundamentals": lesson(
    "Understanding next-token generation prevents the dangerous assumption that an LLM is a truth database. It clarifies why prompting, grounding, evaluation, and guardrails are necessary.",
    [
      { title: "Learn distributions", body: "Pretraining adjusts parameters so the model predicts token continuations across large collections of text and code." },
      { title: "Shape interaction", body: "Instruction tuning and preference optimization influence how the pretrained capability responds to requests." },
      { title: "Generate probabilistically", body: "At inference time the model produces a distribution over possible next tokens and a decoding strategy selects a continuation." },
    ],
    [
      { question: "What is the core pretraining objective of many LLMs?", options: ["Predict likely token continuations", "Store every webpage as a row", "Execute arbitrary tools", "Guarantee factual truth"], answer: 0, explanation: "Many LLMs are pretrained by learning to predict tokens from surrounding or preceding context." },
      { question: "Why can two generations from the same prompt differ?", options: ["Decoding may sample from probability distributions", "The alphabet changes", "The prompt is deleted", "The model becomes a SQL table"], answer: 0, explanation: "Sampling and generation parameters can choose different valid continuations from the predicted distribution." },
      { question: "Why isn’t an LLM equivalent to a database?", options: ["It represents patterns in parameters and can generate unsupported claims", "It cannot produce text", "Databases use no storage", "LLMs always cite sources"], answer: 0, explanation: "Model parameters encode statistical patterns rather than authoritative, directly queryable records." },
      { question: "What does instruction tuning primarily change?", options: ["How the model follows task and conversation instructions", "The user’s internet speed", "A database primary key", "The model’s context into an image"], answer: 0, explanation: "Instruction-oriented training shapes a pretrained model toward useful request-response behavior." },
    ],
  ),
};

export function getLessonEnrichment(track: LearningTrackId, pace: string, topic: string) {
  return FIRST_WORLD_LESSONS[`${track}:${pace}:${topic}`] ?? null;
}

