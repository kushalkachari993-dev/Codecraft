import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundSixteenPythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "CPython Lab") return {
    title: "CPython Lab Python project",
    instructions: "Implement analyze_python_source(source, function_name). Require nonblank source at most 2000 characters and an identifier function name. Parse with ast.parse without executing it; reject imports, global, nonlocal, exec, eval, and duplicate matching functions. Find exactly one top-level FunctionDef with that name, compile the module only to obtain its nested code object, and inspect it with dis.get_instructions. Return function_name, argument_names including positional-only, positional, keyword-only, *args and **kwargs in declaration order, local_names from co_varnames, referenced_names from co_names, opnames excluding CACHE, node_counts as a key-sorted dictionary of AST class counts, max_stack from co_stacksize, implementation 'cpython' only when sys.implementation.name says so, and architecture_policy mentioning domain, ports, adapters, and side effects. Never call exec or the analyzed function.",
    starterCode: "import ast\nimport dis\nimport sys\nimport types\n\ndef analyze_python_source(source, function_name):\n    # TODO: parse, validate, compile to code objects, and inspect instructions.\n    return {}\n",
    visibleExamples: [
      { label: "PIPELINE", input: "source function", output: "AST → code object → bytecode evidence" },
      { label: "SAFETY", input: "function containing eval", output: "ValueError without execution" },
    ],
    runtime: {
      minimumCodeLength: 760,
      requiredPatterns: [
        { pattern: "ast\\.parse", flags: "im", name: "Builds the syntax tree", hint: "Parse source in exec mode without executing it." },
        { pattern: "compile\\s*\\(", flags: "im", name: "Creates code objects", hint: "Compile only after the security audit." },
        { pattern: "dis\\.get_instructions", flags: "im", name: "Inspects bytecode structurally", hint: "Collect opnames from the nested function code object." },
        { pattern: "co_stacksize", flags: "im", name: "Reads runtime metadata", hint: "Return the function code object's stack size." },
      ],
      pythonTests: [
        { name: "AST, code, and bytecode evidence are exact", code: "src='def total(a, /, b=1, *items, scale=2, **meta):\\n    value = a + b + sum(items)\\n    return value * scale'; r=analyze_python_source(src,'total'); assert r['function_name']=='total' and r['argument_names']==('a','b','items','scale','meta') and r['local_names'][:6]==('a','b','scale','items','meta','value') and 'sum' in r['referenced_names'] and 'RETURN_VALUE' in r['opnames'] and r['node_counts']['FunctionDef']==1 and r['max_stack']>=2 and r['implementation'] in ('cpython','other')", hint: "Use AST argument fields for declaration order and the nested code object for locals and instructions." },
        { name: "Architecture policy names every boundary", code: "r=analyze_python_source('def f(x):\\n return x+1','f'); p=r['architecture_policy'].lower(); assert all(x in p for x in ('domain','ports','adapters','side effects'))", hint: "Return a concise policy string with all four architecture concepts." },
        { name: "Analysis never executes code", code: "marker=[]; src='def f():\\n marker.append(1)\\n return 2'; analyze_python_source(src,'f'); assert marker==[]", hint: "Compile to a code object but never call exec or the nested function." },
        { name: "Unsafe or ambiguous source fails", code: "for src,name in [('', 'f'),('def f(: pass','f'),('import os\\ndef f(): pass','f'),('def f():\\n return eval(\"1\")','f'),('def f(): pass\\ndef f(): pass','f'),('def f(): pass','bad-name')]:\n try:\n  analyze_python_source(src,name); assert False\n except (TypeError,ValueError,SyntaxError):\n  pass", hint: "Validate size and identifier, reject forbidden nodes and calls, and require one matching top-level function." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "CPython internals") return {
    title: "Caller frame snapshot mission",
    instructions: "Implement caller_frame_snapshot(depth=1). Require integer non-boolean depth 1 through 10, obtain sys._getframe(depth), and return implementation, function from f_code.co_name, filename reduced to its final slash or backslash component, first_line, local_names as a sorted tuple excluding names beginning underscore, global_names as a sorted tuple of names referenced by the code object that exist in f_globals, and has_trace. Do not return local values or mutate frames.",
    starterCode: "import sys\n\ndef caller_frame_snapshot(depth=1):\n    # TODO: inspect metadata without exposing local values.\n    return {}\n",
    visibleExamples: [
      { label: "FRAME", input: "called inside quest()", output: "function quest and public local names" },
      { label: "PRIVACY", input: "secret local value", output: "name only; value never returned" },
    ],
    runtime: {
      minimumCodeLength: 300,
      requiredPatterns: [{ pattern: "sys\\._getframe", flags: "im", name: "Inspects an execution frame", hint: "Use sys._getframe(depth)." }, { pattern: "f_code", flags: "im", name: "Reads code metadata", hint: "Use frame.f_code for name, file, line, and referenced names." }],
      pythonTests: [
        { name: "Caller metadata is captured without values", code: "GLOBAL_RELAY=3\ndef quest():\n public_value=7; _secret='hidden'; return caller_frame_snapshot()\nr=quest(); assert r['function']=='quest' and 'public_value' in r['local_names'] and '_secret' not in r['local_names'] and 'GLOBAL_RELAY' not in str(r) and r['implementation']==sys.implementation.name and isinstance(r['first_line'],int)", hint: "Return names and structural metadata only; do not stringify globals or local values." },
        { name: "Invalid depth fails", code: "for d in (0,11,True,1.5):\n try:\n  caller_frame_snapshot(d); assert False\n except (TypeError,ValueError):\n  pass", hint: "Require a non-boolean integer depth between 1 and 10." },
      ],
    },
  };

  if (topic.title === "Bytecode") return {
    title: "Instruction profile mission",
    instructions: "Implement instruction_profile(function). Require types.FunctionType. Use dis.get_instructions(function) and ignore CACHE. Return instruction_count, opnames as an occurrence-order tuple, unique_opnames sorted, jump_count for instructions whose opcode is in dis.hasjrel or dis.hasjabs, load_count for opnames beginning LOAD_, and max_offset. Do not execute or modify the function.",
    starterCode: "import dis\nimport types\n\ndef instruction_profile(function):\n    # TODO: summarize structured instruction records without execution.\n    return {}\n",
    visibleExamples: [
      { label: "BRANCH", input: "if expression", output: "one or more jump instructions" },
      { label: "LOAD", input: "parameters and constants", output: "LOAD_ operations counted" },
    ],
    runtime: {
      minimumCodeLength: 300,
      requiredPatterns: [{ pattern: "dis\\.get_instructions", flags: "im", name: "Uses structured disassembly", hint: "Materialize instruction records once." }, { pattern: "dis\\.hasj", flags: "im", name: "Classifies jumps by opcode", hint: "Check hasjrel and hasjabs." }],
      pythonTests: [
        { name: "Instruction evidence is coherent", code: "def choose(x):\n return x+1 if x>0 else 0\nr=instruction_profile(choose); assert r['instruction_count']==len(r['opnames']) and r['unique_opnames']==tuple(sorted(set(r['opnames']))) and r['jump_count']>=1 and r['load_count']>=2 and r['max_offset']>=0 and 'RETURN_VALUE' in r['opnames']", hint: "Filter CACHE consistently before all counts." },
        { name: "Function is never executed", code: "calls=[]\ndef f(): calls.append(1)\ninstruction_profile(f); assert calls==[]\nfor value in (1,lambda:None).__getitem__,(type('X',(),{})()):\n try:\n  instruction_profile(value); assert False\n except TypeError:\n  pass", hint: "Require types.FunctionType and inspect its __code__ indirectly through dis." },
      ],
    },
  };

  if (topic.title === "AST") return {
    title: "Restricted expression audit mission",
    instructions: "Implement audit_expression(source, allowed_names). Require nonblank source at most 500 characters and a set of valid identifier strings. Parse in eval mode. Allow only Expression, Constant containing int/float non-boolean, Name with Load, BinOp with Add/Sub/Mult/Div/Mod, UnaryOp with UAdd/USub, and those operator nodes. Reject calls, attributes, subscripts, collections, comparisons, comprehensions, booleans, unknown names, and trees deeper than 12. Return names sorted, operators in AST walk order, node_count, and safe True. Do not compile or evaluate.",
    starterCode: "import ast\n\ndef audit_expression(source, allowed_names):\n    # TODO: enforce a tiny arithmetic AST language without evaluation.\n    return {}\n",
    visibleExamples: [
      { label: "ALLOWED", input: "base + bonus * 2", output: "names base, bonus; operators Add, Mult" },
      { label: "BLOCKED", input: "tool.run()", output: "ValueError" },
    ],
    runtime: {
      minimumCodeLength: 480,
      requiredPatterns: [{ pattern: "ast\\.parse", flags: "im", name: "Parses expression structure", hint: "Use mode='eval'." }, { pattern: "ast\\.walk", flags: "im", name: "Audits every node", hint: "Validate the complete tree." }],
      pythonTests: [
        { name: "Safe arithmetic is described", code: "r=audit_expression('base + bonus * 2',{'base','bonus'}); assert r['names']==('base','bonus') and r['operators']==('Add','Mult') and r['safe'] is True and r['node_count']>=8", hint: "Use AST walk order for operators and sorted unique names." },
        { name: "Dangerous and unknown structures fail", code: "for src,names in [('f()',{'f'}),('obj.x',{'obj'}),('x[0]',{'x'}),('[1,2]',set()),('x > 1',{'x'}),('True + 1',set()),('secret + 1',{'public'})]:\n try:\n  audit_expression(src,names); assert False\n except (TypeError,ValueError,SyntaxError):\n  pass", hint: "Use an explicit allowlist for nodes, operators, constants, and names." },
      ],
    },
  };

  if (topic.title === "Architecture") return {
    title: "Transactional use-case boundary mission",
    instructions: "Implement execute_use_case(command, authorize, repository, outbox). command requires nonblank operation_id, actor_id, aggregate_id, and integer non-boolean delta. Call authorize(actor_id, aggregate_id, 'adjust') before repository.begin. If denied raise PermissionError with no effects. Inside begin, load aggregate, apply delta through aggregate.adjust, save it, append outbox event with event_key operation_id, type aggregate.adjusted, and payload aggregate_id/delta, then commit. On any exception after begin call rollback once and re-raise. Return aggregate. Do not publish externally.",
    starterCode: "def execute_use_case(command, authorize, repository, outbox):\n    # TODO: enforce authorization, one transaction, domain behavior, and local event intent.\n    pass\n",
    visibleExamples: [
      { label: "BOUNDARY", input: "authorized adjustment", output: "load, adjust, save, outbox, commit" },
      { label: "FAILURE", input: "save raises", output: "rollback and original exception" },
    ],
    runtime: {
      minimumCodeLength: 430,
      requiredPatterns: [{ pattern: "authorize\\s*\\(", flags: "im", name: "Checks policy before effects", hint: "Authorize before repository.begin()." }, { pattern: "rollback\\s*\\(", flags: "im", name: "Restores failed work", hint: "Rollback once in the exception path." }, { pattern: "aggregate\\.adjust", flags: "im", name: "Delegates domain behavior", hint: "Call the aggregate method instead of editing its fields." }],
      pythonTests: [
        { name: "Authorized workflow preserves order", code: "events=[]\nclass A:\n def __init__(self): self.value=1\n def adjust(self,d): events.append('adjust'); self.value+=d\nclass R:\n def begin(self): events.append('begin')\n def load(self,i): events.append('load'); return A()\n def save(self,a): events.append('save')\n def commit(self): events.append('commit')\n def rollback(self): events.append('rollback')\nclass O:\n def append(self,e): events.append(('outbox',e))\na=execute_use_case({'operation_id':'op1','actor_id':'u','aggregate_id':'a','delta':2},lambda *x:(events.append('auth') or True),R(),O()); assert a.value==3 and events[:5]==['auth','begin','load','adjust','save'] and events[-1]=='commit' and events[-2][0]=='outbox' and events[-2][1]=={'event_key':'op1','type':'aggregate.adjusted','payload':{'aggregate_id':'a','delta':2}}", hint: "Authorize first, then keep persistence and outbox intent inside one transaction." },
        { name: "Failure rolls back and denial has no effects", code: "events=[]\nclass R:\n def begin(self): events.append('begin')\n def load(self,i): raise RuntimeError('down')\n def rollback(self): events.append('rollback')\ntry:\n execute_use_case({'operation_id':'o','actor_id':'u','aggregate_id':'a','delta':1},lambda *x:True,R(),object()); assert False\nexcept RuntimeError: pass\nassert events==['begin','rollback']\nevents.clear()\ntry:\n execute_use_case({'operation_id':'o','actor_id':'u','aggregate_id':'a','delta':1},lambda *x:False,R(),object()); assert False\nexcept PermissionError: pass\nassert events==[]", hint: "Rollback only after begin; denial occurs before the transaction starts." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["relay_events · ordered event stream", "relays · transactional inventory", "analytical and placement tables created by each mission", "PostgreSQL performance practice database"] };

export function buildRoundSixteenSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Performance & Analytics") return {
    ...sqlBase,
    title: "Performance & Analytics SQL project",
    instructions: "Create analytics_feed with event_id bigint primary key, occurred_at timestamptz, relay_id bigint, region text, value numeric, and a unique index idx_analytics_feed_seek on occurred_at DESC,event_id DESC. Insert events 1 through 4 at 10:00 through 10:03 UTC with regions north,north,south,north and values 10,20,30,40. Create dim_relay with relay_key primary key and source_relay_id unique, plus fact_reading with event_id primary key, relay_key foreign key, occurred_at, and value; insert two dimension rows and all four facts at the exact one-event grain. Create distributed_placement with region primary key, replicas positive, quorum positive and <= replicas; insert north 3/2 and south 3/2. Use keyset pagination after cursor (10:03,event 4) to return event_id, occurred_at, region, value for the next two rows ordered descending.",
    starterCode: "CREATE TABLE analytics_feed (\n  event_id bigint PRIMARY KEY,\n  occurred_at timestamptz NOT NULL,\n  relay_id bigint NOT NULL,\n  region text NOT NULL,\n  value numeric NOT NULL\n);\n/* TODO: create idx_analytics_feed_seek and insert four events. */\n\nCREATE TABLE dim_relay (relay_key bigint PRIMARY KEY, source_relay_id bigint NOT NULL UNIQUE, name text NOT NULL);\nCREATE TABLE fact_reading (event_id bigint PRIMARY KEY, relay_key bigint NOT NULL REFERENCES dim_relay(relay_key), occurred_at timestamptz NOT NULL, value numeric NOT NULL);\n/* TODO: insert two dimensions and four one-event-grain facts. */\n\nCREATE TABLE distributed_placement (\n  region text PRIMARY KEY,\n  replicas integer NOT NULL CHECK (replicas > 0),\n  quorum integer NOT NULL CHECK (quorum > 0),\n  CHECK (quorum <= replicas)\n);\n/* TODO: insert north and south placement. */\n\nSELECT event_id, occurred_at, region, value\nFROM analytics_feed\nWHERE (occurred_at,event_id) < (TIMESTAMPTZ '2026-08-01 10:03:00+00',4)\nORDER BY occurred_at DESC,event_id DESC\nLIMIT 2;\n",
    visibleExamples: [
      { label: "SEEK", input: "cursor event 4", output: "events 3 then 2" },
      { label: "GRAIN", input: "four source events", output: "four fact rows" },
    ],
    runtime: {
      minimumCodeLength: 1200,
      requiredPatterns: [
        { pattern: "CREATE\\s+UNIQUE\\s+INDEX\\s+idx_analytics_feed_seek[\\s\\S]*occurred_at\\s+DESC[\\s\\S]*event_id\\s+DESC", flags: "i", name: "Indexes the complete seek order", hint: "Create the exact descending composite index." },
        { pattern: "PRIMARY\\s+KEY[\\s\\S]*REFERENCES\\s+dim_relay", flags: "i", name: "Protects fact grain and dimension integrity", hint: "Keep event_id primary and relay_key foreign." },
        { pattern: "CHECK\\s*\\(\\s*quorum\\s*<=\\s*replicas", flags: "i", name: "Constrains distributed agreement", hint: "Keep quorum within replica count." },
      ],
      sqlTests: [
        { name: "Keyset page columns are exact", kind: "result-columns", columns: ["event_id","occurred_at","region","value"], hint: "Keep the final seek projection." },
        { name: "Next events are exact", kind: "result-ordered-values", column: "event_id", expected: [3,2], hint: "Insert minute-ordered events and seek below event 4." },
        { name: "Fact grain matches events", kind: "database-value", query: "SELECT count(*)::int AS count FROM fact_reading", column: "count", expected: 4, hint: "Insert one fact per analytics event." },
        { name: "Distributed quorum is configured", kind: "database-value", query: "SELECT count(*)::int AS count FROM distributed_placement WHERE replicas=3 AND quorum=2", column: "count", expected: 2, hint: "Insert both regions with 3 replicas and quorum 2." },
        { name: "Seek index exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname='idx_analytics_feed_seek'", column: "count", expected: 1, hint: "Create the exact index name." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Performance engineering") return {
    ...sqlBase,
    title: "Concurrent benchmark evidence mission",
    instructions: "Create benchmark_samples with scenario, concurrency positive, sample_no positive, latency_ms positive, transactions_per_second positive, and primary key across scenario/concurrency/sample_no. Insert five baseline samples at concurrency 10 with latencies 40,50,60,90,120 and TPS 200,205,210,198,190. Return scenario, concurrency, percentile_disc(0.95) latency as p95_ms, round(avg TPS,2) as avg_tps, and sample count grouped and ordered.",
    starterCode: "CREATE TABLE benchmark_samples (\n  scenario text NOT NULL CHECK (btrim(scenario) <> ''),\n  concurrency integer NOT NULL CHECK (concurrency > 0),\n  sample_no integer NOT NULL CHECK (sample_no > 0),\n  latency_ms numeric NOT NULL CHECK (latency_ms > 0),\n  transactions_per_second numeric NOT NULL CHECK (transactions_per_second > 0),\n  PRIMARY KEY (scenario,concurrency,sample_no)\n);\n\n/* TODO: insert five checkout samples at concurrency 10. */\n\nSELECT scenario, concurrency,\n       percentile_disc(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_ms,\n       round(avg(transactions_per_second),2) AS avg_tps,\n       count(*)::int AS samples\nFROM benchmark_samples\nGROUP BY scenario,concurrency\nORDER BY scenario,concurrency;\n",
    visibleExamples: [
      { label: "P95", input: "40,50,60,90,120", output: "120" },
      { label: "THROUGHPUT", input: "five TPS samples", output: "average 200.60" },
    ],
    runtime: {
      minimumCodeLength: 760,
      requiredPatterns: [{ pattern: "percentile_disc\\s*\\(\\s*0\\.95", flags: "i", name: "Measures tail latency", hint: "Keep the ordered-set aggregate." }],
      sqlTests: [
        { name: "Benchmark columns are exact", kind: "result-columns", columns: ["scenario","concurrency","p95_ms","avg_tps","samples"], hint: "Keep all aliases." },
        { name: "P95 is 120", kind: "result-value", column: "p95_ms", expected: 120, hint: "Insert the exact five latency samples." },
        { name: "Five samples are recorded", kind: "result-value", column: "samples", expected: 5, hint: "Use sample numbers 1 through 5." },
      ],
    },
  };

  if (topic.title === "Keyset pagination") return {
    ...sqlBase,
    title: "Composite seek pagination mission",
    instructions: "Create feed_items with item_id primary key, created_at timestamptz, category text, and payload JSONB. Create unique index idx_feed_items_seek on created_at DESC,item_id DESC. Insert items 1 through 6 at 10:00,10:01,10:01,10:02,10:03,10:04 UTC. Using cursor (10:03,item 5), return item_id, created_at, category for the next three rows where the composite key is less, ordered identically, LIMIT 4 so the application can detect continuation.",
    starterCode: "CREATE TABLE feed_items (\n  item_id bigint PRIMARY KEY,\n  created_at timestamptz NOT NULL,\n  category text NOT NULL,\n  payload jsonb NOT NULL\n);\n/* TODO: create idx_feed_items_seek and insert six events, including the 10:01 tie. */\n\nSELECT item_id, created_at, category\nFROM feed_items\nWHERE (created_at,item_id) < (TIMESTAMPTZ '2026-08-01 10:03:00+00',5)\nORDER BY created_at DESC,item_id DESC\nLIMIT 4;\n",
    visibleExamples: [
      { label: "TIE", input: "items 2 and 3 at 10:01", output: "item 3 before item 2" },
      { label: "CONTINUATION", input: "page size 3, LIMIT 4", output: "fourth row signals next page" },
    ],
    runtime: {
      minimumCodeLength: 670,
      requiredPatterns: [{ pattern: "\\(\\s*created_at\\s*,\\s*item_id\\s*\\)\\s*<", flags: "i", name: "Seeks by the complete cursor", hint: "Keep the row comparison." }, { pattern: "created_at\\s+DESC\\s*,\\s*item_id\\s+DESC", flags: "i", name: "Uses deterministic descending order", hint: "Match predicate and index order." }],
      sqlTests: [
        { name: "Keyset result columns are exact", kind: "result-columns", columns: ["item_id","created_at","category"], hint: "Keep the final projection." },
        { name: "Seek order handles ties", kind: "result-ordered-values", column: "item_id", expected: [4,3,2,1], hint: "Below item 5, order item 4 then tied 3 and 2, then item 1." },
        { name: "Composite seek index exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname='idx_feed_items_seek'", column: "count", expected: 1, hint: "Create the exact unique index." },
      ],
    },
  };

  if (topic.title === "OLTP vs OLAP") return {
    ...sqlBase,
    title: "Workload isolation classification mission",
    instructions: "Create workload_catalog with workload primary key, operations_per_request positive, rows_scanned positive, writes_rows boolean, target_p95_ms positive, and destination restricted to oltp or olap. Insert status-update 2/1/true/50/oltp, relay-history-report 4/100000/false/5000/olap, and account-lookup 1/1/false/30/oltp. Return destination, workload_count, total_rows_scanned, and write_workloads grouped and ordered by destination.",
    starterCode: "CREATE TABLE workload_catalog (\n  workload text PRIMARY KEY CHECK (btrim(workload) <> ''),\n  operations_per_request integer NOT NULL CHECK (operations_per_request > 0),\n  rows_scanned bigint NOT NULL CHECK (rows_scanned > 0),\n  writes_rows boolean NOT NULL,\n  target_p95_ms integer NOT NULL CHECK (target_p95_ms > 0),\n  destination text NOT NULL CHECK (destination IN ('oltp','olap'))\n);\n\n/* TODO: insert the three classified workloads. */\n\nSELECT destination, count(*)::int AS workload_count,\n       sum(rows_scanned)::bigint AS total_rows_scanned,\n       count(*) FILTER (WHERE writes_rows)::int AS write_workloads\nFROM workload_catalog\nGROUP BY destination\nORDER BY destination;\n",
    visibleExamples: [
      { label: "OLTP", input: "status update", output: "small indexed write" },
      { label: "OLAP", input: "100000-row history report", output: "analytical destination" },
    ],
    runtime: {
      minimumCodeLength: 750,
      requiredPatterns: [{ pattern: "FILTER\\s*\\(\\s*WHERE\\s+writes_rows", flags: "i", name: "Measures write mix", hint: "Keep the filtered aggregate." }],
      sqlTests: [
        { name: "Workload summary columns are exact", kind: "result-columns", columns: ["destination","workload_count","total_rows_scanned","write_workloads"], hint: "Keep all four aliases." },
        { name: "OLAP and OLTP are ordered", kind: "result-ordered-values", column: "destination", expected: ["olap","oltp"], hint: "Insert both destination classes." },
        { name: "OLTP has one write workload", kind: "database-value", query: "SELECT count(*)::int AS count FROM workload_catalog WHERE destination='oltp' AND writes_rows", column: "count", expected: 1, hint: "Only status-update writes rows." },
      ],
    },
  };

  if (topic.title === "Dimensional modeling") return {
    ...sqlBase,
    title: "Type-2 relay dimension mission",
    instructions: "Create dim_relay with surrogate relay_key primary key, source_relay_id, name, valid_from, valid_to, current boolean, unique(source_relay_id,valid_from), and CHECK valid_to null or greater than valid_from. Create fact_relay_reading with reading_id primary key, relay_key foreign key, occurred_at, and value. Insert two Type-2 versions for source relay 7: Old Beacon key 70 valid Jan 1 to Jun 1 current false, New Beacon key 71 valid Jun 1 onward current true. Insert reading 1 on March 1 referencing 70 and reading 2 on July 1 referencing 71. Return reading_id, name, value ordered by reading_id.",
    starterCode: "CREATE TABLE dim_relay (\n  relay_key bigint PRIMARY KEY,\n  source_relay_id bigint NOT NULL,\n  name text NOT NULL,\n  valid_from timestamptz NOT NULL,\n  valid_to timestamptz,\n  current boolean NOT NULL,\n  UNIQUE (source_relay_id,valid_from),\n  /* TODO: valid_to must be null or after valid_from */\n);\nCREATE TABLE fact_relay_reading (\n  reading_id bigint PRIMARY KEY,\n  relay_key bigint NOT NULL REFERENCES dim_relay(relay_key),\n  occurred_at timestamptz NOT NULL,\n  value numeric NOT NULL\n);\n/* TODO: insert two dimension versions and two historically correct facts. */\n\nSELECT f.reading_id,d.name,f.value\nFROM fact_relay_reading f JOIN dim_relay d USING (relay_key)\nORDER BY f.reading_id;\n",
    visibleExamples: [
      { label: "MARCH", input: "reading before June", output: "Old Beacon" },
      { label: "JULY", input: "reading after June", output: "New Beacon" },
    ],
    runtime: {
      minimumCodeLength: 900,
      requiredPatterns: [{ pattern: "valid_to\\s+IS\\s+NULL\\s+OR\\s+valid_to\\s*>\\s*valid_from", flags: "i", name: "Protects effective periods", hint: "Add the Type-2 chronology CHECK." }, { pattern: "REFERENCES\\s+dim_relay", flags: "i", name: "Binds fact to historical dimension", hint: "Keep the relay_key foreign key." }],
      sqlTests: [
        { name: "Dimensional result columns are exact", kind: "result-columns", columns: ["reading_id","name","value"], hint: "Keep the final joined projection." },
        { name: "Historical names are exact", kind: "result-ordered-values", column: "name", expected: ["Old Beacon","New Beacon"], hint: "Point March and July facts to the correct surrogate keys." },
        { name: "One current dimension version exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM dim_relay WHERE source_relay_id=7 AND current AND valid_to IS NULL", column: "count", expected: 1, hint: "Only New Beacon is current and open-ended." },
      ],
    },
  };

  if (topic.title === "Distributed SQL") return {
    ...sqlBase,
    title: "Quorum locality plan mission",
    instructions: "Create distributed_ranges with range_name primary key, home_region, replicas positive, write_quorum positive, read_quorum positive, estimated_cross_region_ms nonnegative, and CHECK both quorums <= replicas and write_quorum+read_quorum > replicas. Insert accounts home asia-south replicas 3 write 2 read 2 latency 0; analytics home us-east replicas 5 write 3 read 3 latency 180. Return range_name, home_region, replicas, write_quorum, read_quorum, and survives_one_failure as replicas-write_quorum >=1 ordered by range_name.",
    starterCode: "CREATE TABLE distributed_ranges (\n  range_name text PRIMARY KEY CHECK (btrim(range_name) <> ''),\n  home_region text NOT NULL CHECK (btrim(home_region) <> ''),\n  replicas integer NOT NULL CHECK (replicas > 0),\n  write_quorum integer NOT NULL CHECK (write_quorum > 0),\n  read_quorum integer NOT NULL CHECK (read_quorum > 0),\n  estimated_cross_region_ms integer NOT NULL CHECK (estimated_cross_region_ms >= 0),\n  /* TODO: quorum bounds and overlap constraints */\n);\n\n/* TODO: insert accounts and analytics placement policies. */\n\nSELECT range_name, home_region, replicas, write_quorum, read_quorum,\n       (replicas-write_quorum >= 1) AS survives_one_failure\nFROM distributed_ranges\nORDER BY range_name;\n",
    visibleExamples: [
      { label: "ACCOUNTS", input: "3 replicas, write quorum 2", output: "survives one replica failure" },
      { label: "OVERLAP", input: "write 2 + read 2 > replicas 3", output: "quorums intersect" },
    ],
    runtime: {
      minimumCodeLength: 720,
      requiredPatterns: [{ pattern: "write_quorum\\s*\\+\\s*read_quorum\\s*>\\s*replicas", flags: "i", name: "Requires quorum overlap", hint: "Add the read/write intersection CHECK." }],
      sqlTests: [
        { name: "Distributed range columns are exact", kind: "result-columns", columns: ["range_name","home_region","replicas","write_quorum","read_quorum","survives_one_failure"], hint: "Keep all six aliases." },
        { name: "Ranges are ordered", kind: "result-ordered-values", column: "range_name", expected: ["accounts","analytics"], hint: "Insert and order both ranges." },
        { name: "Both placements survive one failure", kind: "database-value", query: "SELECT count(*)::int AS count FROM distributed_ranges WHERE replicas-write_quorum>=1", column: "count", expected: 2, hint: "Use 3/2 and 5/3 replica/write configurations." },
      ],
    },
  };

  return null;
}
