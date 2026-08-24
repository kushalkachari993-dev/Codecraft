import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundThirteenPythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Runtime Depths") return {
    title: "Runtime Depths Python project",
    instructions: "Implement build_runtime_plan(tasks, cpu_count, memory_limit_mb). Each task is a dict with unique nonblank id, kind equal to blocking_io, async_io, or cpu, positive numeric memory_mb, and positive integer units. Reject booleans as numbers. Return immutable task-id tuples grouped as threads, asyncio, and processes in input order; thread_workers=min(8, blocking task count), async_limit=min(20, async units sum), process_workers=min(cpu_count, cpu task count), peak_memory_mb as the sum of memory for simultaneously planned thread/process workers plus all async tasks, and fits_memory. Require cpu_count >=1 and positive memory limit, do not mutate input, and include strategy text explaining GIL, bounded backpressure, explicit cleanup, and process serialization.",
    starterCode: "def build_runtime_plan(tasks, cpu_count, memory_limit_mb):\n    # TODO 1: validate and snapshot the task descriptions.\n    # TODO 2: group blocking I/O, async I/O, and CPU work.\n    # TODO 3: calculate bounded concurrency and memory pressure.\n    return {}\n",
    visibleExamples: [
      { label: "WORKLOAD ROUTING", input: "blocking I/O, async I/O, and CPU tasks", output: "threads, asyncio, and processes respectively" },
      { label: "CAPACITY", input: "planned peak exceeds memory limit", output: "fits_memory false without hiding the tasks" },
    ],
    runtime: {
      minimumCodeLength: 520,
      requiredPatterns: [
        { pattern: "blocking_io", flags: "im", name: "Classifies blocking work", hint: "Route blocking_io task IDs to threads." },
        { pattern: "async_io", flags: "im", name: "Classifies cooperative work", hint: "Route async_io task IDs to asyncio." },
        { pattern: "\\bcpu\\b", flags: "im", name: "Classifies CPU work", hint: "Route cpu task IDs to processes." },
        { pattern: "tuple\\s*\\(", flags: "im", name: "Returns immutable task groups", hint: "Convert each task-id group to a tuple." },
      ],
      pythonTests: [
        { name: "Runtime strategies and bounds are exact", code: "tasks=[{'id':'net','kind':'blocking_io','memory_mb':10,'units':2},{'id':'stream','kind':'async_io','memory_mb':3,'units':12},{'id':'hash','kind':'cpu','memory_mb':40,'units':1},{'id':'image','kind':'cpu','memory_mb':50,'units':2}]; r=build_runtime_plan(tasks,2,200); assert r['threads']==('net',) and r['asyncio']==('stream',) and r['processes']==('hash','image') and r['thread_workers']==1 and r['async_limit']==12 and r['process_workers']==2 and r['peak_memory_mb']==113 and r['fits_memory'] is True", hint: "One thread task uses 10 MB, all async tasks use 3*12, and two CPU workers use 40+50." },
        { name: "Memory pressure is reported", code: "tasks=[{'id':'cpu','kind':'cpu','memory_mb':80,'units':4}]; r=build_runtime_plan(tasks,1,60); assert r['peak_memory_mb']==80 and r['fits_memory'] is False", hint: "Use at most process_workers task memory contributions and compare against the limit." },
        { name: "Strategy documents the runtime tradeoffs", code: "t=[{'id':'a','kind':'async_io','memory_mb':1,'units':1}]; s=build_runtime_plan(t,1,10)['strategy'].lower(); assert all(word in s for word in ('gil','backpressure','cleanup','serialization'))", hint: "Return one concise strategy string naming all four operational concerns." },
        { name: "Invalid input is rejected without mutation", code: "tasks=[{'id':'a','kind':'cpu','memory_mb':1,'units':1}]; before=[dict(x) for x in tasks]; build_runtime_plan(tasks,1,10); assert tasks==before\nfor bad in [[],[{'id':'','kind':'cpu','memory_mb':1,'units':1}],[{'id':'a','kind':'bad','memory_mb':1,'units':1}],[{'id':'a','kind':'cpu','memory_mb':True,'units':1}],[{'id':'a','kind':'cpu','memory_mb':1,'units':0}]]:\n    try:\n        build_runtime_plan(bad,1,10); assert False\n    except (TypeError,ValueError):\n        pass", hint: "Validate task shape, uniqueness, numeric fields, kinds, and global bounds before planning." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Memory internals") return {
    title: "Shared-object deep size mission",
    instructions: "Implement deep_size(root) using sys.getsizeof. Recursively traverse dictionaries, lists, tuples, sets, and frozensets, count each object identity only once, include both dictionary keys and values, and return an integer. Treat strings, bytes, numbers, and unsupported custom objects as shallow leaves. Do not mutate the graph and handle cycles.",
    starterCode: "import sys\n\ndef deep_size(root):\n    seen = set()\n    # TODO: traverse supported containers while deduplicating identities.\n    return 0\n",
    visibleExamples: [
      { label: "SHARING", input: "same list referenced twice", output: "shared list counted once" },
      { label: "CYCLE", input: "list containing itself", output: "terminates with finite size" },
    ],
    runtime: {
      minimumCodeLength: 220,
      requiredPatterns: [
        { pattern: "sys\\.getsizeof\\s*\\(", flags: "im", name: "Measures shallow allocations", hint: "Add sys.getsizeof(value) once per identity." },
        { pattern: "\\bid\\s*\\(", flags: "im", name: "Tracks object identity", hint: "Store id(value) in seen before descending." },
      ],
      pythonTests: [
        { name: "Shared children are counted once", code: "child=[1,2]; one=deep_size({'a':child}); shared=deep_size({'a':child,'b':child}); copied=deep_size({'a':[1,2],'b':[1,2]}); assert isinstance(shared,int) and shared>one and shared<copied", hint: "Dictionary structure adds size, but a repeated child identity must not be recounted." },
        { name: "Cycles terminate", code: "a=[]; a.append(a); assert deep_size(a)==sys.getsizeof(a)", hint: "Mark the list seen before traversing its child reference." },
        { name: "Input graph is preserved", code: "x={'a':[1,2]}; before={'a':[1,2]}; deep_size(x); assert x==before", hint: "Inspect without rewriting container contents." },
      ],
    },
  };

  if (topic.title === "Garbage collection") return {
    title: "Weak-reference registry mission",
    instructions: "Implement WeakRegistry with weakref.WeakValueDictionary. add(key, value) requires a nonblank string key and a weak-referenceable value, rejects duplicate live keys, and retains no strong reference. get returns the live value or None. living returns a sorted tuple of live keys. remove deletes a key without error when missing. External references must control object lifetime.",
    starterCode: "import weakref\n\nclass WeakRegistry:\n    def __init__(self):\n        # TODO: create weak value storage.\n        pass\n\n    def add(self, key, value):\n        pass\n\n    def get(self, key):\n        pass\n\n    def living(self):\n        return ()\n\n    def remove(self, key):\n        pass\n",
    visibleExamples: [
      { label: "LIVE", input: "external object reference exists", output: "registry returns the object" },
      { label: "COLLECTED", input: "external reference deleted and gc.collect()", output: "key disappears" },
    ],
    runtime: {
      minimumCodeLength: 300,
      requiredPatterns: [{ pattern: "weakref\\.WeakValueDictionary\\s*\\(", flags: "im", name: "Avoids strong ownership", hint: "Store values in WeakValueDictionary." }],
      pythonTests: [
        { name: "Registry follows external lifetime", code: "import gc\nclass Item: pass\nr=WeakRegistry(); x=Item(); r.add(' x ',x); assert r.get('x') is x and r.living()==('x',); del x; gc.collect(); assert r.get('x') is None and r.living()==()", hint: "Normalize keys and keep no other reference to values." },
        { name: "Duplicates and invalid values fail", code: "class Item: pass\nr=WeakRegistry(); x=Item(); r.add('a',x)\nfor key,val in [('a',Item()),('',Item()),('n',1)]:\n    try:\n        r.add(key,val); assert False\n    except (TypeError,ValueError,KeyError):\n        pass", hint: "Reject blank/duplicate keys and propagate a clear error for non-weak-referenceable values." },
        { name: "Removal is idempotent", code: "class Item: pass\nr=WeakRegistry(); x=Item(); r.add('a',x); r.remove('a'); r.remove('a'); assert r.living()==()", hint: "Use pop(key, None) or an equivalent missing-safe removal." },
      ],
    },
  };

  if (topic.title === "GIL/runtime model") return {
    title: "Runtime strategy decision mission",
    instructions: "Implement choose_runtime(workload, library_releases_gil=False). Return threads for blocking_io, asyncio for async_io, processes for cpu_python, and threads for cpu_native only when library_releases_gil is True—otherwise processes. Reject unknown workloads and non-boolean flags. Return {'strategy', 'reason'} where reason explicitly mentions the GIL and the workload property.",
    starterCode: "def choose_runtime(workload, library_releases_gil=False):\n    # TODO: choose from threads, asyncio, and processes with an explicit reason.\n    return {}\n",
    visibleExamples: [
      { label: "CPU PYTHON", input: "cpu_python", output: "processes" },
      { label: "NATIVE", input: "cpu_native, releases_gil=True", output: "threads" },
    ],
    runtime: {
      minimumCodeLength: 210,
      requiredPatterns: [{ pattern: "\\b(?:threads|asyncio|processes)\\b", flags: "im", name: "Chooses an execution model", hint: "Return the exact requested strategy strings." }],
      pythonTests: [
        { name: "All workload decisions are exact", code: "assert choose_runtime('blocking_io')['strategy']=='threads' and choose_runtime('async_io')['strategy']=='asyncio' and choose_runtime('cpu_python')['strategy']=='processes' and choose_runtime('cpu_native',True)['strategy']=='threads' and choose_runtime('cpu_native',False)['strategy']=='processes'", hint: "Use I/O model, bytecode CPU, and native GIL-release information." },
        { name: "Reasons explain GIL and workload", code: "for w,f in [('blocking_io',False),('async_io',False),('cpu_python',False),('cpu_native',True)]:\n r=choose_runtime(w,f); assert 'gil' in r['reason'].lower() and ('io' in r['reason'].lower() or 'cpu' in r['reason'].lower())", hint: "Return a useful, topic-specific explanation." },
        { name: "Invalid values fail", code: "for w,f in [('bad',False),('cpu_native',1)]:\n    try:\n        choose_runtime(w,f); assert False\n    except (TypeError,ValueError):\n        pass", hint: "Validate the finite workload set and require a real bool flag." },
      ],
    },
  };

  if (topic.title === "Advanced threading") return {
    title: "Locked counter aggregation mission",
    instructions: "Implement aggregate_updates(updates, max_workers=4). Validate a nonempty list of (nonblank key, integer non-boolean delta) tuples and workers 1 through 8. Use ThreadPoolExecutor and one threading.Lock to update a shared dictionary atomically. Return a new dictionary ordered by sorted key. Do not mutate updates and propagate worker exceptions.",
    starterCode: "from concurrent.futures import ThreadPoolExecutor\n+import threading\n\ndef aggregate_updates(updates, max_workers=4):\n    totals = {}\n    lock = threading.Lock()\n    # TODO: validate and apply each update under the lock.\n    return totals\n",
    visibleExamples: [
      { label: "CONTENTION", input: "100 updates for relay-a", output: "no lost increments" },
      { label: "ORDER", input: "keys arrive B then A", output: "returned dictionary keys A then B" },
    ],
    runtime: {
      minimumCodeLength: 260,
      requiredPatterns: [
        { pattern: "threading\\.Lock\\s*\\(", flags: "im", name: "Protects shared state", hint: "Keep one lock for the totals invariant." },
        { pattern: "with\\s+lock", flags: "im", name: "Scopes the critical section", hint: "Update totals inside with lock." },
        { pattern: "ThreadPoolExecutor\\s*\\(", flags: "im", name: "Runs bounded workers", hint: "Use at most min(max_workers, len(updates))." },
      ],
      pythonTests: [
        { name: "Concurrent increments are not lost", code: "u=[('a',1)]*200+[('b',2)]*50; assert aggregate_updates(u,8)=={'a':200,'b':100}", hint: "Read-modify-write totals while holding the same lock." },
        { name: "Arguments are validated", code: "for u,w in [([],2),([(' ',1)],2),([('a',True)],2),([('a',1)],0),([('a',1)],9)]:\n    try:\n        aggregate_updates(u,w); assert False\n    except (TypeError,ValueError):\n        pass", hint: "Validate tuple shape, normalized key, integer delta, and worker range." },
        { name: "Input is preserved and output ordered", code: "u=[('b',1),('a',2)]; before=list(u); r=aggregate_updates(u); assert u==before and list(r)==['a','b']", hint: "Sort only when constructing the new result dictionary." },
      ],
    },
  };

  if (topic.title === "Multiprocessing") return {
    title: "Process-pool partition mission",
    instructions: "Implement partition_cpu_work(items, workers). Require a nonempty list and integer non-boolean workers >=1. Return at most min(workers, len(items)) nonempty tuple chunks using deterministic round-robin assignment, plus metadata {'start_method':'spawn','requires_main_guard':True,'serialization':'pickle'}. Do not mutate items. This safely plans browser-incompatible process work without spawning processes.",
    starterCode: "def partition_cpu_work(items, workers):\n    # TODO: validate and produce deterministic round-robin chunks.\n    return {}\n",
    visibleExamples: [
      { label: "PARTITION", input: "[A,B,C,D,E], workers 2", output: "((A,C,E),(B,D))" },
      { label: "PORTABILITY", input: "execution metadata", output: "spawn, main guard, pickle" },
    ],
    runtime: {
      minimumCodeLength: 200,
      requiredPatterns: [{ pattern: "%", flags: "im", name: "Uses round-robin placement", hint: "Assign item index modulo worker count." }],
      pythonTests: [
        { name: "Partitions and metadata are exact", code: "r=partition_cpu_work(['A','B','C','D','E'],2); assert r=={'chunks':(('A','C','E'),('B','D')),'start_method':'spawn','requires_main_guard':True,'serialization':'pickle'}", hint: "Round-robin into two lists, then freeze them as tuples." },
        { name: "Workers are capped by item count", code: "assert partition_cpu_work([1,2],8)['chunks']==((1,),(2,))", hint: "Create min(workers, len(items)) chunks." },
        { name: "Inputs are validated and preserved", code: "x=[1,2]; partition_cpu_work(x,1); assert x==[1,2]\nfor items,w in [([],1),('bad',1),([1],0),([1],True)]:\n    try:\n        partition_cpu_work(items,w); assert False\n    except (TypeError,ValueError):\n        pass", hint: "Require a nonempty list and positive non-boolean integer worker count." },
      ],
    },
  };

  if (topic.title === "Advanced Asyncio") return {
    title: "Bounded async fetch mission",
    instructions: "Implement async fetch_bounded(fetch_one, ids, limit=3, timeout=1.0). Require a list of unique integer non-boolean IDs, limit 1 through 20, and positive numeric timeout. Use asyncio.Semaphore, asyncio.TaskGroup, and asyncio.wait_for. Preserve input order in a returned tuple, let exceptions/cancellation propagate, and do not mutate ids.",
    starterCode: "import asyncio\n\nasync def fetch_bounded(fetch_one, ids, limit=3, timeout=1.0):\n    # TODO: validate and run structured, deadline-bound tasks.\n    return ()\n",
    visibleExamples: [
      { label: "BACKPRESSURE", input: "10 ids, limit 3", output: "at most three fetches active" },
      { label: "TIMEOUT", input: "one fetch exceeds deadline", output: "TimeoutError and sibling cancellation" },
    ],
    runtime: {
      minimumCodeLength: 300,
      requiredPatterns: [
        { pattern: "asyncio\\.Semaphore\\s*\\(", flags: "im", name: "Bounds concurrency", hint: "Guard each fetch with async with semaphore." },
        { pattern: "asyncio\\.TaskGroup\\s*\\(", flags: "im", name: "Owns task lifetime", hint: "Create every task inside one TaskGroup." },
        { pattern: "asyncio\\.wait_for\\s*\\(", flags: "im", name: "Applies a deadline", hint: "Wrap each fetch_one(id) awaitable with wait_for timeout." },
      ],
      pythonTests: [
        { name: "Concurrency is bounded and order preserved", code: "import asyncio\nactive=peak=0\nasync def fetch(i):\n global active,peak; active+=1; peak=max(peak,active); await asyncio.sleep((4-i)*.002); active-=1; return i*10\nr=asyncio.run(fetch_bounded(fetch,[1,2,3],2,.2)); assert r==(10,20,30) and peak<=2", hint: "Store tasks in input order and await them through one TaskGroup." },
        { name: "Timeouts propagate", code: "import asyncio\nasync def slow(i): await asyncio.sleep(.05); return i\ntry:\n asyncio.run(fetch_bounded(slow,[1],1,.001)); assert False\nexcept TimeoutError:\n pass", hint: "Do not convert timeout into a successful result." },
        { name: "Arguments are validated", code: "import asyncio\nasync def f(i): return i\nfor ids,l,t in [([1,1],2,1),([True],2,1),([1],0,1),([1],21,1),([1],1,0)]:\n try:\n  asyncio.run(fetch_bounded(f,ids,l,t)); assert False\n except (TypeError,ValueError):\n  pass", hint: "Validate IDs, uniqueness, limit, and timeout before creating tasks." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["relays · MVCC-updated records", "relay_events · append-style events", "PostgreSQL page, vacuum, and lock catalogs", "transactional practice database"] };

export function buildRoundThirteenSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Storage & Concurrency") return {
    ...sqlBase,
    title: "Storage & Concurrency SQL project",
    instructions: "Create relay_transfer_outbox with unique nonblank event_key, JSONB payload, and created_at. In one SERIALIZABLE transaction lock relays 1 and 3 in relay_id order using FOR UPDATE, transfer 10 power from 1 to 3, and insert outbox event transfer-1-3-10 with a JSONB payload. Commit, then VACUUM (ANALYZE) relays. Finish by returning both relay powers ordered by relay_id. The total must remain 140 and one durable delivery intent must exist.",
    starterCode: "CREATE TABLE relay_transfer_outbox (\n  outbox_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  event_key text NOT NULL UNIQUE CHECK (btrim(event_key) <> ''),\n  payload jsonb NOT NULL,\n  created_at timestamptz NOT NULL DEFAULT now()\n);\n\nBEGIN;\nSET TRANSACTION ISOLATION LEVEL SERIALIZABLE;\n\n-- TODO: lock relay ids 1 and 3 in canonical order.\n-- TODO: transfer 10 power and write one JSONB outbox event.\n\nCOMMIT;\nVACUUM (ANALYZE) relays;\n\nSELECT relay_id, name, power\nFROM relays WHERE relay_id IN (1,3)\nORDER BY relay_id;\n",
    visibleExamples: [
      { label: "ATOMIC STATE", input: "10 power from relay 1 to 3", output: "86 and 54; total remains 140" },
      { label: "OUTBOX", input: "same local transaction", output: "one transfer-1-3-10 delivery intent" },
    ],
    runtime: {
      minimumCodeLength: 690,
      requiredPatterns: [
        { pattern: "SET\\s+TRANSACTION\\s+ISOLATION\\s+LEVEL\\s+SERIALIZABLE", flags: "i", name: "Uses the strongest invariant boundary", hint: "Keep the serializable transaction statement." },
        { pattern: "ORDER\\s+BY\\s+relay_id[\\s\\S]*FOR\\s+UPDATE", flags: "i", name: "Locks in canonical order", hint: "Select both relay rows ordered by relay_id FOR UPDATE." },
        { pattern: "INSERT\\s+INTO\\s+relay_transfer_outbox", flags: "i", name: "Commits delivery intent locally", hint: "Insert the event inside the same transaction." },
        { pattern: "VACUUM\\s*\\(\\s*ANALYZE\\s*\\)\\s+relays", flags: "i", name: "Maintains the changed relation", hint: "Vacuum analyze after commit." },
      ],
      sqlTests: [
        { name: "Transfer result columns are exact", kind: "result-columns", columns: ["relay_id","name","power"], hint: "Finish with the supplied relay SELECT." },
        { name: "Power moved atomically", kind: "result-ordered-values", column: "power", expected: [86,54], hint: "Subtract and add 10 inside the transaction." },
        { name: "Total power is preserved", kind: "database-value", query: "SELECT sum(power)::int AS total FROM relays WHERE relay_id IN (1,3)", column: "total", expected: 140, hint: "Perform both updates." },
        { name: "Outbox intent is durable and unique", kind: "database-value", query: "SELECT count(*)::int AS count FROM relay_transfer_outbox WHERE event_key = 'transfer-1-3-10' AND payload->>'amount' = '10'", column: "count", expected: 1, hint: "Insert the exact event key and amount inside its JSONB payload." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Storage internals") return {
    ...sqlBase,
    title: "Relation storage accounting mission",
    instructions: "Return relation_name, heap_bytes, index_bytes, and total_bytes for relays and relay_events using pg_relation_size, pg_indexes_size, and pg_total_relation_size with regclass values. Order by relation_name.",
    starterCode: "SELECT relation_name,\n       /* heap bytes */,\n       /* index bytes */,\n       /* total bytes */\nFROM (VALUES ('relays'), ('relay_events')) AS v(relation_name)\nORDER BY relation_name;\n",
    visibleExamples: [
      { label: "HEAP", input: "pg_relation_size", output: "main relation fork size" },
      { label: "TOTAL", input: "pg_total_relation_size", output: "heap plus indexes and auxiliary storage" },
    ],
    runtime: {
      minimumCodeLength: 240,
      requiredPatterns: [
        { pattern: "pg_relation_size\\s*\\(", flags: "i", name: "Measures the heap relation", hint: "Cast relation_name to regclass." },
        { pattern: "pg_indexes_size\\s*\\(", flags: "i", name: "Measures attached indexes", hint: "Use pg_indexes_size(relation_name::regclass)." },
        { pattern: "pg_total_relation_size\\s*\\(", flags: "i", name: "Measures total physical footprint", hint: "Include total relation size." },
      ],
      sqlTests: [
        { name: "Storage columns are exact", kind: "result-columns", columns: ["relation_name","heap_bytes","index_bytes","total_bytes"], hint: "Alias all four requested values." },
        { name: "Both relations are reported", kind: "result-ordered-values", column: "relation_name", expected: ["relay_events","relays"], hint: "Order the two VALUES rows by relation_name." },
      ],
    },
  };

  if (topic.title === "MVCC") return {
    ...sqlBase,
    title: "Rollback-visible version mission",
    instructions: "Begin a transaction, return relay 3 power and xmin::text before an update, update power by +5, return the changed power and xmin::text, then ROLLBACK. Finish by returning relay_id, power, and xmin::text as version_xmin for relay 3 so the final power remains 44.",
    starterCode: "BEGIN;\nSELECT relay_id, power, xmin::text AS version_xmin FROM relays WHERE relay_id = 3;\n/* create a new row version with power +5 */\nSELECT relay_id, power, xmin::text AS version_xmin FROM relays WHERE relay_id = 3;\nROLLBACK;\n\nSELECT relay_id, power, xmin::text AS version_xmin\nFROM relays WHERE relay_id = 3;\n",
    visibleExamples: [
      { label: "VERSION", input: "UPDATE", output: "new tuple version visible inside the transaction" },
      { label: "ROLLBACK", input: "after transaction abort", output: "power remains 44" },
    ],
    runtime: {
      minimumCodeLength: 300,
      requiredPatterns: [
        { pattern: "xmin::text", flags: "i", name: "Inspects tuple transaction metadata", hint: "Keep xmin::text in the snapshots." },
        { pattern: "UPDATE\\s+relays[\\s\\S]*power\\s*=\\s*power\\s*\\+\\s*5", flags: "i", name: "Creates a replacement tuple version", hint: "Update relay 3 by +5 inside the transaction." },
        { pattern: "ROLLBACK", flags: "i", name: "Restores the original visible state", hint: "Keep ROLLBACK before the final SELECT." },
      ],
      sqlTests: [
        { name: "Final snapshot columns are exact", kind: "result-columns", columns: ["relay_id","power","version_xmin"], hint: "Finish with the supplied MVCC metadata projection." },
        { name: "Rolled-back power is unchanged", kind: "result-value", column: "power", expected: 44, hint: "Ensure the +5 update is rolled back." },
      ],
    },
  };

  if (topic.title === "Vacuum") return {
    ...sqlBase,
    title: "Vacuum maintenance mission",
    instructions: "Create relay_maintenance_log, insert three rows, delete two rows, run VACUUM (ANALYZE) relay_maintenance_log outside any explicit transaction, then return remaining_rows and relation_bytes using count(*) and pg_relation_size.",
    starterCode: "CREATE TABLE relay_maintenance_log (id bigint PRIMARY KEY, message text NOT NULL);\nINSERT INTO relay_maintenance_log VALUES (1,'a'),(2,'b'),(3,'c');\nDELETE FROM relay_maintenance_log WHERE id IN (1,2);\n\n/* reclaim dead space and refresh statistics */\n\nSELECT count(*)::int AS remaining_rows,\n       pg_relation_size('relay_maintenance_log'::regclass)::bigint AS relation_bytes\nFROM relay_maintenance_log;\n",
    visibleExamples: [
      { label: "DEAD TUPLES", input: "delete two of three rows", output: "vacuum makes their space reusable" },
      { label: "RESULT", input: "after maintenance", output: "one logical row remains" },
    ],
    runtime: {
      minimumCodeLength: 330,
      requiredPatterns: [{ pattern: "VACUUM\\s*\\(\\s*ANALYZE\\s*\\)\\s+relay_maintenance_log", flags: "i", name: "Runs table maintenance", hint: "Add VACUUM (ANALYZE) outside a BEGIN block." }],
      sqlTests: [
        { name: "Maintenance result columns are exact", kind: "result-columns", columns: ["remaining_rows","relation_bytes"], hint: "Keep both supplied aliases." },
        { name: "One logical row remains", kind: "result-value", column: "remaining_rows", expected: 1, hint: "Delete ids 1 and 2 before vacuum." },
      ],
    },
  };

  if (topic.title === "Advanced transactions") return {
    ...sqlBase,
    title: "Transactional outbox mission",
    instructions: "Create relay_outbox with unique event_key, event_type, JSONB payload, and published_at. In one transaction update relay 3 status to maintenance and insert event key relay-3-maintenance with event_type relay.status_changed and payload containing relay_id 3 and status maintenance. Commit, then return event_key, event_type, and status extracted from payload.",
    starterCode: "CREATE TABLE relay_outbox (\n  outbox_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  event_key text NOT NULL UNIQUE,\n  event_type text NOT NULL,\n  payload jsonb NOT NULL,\n  published_at timestamptz\n);\n\nBEGIN;\n-- TODO: update state and insert delivery intent atomically.\nCOMMIT;\n\nSELECT event_key, event_type, payload->>'status' AS status\nFROM relay_outbox WHERE event_key = 'relay-3-maintenance';\n",
    visibleExamples: [
      { label: "LOCAL ATOMICITY", input: "relay state plus outbox", output: "both commit or neither commits" },
      { label: "IDEMPOTENCY", input: "relay-3-maintenance repeated", output: "unique key prevents duplicate intent" },
    ],
    runtime: {
      minimumCodeLength: 450,
      requiredPatterns: [
        { pattern: "\\bBEGIN\\s*;[\\s\\S]*INSERT\\s+INTO\\s+relay_outbox[\\s\\S]*\\bCOMMIT\\s*;", flags: "i", name: "Commits state and event together", hint: "Keep both writes inside BEGIN/COMMIT." },
        { pattern: "jsonb_build_object\\s*\\(", flags: "i", name: "Creates a structured event payload", hint: "Use jsonb_build_object for relay_id and status." },
      ],
      sqlTests: [
        { name: "Outbox result columns are exact", kind: "result-columns", columns: ["event_key","event_type","status"], hint: "Keep the final projection." },
        { name: "Delivery intent is exact", kind: "result-value", column: "event_type", expected: "relay.status_changed", hint: "Insert the requested event type." },
        { name: "Relay and payload agree", kind: "database-value", query: "SELECT count(*)::int AS count FROM relays r JOIN relay_outbox o ON (o.payload->>'relay_id')::bigint = r.relay_id WHERE r.relay_id=3 AND r.status='maintenance' AND o.payload->>'status'='maintenance'", column: "count", expected: 1, hint: "Update relay 3 and write a matching payload in one transaction." },
      ],
    },
  };

  if (topic.title === "Deadlocks") return {
    ...sqlBase,
    title: "Canonical lock-order mission",
    instructions: "In one transaction select relays 3 and 1 in canonical relay_id order FOR UPDATE, then update relay 1 status to maintenance and relay 3 status to stable, commit, and return both rows ordered by relay_id. The lock query must order before FOR UPDATE so every caller can use the same acquisition direction.",
    starterCode: "BEGIN;\n\nSELECT relay_id FROM relays\nWHERE relay_id IN (3,1)\n/* canonical order and row locks */;\n\nUPDATE relays SET status='maintenance' WHERE relay_id=1;\nUPDATE relays SET status='stable' WHERE relay_id=3;\nCOMMIT;\n\nSELECT relay_id, status FROM relays WHERE relay_id IN (1,3) ORDER BY relay_id;\n",
    visibleExamples: [
      { label: "ORDER", input: "requested ids 3 then 1", output: "locks acquired 1 then 3" },
      { label: "RECOVERY", input: "deadlock abort in production", output: "rollback and bounded whole-transaction retry" },
    ],
    runtime: {
      minimumCodeLength: 270,
      requiredPatterns: [{ pattern: "ORDER\\s+BY\\s+relay_id[\\s\\S]*FOR\\s+UPDATE", flags: "i", name: "Acquires locks consistently", hint: "Add ORDER BY relay_id FOR UPDATE to the locking SELECT." }],
      sqlTests: [
        { name: "Locked update result columns are exact", kind: "result-columns", columns: ["relay_id","status"], hint: "Keep the final ordered SELECT." },
        { name: "Both state changes committed", kind: "result-ordered-values", column: "status", expected: ["maintenance","stable"], hint: "Update relays 1 and 3 after locking both." },
      ],
    },
  };

  return null;
}
