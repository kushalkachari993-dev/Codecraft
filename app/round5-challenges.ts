import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundFivePythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Algorithm Grove") return {
    title: "Algorithm Grove Python project",
    instructions: "Build map_route(root). Each node is a dictionary with name and children. Recursively visit the tree once, reject a missing/blank name or non-list children with ValueError, and return nodes, max_depth (root is depth 1), and alphabetically sorted unique_names. This project gates the next world.",
    starterCode: "# Algorithm Grove applied project\ndef map_route(root):\n    unique_names = set()\n\n    def visit(node, depth):\n        # TODO: validate this node, record its name, and recurse into children.\n        return None\n\n    # TODO: start at depth 1 and return the complete report.\n    return None\n\nroute = {'name': 'spawn', 'children': [{'name': 'vault', 'children': []}]}\nprint(map_route(route))\n",
    visibleExamples: [
      { label: "VISIBLE TREE", input: "spawn → vault", output: "{'nodes': 2, 'max_depth': 2, 'unique_names': ['spawn', 'vault']}" },
      { label: "BRANCHING TREE", input: "root with two children sharing one name", output: "node count includes both; unique_names does not duplicate" },
    ],
    runtime: {
      minimumCodeLength: 230,
      requiredPatterns: [
        { pattern: "\\bset\\s*\\(", flags: "im", name: "Tracks unique names efficiently", hint: "Use the supplied set to collect unique names." },
        { pattern: "def\\s+visit[\\s\\S]*\\bvisit\\s*\\(", flags: "im", name: "Traverses recursively", hint: "Call visit for each child from inside visit." },
        { pattern: "\\bfor\\b", flags: "im", name: "Processes every child", hint: "Loop over node['children'] exactly once." },
      ],
      pythonTests: [
        { name: "Route mapper exists", code: "assert callable(globals().get('map_route'))", hint: "Keep map_route(root) exactly as named." },
        { name: "Maps the visible route", code: "r={'name':'spawn','children':[{'name':'vault','children':[]}]}; assert map_route(r) == {'nodes':2,'max_depth':2,'unique_names':['spawn','vault']}", hint: "Count the root at depth 1 and recurse into every child." },
        { name: "Handles branching and duplicate names", code: "r={'name':'root','children':[{'name':'east','children':[{'name':'leaf','children':[]}]},{'name':'east','children':[]}]}; assert map_route(r) == {'nodes':4,'max_depth':3,'unique_names':['east','leaf','root']}", hint: "Node count includes occurrences; the set removes duplicate names." },
        { name: "Handles a single node", code: "assert map_route({'name':'solo','children':[]}) == {'nodes':1,'max_depth':1,'unique_names':['solo']}", hint: "The root is a valid base case at depth 1." },
        { name: "Rejects malformed nodes", code: "for bad in ({'name':'','children':[]},{'name':'x','children':'none'},{'children':[]}):\n    try:\n        map_route(bad)\n        assert False\n    except ValueError:\n        pass", hint: "Raise ValueError for missing/blank names and non-list children." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Basic DSA") return {
    title: "Stable queue deduplication mission",
    instructions: "Complete unique_queue(items). Preserve the first occurrence order while removing duplicates. Use a set for membership and return a new list without mutating items.",
    starterCode: "def unique_queue(items):\n    seen = set()\n    result = []\n    # TODO: add each unseen item once, in original order.\n    return result\n\nprint(unique_queue(['scan', 'build', 'scan', 'repair']))\n",
    visibleExamples: [
      { label: "VISIBLE QUEUE", input: "scan, build, scan, repair", output: "['scan', 'build', 'repair']" },
      { label: "EMPTY QUEUE", input: "[]", output: "[]" },
    ],
    runtime: {
      minimumCodeLength: 85,
      requiredPatterns: [
        { pattern: "\\bset\\s*\\(", flags: "im", name: "Uses hashed membership", hint: "Keep a set of names already seen." },
        { pattern: "\\.append\\s*\\(", flags: "im", name: "Builds ordered output", hint: "Append only unseen items to result." },
      ],
      pythonTests: [
        { name: "Queue function exists", code: "assert callable(globals().get('unique_queue'))", hint: "Keep unique_queue(items)." },
        { name: "Removes duplicates stably", code: "assert unique_queue(['scan','build','scan','repair']) == ['scan','build','repair']", hint: "Check seen before appending, then add the item to seen." },
        { name: "Handles empty and repeated input", code: "assert unique_queue([]) == [] and unique_queue(['a','a','a']) == ['a']", hint: "Initialized structures already describe empty input." },
        { name: "Preserves caller state", code: "original=['b','a','b']; result=unique_queue(original); assert original == ['b','a','b'] and result == ['b','a'] and result is not original", hint: "Build and return a new list." },
      ],
    },
  };

  if (topic.title === "Big-O basics") return {
    title: "Linear two-signal mission",
    instructions: "Complete find_pair(values, target). In one loop, use a dictionary of previously seen values to return the indices of the first pair whose values sum to target. Return None if no pair exists; do not use nested loops.",
    starterCode: "def find_pair(values, target):\n    seen = {}\n    # TODO: find the needed complement in one pass.\n    return None\n\nprint(find_pair([4, 7, 1, 9], 10))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "[4, 7, 1, 9], target 10", output: "(2, 3)" },
      { label: "NO MATCH", input: "[1, 2], target 8", output: "None" },
    ],
    runtime: {
      minimumCodeLength: 90,
      requiredPatterns: [
        { pattern: "\\bfor\\b", flags: "im", name: "Scans once", hint: "Use one for loop over enumerate(values)." },
        { pattern: "\\bseen\\s*=\\s*\\{", flags: "im", name: "Builds a constant-time lookup", hint: "Store earlier value-to-index mappings in seen." },
      ],
      pythonTests: [
        { name: "Pair finder exists", code: "assert callable(globals().get('find_pair'))", hint: "Keep find_pair(values, target)." },
        { name: "Finds the visible pair", code: "assert find_pair([4,7,1,9], 10) == (2,3)", hint: "Check whether target - value has already been seen before storing the current value." },
        { name: "Uses distinct indices", code: "assert find_pair([5,5], 10) == (0,1) and find_pair([5], 10) is None", hint: "A value cannot pair with its own index." },
        { name: "Handles missing and negative pairs", code: "assert find_pair([1,2],8) is None and find_pair([-3,8,4],5) == (0,1)", hint: "Return None after the loop and support any numeric complement." },
      ],
    },
  };

  if (topic.title === "Basic recursion") return {
    title: "Recursive energy mission",
    instructions: "Complete recursive_sum(values). Return 0 for an empty list; otherwise return the first value plus the recursive sum of the remaining values. Do not use sum() or a loop.",
    starterCode: "def recursive_sum(values):\n    # TODO: define the base case and a smaller recursive call.\n    return None\n\nprint(recursive_sum([4, 7, 1]))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "[4, 7, 1]", output: "12" },
      { label: "BASE CASE", input: "[]", output: "0" },
    ],
    runtime: {
      minimumCodeLength: 65,
      requiredPatterns: [{ pattern: "recursive_sum\\s*\\(\\s*values\\s*\\[\\s*1\\s*:\\s*\\]\\s*\\)", flags: "im", name: "Makes a smaller recursive call", hint: "Add values[0] to recursive_sum(values[1:])." }],
      pythonTests: [
        { name: "Recursive function exists", code: "assert callable(globals().get('recursive_sum'))", hint: "Keep recursive_sum(values)." },
        { name: "Resolves the base case", code: "assert recursive_sum([]) == 0", hint: "Return 0 when values is empty." },
        { name: "Sums the visible input", code: "assert recursive_sum([4,7,1]) == 12", hint: "Combine the first value with the recursive result for the remainder." },
        { name: "Handles another recursive path", code: "assert recursive_sum([-2,5,10,-1]) == 12 and recursive_sum([9]) == 9", hint: "Do not hard-code the visible list." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["sectors · 3 rows", "relays · 4 rows", "readings · 4 rows", "events include timezone-aware timestamps"] };

export function buildRoundFiveSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Relational Design") return {
    ...sqlBase,
    title: "Relational Design SQL project",
    instructions: "Design maintenance_plans and maintenance_tasks. Give both stable bigint primary keys; link tasks to plans with a cascading foreign key; require a non-blank plan name, task title, and due_at timestamptz; constrain task status to queued or done. Insert one plan and two tasks, then return plan_name, normalized task_title, due_day in UTC, and status ordered by task_id. This project gates the next world.",
    starterCode: "-- Relational Design applied project\nCREATE TABLE maintenance_plans (\n  plan_id bigint PRIMARY KEY,\n  name text NOT NULL /* non-blank rule */\n);\n\nCREATE TABLE maintenance_tasks (\n  task_id bigint PRIMARY KEY,\n  plan_id bigint NOT NULL /* cascading relationship */,\n  title text NOT NULL /* non-blank rule */,\n  due_at timestamptz NOT NULL,\n  status text NOT NULL /* queued/done rule */\n);\n\nINSERT INTO maintenance_plans VALUES (1, 'Aurora recovery');\nINSERT INTO maintenance_tasks VALUES\n  (1, 1, ' inspect core ', '2026-09-01T10:00:00Z', 'queued'),\n  (2, 1, 'replace cell', '2026-09-02T10:00:00Z', 'done');\n\nSELECT\n  p.name AS plan_name,\n  /* normalized title */ AS task_title,\n  /* UTC calendar day */ AS due_day,\n  t.status\nFROM maintenance_tasks t\nJOIN maintenance_plans p ON p.plan_id = t.plan_id\nORDER BY t.task_id;\n",
    visibleExamples: [
      { label: "FIRST TASK", input: " inspect core ", output: "Aurora recovery · INSPECT CORE · 2026-09-01 · queued" },
      { label: "LIFECYCLE", input: "delete plan", output: "its maintenance tasks cascade" },
    ],
    runtime: {
      minimumCodeLength: 390,
      requiredPatterns: [
        { pattern: "\\bREFERENCES\\s+maintenance_plans\\s*\\(\\s*plan_id\\s*\\)\\s+ON\\s+DELETE\\s+CASCADE", flags: "i", name: "Defines task lifecycle", hint: "Make plan_id reference maintenance_plans(plan_id) with ON DELETE CASCADE." },
        { pattern: "\\bCHECK\\s*\\([\\s\\S]*status\\s+IN\\s*\\(", flags: "i", name: "Constrains task status", hint: "Allow only queued and done statuses with CHECK." },
        { pattern: "\\bupper\\s*\\(\\s*trim\\s*\\(", flags: "i", name: "Normalizes task titles", hint: "Return upper(trim(t.title)) AS task_title." },
        { pattern: "AT\\s+TIME\\s+ZONE\\s+['\"]UTC['\"]", flags: "i", name: "Derives an explicit UTC day", hint: "Convert due_at AT TIME ZONE 'UTC' before casting to date." },
      ],
      sqlTests: [
        { name: "Task relationship exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name='maintenance_tasks' AND constraint_type='FOREIGN KEY'", column: "count", expected: 1, hint: "Create the plan_id foreign key." },
        { name: "Task status is constrained", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name='maintenance_tasks' AND constraint_type='CHECK'", column: "count", expected: 1, hint: "Add the explicit status CHECK allowing only queued and done." },
        { name: "Project columns are exact", kind: "result-columns", columns: ["plan_name", "task_title", "due_day", "status"], hint: "Alias the plan, normalized title, and UTC day exactly." },
        { name: "Titles are normalized", kind: "result-ordered-values", column: "task_title", expected: ["INSPECT CORE", "REPLACE CELL"], hint: "Use upper(trim(t.title))." },
        { name: "Statuses remain ordered", kind: "result-ordered-values", column: "status", expected: ["queued", "done"], hint: "Order the final result by task_id." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Subqueries") return {
    ...sqlBase,
    title: "Northern relay subquery mission",
    instructions: "Return relay names whose sector belongs to the north region. Use an IN subquery that selects sector_id from sectors and order relay names alphabetically.",
    starterCode: "SELECT name\nFROM relays\nWHERE sector_id IN (\n  SELECT /* sector key */\n  FROM sectors\n  WHERE /* northern region */\n)\nORDER BY name;\n",
    visibleExamples: [
      { label: "NORTHERN SECTORS", input: "Aurora and Tidal", output: "3 matching relays" },
      { label: "EXCLUDED", input: "Ember Gate", output: "south region" },
    ],
    runtime: {
      minimumCodeLength: 80,
      requiredPatterns: [{ pattern: "\\bIN\\s*\\(\\s*SELECT\\b", flags: "i", name: "Consumes a set subquery", hint: "Use sector_id IN (SELECT sector_id FROM sectors ...)." }],
      sqlTests: [
        { name: "Subquery result column is exact", kind: "result-columns", columns: ["name"], hint: "Return only relay name." },
        { name: "Northern relays are ordered", kind: "result-ordered-values", column: "name", expected: ["Aurora Edge", "Aurora Prime", "Tidal Link"], hint: "Filter sectors.region = 'north' inside the subquery and order by name." },
        { name: "No extra relays pass", kind: "result-max-rows", minRows: 3, maxRows: 3, hint: "The subquery should return only northern sector IDs." },
      ],
    },
  };

  if (topic.title === "String functions") return {
    ...sqlBase,
    title: "Callsign normalization mission",
    instructions: "Return Aurora relay names as normalized_name and name_length. Filter case-insensitively for names beginning with aurora, normalize with upper(trim(name)), measure the trimmed length, and order by relay_id.",
    starterCode: "SELECT\n  /* uppercase trimmed name */ AS normalized_name,\n  /* trimmed character count */ AS name_length\nFROM relays\nWHERE /* case-insensitive prefix */\nORDER BY relay_id;\n",
    visibleExamples: [
      { label: "FIRST RESULT", input: "Aurora Prime", output: "AURORA PRIME · 12" },
      { label: "MATCH RULE", input: "aurora%", output: "Aurora Prime and Aurora Edge" },
    ],
    runtime: {
      minimumCodeLength: 100,
      requiredPatterns: [
        { pattern: "upper\\s*\\(\\s*trim\\s*\\(\\s*name\\s*\\)\\s*\\)", flags: "i", name: "Normalizes the display value", hint: "Use upper(trim(name))." },
        { pattern: "\\bILIKE\\s+['\"]aurora%['\"]", flags: "i", name: "Uses case-insensitive prefix matching", hint: "Filter name ILIKE 'aurora%'." },
      ],
      sqlTests: [
        { name: "String result columns are exact", kind: "result-columns", columns: ["normalized_name", "name_length"], hint: "Alias both calculated columns exactly." },
        { name: "Names are normalized and ordered", kind: "result-ordered-values", column: "normalized_name", expected: ["AURORA PRIME", "AURORA EDGE"], hint: "Order by relay_id after filtering the Aurora prefix." },
        { name: "Lengths use trimmed text", kind: "result-ordered-values", column: "name_length", expected: [12, 11], hint: "Use length(trim(name))." },
      ],
    },
  };

  if (topic.title === "Date functions") return {
    ...sqlBase,
    title: "Relay timeline mission",
    instructions: "Return every relay name, its UTC created_day, and age_hours as the whole elapsed hours from created_at to now. Convert the day explicitly with AT TIME ZONE UTC, calculate age from EXTRACT(EPOCH), and order newest first with relay_id descending as the tie-breaker.",
    starterCode: "SELECT\n  name,\n  /* created_at in UTC, cast to date */ AS created_day,\n  /* elapsed whole hours */ AS age_hours\nFROM relays\nORDER BY created_at DESC, relay_id DESC;\n",
    visibleExamples: [
      { label: "NEWEST FIRST", input: "Tidal Link", output: "first result" },
      { label: "UTC DAY", input: "created_at instant", output: "calendar date derived in UTC" },
    ],
    runtime: {
      minimumCodeLength: 125,
      requiredPatterns: [
        { pattern: "AT\\s+TIME\\s+ZONE\\s+['\"]UTC['\"]", flags: "i", name: "Chooses the reporting timezone", hint: "Use (created_at AT TIME ZONE 'UTC')::date." },
        { pattern: "EXTRACT\\s*\\(\\s*EPOCH\\s+FROM", flags: "i", name: "Measures elapsed duration", hint: "Extract epoch from now() - created_at and divide by 3600." },
      ],
      sqlTests: [
        { name: "Timeline columns are exact", kind: "result-columns", columns: ["name", "created_day", "age_hours"], hint: "Alias the calculated day and hour values exactly." },
        { name: "Every relay is included", kind: "result-min-rows", minRows: 4, hint: "Do not filter the relay table." },
        { name: "Newest relays are ordered", kind: "result-ordered-values", column: "name", expected: ["Tidal Link", "Ember Gate", "Aurora Edge", "Aurora Prime"], hint: "Order created_at DESC, relay_id DESC." },
      ],
    },
  };

  if (topic.title === "Basic schema design") return {
    ...sqlBase,
    title: "Inspection schema mission",
    instructions: "Create inspections with inspection_id as a bigint primary key, relay_id as a cascading foreign key, inspected_at timestamptz, non-null numeric score constrained from 0 to 100, and non-blank notes. Insert one inspection and return it joined to the relay name.",
    starterCode: "CREATE TABLE inspections (\n  inspection_id bigint PRIMARY KEY,\n  relay_id bigint NOT NULL /* relationship */,\n  inspected_at timestamptz NOT NULL,\n  score numeric(5,2) NOT NULL /* range rule */,\n  notes text NOT NULL /* non-blank rule */\n);\n\nINSERT INTO inspections VALUES (1, 1, '2026-09-01T10:00:00Z', 94.5, 'core stable');\n\nSELECT i.inspection_id, r.name AS relay_name, i.score, i.notes\nFROM inspections i\nJOIN relays r ON r.relay_id = i.relay_id;\n",
    visibleExamples: [
      { label: "VALID RECORD", input: "Aurora Prime · score 94.5", output: "joined inspection row" },
      { label: "INVALID RECORD", input: "score 120", output: "check violation" },
    ],
    runtime: {
      minimumCodeLength: 260,
      requiredPatterns: [
        { pattern: "REFERENCES\\s+relays\\s*\\(\\s*relay_id\\s*\\)\\s+ON\\s+DELETE\\s+CASCADE", flags: "i", name: "Models inspection ownership", hint: "Reference relays(relay_id) with ON DELETE CASCADE." },
        { pattern: "CHECK\\s*\\(\\s*score\\s+BETWEEN\\s+0\\s+AND\\s+100\\s*\\)", flags: "i", name: "Protects the score invariant", hint: "Add CHECK (score BETWEEN 0 AND 100)." },
      ],
      sqlTests: [
        { name: "Inspection relationship exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name='inspections' AND constraint_type='FOREIGN KEY'", column: "count", expected: 1, hint: "Create the relay foreign key." },
        { name: "Score rule exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name='inspections' AND constraint_type='CHECK'", column: "count", expected: 1, hint: "Add the explicit score range CHECK." },
        { name: "Joined result columns are exact", kind: "result-columns", columns: ["inspection_id", "relay_name", "score", "notes"], hint: "Return the four requested columns." },
        { name: "Inspection joins to its relay", kind: "result-value", column: "relay_name", expected: "Aurora Prime", hint: "Join inspections.relay_id to relays.relay_id." },
      ],
    },
  };

  return null;
}
