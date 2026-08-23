import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundEightPythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Standard Library Citadel") return {
    title: "Standard Library Citadel Python project",
    instructions: "Build restore_citadel(relays, limit, logger). Use Counter to count every status, a deque ordered by power descending then name, and islice to process at most limit relays. Use enumerate(start=1) for ranks and logger.info with structured extra fields for each processed relay. Return status_counts as a normal dict and processed as rank/name/power dictionaries. Define cached_repair_cost(power) with @lru_cache(maxsize=None), returning max(0, 70 - power), and include each processed relay's repair_cost. Reject limit below zero.",
    starterCode: "from collections import Counter, deque\nfrom functools import lru_cache\nfrom itertools import islice\n\n@lru_cache(maxsize=None)\ndef cached_repair_cost(power):\n    # TODO: return power needed to reach 70.\n    pass\n\ndef restore_citadel(relays, limit, logger):\n    # TODO: count statuses, prioritize a deque, slice work, log, and report.\n    return {}\n",
    visibleExamples: [
      { label: "PRIORITY", input: "Aurora 82 stable; Ember 44 weak; Tidal 68 stable · limit 2", output: "Aurora rank 1, Tidal rank 2" },
      { label: "COUNTS", input: "stable, weak, stable", output: "{'stable': 2, 'weak': 1}" },
    ],
    runtime: {
      minimumCodeLength: 330,
      requiredPatterns: [
        { pattern: "\\bCounter\\s*\\(", flags: "im", name: "Counts status values", hint: "Build Counter(relay['status'] for relay in relays)." },
        { pattern: "\\bdeque\\s*\\(", flags: "im", name: "Builds the work queue", hint: "Wrap the prioritized relay sequence in deque." },
        { pattern: "\\bislice\\s*\\(", flags: "im", name: "Bounds processed work", hint: "Consume islice(queue, limit)." },
        { pattern: "@lru_cache\\s*\\(\\s*maxsize\\s*=\\s*None", flags: "im", name: "Caches pure repair cost", hint: "Keep @lru_cache(maxsize=None)." },
        { pattern: "enumerate\\s*\\([\\s\\S]*start\\s*=\\s*1", flags: "im", name: "Assigns Pythonic ranks", hint: "Enumerate the sliced queue with start=1." },
        { pattern: "logger\\.info\\s*\\([\\s\\S]*extra\\s*=", flags: "im", name: "Emits structured progress", hint: "Call logger.info with an extra dictionary." },
      ],
      pythonTests: [
        { name: "Repair cost is correct and cached", code: "cached_repair_cost.cache_clear(); assert cached_repair_cost(44)==26 and cached_repair_cost(82)==0; cached_repair_cost(44); assert cached_repair_cost.cache_info().hits >= 1", hint: "Return max(0, 70 - power) and retain the cache decorator." },
        { name: "Citadel report is exact", code: "class Log:\n    def __init__(self): self.events=[]\n    def info(self,event,**kwargs): self.events.append((event,kwargs.get('extra')))\nlog=Log(); relays=[{'name':'Aurora','power':82,'status':'stable'},{'name':'Ember','power':44,'status':'weak'},{'name':'Tidal','power':68,'status':'stable'}]; result=restore_citadel(relays,2,log); assert result=={'status_counts':{'stable':2,'weak':1},'processed':[{'rank':1,'name':'Aurora','power':82,'repair_cost':0},{'rank':2,'name':'Tidal','power':68,'repair_cost':2}]} and len(log.events)==2", hint: "Sort by (-power, name), slice two, and convert Counter to dict." },
        { name: "Empty and zero work are handled", code: "class Log:\n    def info(self,*args,**kwargs): assert False\nassert restore_citadel([],0,Log())=={'status_counts':{},'processed':[]}", hint: "Empty inputs should not log or fail." },
        { name: "Invalid limit is rejected", code: "class Log: pass\ntry:\n    restore_citadel([], -1, Log()); assert False\nexcept ValueError:\n    pass", hint: "Validate limit before processing." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Collections") return {
    title: "Priority queue collection mission",
    instructions: "Complete process_tasks(tasks). Use Counter to count priorities and deque to process tasks in their supplied order with popleft. Return priority_counts as a normal dict and processed task names. Do not mutate tasks.",
    starterCode: "from collections import Counter, deque\n\ndef process_tasks(tasks):\n    # TODO: count priorities and drain a copied deque.\n    return {}\n",
    visibleExamples: [
      { label: "TASKS", input: "scan/high, repair/high, map/low", output: "counts high 2 low 1; names stay in order" },
      { label: "EMPTY", input: "[]", output: "empty counts and processed list" },
    ],
    runtime: {
      minimumCodeLength: 100,
      requiredPatterns: [
        { pattern: "\\bCounter\\s*\\(", flags: "im", name: "Counts priorities", hint: "Use Counter over task['priority']." },
        { pattern: "\\bdeque\\s*\\(", flags: "im", name: "Creates a queue", hint: "Create deque(tasks) so the input list is preserved." },
        { pattern: "\\.popleft\\s*\\(", flags: "im", name: "Processes from the front", hint: "Drain the queue with popleft()." },
      ],
      pythonTests: [
        { name: "Counts and processes visible tasks", code: "tasks=[{'name':'scan','priority':'high'},{'name':'repair','priority':'high'},{'name':'map','priority':'low'}]; assert process_tasks(tasks)=={'priority_counts':{'high':2,'low':1},'processed':['scan','repair','map']}", hint: "Convert the Counter to dict and retain queue order." },
        { name: "Preserves source and handles empty", code: "tasks=[{'name':'a','priority':'low'}]; process_tasks(tasks); assert tasks==[{'name':'a','priority':'low'}] and process_tasks([])=={'priority_counts':{},'processed':[]}", hint: "Copy into deque instead of popping the source list." },
      ],
    },
  };

  if (topic.title === "Itertools") return {
    title: "Bounded signal stream mission",
    instructions: "Complete first_active_names(groups, limit). Lazily flatten the nested relay groups with chain.from_iterable, filter online relays with power at least 70, and return at most limit names using islice. Reject negative limit.",
    starterCode: "from itertools import chain, islice\n\ndef first_active_names(groups, limit):\n    # TODO: compose a lazy flattened, filtered, bounded stream.\n    return []\n",
    visibleExamples: [
      { label: "STREAM", input: "nested groups · limit 2", output: "first two qualifying names" },
      { label: "ZERO LIMIT", input: "limit 0", output: "[]" },
    ],
    runtime: {
      minimumCodeLength: 120,
      requiredPatterns: [
        { pattern: "chain\\.from_iterable\\s*\\(", flags: "im", name: "Flattens lazily", hint: "Pass groups to chain.from_iterable." },
        { pattern: "\\bislice\\s*\\(", flags: "im", name: "Bounds the stream", hint: "Use islice(filtered_names, limit)." },
      ],
      pythonTests: [
        { name: "Returns only the first qualifying names", code: "g=[[{'name':'A','online':True,'power':82},{'name':'B','online':False,'power':99}],[{'name':'C','online':True,'power':70},{'name':'D','online':True,'power':90}]]; assert first_active_names(g,2)==['A','C']", hint: "Filter before applying islice to qualifying names." },
        { name: "Handles zero and oversize limits", code: "g=[[{'name':'A','online':True,'power':70}]]; assert first_active_names(g,0)==[] and first_active_names(g,5)==['A']", hint: "islice naturally stops at exhaustion." },
        { name: "Rejects a negative bound", code: "try:\n    first_active_names([], -1); assert False\nexcept ValueError:\n    pass", hint: "Validate limit before constructing the slice." },
      ],
    },
  };

  if (topic.title === "Functools") return {
    title: "Cached path and partial mission",
    instructions: "Complete signal_paths(steps) as the supplied cached recurrence where steps 0 or 1 return 1. Complete make_power_boost(amount) by returning functools.partial(apply_boost, amount=amount). apply_boost must clamp at 100.",
    starterCode: "from functools import lru_cache, partial\n\n@lru_cache(maxsize=None)\ndef signal_paths(steps):\n    # TODO: validate and calculate the recurrence.\n    pass\n\ndef apply_boost(power, amount):\n    return min(100, power + amount)\n\ndef make_power_boost(amount):\n    # TODO: return a specialized callable.\n    pass\n",
    visibleExamples: [
      { label: "PATHS", input: "signal_paths(5)", output: "8" },
      { label: "PARTIAL", input: "boost10(95)", output: "100" },
    ],
    runtime: {
      minimumCodeLength: 180,
      requiredPatterns: [
        { pattern: "@lru_cache\\s*\\(\\s*maxsize\\s*=\\s*None", flags: "im", name: "Caches recursive results", hint: "Retain @lru_cache(maxsize=None)." },
        { pattern: "\\bpartial\\s*\\(", flags: "im", name: "Creates the specialized boost", hint: "Return partial(apply_boost, amount=amount)." },
      ],
      pythonTests: [
        { name: "Recurrence and cache work", code: "signal_paths.cache_clear(); assert [signal_paths(i) for i in range(6)]==[1,1,2,3,5,8]; before=signal_paths.cache_info().hits; signal_paths(5); assert signal_paths.cache_info().hits>before", hint: "Use the two base cases and recursive sum." },
        { name: "Negative steps are rejected", code: "try:\n    signal_paths(-1); assert False\nexcept ValueError:\n    pass", hint: "Validate before the base cases." },
        { name: "Partial boost binds amount", code: "boost=make_power_boost(10); assert boost(50)==60 and boost(95)==100", hint: "Bind amount by keyword so power remains the call argument." },
      ],
    },
  };

  if (topic.title === "Pythonic coding") return {
    title: "Pythonic relay ranking mission",
    instructions: "Complete rank_relays(names, powers). Pair inputs with zip(strict=True), sort by power descending then name, and use enumerate(start=1) to return dictionaries containing rank, name, and power. Unequal lengths must raise ValueError through strict zip.",
    starterCode: "def rank_relays(names, powers):\n    # TODO: zip strictly, sort meaningfully, and enumerate ranks.\n    return []\n",
    visibleExamples: [
      { label: "RANK", input: "Zeta 82, Alpha 96, Beta 96", output: "Alpha, Beta, Zeta with ranks 1..3" },
      { label: "MISMATCH", input: "2 names, 1 power", output: "ValueError" },
    ],
    runtime: {
      minimumCodeLength: 110,
      requiredPatterns: [
        { pattern: "zip\\s*\\([\\s\\S]*strict\\s*=\\s*True", flags: "im", name: "Rejects misaligned inputs", hint: "Use zip(names, powers, strict=True)." },
        { pattern: "enumerate\\s*\\([\\s\\S]*start\\s*=\\s*1", flags: "im", name: "Assigns ranks directly", hint: "Enumerate the sorted pairs with start=1." },
      ],
      pythonTests: [
        { name: "Ranking is exact", code: "assert rank_relays(['Zeta','Alpha','Beta'],[82,96,96])==[{'rank':1,'name':'Alpha','power':96},{'rank':2,'name':'Beta','power':96},{'rank':3,'name':'Zeta','power':82}]", hint: "Sort pairs by (-power, name)." },
        { name: "Empty input is handled", code: "assert rank_relays([],[])==[]", hint: "The same pipeline should naturally return an empty list." },
        { name: "Mismatched inputs fail", code: "try:\n    rank_relays(['A','B'],[1]); assert False\nexcept ValueError:\n    pass", hint: "Materialize or iterate the strict zip so it performs the length check." },
      ],
    },
  };

  if (topic.title === "Testing") return {
    title: "Behavior contract testing mission",
    instructions: "Implement classify_power(power): reject values outside 0..100, return offline below 70, online from 70 through 89, and boosted from 90. Then write test_boundaries(), test_invalid_values(), and test_representative_values() using assert; each function must execute without failure.",
    starterCode: "def classify_power(power):\n    # TODO: implement the behavior contract.\n    pass\n\ndef test_boundaries():\n    # TODO: assert 69, 70, 89, and 90 behavior.\n    pass\n\ndef test_invalid_values():\n    # TODO: assert both invalid sides raise ValueError.\n    pass\n\ndef test_representative_values():\n    # TODO: assert one ordinary value from each class.\n    pass\n",
    visibleExamples: [
      { label: "BOUNDARY", input: "69, 70, 89, 90", output: "offline, online, online, boosted" },
      { label: "INVALID", input: "-1 or 101", output: "ValueError" },
    ],
    runtime: {
      minimumCodeLength: 240,
      requiredPatterns: [
        { pattern: "def\\s+test_(boundaries|invalid_values|representative_values)", flags: "im", name: "Defines executable tests", hint: "Keep all three test functions." },
        { pattern: "\\bassert\\b", flags: "im", name: "States expected outcomes", hint: "Use assert inside each test function." },
      ],
      pythonTests: [
        { name: "Production behavior is correct", code: "assert [classify_power(x) for x in (0,69,70,89,90,100)]==['offline','offline','online','online','boosted','boosted']", hint: "Implement inclusive boundaries exactly." },
        { name: "Invalid values raise", code: "for bad in (-1,101):\n    try:\n        classify_power(bad); assert False\n    except ValueError:\n        pass", hint: "Validate the entire 0 through 100 domain." },
        { name: "Learner tests pass", code: "for name in ('test_boundaries','test_invalid_values','test_representative_values'):\n    fn=globals().get(name); assert callable(fn); fn()", hint: "Each supplied test function must contain working assertions." },
      ],
    },
  };

  if (topic.title === "Logging") return {
    title: "Structured relay logging mission",
    instructions: "Complete log_relay_status(logger, name, power, request_id). Return online for power at least 70 and weak otherwise. Log event relay_status with logger.info for online or logger.warning for weak, passing extra with exactly relay_name, power, request_id, and status. Do not use print.",
    starterCode: "def log_relay_status(logger, name, power, request_id):\n    # TODO: classify, emit a structured event at the right level, and return status.\n    pass\n",
    visibleExamples: [
      { label: "INFO", input: "Aurora power 82", output: "relay_status with status online" },
      { label: "WARNING", input: "Ember power 44", output: "relay_status with status weak" },
    ],
    runtime: {
      minimumCodeLength: 135,
      requiredPatterns: [{ pattern: "logger\\.(?:info|warning)\\s*\\([\\s\\S]*extra\\s*=", flags: "im", name: "Writes structured log context", hint: "Call the selected logger method with extra={...}." }],
      pythonTests: [
        { name: "Online status uses info", code: "class Log:\n    def __init__(self): self.calls=[]\n    def info(self,*a,**k): self.calls.append(('info',a,k))\n    def warning(self,*a,**k): self.calls.append(('warning',a,k))\nl=Log(); assert log_relay_status(l,'Aurora',82,'r1')=='online'; assert l.calls==[('info',('relay_status',),{'extra':{'relay_name':'Aurora','power':82,'request_id':'r1','status':'online'}})]", hint: "Use logger.info('relay_status', extra=fields) for the online path." },
        { name: "Weak status uses warning", code: "class Log:\n    def __init__(self): self.calls=[]\n    def info(self,*a,**k): self.calls.append(('info',a,k))\n    def warning(self,*a,**k): self.calls.append(('warning',a,k))\nl=Log(); assert log_relay_status(l,'Ember',44,'r2')=='weak'; assert l.calls[0][0]=='warning' and l.calls[0][2]['extra']['request_id']=='r2'", hint: "Use warning and retain the same structured fields." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["sectors · 3 rows", "relays · 4 rows", "practice schema supports DDL", "PostgreSQL plan catalog available"] };

export function buildRoundEightSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Schema & Index Lab") return {
    ...sqlBase,
    title: "Schema & Index Lab SQL project",
    instructions: "Create relay_owners with a bigint primary key and unique non-null email. Create relay_assignments as a normalized junction with relay_id and owner_id foreign keys, assigned_at timestamptz, and a composite primary key. Create relay_status_events with a relay foreign key, checked event_type, occurred_at, and jsonb payload. Create the partial covering index idx_relays_online_sector_power on relays(sector_id, power DESC) INCLUDE(name) WHERE online. Run ANALYZE and EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) for the supplied lookup, then finish by returning the index name and definition from pg_indexes.",
    starterCode: "CREATE TABLE relay_owners (\n  owner_id bigint PRIMARY KEY,\n  email text NOT NULL UNIQUE\n);\n\nCREATE TABLE relay_assignments (\n  relay_id bigint /* relationship */,\n  owner_id bigint /* relationship */,\n  assigned_at timestamptz NOT NULL DEFAULT now(),\n  /* composite identity */\n);\n\nCREATE TABLE relay_status_events (\n  event_id bigint PRIMARY KEY,\n  relay_id bigint /* relationship */,\n  event_type text NOT NULL /* allowed values */,\n  occurred_at timestamptz NOT NULL,\n  payload jsonb NOT NULL DEFAULT '{}'::jsonb\n);\n\nCREATE INDEX idx_relays_online_sector_power\nON relays (sector_id, power DESC) INCLUDE (name)\nWHERE online;\n\nANALYZE relays;\nEXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)\nSELECT name, power FROM relays\nWHERE sector_id = 1 AND online\nORDER BY power DESC;\n\nSELECT indexname, indexdef\nFROM pg_indexes\nWHERE indexname = 'idx_relays_online_sector_power';\n",
    visibleExamples: [
      { label: "NORMALIZED OWNERSHIP", input: "relay 1 assigned to owner 10", output: "one junction row; owner email stored once" },
      { label: "TARGET ACCESS", input: "online relays in sector 1 ordered by power", output: "partial composite covering index" },
    ],
    runtime: {
      minimumCodeLength: 620,
      requiredPatterns: [
        { pattern: "PRIMARY\\s+KEY\\s*\\(\\s*relay_id\\s*,\\s*owner_id\\s*\\)", flags: "i", name: "Defines junction identity", hint: "Add PRIMARY KEY (relay_id, owner_id)." },
        { pattern: "REFERENCES\\s+relays\\s*\\(\\s*relay_id\\s*\\)", flags: "i", name: "Enforces relay relationships", hint: "Both assignment and event relay_id columns should reference relays." },
        { pattern: "CHECK\\s*\\(", flags: "i", name: "Constrains event types", hint: "Add CHECK (event_type IN (...))." },
        { pattern: "CREATE\\s+INDEX\\s+idx_relays_online_sector_power[\\s\\S]*INCLUDE\\s*\\(\\s*name\\s*\\)[\\s\\S]*WHERE\\s+online", flags: "i", name: "Builds the targeted covering index", hint: "Keep the supplied key order, INCLUDE(name), and partial predicate." },
        { pattern: "EXPLAIN\\s*\\(\\s*ANALYZE\\s*,\\s*BUFFERS", flags: "i", name: "Measures the lookup plan", hint: "Run the supplied safe SELECT with EXPLAIN ANALYZE and BUFFERS." },
      ],
      sqlTests: [
        { name: "Normalized tables exist", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_name IN ('relay_owners','relay_assignments','relay_status_events')", column: "count", expected: 3, hint: "Create all three requested relations." },
        { name: "Assignments have two foreign keys", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name = 'relay_assignments' AND constraint_type = 'FOREIGN KEY'", column: "count", expected: 2, hint: "Reference both relays and relay_owners." },
        { name: "Event type is checked", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name = 'relay_status_events' AND constraint_type = 'CHECK'", column: "count", expected: 1, hint: "Add one CHECK constraint for allowed event types." },
        { name: "Targeted index exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname = 'idx_relays_online_sector_power'", column: "count", expected: 1, hint: "Create the exact requested index." },
        { name: "Project result is inspectable", kind: "result-columns", columns: ["indexname","indexdef"], hint: "Finish with the supplied pg_indexes query." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Normalization") return {
    ...sqlBase,
    title: "Normalized ownership mission",
    instructions: "Create owners(owner_id primary key, email unique and non-null) and relay_owners(relay_id, owner_id, assigned_at) as a junction with two foreign keys and a composite primary key. Insert owner 10 and assign relay 1. Finish with the supplied join.",
    starterCode: "CREATE TABLE owners (\n  owner_id bigint PRIMARY KEY,\n  email text NOT NULL UNIQUE\n);\n\nCREATE TABLE relay_owners (\n  relay_id bigint REFERENCES relays(relay_id),\n  owner_id bigint REFERENCES owners(owner_id),\n  assigned_at timestamptz NOT NULL DEFAULT now(),\n  /* composite primary key */\n);\n\nINSERT INTO owners VALUES (10, 'owner@example.test');\nINSERT INTO relay_owners (relay_id, owner_id) VALUES (1, 10);\n\nSELECT r.name AS relay_name, o.email AS owner_email\nFROM relay_owners ro\nJOIN relays r ON r.relay_id = ro.relay_id\nJOIN owners o ON o.owner_id = ro.owner_id;\n",
    visibleExamples: [
      { label: "AUTHORITATIVE FACT", input: "owner 10 email", output: "stored once in owners" },
      { label: "ASSOCIATION", input: "relay 1 ↔ owner 10", output: "stored in relay_owners" },
    ],
    runtime: {
      minimumCodeLength: 330,
      requiredPatterns: [{ pattern: "PRIMARY\\s+KEY\\s*\\(\\s*relay_id\\s*,\\s*owner_id\\s*\\)", flags: "i", name: "Protects association identity", hint: "Add PRIMARY KEY (relay_id, owner_id)." }],
      sqlTests: [
        { name: "Junction has two foreign keys", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name = 'relay_owners' AND constraint_type = 'FOREIGN KEY'", column: "count", expected: 2, hint: "Reference relays and owners." },
        { name: "Duplicate ownership facts are prevented", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name = 'relay_owners' AND constraint_type = 'PRIMARY KEY'", column: "count", expected: 1, hint: "Declare the composite primary key." },
        { name: "Normalized result columns are exact", kind: "result-columns", columns: ["relay_name","owner_email"], hint: "Finish with the supplied joined aliases." },
        { name: "Assignment resolves correctly", kind: "result-value", column: "relay_name", expected: "Aurora Prime", hint: "Insert the assignment for relay 1." },
      ],
    },
  };

  if (topic.title === "Schema design") return {
    ...sqlBase,
    title: "Relay event schema mission",
    instructions: "Create relay_status_events with event_id primary key, relay_id foreign key, event_type restricted to online, offline, or repair, occurred_at timestamptz not null, and non-null jsonb payload defaulting to an empty object. Insert and return the supplied repair event.",
    starterCode: "CREATE TABLE relay_status_events (\n  event_id bigint PRIMARY KEY,\n  relay_id bigint /* relationship */,\n  event_type text NOT NULL /* allowed values */,\n  occurred_at timestamptz NOT NULL,\n  payload jsonb NOT NULL DEFAULT '{}'::jsonb\n);\n\nINSERT INTO relay_status_events (event_id, relay_id, event_type, occurred_at, payload)\nVALUES (501, 3, 'repair', '2026-08-23T12:00:00Z', '{\"operator\":\"Nova\"}');\n\nSELECT event_id, relay_id, event_type, payload->>'operator' AS operator\nFROM relay_status_events WHERE event_id = 501;\n",
    visibleExamples: [
      { label: "EVENT", input: "repair on relay 3 by Nova", output: "immutable event row 501" },
      { label: "INVALID TYPE", input: "event_type unknown", output: "constraint violation" },
    ],
    runtime: {
      minimumCodeLength: 285,
      requiredPatterns: [
        { pattern: "REFERENCES\\s+relays\\s*\\(\\s*relay_id\\s*\\)", flags: "i", name: "Connects events to relays", hint: "Make relay_id reference relays(relay_id)." },
        { pattern: "CHECK\\s*\\([\\s\\S]*event_type\\s+IN", flags: "i", name: "Restricts event vocabulary", hint: "Add CHECK (event_type IN ('online','offline','repair'))." },
      ],
      sqlTests: [
        { name: "Event table has its foreign key", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name = 'relay_status_events' AND constraint_type = 'FOREIGN KEY'", column: "count", expected: 1, hint: "Reference relays(relay_id)." },
        { name: "Event vocabulary is constrained", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name = 'relay_status_events' AND constraint_type = 'CHECK'", column: "count", expected: 1, hint: "Add the requested CHECK constraint." },
        { name: "Event result columns are exact", kind: "result-columns", columns: ["event_id","relay_id","event_type","operator"], hint: "Use the supplied SELECT aliases." },
        { name: "Repair event is stored", kind: "result-value", column: "event_type", expected: "repair", hint: "Insert the supplied event unchanged." },
      ],
    },
  };

  if (topic.title === "Indexes") return {
    ...sqlBase,
    title: "Targeted online index mission",
    instructions: "Create idx_relays_sector_power_online on relays with keys sector_id then power descending, INCLUDE name, and only online rows. Finish by returning indexname and indexdef from pg_indexes.",
    starterCode: "CREATE INDEX idx_relays_sector_power_online\nON relays (/* composite keys */)\n/* covering column */\n/* partial predicate */;\n\nSELECT indexname, indexdef\nFROM pg_indexes\nWHERE indexname = 'idx_relays_sector_power_online';\n",
    visibleExamples: [
      { label: "QUERY SHAPE", input: "sector equality + online + power order", output: "sector_id, power DESC · partial online index" },
      { label: "COVERING VALUE", input: "return name", output: "INCLUDE(name)" },
    ],
    runtime: {
      minimumCodeLength: 155,
      requiredPatterns: [{ pattern: "ON\\s+relays\\s*\\(\\s*sector_id\\s*,\\s*power\\s+DESC\\s*\\)\\s*INCLUDE\\s*\\(\\s*name\\s*\\)\\s*WHERE\\s+online", flags: "i", name: "Matches the access pattern", hint: "Use (sector_id, power DESC) INCLUDE (name) WHERE online." }],
      sqlTests: [
        { name: "Expected index exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname = 'idx_relays_sector_power_online'", column: "count", expected: 1, hint: "Use the exact requested name." },
        { name: "Index inspection columns are exact", kind: "result-columns", columns: ["indexname","indexdef"], hint: "Finish with the supplied catalog query." },
        { name: "The requested index is returned", kind: "result-value", column: "indexname", expected: "idx_relays_sector_power_online", hint: "Do not change the index name or final filter." },
      ],
    },
  };

  if (topic.title === "EXPLAIN ANALYZE") return {
    ...sqlBase,
    title: "Measured plan mission",
    instructions: "Create idx_relays_sector_power_measure on relays(sector_id, power DESC), run ANALYZE relays, and execute EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) for online sector 1 relays ordered by power descending. Finish by returning the created index from pg_indexes so its state can be graded.",
    starterCode: "CREATE INDEX idx_relays_sector_power_measure\nON relays (sector_id, power DESC);\n\nANALYZE relays;\n\n/* execute and measure this safe SELECT */\nSELECT name, power\nFROM relays\nWHERE sector_id = 1 AND online\nORDER BY power DESC;\n\nSELECT indexname, indexdef\nFROM pg_indexes\nWHERE indexname = 'idx_relays_sector_power_measure';\n",
    visibleExamples: [
      { label: "MEASURE", input: "safe sector lookup", output: "actual rows, timing, and buffers" },
      { label: "VERIFY", input: "pg_indexes", output: "idx_relays_sector_power_measure" },
    ],
    runtime: {
      minimumCodeLength: 245,
      requiredPatterns: [
        { pattern: "EXPLAIN\\s*\\(\\s*ANALYZE\\s*,\\s*BUFFERS\\s*,\\s*FORMAT\\s+TEXT\\s*\\)", flags: "i", name: "Executes a measured plan", hint: "Place EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) immediately before the safe SELECT." },
        { pattern: "\\bANALYZE\\s+relays", flags: "i", name: "Refreshes planner statistics", hint: "Keep ANALYZE relays before measuring." },
      ],
      sqlTests: [
        { name: "Measured index exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname = 'idx_relays_sector_power_measure'", column: "count", expected: 1, hint: "Create the supplied index before EXPLAIN." },
        { name: "Final catalog result is exact", kind: "result-columns", columns: ["indexname","indexdef"], hint: "Keep the final pg_indexes SELECT." },
        { name: "Created index is returned", kind: "result-value", column: "indexname", expected: "idx_relays_sector_power_measure", hint: "Filter the final result to the exact index name." },
      ],
    },
  };

  return null;
}
