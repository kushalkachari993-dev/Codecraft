import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundThreePythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Logic Vaults") return {
    title: "Logic Vaults Python project",
    instructions: "Build analyze_readings(readings). Reject non-list input and non-numeric readings with ValueError. Count readings at or above 70 as active, then return total, active, and status. Empty input is offline; otherwise status is stable when at least half the readings are active and unstable when it is not. This required project gates the next world.",
    starterCode: "# Logic Vaults applied project\ndef analyze_readings(readings):\n    # TODO 1: validate the collection and every reading.\n    # TODO 2: loop through readings and count values >= 70.\n    # TODO 3: choose offline, stable, or unstable.\n    return None\n\nprint(analyze_readings([96, 82, 44]))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "analyze_readings([96, 82, 44])", output: "{'total': 3, 'active': 2, 'status': 'stable'}" },
      { label: "EMPTY INPUT", input: "analyze_readings([])", output: "{'total': 0, 'active': 0, 'status': 'offline'}" },
    ],
    runtime: {
      minimumCodeLength: 180,
      requiredPatterns: [
        { pattern: "\\bif\\b", flags: "im", name: "Branches on system state", hint: "Use conditions for validation and status classification." },
        { pattern: "\\bfor\\b", flags: "im", name: "Processes every reading", hint: "Loop through readings instead of hard-coding counts." },
        { pattern: "\\braise\\s+ValueError", flags: "im", name: "Rejects invalid input", hint: "Raise ValueError for invalid collection or reading types." },
      ],
      pythonTests: [
        { name: "Analyzer exists", code: "assert callable(globals().get('analyze_readings'))", hint: "Keep analyze_readings(readings) exactly as named." },
        { name: "Classifies the visible mission", code: "assert analyze_readings([96, 82, 44]) == {'total': 3, 'active': 2, 'status': 'stable'}", hint: "Count readings >= 70 and classify a majority-active collection as stable." },
        { name: "Handles empty and unstable signals", code: "assert analyze_readings([]) == {'total': 0, 'active': 0, 'status': 'offline'} and analyze_readings([69, 20, 70]) == {'total': 3, 'active': 1, 'status': 'unstable'}", hint: "Treat empty separately, then compare active * 2 with total." },
        { name: "Accepts the exact half boundary", code: "assert analyze_readings([70, 10]) == {'total': 2, 'active': 1, 'status': 'stable'}", hint: "At least half active is stable, so include equality." },
        { name: "Rejects invalid input", code: "for bad in ('96,82', [70, 'bad']):\n    try:\n        analyze_readings(bad)\n        assert False\n    except ValueError:\n        pass", hint: "Raise ValueError for non-list input and for any non-numeric reading." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Conditions") return {
    title: "Relay classification mission",
    instructions: "Complete classify_relay(power, online). Return offline when online is false, critical for online power at least 90, stable for online power at least 70, and weak otherwise. Branch order must preserve the critical case.",
    starterCode: "def classify_relay(power, online):\n    # TODO: order the branches from the most decisive state.\n    return None\n\nprint(classify_relay(96, True))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "classify_relay(96, True)", output: "critical" },
      { label: "OFFLINE OVERRIDE", input: "classify_relay(99, False)", output: "offline" },
    ],
    runtime: {
      minimumCodeLength: 90,
      requiredPatterns: [{ pattern: "\\bif\\b[\\s\\S]*\\belif\\b[\\s\\S]*\\belse\\b", flags: "im", name: "Builds an ordered decision", hint: "Use if, elif, and else with the offline rule first." }],
      pythonTests: [
        { name: "Classifier exists", code: "assert callable(globals().get('classify_relay'))", hint: "Keep classify_relay(power, online)." },
        { name: "Offline state wins", code: "assert classify_relay(99, False) == 'offline'", hint: "Check online before power thresholds." },
        { name: "Classifies thresholds", code: "assert classify_relay(90, True) == 'critical' and classify_relay(70, True) == 'stable'", hint: "Use inclusive >= boundaries and test the higher threshold first." },
        { name: "Classifies a weak relay", code: "assert classify_relay(69, True) == 'weak'", hint: "Return weak from the remaining online branch." },
      ],
    },
  };

  if (topic.title === "Loops") return {
    title: "Reading scan mission",
    instructions: "Complete scan_readings(readings). Loop over every item, skip None values, count processed numeric readings and those at or above 70, then return both counts in a dictionary.",
    starterCode: "def scan_readings(readings):\n    processed = 0\n    active = 0\n    # TODO: scan, skip missing values, and update both counters.\n    return {'processed': processed, 'active': active}\n\nprint(scan_readings([96, None, 44, 70]))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "scan_readings([96, None, 44, 70])", output: "{'processed': 3, 'active': 2}" },
      { label: "EMPTY INPUT", input: "scan_readings([])", output: "{'processed': 0, 'active': 0}" },
    ],
    runtime: {
      minimumCodeLength: 100,
      requiredPatterns: [
        { pattern: "\\bfor\\b", flags: "im", name: "Scans the collection", hint: "Use a for loop over readings." },
        { pattern: "\\bcontinue\\b", flags: "im", name: "Skips missing readings", hint: "Continue when a reading is None." },
      ],
      pythonTests: [
        { name: "Scanner exists", code: "assert callable(globals().get('scan_readings'))", hint: "Keep scan_readings(readings)." },
        { name: "Skips missing values", code: "assert scan_readings([96, None, 44, 70]) == {'processed': 3, 'active': 2}", hint: "None is skipped and does not count as processed." },
        { name: "Handles empty input", code: "assert scan_readings([]) == {'processed': 0, 'active': 0}", hint: "Initialized counters already describe the empty result." },
        { name: "Uses the active boundary", code: "assert scan_readings([69, 70, 71, None]) == {'processed': 3, 'active': 2}", hint: "Active means greater than or equal to 70." },
      ],
    },
  };

  if (topic.title === "Functions") return {
    title: "Energy conversion mission",
    instructions: "Complete relay_output(power, efficiency=1.0). Return power multiplied by efficiency and rounded to two decimal places. Preserve the default parameter and return the value rather than only printing it.",
    starterCode: "def relay_output(power, efficiency=1.0):\n    # TODO: calculate and return a reusable value.\n    return None\n\nprint(relay_output(82, 0.91))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "relay_output(82, 0.91)", output: "74.62" },
      { label: "DEFAULT ARGUMENT", input: "relay_output(70)", output: "70.0" },
    ],
    runtime: {
      minimumCodeLength: 60,
      requiredPatterns: [{ pattern: "def\\s+relay_output\\s*\\(\\s*power\\s*,\\s*efficiency\\s*=\\s*1(?:\\.0)?\\s*\\)", flags: "im", name: "Defines the reusable contract", hint: "Keep power required and efficiency defaulted to 1.0." }],
      pythonTests: [
        { name: "Output function exists", code: "assert callable(globals().get('relay_output'))", hint: "Keep relay_output(power, efficiency=1.0)." },
        { name: "Calculates the visible output", code: "assert relay_output(82, .91) == 74.62", hint: "Multiply and round the returned value to two places." },
        { name: "Preserves the default", code: "assert relay_output(70) == 70.0", hint: "The default efficiency must be 1.0." },
        { name: "Rounds another input", code: "assert relay_output(10, .333) == 3.33", hint: "Use round(result, 2)." },
      ],
    },
  };

  if (topic.title === "Scope") return {
    title: "Local reward mission",
    instructions: "Complete calculate_reward(repairs, rate). Define bonus = 5 inside the function and return repairs * rate + bonus. Do not create or mutate global reward state.",
    starterCode: "def calculate_reward(repairs, rate):\n    # TODO: keep bonus local to this calculation.\n    return None\n\nprint(calculate_reward(3, 10))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "calculate_reward(3, 10)", output: "35" },
      { label: "ZERO REPAIRS", input: "calculate_reward(0, 8)", output: "5" },
    ],
    runtime: {
      minimumCodeLength: 65,
      requiredPatterns: [{ pattern: "def\\s+calculate_reward[\\s\\S]*?\\n\\s+bonus\\s*=\\s*5", flags: "im", name: "Keeps bonus in local scope", hint: "Assign bonus = 5 inside calculate_reward." }],
      pythonTests: [
        { name: "Reward function exists", code: "assert callable(globals().get('calculate_reward'))", hint: "Keep calculate_reward(repairs, rate)." },
        { name: "Computes the visible reward", code: "assert calculate_reward(3, 10) == 35", hint: "Multiply repairs by rate, then add the local bonus." },
        { name: "Handles zero repairs", code: "assert calculate_reward(0, 8) == 5", hint: "The local bonus still applies when repairs is zero." },
        { name: "Does not leak bonus globally", code: "assert 'bonus' not in globals() and calculate_reward(4, 2) == 13", hint: "Define bonus only inside the function." },
      ],
    },
  };

  if (topic.title === "Exceptions") return {
    title: "Power parser mission",
    instructions: "Complete parse_power(raw). Convert raw with int(). If conversion fails, raise ValueError with a clear message. Also raise ValueError when the converted value is outside 0 through 100. Return the valid integer.",
    starterCode: "def parse_power(raw):\n    # TODO: convert inside try/except, then validate the range.\n    return None\n\nprint(parse_power('82'))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "parse_power('82')", output: "82" },
      { label: "INVALID INPUT", input: "parse_power('unknown')", output: "raises ValueError" },
    ],
    runtime: {
      minimumCodeLength: 110,
      requiredPatterns: [
        { pattern: "\\btry\\s*:", flags: "im", name: "Protects the conversion boundary", hint: "Convert raw inside a try block." },
        { pattern: "\\bexcept\\s+(ValueError|TypeError)", flags: "im", name: "Catches a specific conversion error", hint: "Catch ValueError or TypeError, not a bare except." },
        { pattern: "\\braise\\s+ValueError", flags: "im", name: "Signals invalid power", hint: "Raise ValueError for invalid text and out-of-range values." },
      ],
      pythonTests: [
        { name: "Parser exists", code: "assert callable(globals().get('parse_power'))", hint: "Keep parse_power(raw)." },
        { name: "Parses valid power", code: "assert parse_power('82') == 82 and parse_power(0) == 0 and parse_power('100') == 100", hint: "Convert with int() and include both range boundaries." },
        { name: "Rejects invalid text", code: "try:\n    parse_power('unknown')\n    assert False\nexcept ValueError:\n    pass", hint: "Translate conversion failure into ValueError." },
        { name: "Rejects out-of-range values", code: "for bad in (-1, 101):\n    try:\n        parse_power(bad)\n        assert False\n    except ValueError:\n        pass", hint: "Validate that power is between 0 and 100 inclusive." },
      ],
    },
  };

  return null;
}

const sqlBase = {
  dataPreview: ["relays · 4 rows", "critical · 1", "stable · 2", "weak · 1", "one known last_error"],
};

export function buildRoundThreeSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Aggregation Lab") return {
    ...sqlBase,
    title: "Aggregation Lab SQL project",
    instructions: "Build a relay health summary with one row for online and one for offline relays. Return relay_state, relay_count, error_count, and avg_power. Derive relay_state with CASE, use COUNT(last_error) for known errors, group and filter the result with HAVING, round average power to two decimals, and order by relay_state. This required project gates the next world.",
    starterCode: "-- Aggregation Lab applied project\nSELECT\n  /* online/offline CASE */ AS relay_state,\n  /* all rows */ AS relay_count,\n  /* known errors only */ AS error_count,\n  /* rounded average */ AS avg_power\nFROM relays\nGROUP BY /* the CASE expression */\nHAVING /* keep non-empty groups */\nORDER BY relay_state;\n",
    visibleExamples: [
      { label: "OFFLINE GROUP", input: "Ember Gate", output: "offline · 1 relay · 1 known error · average 44" },
      { label: "ONLINE GROUP", input: "Three online relays", output: "online · 3 relays · 0 known errors · average 82" },
    ],
    runtime: {
      minimumCodeLength: 170,
      requiredPatterns: [
        { pattern: "\\bCASE\\b[\\s\\S]*\\bEND\\b", flags: "i", name: "Classifies relay state", hint: "Use CASE WHEN online THEN 'online' ELSE 'offline' END." },
        { pattern: "\\bGROUP\\s+BY\\b", flags: "i", name: "Builds one row per state", hint: "Group by the same CASE expression." },
        { pattern: "\\bHAVING\\b", flags: "i", name: "Filters aggregate groups", hint: "Use HAVING COUNT(*) >= 1." },
      ],
      sqlTests: [
        { name: "Summary columns are exact", kind: "result-columns", columns: ["relay_state", "relay_count", "error_count", "avg_power"], hint: "Alias all four columns exactly." },
        { name: "States are ordered", kind: "result-ordered-values", column: "relay_state", expected: ["offline", "online"], hint: "Order by relay_state." },
        { name: "Group counts are correct", kind: "result-ordered-values", column: "relay_count", expected: [1, 3], hint: "COUNT(*) measures every relay in each state." },
        { name: "NULL errors are excluded", kind: "result-ordered-values", column: "error_count", expected: [1, 0], hint: "COUNT(last_error) counts only known errors." },
        { name: "Average power is correct", kind: "result-ordered-values", column: "avg_power", expected: [44, 82], hint: "Use ROUND(AVG(power), 2)." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "GROUP BY") return {
    ...sqlBase,
    title: "Status aggregation mission",
    instructions: "Return one row per relay status with status, relay_count, and avg_power rounded to two decimals. Order alphabetically by status.",
    starterCode: "SELECT\n  status,\n  /* count rows */ AS relay_count,\n  /* rounded average */ AS avg_power\nFROM relays\nGROUP BY /* grouping key */\nORDER BY status;\n",
    visibleExamples: [
      { label: "STABLE GROUP", input: "Aurora Edge and Tidal Link", output: "stable · 2 relays · average power 75" },
      { label: "RESULT GRAIN", input: "critical, stable, weak", output: "3 rows" },
    ],
    runtime: {
      minimumCodeLength: 85,
      requiredPatterns: [{ pattern: "\\bGROUP\\s+BY\\s+status\\b", flags: "i", name: "Groups by relay status", hint: "Use GROUP BY status." }],
      sqlTests: [
        { name: "Aggregate columns are exact", kind: "result-columns", columns: ["status", "relay_count", "avg_power"], hint: "Return status and alias both aggregates." },
        { name: "Statuses are ordered", kind: "result-ordered-values", column: "status", expected: ["critical", "stable", "weak"], hint: "Order by status." },
        { name: "Counts each group", kind: "result-ordered-values", column: "relay_count", expected: [1, 2, 1], hint: "Use COUNT(*) AS relay_count." },
        { name: "Averages each group", kind: "result-ordered-values", column: "avg_power", expected: [96, 75, 44], hint: "Use ROUND(AVG(power), 2) AS avg_power." },
      ],
    },
  };

  if (topic.title === "HAVING") return {
    ...sqlBase,
    title: "Busy-sector mission",
    instructions: "Return sector_id and relay_count only for sectors with at least two relays. Group first, filter groups with HAVING, and order by sector_id.",
    starterCode: "SELECT sector_id, /* aggregate */ AS relay_count\nFROM relays\nGROUP BY sector_id\nHAVING /* aggregate condition */\nORDER BY sector_id;\n",
    visibleExamples: [
      { label: "EXPECTED GROUP", input: "Aurora sector · id 1", output: "1 · 2 relays" },
      { label: "EXCLUDED GROUPS", input: "Ember and Tidal", output: "Each has fewer than 2 relays" },
    ],
    runtime: {
      minimumCodeLength: 75,
      requiredPatterns: [{ pattern: "\\bHAVING\\s+COUNT\\s*\\(\\s*\\*\\s*\\)\\s*>=\\s*2", flags: "i", name: "Filters completed groups", hint: "Use HAVING COUNT(*) >= 2." }],
      sqlTests: [
        { name: "Group result columns are exact", kind: "result-columns", columns: ["sector_id", "relay_count"], hint: "Select sector_id and COUNT(*) AS relay_count." },
        { name: "Only Aurora qualifies", kind: "result-value", column: "sector_id", expected: 1, hint: "Filter aggregate groups, not source rows." },
        { name: "Qualified count is correct", kind: "result-value", column: "relay_count", expected: 2, hint: "Aurora contains two relays." },
        { name: "No extra groups pass", kind: "result-max-rows", minRows: 1, maxRows: 1, hint: "Require at least two rows per group." },
      ],
    },
  };

  if (topic.title === "NULL") return {
    ...sqlBase,
    title: "Missing repair mission",
    instructions: "Return name and error_state for relays whose repaired_at is NULL. Replace a missing last_error with the text none using COALESCE, then order by name.",
    starterCode: "SELECT\n  name,\n  /* fallback for missing error */ AS error_state\nFROM relays\nWHERE /* repaired time is missing */\nORDER BY name;\n",
    visibleExamples: [
      { label: "AURORA EDGE", input: "last_error is NULL", output: "Aurora Edge · none" },
      { label: "EMBER GATE", input: "last_error is coolant", output: "Ember Gate · coolant" },
    ],
    runtime: {
      minimumCodeLength: 80,
      requiredPatterns: [
        { pattern: "\\bCOALESCE\\s*\\(", flags: "i", name: "Supplies a display fallback", hint: "Use COALESCE(last_error, 'none')." },
        { pattern: "repaired_at\\s+IS\\s+NULL", flags: "i", name: "Tests missing repair time", hint: "Use IS NULL rather than = NULL." },
      ],
      sqlTests: [
        { name: "NULL report columns are exact", kind: "result-columns", columns: ["name", "error_state"], hint: "Alias the COALESCE result as error_state." },
        { name: "Unrepaired relays are ordered", kind: "result-ordered-values", column: "name", expected: ["Aurora Edge", "Ember Gate"], hint: "Filter repaired_at IS NULL and order by name." },
        { name: "Fallbacks preserve meaning", kind: "result-ordered-values", column: "error_state", expected: ["none", "coolant"], hint: "COALESCE only the missing last_error." },
      ],
    },
  };

  if (topic.title === "CASE") return {
    ...sqlBase,
    title: "Power tier mission",
    instructions: "Return relay name and a tier derived from power: critical for power at least 90, stable for power at least 60, and weak otherwise. Order by relay_id so the hidden checks can verify every branch.",
    starterCode: "SELECT\n  name,\n  CASE\n    WHEN /* highest threshold */ THEN 'critical'\n    WHEN /* next threshold */ THEN 'stable'\n    ELSE 'weak'\n  END AS tier\nFROM relays\nORDER BY relay_id;\n",
    visibleExamples: [
      { label: "HIGH POWER", input: "Aurora Prime · 96", output: "critical" },
      { label: "LOW POWER", input: "Ember Gate · 44", output: "weak" },
    ],
    runtime: {
      minimumCodeLength: 105,
      requiredPatterns: [{ pattern: "\\bCASE\\b[\\s\\S]*\\bWHEN\\b[\\s\\S]*\\bELSE\\b[\\s\\S]*\\bEND\\s+AS\\s+tier", flags: "i", name: "Defines an exhaustive tier", hint: "Use ordered WHEN branches and ELSE, then alias the CASE as tier." }],
      sqlTests: [
        { name: "Tier columns are exact", kind: "result-columns", columns: ["name", "tier"], hint: "Return name and CASE ... END AS tier." },
        { name: "Relays remain ordered", kind: "result-ordered-values", column: "name", expected: ["Aurora Prime", "Aurora Edge", "Ember Gate", "Tidal Link"], hint: "Order by relay_id." },
        { name: "Every branch is correct", kind: "result-ordered-values", column: "tier", expected: ["critical", "stable", "weak", "stable"], hint: "Test >= 90 before >= 60, then use ELSE." },
      ],
    },
  };

  if (topic.title === "Primary keys") return {
    ...sqlBase,
    title: "Mission marker identity mission",
    instructions: "Create mission_markers with marker_id as a generated bigint identity primary key and label as non-null text. Insert alpha and beta without supplying ids, then return marker_id and label ordered by marker_id.",
    starterCode: "CREATE TABLE mission_markers (\n  marker_id /* generated identity and primary key */,\n  label /* required text */\n);\n\nINSERT INTO mission_markers (label) VALUES ('alpha'), ('beta');\nSELECT marker_id, label FROM mission_markers ORDER BY marker_id;\n",
    visibleExamples: [
      { label: "FIRST GENERATED ID", input: "alpha", output: "1 · alpha" },
      { label: "IDENTITY RULE", input: "Two inserts without marker_id", output: "Unique ids are generated" },
    ],
    runtime: {
      minimumCodeLength: 135,
      requiredPatterns: [{ pattern: "marker_id\\s+bigint\\s+GENERATED\\s+ALWAYS\\s+AS\\s+IDENTITY\\s+PRIMARY\\s+KEY", flags: "i", name: "Defines stable generated identity", hint: "Declare marker_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY." }],
      sqlTests: [
        { name: "Primary key exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name = 'mission_markers' AND constraint_type = 'PRIMARY KEY'", column: "count", expected: 1, hint: "Make marker_id the table primary key." },
        { name: "Label is required", kind: "database-value", query: "SELECT is_nullable FROM information_schema.columns WHERE table_name = 'mission_markers' AND column_name = 'label'", column: "is_nullable", expected: "NO", hint: "Declare label text NOT NULL." },
        { name: "Generated rows are ordered", kind: "result-ordered-values", column: "label", expected: ["alpha", "beta"], hint: "Insert both labels and order by marker_id." },
        { name: "Identity generated both ids", kind: "result-ordered-values", column: "marker_id", expected: [1, 2], hint: "Do not manually supply marker_id values." },
      ],
    },
  };

  return null;
}
