import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundNinePythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Web Gateway") return {
    title: "Web Gateway Python project",
    instructions: "Build sync_gateway(fetch_page). Fetch cursor pages with timeout=5, require status 200, validate that each body contains an items list and next_cursor, reject a repeated non-null cursor, and reject relay records without integer id, nonblank name, or power from 0 through 100. Deduplicate by id with the newest page winning. Return relays ordered by id plus one parameterized PostgreSQL upsert using %s placeholders and a flat params tuple. Define GatewayError. Do not use string interpolation for values.",
    starterCode: "class GatewayError(Exception):\n    pass\n\ndef sync_gateway(fetch_page):\n    cursor = None\n    seen_cursors = set()\n    relays_by_id = {}\n    # TODO: fetch, validate, paginate, deduplicate, and build a safe upsert.\n    return {}\n",
    visibleExamples: [
      { label: "TWO PAGES", input: "ids 1,2 then updated id 2, id 3", output: "three ordered relays; newest id 2 wins" },
      { label: "QUERY SAFETY", input: "relay name contains a quote", output: "name remains only in params, never SQL text" },
    ],
    runtime: {
      minimumCodeLength: 390,
      requiredPatterns: [
        { pattern: "fetch_page\\s*\\([\\s\\S]*timeout\\s*=\\s*5", flags: "im", name: "Uses a request deadline", hint: "Call fetch_page(cursor=cursor, timeout=5)." },
        { pattern: "seen_cursors", flags: "im", name: "Protects pagination progress", hint: "Reject a non-null cursor already present in seen_cursors." },
        { pattern: "VALUES\\s*\\(\\s*%s\\s*,\\s*%s\\s*,\\s*%s\\s*\\)", flags: "im", name: "Builds a parameterized write", hint: "Use (%s, %s, %s) placeholders for id, name, and power." },
        { pattern: "ON\\s+CONFLICT", flags: "im", name: "Defines an idempotent upsert", hint: "Use ON CONFLICT (relay_id) DO UPDATE." },
      ],
      pythonTests: [
        { name: "Gateway synchronizes pages safely", code: "pages={None:{'status':200,'json':{'items':[{'id':2,'name':'Edge','power':70},{'id':1,'name':'Prime','power':96}],'next_cursor':'p2'}},'p2':{'status':200,'json':{'items':[{'id':2,'name':'Edge v2','power':82},{'id':3,'name':'Tidal','power':68}],'next_cursor':None}}}\ndef fetch_page(*,cursor,timeout): assert timeout==5; return pages[cursor]\nr=sync_gateway(fetch_page); assert r['relays']==[{'id':1,'name':'Prime','power':96},{'id':2,'name':'Edge v2','power':82},{'id':3,'name':'Tidal','power':68}] and r['params']==(1,'Prime',96,2,'Edge v2',82,3,'Tidal',68)", hint: "Deduplicate by id, sort by id, and flatten parameters in row order." },
        { name: "SQL keeps values out of query text", code: "def fetch_page(*,cursor,timeout): return {'status':200,'json':{'items':[{'id':1,'name':\"O'Relay\",'power':70}],'next_cursor':None}}\nr=sync_gateway(fetch_page); assert \"O'Relay\" not in r['sql'] and r['params']==(1,\"O'Relay\",70) and r['sql'].count('%s')==3", hint: "SQL contains placeholders only; values belong in params." },
        { name: "HTTP and schema failures are explicit", code: "cases=[lambda **k:{'status':503,'json':{}},lambda **k:{'status':200,'json':{'items':'bad','next_cursor':None}},lambda **k:{'status':200,'json':{'items':[{'id':1,'name':'A','power':101}],'next_cursor':None}}]\nfor fetch in cases:\n    try:\n        sync_gateway(fetch); assert False\n    except GatewayError:\n        pass", hint: "Raise GatewayError for non-200 status, invalid body shape, or invalid relay fields." },
        { name: "Repeated cursor is rejected", code: "def fetch_page(*,cursor,timeout): return {'status':200,'json':{'items':[],'next_cursor':'same'}}\ntry:\n    sync_gateway(fetch_page); assert False\nexcept GatewayError:\n    pass", hint: "Track each non-null next cursor and stop cycles." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "HTTP") return {
    title: "Safe HTTP retry policy mission",
    instructions: "Complete should_retry(method, status, attempt, max_attempts). Retry only while attempt is below max_attempts, for an idempotent method GET, HEAD, PUT, DELETE, or OPTIONS, and status 408, 429, 500, 502, 503, or 504. Return a boolean and normalize method case.",
    starterCode: "def should_retry(method, status, attempt, max_attempts):\n    # TODO: combine budget, idempotency, and transient status rules.\n    return False\n",
    visibleExamples: [
      { label: "TRANSIENT GET", input: "GET 503, attempt 1 of 3", output: "True" },
      { label: "UNSAFE POST", input: "POST 503, attempt 1 of 3", output: "False" },
    ],
    runtime: {
      minimumCodeLength: 95,
      requiredPatterns: [{ pattern: "\\.(?:upper|casefold)\\s*\\(", flags: "im", name: "Normalizes the method", hint: "Normalize method before checking the allowed set." }],
      pythonTests: [
        { name: "Retries transient idempotent requests", code: "for m in ('GET','head','PUT','delete','OPTIONS'):\n    assert should_retry(m,503,1,3) is True\nassert should_retry('GET',429,2,3) is True", hint: "Normalize case and include every idempotent method and transient status." },
        { name: "Rejects unsafe or permanent failures", code: "assert should_retry('POST',503,1,3) is False and should_retry('GET',400,1,3) is False and should_retry('GET',503,3,3) is False", hint: "All three policy conditions must be satisfied." },
      ],
    },
  };

  if (topic.title === "APIs") return {
    title: "Cursor pagination mission",
    instructions: "Complete collect_items(fetch_page). Call fetch_page(cursor) from None until next_cursor is None, validate each response has an items list, collect items in order, and raise ValueError if a non-null cursor repeats.",
    starterCode: "def collect_items(fetch_page):\n    cursor = None\n    seen = set()\n    items = []\n    # TODO: validate pages, collect items, and stop safely.\n    return items\n",
    visibleExamples: [
      { label: "PAGES", input: "[A,B] then [C]", output: "[A,B,C]" },
      { label: "CYCLE", input: "next cursor repeats", output: "ValueError" },
    ],
    runtime: {
      minimumCodeLength: 135,
      requiredPatterns: [{ pattern: "\\bseen\\.(?:add|update)\\s*\\(", flags: "im", name: "Records pagination progress", hint: "Add each non-null next cursor to seen." }],
      pythonTests: [
        { name: "Collects ordered pages", code: "pages={None:{'items':['A','B'],'next_cursor':'x'},'x':{'items':['C'],'next_cursor':None}}; assert collect_items(lambda c:pages[c])==['A','B','C']", hint: "Extend the result and continue with next_cursor." },
        { name: "Validates page shape", code: "for page in ({'items':'bad','next_cursor':None},{'next_cursor':None}):\n    try:\n        collect_items(lambda c,p=page:p); assert False\n    except ValueError:\n        pass", hint: "Require a dictionary with an items list." },
        { name: "Stops repeated cursors", code: "try:\n    collect_items(lambda c:{'items':[],'next_cursor':'x'}); assert False\nexcept ValueError:\n    pass", hint: "Check before revisiting the same cursor." },
      ],
    },
  };

  if (topic.title === "FastAPI") return {
    title: "Validated route boundary mission",
    instructions: "Implement validate_relay_request(payload), a dependency-free FastAPI boundary simulation. Require payload to be a dict with exactly name and power, strip a nonblank string name, require power to be an int but not bool from 0 through 100, and return the normalized dict. Raise RequestValidationError with status_code 422 and a stable detail message.",
    starterCode: "class RequestValidationError(Exception):\n    def __init__(self, detail):\n        self.status_code = 422\n        self.detail = detail\n        super().__init__(detail)\n\ndef validate_relay_request(payload):\n    # TODO: validate and normalize the route boundary.\n    return {}\n",
    visibleExamples: [
      { label: "VALID", input: "{'name':' Aurora ', 'power':82}", output: "{'name':'Aurora', 'power':82}" },
      { label: "INVALID", input: "blank name or boolean power", output: "422 RequestValidationError" },
    ],
    runtime: {
      minimumCodeLength: 190,
      requiredPatterns: [{ pattern: "raise\\s+RequestValidationError", flags: "im", name: "Returns a stable validation failure", hint: "Raise RequestValidationError with a useful detail for invalid input." }],
      pythonTests: [
        { name: "Normalizes a valid request", code: "assert validate_relay_request({'name':' Aurora ','power':82})=={'name':'Aurora','power':82}", hint: "Strip the name and preserve integer power." },
        { name: "Rejects invalid boundary values", code: "bad=[None,{'name':'A'},{'name':'','power':1},{'name':'A','power':True},{'name':'A','power':101},{'name':'A','power':1,'extra':2}]\nfor value in bad:\n    try:\n        validate_relay_request(value); assert False\n    except RequestValidationError as exc:\n        assert exc.status_code==422 and exc.detail", hint: "Validate object shape, exact keys, name, integer type, and range." },
      ],
    },
  };

  if (topic.title === "SQL") return {
    title: "Parameterized repository query mission",
    instructions: "Complete build_relay_lookup(min_power, names). Return sql and params. SQL must use %s for min_power and ANY(%s) for names, order by power descending then relay_id, and contain no input values. params must be (min_power, list(names)). Reject blank names and preserve input.",
    starterCode: "def build_relay_lookup(min_power, names):\n    # TODO: return parameterized SQL and its values.\n    return {'sql': '', 'params': ()}\n",
    visibleExamples: [
      { label: "PARAMETERS", input: "70, ['Aurora Prime']", output: "two placeholders and separate params" },
      { label: "QUOTE", input: "name O'Relay", output: "quote never enters SQL text" },
    ],
    runtime: {
      minimumCodeLength: 125,
      requiredPatterns: [{ pattern: "ANY\\s*\\(\\s*%s\\s*\\)", flags: "im", name: "Binds a collection safely", hint: "Use name = ANY(%s) rather than formatting an IN list." }],
      pythonTests: [
        { name: "Query and parameters are separated", code: "names=['Aurora Prime',\"O'Relay\"]; r=build_relay_lookup(70,names); assert r['params']==(70,names) and r['sql'].count('%s')==2 and '70' not in r['sql'] and \"O'Relay\" not in r['sql'] and 'ORDER BY power DESC, relay_id' in r['sql']", hint: "Return the numeric threshold and a copied names list as parameters." },
        { name: "Source input is preserved", code: "names=['A']; build_relay_lookup(1,names); assert names==['A']", hint: "Do not mutate the provided list." },
        { name: "Blank names are rejected", code: "try:\n    build_relay_lookup(1,['A','  ']); assert False\nexcept ValueError:\n    pass", hint: "Require every name to remain nonblank after stripping." },
      ],
    },
  };

  if (topic.title === "ORM") return {
    title: "Single-query relationship hydration mission",
    instructions: "Complete hydrate_relays(rows), where rows come from one joined query with relay_id, relay_name, sector_id, and sector_name. Return relays ordered by relay_id, deduplicate repeated relay rows, reuse one identical sector dictionary object for rows in the same sector, and reject conflicting data for an existing id.",
    starterCode: "def hydrate_relays(rows):\n    sectors = {}\n    relays = {}\n    # TODO: build an identity map from one joined result.\n    return []\n",
    visibleExamples: [
      { label: "IDENTITY MAP", input: "two Aurora relays", output: "both reference the same sector object" },
      { label: "DUPLICATE JOIN ROW", input: "same relay repeated", output: "one hydrated relay" },
    ],
    runtime: {
      minimumCodeLength: 190,
      requiredPatterns: [{ pattern: "sectors\\.(?:get|setdefault)|sector_id\\s+in\\s+sectors", flags: "im", name: "Reuses relationship identity", hint: "Create each sector object once and reuse it by sector_id." }],
      pythonTests: [
        { name: "Hydrates one joined result", code: "rows=[{'relay_id':2,'relay_name':'Edge','sector_id':1,'sector_name':'Aurora'},{'relay_id':1,'relay_name':'Prime','sector_id':1,'sector_name':'Aurora'},{'relay_id':1,'relay_name':'Prime','sector_id':1,'sector_name':'Aurora'}]; r=hydrate_relays(rows); assert [x['id'] for x in r]==[1,2] and r[0]['sector'] is r[1]['sector'] and r[0]['sector']=={'id':1,'name':'Aurora'}", hint: "Map by identity, reuse sector objects, and sort the final relays." },
        { name: "Empty rows are handled", code: "assert hydrate_relays([])==[]", hint: "Return an empty list without special objects." },
        { name: "Conflicting identities are rejected", code: "rows=[{'relay_id':1,'relay_name':'A','sector_id':1,'sector_name':'S'},{'relay_id':1,'relay_name':'B','sector_id':1,'sector_name':'S'}]\ntry:\n    hydrate_relays(rows); assert False\nexcept ValueError:\n    pass", hint: "An existing relay id cannot change its mapped fields." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["relays · 4 rows", "Aurora Prime power · 96", "Ember Gate power · 44", "transactional PostgreSQL practice database"] };

export function buildRoundNineSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Transaction Core") return {
    ...sqlBase,
    title: "Transaction Core SQL project",
    instructions: "Create relay_power_transfers with a primary key, two relay foreign keys, positive amount check, and occurred_at. Create transfer_relay_power(p_from, p_to, p_amount) as a VOLATILE plpgsql function returning void. It must reject nonpositive amounts, lock both relays in relay_id order with FOR UPDATE, reject insufficient donor power, update both rows, and insert an audit row. In a SERIALIZABLE transaction call it to move 10 power from relay 1 to relay 3, then commit and return both relays ordered by relay_id.",
    starterCode: "CREATE TABLE relay_power_transfers (\n  transfer_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  from_relay_id bigint NOT NULL REFERENCES relays(relay_id),\n  to_relay_id bigint NOT NULL REFERENCES relays(relay_id),\n  amount numeric(10,2) NOT NULL CHECK (amount > 0),\n  occurred_at timestamptz NOT NULL DEFAULT now()\n);\n\nCREATE FUNCTION transfer_relay_power(p_from bigint, p_to bigint, p_amount numeric)\nRETURNS void\nLANGUAGE plpgsql VOLATILE AS $$\nBEGIN\n  -- TODO: validate amount and distinct ids.\n  -- TODO: lock both relay rows in relay_id order.\n  -- TODO: reject insufficient donor power, update both rows, and audit.\nEND;\n$$;\n\nBEGIN;\nSET TRANSACTION ISOLATION LEVEL SERIALIZABLE;\nSELECT transfer_relay_power(1, 3, 10);\nCOMMIT;\n\nSELECT relay_id, name, power\nFROM relays WHERE relay_id IN (1, 3)\nORDER BY relay_id;\n",
    visibleExamples: [
      { label: "ATOMIC TRANSFER", input: "10 power from Aurora Prime to Ember Gate", output: "86 and 54; total remains 140" },
      { label: "AUDIT", input: "successful transfer", output: "one transfer record" },
    ],
    runtime: {
      minimumCodeLength: 720,
      requiredPatterns: [
        { pattern: "CREATE\\s+FUNCTION\\s+transfer_relay_power", flags: "i", name: "Defines the transactional operation", hint: "Create the exact requested function." },
        { pattern: "FOR\\s+UPDATE", flags: "i", name: "Locks participating relays", hint: "Select both rows ordered by relay_id FOR UPDATE." },
        { pattern: "ORDER\\s+BY\\s+relay_id[\\s\\S]*FOR\\s+UPDATE", flags: "i", name: "Uses consistent lock order", hint: "Acquire row locks in relay_id order." },
        { pattern: "SET\\s+TRANSACTION\\s+ISOLATION\\s+LEVEL\\s+SERIALIZABLE", flags: "i", name: "Protects the project transaction", hint: "Keep the supplied serializable transaction statement." },
        { pattern: "INSERT\\s+INTO\\s+relay_power_transfers", flags: "i", name: "Audits the committed transfer", hint: "Insert the transfer only after both updates succeed." },
      ],
      sqlTests: [
        { name: "Transfer function exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_proc WHERE proname = 'transfer_relay_power'", column: "count", expected: 1, hint: "Create transfer_relay_power before calling it." },
        { name: "One transfer is audited", kind: "database-value", query: "SELECT count(*)::int AS count FROM relay_power_transfers WHERE from_relay_id = 1 AND to_relay_id = 3 AND amount = 10", column: "count", expected: 1, hint: "Insert one audit row inside the function." },
        { name: "Project columns are exact", kind: "result-columns", columns: ["relay_id","name","power"], hint: "Finish with the supplied relay result." },
        { name: "Power moves atomically", kind: "result-ordered-values", column: "power", expected: [86,54], hint: "Subtract from relay 1 and add to relay 3." },
        { name: "Total power is preserved", kind: "database-value", query: "SELECT sum(power)::int AS total FROM relays WHERE relay_id IN (1,3)", column: "total", expected: 140, hint: "Perform both updates in the same function and transaction." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Transactions") return {
    ...sqlBase,
    title: "Atomic power transfer mission",
    instructions: "In one explicit transaction, subtract 10 power from relay 1 only if it has enough, add 10 to relay 3, insert a challenge note recording transfer-complete, commit, then return relays 1 and 3 ordered by id.",
    starterCode: "BEGIN;\n\nUPDATE relays\nSET power = power - 10\nWHERE relay_id = 1 AND power >= 10;\n\n/* add the same amount to relay 3 */\n\nINSERT INTO challenge_notes (note_id, topic, priority)\nVALUES (99, 'transfer-complete', 3);\n\nCOMMIT;\n\nSELECT relay_id, power FROM relays\nWHERE relay_id IN (1, 3)\nORDER BY relay_id;\n",
    visibleExamples: [
      { label: "BEFORE", input: "96 and 44", output: "total 140" },
      { label: "AFTER", input: "transfer 10", output: "86 and 54; total 140" },
    ],
    runtime: {
      minimumCodeLength: 230,
      requiredPatterns: [{ pattern: "\\bBEGIN\\s*;[\\s\\S]*\\bCOMMIT\\s*;", flags: "i", name: "Groups the complete state change", hint: "Keep all writes between BEGIN and COMMIT." }],
      sqlTests: [
        { name: "Transfer result is exact", kind: "result-ordered-values", column: "power", expected: [86,54], hint: "Add 10 to relay 3 after subtracting from relay 1." },
        { name: "Audit note committed", kind: "database-value", query: "SELECT count(*)::int AS count FROM challenge_notes WHERE note_id = 99 AND topic = 'transfer-complete'", column: "count", expected: 1, hint: "Insert the supplied note inside the transaction." },
        { name: "Total remains invariant", kind: "database-value", query: "SELECT sum(power)::int AS total FROM relays WHERE relay_id IN (1,3)", column: "total", expected: 140, hint: "Move rather than create power." },
      ],
    },
  };

  if (topic.title === "ACID") return {
    ...sqlBase,
    title: "Invariant-preserving repair mission",
    instructions: "Create repair_audit with an identity primary key, relay foreign key, positive delta check, and timestamp. In one transaction increase Ember Gate power by 6, set status to maintenance, insert the matching audit row, and commit. Return its name, power, and status.",
    starterCode: "CREATE TABLE repair_audit (\n  audit_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  relay_id bigint NOT NULL REFERENCES relays(relay_id),\n  delta integer NOT NULL CHECK (delta > 0),\n  occurred_at timestamptz NOT NULL DEFAULT now()\n);\n\nBEGIN;\n/* update relay 3 to power 50 and maintenance */\n/* insert its +6 audit record */\nCOMMIT;\n\nSELECT name, power, status FROM relays WHERE relay_id = 3;\n",
    visibleExamples: [
      { label: "CONSISTENT STATE", input: "repair +6", output: "power 50, maintenance, one +6 audit" },
      { label: "ATOMICITY", input: "any statement fails", output: "no partial committed repair" },
    ],
    runtime: {
      minimumCodeLength: 300,
      requiredPatterns: [
        { pattern: "CHECK\\s*\\(\\s*delta\\s*>\\s*0\\s*\\)", flags: "i", name: "Encodes a consistency rule", hint: "Keep CHECK (delta > 0)." },
        { pattern: "\\bBEGIN\\s*;[\\s\\S]*\\bCOMMIT\\s*;", flags: "i", name: "Makes repair and audit atomic", hint: "Place both writes inside one transaction." },
      ],
      sqlTests: [
        { name: "Repair state is exact", kind: "result-value", column: "power", expected: 50, hint: "Add 6 to Ember Gate's original power 44." },
        { name: "Maintenance status is committed", kind: "result-value", column: "status", expected: "maintenance", hint: "Update status in the same statement or transaction." },
        { name: "Audit matches the transition", kind: "database-value", query: "SELECT count(*)::int AS count FROM repair_audit WHERE relay_id = 3 AND delta = 6", column: "count", expected: 1, hint: "Insert one corresponding audit row." },
      ],
    },
  };

  if (topic.title === "Isolation levels") return {
    ...sqlBase,
    title: "Serializable decision mission",
    instructions: "Begin a transaction, set it to SERIALIZABLE, lock relay 4 with SELECT FOR UPDATE, update it to online only when power is at least 68, commit, and return its name, online, and power.",
    starterCode: "BEGIN;\nSET TRANSACTION ISOLATION LEVEL /* strongest level */;\n\nSELECT relay_id, power FROM relays\nWHERE relay_id = 4\n/* protect the decision */;\n\nUPDATE relays SET online = true\nWHERE relay_id = 4 AND power >= 68;\n\nCOMMIT;\nSELECT name, online, power FROM relays WHERE relay_id = 4;\n",
    visibleExamples: [
      { label: "DECISION", input: "Tidal Link power 68", output: "online true" },
      { label: "ISOLATION", input: "concurrent conflicting decision", output: "serializable ordering or retryable abort" },
    ],
    runtime: {
      minimumCodeLength: 230,
      requiredPatterns: [
        { pattern: "SET\\s+TRANSACTION\\s+ISOLATION\\s+LEVEL\\s+SERIALIZABLE", flags: "i", name: "Selects serializable isolation", hint: "Complete the isolation statement with SERIALIZABLE." },
        { pattern: "FOR\\s+UPDATE", flags: "i", name: "Locks the decision row", hint: "Add FOR UPDATE to the supplied SELECT." },
      ],
      sqlTests: [
        { name: "Decision row is returned", kind: "result-value", column: "name", expected: "Tidal Link", hint: "Keep the final relay 4 query." },
        { name: "Eligible relay became online", kind: "database-value", query: "SELECT online FROM relays WHERE relay_id = 4", column: "online", expected: "true", hint: "Update relay 4 when power >= 68." },
      ],
    },
  };

  if (topic.title === "Locks") return {
    ...sqlBase,
    title: "Skip-locked worker mission",
    instructions: "In one transaction use a CTE to select the first non-stable relay ordered by relay_id FOR UPDATE SKIP LOCKED LIMIT 1. Update only that row to maintenance, commit, then return all non-stable relays ordered by relay_id.",
    starterCode: "BEGIN;\nWITH next_relay AS (\n  SELECT relay_id\n  FROM relays\n  WHERE status <> 'stable'\n  ORDER BY relay_id\n  /* worker-safe row claim */\n  LIMIT 1\n)\nUPDATE relays r\nSET status = 'maintenance'\nFROM next_relay n\nWHERE r.relay_id = n.relay_id;\nCOMMIT;\n\nSELECT relay_id, name, status\nFROM relays WHERE status <> 'stable'\nORDER BY relay_id;\n",
    visibleExamples: [
      { label: "CLAIM", input: "critical relay 1, weak relay 3", output: "relay 1 becomes maintenance" },
      { label: "COMPETING WORKER", input: "row 1 already locked", output: "worker can skip to another eligible row" },
    ],
    runtime: {
      minimumCodeLength: 285,
      requiredPatterns: [{ pattern: "FOR\\s+UPDATE\\s+SKIP\\s+LOCKED", flags: "i", name: "Claims available work without waiting", hint: "Add FOR UPDATE SKIP LOCKED before LIMIT 1." }],
      sqlTests: [
        { name: "First eligible relay is claimed", kind: "database-value", query: "SELECT status FROM relays WHERE relay_id = 1", column: "status", expected: "maintenance", hint: "Order by relay_id and limit the locked CTE to one row." },
        { name: "Other eligible relay is untouched", kind: "database-value", query: "SELECT status FROM relays WHERE relay_id = 3", column: "status", expected: "weak", hint: "Update only the CTE-selected row." },
        { name: "Result columns are exact", kind: "result-columns", columns: ["relay_id","name","status"], hint: "Keep the supplied final SELECT." },
      ],
    },
  };

  if (topic.title === "Functions/procedures") return {
    ...sqlBase,
    title: "Stable relay-count function mission",
    instructions: "Create active_relay_count(p_sector bigint) returning bigint as a LANGUAGE sql STABLE function that counts online relays for the supplied sector. Query it for every sector and return sector_name plus active_count ordered by sector_id.",
    starterCode: "CREATE FUNCTION active_relay_count(p_sector bigint)\nRETURNS bigint\nLANGUAGE sql\n/* volatility */\nAS $$\n  /* parameterized count query */\n$$;\n\nSELECT s.name AS sector_name,\n       active_relay_count(s.sector_id) AS active_count\nFROM sectors s\nORDER BY s.sector_id;\n",
    visibleExamples: [
      { label: "AURORA", input: "sector 1", output: "2 active relays" },
      { label: "EMBER", input: "sector 2", output: "0 active relays" },
    ],
    runtime: {
      minimumCodeLength: 220,
      requiredPatterns: [
        { pattern: "LANGUAGE\\s+sql\\s+STABLE", flags: "i", name: "Declares safe planner semantics", hint: "Place STABLE after LANGUAGE sql." },
        { pattern: "sector_id\\s*=\\s*p_sector", flags: "i", name: "Uses the routine argument", hint: "Filter relays where sector_id = p_sector." },
      ],
      sqlTests: [
        { name: "Function exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_proc WHERE proname = 'active_relay_count'", column: "count", expected: 1, hint: "Create the exact requested function." },
        { name: "Function result columns are exact", kind: "result-columns", columns: ["sector_name","active_count"], hint: "Keep both supplied aliases." },
        { name: "Counts are correct by sector", kind: "result-ordered-values", column: "active_count", expected: [2,0,1], hint: "Count only online relays matching p_sector." },
      ],
    },
  };

  return null;
}
