import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundFourPythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Builder Toolkit") return {
    title: "Builder Toolkit Python project",
    instructions: "Build load_relay_report(payload). Parse a JSON string containing a readings list, reject malformed JSON, missing/non-list readings, and non-numeric entries with ValueError, then return total, average_power rounded to two decimals, and status. Empty readings are offline; otherwise average power at least 70 is stable and lower power is weak. This project gates the next world.",
    starterCode: "# Builder Toolkit applied project\nimport json\n\ndef load_relay_report(payload):\n    # TODO 1: parse JSON and translate malformed input to ValueError.\n    # TODO 2: validate and scan the readings list.\n    # TODO 3: return total, average_power, and status.\n    return None\n\nprint(load_relay_report('{\"readings\": [96, 82, 44]}'))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "{\"readings\": [96, 82, 44]}", output: "{'total': 3, 'average_power': 74.0, 'status': 'stable'}" },
      { label: "EMPTY ARCHIVE", input: "{\"readings\": []}", output: "{'total': 0, 'average_power': 0.0, 'status': 'offline'}" },
    ],
    runtime: {
      minimumCodeLength: 210,
      requiredPatterns: [
        { pattern: "\\bjson\\.loads\\s*\\(", flags: "im", name: "Parses the archive payload", hint: "Use json.loads(payload) inside protected error handling." },
        { pattern: "\\btry\\s*:[\\s\\S]*\\bexcept\\b", flags: "im", name: "Handles malformed input", hint: "Translate JSON decoding failure into a clear ValueError." },
        { pattern: "\\bfor\\b", flags: "im", name: "Inspects every reading", hint: "Loop over readings so every item is validated and included." },
      ],
      pythonTests: [
        { name: "Report loader exists", code: "assert callable(globals().get('load_relay_report'))", hint: "Keep load_relay_report(payload) exactly as named." },
        { name: "Builds the visible report", code: "assert load_relay_report('{\"readings\":[96,82,44]}') == {'total': 3, 'average_power': 74.0, 'status': 'stable'}", hint: "Average all readings, round to two decimals, and classify values >= 70 as stable." },
        { name: "Handles empty and weak archives", code: "assert load_relay_report('{\"readings\":[]}') == {'total': 0, 'average_power': 0.0, 'status': 'offline'} and load_relay_report('{\"readings\":[20,40]}')['status'] == 'weak'", hint: "Treat empty input separately and use the calculated average for non-empty status." },
        { name: "Rounds computed output", code: "assert load_relay_report('{\"readings\":[70,71,72.25]}')['average_power'] == 71.08", hint: "Use round(total_power / total, 2)." },
        { name: "Rejects broken contracts", code: "for bad in ('not json', '{}', '{\"readings\":\"96\"}', '{\"readings\":[70,\"bad\"]}'):\n    try:\n        load_relay_report(bad)\n        assert False\n    except ValueError:\n        pass", hint: "Raise ValueError for malformed JSON, missing/non-list readings, and non-numeric entries." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Files") return {
    title: "Relay log mission",
    instructions: "Complete summarize_log(path). Open the UTF-8 text file with a context manager, ignore blank lines, and return line_count plus the final non-blank line. When no useful lines exist, final_line must be None.",
    starterCode: "def summarize_log(path):\n    # TODO: use a context manager and explicit UTF-8 decoding.\n    useful_lines = []\n    return {'line_count': None, 'final_line': None}\n",
    visibleExamples: [
      { label: "VISIBLE FILE", input: "boot\\n\\nrelay ready\\n", output: "{'line_count': 2, 'final_line': 'relay ready'}" },
      { label: "EMPTY FILE", input: "whitespace only", output: "{'line_count': 0, 'final_line': None}" },
    ],
    runtime: {
      minimumCodeLength: 100,
      requiredPatterns: [{ pattern: "\\bwith\\s+open\\s*\\([\\s\\S]*encoding\\s*=\\s*['\"]utf-8['\"]", flags: "im", name: "Opens text safely", hint: "Use with open(path, ..., encoding='utf-8') as file." }],
      pythonTests: [
        { name: "Summarizer exists", code: "assert callable(globals().get('summarize_log'))", hint: "Keep summarize_log(path)." },
        { name: "Summarizes useful lines", code: "from pathlib import Path\np=Path('/tmp/codecraft-log.txt'); p.write_text('boot\\n\\nrelay ready\\n', encoding='utf-8'); assert summarize_log(p) == {'line_count': 2, 'final_line': 'relay ready'}", hint: "Strip lines and ignore empty results." },
        { name: "Handles an empty log", code: "from pathlib import Path\np=Path('/tmp/codecraft-empty.txt'); p.write_text('  \\n\\n', encoding='utf-8'); assert summarize_log(p) == {'line_count': 0, 'final_line': None}", hint: "Avoid indexing an empty list; use None when no useful line exists." },
        { name: "Reads Unicode as UTF-8", code: "from pathlib import Path\np=Path('/tmp/codecraft-unicode.txt'); p.write_text('signal ✦', encoding='utf-8'); assert summarize_log(p)['final_line'] == 'signal ✦'", hint: "Specify UTF-8 explicitly when opening the file." },
      ],
    },
  };

  if (topic.title === "Modules") return {
    title: "Statistics module mission",
    instructions: "Import statistics as stats and complete safe_mean(values). Return 0.0 for an empty collection and otherwise return stats.mean(values) rounded to two decimals. Keep the demonstration behind a main guard.",
    starterCode: "import statistics as stats\n\ndef safe_mean(values):\n    # TODO: return a safe, reusable mean.\n    return None\n\nif __name__ == '__main__':\n    print(safe_mean([96, 82, 44]))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "safe_mean([96, 82, 44])", output: "74" },
      { label: "EMPTY INPUT", input: "safe_mean([])", output: "0.0" },
    ],
    runtime: {
      minimumCodeLength: 90,
      requiredPatterns: [
        { pattern: "\\bimport\\s+statistics\\s+as\\s+stats", flags: "im", name: "Uses an explicit module namespace", hint: "Keep import statistics as stats." },
        { pattern: "if\\s+__name__\\s*==\\s*['\"]__main__['\"]", flags: "im", name: "Protects script-only behavior", hint: "Keep demo output inside the __main__ guard." },
      ],
      pythonTests: [
        { name: "Mean function exists", code: "assert callable(globals().get('safe_mean'))", hint: "Keep safe_mean(values)." },
        { name: "Calculates the visible mean", code: "assert safe_mean([96,82,44]) == 74", hint: "Use stats.mean(values) and round the result." },
        { name: "Handles empty input", code: "assert safe_mean([]) == 0.0", hint: "Return 0.0 before calling stats.mean on an empty list." },
        { name: "Rounds a fractional mean", code: "assert safe_mean([1,2,2]) == 1.67", hint: "Round the mean to two decimal places." },
      ],
    },
  };

  if (topic.title === "Git basics") return {
    title: "Commit plan mission",
    instructions: "Complete commit_plan(files, message). Reject an empty file list or blank message with ValueError. Return four command strings in order: git status, one git add -- command containing the file paths, git diff --staged, and a git commit command using the trimmed message. Do not execute shell commands.",
    starterCode: "def commit_plan(files, message):\n    # Return a reviewable plan; never execute it.\n    return None\n\nprint(commit_plan(['app.py', 'tests.py'], 'Add relay report'))\n",
    visibleExamples: [
      { label: "COMMAND ORDER", input: "two files and one message", output: "status → add → staged diff → commit" },
      { label: "INVALID PLAN", input: "no files", output: "raises ValueError" },
    ],
    runtime: {
      minimumCodeLength: 120,
      requiredPatterns: [{ pattern: "['\"]git\\s+(status|add|diff|commit)", flags: "im", name: "Builds Git commands as data", hint: "Return Git command strings without running a subprocess." }],
      pythonTests: [
        { name: "Planner exists", code: "assert callable(globals().get('commit_plan'))", hint: "Keep commit_plan(files, message)." },
        { name: "Builds a focused workflow", code: "p=commit_plan(['app.py','tests.py'],'Add relay report'); assert p == ['git status','git add -- app.py tests.py','git diff --staged','git commit -m \"Add relay report\"']", hint: "Return the four exact commands in the requested order." },
        { name: "Uses another input", code: "assert commit_plan(['README.md'],'  Document setup  ')[-1] == 'git commit -m \"Document setup\"'", hint: "Trim the message and construct commands from the arguments." },
        { name: "Rejects incomplete plans", code: "for args in (([], 'message'), (['app.py'], '   ')):\n    try:\n        commit_plan(*args)\n        assert False\n    except ValueError:\n        pass", hint: "Raise ValueError when files or a meaningful message are missing." },
      ],
    },
  };

  if (topic.title === "Virtual environments") return {
    title: "Environment setup mission",
    instructions: "Complete environment_plan(name='.venv'). Accept only a simple non-empty directory name containing letters, numbers, dot, dash, or underscore. Return commands to create the environment, inspect its interpreter, and install requirements through that interpreter. Do not run them.",
    starterCode: "def environment_plan(name='.venv'):\n    # TODO: validate name and return three reproducible commands.\n    return None\n\nprint(environment_plan())\n",
    visibleExamples: [
      { label: "DEFAULT ENVIRONMENT", input: "environment_plan()", output: "python -m venv .venv → .venv/python -c ... → .venv/python -m pip install -r requirements.txt" },
      { label: "UNSAFE NAME", input: "../shared", output: "raises ValueError" },
    ],
    runtime: {
      minimumCodeLength: 135,
      requiredPatterns: [{ pattern: "python\\s+-m\\s+venv", flags: "im", name: "Creates an isolated environment", hint: "Include python -m venv followed by the validated name." }],
      pythonTests: [
        { name: "Environment planner exists", code: "assert callable(globals().get('environment_plan'))", hint: "Keep environment_plan(name='.venv')." },
        { name: "Builds the default plan", code: "p=environment_plan(); assert p[0] == 'python -m venv .venv' and p[1].startswith('.venv/python -c') and p[2] == '.venv/python -m pip install -r requirements.txt'", hint: "Return creation, interpreter verification, and dependency installation commands." },
        { name: "Uses a custom safe name", code: "p=environment_plan('env-3'); assert all('env-3' in command for command in p)", hint: "Construct every environment-specific command from name." },
        { name: "Rejects unsafe paths", code: "for bad in ('', '../shared', 'env name', 'a/b'):\n    try:\n        environment_plan(bad)\n        assert False\n    except ValueError:\n        pass", hint: "Allow only letters, numbers, dot, dash, and underscore in the directory name." },
      ],
    },
  };

  if (topic.title === "Dependency basics") return {
    title: "Dependency audit mission",
    instructions: "Complete dependency_report(requirements). Ignore blank and comment lines, count direct declarations, list unpinned package names alphabetically, and return reproducible=True only when every declaration uses == with a version.",
    starterCode: "def dependency_report(requirements):\n    # TODO: clean declarations and inspect their version operators.\n    return {'direct_count': None, 'unpinned': None, 'reproducible': None}\n",
    visibleExamples: [
      { label: "MIXED INPUT", input: "requests==2.32.0, pydantic>=2, # comment", output: "2 direct · ['pydantic'] unpinned · reproducible False" },
      { label: "EMPTY INPUT", input: "comments and blanks", output: "0 direct · reproducible True" },
    ],
    runtime: {
      minimumCodeLength: 140,
      requiredPatterns: [{ pattern: "\\bfor\\b", flags: "im", name: "Audits every declaration", hint: "Loop over requirement lines after stripping whitespace." }],
      pythonTests: [
        { name: "Dependency reporter exists", code: "assert callable(globals().get('dependency_report'))", hint: "Keep dependency_report(requirements)." },
        { name: "Finds unpinned declarations", code: "assert dependency_report(['requests==2.32.0','pydantic>=2','# note','']) == {'direct_count': 2, 'unpinned': ['pydantic'], 'reproducible': False}", hint: "Ignore comments/blanks and treat only == declarations as pinned." },
        { name: "Recognizes a pinned set", code: "assert dependency_report(['flask==3.1.0','click==8.1.8']) == {'direct_count': 2, 'unpinned': [], 'reproducible': True}", hint: "Every cleaned declaration must include ==." },
        { name: "Handles an empty declaration set", code: "assert dependency_report(['','# generated']) == {'direct_count': 0, 'unpinned': [], 'reproducible': True}", hint: "An empty set has no unpinned dependency." },
      ],
    },
  };

  if (topic.title === "JSON") return {
    title: "Relay payload mission",
    instructions: "Complete parse_relay_json(payload). Decode JSON, require exactly usable name, online, and power fields with types str, bool, and int/float, and return a normalized dictionary. Raise ValueError for malformed JSON or an invalid contract.",
    starterCode: "import json\n\ndef parse_relay_json(payload):\n    # TODO: decode and validate this external boundary.\n    return None\n\nprint(parse_relay_json('{\"name\":\"Aurora\",\"online\":true,\"power\":82}'))\n",
    visibleExamples: [
      { label: "VISIBLE PAYLOAD", input: "{\"name\":\"Aurora\",\"online\":true,\"power\":82}", output: "{'name': 'Aurora', 'online': True, 'power': 82.0}" },
      { label: "INVALID TYPE", input: "power is text", output: "raises ValueError" },
    ],
    runtime: {
      minimumCodeLength: 150,
      requiredPatterns: [{ pattern: "\\bjson\\.loads\\s*\\(", flags: "im", name: "Decodes JSON text", hint: "Use json.loads(payload) inside specific error handling." }],
      pythonTests: [
        { name: "Parser exists", code: "assert callable(globals().get('parse_relay_json'))", hint: "Keep parse_relay_json(payload)." },
        { name: "Normalizes the visible payload", code: "assert parse_relay_json('{\"name\":\"Aurora\",\"online\":true,\"power\":82}') == {'name':'Aurora','online':True,'power':82.0}", hint: "Validate types and normalize power with float()." },
        { name: "Preserves false boolean meaning", code: "assert parse_relay_json('{\"name\":\"Ember\",\"online\":false,\"power\":0}') == {'name':'Ember','online':False,'power':0.0}", hint: "Require a real bool instead of relying on truthiness." },
        { name: "Rejects malformed and invalid payloads", code: "for bad in ('bad', '{}', '{\"name\":\"A\",\"online\":\"yes\",\"power\":1}', '{\"name\":\"A\",\"online\":true,\"power\":\"high\"}'):\n    try:\n        parse_relay_json(bad)\n        assert False\n    except ValueError:\n        pass", hint: "Translate decoding and contract failures into ValueError." },
      ],
    },
  };

  if (topic.title === "Debugging basics") return {
    title: "Broken average mission",
    instructions: "Repair average_power(readings). It must return 0.0 for an empty list, include every reading exactly once, and return the arithmetic mean rounded to two decimals. Add at least one assertion that protects the fixed behavior.",
    starterCode: "def average_power(readings):\n    # BUGS: empty input fails and the last reading is skipped.\n    total = sum(readings[:-1])\n    return round(total / len(readings), 2)\n\n# TODO: add a regression assertion, then fix the cause.\nprint(average_power([96, 82, 44]))\n",
    visibleExamples: [
      { label: "FAILING CASE", input: "average_power([96, 82, 44])", output: "74.0" },
      { label: "EDGE CASE", input: "average_power([])", output: "0.0" },
    ],
    runtime: {
      minimumCodeLength: 90,
      requiredPatterns: [{ pattern: "\\bassert\\b", flags: "im", name: "Adds a regression check", hint: "Add an assert for the visible or empty failing case." }],
      pythonTests: [
        { name: "Average function exists", code: "assert callable(globals().get('average_power'))", hint: "Keep average_power(readings)." },
        { name: "Repairs the visible failure", code: "assert average_power([96,82,44]) == 74.0", hint: "Include every reading in the sum." },
        { name: "Repairs the empty failure", code: "assert average_power([]) == 0.0", hint: "Handle empty input before dividing." },
        { name: "Works beyond the example", code: "assert average_power([1,2,2]) == 1.67 and average_power([70]) == 70.0", hint: "Calculate from all supplied inputs and round to two decimals." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["sectors · 3 rows", "relays · 4 rows", "readings · 4 rows", "Aurora has 2 relays"] };

export function buildRoundFourSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Integrity Network") return {
    ...sqlBase,
    title: "Integrity Network SQL project",
    instructions: "Create relay_assignments with assignment_id as a primary key, relay_id as a named cascading foreign key, a non-null role, and a named CHECK allowing scout or guardian. Enforce one role per relay with UNIQUE(relay_id, role), insert two assignments, then LEFT JOIN all relays to assignments and return name plus role ordered by relay_id. This project gates the next world.",
    starterCode: "-- Integrity Network applied project\nCREATE TABLE relay_assignments (\n  assignment_id bigint PRIMARY KEY,\n  relay_id bigint /* named cascading foreign key */,\n  role text NOT NULL,\n  /* named role check */,\n  /* one role per relay */\n);\n\nINSERT INTO relay_assignments VALUES\n  (1, 1, 'guardian'),\n  (2, 3, 'scout');\n\nSELECT r.name, a.role\nFROM relays r\n/* preserve every relay and join assignments */\nORDER BY r.relay_id;\n",
    visibleExamples: [
      { label: "ASSIGNED", input: "Aurora Prime", output: "Aurora Prime · guardian" },
      { label: "UNASSIGNED PRESERVED", input: "Aurora Edge", output: "Aurora Edge · NULL" },
    ],
    runtime: {
      minimumCodeLength: 250,
      requiredPatterns: [
        { pattern: "\\bFOREIGN\\s+KEY\\b[\\s\\S]*\\bON\\s+DELETE\\s+CASCADE\\b", flags: "i", name: "Defines relationship lifecycle", hint: "Create a named foreign key to relays(relay_id) with ON DELETE CASCADE." },
        { pattern: "\\bCHECK\\s*\\([\\s\\S]*\\bIN\\s*\\(", flags: "i", name: "Constrains assignment roles", hint: "Add a named CHECK limiting role to scout or guardian." },
        { pattern: "\\bLEFT\\s+JOIN\\b", flags: "i", name: "Preserves unassigned relays", hint: "LEFT JOIN from relays to relay_assignments." },
      ],
      sqlTests: [
        { name: "Foreign key is enforced", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name='relay_assignments' AND constraint_type='FOREIGN KEY'", column: "count", expected: 1, hint: "Create the relay_id foreign key." },
        { name: "Role rules are enforced", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name='relay_assignments' AND constraint_type IN ('CHECK','UNIQUE')", column: "count", expected: 2, hint: "Add both the named role CHECK and UNIQUE(relay_id, role)." },
        { name: "Joined columns are exact", kind: "result-columns", columns: ["name", "role"], hint: "Return relay name and assignment role." },
        { name: "Every relay is preserved", kind: "result-ordered-values", column: "name", expected: ["Aurora Prime", "Aurora Edge", "Ember Gate", "Tidal Link"], hint: "Start from relays, LEFT JOIN assignments, and order by relay_id." },
        { name: "Assignment positions are correct", kind: "result-ordered-values", column: "role", expected: ["guardian", "null", "scout", "null"], hint: "Insert the two supplied assignments and preserve unmatched rows as NULL." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Foreign keys") return {
    ...sqlBase,
    title: "Relay note relationship mission",
    instructions: "Create relay_notes with note_id as its primary key and a named foreign key from relay_id to relays(relay_id) using ON DELETE CASCADE. Add an index on relay_id, insert one note for relay 1, then return note_id, relay_id, and note.",
    starterCode: "CREATE TABLE relay_notes (\n  note_id bigint PRIMARY KEY,\n  relay_id bigint NOT NULL,\n  note text NOT NULL,\n  CONSTRAINT /* name */ FOREIGN KEY (relay_id)\n    REFERENCES relays(relay_id) /* delete action */\n);\n\nCREATE INDEX /* name */ ON relay_notes(relay_id);\nINSERT INTO relay_notes VALUES (1, 1, 'inspection complete');\nSELECT note_id, relay_id, note FROM relay_notes;\n",
    visibleExamples: [
      { label: "VALID REFERENCE", input: "relay_id 1 exists", output: "note is inserted" },
      { label: "INVALID REFERENCE", input: "missing relay id", output: "foreign-key violation" },
    ],
    runtime: {
      minimumCodeLength: 190,
      requiredPatterns: [{ pattern: "CONSTRAINT\\s+fk_relay_notes_relay\\s+FOREIGN\\s+KEY[\\s\\S]*ON\\s+DELETE\\s+CASCADE", flags: "i", name: "Defines a named cascading relationship", hint: "Name it fk_relay_notes_relay and add ON DELETE CASCADE." }],
      sqlTests: [
        { name: "Foreign key exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name='relay_notes' AND constraint_type='FOREIGN KEY' AND constraint_name='fk_relay_notes_relay'", column: "count", expected: 1, hint: "Use the exact constraint name fk_relay_notes_relay." },
        { name: "Cascade lifecycle is declared", kind: "database-value", query: "SELECT delete_rule FROM information_schema.referential_constraints WHERE constraint_name='fk_relay_notes_relay'", column: "delete_rule", expected: "CASCADE", hint: "Add ON DELETE CASCADE to the foreign key." },
        { name: "Child lookup is indexed", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE tablename='relay_notes' AND indexdef ILIKE '%(relay_id)%'", column: "count", expected: 1, hint: "Create an index on relay_notes(relay_id)." },
        { name: "Inserted note is returned", kind: "result-value", column: "note", expected: "inspection complete", hint: "Insert and select the supplied note." },
      ],
    },
  };

  if (topic.title === "Constraints") return {
    ...sqlBase,
    title: "Battery invariant mission",
    instructions: "Create batteries with a bigint primary key, non-null serial, charge, named unique serial constraint, and named charge CHECK from 0 through 100. Insert battery B-01 at charge 82 and return it.",
    starterCode: "CREATE TABLE batteries (\n  battery_id bigint PRIMARY KEY,\n  serial text NOT NULL,\n  charge integer NOT NULL,\n  CONSTRAINT uq_batteries_serial /* uniqueness rule */,\n  CONSTRAINT ck_batteries_charge /* range rule */\n);\n\nINSERT INTO batteries VALUES (1, 'B-01', 82);\nSELECT battery_id, serial, charge FROM batteries;\n",
    visibleExamples: [
      { label: "VALID BATTERY", input: "B-01 · charge 82", output: "inserted" },
      { label: "INVALID CHARGE", input: "charge 120", output: "check violation" },
    ],
    runtime: {
      minimumCodeLength: 175,
      requiredPatterns: [
        { pattern: "CONSTRAINT\\s+uq_batteries_serial\\s+UNIQUE\\s*\\(\\s*serial\\s*\\)", flags: "i", name: "Names the serial invariant", hint: "Add CONSTRAINT uq_batteries_serial UNIQUE(serial)." },
        { pattern: "CONSTRAINT\\s+ck_batteries_charge\\s+CHECK\\s*\\([\\s\\S]*BETWEEN\\s+0\\s+AND\\s+100", flags: "i", name: "Names the charge invariant", hint: "Add a named CHECK using charge BETWEEN 0 AND 100." },
      ],
      sqlTests: [
        { name: "Unique serial is enforced", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name='batteries' AND constraint_name='uq_batteries_serial' AND constraint_type='UNIQUE'", column: "count", expected: 1, hint: "Create the exact named UNIQUE constraint." },
        { name: "Charge range is enforced", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name='batteries' AND constraint_name='ck_batteries_charge' AND constraint_type='CHECK'", column: "count", expected: 1, hint: "Create the exact named CHECK constraint." },
        { name: "Required fields are non-null", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.columns WHERE table_name='batteries' AND column_name IN ('serial','charge') AND is_nullable='NO'", column: "count", expected: 2, hint: "Declare both serial and charge NOT NULL." },
        { name: "Valid battery is visible", kind: "result-value", column: "serial", expected: "B-01", hint: "Insert and return the supplied valid row." },
      ],
    },
  };

  if (topic.title === "Relationships") return {
    ...sqlBase,
    title: "Relay tag network mission",
    instructions: "Create tags and relay_tags. Model the many-to-many relationship with foreign keys and a composite primary key, store assigned_at on the relationship, insert two tags and three assignments, then return relay_name and tag_name ordered by both names.",
    starterCode: "CREATE TABLE tags (\n  tag_id bigint PRIMARY KEY,\n  name text NOT NULL UNIQUE\n);\n\nCREATE TABLE relay_tags (\n  relay_id bigint REFERENCES relays(relay_id),\n  tag_id bigint REFERENCES tags(tag_id),\n  assigned_at timestamptz NOT NULL DEFAULT now(),\n  /* composite relationship identity */\n);\n\nINSERT INTO tags VALUES (1, 'priority'), (2, 'coastal');\nINSERT INTO relay_tags (relay_id, tag_id) VALUES (1, 1), (4, 1), (4, 2);\n\nSELECT r.name AS relay_name, t.name AS tag_name\nFROM relay_tags rt\nJOIN relays r ON r.relay_id = rt.relay_id\nJOIN tags t ON t.tag_id = rt.tag_id\nORDER BY relay_name, tag_name;\n",
    visibleExamples: [
      { label: "ONE-TO-MANY SIDE", input: "priority tag", output: "Aurora Prime and Tidal Link" },
      { label: "RELATIONSHIP FACT", input: "assignment", output: "assigned_at belongs on relay_tags" },
    ],
    runtime: {
      minimumCodeLength: 290,
      requiredPatterns: [{ pattern: "PRIMARY\\s+KEY\\s*\\(\\s*relay_id\\s*,\\s*tag_id\\s*\\)", flags: "i", name: "Defines composite relationship identity", hint: "Use PRIMARY KEY (relay_id, tag_id) on relay_tags." }],
      sqlTests: [
        { name: "Junction has two foreign keys", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name='relay_tags' AND constraint_type='FOREIGN KEY'", column: "count", expected: 2, hint: "Reference both relays and tags." },
        { name: "Junction has composite identity", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.key_column_usage WHERE table_name='relay_tags' AND constraint_name IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name='relay_tags' AND constraint_type='PRIMARY KEY')", column: "count", expected: 2, hint: "Make both foreign keys the composite primary key." },
        { name: "Relationship rows are ordered", kind: "result-ordered-values", column: "relay_name", expected: ["Aurora Prime", "Tidal Link", "Tidal Link"], hint: "Join through the junction and order by relay_name, tag_name." },
        { name: "Tags match their assignments", kind: "result-ordered-values", column: "tag_name", expected: ["priority", "coastal", "priority"], hint: "Insert all three supplied associations." },
      ],
    },
  };

  if (topic.title === "JOINs") return {
    ...sqlBase,
    title: "Relay sector join mission",
    instructions: "Return every relay name with sector_name by joining relays to sectors on sector_id. Use explicit aliases and order by relay_id.",
    starterCode: "SELECT\n  r.name,\n  /* related sector name */ AS sector_name\nFROM relays r\n/* join sectors with an explicit key relationship */\nORDER BY r.relay_id;\n",
    visibleExamples: [
      { label: "FIRST RELAY", input: "Aurora Prime", output: "Aurora" },
      { label: "LAST RELAY", input: "Tidal Link", output: "Tidal" },
    ],
    runtime: {
      minimumCodeLength: 75,
      requiredPatterns: [{ pattern: "\\bJOIN\\s+sectors\\s+s\\s+ON\\s+s\\.sector_id\\s*=\\s*r\\.sector_id", flags: "i", name: "Follows the sector relationship", hint: "JOIN sectors s ON s.sector_id = r.sector_id." }],
      sqlTests: [
        { name: "Joined columns are exact", kind: "result-columns", columns: ["name", "sector_name"], hint: "Select r.name and alias s.name AS sector_name." },
        { name: "Every relay is joined", kind: "result-ordered-values", column: "name", expected: ["Aurora Prime", "Aurora Edge", "Ember Gate", "Tidal Link"], hint: "Do not filter, and order by r.relay_id." },
        { name: "Sector matches are correct", kind: "result-ordered-values", column: "sector_name", expected: ["Aurora", "Aurora", "Ember", "Tidal"], hint: "Join on the sector_id foreign-key relationship." },
      ],
    },
  };

  return null;
}
