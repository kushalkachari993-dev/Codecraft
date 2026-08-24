import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundElevenPythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Project Foundry") return {
    title: "Project Foundry Python project",
    instructions: "Build sync_relay_batch(fetch_one, relay_ids, max_workers=4). Require a nonempty list of unique integer non-boolean IDs and max_workers from 1 through 8. Fetch statuses concurrently with ThreadPoolExecutor, using at most min(max_workers, len(ids)) workers while preserving input order. Each result must be a dict whose id matches the requested id, name normalizes to nonblank text, and power is a non-boolean number from 0 through 100. Return package='codecraft.sync', module='src/codecraft/sync.py', immutable rows tuples, one PostgreSQL INSERT ... ON CONFLICT statement using only %s value placeholders, and one flat params tuple. Do not mutate inputs or swallow fetch exceptions.",
    starterCode: "from concurrent.futures import ThreadPoolExecutor\n\ndef _validate_ids(relay_ids):\n    # TODO: validate this public boundary.\n    return tuple(relay_ids)\n\ndef _build_upsert(rows):\n    # TODO: create PostgreSQL placeholder SQL and flat params.\n    return '', ()\n\ndef sync_relay_batch(fetch_one, relay_ids, max_workers=4):\n    # TODO: coordinate bounded I/O and return the package-facing result.\n    return {}\n",
    visibleExamples: [
      { label: "PACKAGE RESULT", input: "ids [2,1]", output: "rows stay (2,...),(1,...); module is src/codecraft/sync.py" },
      { label: "SQL SAFETY", input: "name O'Relay", output: "name appears only in params, never SQL text" },
    ],
    runtime: {
      minimumCodeLength: 560,
      requiredPatterns: [
        { pattern: "ThreadPoolExecutor\\s*\\(", flags: "im", name: "Runs bounded concurrent I/O", hint: "Create ThreadPoolExecutor with the validated bounded worker count." },
        { pattern: "\\.map\\s*\\(", flags: "im", name: "Preserves input order", hint: "executor.map returns results in input order." },
        { pattern: "VALUES\\s*\\([\\s\\S]*%s", flags: "im", name: "Uses PostgreSQL placeholders", hint: "Generate one (%s, %s, %s) group per row." },
        { pattern: "ON\\s+CONFLICT", flags: "im", name: "Builds an idempotent upsert", hint: "Use ON CONFLICT (relay_id) DO UPDATE." },
        { pattern: "src/codecraft/sync\\.py", flags: "im", name: "Exposes a structured module boundary", hint: "Return the exact module path." },
      ],
      pythonTests: [
        { name: "Batch preserves order and package boundary", code: "data={2:{'id':2,'name':' Edge ','power':82},1:{'id':1,'name':'Prime','power':96}}; calls=[]\ndef fetch(i): calls.append(i); return data[i]\nr=sync_relay_batch(fetch,[2,1],2); assert r['package']=='codecraft.sync' and r['module']=='src/codecraft/sync.py' and r['rows']==((2,'Edge',82),(1,'Prime',96)) and sorted(calls)==[1,2]", hint: "Normalize each result but retain executor.map input order." },
        { name: "SQL and parameters are exact", code: "def fetch(i): return {'id':i,'name':\"O'Relay\" if i==1 else 'Edge','power':70+i}\nr=sync_relay_batch(fetch,[1,2]); assert \"O'Relay\" not in r['sql'] and r['sql'].count('%s')==6 and 'ON CONFLICT (relay_id)' in r['sql'] and r['params']==(1,\"O'Relay\",71,2,'Edge',72)", hint: "Put every value in a flat params tuple and only placeholders in SQL." },
        { name: "Boundary and fetched data are validated", code: "bad_inputs=[([],4),([1,1],4),([True],4),([1],0),([1],9)]\nfor ids,w in bad_inputs:\n    try:\n        sync_relay_batch(lambda i:{'id':i,'name':'A','power':1},ids,w); assert False\n    except (TypeError,ValueError):\n        pass\nbad_results=[{'id':2,'name':'A','power':1},{'id':1,'name':' ','power':1},{'id':1,'name':'A','power':True},{'id':1,'name':'A','power':101}]\nfor item in bad_results:\n    try:\n        sync_relay_batch(lambda i,x=item:x,[1]); assert False\n    except (TypeError,ValueError):\n        pass", hint: "Validate IDs, worker bounds, result identity, normalized name, and numeric power." },
        { name: "Source ids are not mutated and failures propagate", code: "ids=[1,2]; original=list(ids)\ntry:\n    sync_relay_batch(lambda i: (_ for _ in ()).throw(RuntimeError('offline')) if i==2 else {'id':1,'name':'A','power':1},ids)\n    assert False\nexcept RuntimeError:\n    pass\nassert ids==original", hint: "Copy IDs to an immutable sequence and let executor result exceptions reach the caller." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Concurrency intro") return {
    title: "Bounded concurrent fetch mission",
    instructions: "Implement fetch_relay_statuses(fetch_one, relay_ids, max_workers=4). Require relay_ids to be a list of unique integer non-boolean IDs and max_workers from 1 through 8. Use ThreadPoolExecutor with no more workers than IDs, preserve input order, return a tuple of results, do not mutate the input, and let fetch exceptions propagate.",
    starterCode: "from concurrent.futures import ThreadPoolExecutor\n\ndef fetch_relay_statuses(fetch_one, relay_ids, max_workers=4):\n    # TODO: validate, bound workers, and preserve result order.\n    return ()\n",
    visibleExamples: [
      { label: "ORDER", input: "fetches finish 3,1,2", output: "results remain in requested order 1,2,3" },
      { label: "BOUND", input: "two ids, max_workers 8", output: "executor uses two workers" },
    ],
    runtime: {
      minimumCodeLength: 230,
      requiredPatterns: [
        { pattern: "ThreadPoolExecutor\\s*\\(", flags: "im", name: "Uses a thread pool", hint: "Construct a ThreadPoolExecutor with a bounded max_workers." },
        { pattern: "\\.map\\s*\\(", flags: "im", name: "Preserves requested order", hint: "Use executor.map(fetch_one, ids)." },
      ],
      pythonTests: [
        { name: "Results preserve input order", code: "import time\ndef fetch(i): time.sleep((4-i)*.005); return 'r'+str(i)\nassert fetch_relay_statuses(fetch,[1,2,3],3)==('r1','r2','r3')", hint: "executor.map yields in iterable order even when completion order differs." },
        { name: "Arguments are validated", code: "for ids,w in [([1,1],2),([True],2),('bad',2),([1],0),([1],9)]:\n    try:\n        fetch_relay_statuses(lambda x:x,ids,w); assert False\n    except (TypeError,ValueError):\n        pass", hint: "Require a list of unique integer non-boolean IDs and workers 1..8." },
        { name: "Input and errors remain visible", code: "ids=[1]; assert fetch_relay_statuses(lambda x:x,ids)==(1,) and ids==[1]\ntry:\n    fetch_relay_statuses(lambda x:(_ for _ in ()).throw(RuntimeError('down')),[1]); assert False\nexcept RuntimeError:\n    pass", hint: "Do not modify ids or catch dependency failures as successes." },
      ],
    },
  };

  if (topic.title === "Project structure") return {
    title: "Src-layout manifest mission",
    instructions: "Implement build_project_manifest(package_name, modules). Accept a lowercase Python identifier package name and a nonempty list of unique lowercase identifier module names. Return a dictionary with pyproject='pyproject.toml', package_dir='src/<package>', init='src/<package>/__init__.py', modules as a sorted tuple of module file paths, tests as a matching sorted tuple tests/test_<module>.py, and entrypoint='<package>.cli:main' only when cli is present, otherwise None. Do not mutate modules.",
    starterCode: "def build_project_manifest(package_name, modules):\n    # TODO: validate names and build a deterministic src-layout manifest.\n    return {}\n",
    visibleExamples: [
      { label: "PACKAGE", input: "codecraft, ['sync','cli']", output: "src/codecraft plus matching tests and codecraft.cli:main" },
      { label: "DETERMINISM", input: "modules in any order", output: "sorted module and test tuples" },
    ],
    runtime: {
      minimumCodeLength: 240,
      requiredPatterns: [
        { pattern: "\\.isidentifier\\s*\\(", flags: "im", name: "Validates importable names", hint: "Use isidentifier() for package and module names." },
        { pattern: "sorted\\s*\\(", flags: "im", name: "Produces deterministic structure", hint: "Sort module names before creating paths." },
      ],
      pythonTests: [
        { name: "Manifest has exact src boundaries", code: "m=build_project_manifest('codecraft',['sync','cli']); assert m=={'pyproject':'pyproject.toml','package_dir':'src/codecraft','init':'src/codecraft/__init__.py','modules':('src/codecraft/cli.py','src/codecraft/sync.py'),'tests':('tests/test_cli.py','tests/test_sync.py'),'entrypoint':'codecraft.cli:main'}", hint: "Build paths from sorted names and add the CLI entry point when present." },
        { name: "Manifest without CLI is explicit", code: "assert build_project_manifest('relay',['service'])['entrypoint'] is None", hint: "Return None rather than omitting entrypoint." },
        { name: "Invalid names and duplicates fail", code: "for p,mods in [('Bad',['x']),('good',['bad-name']),('good',[]),('good',['x','x'])]:\n    try:\n        build_project_manifest(p,mods); assert False\n    except (TypeError,ValueError):\n        pass", hint: "Require lowercase identifiers, at least one module, and no duplicates." },
      ],
    },
  };

  if (topic.title === "PostgreSQL") return {
    title: "Parameterized PostgreSQL upsert mission",
    instructions: "Implement build_relay_upsert(records). Validate a nonempty list of dictionaries with unique integer non-boolean id, nonblank normalized name, and non-boolean numeric power 0 through 100. Return one PostgreSQL INSERT for relay_id, name, power with a (%s,%s,%s) group per record, ON CONFLICT (relay_id) updating name and power, plus one flat params tuple. Do not place values in SQL or mutate records.",
    starterCode: "def build_relay_upsert(records):\n    # TODO: validate rows, generate placeholders, and flatten parameters.\n    return {'sql': '', 'params': ()}\n",
    visibleExamples: [
      { label: "TWO ROWS", input: "ids 1 and 2", output: "six placeholders and six ordered params" },
      { label: "QUOTE", input: "name O'Relay", output: "quote is safe inside params" },
    ],
    runtime: {
      minimumCodeLength: 290,
      requiredPatterns: [
        { pattern: "%s", flags: "im", name: "Uses driver placeholders", hint: "Generate (%s, %s, %s) for each row." },
        { pattern: "ON\\s+CONFLICT\\s*\\(\\s*relay_id\\s*\\)", flags: "im", name: "Defines the upsert key", hint: "Add ON CONFLICT (relay_id) DO UPDATE." },
      ],
      pythonTests: [
        { name: "Upsert shape and params are exact", code: "r=build_relay_upsert([{'id':1,'name':' Prime ','power':96},{'id':2,'name':'Edge','power':82}]); assert r['sql'].count('%s')==6 and 'ON CONFLICT (relay_id)' in r['sql'] and r['params']==(1,'Prime',96,2,'Edge',82)", hint: "Normalize in record order and flatten three values per row." },
        { name: "Values never enter SQL", code: "r=build_relay_upsert([{'id':1,'name':\"O'Relay\",'power':70}]); assert \"O'Relay\" not in r['sql'] and r['params']==(1,\"O'Relay\",70)", hint: "SQL contains placeholders only." },
        { name: "Bad records are rejected", code: "cases=[[],[{'id':True,'name':'A','power':1}],[{'id':1,'name':' ','power':1}],[{'id':1,'name':'A','power':101}],[{'id':1,'name':'A','power':1},{'id':1,'name':'A','power':1}]]\nfor rows in cases:\n    try:\n        build_relay_upsert(rows); assert False\n    except (TypeError,ValueError):\n        pass", hint: "Validate nonempty records, unique integer IDs, names, and bounded power." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["relays · 4 rows", "sectors · 3 rows", "catalog-backed PostgreSQL practice database", "Aurora online relays · 2"] };

export function buildRoundElevenSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Production Access") return {
    ...sqlBase,
    title: "Production Access SQL project",
    instructions: "Create schema app_access and NOLOGIN role codecraft_dashboard. Create app_access.relay_dashboard as one joined projection with relay_id, relay_name, sector_name, online, status, and power. Create partial covering index idx_relays_dashboard_online on relays(sector_id, power DESC) INCLUDE(name,status) WHERE online, then ANALYZE relays and run EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) for the online sector 1 lookup. Revoke all on schema app_access from PUBLIC, grant schema usage and view SELECT to codecraft_dashboard, and finish by returning the two online Aurora rows from the view ordered by relay_id.",
    starterCode: "CREATE SCHEMA app_access;\nCREATE ROLE codecraft_dashboard NOLOGIN;\n\nCREATE VIEW app_access.relay_dashboard AS\nSELECT r.relay_id, r.name AS relay_name, s.name AS sector_name,\n       r.online, r.status, r.power\nFROM relays r\nJOIN sectors s ON s.sector_id = r.sector_id;\n\n-- TODO: create the partial covering index for online sector/power access.\n-- TODO: analyze and explain the representative lookup.\n-- TODO: revoke broad schema access and grant only USAGE plus view SELECT.\n\nSELECT relay_id, relay_name, sector_name, online, status, power\nFROM app_access.relay_dashboard\nWHERE sector_name = 'Aurora' AND online\nORDER BY relay_id;\n",
    visibleExamples: [
      { label: "ONE READ", input: "online Aurora dashboard", output: "two joined rows in one query" },
      { label: "LEAST PRIVILEGE", input: "codecraft_dashboard", output: "schema usage and view select; no table writes" },
    ],
    runtime: {
      minimumCodeLength: 680,
      requiredPatterns: [
        { pattern: "CREATE\\s+ROLE\\s+codecraft_dashboard\\s+NOLOGIN", flags: "i", name: "Creates a non-login workload role", hint: "Keep the exact NOLOGIN role declaration." },
        { pattern: "CREATE\\s+VIEW\\s+app_access\\.relay_dashboard", flags: "i", name: "Builds one bounded projection", hint: "Keep the joined application view." },
        { pattern: "CREATE\\s+INDEX\\s+idx_relays_dashboard_online[\\s\\S]*INCLUDE\\s*\\(\\s*name\\s*,\\s*status\\s*\\)[\\s\\S]*WHERE\\s+online", flags: "i", name: "Creates the measured partial covering index", hint: "Index sector_id, power DESC, include name/status, and keep WHERE online." },
        { pattern: "EXPLAIN\\s*\\(\\s*ANALYZE\\s*,\\s*BUFFERS", flags: "i", name: "Measures the access path", hint: "Run EXPLAIN ANALYZE with buffers on the representative SELECT." },
        { pattern: "GRANT\\s+SELECT\\s+ON\\s+app_access\\.relay_dashboard\\s+TO\\s+codecraft_dashboard", flags: "i", name: "Grants only the read model", hint: "Grant SELECT on the view, not write access on base tables." },
      ],
      sqlTests: [
        { name: "Application projection exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.views WHERE table_schema = 'app_access' AND table_name = 'relay_dashboard'", column: "count", expected: 1, hint: "Create the exact schema-qualified view." },
        { name: "Workload role exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_roles WHERE rolname = 'codecraft_dashboard' AND NOT rolcanlogin", column: "count", expected: 1, hint: "Create codecraft_dashboard NOLOGIN." },
        { name: "Targeted index exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname = 'idx_relays_dashboard_online'", column: "count", expected: 1, hint: "Create the exact partial covering index." },
        { name: "Dashboard result columns are exact", kind: "result-columns", columns: ["relay_id","relay_name","sector_name","online","status","power"], hint: "Finish with the supplied dashboard query." },
        { name: "Dashboard rows are exact", kind: "result-ordered-values", column: "relay_id", expected: [1,2], hint: "Return online Aurora relays ordered by relay_id." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "N+1 problem") return {
    ...sqlBase,
    title: "Single-query sector loading mission",
    instructions: "Return every relay with relay_id, relay_name, sector_id, sector_name, and sector_region using one SELECT that joins sectors once. Order by relay_id. Do not use correlated scalar subqueries.",
    starterCode: "SELECT r.relay_id,\n       r.name AS relay_name,\n       /* sector identity, name, and region */\nFROM relays r\n/* load the relationship once */\nORDER BY r.relay_id;\n",
    visibleExamples: [
      { label: "QUERY COUNT", input: "four relays", output: "one joined statement, not five statements" },
      { label: "AURORA", input: "relay ids 1 and 2", output: "both include Aurora and north" },
    ],
    runtime: {
      minimumCodeLength: 170,
      requiredPatterns: [{ pattern: "JOIN\\s+sectors", flags: "i", name: "Loads the relationship once", hint: "Join sectors on sector_id in the main query." }],
      sqlTests: [
        { name: "Projection columns are exact", kind: "result-columns", columns: ["relay_id","relay_name","sector_id","sector_name","sector_region"], hint: "Alias all requested relationship fields." },
        { name: "Every relay appears once", kind: "result-ordered-values", column: "relay_id", expected: [1,2,3,4], hint: "Use one many-to-one join and order by relay_id." },
        { name: "Sector hydration is correct", kind: "result-ordered-values", column: "sector_name", expected: ["Aurora","Aurora","Ember","Tidal"], hint: "Join r.sector_id to s.sector_id." },
      ],
    },
  };

  if (topic.title === "Security") return {
    ...sqlBase,
    title: "Least-privilege reporting role mission",
    instructions: "Create NOLOGIN role relay_reporter. Revoke all privileges on relays from PUBLIC, grant USAGE on schema public to relay_reporter, and grant SELECT on relays and sectors only. Finish with a catalog query returning role_name, can_login, can_select_relays, and can_update_relays for relay_reporter.",
    starterCode: "CREATE ROLE relay_reporter NOLOGIN;\n\n-- TODO: revoke broad table access and grant only required schema/table reads.\n\nSELECT r.rolname AS role_name,\n       r.rolcanlogin AS can_login,\n       has_table_privilege(r.rolname, 'relays', 'SELECT') AS can_select_relays,\n       has_table_privilege(r.rolname, 'relays', 'UPDATE') AS can_update_relays\nFROM pg_roles r\nWHERE r.rolname = 'relay_reporter';\n",
    visibleExamples: [
      { label: "READ", input: "relay_reporter queries relays", output: "allowed" },
      { label: "WRITE", input: "relay_reporter updates relays", output: "denied" },
    ],
    runtime: {
      minimumCodeLength: 300,
      requiredPatterns: [
        { pattern: "REVOKE\\s+ALL(?:\\s+PRIVILEGES)?\\s+ON\\s+(?:TABLE\\s+)?relays\\s+FROM\\s+PUBLIC", flags: "i", name: "Removes broad table access", hint: "Revoke all on relays from PUBLIC." },
        { pattern: "GRANT\\s+SELECT\\s+ON\\s+(?:TABLE\\s+)?relays\\s*,\\s*sectors\\s+TO\\s+relay_reporter", flags: "i", name: "Grants only required reads", hint: "Grant SELECT on relays and sectors to relay_reporter." },
      ],
      sqlTests: [
        { name: "Reporter role is inspectable", kind: "result-value", column: "role_name", expected: "relay_reporter", hint: "Create the role and keep the final catalog query." },
        { name: "Reporter cannot log in", kind: "result-value", column: "can_login", expected: "false", hint: "Declare the role NOLOGIN." },
        { name: "Reporter can read relays", kind: "result-value", column: "can_select_relays", expected: "true", hint: "Grant SELECT on relays." },
        { name: "Reporter cannot update relays", kind: "result-value", column: "can_update_relays", expected: "false", hint: "Do not grant write privileges." },
      ],
    },
  };

  if (topic.title === "PostgreSQL deeper") return {
    ...sqlBase,
    title: "Schema and catalog mission",
    instructions: "Create schema operations and operations.online_relay_catalog as a view joining relays and sectors with relay_id, relay_name, sector_name, status, and power for online relays only. Finish with a pg_catalog query returning schema_name, view_name, and owner_name for that view.",
    starterCode: "CREATE SCHEMA operations;\n\nCREATE VIEW operations.online_relay_catalog AS\nSELECT r.relay_id, r.name AS relay_name, s.name AS sector_name, r.status, r.power\nFROM relays r\nJOIN sectors s ON s.sector_id = r.sector_id\nWHERE /* online only */;\n\nSELECT n.nspname AS schema_name,\n       c.relname AS view_name,\n       pg_get_userbyid(c.relowner) AS owner_name\nFROM pg_catalog.pg_class c\nJOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace\nWHERE n.nspname = 'operations' AND c.relname = 'online_relay_catalog';\n",
    visibleExamples: [
      { label: "NAMESPACE", input: "operations.online_relay_catalog", output: "qualified view isolated from public objects" },
      { label: "CATALOG", input: "pg_class + pg_namespace", output: "schema, relation, owner metadata" },
    ],
    runtime: {
      minimumCodeLength: 390,
      requiredPatterns: [
        { pattern: "CREATE\\s+SCHEMA\\s+operations", flags: "i", name: "Creates a deliberate namespace", hint: "Keep the exact schema declaration." },
        { pattern: "pg_catalog\\.pg_class[\\s\\S]*pg_catalog\\.pg_namespace", flags: "i", name: "Uses PostgreSQL catalogs", hint: "Keep both supplied catalog relations." },
      ],
      sqlTests: [
        { name: "Operations schema exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.schemata WHERE schema_name = 'operations'", column: "count", expected: 1, hint: "Create schema operations." },
        { name: "Online catalog has three rows", kind: "database-value", query: "SELECT count(*)::int AS count FROM operations.online_relay_catalog", column: "count", expected: 3, hint: "Filter the view with r.online." },
        { name: "Catalog result columns are exact", kind: "result-columns", columns: ["schema_name","view_name","owner_name"], hint: "Keep the supplied aliases." },
        { name: "Catalog identifies the view", kind: "result-value", column: "view_name", expected: "online_relay_catalog", hint: "Filter pg_class by the exact view name." },
      ],
    },
  };

  if (topic.title === "Query optimization") return {
    ...sqlBase,
    title: "Measured online-relay index mission",
    instructions: "Create partial covering index idx_relays_online_sector_power_qo on relays(sector_id, power DESC) INCLUDE(name,status) WHERE online. ANALYZE relays, run EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) for online sector 1 ordered by power descending, then finish with the actual query returning name, power, and status.",
    starterCode: "-- TODO: create the exact partial covering index.\nANALYZE relays;\n\nEXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)\nSELECT name, power, status\nFROM relays\nWHERE sector_id = 1 AND online\nORDER BY power DESC;\n\nSELECT name, power, status\nFROM relays\nWHERE sector_id = 1 AND online\nORDER BY power DESC;\n",
    visibleExamples: [
      { label: "ACCESS PATH", input: "sector equality + online + power order", output: "matching partial composite index" },
      { label: "RESULT", input: "sector 1", output: "Aurora Prime 96, Aurora Edge 82" },
    ],
    runtime: {
      minimumCodeLength: 340,
      requiredPatterns: [
        { pattern: "CREATE\\s+INDEX\\s+idx_relays_online_sector_power_qo[\\s\\S]*\\(\\s*sector_id\\s*,\\s*power\\s+DESC\\s*\\)[\\s\\S]*INCLUDE\\s*\\(\\s*name\\s*,\\s*status\\s*\\)[\\s\\S]*WHERE\\s+online", flags: "i", name: "Matches the workload", hint: "Use the exact key order, INCLUDE list, and partial predicate." },
        { pattern: "EXPLAIN\\s*\\(\\s*ANALYZE\\s*,\\s*BUFFERS", flags: "i", name: "Measures actual execution", hint: "Keep EXPLAIN ANALYZE with buffers." },
      ],
      sqlTests: [
        { name: "Targeted index exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname = 'idx_relays_online_sector_power_qo'", column: "count", expected: 1, hint: "Create the exact index name." },
        { name: "Result columns are exact", kind: "result-columns", columns: ["name","power","status"], hint: "Finish with the actual non-EXPLAIN query." },
        { name: "Relays are ordered by power", kind: "result-ordered-values", column: "name", expected: ["Aurora Prime","Aurora Edge"], hint: "Filter sector 1 online and order power descending." },
      ],
    },
  };

  return null;
}
