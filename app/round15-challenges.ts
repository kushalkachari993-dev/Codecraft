import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundFifteenPythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Deployment Citadel") return {
    title: "Deployment Citadel Python project",
    instructions: "Implement build_release_manifest(service, artifacts, canary_percent, latency_budget_ms). Require a nonblank lowercase service slug, a nonempty list of artifact dictionaries with unique nonblank name, digest starting sha256: followed by 64 lowercase hex characters, signed and sbom real booleans, and critical_vulnerabilities nonnegative integer. Require canary_percent 1 through 25 and positive numeric non-boolean latency budget. Do not mutate input. Return service, immutable artifact tuple ordered by name, ready only when every artifact is signed, has an SBOM, and has zero critical vulnerabilities, rollout 'canary:N%', runtime_policy mentioning non-root, read-only, secret, and SIGTERM, cloud_policy mentioning stateless, workload identity, quota, and rollback, observability_policy mentioning trace, SLO, version, and redaction, and performance_gate 'p95<=Xms'.",
    starterCode: "import re\n\ndef build_release_manifest(service, artifacts, canary_percent, latency_budget_ms):\n    # TODO: validate immutable artifact evidence and return release controls.\n    return {}\n",
    visibleExamples: [
      { label: "EVIDENCE", input: "signed artifact, SBOM, zero critical findings", output: "artifact is release-ready" },
      { label: "ROLLOUT", input: "canary_percent 10", output: "canary:10% with measured rollback" },
    ],
    runtime: {
      minimumCodeLength: 650,
      requiredPatterns: [
        { pattern: "sha256", flags: "im", name: "Binds immutable artifacts", hint: "Validate the complete sha256 digest." },
        { pattern: "tuple\\s*\\(", flags: "im", name: "Freezes release evidence", hint: "Return artifact summaries as a tuple." },
        { pattern: "critical_vulnerabilities", flags: "im", name: "Gates security evidence", hint: "Ready requires zero critical vulnerabilities." },
      ],
      pythonTests: [
        { name: "Release evidence and gates are exact", code: "d='sha256:'+'a'*64; arts=[{'name':'worker','digest':d,'signed':True,'sbom':True,'critical_vulnerabilities':0},{'name':'api','digest':'sha256:'+'b'*64,'signed':True,'sbom':True,'critical_vulnerabilities':0}]; r=build_release_manifest('codecraft-api',arts,10,250); assert r['service']=='codecraft-api' and r['artifacts']==(('api','sha256:'+'b'*64),('worker',d)) and r['ready'] is True and r['rollout']=='canary:10%' and r['performance_gate']=='p95<=250ms'", hint: "Sort artifact summaries by name and normalize an integral numeric latency without a decimal." },
        { name: "Every platform policy is complete", code: "a=[{'name':'api','digest':'sha256:'+'c'*64,'signed':True,'sbom':True,'critical_vulnerabilities':0}]; r=build_release_manifest('svc',a,5,100); assert all(x in r['runtime_policy'].lower() for x in ('non-root','read-only','secret','sigterm')) and all(x in r['cloud_policy'].lower() for x in ('stateless','workload identity','quota','rollback')) and all(x in r['observability_policy'].lower() for x in ('trace','slo','version','redaction'))", hint: "Return concise strings covering every named operational control." },
        { name: "Unsafe evidence blocks or fails without mutation", code: "a=[{'name':'api','digest':'sha256:'+'d'*64,'signed':False,'sbom':True,'critical_vulnerabilities':1}]; before=[dict(x) for x in a]; r=build_release_manifest('svc',a,5,100); assert a==before and r['ready'] is False\nfor s,arts,c,l in [('Bad Name',a,5,100),('svc',[],5,100),('svc',[{'name':'x','digest':'bad','signed':True,'sbom':True,'critical_vulnerabilities':0}],5,100),('svc',[{'name':'x','digest':'sha256:'+'a'*64,'signed':1,'sbom':True,'critical_vulnerabilities':0}],5,100),('svc',a,0,100),('svc',a,5,True)]:\n try:\n  build_release_manifest(s,arts,c,l); assert False\n except (TypeError,ValueError):\n  pass", hint: "Validate service, unique artifact identity, digest, real booleans, counts, canary range, and latency type." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Docker") return {
    title: "Hardened container policy mission",
    instructions: "Implement build_container_policy(base_digest, user_id, secret_names, writable_paths). Require base_digest sha256 plus 64 lowercase hex, integer non-boolean user_id >=10000, a list of unique uppercase secret names, and a list of unique absolute writable POSIX paths limited to /tmp or /run subpaths. Return immutable values plus non_root True, read_only_root True, drop_capabilities ('ALL',), stop_signal 'SIGTERM', and secrets_at_runtime True. Do not mutate inputs.",
    starterCode: "import re\n\ndef build_container_policy(base_digest, user_id, secret_names, writable_paths):\n    # TODO: validate a least-privilege runtime contract.\n    return {}\n",
    visibleExamples: [
      { label: "IDENTITY", input: "user_id 10001", output: "non-root runtime" },
      { label: "FILESYSTEM", input: "/tmp/cache", output: "explicit writable exception" },
    ],
    runtime: {
      minimumCodeLength: 390,
      requiredPatterns: [{ pattern: "sha256", flags: "im", name: "Pins the base artifact", hint: "Validate a complete lowercase digest." }, { pattern: "SIGTERM", flags: "im", name: "Defines graceful stop", hint: "Return SIGTERM as the stop signal." }],
      pythonTests: [
        { name: "Policy is exact and immutable", code: "r=build_container_policy('sha256:'+'a'*64,10001,['DATABASE_URL','API_TOKEN'],['/tmp/cache','/run/app']); assert r=={'base_digest':'sha256:'+'a'*64,'user_id':10001,'secret_names':('API_TOKEN','DATABASE_URL'),'writable_paths':('/run/app','/tmp/cache'),'non_root':True,'read_only_root':True,'drop_capabilities':('ALL',),'stop_signal':'SIGTERM','secrets_at_runtime':True}", hint: "Sort and freeze names and paths while preserving the exact security constants." },
        { name: "Unsafe values fail", code: "for d,u,s,p in [('bad',10001,[],[]),('sha256:'+'a'*64,0,[],[]),('sha256:'+'a'*64,True,[],[]),('sha256:'+'a'*64,10001,['bad-name'],[]),('sha256:'+'a'*64,10001,[],['/etc/data']),('sha256:'+'a'*64,10001,[],['relative'])]:\n try:\n  build_container_policy(d,u,s,p); assert False\n except (TypeError,ValueError):\n  pass", hint: "Constrain digest, user, secret identifiers, and writable locations." },
      ],
    },
  };

  if (topic.title === "CI/CD") return {
    title: "Evidence-gated pipeline mission",
    instructions: "Implement plan_pipeline(change). change requires trusted_branch and schema_change real booleans, risk low/medium/high, and tests list containing unit. Return stages as an immutable ordered tuple: validate, test, security, build, attest, then migrate if schema_change, then deploy-canary and verify. privileged_secrets is trusted_branch; approval_required is high risk or schema change; build_once and rollback_required are true. Reject duplicate or unknown tests and require integration for high risk.",
    starterCode: "def plan_pipeline(change):\n    # TODO: validate evidence and construct one immutable promotion path.\n    return {}\n",
    visibleExamples: [
      { label: "UNTRUSTED", input: "forked branch", output: "no privileged secrets" },
      { label: "SCHEMA", input: "schema_change true", output: "migration gate before canary" },
    ],
    runtime: {
      minimumCodeLength: 360,
      requiredPatterns: [{ pattern: "deploy-canary", flags: "im", name: "Uses progressive delivery", hint: "Place deploy-canary before verify." }, { pattern: "privileged_secrets", flags: "im", name: "Protects CI credentials", hint: "Only trusted branches receive privileged secrets." }],
      pythonTests: [
        { name: "Pipeline order and gates are exact", code: "r=plan_pipeline({'trusted_branch':True,'schema_change':True,'risk':'high','tests':['unit','integration']}); assert r['stages']==('validate','test','security','build','attest','migrate','deploy-canary','verify') and r['privileged_secrets'] is True and r['approval_required'] is True and r['build_once'] is True and r['rollback_required'] is True", hint: "Construct stages deterministically and insert migrate only before deployment." },
        { name: "Low-risk untrusted changes stay unprivileged", code: "r=plan_pipeline({'trusted_branch':False,'schema_change':False,'risk':'low','tests':['unit']}); assert r['stages']==('validate','test','security','build','attest','deploy-canary','verify') and r['privileged_secrets'] is False and r['approval_required'] is False", hint: "Approval follows risk and schema, not branch trust." },
        { name: "Invalid evidence fails", code: "for c in [{},{'trusted_branch':1,'schema_change':False,'risk':'low','tests':['unit']},{'trusted_branch':True,'schema_change':False,'risk':'bad','tests':['unit']},{'trusted_branch':True,'schema_change':False,'risk':'low','tests':[]},{'trusted_branch':True,'schema_change':False,'risk':'low','tests':['unit','unit']},{'trusted_branch':True,'schema_change':False,'risk':'high','tests':['unit']}]:\n try:\n  plan_pipeline(c); assert False\n except (TypeError,ValueError):\n  pass", hint: "Validate booleans, risk, unique known tests, unit presence, and high-risk integration evidence." },
      ],
    },
  };

  if (topic.title === "Cloud") return {
    title: "Elastic capacity plan mission",
    instructions: "Implement plan_capacity(requests_per_second, average_duration_ms, instance_concurrency, headroom=0.25). Reject booleans; rates and duration must be positive numeric, concurrency positive integer, headroom numeric from 0 through 0.8. Calculate raw_concurrency=rps*duration/1000, usable_per_instance=instance_concurrency*(1-headroom), and required_instances=ceil(raw/usable), at least 2. Return those values rounded to two decimals, stateless True, durable_state 'external', identity 'workload', and overload_policy 'bounded-queue-and-shed'.",
    starterCode: "import math\n\ndef plan_capacity(requests_per_second, average_duration_ms, instance_concurrency, headroom=0.25):\n    # TODO: convert throughput and duration into resilient instance capacity.\n    return {}\n",
    visibleExamples: [
      { label: "LITTLE'S LAW", input: "100 rps × 200 ms", output: "20 concurrent requests" },
      { label: "RESILIENCE", input: "one calculated instance", output: "minimum two" },
    ],
    runtime: {
      minimumCodeLength: 320,
      requiredPatterns: [{ pattern: "math\\.ceil", flags: "im", name: "Rounds capacity safely", hint: "Ceil the divided concurrency demand." }, { pattern: "bounded-queue-and-shed", flags: "im", name: "Controls overload", hint: "Return the exact overload policy." }],
      pythonTests: [
        { name: "Capacity arithmetic is exact", code: "r=plan_capacity(100,200,10,.2); assert r=={'raw_concurrency':20.0,'usable_per_instance':8.0,'required_instances':3,'stateless':True,'durable_state':'external','identity':'workload','overload_policy':'bounded-queue-and-shed'}", hint: "20 concurrent divided by 8 usable slots requires three instances." },
        { name: "Resilient minimum is two", code: "assert plan_capacity(1,10,100,0)['required_instances']==2", hint: "Return at least two instances even when demand fits in one." },
        { name: "Invalid capacity inputs fail", code: "for a,b,c,h in [(True,1,1,.2),(1,0,1,.2),(1,1,0,.2),(1,1,True,.2),(1,1,1,-.1),(1,1,1,.9)]:\n try:\n  plan_capacity(a,b,c,h); assert False\n except (TypeError,ValueError):\n  pass", hint: "Require positive non-boolean workload values and bounded headroom." },
      ],
    },
  };

  if (topic.title === "Security") return {
    title: "Constrained POSIX path mission",
    instructions: "Implement safe_join(root, user_path). Require root to be a normalized absolute POSIX path other than /, and user_path a nonblank relative POSIX path. Reject NUL, backslashes, absolute paths, empty segments, '.', '..', and any normalized result outside root. Return the joined normalized path without accessing the filesystem.",
    starterCode: "import posixpath\n\ndef safe_join(root, user_path):\n    # TODO: validate segments before joining beneath the trusted root.\n    return ''\n",
    visibleExamples: [
      { label: "SAFE", input: "/srv/data + tenant/report.json", output: "/srv/data/tenant/report.json" },
      { label: "TRAVERSAL", input: "../secret", output: "ValueError" },
    ],
    runtime: {
      minimumCodeLength: 280,
      requiredPatterns: [{ pattern: "posixpath", flags: "im", name: "Uses destination-aware normalization", hint: "Use POSIX path operations without filesystem access." }, { pattern: "\\.\\.", flags: "im", name: "Blocks traversal", hint: "Reject dot-dot segments before joining." }],
      pythonTests: [
        { name: "Safe paths join exactly", code: "assert safe_join('/srv/data','tenant/report.json')=='/srv/data/tenant/report.json' and safe_join('/a','b')=='/a/b'", hint: "Join validated segments beneath the normalized root." },
        { name: "Traversal and ambiguous syntax fail", code: "for r,p in [('/', 'a'),('relative','a'),('/srv/data/','a'),('/srv/data','../x'),('/srv/data','a/../x'),('/srv/data','/etc/passwd'),('/srv/data','a//b'),('/srv/data','a\\\\b'),('/srv/data','a/./b'),('/srv/data','')]:\n try:\n  safe_join(r,p); assert False\n except (TypeError,ValueError):\n  pass", hint: "Require canonical root and explicit safe relative segments." },
      ],
    },
  };

  if (topic.title === "Observability") return {
    title: "Trace SLI summary mission",
    instructions: "Implement summarize_traces(spans, latency_slo_ms). Each span requires nonblank trace_id and service, positive numeric non-boolean duration_ms, and real boolean error. Group by trace_id, sum durations, count erroneous spans, and return trace_count, error_trace_count, p95_latency_ms using nearest-rank over trace totals, slo_met where error traces are zero and p95 <= budget, plus services as a sorted tuple. Reject duplicate (trace_id, service) pairs and do not mutate input.",
    starterCode: "import math\n\ndef summarize_traces(spans, latency_slo_ms):\n    # TODO: correlate spans into user-visible trace signals.\n    return {}\n",
    visibleExamples: [
      { label: "TRACE", input: "API 30 ms + DB 20 ms", output: "trace total 50 ms" },
      { label: "SLO", input: "no errors and p95 within budget", output: "slo_met true" },
    ],
    runtime: {
      minimumCodeLength: 430,
      requiredPatterns: [{ pattern: "trace_id", flags: "im", name: "Correlates spans", hint: "Aggregate durations and errors by trace_id." }, { pattern: "math\\.ceil", flags: "im", name: "Uses nearest-rank p95", hint: "Index ceil(.95*n)-1 in sorted trace totals." }],
      pythonTests: [
        { name: "Trace signals are exact", code: "s=[{'trace_id':'a','service':'api','duration_ms':30,'error':False},{'trace_id':'a','service':'db','duration_ms':20,'error':False},{'trace_id':'b','service':'api','duration_ms':80,'error':True}]; r=summarize_traces(s,100); assert r=={'trace_count':2,'error_trace_count':1,'p95_latency_ms':80.0,'slo_met':False,'services':('api','db')}", hint: "Trace a totals 50 and trace b totals 80; an error trace fails the SLO." },
        { name: "Healthy traces meet the SLO", code: "r=summarize_traces([{'trace_id':'a','service':'api','duration_ms':10,'error':False}],10); assert r['p95_latency_ms']==10.0 and r['slo_met'] is True", hint: "Use <= for the latency boundary." },
        { name: "Invalid spans fail without mutation", code: "s=[{'trace_id':'a','service':'api','duration_ms':1,'error':False}]; before=[dict(x) for x in s]; summarize_traces(s,2); assert s==before\nfor bad in [[],[{'trace_id':'','service':'api','duration_ms':1,'error':False}],[{'trace_id':'a','service':'','duration_ms':1,'error':False}],[{'trace_id':'a','service':'api','duration_ms':True,'error':False}],[{'trace_id':'a','service':'api','duration_ms':1,'error':1}],s+s]:\n try:\n  summarize_traces(bad,2); assert False\n except (TypeError,ValueError):\n  pass", hint: "Validate trace identity, service, duration, boolean error, uniqueness, and budget." },
      ],
    },
  };

  if (topic.title === "Performance") return {
    title: "Percentile benchmark mission",
    instructions: "Implement benchmark_summary(samples_ms, budget_ms). Require at least five positive numeric non-boolean samples and a positive budget. Sort a copy, return count, min_ms, median_ms (average middle pair), p95_ms and p99_ms by nearest-rank, max_ms, and passes when p95 <= budget. Round numeric outputs to two decimals and do not mutate samples.",
    starterCode: "import math\n\ndef benchmark_summary(samples_ms, budget_ms):\n    # TODO: summarize a representative latency distribution.\n    return {}\n",
    visibleExamples: [
      { label: "TAIL", input: "20 samples", output: "nearest-rank p95 and p99" },
      { label: "GATE", input: "p95 <= budget", output: "passes true" },
    ],
    runtime: {
      minimumCodeLength: 300,
      requiredPatterns: [{ pattern: "math\\.ceil", flags: "im", name: "Calculates nearest-rank tails", hint: "Use ceil(percent*n)-1." }, { pattern: "sorted\\s*\\(", flags: "im", name: "Preserves the input", hint: "Sort a new list." }],
      pythonTests: [
        { name: "Benchmark statistics are exact", code: "x=[10,20,30,40,50,60,70,80,90,100]; before=list(x); r=benchmark_summary(x,90); assert x==before and r=={'count':10,'min_ms':10.0,'median_ms':55.0,'p95_ms':100.0,'p99_ms':100.0,'max_ms':100.0,'passes':False}", hint: "Nearest rank p95 for ten samples selects the tenth value." },
        { name: "Odd median and boundary pass", code: "r=benchmark_summary([1,2,3,4,5],5); assert r['median_ms']==3.0 and r['p95_ms']==5.0 and r['passes'] is True", hint: "Use the center value for odd counts and <= for the gate." },
        { name: "Invalid samples fail", code: "for x,b in [([1,2,3,4],5),([1,2,3,4,True],5),([1,2,3,4,0],5),([1,2,3,4,5],0)]:\n try:\n  benchmark_summary(x,b); assert False\n except (TypeError,ValueError):\n  pass", hint: "Require five positive non-boolean samples and a positive budget." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["relays · production service inventory", "relay_events · signal workload", "production control-plane tables created by each mission", "transactional PostgreSQL practice database"] };

export function buildRoundFifteenSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Production Platform") return {
    ...sqlBase,
    title: "Production Platform SQL project",
    instructions: "Create platform_slo with component primary key restricted to pool, cache, ha, backup, or monitoring; positive target_ms; target_success from 0 through 100; and tested boolean. Create pool_budget with service primary key, max_connections positive, reserved_connections nonnegative, and reserved less than max. Insert exact SLO rows pool 50/99.9, cache 20/99.5, ha 60000/99.9, backup 900000/100, monitoring 30000/99.9, all tested true. Insert api 30/5 and worker 20/4 pool budgets. Create idx_pool_budget_available on expression (max_connections-reserved_connections). Return component, target_ms, target_success ordered by component.",
    starterCode: "CREATE TABLE platform_slo (\n  component text PRIMARY KEY,\n  target_ms integer NOT NULL,\n  target_success numeric(5,2) NOT NULL,\n  tested boolean NOT NULL,\n  /* TODO: component, latency, and success constraints */\n);\n\nCREATE TABLE pool_budget (\n  service text PRIMARY KEY CHECK (btrim(service) <> ''),\n  max_connections integer NOT NULL CHECK (max_connections > 0),\n  reserved_connections integer NOT NULL CHECK (reserved_connections >= 0),\n  /* TODO: ensure reserved is below max */\n);\n\nBEGIN;\n/* TODO: insert five SLOs and two pool budgets. */\nCOMMIT;\n/* TODO: create idx_pool_budget_available on remaining capacity. */\n\nSELECT component, target_ms, target_success\nFROM platform_slo\nORDER BY component;\n",
    visibleExamples: [
      { label: "POOL", input: "api max 30, reserved 5", output: "25 available" },
      { label: "RECOVERY", input: "backup target", output: "900000 ms and 100%" },
    ],
    runtime: {
      minimumCodeLength: 900,
      requiredPatterns: [
        { pattern: "CHECK\\s*\\(\\s*component\\s+IN", flags: "i", name: "Constrains platform components", hint: "Add the five exact component values." },
        { pattern: "reserved_connections\\s*<\\s*max_connections", flags: "i", name: "Protects pool headroom", hint: "Add the cross-column CHECK." },
        { pattern: "CREATE\\s+INDEX\\s+idx_pool_budget_available", flags: "i", name: "Indexes remaining capacity", hint: "Create the exact expression index." },
      ],
      sqlTests: [
        { name: "Platform SLO columns are exact", kind: "result-columns", columns: ["component","target_ms","target_success"], hint: "Keep the final projection." },
        { name: "All platform systems are present", kind: "result-ordered-values", column: "component", expected: ["backup","cache","ha","monitoring","pool"], hint: "Insert all five rows and order alphabetically." },
        { name: "Pool budget preserves headroom", kind: "database-value", query: "SELECT sum(max_connections-reserved_connections)::int AS available FROM pool_budget", column: "available", expected: 41, hint: "API contributes 25 and worker contributes 16." },
        { name: "Backup objective is tested", kind: "database-value", query: "SELECT (target_ms=900000 AND target_success=100 AND tested)::int AS ok FROM platform_slo WHERE component='backup'", column: "ok", expected: 1, hint: "Use the exact tested backup objective." },
        { name: "Capacity index exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname='idx_pool_budget_available'", column: "count", expected: 1, hint: "Create the exact expression index." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Connection pooling") return {
    ...sqlBase,
    title: "Global connection budget mission",
    instructions: "Create connection_budget with service primary key, replicas positive, pool_per_replica positive, and admin_reserved nonnegative. Insert api 3/12/5, worker 4/8/5, and scheduler 2/4/2. Return service, application_connections as replicas*pool_per_replica, admin_reserved, and total_connections ordered by service. Finish with a database-wide total that hidden checks can verify remains within 100.",
    starterCode: "CREATE TABLE connection_budget (\n  service text PRIMARY KEY CHECK (btrim(service) <> ''),\n  replicas integer NOT NULL CHECK (replicas > 0),\n  pool_per_replica integer NOT NULL CHECK (pool_per_replica > 0),\n  admin_reserved integer NOT NULL CHECK (admin_reserved >= 0)\n);\n\n/* TODO: insert api, scheduler, and worker budgets. */\n\nSELECT service,\n       replicas*pool_per_replica AS application_connections,\n       admin_reserved,\n       replicas*pool_per_replica+admin_reserved AS total_connections\nFROM connection_budget\nORDER BY service;\n",
    visibleExamples: [
      { label: "API", input: "3 replicas × 12 + 5 reserved", output: "41 total" },
      { label: "GLOBAL", input: "all services", output: "88 connections" },
    ],
    runtime: {
      minimumCodeLength: 520,
      requiredPatterns: [{ pattern: "replicas\\s*\\*\\s*pool_per_replica", flags: "i", name: "Calculates scale-out demand", hint: "Keep the pool multiplication in the projection." }],
      sqlTests: [
        { name: "Pool result columns are exact", kind: "result-columns", columns: ["service","application_connections","admin_reserved","total_connections"], hint: "Keep the supplied aliases." },
        { name: "Services are ordered", kind: "result-ordered-values", column: "service", expected: ["api","scheduler","worker"], hint: "Insert all three services and order by name." },
        { name: "Global connection budget is 88", kind: "database-value", query: "SELECT sum(replicas*pool_per_replica+admin_reserved)::int AS total FROM connection_budget", column: "total", expected: 88, hint: "Use exact replica, pool, and reserve values." },
      ],
    },
  };

  if (topic.title === "Caching architecture") return {
    ...sqlBase,
    title: "Tenant-safe cache registry mission",
    instructions: "Create cache_registry with tenant_id positive, cache_key nonblank, source_version positive, expires_at timestamptz, loaded_at timestamptz default now(), payload JSONB, primary key (tenant_id, cache_key), and CHECK expires_at > loaded_at. Insert north key relay:1 version 3 payload power 96 and south key relay:1 version 4 payload power 82, both expiring one hour after loaded_at. Return tenant_id, cache_key, source_version, and power extracted as integer ordered by tenant_id.",
    starterCode: "CREATE TABLE cache_registry (\n  tenant_id bigint NOT NULL CHECK (tenant_id > 0),\n  cache_key text NOT NULL CHECK (btrim(cache_key) <> ''),\n  source_version integer NOT NULL CHECK (source_version > 0),\n  loaded_at timestamptz NOT NULL DEFAULT now(),\n  expires_at timestamptz NOT NULL,\n  payload jsonb NOT NULL,\n  PRIMARY KEY (tenant_id, cache_key),\n  /* TODO: require expiry after load */\n);\n\n/* TODO: insert tenant 1 north and tenant 2 south cache entries. */\n\nSELECT tenant_id, cache_key, source_version, (payload->>'power')::int AS power\nFROM cache_registry\nORDER BY tenant_id;\n",
    visibleExamples: [
      { label: "SCOPE", input: "same cache key in two tenants", output: "two isolated entries" },
      { label: "VERSION", input: "source changes", output: "source_version changes cache identity" },
    ],
    runtime: {
      minimumCodeLength: 700,
      requiredPatterns: [{ pattern: "CHECK\\s*\\(\\s*expires_at\\s*>\\s*loaded_at", flags: "i", name: "Protects freshness chronology", hint: "Add the expiry CHECK." }, { pattern: "PRIMARY\\s+KEY\\s*\\(\\s*tenant_id\\s*,\\s*cache_key", flags: "i", name: "Scopes keys by tenant", hint: "Keep the composite primary key." }],
      sqlTests: [
        { name: "Cache result columns are exact", kind: "result-columns", columns: ["tenant_id","cache_key","source_version","power"], hint: "Keep the final JSON projection." },
        { name: "Tenant powers stay isolated", kind: "result-ordered-values", column: "power", expected: [96,82], hint: "Insert north as tenant 1 and south as tenant 2." },
        { name: "Both scoped entries exist", kind: "database-value", query: "SELECT count(*)::int AS count FROM cache_registry WHERE cache_key='relay:1'", column: "count", expected: 2, hint: "The same logical key is valid once per tenant." },
      ],
    },
  };

  if (topic.title === "High availability") return {
    ...sqlBase,
    title: "Failover candidate gate mission",
    instructions: "Create ha_candidates with node_name primary key, zone nonblank, replay_lag_seconds nonnegative, timeline positive, healthy boolean, fenced_old_primary boolean, and capacity_percent 0 through 100. Insert node-a zone-a lag 2 timeline 9 healthy/fenced capacity 70; node-b zone-b lag 1 timeline 8 healthy/fenced capacity 80; node-c zone-c lag 8 timeline 9 healthy/fenced capacity 90. Return node_name, replay_lag_seconds, and safe_to_promote requiring healthy, fenced, lag <=5, maximum timeline, and capacity >=60 ordered by lag then name.",
    starterCode: "CREATE TABLE ha_candidates (\n  node_name text PRIMARY KEY CHECK (btrim(node_name) <> ''),\n  zone text NOT NULL CHECK (btrim(zone) <> ''),\n  replay_lag_seconds integer NOT NULL CHECK (replay_lag_seconds >= 0),\n  timeline integer NOT NULL CHECK (timeline > 0),\n  healthy boolean NOT NULL,\n  fenced_old_primary boolean NOT NULL,\n  capacity_percent integer NOT NULL CHECK (capacity_percent BETWEEN 0 AND 100)\n);\n\n/* TODO: insert the three candidate observations. */\n\nSELECT node_name, replay_lag_seconds,\n       (healthy AND fenced_old_primary AND replay_lag_seconds <= 5\n        AND timeline=(SELECT max(timeline) FROM ha_candidates)\n        AND capacity_percent >= 60) AS safe_to_promote\nFROM ha_candidates\nORDER BY replay_lag_seconds, node_name;\n",
    visibleExamples: [
      { label: "CURRENT", input: "node-a timeline 9, lag 2", output: "safe" },
      { label: "STALE", input: "node-b timeline 8", output: "not safe despite lag 1" },
    ],
    runtime: {
      minimumCodeLength: 790,
      requiredPatterns: [{ pattern: "fenced_old_primary", flags: "i", name: "Prevents split brain", hint: "Include fencing in the promotion gate." }, { pattern: "max\\s*\\(\\s*timeline\\s*\\)", flags: "i", name: "Requires current history", hint: "Keep the maximum timeline condition." }],
      sqlTests: [
        { name: "HA result columns are exact", kind: "result-columns", columns: ["node_name","replay_lag_seconds","safe_to_promote"], hint: "Keep the final projection." },
        { name: "Candidates are ordered by lag", kind: "result-ordered-values", column: "node_name", expected: ["node-b","node-a","node-c"], hint: "Order by lag then name." },
        { name: "Exactly node-a is promotable", kind: "database-value", query: "SELECT count(*)::int AS count FROM ha_candidates WHERE healthy AND fenced_old_primary AND replay_lag_seconds<=5 AND timeline=(SELECT max(timeline) FROM ha_candidates) AND capacity_percent>=60", column: "count", expected: 1, hint: "Use the exact candidate observations." },
      ],
    },
  };

  if (topic.title === "Backup/PITR") return {
    ...sqlBase,
    title: "PITR recovery chain mission",
    instructions: "Create recovery_chain with sequence_no positive primary key, artifact_type base or wal, artifact_name unique nonblank, captured_at timestamptz, verified boolean, and immutable_copy boolean. Insert sequence 100 base base-100 at 00:00, then WAL 101 at 00:05 and WAL 102 at 00:10 UTC on 2026-08-01, all verified and immutable. Return sequence_no, artifact_type, artifact_name ordered by sequence_no. Hidden checks verify continuity and recovery evidence.",
    starterCode: "CREATE TABLE recovery_chain (\n  sequence_no integer PRIMARY KEY CHECK (sequence_no > 0),\n  artifact_type text NOT NULL CHECK (artifact_type IN ('base','wal')),\n  artifact_name text NOT NULL UNIQUE CHECK (btrim(artifact_name) <> ''),\n  captured_at timestamptz NOT NULL,\n  verified boolean NOT NULL,\n  immutable_copy boolean NOT NULL\n);\n\n/* TODO: insert base 100 and WAL 101-102 at five-minute intervals. */\n\nSELECT sequence_no, artifact_type, artifact_name\nFROM recovery_chain\nORDER BY sequence_no;\n",
    visibleExamples: [
      { label: "BASE", input: "sequence 100", output: "full recovery starting point" },
      { label: "WAL", input: "101 then 102", output: "continuous replay chain" },
    ],
    runtime: {
      minimumCodeLength: 620,
      requiredPatterns: [{ pattern: "artifact_type\\s+IN\\s*\\(\\s*'base'\\s*,\\s*'wal'", flags: "i", name: "Constrains artifact roles", hint: "Keep the base/WAL CHECK." }],
      sqlTests: [
        { name: "Recovery chain columns are exact", kind: "result-columns", columns: ["sequence_no","artifact_type","artifact_name"], hint: "Keep the final projection." },
        { name: "Recovery sequence is continuous", kind: "result-ordered-values", column: "sequence_no", expected: [100,101,102], hint: "Insert the base followed by both WAL artifacts." },
        { name: "Every artifact is verified and immutable", kind: "database-value", query: "SELECT count(*)::int AS count FROM recovery_chain WHERE verified AND immutable_copy", column: "count", expected: 3, hint: "Mark all three artifacts verified and immutable." },
      ],
    },
  };

  if (topic.title === "Monitoring") return {
    ...sqlBase,
    title: "Database SLI window mission",
    instructions: "Create db_sli_samples with sampled_at timestamptz primary key, transactions_total nonnegative, errors_total nonnegative, p95_ms positive, blocked_sessions nonnegative, and replica_lag_seconds nonnegative. Insert 10:00 totals 1000/10 p95 80 blocked 0 lag 1 and 10:05 totals 1600/16 p95 120 blocked 2 lag 4 on 2026-08-01. Use LAG in a CTE to return sampled_at, transactions_delta, errors_delta, p95_ms, blocked_sessions, and replica_lag_seconds for the second sample only.",
    starterCode: "CREATE TABLE db_sli_samples (\n  sampled_at timestamptz PRIMARY KEY,\n  transactions_total bigint NOT NULL CHECK (transactions_total >= 0),\n  errors_total bigint NOT NULL CHECK (errors_total >= 0),\n  p95_ms numeric NOT NULL CHECK (p95_ms > 0),\n  blocked_sessions integer NOT NULL CHECK (blocked_sessions >= 0),\n  replica_lag_seconds integer NOT NULL CHECK (replica_lag_seconds >= 0)\n);\n\n/* TODO: insert the 10:00 and 10:05 cumulative samples. */\n\nWITH rates AS (\n  SELECT *,\n         transactions_total-lag(transactions_total) OVER (ORDER BY sampled_at) AS transactions_delta,\n         errors_total-lag(errors_total) OVER (ORDER BY sampled_at) AS errors_delta\n  FROM db_sli_samples\n)\nSELECT sampled_at, transactions_delta, errors_delta, p95_ms, blocked_sessions, replica_lag_seconds\nFROM rates\nWHERE transactions_delta IS NOT NULL;\n",
    visibleExamples: [
      { label: "RATE WINDOW", input: "1600 minus 1000", output: "600 transactions in five minutes" },
      { label: "ERRORS", input: "16 minus 10", output: "6 errors in five minutes" },
    ],
    runtime: {
      minimumCodeLength: 860,
      requiredPatterns: [{ pattern: "lag\\s*\\(", flags: "i", name: "Converts cumulative counters", hint: "Keep both LAG window expressions." }, { pattern: "transactions_delta\\s+IS\\s+NOT\\s+NULL", flags: "i", name: "Returns a complete window", hint: "Filter out the first baseline sample." }],
      sqlTests: [
        { name: "Monitoring result columns are exact", kind: "result-columns", columns: ["sampled_at","transactions_delta","errors_delta","p95_ms","blocked_sessions","replica_lag_seconds"], hint: "Keep the final projection." },
        { name: "Transaction delta is exact", kind: "result-value", column: "transactions_delta", expected: 600, hint: "Insert totals 1000 then 1600." },
        { name: "Error delta is exact", kind: "result-value", column: "errors_delta", expected: 6, hint: "Insert error totals 10 then 16." },
      ],
    },
  };

  return null;
}
