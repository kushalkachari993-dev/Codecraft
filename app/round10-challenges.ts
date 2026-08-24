import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundTenPythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Algorithm Arena") return {
    title: "Algorithm Arena Python project",
    instructions: "Build restore_network(graph, power_by_node, start, target). Validate that graph and power_by_node are dictionaries, every graph node and neighbor has numeric power, and every neighbor exists as a graph node. Use breadth-first search with collections.deque to find a shortest unweighted route. Neighbors must be visited in sorted order so ties are deterministic. Return {'path': tuple(...), 'hops': int, 'minimum_power': number}. Return None when the target is unreachable, handle start equal to target, and never mutate either input.",
    starterCode: "from collections import deque\n\ndef restore_network(graph, power_by_node, start, target):\n    # TODO 1: validate the complete graph and power map.\n    # TODO 2: run deterministic BFS with a deque, visited set, and parent map.\n    # TODO 3: reconstruct an immutable path and its minimum power.\n    return None\n",
    visibleExamples: [
      { label: "SHORTEST ROUTE", input: "A connects B,C; both reach D", output: "sorted tie-break chooses ('A','B','D'), 2 hops" },
      { label: "DISCONNECTED", input: "target exists but cannot be reached", output: "None" },
    ],
    runtime: {
      minimumCodeLength: 430,
      requiredPatterns: [
        { pattern: "deque\\s*\\(", flags: "im", name: "Uses a BFS queue", hint: "Initialize the frontier with collections.deque." },
        { pattern: "\\b(?:visited|seen)\\b", flags: "im", name: "Tracks hashed membership", hint: "Keep a set of nodes when they are discovered." },
        { pattern: "\\b(?:parent|parents)\\b", flags: "im", name: "Records the route tree", hint: "Map each discovered node to the node that found it." },
        { pattern: "tuple\\s*\\(", flags: "im", name: "Returns an immutable path", hint: "Convert the reconstructed path to a tuple." },
      ],
      pythonTests: [
        { name: "Shortest route is deterministic", code: "g={'A':['C','B'],'B':['D'],'C':['D'],'D':[]}; p={'A':90,'B':70,'C':80,'D':60}; assert restore_network(g,p,'A','D')=={'path':('A','B','D'),'hops':2,'minimum_power':60}", hint: "BFS by sorted neighbors, record parents once, and reverse the reconstructed route." },
        { name: "Same node and unreachable routes work", code: "g={'A':['B'],'B':[],'C':[]}; p={'A':9,'B':5,'C':7}; assert restore_network(g,p,'A','A')=={'path':('A',),'hops':0,'minimum_power':9} and restore_network(g,p,'A','C') is None", hint: "Handle start == target directly and return None after an exhausted frontier." },
        { name: "Inputs remain unchanged", code: "g={'A':['B'],'B':[]}; p={'A':9,'B':5}; gs={k:list(v) for k,v in g.items()}; ps=dict(p); restore_network(g,p,'A','B'); assert g==gs and p==ps", hint: "Sort a copy or iterate over sorted(neighbors); do not edit caller data." },
        { name: "Malformed networks are rejected", code: "cases=[({'A':['B']},{'A':1},'A','B'),({'A':[]},{'A':'high'},'A','A'),([],{},'A','A')];\nfor g,p,s,t in cases:\n    try:\n        restore_network(g,p,s,t); assert False\n    except (TypeError,ValueError):\n        pass", hint: "Validate container types, references, and numeric power before traversal." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "DSA") return {
    title: "Stack and queue relay mission",
    instructions: "Complete process_relay_commands(commands). Support ('enqueue', value), ('dequeue',), ('push', value), and ('pop',). Use collections.deque for the FIFO queue and a list for the LIFO stack. Return outputs from dequeue/pop in command order. Raise ValueError for malformed commands, unknown operations, or removal from an empty structure, and do not mutate commands.",
    starterCode: "from collections import deque\n\ndef process_relay_commands(commands):\n    queue = deque()\n    stack = []\n    outputs = []\n    # TODO: preserve FIFO and LIFO invariants for every command.\n    return outputs\n",
    visibleExamples: [
      { label: "MIXED", input: "enqueue A, enqueue B, dequeue, push X, push Y, pop", output: "['A', 'Y']" },
      { label: "UNDERFLOW", input: "pop on an empty stack", output: "ValueError" },
    ],
    runtime: {
      minimumCodeLength: 220,
      requiredPatterns: [
        { pattern: "deque\\s*\\(", flags: "im", name: "Uses a queue structure", hint: "Keep the supplied deque and remove with popleft()." },
        { pattern: "\\.popleft\\s*\\(", flags: "im", name: "Preserves FIFO order", hint: "Remove the oldest queue item with popleft()." },
        { pattern: "stack\\.pop\\s*\\(", flags: "im", name: "Preserves LIFO order", hint: "Pop the newest list item." },
      ],
      pythonTests: [
        { name: "Queue and stack keep their invariants", code: "c=[('enqueue','A'),('enqueue','B'),('dequeue',),('push','X'),('push','Y'),('pop',),('dequeue',),('pop',)]; assert process_relay_commands(c)==['A','Y','B','X']", hint: "Queue removes oldest; stack removes newest." },
        { name: "Malformed and empty operations fail", code: "for c in [[('unknown',)],[('enqueue',)],[('dequeue',)],[('pop',)],['bad']]:\n    try:\n        process_relay_commands(c); assert False\n    except ValueError:\n        pass", hint: "Validate tuple shape and check capacity before removal." },
        { name: "Source commands are preserved", code: "c=[('enqueue',['A']),('dequeue',)]; original=[(x[0],list(x[1])) if len(x)==2 else x for x in c]; process_relay_commands(c); assert c==original", hint: "Read commands without modifying the source collection or payload." },
      ],
    },
  };

  if (topic.title === "Trees/Graphs") return {
    title: "Shortest graph route mission",
    instructions: "Implement shortest_route(graph, start, target) with breadth-first search. The graph is an adjacency dictionary. Visit neighbors in sorted order, return the shortest route as a list including endpoints, return None if unreachable, handle start == target, and raise ValueError for missing nodes or an edge pointing to an unknown node. Do not mutate graph.",
    starterCode: "from collections import deque\n\ndef shortest_route(graph, start, target):\n    # TODO: validate, traverse by layers, and reconstruct from parents.\n    return None\n",
    visibleExamples: [
      { label: "TIE", input: "A→C and A→B; both reach D", output: "['A','B','D']" },
      { label: "CYCLE", input: "A↔B and B→C", output: "terminates with ['A','B','C']" },
    ],
    runtime: {
      minimumCodeLength: 260,
      requiredPatterns: [
        { pattern: "deque\\s*\\(", flags: "im", name: "Explores breadth first", hint: "Use a deque frontier." },
        { pattern: "sorted\\s*\\(", flags: "im", name: "Makes ties deterministic", hint: "Iterate through sorted neighbors." },
      ],
      pythonTests: [
        { name: "Finds deterministic shortest routes", code: "g={'A':['C','B'],'B':['A','D'],'C':['D'],'D':[]}; assert shortest_route(g,'A','D')==['A','B','D'] and shortest_route(g,'A','A')==['A']", hint: "Mark nodes on discovery and reconstruct with parents." },
        { name: "Handles unreachable nodes", code: "g={'A':['B'],'B':[],'C':[]}; assert shortest_route(g,'A','C') is None", hint: "Return None once the queue is exhausted." },
        { name: "Rejects invalid references", code: "for g,s,t in [({'A':['X']},'A','A'),({'A':[]},'X','A'),({'A':[]},'A','X')]:\n    try:\n        shortest_route(g,s,t); assert False\n    except ValueError:\n        pass", hint: "Validate all nodes and edges before the start==target shortcut." },
      ],
    },
  };

  if (topic.title === "Algorithms") return {
    title: "Stable merge mission",
    instructions: "Implement merge_readings(left, right), where both inputs contain dictionaries with timestamp and value and are already sorted by timestamp. Merge in O(n+m) time without sorted() or mutating either input. When timestamps tie, emit the left record first. Return new dictionaries so later caller mutation cannot change the merged snapshot. Raise ValueError when an input is unsorted or a record lacks either field.",
    starterCode: "def merge_readings(left, right):\n    merged = []\n    i = j = 0\n    # TODO: validate and perform a stable two-pointer merge.\n    return merged\n",
    visibleExamples: [
      { label: "STABLE TIE", input: "left t=2 and right t=2", output: "left record precedes right record" },
      { label: "COMPLEXITY", input: "n left + m right readings", output: "one O(n+m) pass" },
    ],
    runtime: {
      minimumCodeLength: 260,
      requiredPatterns: [
        { pattern: "while\\s+", flags: "im", name: "Uses a two-pointer pass", hint: "Advance i or j inside a while loop." },
        { pattern: "\\.(?:copy)\\s*\\(|dict\\s*\\(", flags: "im", name: "Creates independent output records", hint: "Append a shallow copy of each flat record." },
      ],
      pythonTests: [
        { name: "Merge is ordered and stable", code: "a=[{'timestamp':1,'value':'L1'},{'timestamp':2,'value':'L2'}]; b=[{'timestamp':2,'value':'R2'},{'timestamp':3,'value':'R3'}]; assert [x['value'] for x in merge_readings(a,b)]==['L1','L2','R2','R3']", hint: "Use <= so a tied left record is emitted first." },
        { name: "Inputs and output do not alias", code: "a=[{'timestamp':1,'value':'A'}]; b=[]; r=merge_readings(a,b); r[0]['value']='X'; assert a==[{'timestamp':1,'value':'A'}]", hint: "Append copied dictionaries and never remove from inputs." },
        { name: "Invalid sequences are rejected", code: "cases=[([{'timestamp':2,'value':1},{'timestamp':1,'value':2}],[]),([{'timestamp':1}],[])];\nfor a,b in cases:\n    try:\n        merge_readings(a,b); assert False\n    except ValueError:\n        pass", hint: "Validate fields and nondecreasing timestamps before merging." },
      ],
    },
  };

  if (topic.title === "Memory concepts") return {
    title: "Immutable reading snapshot mission",
    instructions: "Implement snapshot_readings(readings). Validate a list of dictionaries containing sensor and values, where values is a list of numbers. Return a tuple of (sensor, tuple(values)) records. Reject booleans as numbers and malformed input. The result must not change if the source lists or dictionaries are later mutated.",
    starterCode: "def snapshot_readings(readings):\n    # TODO: validate nested values and cross the ownership boundary immutably.\n    return ()\n",
    visibleExamples: [
      { label: "SNAPSHOT", input: "[{'sensor':'A','values':[1,2]}]", output: "(('A',(1,2)),)" },
      { label: "LATER MUTATION", input: "append 3 to source values", output: "snapshot remains unchanged" },
    ],
    runtime: {
      minimumCodeLength: 190,
      requiredPatterns: [
        { pattern: "tuple\\s*\\(", flags: "im", name: "Builds immutable boundaries", hint: "Convert both the outer result and each values list to tuples." },
        { pattern: "isinstance\\s*\\(", flags: "im", name: "Validates value types", hint: "Validate containers, strings, and numeric values explicitly." },
      ],
      pythonTests: [
        { name: "Creates the exact immutable shape", code: "src=[{'sensor':'A','values':[1,2.5]},{'sensor':'B','values':[]}]; assert snapshot_readings(src)==(('A',(1,2.5)),('B',()))", hint: "Preserve record order and convert each nested list." },
        { name: "Snapshot does not alias source", code: "src=[{'sensor':'A','values':[1]}]; out=snapshot_readings(src); src[0]['sensor']='X'; src[0]['values'].append(2); assert out==(('A',(1,)),)", hint: "Store immutable values, not source dictionary or list references." },
        { name: "Malformed readings fail", code: "for src in [None,[{'sensor':'','values':[]}],[{'sensor':'A','values':[True]}],[{'sensor':'A','values':'bad'}]]:\n    try:\n        snapshot_readings(src); assert False\n    except (TypeError,ValueError):\n        pass", hint: "Require a list, nonblank sensor, values list, and non-boolean numbers." },
      ],
    },
  };

  if (topic.title === "Hashing") return {
    title: "Hashed relay registry mission",
    instructions: "Implement build_relay_registry(records). Each record has integer id and nonblank name. Return {'by_id': {id: normalized_name}, 'duplicate_ids': tuple(sorted_ids)}. Repeated identical id/name pairs are allowed and recorded as duplicates; conflicting names for one id raise ValueError. Reject bool ids, normalize whitespace, preserve no references to source records, and do not mutate the input.",
    starterCode: "def build_relay_registry(records):\n    by_id = {}\n    duplicates = set()\n    # TODO: validate and use hashed identity for one-pass grouping.\n    return {'by_id': by_id, 'duplicate_ids': tuple(sorted(duplicates))}\n",
    visibleExamples: [
      { label: "DUPLICATE", input: "id 2 Edge, id 2 Edge", output: "duplicate_ids (2,)" },
      { label: "CONFLICT", input: "id 2 Edge, id 2 Ember", output: "ValueError" },
    ],
    runtime: {
      minimumCodeLength: 220,
      requiredPatterns: [
        { pattern: "duplicates\\.add\\s*\\(", flags: "im", name: "Uses a hashed duplicate set", hint: "Add an already-seen identical id to duplicates." },
        { pattern: "\\bin\\s+by_id", flags: "im", name: "Checks dictionary membership", hint: "Check whether the relay id already has a registered name." },
      ],
      pythonTests: [
        { name: "Registry and duplicates are exact", code: "r=build_relay_registry([{'id':2,'name':' Edge '},{'id':1,'name':'Prime'},{'id':2,'name':'Edge'}]); assert r=={'by_id':{2:'Edge',1:'Prime'},'duplicate_ids':(2,)}", hint: "Strip names, group in one pass, and sort the duplicate tuple." },
        { name: "Conflicting hashes are rejected by equality", code: "try:\n    build_relay_registry([{'id':1,'name':'A'},{'id':1,'name':'B'}]); assert False\nexcept ValueError:\n    pass", hint: "A shared id may repeat only with the same normalized name." },
        { name: "Types are validated", code: "for records in [[{'id':True,'name':'A'}],[{'id':1,'name':' '}],[{'name':'A'}]]:\n    try:\n        build_relay_registry(records); assert False\n    except (TypeError,ValueError):\n        pass", hint: "Require integer non-boolean ids and nonblank string names." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["relays · 4 rows", "relay_events · JSONB telemetry", "sectors · Aurora, Ember, Tidal", "transactional PostgreSQL practice database"] };

export function buildRoundTenSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Automation & Data") return {
    ...sqlBase,
    title: "Automation & Data SQL project",
    instructions: "Create relay_change_log with an identity primary key, relay foreign key, changed_at, and JSONB old_state/new_state. Create a plpgsql function log_relay_change and an AFTER UPDATE trigger on relays that fires only when status or power changes. Store relay_id, name, status, and power in each JSONB state. Create relay_application_view joining relays to sectors with relay_id, relay_name, sector_name, status, and power. Update relay 3 to status maintenance and power 50, then return it from the view. The audit and application result must commit together.",
    starterCode: "CREATE TABLE relay_change_log (\n  change_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  relay_id bigint NOT NULL REFERENCES relays(relay_id),\n  changed_at timestamptz NOT NULL DEFAULT now(),\n  old_state jsonb NOT NULL,\n  new_state jsonb NOT NULL\n);\n\nCREATE FUNCTION log_relay_change()\nRETURNS trigger LANGUAGE plpgsql AS $$\nBEGIN\n  -- TODO: insert OLD and NEW state with jsonb_build_object.\n  RETURN NEW;\nEND;\n$$;\n\n-- TODO: create an AFTER UPDATE row trigger with a status/power WHEN condition.\n\nCREATE VIEW relay_application_view AS\nSELECT r.relay_id, r.name AS relay_name, s.name AS sector_name, r.status, r.power\nFROM relays r\nJOIN sectors s ON s.sector_id = r.sector_id;\n\nBEGIN;\nUPDATE relays SET status = 'maintenance', power = 50 WHERE relay_id = 3;\nCOMMIT;\n\nSELECT relay_id, relay_name, sector_name, status, power\nFROM relay_application_view\nWHERE relay_id = 3;\n",
    visibleExamples: [
      { label: "AUDITED TRANSITION", input: "Ember Gate weak/44 → maintenance/50", output: "one JSONB old/new log row" },
      { label: "APPLICATION READ", input: "relay id 3", output: "one joined row without an N+1 lookup" },
    ],
    runtime: {
      minimumCodeLength: 760,
      requiredPatterns: [
        { pattern: "CREATE\\s+TRIGGER[\\s\\S]*AFTER\\s+UPDATE", flags: "i", name: "Installs update automation", hint: "Create one AFTER UPDATE trigger on relays." },
        { pattern: "FOR\\s+EACH\\s+ROW[\\s\\S]*WHEN", flags: "i", name: "Scopes meaningful row changes", hint: "Use FOR EACH ROW and a WHEN condition comparing status or power." },
        { pattern: "jsonb_build_object\\s*\\(", flags: "i", name: "Captures structured states", hint: "Build old_state and new_state JSONB objects." },
        { pattern: "CREATE\\s+VIEW\\s+relay_application_view", flags: "i", name: "Creates the application read model", hint: "Keep the supplied joined view." },
      ],
      sqlTests: [
        { name: "Audit trigger exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_trigger WHERE tgrelid = 'relays'::regclass AND NOT tgisinternal", column: "count", expected: 1, hint: "Create exactly one custom trigger on relays." },
        { name: "One transition is audited", kind: "database-value", query: "SELECT count(*)::int AS count FROM relay_change_log WHERE relay_id = 3 AND old_state->>'status' = 'weak' AND new_state->>'status' = 'maintenance' AND (new_state->>'power')::numeric = 50", column: "count", expected: 1, hint: "Insert both OLD and NEW values in the trigger function." },
        { name: "Application view exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.views WHERE table_name = 'relay_application_view'", column: "count", expected: 1, hint: "Create the exact named view." },
        { name: "Project result columns are exact", kind: "result-columns", columns: ["relay_id","relay_name","sector_name","status","power"], hint: "Finish with the supplied view query and column order." },
        { name: "Application result is correct", kind: "result-value", column: "sector_name", expected: "Ember", hint: "Join relay 3 to its sector inside the view." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Triggers") return {
    ...sqlBase,
    title: "Status audit trigger mission",
    instructions: "Create relay_status_audit with identity key, relay foreign key, old_status, new_status, and changed_at. Create audit_relay_status() in plpgsql and an AFTER UPDATE trigger that runs per row only when status changes. Update relay 3 from weak to maintenance, then return the audit row.",
    starterCode: "CREATE TABLE relay_status_audit (\n  audit_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  relay_id bigint NOT NULL REFERENCES relays(relay_id),\n  old_status text NOT NULL,\n  new_status text NOT NULL,\n  changed_at timestamptz NOT NULL DEFAULT now()\n);\n\nCREATE FUNCTION audit_relay_status()\nRETURNS trigger LANGUAGE plpgsql AS $$\nBEGIN\n  -- TODO: insert OLD and NEW status, then return NEW.\nEND;\n$$;\n\n-- TODO: create the filtered AFTER UPDATE trigger.\nUPDATE relays SET status = 'maintenance' WHERE relay_id = 3;\nSELECT relay_id, old_status, new_status FROM relay_status_audit ORDER BY audit_id;\n",
    visibleExamples: [
      { label: "CHANGE", input: "weak → maintenance", output: "one audit row" },
      { label: "NO CHANGE", input: "maintenance → maintenance", output: "no additional audit row" },
    ],
    runtime: {
      minimumCodeLength: 460,
      requiredPatterns: [
        { pattern: "AFTER\\s+UPDATE", flags: "i", name: "Audits completed updates", hint: "Create an AFTER UPDATE trigger." },
        { pattern: "WHEN\\s*\\([\\s\\S]*OLD\\.status[\\s\\S]*NEW\\.status", flags: "i", name: "Filters unchanged status", hint: "Compare OLD.status and NEW.status in WHEN." },
      ],
      sqlTests: [
        { name: "One status transition is recorded", kind: "database-value", query: "SELECT count(*)::int AS count FROM relay_status_audit WHERE relay_id = 3 AND old_status = 'weak' AND new_status = 'maintenance'", column: "count", expected: 1, hint: "Insert OLD.status and NEW.status in the function." },
        { name: "Audit result columns are exact", kind: "result-columns", columns: ["relay_id","old_status","new_status"], hint: "Keep the final SELECT projection." },
        { name: "Trigger is installed", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_trigger WHERE tgrelid = 'relays'::regclass AND NOT tgisinternal", column: "count", expected: 1, hint: "Create one custom trigger on relays." },
      ],
    },
  };

  if (topic.title === "JSON/JSONB") return {
    ...sqlBase,
    title: "JSONB telemetry extraction mission",
    instructions: "Return high-severity relay events whose payload contains severity high. Extract source as text, cast payload temperature to numeric, and build a compact JSONB summary containing event_type and source. Order by event_id. Use JSONB containment for the severity filter.",
    starterCode: "SELECT event_id,\n       payload->>'source' AS source,\n       /* temperature as numeric */ AS temperature,\n       /* compact JSONB summary */ AS summary\nFROM relay_events\nWHERE /* JSONB contains severity high */\nORDER BY event_id;\n",
    visibleExamples: [
      { label: "FILTER", input: "payload severity high", output: "only matching event documents" },
      { label: "SUMMARY", input: "event_type overload, source sensor-a", output: "{'event_type':'overload','source':'sensor-a'}" },
    ],
    runtime: {
      minimumCodeLength: 220,
      requiredPatterns: [
        { pattern: "payload\\s*@>\\s*'\\{", flags: "i", name: "Uses JSONB containment", hint: "Filter with payload @> '{\"severity\":\"high\"}'::jsonb." },
        { pattern: "jsonb_build_object\\s*\\(", flags: "i", name: "Builds a typed document", hint: "Build summary with event_type and extracted source." },
        { pattern: "payload\\s*->>\\s*'temperature'", flags: "i", name: "Extracts scalar text", hint: "Extract temperature with ->> before casting." },
      ],
      sqlTests: [
        { name: "JSON result columns are exact", kind: "result-columns", columns: ["event_id","source","temperature","summary"], hint: "Return all four requested aliases." },
        { name: "Only high-severity rows remain", kind: "result-ordered-values", column: "event_id", expected: [2], hint: "Use JSONB containment for severity high." },
        { name: "Source extraction is correct", kind: "result-value", column: "source", expected: "sensor-b", hint: "Extract payload source as text." },
      ],
    },
  };

  if (topic.title === "Application DB access") return {
    ...sqlBase,
    title: "Parameterized application lookup mission",
    instructions: "Prepare relay_lookup(bigint, numeric) to return relay_id, name, and power for one sector with power at least the supplied threshold, ordered by relay_id. Execute it for sector 1 and threshold 70. Values must remain parameters rather than embedded in the prepared query body.",
    starterCode: "PREPARE relay_lookup(bigint, numeric) AS\nSELECT relay_id, name, power\nFROM relays\nWHERE sector_id = /* first parameter */\n  AND power >= /* second parameter */\nORDER BY relay_id;\n\nEXECUTE relay_lookup(1, 70);\n",
    visibleExamples: [
      { label: "BOUND VALUES", input: "sector=1, minimum=70", output: "parameters $1 and $2" },
      { label: "RESULT", input: "Aurora relays", output: "Aurora Prime and Crystal Bridge" },
    ],
    runtime: {
      minimumCodeLength: 170,
      requiredPatterns: [
        { pattern: "PREPARE\\s+relay_lookup\\s*\\(\\s*bigint\\s*,\\s*numeric\\s*\\)", flags: "i", name: "Defines a typed statement", hint: "Keep the prepared statement name and argument types." },
        { pattern: "sector_id\\s*=\\s*\\$1[\\s\\S]*power\\s*>=\\s*\\$2", flags: "i", name: "Binds both values", hint: "Use $1 for sector and $2 for threshold." },
      ],
      sqlTests: [
        { name: "Lookup columns are exact", kind: "result-columns", columns: ["relay_id","name","power"], hint: "Keep the prepared SELECT projection." },
        { name: "Bound lookup returns expected relays", kind: "result-ordered-values", column: "relay_id", expected: [1,2], hint: "Execute for sector 1 and minimum power 70." },
      ],
    },
  };

  if (topic.title === "ORM") return {
    ...sqlBase,
    title: "N+1-free relay hydration mission",
    instructions: "Create relay_with_sector as one joined view returning relay_id, relay_name, sector_id, sector_name, status, and power. Query online relays from the view ordered by relay_id. This represents an ORM projection that loads the relationship in one database query.",
    starterCode: "CREATE VIEW relay_with_sector AS\nSELECT r.relay_id,\n       r.name AS relay_name,\n       /* include sector identity and name */,\n       r.status,\n       r.power\nFROM relays r\n/* join sectors once */;\n\nSELECT relay_id, relay_name, sector_id, sector_name, status, power\nFROM relay_with_sector\nWHERE /* online relays */\nORDER BY relay_id;\n",
    visibleExamples: [
      { label: "ONE QUERY", input: "three online relays", output: "relay and sector fields returned together" },
      { label: "IDENTITY", input: "two Aurora relays", output: "same sector_id 1 in both rows" },
    ],
    runtime: {
      minimumCodeLength: 290,
      requiredPatterns: [
        { pattern: "CREATE\\s+VIEW\\s+relay_with_sector", flags: "i", name: "Defines a stable projection", hint: "Create the exact view name." },
        { pattern: "JOIN\\s+sectors", flags: "i", name: "Loads the relationship once", hint: "Join sectors by sector_id inside the view." },
      ],
      sqlTests: [
        { name: "Projection view exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.views WHERE table_name = 'relay_with_sector'", column: "count", expected: 1, hint: "Create relay_with_sector before querying it." },
        { name: "Projection columns are exact", kind: "result-columns", columns: ["relay_id","relay_name","sector_id","sector_name","status","power"], hint: "Return all requested projection fields." },
        { name: "Online relays are returned once", kind: "result-ordered-values", column: "relay_id", expected: [1,2,4], hint: "Filter online rows and order by relay_id." },
        { name: "Relationship hydration is correct", kind: "result-ordered-values", column: "sector_name", expected: ["Aurora","Aurora","Tidal"], hint: "Join each relay to its sector inside the view." },
      ],
    },
  };

  return null;
}
