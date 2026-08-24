import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { ChallengeRuntimeSpec } from "./execution/types";
import { buildRoundTwoPythonChallenge, buildRoundTwoSQLChallenge } from "./round2-challenges";
import { buildRoundThreePythonChallenge, buildRoundThreeSQLChallenge } from "./round3-challenges";
import { buildRoundFourPythonChallenge, buildRoundFourSQLChallenge } from "./round4-challenges";
import { buildRoundFivePythonChallenge, buildRoundFiveSQLChallenge } from "./round5-challenges";
import { buildRoundSixPythonChallenge, buildRoundSixSQLChallenge } from "./round6-challenges";
import { buildRoundSevenPythonChallenge, buildRoundSevenSQLChallenge } from "./round7-challenges";
import { buildRoundEightPythonChallenge, buildRoundEightSQLChallenge } from "./round8-challenges";
import { buildRoundNinePythonChallenge, buildRoundNineSQLChallenge } from "./round9-challenges";
import { buildRoundTenPythonChallenge, buildRoundTenSQLChallenge } from "./round10-challenges";
import { buildRoundElevenPythonChallenge, buildRoundElevenSQLChallenge } from "./round11-challenges";
import { buildRoundTwelvePythonChallenge, buildRoundTwelveSQLChallenge } from "./round12-challenges";
import { buildRoundThirteenPythonChallenge, buildRoundThirteenSQLChallenge } from "./round13-challenges";
import { buildRoundFourteenPythonChallenge, buildRoundFourteenSQLChallenge } from "./round14-challenges";
import { buildRoundFifteenPythonChallenge, buildRoundFifteenSQLChallenge } from "./round15-challenges";
import { buildRoundSixteenPythonChallenge, buildRoundSixteenSQLChallenge } from "./round16-challenges";
import { buildRoundSeventeenPythonChallenge, buildRoundSeventeenSQLChallenge } from "./round17-challenges";

export type TopicChallenge = {
  title: string;
  instructions: string;
  starterCode: string;
  visibleExamples: Array<{ label: string; input: string; output: string }>;
  dataPreview?: string[];
  runtime: ChallengeRuntimeSpec;
};

type ChallengeOptions = { required?: boolean; worldName?: string };

const PYTHON_CONSTRUCTS: Array<{ pattern: RegExp; source: string; label: string; hint: string }> = [
  { pattern: /oop|object model|dataclass|design pattern/i, source: "\\bclass\\s+", label: "Uses an object", hint: "Define a class and use an instance inside solve()." },
  { pattern: /dunder/i, source: "__\\w+__", label: "Implements a dunder method", hint: "Add the dunder method that expresses the requested behavior." },
  { pattern: /descriptor/i, source: "__(get|set|delete)__", label: "Implements descriptor protocol", hint: "Use __get__ or __set__ in a descriptor class." },
  { pattern: /metaclass/i, source: "metaclass\\s*=", label: "Uses a metaclass", hint: "Declare a class with an explicit metaclass." },
  { pattern: /comprehension/i, source: "[\\[{].*\\bfor\\b.*\\bin\\b", label: "Uses a comprehension", hint: "Build the result with a list, set, or dictionary comprehension." },
  { pattern: /lambda/i, source: "\\blambda\\b", label: "Uses a lambda", hint: "Use a small lambda where a callable is required." },
  { pattern: /iterator/i, source: "(__iter__|\\biter\\s*\\()", label: "Uses the iterator protocol", hint: "Use iter() or implement __iter__." },
  { pattern: /generator/i, source: "\\byield\\b", label: "Produces values lazily", hint: "Yield values instead of building the entire result eagerly." },
  { pattern: /decorator/i, source: "(^|\\n)\\s*@", label: "Applies a decorator", hint: "Define or apply a decorator with @ syntax." },
  { pattern: /closure/i, source: "\\b(nonlocal|def\\s+\\w+.*\\n\\s+def)\\b", label: "Creates a closure", hint: "Return an inner function that remembers an enclosing value." },
  { pattern: /context manager/i, source: "\\bwith\\s+", label: "Uses a context manager", hint: "Use a with block so cleanup is guaranteed." },
  { pattern: /type hint|advanced typing/i, source: "(->|:\\s*(str|int|float|bool|list|dict|tuple|set|Optional|Protocol|TypeVar))", label: "Adds type information", hint: "Annotate parameters and the return value." },
  { pattern: /exception/i, source: "\\b(try|raise)\\b", label: "Handles an exceptional path", hint: "Use try/except or raise a meaningful exception." },
  { pattern: /json/i, source: "\\bjson\\.(loads|dumps|load|dump)", label: "Uses JSON serialization", hint: "Parse or serialize data with the json module." },
  { pattern: /file/i, source: "\\bopen\\s*\\(", label: "Works with a file", hint: "Use open() inside a with block." },
  { pattern: /testing/i, source: "\\bassert\\b", label: "Includes an assertion", hint: "Add an assert that captures the important invariant." },
  { pattern: /logging/i, source: "\\blogging\\.", label: "Emits a structured log", hint: "Use Python's logging module instead of print-only diagnostics." },
  { pattern: /asyncio|async/i, source: "\\basync\\s+def\\b", label: "Defines asynchronous work", hint: "Create an async function and await its operation." },
  { pattern: /thread/i, source: "\\b(threading|ThreadPoolExecutor)\\b", label: "Uses a threading primitive", hint: "Use a threading or executor primitive appropriate for the task." },
  { pattern: /multiprocessing/i, source: "\\b(multiprocessing|ProcessPoolExecutor)\\b", label: "Uses process-based parallelism", hint: "Use multiprocessing or ProcessPoolExecutor." },
  { pattern: /sql|postgres/i, source: "\\b(SELECT|INSERT|UPDATE|DELETE|CREATE)\\b", label: "Builds a SQL operation", hint: "Include a parameterized SQL statement in the solution." },
  { pattern: /string/i, source: "\\.(strip|lower|upper|replace|split|join)\\s*\\(", label: "Transforms text", hint: "Use a string method to normalize the relay label." },
  { pattern: /list/i, source: "(\\[.*\\]|\\.append\\s*\\()", label: "Builds a list", hint: "Collect the processed values in a list." },
  { pattern: /tuple/i, source: "\\([^\\n]*,[^\\n]*\\)", label: "Uses an immutable tuple", hint: "Represent the fixed coordinate as a tuple." },
  { pattern: /set|hash/i, source: "(\\bset\\s*\\(|\\{[^:]+\\})", label: "Uses unique hashed values", hint: "Use a set to remove duplicates or test membership." },
  { pattern: /dictionar/i, source: "\\{[^}]*:", label: "Builds a dictionary", hint: "Use key/value data for the relay lookup." },
  { pattern: /condition/i, source: "\\bif\\b", label: "Branches on a condition", hint: "Use if/elif/else to classify the input." },
  { pattern: /loop|iteration/i, source: "\\b(for|while)\\b", label: "Iterates deliberately", hint: "Use a loop to process every input value." },
  { pattern: /function|scope|recursion/i, source: "\\bdef\\s+", label: "Defines reusable behavior", hint: "Put the solution in a function instead of only top-level statements." },
  { pattern: /module|environment|virtual|dependency|package/i, source: "(^|\\n)\\s*(from|import)\\s+", label: "Imports a module", hint: "Import a standard-library module relevant to the task." },
  { pattern: /variable/i, source: "\\brelay_(name|power)\\s*=", label: "Creates descriptive variables", hint: "Create relay_name or relay_power and use it in the returned result." },
  { pattern: /data type/i, source: "\\b(isinstance|type)\\s*\\(", label: "Inspects a value's type", hint: "Use isinstance() or type() to make the type decision explicit." },
  { pattern: /operator/i, source: "[+*%]|//|\\*\\*", label: "Uses a Python operator", hint: "Calculate the returned value with an arithmetic or comparison operator." },
  { pattern: /git/i, source: "['\"]git\\s+", label: "Builds a Git command", hint: "Return a safe Git command string for the requested workflow." },
  { pattern: /docker/i, source: "['\"](FROM|docker)", label: "Builds a container instruction", hint: "Represent the Docker instruction or command as returned text." },
  { pattern: /security/i, source: "\\b(validate|sanitize|permission|allowed)\\b", label: "Applies a security check", hint: "Validate or authorize the input before returning it." },
  { pattern: /cache|queue|cloud|observability|architecture|distributed|package design|specialization/i, source: "\\{[^}]*:", label: "Returns a structured system plan", hint: "Return a dictionary describing the components and one important tradeoff." },
];

function buildAuthoredPythonChallenge(topic: PythonTopic): TopicChallenge | null {
  if (topic.title === "Environment") return {
    title: "Interpreter diagnostic mission",
    instructions: "Build environment_report() using Python's sys and platform modules. Return the implementation name, a two-number version tuple, and the platform name so another developer can reproduce the runtime.",
    starterCode: "import platform\nimport sys\n\ndef environment_report():\n    # TODO: inspect this interpreter instead of hard-coding values.\n    return {\n        \"implementation\": None,\n        \"version\": None,\n        \"platform\": None,\n    }\n\nprint(environment_report())\n",
    visibleExamples: [
      { label: "REQUIRED SHAPE", input: "environment_report()", output: "{'implementation': <name>, 'version': (<major>, <minor>), 'platform': <name>}" },
      { label: "RUNTIME RULE", input: "The active browser interpreter", output: "Values are inspected at runtime, never hard-coded" },
    ],
    runtime: {
      minimumCodeLength: 100,
      requiredPatterns: [
        { pattern: "(^|\\n)\\s*import\\s+sys", flags: "im", name: "Uses sys", hint: "Import sys and read sys.version_info." },
        { pattern: "(^|\\n)\\s*import\\s+platform", flags: "im", name: "Uses platform", hint: "Import platform and call platform.python_implementation() and platform.system()." },
      ],
      pythonTests: [
        { name: "Diagnostic function exists", code: "assert callable(globals().get('environment_report'))", hint: "Keep environment_report() exactly as named." },
        { name: "Reports the active interpreter", code: "report = environment_report(); assert report['implementation'] == platform.python_implementation() and report['version'] == (sys.version_info.major, sys.version_info.minor)", hint: "Read values from platform and sys rather than typing fixed values." },
        { name: "Reports the active platform", code: "report = environment_report(); assert report['platform'] == platform.system() and all(report.values())", hint: "Use platform.system() and return all three required fields." },
      ],
    },
  };

  if (topic.title === "Variables") return {
    title: "Energy state mission",
    instructions: "Complete update_energy(start, collected, spent). Use descriptive variables to add collected cells, subtract spent cells, and return the remaining energy without hard-coded answers.",
    starterCode: "def update_energy(start, collected, spent):\n    # TODO: calculate the state in two readable steps.\n    energy_after_collection = None\n    remaining_energy = None\n    return remaining_energy\n\nprint(update_energy(10, 5, 3))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "update_energy(10, 5, 3)", output: "12" },
      { label: "EDGE CASE", input: "update_energy(4, 0, 4)", output: "0" },
    ],
    runtime: {
      minimumCodeLength: 80,
      requiredPatterns: [{ pattern: "\\b(energy_after_collection|remaining_energy)\\s*=", flags: "im", name: "Uses descriptive state names", hint: "Calculate with energy_after_collection and remaining_energy." }],
      pythonTests: [
        { name: "Update function exists", code: "assert callable(globals().get('update_energy'))", hint: "Keep update_energy(start, collected, spent)." },
        { name: "Calculates the visible state", code: "assert update_energy(10, 5, 3) == 12", hint: "Add collected first, then subtract spent." },
        { name: "Handles zero remaining", code: "assert update_energy(4, 0, 4) == 0", hint: "Return the calculation rather than a truthiness shortcut." },
        { name: "Uses every input", code: "assert update_energy(20, 2, 7) == 15 and update_energy(1, 9, 0) == 10", hint: "Derive the result from all three parameters." },
      ],
    },
  };

  if (topic.title === "Data types") return {
    title: "Telemetry normalization mission",
    instructions: "Complete normalize_relay(raw). Convert id to int, power to float, and the case-insensitive text 'true' to a real bool. Return a new dictionary with exactly id, power, and online.",
    starterCode: "def normalize_relay(raw):\n    # External data arrives as strings. Convert it once at the boundary.\n    return {\n        \"id\": None,\n        \"power\": None,\n        \"online\": None,\n    }\n\nsample = {\"id\": \"7\", \"power\": \"82.5\", \"online\": \"TRUE\"}\nprint(normalize_relay(sample))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "{'id': '7', 'power': '82.5', 'online': 'TRUE'}", output: "{'id': 7, 'power': 82.5, 'online': True}" },
      { label: "SECOND CASE", input: "{'id': '3', 'power': '0', 'online': 'false'}", output: "{'id': 3, 'power': 0.0, 'online': False}" },
    ],
    runtime: {
      minimumCodeLength: 90,
      requiredPatterns: [{ pattern: "\\b(int|float)\\s*\\(", flags: "im", name: "Converts boundary values", hint: "Use int() and float() for their corresponding fields." }],
      pythonTests: [
        { name: "Normalizer exists", code: "assert callable(globals().get('normalize_relay'))", hint: "Keep normalize_relay(raw)." },
        { name: "Converts every visible field", code: "assert normalize_relay({'id': '7', 'power': '82.5', 'online': 'TRUE'}) == {'id': 7, 'power': 82.5, 'online': True}", hint: "Convert the two numeric strings and compare normalized online text with 'true'." },
        { name: "Handles a false value", code: "assert normalize_relay({'id': '3', 'power': '0', 'online': 'false'}) == {'id': 3, 'power': 0.0, 'online': False}", hint: "Do not use bool(raw['online']); any non-empty string would become True." },
        { name: "Returns real Python types", code: "r = normalize_relay({'id': '9', 'power': '71.25', 'online': 'true'}); assert type(r['id']) is int and type(r['power']) is float and type(r['online']) is bool", hint: "Return int, float, and bool values—not strings that look like them." },
      ],
    },
  };

  if (topic.title === "Operators") return {
    title: "Relay readiness mission",
    instructions: "Complete is_relay_ready(power, online, sector). A relay is ready only when it is online, power is at least 70, and sector is either north or east. Return a boolean.",
    starterCode: "def is_relay_ready(power, online, sector):\n    allowed_sectors = {\"north\", \"east\"}\n    # TODO: combine all three rules in one clear boolean expression.\n    return None\n\nprint(is_relay_ready(82, True, \"north\"))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "is_relay_ready(82, True, 'north')", output: "True" },
      { label: "BOUNDARY", input: "is_relay_ready(70, True, 'east')", output: "True" },
    ],
    runtime: {
      minimumCodeLength: 70,
      requiredPatterns: [{ pattern: "\\band\\b.*\\bin\\b", flags: "ims", name: "Combines comparison and membership", hint: "Use and to require every rule, and in to check allowed_sectors." }],
      pythonTests: [
        { name: "Readiness function exists", code: "assert callable(globals().get('is_relay_ready'))", hint: "Keep is_relay_ready(power, online, sector)." },
        { name: "Accepts a ready relay", code: "assert is_relay_ready(82, True, 'north') is True and is_relay_ready(70, True, 'east') is True", hint: "The threshold includes exactly 70 and both allowed sectors." },
        { name: "Rejects every failed rule", code: "assert is_relay_ready(69, True, 'north') is False and is_relay_ready(99, False, 'north') is False and is_relay_ready(99, True, 'south') is False", hint: "All three requirements must be true, so combine them with and." },
      ],
    },
  };

  if (topic.title === "Strings") return {
    title: "Callsign formatter mission",
    instructions: "Complete format_callsign(name, sector). Remove outer whitespace, title-case the explorer name, uppercase the sector, and join them with a hyphen using an f-string.",
    starterCode: "def format_callsign(name, sector):\n    clean_name = None\n    clean_sector = None\n    # TODO: return NAME-SECTOR in the requested casing.\n    return None\n\nprint(format_callsign(\"  nova ray  \", \" north \"))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "format_callsign('  nova ray  ', ' north ')", output: "Nova Ray-NORTH" },
      { label: "SECOND CASE", input: "format_callsign('mira', 'east')", output: "Mira-EAST" },
    ],
    runtime: {
      minimumCodeLength: 75,
      requiredPatterns: [
        { pattern: "\\.(strip|title|upper)\\s*\\(", flags: "im", name: "Normalizes text", hint: "Use strip(), title(), and upper() on the appropriate values." },
        { pattern: "f['\"]", flags: "im", name: "Formats with an f-string", hint: "Return the two cleaned values with an f-string." },
      ],
      pythonTests: [
        { name: "Formatter exists", code: "assert callable(globals().get('format_callsign'))", hint: "Keep format_callsign(name, sector)." },
        { name: "Cleans the visible case", code: "assert format_callsign('  nova ray  ', ' north ') == 'Nova Ray-NORTH'", hint: "Strip both inputs, title-case the name, uppercase the sector, and add one hyphen." },
        { name: "Uses both inputs", code: "assert format_callsign('mira', 'east') == 'Mira-EAST' and format_callsign('  kiro', 'south  ') == 'Kiro-SOUTH'", hint: "Do not hard-code the visible example." },
      ],
    },
  };

  return null;
}

export function buildPythonChallenge(topic: PythonTopic, options: ChallengeOptions = {}): TopicChallenge {
  const roundTwoChallenge = buildRoundTwoPythonChallenge(topic, options);
  if (roundTwoChallenge) return roundTwoChallenge;
  const roundThreeChallenge = buildRoundThreePythonChallenge(topic, options);
  if (roundThreeChallenge) return roundThreeChallenge;
  const roundFourChallenge = buildRoundFourPythonChallenge(topic, options);
  if (roundFourChallenge) return roundFourChallenge;
  const roundFiveChallenge = buildRoundFivePythonChallenge(topic, options);
  if (roundFiveChallenge) return roundFiveChallenge;
  const roundSixChallenge = buildRoundSixPythonChallenge(topic, options);
  if (roundSixChallenge) return roundSixChallenge;
  const roundSevenChallenge = buildRoundSevenPythonChallenge(topic, options);
  if (roundSevenChallenge) return roundSevenChallenge;
  const roundEightChallenge = buildRoundEightPythonChallenge(topic, options);
  if (roundEightChallenge) return roundEightChallenge;
  const roundNineChallenge = buildRoundNinePythonChallenge(topic, options);
  if (roundNineChallenge) return roundNineChallenge;
  const roundTenChallenge = buildRoundTenPythonChallenge(topic, options);
  if (roundTenChallenge) return roundTenChallenge;
  const roundElevenChallenge = buildRoundElevenPythonChallenge(topic, options);
  if (roundElevenChallenge) return roundElevenChallenge;
  const roundTwelveChallenge = buildRoundTwelvePythonChallenge(topic, options);
  if (roundTwelveChallenge) return roundTwelveChallenge;
  const roundThirteenChallenge = buildRoundThirteenPythonChallenge(topic, options);
  if (roundThirteenChallenge) return roundThirteenChallenge;
  const roundFourteenChallenge = buildRoundFourteenPythonChallenge(topic, options);
  if (roundFourteenChallenge) return roundFourteenChallenge;
  const roundFifteenChallenge = buildRoundFifteenPythonChallenge(topic, options);
  if (roundFifteenChallenge) return roundFifteenChallenge;
  const roundSixteenChallenge = buildRoundSixteenPythonChallenge(topic, options);
  if (roundSixteenChallenge) return roundSixteenChallenge;
  const roundSeventeenChallenge = buildRoundSeventeenPythonChallenge(topic, options);
  if (roundSeventeenChallenge) return roundSeventeenChallenge;
  if (options.required) {
    const worldName = options.worldName ?? "CodeCraft world";
    return {
      title: worldName + " Python project",
      instructions: "Build a reusable relay report that accepts a list of power readings and returns a dictionary with total, active, and status. Active readings are values greater than or equal to 70. An empty list must return zero counts and an offline status. This required project gates the next world.",
      starterCode: [
        "# " + worldName + " applied project",
        "def stabilize_world(readings):",
        "    # TODO: calculate total readings and the active count.",
        "    # Return {'total': ..., 'active': ..., 'status': 'online' or 'offline'}.",
        "    return None",
        "",
        "print(stabilize_world([96, 82, 44]))",
        "",
      ].join("\n"),
      visibleExamples: [
        { label: "VISIBLE EXAMPLE", input: "[96, 82, 44]", output: "{'total': 3, 'active': 2, 'status': 'online'}" },
        { label: "EDGE CASE", input: "[]", output: "{'total': 0, 'active': 0, 'status': 'offline'}" },
      ],
      runtime: {
        minimumCodeLength: 90,
        requiredPatterns: [
          { pattern: "\\bdef\\s+stabilize_world\\s*\\(", flags: "im", name: "Defines the project function", hint: "Define stabilize_world(readings) exactly as shown." },
          { pattern: "\\breturn\\s+\\{", flags: "im", name: "Returns a structured report", hint: "Return a dictionary containing total, active, and status; the hidden tests verify every key." },
        ],
        pythonTests: [
          { name: "Project function exists", code: "assert callable(globals().get('stabilize_world'))", hint: "Keep the required stabilize_world(readings) function." },
          { name: "Calculates the visible case", code: "assert stabilize_world([96, 82, 44]) == {'total': 3, 'active': 2, 'status': 'online'}", hint: "Count readings >= 70 as active and return the exact report keys." },
          { name: "Handles the empty edge case", code: "assert stabilize_world([]) == {'total': 0, 'active': 0, 'status': 'offline'}", hint: "Treat an empty readings list as an offline world with zero counts." },
          { name: "Uses its input instead of constants", code: "assert stabilize_world([70, 69, 100]) == {'total': 3, 'active': 2, 'status': 'online'} and stabilize_world([1]) == {'total': 1, 'active': 0, 'status': 'offline'}", hint: "Derive every field from the readings argument; do not hard-code the example." },
        ],
      },
    };
  }
  const authoredChallenge = buildAuthoredPythonChallenge(topic);
  if (authoredChallenge) return authoredChallenge;
  const construct = PYTHON_CONSTRUCTS.find((item) => item.pattern.test(topic.title)) ?? {
    source: "\\bdef\\s+solve_relay\\s*\\(",
    label: "Defines solve_relay",
    hint: "Keep the solution inside solve_relay(data).",
  };
  const safeTitle = topic.title.replace(/[^a-z0-9]+/gi, " ").trim().toLowerCase();
  const starterCode = [
    "# " + topic.title + " challenge",
    "# Complete solve_relay so it demonstrates " + safeTitle + ".",
    "def solve_relay(data):",
    "    # TODO: transform or inspect data using this topic.",
    "    return None",
    "",
    "sample = [96, 82, 44]",
    "print(solve_relay(sample))",
    "",
  ].join("\n");

  return {
    title: topic.title + " coding mission",
    instructions: topic.learningGoal + " Your solution must expose solve_relay(data), return a meaningful non-None result, and demonstrate the topic's key construct.",
    starterCode,
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "data = [96, 82, 44]", output: "A non-empty result that demonstrates " + topic.title },
      { label: "EDGE CASE", input: "data = []", output: "A deliberate empty-input result or handled exception" },
    ],
    runtime: {
      minimumCodeLength: 25,
      requiredPatterns: [{ pattern: construct.source, flags: "im", name: construct.label, hint: construct.hint }],
      pythonTests: [
        { name: "Public function exists", code: "assert callable(globals().get('solve_relay'))", hint: "Define solve_relay(data) exactly as shown in the starter." },
        { name: "Returns a meaningful result", code: "assert solve_relay([96, 82, 44]) is not None", hint: "Return the computed result instead of leaving the placeholder None." },
        { name: "Handles a second input", code: "assert solve_relay([12, 73]) is not None", hint: "Use the data argument instead of returning the starter placeholder." },
      ],
    },
  };
}

const SQL_BASE_SETUP = `
CREATE TABLE challenge_notes (note_id bigint PRIMARY KEY, topic text NOT NULL, priority integer NOT NULL);
INSERT INTO challenge_notes VALUES (1, '__TOPIC__', 3), (2, '__TOPIC__', 1), (3, '__TOPIC__', 2);
`;

function sqlPatternFor(title: string) {
  const patterns: Array<{ match: RegExp; pattern: string; name: string; hint: string }> = [
    { match: /recursive CTE/i, pattern: "\\bWITH\\s+RECURSIVE\\b", name: "Uses recursion in SQL", hint: "Start the query with WITH RECURSIVE." },
    { match: /CTEs/i, pattern: "\\bWITH\\b", name: "Uses a CTE", hint: "Break the query into a named WITH stage." },
    { match: /window/i, pattern: "\\bOVER\\s*\\(", name: "Uses a window function", hint: "Add OVER (...) to an analytical function." },
    { match: /JOIN/i, pattern: "\\bJOIN\\b", name: "Joins related tables", hint: "Join relays to sectors using sector_id." },
    { match: /subquer/i, pattern: "\\(\\s*SELECT\\b", name: "Uses a subquery", hint: "Place a SELECT inside the outer statement." },
    { match: /set operation/i, pattern: "\\b(UNION|INTERSECT|EXCEPT)\\b", name: "Uses a set operation", hint: "Combine compatible results with UNION, INTERSECT, or EXCEPT." },
    { match: /materialized view/i, pattern: "\\bCREATE\\s+MATERIALIZED\\s+VIEW\\b", name: "Creates a materialized view", hint: "Create a materialized view over the relay data." },
    { match: /view/i, pattern: "\\bCREATE\\s+(OR\\s+REPLACE\\s+)?VIEW\\b", name: "Creates a view", hint: "Create a reusable view over the relay data." },
    { match: /index/i, pattern: "\\bCREATE\\s+(UNIQUE\\s+)?INDEX\\b", name: "Creates an index", hint: "Create an index that supports the demonstrated lookup." },
    { match: /EXPLAIN|optimizer|optimization|performance/i, pattern: "\\bEXPLAIN\\b", name: "Inspects an execution plan", hint: "Prefix the representative query with EXPLAIN." },
    { match: /transaction|ACID|isolation|lock|MVCC|deadlock/i, pattern: "\\b(BEGIN|START\\s+TRANSACTION)\\b", name: "Uses a transaction boundary", hint: "Wrap the state change in BEGIN and COMMIT." },
    { match: /function|procedure/i, pattern: "\\bCREATE\\s+(OR\\s+REPLACE\\s+)?(FUNCTION|PROCEDURE)\\b", name: "Defines database behavior", hint: "Create a small SQL function or procedure." },
    { match: /trigger/i, pattern: "\\bCREATE\\s+TRIGGER\\b", name: "Defines a trigger", hint: "Create a trigger and its supporting function." },
    { match: /JSON/i, pattern: "\\b(jsonb?|->>?|#>>?)\\b", name: "Uses PostgreSQL JSON", hint: "Read or construct JSONB data in the query." },
    { match: /partition/i, pattern: "\\bPARTITION\\s+BY\\b", name: "Defines partitioning", hint: "Create a table partitioned by an appropriate key." },
    { match: /security|multi-tenancy/i, pattern: "\\b(POLICY|GRANT|REVOKE|ROW\\s+LEVEL\\s+SECURITY)\\b", name: "Applies a database security control", hint: "Use a policy or privilege statement." },
    { match: /schema design|normalization|architecture|dimensional/i, pattern: "\\bCREATE\\s+TABLE\\b", name: "Creates a deliberate schema object", hint: "Create a focused table with keys and constraints." },
    { match: /aggregate|GROUP BY|HAVING/i, pattern: "\\b(COUNT|SUM|AVG|MIN|MAX)\\s*\\(", name: "Calculates an aggregate", hint: "Use an aggregate function such as COUNT or AVG." },
    { match: /CRUD/i, pattern: "\\b(INSERT|UPDATE|DELETE)\\b", name: "Changes database state", hint: "Use INSERT, UPDATE, or DELETE and target the intended row precisely." },
    { match: /tables\/rows\/columns|data types|primary keys|foreign keys|constraints|relationships/i, pattern: "\\bCREATE\\s+TABLE\\b", name: "Defines a table", hint: "Create the requested table with explicit columns and constraints." },
  ];
  return patterns.find((item) => item.match.test(title)) ?? { pattern: "\\bSELECT\\b", name: "Runs a relational query", hint: "Write a valid SELECT query against the supplied data." };
}

export function buildSQLChallenge(topic: SQLTopic, options: ChallengeOptions = {}): TopicChallenge {
  const roundTwoChallenge = buildRoundTwoSQLChallenge(topic, options);
  if (roundTwoChallenge) return roundTwoChallenge;
  const roundThreeChallenge = buildRoundThreeSQLChallenge(topic, options);
  if (roundThreeChallenge) return roundThreeChallenge;
  const roundFourChallenge = buildRoundFourSQLChallenge(topic, options);
  if (roundFourChallenge) return roundFourChallenge;
  const roundFiveChallenge = buildRoundFiveSQLChallenge(topic, options);
  if (roundFiveChallenge) return roundFiveChallenge;
  const roundSixChallenge = buildRoundSixSQLChallenge(topic, options);
  if (roundSixChallenge) return roundSixChallenge;
  const roundSevenChallenge = buildRoundSevenSQLChallenge(topic, options);
  if (roundSevenChallenge) return roundSevenChallenge;
  const roundEightChallenge = buildRoundEightSQLChallenge(topic, options);
  if (roundEightChallenge) return roundEightChallenge;
  const roundNineChallenge = buildRoundNineSQLChallenge(topic, options);
  if (roundNineChallenge) return roundNineChallenge;
  const roundTenChallenge = buildRoundTenSQLChallenge(topic, options);
  if (roundTenChallenge) return roundTenChallenge;
  const roundElevenChallenge = buildRoundElevenSQLChallenge(topic, options);
  if (roundElevenChallenge) return roundElevenChallenge;
  const roundTwelveChallenge = buildRoundTwelveSQLChallenge(topic, options);
  if (roundTwelveChallenge) return roundTwelveChallenge;
  const roundThirteenChallenge = buildRoundThirteenSQLChallenge(topic, options);
  if (roundThirteenChallenge) return roundThirteenChallenge;
  const roundFourteenChallenge = buildRoundFourteenSQLChallenge(topic, options);
  if (roundFourteenChallenge) return roundFourteenChallenge;
  const roundFifteenChallenge = buildRoundFifteenSQLChallenge(topic, options);
  if (roundFifteenChallenge) return roundFifteenChallenge;
  const roundSixteenChallenge = buildRoundSixteenSQLChallenge(topic, options);
  if (roundSixteenChallenge) return roundSixteenChallenge;
  const roundSeventeenChallenge = buildRoundSeventeenSQLChallenge(topic, options);
  if (roundSeventeenChallenge) return roundSeventeenChallenge;
  if (options.required) {
    const worldName = options.worldName ?? "CodeCraft world";
    return {
      title: worldName + " SQL project",
      instructions: "Create a view named world_relay_report with one row per sector. It must expose sector_name, relay_count, and avg_power, preserve sectors with no relays, and order the final report by sector_name. This required database project gates the next world.",
      starterCode: [
        "-- " + worldName + " applied project",
        "CREATE VIEW world_relay_report AS",
        "SELECT",
        "  /* sector name */ AS sector_name,",
        "  /* relay count */ AS relay_count,",
        "  /* average power */ AS avg_power",
        "FROM sectors s",
        "/* preserve every sector and connect relays */",
        "GROUP BY /* stable sector key and name */;",
        "",
        "SELECT sector_name, relay_count, avg_power",
        "FROM world_relay_report",
        "ORDER BY sector_name;",
        "",
      ].join("\n"),
      dataPreview: ["sectors · 3 rows", "relays · 4 rows", "Aurora has 2 relays", "Ember and Tidal have 1 relay each"],
      visibleExamples: [
        { label: "VISIBLE RESULT", input: "Aurora sector", output: "Aurora · 2 relays · average power 89" },
        { label: "EDGE CASE", input: "Sector without relays", output: "The LEFT JOIN keeps the sector with relay_count 0" },
      ],
      runtime: {
        minimumCodeLength: 100,
        requiredPatterns: [
          { pattern: "\\bCREATE\\s+(OR\\s+REPLACE\\s+)?VIEW\\s+world_relay_report\\b", flags: "i", name: "Creates the required report view", hint: "Create a view named world_relay_report." },
          { pattern: "\\bLEFT\\s+JOIN\\b", flags: "i", name: "Preserves every sector", hint: "Use LEFT JOIN from sectors to relays." },
          { pattern: "\\bGROUP\\s+BY\\b", flags: "i", name: "Aggregates each sector", hint: "Group by the sector key and sector name." },
        ],
        sqlSetup: SQL_BASE_SETUP.replaceAll("__TOPIC__", topic.title.replaceAll("'", "''")),
        sqlTests: [
          { name: "View was created", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.views WHERE table_name = 'world_relay_report'", column: "count", expected: 1, hint: "Create world_relay_report before the final SELECT." },
          { name: "Report columns are exact", kind: "result-columns", columns: ["sector_name", "relay_count", "avg_power"], hint: "Alias all three result columns exactly as requested." },
          { name: "Every sector is represented", kind: "result-min-rows", minRows: 3, hint: "Start from sectors and use LEFT JOIN so no sector disappears." },
          { name: "Aurora aggregation is correct", kind: "database-value", query: "SELECT relay_count::int AS relay_count FROM world_relay_report WHERE sector_name = 'Aurora'", column: "relay_count", expected: 2, hint: "Count relay_id after joining on sector_id." },
        ],
      },
    };
  }
  const construct = sqlPatternFor(topic.title);
  const setup = SQL_BASE_SETUP.replaceAll("__TOPIC__", topic.title.replaceAll("'", "''"));
  const commonRuntime: ChallengeRuntimeSpec = {
    minimumCodeLength: 12,
    requiredPatterns: [{ pattern: construct.pattern, flags: "i", name: construct.name, hint: construct.hint }],
    sqlSetup: setup,
    sqlTests: [{ name: "Returns inspectable data", kind: "result-min-rows", minRows: 1, hint: "Finish with a SELECT that returns at least one row." }],
  };
  let starterCode = "-- " + topic.title + " challenge\n-- Use relays, sectors, readings, alerts, users, orders, relay_events, or challenge_notes.\n-- TODO: write your solution here.\n";
  let instructions = topic.learningGoal + " Finish with a SELECT so the result can be graded.";

  if (topic.title === "Database basics") {
    instructions = "Inspect the supplied database catalog. Return the public relations readings, relays, and sectors under a result column named relation, ordered alphabetically.";
    starterCode = "-- Inspect the schema instead of guessing which relations exist.\nSELECT /* table name */ AS relation\nFROM information_schema.tables\nWHERE table_schema = 'public'\n  AND table_name IN (/* three core relations */)\nORDER BY relation;\n";
    commonRuntime.sqlTests = [
      { name: "Catalog result is named", kind: "result-columns", columns: ["relation"], hint: "Select table_name AS relation." },
      { name: "Finds the three core relations", kind: "result-value", column: "relation", expected: ["readings", "relays", "sectors"], hint: "Filter the public catalog to readings, relays, and sectors." },
      { name: "Returns exactly the requested catalog slice", kind: "result-max-rows", minRows: 3, maxRows: 3, hint: "Return only the three named public relations." },
    ];
  } else if (topic.title === "Tables/rows/columns") {
    instructions = "Create relay_checks so every row has a bigint check_id primary key, a relay_id referencing relays, and a non-null text note. Finish by selecting its column metadata.";
    starterCode = "CREATE TABLE relay_checks (\n  check_id bigint /* identity rule */,\n  relay_id bigint /* relationship */,\n  note text /* required value */\n);\n\nSELECT column_name, data_type, is_nullable\nFROM information_schema.columns\nWHERE table_name = 'relay_checks'\nORDER BY ordinal_position;\n";
    commonRuntime.sqlTests = [
      { name: "Focused table exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_name = 'relay_checks'", column: "count", expected: 1, hint: "Create relay_checks with the exact requested name." },
      { name: "Rows have a primary identity", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name = 'relay_checks' AND constraint_type = 'PRIMARY KEY'", column: "count", expected: 1, hint: "Declare check_id as the primary key." },
      { name: "Relationship is enforced", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name = 'relay_checks' AND constraint_type = 'FOREIGN KEY'", column: "count", expected: 1, hint: "Make relay_id reference relays(relay_id)." },
      { name: "Metadata is inspectable", kind: "result-min-rows", minRows: 3, hint: "Finish with the supplied information_schema query." },
    ];
  } else if (topic.title === "Data types") {
    instructions = "Create telemetry_samples with a bigint primary key, numeric(6,2) voltage, timestamptz captured_at, and boolean valid. Insert the supplied sample, then return it.";
    starterCode = "CREATE TABLE telemetry_samples (\n  sample_id /* type and key */,\n  voltage /* exact numeric type */,\n  captured_at /* timezone-aware timestamp */,\n  valid /* true/false type */\n);\n\nINSERT INTO telemetry_samples VALUES (1, 48.25, '2026-08-23T10:00:00Z', true);\nSELECT sample_id, voltage, captured_at, valid FROM telemetry_samples;\n";
    commonRuntime.sqlTests = [
      { name: "Voltage preserves exact precision", kind: "database-value", query: "SELECT data_type FROM information_schema.columns WHERE table_name = 'telemetry_samples' AND column_name = 'voltage'", column: "data_type", expected: "numeric", hint: "Declare voltage as numeric(6,2)." },
      { name: "Timestamp preserves timezone meaning", kind: "database-value", query: "SELECT data_type FROM information_schema.columns WHERE table_name = 'telemetry_samples' AND column_name = 'captured_at'", column: "data_type", expected: "timestamp with time zone", hint: "Use timestamptz for captured_at." },
      { name: "Validity is a boolean", kind: "database-value", query: "SELECT data_type FROM information_schema.columns WHERE table_name = 'telemetry_samples' AND column_name = 'valid'", column: "data_type", expected: "boolean", hint: "Declare valid as boolean, not text." },
      { name: "Typed sample is returned", kind: "result-value", column: "sample_id", expected: 1, hint: "Insert and return the supplied sample row." },
    ];
  } else if (topic.title === "CRUD") {
    instructions = "Practice the full CRUD cycle: insert Nova Relay at sector 2 with power 71, update its power to 80, delete challenge note 1, and finish by selecting Nova Relay.";
    starterCode = "-- CREATE\nINSERT INTO relays (sector_id, name, online, power, efficiency)\nVALUES (2, 'Nova Relay', true, 71, .90);\n\n-- UPDATE the same relay\nUPDATE relays SET power = /* new value */ WHERE name = 'Nova Relay';\n\n-- DELETE only the requested practice note\nDELETE FROM challenge_notes WHERE /* precise identity */;\n\n-- READ the final relay state\nSELECT name, online, power FROM relays WHERE name = 'Nova Relay';\n";
    commonRuntime.sqlTests = [
      { name: "Nova Relay was created and updated", kind: "database-value", query: "SELECT count(*)::int AS count FROM relays WHERE name = 'Nova Relay' AND online AND power = 80", column: "count", expected: 1, hint: "Insert Nova Relay, then update that row to power 80." },
      { name: "Delete targeted one practice row", kind: "database-value", query: "SELECT count(*)::int AS count FROM challenge_notes WHERE note_id = 1", column: "count", expected: 0, hint: "Delete challenge_notes row 1 with a precise WHERE predicate." },
      { name: "Final state is visible", kind: "result-value", column: "name", expected: "Nova Relay", hint: "Finish with the supplied SELECT for Nova Relay." },
    ];
  } else if (topic.title === "SELECT") {
    starterCode = "-- Return relay_id and name for every relay.\nSELECT /* columns */\nFROM relays;\n";
    commonRuntime.sqlTests = [
      { name: "Correct result columns", kind: "result-columns", columns: ["relay_id", "name"], hint: "Select relay_id and name explicitly." },
      { name: "All relays returned", kind: "result-min-rows", minRows: 4, hint: "Do not filter out any relay." },
    ];
  } else if (topic.title === "WHERE") {
    starterCode = "-- Return online relays with power of at least 80.\nSELECT name, power\nFROM relays\nWHERE /* condition */;\n";
    commonRuntime.sqlTests = [
      { name: "Expected filtered rows", kind: "result-value", column: "name", expected: ["Aurora Edge", "Aurora Prime"], hint: "Filter for online = true and power >= 80." },
    ];
  } else if (topic.title === "ORDER BY") {
    starterCode = "-- Rank relays from highest to lowest power.\nSELECT name, power FROM relays\nORDER BY /* ordering */;\n";
    commonRuntime.sqlTests = [
      { name: "Highest power first", kind: "result-value", column: "name", expected: "Aurora Prime", hint: "Sort power in descending order." },
    ];
  } else if (topic.title === "LIMIT") {
    starterCode = "-- Return the two newest relays deterministically.\nSELECT relay_id, name, created_at FROM relays\nORDER BY created_at DESC, relay_id DESC\nLIMIT /* count */;\n";
    commonRuntime.sqlTests = [{ name: "Exactly two rows", kind: "result-max-rows", maxRows: 2, minRows: 2, hint: "Use LIMIT 2 after deterministic ordering." }];
  } else if (topic.title === "Aggregates") {
    starterCode = "-- Return the relay count as relay_count.\nSELECT /* aggregate */ AS relay_count FROM relays;\n";
    commonRuntime.sqlTests = [{ name: "Correct aggregate", kind: "result-value", column: "relay_count", expected: 4, hint: "Use COUNT(*) and the relay_count alias." }];
  } else if (topic.title === "JOINs" || topic.title === "Advanced JOINs") {
    starterCode = "-- Return each relay name with sector_name.\nSELECT r.name, /* sector name */ AS sector_name\nFROM relays r\n/* join sectors here */;\n";
    commonRuntime.sqlTests = [
      { name: "Joined result columns", kind: "result-columns", columns: ["name", "sector_name"], hint: "Select r.name and alias s.name as sector_name." },
      { name: "Every relay joined", kind: "result-min-rows", minRows: 4, hint: "Join sectors on the sector_id key." },
    ];
  } else if (/Tables\/rows\/columns|Data types|Primary keys|Foreign keys|Constraints|Relationships|Basic schema design|Normalization|Schema design|Dimensional modeling|Database architecture/i.test(topic.title)) {
    instructions = "Create a lab_nodes table with node_id as its primary key, a non-null name, and a positive power constraint. Finish by selecting its columns.";
    starterCode = "CREATE TABLE lab_nodes (\n  node_id bigint /* key */,\n  name text,\n  power integer\n);\n\nSELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'lab_nodes' ORDER BY ordinal_position;\n";
    commonRuntime.sqlTests = [
      { name: "Table exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_name = 'lab_nodes'", column: "count", expected: 1, hint: "Create a table named lab_nodes." },
      { name: "Primary key exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name = 'lab_nodes' AND constraint_type = 'PRIMARY KEY'", column: "count", expected: 1, hint: "Declare node_id as the primary key." },
    ];
  } else if (topic.title === "Views") {
    instructions = "Create online_relays as a view of online relay records, then query the view.";
    starterCode = "CREATE VIEW online_relays AS\nSELECT /* columns */ FROM relays WHERE /* condition */;\n\nSELECT * FROM online_relays;\n";
    commonRuntime.sqlTests = [
      { name: "View has online relays", kind: "database-value", query: "SELECT count(*)::int AS count FROM online_relays", column: "count", expected: 3, hint: "The view should filter relays where online is true." },
      { name: "View query returns rows", kind: "result-min-rows", minRows: 3, hint: "Finish by querying online_relays." },
    ];
  } else if (topic.title === "Indexes") {
    instructions = "Create idx_relays_power on relays(power), then inspect it with a SELECT.";
    starterCode = "CREATE INDEX /* index name */ ON relays (/* column */);\n\nSELECT indexname FROM pg_indexes WHERE tablename = 'relays';\n";
    commonRuntime.sqlTests = [
      { name: "Expected index exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname = 'idx_relays_power'", column: "count", expected: 1, hint: "Name the index idx_relays_power and index the power column." },
    ];
  } else if (/Transactions|ACID|Isolation levels|Locks|MVCC|Advanced transactions|Deadlocks/i.test(topic.title)) {
    instructions = "Use an explicit transaction to change Ember Gate to maintenance, commit it, and then select the changed row.";
    starterCode = "BEGIN;\nUPDATE relays SET status = /* new status */ WHERE name = 'Ember Gate';\nCOMMIT;\n\nSELECT name, status FROM relays WHERE name = 'Ember Gate';\n";
    commonRuntime.sqlTests = [
      { name: "Transaction changed state", kind: "database-value", query: "SELECT status FROM relays WHERE name = 'Ember Gate'", column: "status", expected: "maintenance", hint: "Set the status to the exact text maintenance before COMMIT." },
      { name: "Changed row returned", kind: "result-value", column: "status", expected: "maintenance", hint: "Finish by selecting Ember Gate's status." },
    ];
  } else if (topic.title === "JSON/JSONB") {
    instructions = "Read the source field from relay_events.payload and expose it as source.";
    starterCode = "SELECT event_id, payload /* operator and key */ AS source\nFROM relay_events\nORDER BY event_id;\n";
    commonRuntime.sqlTests = [
      { name: "Extracted JSON values", kind: "result-value", column: "source", expected: ["repair", "sensor"], hint: "Use payload ->> 'source' and alias it as source." },
    ];
  }

  return {
    title: topic.title + " SQL mission",
    instructions,
    starterCode,
    dataPreview: ["relays · 4 rows", "sectors · 3 rows", "readings · 4 rows", "challenge_notes · topic-specific rows"],
    visibleExamples: [
      { label: "AVAILABLE RELATION", input: "relays(relay_id, sector_id, name, online, power, status, created_at)", output: "A structured result table" },
      { label: "VISIBLE CHECK", input: construct.name, output: "The result and database state satisfy the mission" },
    ],
    runtime: commonRuntime,
  };
}
