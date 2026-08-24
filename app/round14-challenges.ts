import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundFourteenPythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Type & API Forge") return {
    title: "Type & API Forge Python project",
    instructions: "Implement build_delivery_contract(operations, capacity). Each operation is a dictionary with unique nonblank id and tenant, method GET or POST, positive integer non-boolean weight, boolean cacheable, and idempotency_key. POST requires a nonblank idempotency key; GET must use None. Capacity is a positive integer. Accept operations in input order while cumulative weight fits, reject the rest, and do not mutate input. Return accepted_ids and rejected_ids tuples, cache_keys for accepted cacheable GETs as tenant:GET:id, queue_messages for accepted POSTs as immutable (id, tenant, idempotency_key) tuples, total_weight, plus database_policy mentioning parameterized, transaction, constraint, and retry, and api_policy mentioning authorization, idempotency, rate limit, and correlation. Annotate the operation shape with TypedDict and the function return type.",
    starterCode: "from typing import TypedDict\n\nclass Operation(TypedDict):\n    id: str\n    tenant: str\n    method: str\n    weight: int\n    cacheable: bool\n    idempotency_key: str | None\n\ndef build_delivery_contract(operations: list[Operation], capacity: int) -> dict[str, object]:\n    # TODO: validate, admit by capacity, and build deterministic contracts.\n    return {}\n",
    visibleExamples: [
      { label: "ADMISSION", input: "weights 3, 6, 4 with capacity 10", output: "accept first two; reject third" },
      { label: "SIDE EFFECT", input: "accepted POST", output: "one replay-safe queue message" },
    ],
    runtime: {
      minimumCodeLength: 620,
      requiredPatterns: [
        { pattern: "TypedDict", flags: "im", name: "Types the request boundary", hint: "Keep the Operation TypedDict." },
        { pattern: "tuple\\s*\\(", flags: "im", name: "Freezes returned collections", hint: "Return accepted, rejected, cache, and queue collections as tuples." },
        { pattern: "idempotency", flags: "im", name: "Models replay safety", hint: "Validate POST idempotency keys and include them in queue messages." },
      ],
      pythonTests: [
        { name: "Admission, cache, and queue contracts are exact", code: "ops=[{'id':'read','tenant':'north','method':'GET','weight':3,'cacheable':True,'idempotency_key':None},{'id':'write','tenant':'north','method':'POST','weight':6,'cacheable':False,'idempotency_key':'k-1'},{'id':'late','tenant':'south','method':'GET','weight':4,'cacheable':True,'idempotency_key':None}]; r=build_delivery_contract(ops,10); assert r['accepted_ids']==('read','write') and r['rejected_ids']==('late',) and r['cache_keys']==('north:GET:read',) and r['queue_messages']==(('write','north','k-1'),) and r['total_weight']==9", hint: "Admit in input order while the cumulative accepted weight remains within capacity." },
        { name: "Policies cover production invariants", code: "op=[{'id':'x','tenant':'t','method':'POST','weight':1,'cacheable':False,'idempotency_key':'k'}]; r=build_delivery_contract(op,2); db=r['database_policy'].lower(); api=r['api_policy'].lower(); assert all(x in db for x in ('parameterized','transaction','constraint','retry')) and all(x in api for x in ('authorization','idempotency','rate limit','correlation'))", hint: "Return concise database and API policy strings containing every named control." },
        { name: "Invalid contracts fail without mutation", code: "good=[{'id':'x','tenant':'t','method':'GET','weight':1,'cacheable':True,'idempotency_key':None}]; before=[dict(x) for x in good]; build_delivery_contract(good,2); assert good==before\nbad=[[],[{'id':'','tenant':'t','method':'GET','weight':1,'cacheable':True,'idempotency_key':None}],[{'id':'x','tenant':'','method':'GET','weight':1,'cacheable':True,'idempotency_key':None}],[{'id':'x','tenant':'t','method':'PUT','weight':1,'cacheable':False,'idempotency_key':None}],[{'id':'x','tenant':'t','method':'POST','weight':1,'cacheable':False,'idempotency_key':None}],[{'id':'x','tenant':'t','method':'GET','weight':True,'cacheable':False,'idempotency_key':None}]]\nfor value in bad:\n try:\n  build_delivery_contract(value,2); assert False\n except (TypeError,ValueError):\n  pass", hint: "Validate shape, identities, method rules, booleans, weights, and capacity before planning." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Advanced typing") return {
    title: "Structural generic grouping mission",
    instructions: "Define a runtime-checkable HasTenant Protocol with a tenant string attribute, a TypeVar T bounded by HasTenant, and group_by_tenant(items: list[T]) -> dict[str, tuple[T, ...]]. Normalize tenant with strip and lower, reject blank or non-string tenants, preserve item order inside each group, return keys in sorted order, and do not mutate items.",
    starterCode: "from typing import Protocol, TypeVar, runtime_checkable\n\n@runtime_checkable\nclass HasTenant(Protocol):\n    tenant: str\n\nT = TypeVar('T', bound=HasTenant)\n\ndef group_by_tenant(items: list[T]) -> dict[str, tuple[T, ...]]:\n    # TODO: validate structurally and preserve the generic item type.\n    return {}\n",
    visibleExamples: [
      { label: "STRUCTURAL", input: "unrelated objects with tenant attributes", output: "accepted without inheritance" },
      { label: "NORMALIZE", input: "' North ' and 'north'", output: "one north group" },
    ],
    runtime: {
      minimumCodeLength: 300,
      requiredPatterns: [
        { pattern: "Protocol", flags: "im", name: "Defines structural behavior", hint: "Keep HasTenant as a Protocol." },
        { pattern: "TypeVar", flags: "im", name: "Preserves item type", hint: "Bound T to HasTenant." },
        { pattern: "runtime_checkable", flags: "im", name: "Supports runtime boundary checks", hint: "Decorate the protocol." },
      ],
      pythonTests: [
        { name: "Unrelated structural values group precisely", code: "class A:\n def __init__(self,t): self.tenant=t\nclass B:\n def __init__(self,t): self.tenant=t\na=A(' North '); b=B('south'); c=A('north'); r=group_by_tenant([b,a,c]); assert list(r)==['north','south'] and r['north']==(a,c) and r['south']==(b,)", hint: "Normalize tenant keys, preserve group order, then sort only dictionary keys." },
        { name: "Invalid tenants fail", code: "class X: pass\nfor item in [X(),type('Y',(),{'tenant':' '})(),type('Z',(),{'tenant':1})()]:\n try:\n  group_by_tenant([item]); assert False\n except (TypeError,ValueError):\n  pass", hint: "Verify the runtime attribute is a nonblank string." },
        { name: "Input remains unchanged", code: "class A:\n def __init__(self,t): self.tenant=t\nx=[A('b'),A('a')]; before=list(x); group_by_tenant(x); assert x==before", hint: "Build new buckets rather than sorting the input list." },
      ],
    },
  };

  if (topic.title === "Production APIs") return {
    title: "Idempotent mutation gateway mission",
    instructions: "Implement IdempotencyRegistry.handle(key, payload, operation). Require a nonblank string key and JSON-serializable dictionary payload. Canonicalize payload with json.dumps(sort_keys=True, separators=(',', ':')), hash with sha256, and call operation exactly once for a new key. Store a deep-copied outcome. A replay with the same key and payload returns {'replayed': True, 'result': copy}; the first returns replayed False. Reusing a key with different payload raises ValueError. External mutations of payload or returned results must not corrupt stored state.",
    starterCode: "import copy\nimport hashlib\nimport json\n\nclass IdempotencyRegistry:\n    def __init__(self):\n        self._records = {}\n\n    def handle(self, key, payload, operation):\n        # TODO: bind the key to a canonical request digest and durable-style outcome.\n        return {}\n",
    visibleExamples: [
      { label: "RETRY", input: "same key and same payload", output: "stored outcome; operation not called again" },
      { label: "CONFLICT", input: "same key and changed payload", output: "ValueError" },
    ],
    runtime: {
      minimumCodeLength: 370,
      requiredPatterns: [
        { pattern: "json\\.dumps", flags: "im", name: "Canonicalizes the request", hint: "Use sorted compact JSON before hashing." },
        { pattern: "hashlib\\.sha256", flags: "im", name: "Binds key to request", hint: "Store a SHA-256 digest with the outcome." },
        { pattern: "copy\\.deepcopy", flags: "im", name: "Protects recorded outcomes", hint: "Copy on storage and return." },
      ],
      pythonTests: [
        { name: "Retries replay exactly once", code: "calls=[]\ndef op(p): calls.append(dict(p)); return {'created':len(calls)}\nr=IdempotencyRegistry(); a=r.handle(' k ',{'b':2,'a':1},op); b=r.handle('k',{'a':1,'b':2},op); assert a=={'replayed':False,'result':{'created':1}} and b=={'replayed':True,'result':{'created':1}} and len(calls)==1", hint: "Normalize the key and hash canonical sorted JSON." },
        { name: "Conflicting reuse is rejected", code: "r=IdempotencyRegistry(); r.handle('k',{'a':1},lambda p: 1)\ntry:\n r.handle('k',{'a':2},lambda p: 2); assert False\nexcept ValueError:\n pass", hint: "Compare the stored digest before replaying." },
        { name: "Caller mutations cannot change the record", code: "r=IdempotencyRegistry(); p={'x':[1]}; a=r.handle('k',p,lambda p:{'items':p['x']}); p['x'].append(2); a['result']['items'].append(3); b=r.handle('k',{'x':[1]},lambda p:None); assert b['result']=={'items':[1]}", hint: "Deep-copy payload for the operation and outcome both into and out of storage." },
      ],
    },
  };

  if (topic.title === "PostgreSQL engineering") return {
    title: "Safe transaction plan mission",
    instructions: "Implement build_transaction_plan(sql, params, isolation='serializable', max_attempts=3). Require one nonblank statement containing no semicolon, a tuple params, exactly one %s placeholder per parameter, isolation read committed, repeatable read, or serializable, and max_attempts 1 through 5. Return immutable normalized sql and params, begin statement, parameterized True, constraint_policy, and retry_policy. retry_policy must be none unless isolation is serializable, where it is bounded-whole-transaction:N. Reject obvious interpolation braces and do not execute SQL.",
    starterCode: "def build_transaction_plan(sql, params, isolation='serializable', max_attempts=3):\n    # TODO: validate a parameterized single statement and describe its transaction.\n    return {}\n",
    visibleExamples: [
      { label: "PARAMETERS", input: "UPDATE relays SET power=%s WHERE relay_id=%s", output: "two placeholders and two tuple values" },
      { label: "RETRY", input: "serializable, 3 attempts", output: "bounded whole-transaction:3" },
    ],
    runtime: {
      minimumCodeLength: 310,
      requiredPatterns: [
        { pattern: "count\\s*\\(\\s*['\"]%s", flags: "im", name: "Checks parameter cardinality", hint: "Compare sql.count('%s') with len(params)." },
        { pattern: "serializable", flags: "im", name: "Models conflict handling", hint: "Return bounded whole-transaction retry only for serializable." },
      ],
      pythonTests: [
        { name: "Plan is exact", code: "r=build_transaction_plan(' UPDATE relays SET power=%s WHERE relay_id=%s ',(70,2),'SERIALIZABLE',4); assert r['sql']=='UPDATE relays SET power=%s WHERE relay_id=%s' and r['params']==(70,2) and r['begin']=='BEGIN ISOLATION LEVEL SERIALIZABLE' and r['parameterized'] is True and r['retry_policy']=='bounded-whole-transaction:4' and 'database constraint' in r['constraint_policy'].lower()", hint: "Normalize outer whitespace and isolation case while preserving placeholders." },
        { name: "Nonserializable plans do not retry", code: "assert build_transaction_plan('SELECT %s',(1,),'read committed',5)['retry_policy']=='none'", hint: "Do not retry arbitrary transactions by default." },
        { name: "Unsafe statements fail", code: "for s,p,i,a in [(' ',(), 'serializable',3),('SELECT 1; DROP TABLE x',(), 'serializable',3),('SELECT {x}',(), 'serializable',3),('SELECT %s',(), 'serializable',3),('SELECT 1',[], 'serializable',3),('SELECT 1',(), 'bad',3),('SELECT 1',(), 'serializable',6)]:\n try:\n  build_transaction_plan(s,p,i,a); assert False\n except (TypeError,ValueError):\n  pass", hint: "Reject blank or multi-statement SQL, interpolation braces, cardinality mismatch, bad types, isolation, and attempts." },
      ],
    },
  };

  if (topic.title === "Caching") return {
    title: "Bounded TTL cache mission",
    instructions: "Implement TTLCache(max_entries, ttl_seconds, clock). Validate positive integer max_entries, positive numeric ttl, and callable clock. set stores a deep copy with expiry clock()+ttl. get returns a deep copy, refreshes recency, and returns None after removing an expired or missing key. When full, set evicts the least-recently-used live entry; purge removes all expired entries and returns their count. Reject blank string keys and never expose internal mutable values.",
    starterCode: "import copy\n\nclass TTLCache:\n    def __init__(self, max_entries, ttl_seconds, clock):\n        # TODO: retain bounded entries, expiry, and recency.\n        pass\n\n    def set(self, key, value):\n        pass\n\n    def get(self, key):\n        pass\n\n    def purge(self):\n        return 0\n",
    visibleExamples: [
      { label: "EXPIRY", input: "clock passes ttl", output: "get returns None and removes entry" },
      { label: "EVICTION", input: "capacity full", output: "least recently used live key removed" },
    ],
    runtime: {
      minimumCodeLength: 470,
      requiredPatterns: [
        { pattern: "copy\\.deepcopy", flags: "im", name: "Protects cached values", hint: "Copy values on both set and get." },
        { pattern: "clock\\s*\\(", flags: "im", name: "Uses injectable time", hint: "Call the supplied clock for deterministic expiry." },
      ],
      pythonTests: [
        { name: "TTL and copying are correct", code: "now=[0.0]; c=TTLCache(2,5,lambda:now[0]); x={'v':[1]}; c.set('a',x); x['v'].append(2); y=c.get('a'); y['v'].append(3); assert c.get('a')=={'v':[1]}; now[0]=5; assert c.get('a') is None", hint: "Expire at clock >= expiry and deep-copy at both boundaries." },
        { name: "Live LRU entry is evicted", code: "now=[0]; c=TTLCache(2,10,lambda:now[0]); c.set('a',1); c.set('b',2); assert c.get('a')==1; c.set('c',3); assert c.get('b') is None and c.get('a')==1 and c.get('c')==3", hint: "A successful get refreshes recency." },
        { name: "Purge and validation work", code: "now=[0]; c=TTLCache(2,1,lambda:now[0]); c.set('a',1); c.set('b',2); now[0]=2; assert c.purge()==2 and c.purge()==0\nfor a,b in [(0,1),(True,1),(1,0)]:\n try:\n  TTLCache(a,b,lambda:0); assert False\n except (TypeError,ValueError):\n  pass\ntry:\n TTLCache(1,1,lambda:0).set(' ',1); assert False\nexcept (TypeError,ValueError):\n pass", hint: "Validate constructor values and blank keys, and count only entries actually purged." },
      ],
    },
  };

  if (topic.title === "Queues") return {
    title: "Replay-safe consumer mission",
    instructions: "Implement consume_message(message, state, handler, max_attempts=3). Message requires nonblank id, kind, and idempotency_key plus positive integer attempt. State contains processed set and dead_letter list. Duplicate idempotency keys return ack without calling handler. On handler success add the key and return ack with result. On exception return retry with next_attempt while attempt < max_attempts; otherwise append one immutable (id, kind, error_type) tuple to dead_letter and return dead_letter. Validate before effects and do not acknowledge failures.",
    starterCode: "def consume_message(message, state, handler, max_attempts=3):\n    # TODO: validate, deduplicate, execute, and classify the outcome.\n    return {}\n",
    visibleExamples: [
      { label: "REDELIVERY", input: "processed idempotency key", output: "ack duplicate; no handler call" },
      { label: "POISON", input: "final failed attempt", output: "one dead-letter record" },
    ],
    runtime: {
      minimumCodeLength: 430,
      requiredPatterns: [
        { pattern: "idempotency_key", flags: "im", name: "Deduplicates delivery", hint: "Check state['processed'] before calling handler." },
        { pattern: "dead_letter", flags: "im", name: "Quarantines poison work", hint: "Append one diagnostic tuple at the final attempt." },
        { pattern: "except", flags: "im", name: "Classifies processing failure", hint: "Return retry or dead_letter instead of ack." },
      ],
      pythonTests: [
        { name: "Success and duplicate delivery are safe", code: "state={'processed':set(),'dead_letter':[]}; calls=[]; m={'id':'m1','kind':'sync','idempotency_key':'op1','attempt':1}; a=consume_message(m,state,lambda x:(calls.append(x['id']) or 'ok')); b=consume_message(m,state,lambda x:(calls.append('bad') or None)); assert a=={'status':'ack','result':'ok','duplicate':False} and b=={'status':'ack','result':None,'duplicate':True} and calls==['m1'] and state['processed']=={'op1'}", hint: "Record the key only after handler success and bypass duplicates." },
        { name: "Failures retry then dead-letter", code: "state={'processed':set(),'dead_letter':[]}; boom=lambda m: (_ for _ in ()).throw(RuntimeError('down')); a=consume_message({'id':'m','kind':'sync','idempotency_key':'k','attempt':1},state,boom,2); b=consume_message({'id':'m','kind':'sync','idempotency_key':'k','attempt':2},state,boom,2); assert a=={'status':'retry','next_attempt':2,'error':'RuntimeError'} and b=={'status':'dead_letter','error':'RuntimeError'} and state['dead_letter']==[('m','sync','RuntimeError')] and not state['processed']", hint: "Do not acknowledge or deduplicate failures; quarantine only the final attempt." },
        { name: "Invalid input has no effects", code: "state={'processed':set(),'dead_letter':[]}; calls=[]\nfor m in [{},{'id':'','kind':'x','idempotency_key':'k','attempt':1},{'id':'m','kind':'','idempotency_key':'k','attempt':1},{'id':'m','kind':'x','idempotency_key':'','attempt':1},{'id':'m','kind':'x','idempotency_key':'k','attempt':True}]:\n try:\n  consume_message(m,state,lambda x:calls.append(1)); assert False\n except (TypeError,ValueError):\n  pass\nassert calls==[] and state=={'processed':set(),'dead_letter':[]}", hint: "Validate the message and state before calling the handler or mutating state." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["relays · production relay inventory", "relay_events · append-style signal events", "durability metadata created by each mission", "transactional PostgreSQL practice database"] };

export function buildRoundFourteenSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Durability Grid") return {
    ...sqlBase,
    title: "Durability Grid SQL project",
    instructions: "Create durability_targets with component primary key restricted to wal, recovery, replication, partitioning, or sharding; nonnegative rpo_seconds; positive rto_seconds; and a boolean tested flag. Create shard_routes with positive tenant_id primary key and shard_id from 0 through 3, plus an index named idx_shard_routes_shard. In one transaction insert all five targets with exact RPO/RTO values (wal 0/30, recovery 300/900, replication 5/60, partitioning 60/120, sharding 30/180), all tested true, and tenants 101 through 104 routed with mod(tenant_id,4). Commit and return component, rpo_seconds, rto_seconds ordered by component.",
    starterCode: "CREATE TABLE durability_targets (\n  component text PRIMARY KEY,\n  rpo_seconds integer NOT NULL,\n  rto_seconds integer NOT NULL,\n  tested boolean NOT NULL,\n  /* TODO: component, RPO, and RTO constraints */\n);\n\nCREATE TABLE shard_routes (\n  tenant_id bigint PRIMARY KEY CHECK (tenant_id > 0),\n  shard_id integer NOT NULL CHECK (shard_id BETWEEN 0 AND 3)\n);\n\n/* TODO: create idx_shard_routes_shard */\nBEGIN;\n/* TODO: insert the five durability targets and four deterministic routes. */\nCOMMIT;\n\nSELECT component, rpo_seconds, rto_seconds\nFROM durability_targets\nORDER BY component;\n",
    visibleExamples: [
      { label: "RECOVERY", input: "recovery target", output: "RPO 300 seconds; RTO 900 seconds" },
      { label: "ROUTING", input: "tenant 103", output: "shard 3" },
    ],
    runtime: {
      minimumCodeLength: 780,
      requiredPatterns: [
        { pattern: "CHECK\\s*\\(\\s*component\\s+IN", flags: "i", name: "Constrains durability components", hint: "Add a CHECK over the five exact component names." },
        { pattern: "CREATE\\s+INDEX\\s+idx_shard_routes_shard", flags: "i", name: "Indexes shard lookup", hint: "Create the exact index on shard_id." },
        { pattern: "BEGIN[\\s\\S]*COMMIT", flags: "i", name: "Commits the control-plane state atomically", hint: "Keep all target and route inserts inside the transaction." },
      ],
      sqlTests: [
        { name: "Durability target columns are exact", kind: "result-columns", columns: ["component","rpo_seconds","rto_seconds"], hint: "Finish with the supplied ordered projection." },
        { name: "All durability systems are present", kind: "result-ordered-values", column: "component", expected: ["partitioning","recovery","replication","sharding","wal"], hint: "Insert every component and order alphabetically." },
        { name: "Recovery objectives are exact", kind: "database-value", query: "SELECT (rpo_seconds = 300 AND rto_seconds = 900 AND tested)::int AS ok FROM durability_targets WHERE component='recovery'", column: "ok", expected: 1, hint: "Use the requested recovery target and tested state." },
        { name: "Shard routing is deterministic", kind: "database-value", query: "SELECT count(*)::int AS count FROM shard_routes WHERE shard_id = mod(tenant_id,4) AND tenant_id BETWEEN 101 AND 104", column: "count", expected: 4, hint: "Insert four routes using modulo four." },
        { name: "Shard lookup index exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname='idx_shard_routes_shard'", column: "count", expected: 1, hint: "Create the exact index name." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "WAL") return {
    ...sqlBase,
    title: "WAL archive continuity mission",
    instructions: "Create wal_archive_status with segment_name primary key, positive sequence_no unique, archived_at timestamptz, and verified boolean. Insert sequence 41 verified, 42 unverified, and 43 verified. Return sequence_no, segment_name, and status as verified or needs-review ordered by sequence. Also expose enough durable state for hidden checks to detect gaps and review work.",
    starterCode: "CREATE TABLE wal_archive_status (\n  segment_name text PRIMARY KEY CHECK (btrim(segment_name) <> ''),\n  sequence_no integer NOT NULL UNIQUE CHECK (sequence_no > 0),\n  archived_at timestamptz NOT NULL,\n  verified boolean NOT NULL\n);\n\n/* TODO: insert segments 00041, 00042, and 00043 with only 42 unverified. */\n\nSELECT sequence_no, segment_name,\n       CASE WHEN verified THEN 'verified' ELSE 'needs-review' END AS status\nFROM wal_archive_status\nORDER BY sequence_no;\n",
    visibleExamples: [
      { label: "CONTINUITY", input: "sequences 41, 42, 43", output: "no archive gap" },
      { label: "VERIFY", input: "segment 42", output: "needs-review" },
    ],
    runtime: {
      minimumCodeLength: 470,
      requiredPatterns: [{ pattern: "INSERT\\s+INTO\\s+wal_archive_status", flags: "i", name: "Records archived segments", hint: "Insert the three requested rows." }],
      sqlTests: [
        { name: "WAL result columns are exact", kind: "result-columns", columns: ["sequence_no","segment_name","status"], hint: "Keep the final projection." },
        { name: "Archive sequence is continuous", kind: "result-ordered-values", column: "sequence_no", expected: [41,42,43], hint: "Insert and order all three sequence numbers." },
        { name: "One segment needs verification", kind: "database-value", query: "SELECT count(*)::int AS count FROM wal_archive_status WHERE NOT verified", column: "count", expected: 1, hint: "Only sequence 42 should be unverified." },
      ],
    },
  };

  if (topic.title === "Recovery") return {
    ...sqlBase,
    title: "Recovery drill evidence mission",
    instructions: "Create recovery_drills with unique drill_name, target and restored timestamptz, positive restore_seconds, integrity_passed boolean, and a CHECK that restored_at >= target_at. Insert drill august-restore from 10:00 UTC to 10:04 UTC with restore_seconds 480 and integrity true. Return drill_name, achieved_rpo_seconds from the timestamps, restore_seconds as achieved_rto_seconds, and passed where integrity is true, RPO <=300, and RTO <=900.",
    starterCode: "CREATE TABLE recovery_drills (\n  drill_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  drill_name text NOT NULL UNIQUE CHECK (btrim(drill_name) <> ''),\n  target_at timestamptz NOT NULL,\n  restored_at timestamptz NOT NULL,\n  restore_seconds integer NOT NULL CHECK (restore_seconds > 0),\n  integrity_passed boolean NOT NULL,\n  /* TODO: enforce restored_at at or after target_at */\n);\n\n/* TODO: insert the august-restore evidence. */\n\nSELECT drill_name,\n       extract(epoch FROM restored_at-target_at)::int AS achieved_rpo_seconds,\n       restore_seconds AS achieved_rto_seconds,\n       (integrity_passed AND extract(epoch FROM restored_at-target_at) <= 300 AND restore_seconds <= 900) AS passed\nFROM recovery_drills;\n",
    visibleExamples: [
      { label: "RPO", input: "10:00 target; 10:04 restored", output: "240 seconds" },
      { label: "GATE", input: "RPO 240, RTO 480, integrity true", output: "passed" },
    ],
    runtime: {
      minimumCodeLength: 600,
      requiredPatterns: [
        { pattern: "CHECK\\s*\\(\\s*restored_at\\s*>=\\s*target_at", flags: "i", name: "Protects recovery chronology", hint: "Add the timestamp ordering CHECK." },
        { pattern: "extract\\s*\\(\\s*epoch", flags: "i", name: "Measures the recovery point", hint: "Keep the epoch calculation in the final query." },
      ],
      sqlTests: [
        { name: "Recovery evidence columns are exact", kind: "result-columns", columns: ["drill_name","achieved_rpo_seconds","achieved_rto_seconds","passed"], hint: "Keep the supplied aliases." },
        { name: "Recovery point is 240 seconds", kind: "result-value", column: "achieved_rpo_seconds", expected: 240, hint: "Use timestamps four minutes apart." },
        { name: "Recovery gate passes", kind: "result-value", column: "passed", expected: true, hint: "Use restore_seconds 480 and integrity true." },
      ],
    },
  };

  if (topic.title === "Replication") return {
    ...sqlBase,
    title: "Replica promotion gate mission",
    instructions: "Create replica_health with replica_name primary key, replay_lag_seconds nonnegative, healthy boolean, fenced_old_primary boolean, and timeline positive. Insert east-a lag 2 healthy/fenced timeline 8, east-b lag 14 healthy/fenced timeline 8, and west-a lag 1 unhealthy/fenced timeline 7. Return replica_name, replay_lag_seconds, and safe_to_promote defined as healthy, fenced, lag <=5, and maximum timeline, ordered by lag then name.",
    starterCode: "CREATE TABLE replica_health (\n  replica_name text PRIMARY KEY CHECK (btrim(replica_name) <> ''),\n  replay_lag_seconds integer NOT NULL CHECK (replay_lag_seconds >= 0),\n  healthy boolean NOT NULL,\n  fenced_old_primary boolean NOT NULL,\n  timeline integer NOT NULL CHECK (timeline > 0)\n);\n\n/* TODO: insert the three replica observations. */\n\nSELECT replica_name, replay_lag_seconds,\n       (healthy AND fenced_old_primary AND replay_lag_seconds <= 5\n        AND timeline = (SELECT max(timeline) FROM replica_health)) AS safe_to_promote\nFROM replica_health\nORDER BY replay_lag_seconds, replica_name;\n",
    visibleExamples: [
      { label: "CANDIDATE", input: "east-a", output: "safe to promote" },
      { label: "STALE", input: "east-b lag 14", output: "not safe" },
    ],
    runtime: {
      minimumCodeLength: 610,
      requiredPatterns: [{ pattern: "max\\s*\\(\\s*timeline\\s*\\)", flags: "i", name: "Requires the latest recovery history", hint: "Keep the maximum timeline condition." }],
      sqlTests: [
        { name: "Replica result columns are exact", kind: "result-columns", columns: ["replica_name","replay_lag_seconds","safe_to_promote"], hint: "Keep the final projection." },
        { name: "Lag ordering is exact", kind: "result-ordered-values", column: "replica_name", expected: ["west-a","east-a","east-b"], hint: "Order by replay lag then name." },
        { name: "Exactly one candidate is safe", kind: "database-value", query: "SELECT count(*)::int AS count FROM replica_health WHERE healthy AND fenced_old_primary AND replay_lag_seconds <= 5 AND timeline=(SELECT max(timeline) FROM replica_health)", column: "count", expected: 1, hint: "Only east-a should satisfy every gate." },
      ],
    },
  };

  if (topic.title === "Partitioning") return {
    ...sqlBase,
    title: "Range partition lifecycle mission",
    instructions: "Create relay_signal_log partitioned by RANGE on occurred_on, with composite primary key (signal_id, occurred_on). Create January and February 2026 partitions with exact names relay_signal_log_2026_01 and relay_signal_log_2026_02, insert one row into each, and return partition_name plus row_count ordered by partition_name using tableoid::regclass::text.",
    starterCode: "CREATE TABLE relay_signal_log (\n  signal_id bigint NOT NULL,\n  occurred_on date NOT NULL,\n  payload jsonb NOT NULL,\n  PRIMARY KEY (signal_id, occurred_on)\n) PARTITION BY RANGE (occurred_on);\n\n/* TODO: create January and February partitions and insert one row per month. */\n\nSELECT tableoid::regclass::text AS partition_name, count(*)::int AS row_count\nFROM relay_signal_log\nGROUP BY tableoid\nORDER BY partition_name;\n",
    visibleExamples: [
      { label: "JANUARY", input: "2026-01-15", output: "relay_signal_log_2026_01" },
      { label: "FEBRUARY", input: "2026-02-10", output: "relay_signal_log_2026_02" },
    ],
    runtime: {
      minimumCodeLength: 660,
      requiredPatterns: [
        { pattern: "PARTITION\\s+BY\\s+RANGE", flags: "i", name: "Declares range partitioning", hint: "Keep the parent partition clause." },
        { pattern: "PARTITION\\s+OF\\s+relay_signal_log", flags: "i", name: "Creates physical children", hint: "Create both named partitions with FROM and TO bounds." },
      ],
      sqlTests: [
        { name: "Partition result columns are exact", kind: "result-columns", columns: ["partition_name","row_count"], hint: "Keep the final tableoid aggregation." },
        { name: "Rows route to both monthly partitions", kind: "result-ordered-values", column: "partition_name", expected: ["relay_signal_log_2026_01","relay_signal_log_2026_02"], hint: "Use one January and one February date." },
        { name: "Both rows are stored", kind: "database-value", query: "SELECT count(*)::int AS count FROM relay_signal_log", column: "count", expected: 2, hint: "Insert exactly two rows." },
      ],
    },
  };

  if (topic.title === "Sharding") return {
    ...sqlBase,
    title: "Deterministic shard routing mission",
    instructions: "Create tenant_shard_routes with positive tenant_id primary key, shard_id constrained 0 through 3, version positive, and moved_at timestamptz. Insert tenants 201 through 206 using shard_id mod(tenant_id,4), version 1, and NULL moved_at. Create index idx_tenant_shard_routes_shard on shard_id. Return tenant_id and shard_id ordered by tenant_id.",
    starterCode: "CREATE TABLE tenant_shard_routes (\n  tenant_id bigint PRIMARY KEY CHECK (tenant_id > 0),\n  shard_id integer NOT NULL CHECK (shard_id BETWEEN 0 AND 3),\n  version integer NOT NULL CHECK (version > 0),\n  moved_at timestamptz\n);\n\n/* TODO: insert tenants 201 through 206 with modulo-four routing. */\n/* TODO: create idx_tenant_shard_routes_shard. */\n\nSELECT tenant_id, shard_id\nFROM tenant_shard_routes\nORDER BY tenant_id;\n",
    visibleExamples: [
      { label: "ROUTE", input: "tenant 205", output: "shard 1" },
      { label: "VERSION", input: "initial map", output: "version 1; moved_at null" },
    ],
    runtime: {
      minimumCodeLength: 570,
      requiredPatterns: [
        { pattern: "mod\\s*\\(\\s*tenant_id\\s*,\\s*4\\s*\\)", flags: "i", name: "Uses deterministic routing", hint: "Generate routes from tenant_id modulo four." },
        { pattern: "CREATE\\s+INDEX\\s+idx_tenant_shard_routes_shard", flags: "i", name: "Indexes shard membership", hint: "Create the exact index on shard_id." },
      ],
      sqlTests: [
        { name: "Shard result columns are exact", kind: "result-columns", columns: ["tenant_id","shard_id"], hint: "Keep the final projection." },
        { name: "Modulo routes are exact", kind: "result-ordered-values", column: "shard_id", expected: [1,2,3,0,1,2], hint: "Insert tenants 201 through 206 using modulo four." },
        { name: "Route metadata is initial", kind: "database-value", query: "SELECT count(*)::int AS count FROM tenant_shard_routes WHERE version=1 AND moved_at IS NULL", column: "count", expected: 6, hint: "Use version one and null moved_at for every initial route." },
      ],
    },
  };

  return null;
}
