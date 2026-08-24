import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundSeventeenPythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Systems Frontier") return {
    title: "Systems Frontier Python project",
    instructions: "Implement build_system_blueprint(service, operations, partitions). service must be a lowercase slug of letters, digits, and hyphens; partitions must be an integer non-boolean from 1 to 64. operations is an iterable of dictionaries with nonblank operation_id, tenant_id, kind read or write, partition_key, and for writes a nonblank idempotency_key. Reject duplicate operation_id or duplicate write idempotency keys. Route each operation deterministically with sum(partition_key.encode('utf-8')) % partitions. Return service, partitions, routes as an immutable tuple of dictionaries containing operation_id, tenant_id, kind, partition, and idempotency_key (None for reads), plus patterns ('strategy','adapter','unit-of-work','outbox'), package_policy ('public-api','semantic-versioning','optional-dependencies','supply-chain'), open_source_policy ('license','governance','security','releases'), specialization_policy ('depth','evidence','measurement','transfer'), and max_inflight equal to max(4, partitions*4). Do not mutate inputs or use hash().",
    starterCode: "import re\n\ndef build_system_blueprint(service, operations, partitions):\n    # TODO: validate boundaries, create deterministic routes, and return policy evidence.\n    return {}\n",
    visibleExamples: [
      { label: "ROUTING", input: "partition_key='acme', partitions=4", output: "sum(b'acme') % 4" },
      { label: "RETRY SAFETY", input: "two writes with idempotency_key='same'", output: "ValueError" },
    ],
    runtime: {
      minimumCodeLength: 760,
      requiredPatterns: [
        { pattern: "encode\\s*\\(\\s*['\"]utf-8['\"]", flags: "im", name: "Uses stable byte routing", hint: "Route with the sum of UTF-8 bytes rather than hash()." },
        { pattern: "idempotency", flags: "im", name: "Protects retried writes", hint: "Validate and deduplicate write idempotency keys." },
        { pattern: "tuple\\s*\\(", flags: "im", name: "Returns immutable routes", hint: "Materialize routes as a tuple." },
      ],
      pythonTests: [
        { name: "Blueprint routes and policies are exact", code: "ops=[{'operation_id':'op-1','tenant_id':'t1','kind':'write','partition_key':'acme','idempotency_key':'idem-1'},{'operation_id':'op-2','tenant_id':'t1','kind':'read','partition_key':'beta'}]; original=[dict(x) for x in ops]; r=build_system_blueprint('relay-api',ops,4); assert r['service']=='relay-api' and r['partitions']==4 and isinstance(r['routes'],tuple) and r['routes'][0]=={'operation_id':'op-1','tenant_id':'t1','kind':'write','partition':sum(b'acme')%4,'idempotency_key':'idem-1'} and r['routes'][1]['idempotency_key'] is None and r['patterns']==('strategy','adapter','unit-of-work','outbox') and r['package_policy']==('public-api','semantic-versioning','optional-dependencies','supply-chain') and r['open_source_policy']==('license','governance','security','releases') and r['specialization_policy']==('depth','evidence','measurement','transfer') and r['max_inflight']==16 and ops==original", hint: "Build exact immutable evidence without changing operation dictionaries." },
        { name: "Routing is deterministic and order preserving", code: "ops=({'operation_id':str(i),'tenant_id':'t','kind':'read','partition_key':k} for i,k in enumerate(('a','zz','a'))); r=build_system_blueprint('svc',ops,3); assert [x['operation_id'] for x in r['routes']]==['0','1','2'] and [x['partition'] for x in r['routes']]==[sum(k.encode('utf-8'))%3 for k in ('a','zz','a')]", hint: "Consume any iterable once and preserve input order." },
        { name: "Ambiguous retries and invalid boundaries fail", code: "bad=[('Bad Name',[],2),('ok',[],True),('ok',[],0),('ok',[{'operation_id':'1','tenant_id':'t','kind':'write','partition_key':'p','idempotency_key':'x'},{'operation_id':'2','tenant_id':'t','kind':'write','partition_key':'q','idempotency_key':'x'}],2),('ok',[{'operation_id':'1','tenant_id':'t','kind':'delete','partition_key':'p'}],2)];\nfor args in bad:\n try:\n  build_system_blueprint(*args); assert False\n except (TypeError,ValueError): pass", hint: "Validate slug, partition count, operation kind, required fields, and both uniqueness rules." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Distributed systems") return {
    title: "Idempotent delivery reconciliation mission",
    instructions: "Implement reconcile_deliveries(deliveries). Each dictionary requires nonblank operation_id, attempt integer non-boolean >=1, outcome in committed/rejected/unknown, and payload_digest nonblank. Reject conflicting digests for one operation. For each operation, keep the highest-attempt record (reject duplicate attempt numbers), then return committed, rejected, and retry as sorted operation-id tuples, attempts as an operation-id-sorted dictionary of highest attempts, and retry_budget equal to three times the number of retry operations. unknown belongs to retry. Do not mutate input.",
    starterCode: "def reconcile_deliveries(deliveries):\n    # TODO: deduplicate attempts and classify definite versus unknown outcomes.\n    return {}\n",
    visibleExamples: [{ label: "UNKNOWN", input: "attempt 2 timed out", output: "operation appears in retry" }, { label: "CONFLICT", input: "same operation, different digest", output: "ValueError" }],
    runtime: {
      minimumCodeLength: 470,
      requiredPatterns: [{ pattern: "operation_id", flags: "im", name: "Keys delivery identity", hint: "Group all attempts by operation_id." }, { pattern: "payload_digest", flags: "im", name: "Detects conflicting retry payloads", hint: "One operation may not change payload across retries." }],
      pythonTests: [
        { name: "Latest outcomes are reconciled exactly", code: "rows=[{'operation_id':'b','attempt':1,'outcome':'unknown','payload_digest':'d2'},{'operation_id':'a','attempt':1,'outcome':'unknown','payload_digest':'d1'},{'operation_id':'a','attempt':2,'outcome':'committed','payload_digest':'d1'},{'operation_id':'c','attempt':1,'outcome':'rejected','payload_digest':'d3'}]; copy=[dict(x) for x in rows]; r=reconcile_deliveries(rows); assert r=={'committed':('a',),'rejected':('c',),'retry':('b',),'attempts':{'a':2,'b':1,'c':1},'retry_budget':3} and rows==copy", hint: "The greatest attempt determines current state; sort all identity output." },
        { name: "Conflicts and malformed attempts fail", code: "for rows in ([{'operation_id':'a','attempt':1,'outcome':'unknown','payload_digest':'x'},{'operation_id':'a','attempt':1,'outcome':'committed','payload_digest':'x'}],[{'operation_id':'a','attempt':1,'outcome':'unknown','payload_digest':'x'},{'operation_id':'a','attempt':2,'outcome':'unknown','payload_digest':'y'}],[{'operation_id':'','attempt':True,'outcome':'bad','payload_digest':''}]):\n try: reconcile_deliveries(rows); assert False\n except (TypeError,ValueError): pass", hint: "Reject duplicate attempts, digest conflicts, blank identity, booleans, and unknown outcomes." },
      ],
    },
  };

  if (topic.title === "Design patterns") return {
    title: "Strategy and adapter dispatch mission",
    instructions: "Implement dispatch_commands(commands, strategies, adapter). strategies maps kind to a callable accepting a normalized command. adapter must expose normalize(command). Normalize every command once, require a nonblank operation_id and a registered nonblank kind, reject duplicate operation IDs, then call the selected strategy in input order. Return an immutable tuple of {'operation_id','kind','result'} dictionaries. Reject non-callable strategies. Do not catch strategy exceptions or mutate inputs.",
    starterCode: "def dispatch_commands(commands, strategies, adapter):\n    # TODO: adapt input, select policy, and preserve failure semantics.\n    return ()\n",
    visibleExamples: [{ label: "ADAPTER", input: "vendor command", output: "normalized domain command" }, { label: "STRATEGY", input: "kind='price'", output: "registered price policy" }],
    runtime: {
      minimumCodeLength: 370,
      requiredPatterns: [{ pattern: "adapter\\.normalize", flags: "im", name: "Translates external commands", hint: "Normalize each command exactly once." }, { pattern: "strategies", flags: "im", name: "Selects replaceable policy", hint: "Look up a callable by normalized kind." }],
      pythonTests: [
        { name: "Adapter and strategies collaborate in order", code: "events=[]\nclass A:\n def normalize(self,c): events.append(('adapt',c['id'])); return {'operation_id':c['id'],'kind':c['type'],'value':c['value']}\ndef double(c): events.append(('run',c['operation_id'])); return c['value']*2\nr=dispatch_commands([{'id':'2','type':'double','value':3},{'id':'1','type':'double','value':4}],{'double':double},A()); assert r==({'operation_id':'2','kind':'double','result':6},{'operation_id':'1','kind':'double','result':8}) and events==[('adapt','2'),('run','2'),('adapt','1'),('run','1')]", hint: "Adapt and dispatch one command at a time in input order." },
        { name: "Invalid registry and duplicate identity fail", code: "class A:\n def normalize(self,c): return c\nfor cmds,s in [([{'operation_id':'1','kind':'x'},{'operation_id':'1','kind':'x'}],{'x':lambda c:1}),([{'operation_id':'1','kind':'missing'}],{}),([{'operation_id':'1','kind':'x'}],{'x':3})]:\n try: dispatch_commands(cmds,s,A()); assert False\n except (TypeError,ValueError,KeyError): pass", hint: "Validate normalized identity, available kind, uniqueness, and callable strategies." },
      ],
    },
  };

  if (topic.title === "Package design") return {
    title: "Release manifest boundary mission",
    instructions: "Implement validate_release_manifest(manifest). Require an exact semantic version MAJOR.MINOR.PATCH, nonblank license, public_api as a nonempty iterable of dotted identifiers with no leading underscore segment, dependencies and optional_dependencies as mappings from name to nonblank version constraint, and attestations containing both sbom and provenance. Reject a dependency appearing in core and optional mappings or mutation of inputs. Return version, major integer, public_api sorted tuple, core_dependencies sorted tuple of names, optional_groups as a sorted tuple of (group, sorted dependency-name tuple), and supply_chain_ready True.",
    starterCode: "import re\n\ndef validate_release_manifest(manifest):\n    # TODO: validate the compatibility and supply-chain contract.\n    return {}\n",
    visibleExamples: [{ label: "VERSION", input: "2.4.1", output: "major 2" }, { label: "PUBLIC API", input: "codecraft.client", output: "supported import path" }],
    runtime: {
      minimumCodeLength: 600,
      requiredPatterns: [{ pattern: "re\\.", flags: "im", name: "Validates semantic version and names", hint: "Use full matching rather than substring matching." }, { pattern: "attest", flags: "im", name: "Checks release evidence", hint: "Require SBOM and provenance attestations." }],
      pythonTests: [
        { name: "Release contract is normalized exactly", code: "m={'version':'2.4.1','license':'Apache-2.0','public_api':['codecraft.client','codecraft.Model'],'dependencies':{'httpx':'>=1'},'optional_dependencies':{'sql':{'pglite':'>=1'},'ai':{'openai':'>=2'}},'attestations':['provenance','sbom']}; r=validate_release_manifest(m); assert r=={'version':'2.4.1','major':2,'public_api':('codecraft.Model','codecraft.client'),'core_dependencies':('httpx',),'optional_groups':(('ai',('openai',)),('sql',('pglite',))),'supply_chain_ready':True}", hint: "Sort every exported collection and preserve exact version metadata." },
        { name: "Broken compatibility or trust metadata fails", code: "base={'version':'1.0.0','license':'MIT','public_api':['pkg.api'],'dependencies':{},'optional_dependencies':{},'attestations':['sbom','provenance']}\nfor key,value in [('version','1.0'),('license',''),('public_api',['pkg._secret']),('attestations',['sbom'])]:\n m=dict(base); m[key]=value\n try: validate_release_manifest(m); assert False\n except (TypeError,ValueError): pass\nm=dict(base); m['dependencies']={'x':'>=1'}; m['optional_dependencies']={'extra':{'x':'>=2'}}\ntry: validate_release_manifest(m); assert False\nexcept (TypeError,ValueError): pass", hint: "Enforce SemVer, public names, distinct dependency ownership, and both attestations." },
      ],
    },
  };

  if (topic.title === "Open source") return {
    title: "Contribution governance triage mission",
    instructions: "Implement triage_contributions(items, policy). policy requires license, governance, security_channel, and max_patch_lines positive integer non-boolean. Each item requires id, kind issue/patch/security, lines nonnegative integer, tests boolean, docs boolean. Security items always route private-security. Oversized patches route discuss-first. Other patches with tests and docs route review; incomplete patches route needs-evidence; issues route triage. Return routes as an id-sorted tuple of {'id','route'} and policy_ready True only when all policy strings are nonblank. Reject duplicate IDs and do not mutate inputs.",
    starterCode: "def triage_contributions(items, policy):\n    # TODO: apply governance and coordinated-disclosure rules.\n    return {}\n",
    visibleExamples: [{ label: "SECURITY", input: "vulnerability report", output: "private-security" }, { label: "LARGE PATCH", input: "lines > max_patch_lines", output: "discuss-first" }],
    runtime: {
      minimumCodeLength: 440,
      requiredPatterns: [{ pattern: "private-security", flags: "im", name: "Protects coordinated disclosure", hint: "Route every security item privately." }, { pattern: "max_patch_lines", flags: "im", name: "Applies review scope policy", hint: "Large patches need prior discussion." }],
      pythonTests: [
        { name: "Governance routes are exact", code: "p={'license':'MIT','governance':'maintainers','security_channel':'security@example.test','max_patch_lines':100}; items=[{'id':'4','kind':'issue','lines':0,'tests':False,'docs':False},{'id':'2','kind':'patch','lines':20,'tests':True,'docs':True},{'id':'1','kind':'security','lines':0,'tests':False,'docs':False},{'id':'3','kind':'patch','lines':101,'tests':True,'docs':True},{'id':'5','kind':'patch','lines':10,'tests':False,'docs':True}]; assert triage_contributions(items,p)=={'routes':({'id':'1','route':'private-security'},{'id':'2','route':'review'},{'id':'3','route':'discuss-first'},{'id':'4','route':'triage'},{'id':'5','route':'needs-evidence'}),'policy_ready':True}", hint: "Apply security before size, then evidence rules, and sort by id." },
        { name: "Invalid policy and duplicate IDs fail", code: "for items,p in [([],{'license':'','governance':'g','security_channel':'s','max_patch_lines':1}),([{'id':'x','kind':'issue','lines':0,'tests':False,'docs':False}]*2,{'license':'l','governance':'g','security_channel':'s','max_patch_lines':1})]:\n try: triage_contributions(items,p); assert False\n except (TypeError,ValueError): pass", hint: "Require complete policy metadata and unique contribution identities." },
      ],
    },
  };

  if (topic.title === "Specialization") return {
    title: "Evidence-based specialization mission",
    instructions: "Implement build_specialization_plan(domain, capabilities, artifacts). Require a nonblank lowercase-hyphen domain, exactly three distinct nonblank capabilities, and artifacts as dictionaries with nonblank name, capability matching one requested capability, kind lab/project/report/contribution, and measured boolean. Return domain, capabilities as a sorted tuple, evidence as an artifact-name-sorted tuple, covered_capabilities sorted, gaps sorted, measured_count, and ready True only when every capability is covered and at least two artifacts are measured. Reject duplicate artifact names and do not mutate inputs.",
    starterCode: "import re\n\ndef build_specialization_plan(domain, capabilities, artifacts):\n    # TODO: turn a learning direction into measurable evidence.\n    return {}\n",
    visibleExamples: [{ label: "DEPTH", input: "three domain capabilities", output: "each needs evidence" }, { label: "READY", input: "all covered and two measured artifacts", output: "True" }],
    runtime: {
      minimumCodeLength: 500,
      requiredPatterns: [{ pattern: "covered", flags: "im", name: "Maps evidence to capabilities", hint: "Compute covered capabilities and remaining gaps." }, { pattern: "measured", flags: "im", name: "Requires observable outcomes", hint: "Count artifacts with measured True." }],
      pythonTests: [
        { name: "Specialization readiness uses evidence", code: "a=[{'name':'latency-report','capability':'performance','kind':'report','measured':True},{'name':'service','capability':'architecture','kind':'project','measured':True},{'name':'upstream-fix','capability':'community','kind':'contribution','measured':False}]; r=build_specialization_plan('backend-systems',['performance','architecture','community'],a); assert r['domain']=='backend-systems' and r['capabilities']==('architecture','community','performance') and r['covered_capabilities']==('architecture','community','performance') and r['gaps']==() and r['measured_count']==2 and r['ready'] is True and [x['name'] for x in r['evidence']]==['latency-report','service','upstream-fix']", hint: "Sort names and compute readiness from complete coverage plus measured outcomes." },
        { name: "Evidence gaps remain visible", code: "r=build_specialization_plan('data-platform',['sql','recovery','pipelines'],[{'name':'lab','capability':'sql','kind':'lab','measured':True}]); assert r['covered_capabilities']==('sql',) and r['gaps']==('pipelines','recovery') and r['ready'] is False", hint: "Do not hide capabilities without an artifact." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["tenant_workloads · architecture decision inputs", "tenant_resources · isolation-safe records", "migration_steps · compatibility sequence", "architecture_components · authoritative and derived stores"] };

export function buildRoundSeventeenSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Architecture Frontier") return {
    ...sqlBase,
    title: "Architecture Frontier SQL project",
    instructions: "Create architecture_decisions with component primary key, store_kind restricted to sql/document/search/queue, authoritative boolean, consistency restricted to strong/eventual, rpo_minutes nonnegative, and rto_minutes positive. Insert ledger/sql/true/strong/0/15, catalog/document/true/strong/5/30, product-search/search/false/eventual/60/120, and events/queue/false/eventual/5/30. Create tenant_records with tenant_id and record_id, external_key and payload jsonb, composite primary key (tenant_id,record_id), and tenant-scoped unique (tenant_id,external_key); insert three rows spanning tenants 10 and 20. Create migration_steps with phase primary key and sequence unique positive, phase restricted to expand/backfill/validate/cutover/contract, reversible boolean; insert all five in order with only contract false. Return component, store_kind, consistency, rpo_minutes, rto_minutes for derived components only ordered by component.",
    starterCode: "CREATE TABLE architecture_decisions (\n  component text PRIMARY KEY,\n  store_kind text NOT NULL /* TODO: allowed stores */,\n  authoritative boolean NOT NULL,\n  consistency text NOT NULL /* TODO: allowed models */,\n  rpo_minutes integer NOT NULL /* TODO: nonnegative */,\n  rto_minutes integer NOT NULL /* TODO: positive */\n);\n/* TODO: insert four architecture decisions. */\n\nCREATE TABLE tenant_records (\n  tenant_id bigint NOT NULL,\n  record_id bigint NOT NULL,\n  external_key text NOT NULL,\n  payload jsonb NOT NULL,\n  /* TODO: tenant-safe primary and unique keys */\n);\n/* TODO: insert tenant 10 records 1 and 2, plus tenant 20 record 1. */\n\nCREATE TABLE migration_steps (\n  phase text PRIMARY KEY,\n  sequence integer NOT NULL UNIQUE CHECK (sequence > 0),\n  reversible boolean NOT NULL\n);\n/* TODO: insert expand, backfill, validate, cutover, contract in order. */\n\nSELECT component,store_kind,consistency,rpo_minutes,rto_minutes\nFROM architecture_decisions\nWHERE NOT authoritative\nORDER BY component;\n",
    visibleExamples: [{ label: "DERIVED", input: "events and product-search", output: "eventual stores with explicit recovery objectives" }, { label: "TENANT KEY", input: "record 1 in tenants 10 and 20", output: "both valid and isolated" }],
    runtime: {
      minimumCodeLength: 1250,
      requiredPatterns: [
        { pattern: "PRIMARY\\s+KEY\\s*\\(\\s*tenant_id\\s*,\\s*record_id\\s*\\)", flags: "i", name: "Scopes identity by tenant", hint: "Use the composite tenant and record primary key." },
        { pattern: "UNIQUE\\s*\\(\\s*tenant_id\\s*,\\s*external_key\\s*\\)", flags: "i", name: "Scopes external uniqueness", hint: "The same external key may exist in different tenants." },
        { pattern: "expand[\\s\\S]*backfill[\\s\\S]*validate[\\s\\S]*cutover[\\s\\S]*contract", flags: "i", name: "Records the compatible migration sequence", hint: "Insert every phase in order." },
      ],
      sqlTests: [
        { name: "Derived architecture result is exact", kind: "result-columns", columns: ["component","store_kind","consistency","rpo_minutes","rto_minutes"], hint: "Keep the final projection unchanged." },
        { name: "Derived components are ordered", kind: "result-ordered-values", column: "component", expected: ["events","product-search"], hint: "Mark only queue and search as derived." },
        { name: "Tenant records preserve scoped identity", kind: "database-value", query: "SELECT count(*)::int AS count FROM tenant_records WHERE record_id=1", column: "count", expected: 2, hint: "Insert record 1 for both tenant 10 and tenant 20." },
        { name: "Migration phases are complete", kind: "database-value", query: "SELECT count(*)::int AS count FROM migration_steps", column: "count", expected: 5, hint: "Insert all five compatibility phases." },
        { name: "Only destructive contract is irreversible", kind: "database-value", query: "SELECT count(*)::int AS count FROM migration_steps WHERE NOT reversible AND phase='contract'", column: "count", expected: 1, hint: "Mark expand through cutover reversible and contract irreversible." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "SQL vs NoSQL") return {
    ...sqlBase,
    title: "Workload-driven datastore decision mission",
    instructions: "Create datastore_decisions with workload primary key, requires_multi_record_tx boolean, requires_joins boolean, document_shaped boolean, full_text boolean, chosen_store restricted to sql/document/search, and rationale nonblank. Insert billing true/true/false/false/sql; product-content false/false/true/false/document; discovery false/false/true/true/search. Return chosen_store, workload_count, transactional_count, and full_text_count grouped and ordered by chosen_store.",
    starterCode: "CREATE TABLE datastore_decisions (\n  workload text PRIMARY KEY,\n  requires_multi_record_tx boolean NOT NULL,\n  requires_joins boolean NOT NULL,\n  document_shaped boolean NOT NULL,\n  full_text boolean NOT NULL,\n  chosen_store text NOT NULL CHECK (chosen_store IN ('sql','document','search')),\n  rationale text NOT NULL CHECK (btrim(rationale) <> '')\n);\n/* TODO: insert billing, product-content, and discovery decisions. */\n\nSELECT chosen_store,count(*)::int AS workload_count,\n       count(*) FILTER (WHERE requires_multi_record_tx)::int AS transactional_count,\n       count(*) FILTER (WHERE full_text)::int AS full_text_count\nFROM datastore_decisions\nGROUP BY chosen_store\nORDER BY chosen_store;\n",
    visibleExamples: [{ label: "BILLING", input: "transactions and joins", output: "sql" }, { label: "DISCOVERY", input: "full text retrieval", output: "search" }],
    runtime: {
      minimumCodeLength: 730,
      requiredPatterns: [{ pattern: "FILTER\\s*\\(\\s*WHERE\\s+requires_multi_record_tx", flags: "i", name: "Summarizes invariant pressure", hint: "Keep the transactional filtered aggregate." }],
      sqlTests: [
        { name: "Decision summary columns are exact", kind: "result-columns", columns: ["chosen_store","workload_count","transactional_count","full_text_count"], hint: "Keep all four aliases." },
        { name: "Store choices are ordered", kind: "result-ordered-values", column: "chosen_store", expected: ["document","search","sql"], hint: "Use each requested store exactly once." },
        { name: "Billing retains relational invariants", kind: "database-value", query: "SELECT count(*)::int AS count FROM datastore_decisions WHERE workload='billing' AND chosen_store='sql' AND requires_multi_record_tx AND requires_joins", column: "count", expected: 1, hint: "Insert the exact billing requirements." },
      ],
    },
  };

  if (topic.title === "Multi-tenancy") return {
    ...sqlBase,
    title: "Tenant-safe relational boundary mission",
    instructions: "Create tenant_accounts with tenant_id and account_id, email, plan, composite primary key (tenant_id,account_id), and unique (tenant_id,email). Create tenant_resources with tenant_id and resource_id, account_id, name, composite primary key (tenant_id,resource_id), and composite foreign key (tenant_id,account_id) referencing tenant_accounts. Insert accounts (10,1,a@example.test,pro), (20,1,a@example.test,free), and resources (10,100,1,Alpha), (20,200,1,Beta). Return tenant_id, account_id, email, resource_count with a tenant-safe LEFT JOIN, grouped and ordered by tenant_id,account_id.",
    starterCode: "CREATE TABLE tenant_accounts (\n  tenant_id bigint NOT NULL,\n  account_id bigint NOT NULL,\n  email text NOT NULL,\n  plan text NOT NULL,\n  /* TODO: tenant-scoped identity and email uniqueness */\n);\nCREATE TABLE tenant_resources (\n  tenant_id bigint NOT NULL,\n  resource_id bigint NOT NULL,\n  account_id bigint NOT NULL,\n  name text NOT NULL,\n  /* TODO: tenant-scoped identity and account relationship */\n);\n/* TODO: insert both tenants and one resource for each. */\n\nSELECT a.tenant_id,a.account_id,a.email,count(r.resource_id)::int AS resource_count\nFROM tenant_accounts a\nLEFT JOIN tenant_resources r\n  ON r.tenant_id=a.tenant_id AND r.account_id=a.account_id\nGROUP BY a.tenant_id,a.account_id,a.email\nORDER BY a.tenant_id,a.account_id;\n",
    visibleExamples: [{ label: "SHARED EMAIL", input: "a@example.test in tenants 10 and 20", output: "valid twice" }, { label: "FOREIGN KEY", input: "resource tenant must match account tenant", output: "database enforced" }],
    runtime: {
      minimumCodeLength: 850,
      requiredPatterns: [{ pattern: "FOREIGN\\s+KEY\\s*\\(\\s*tenant_id\\s*,\\s*account_id", flags: "i", name: "Prevents cross-tenant references", hint: "Use one composite foreign key." }, { pattern: "r\\.tenant_id\\s*=\\s*a\\.tenant_id", flags: "i", name: "Joins inside tenant boundary", hint: "Include tenant_id in the join predicate." }],
      sqlTests: [
        { name: "Tenant summary columns are exact", kind: "result-columns", columns: ["tenant_id","account_id","email","resource_count"], hint: "Keep the final aliases." },
        { name: "Both tenants remain isolated", kind: "result-ordered-values", column: "tenant_id", expected: [10,20], hint: "Insert and return both tenant accounts." },
        { name: "Composite foreign key exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.table_constraints WHERE table_name='tenant_resources' AND constraint_type='FOREIGN KEY'", column: "count", expected: 1, hint: "Declare the composite account relationship." },
      ],
    },
  };

  if (topic.title === "Zero-downtime migrations") return {
    ...sqlBase,
    title: "Expand-backfill-contract migration mission",
    instructions: "Create customer_profiles with customer_id primary key and full_name nonblank, then insert Ada Lovelace and Grace Hopper. Expand by adding given_name and family_name as nullable text. Backfill both rows exactly. Add CHECK constraints named customer_given_name_ready and customer_family_name_ready using NOT VALID, then VALIDATE both. Create migration_audit with phase primary key, sequence unique, completed boolean; insert expand/backfill/validate/cutover/contract in order with contract false and all prior phases true. Return customer_id,given_name,family_name ordered by customer_id. Do not drop full_name.",
    starterCode: "CREATE TABLE customer_profiles (customer_id bigint PRIMARY KEY, full_name text NOT NULL CHECK (btrim(full_name) <> ''));\nINSERT INTO customer_profiles VALUES (1,'Ada Lovelace'),(2,'Grace Hopper');\n\n/* TODO: expand with nullable given_name and family_name. */\n/* TODO: backfill exact names. */\n/* TODO: add named NOT VALID checks, then validate them. */\n\nCREATE TABLE migration_audit (phase text PRIMARY KEY, sequence integer NOT NULL UNIQUE, completed boolean NOT NULL);\n/* TODO: record five phases; contract remains incomplete. */\n\nSELECT customer_id,given_name,family_name FROM customer_profiles ORDER BY customer_id;\n",
    visibleExamples: [{ label: "COMPATIBILITY", input: "old full_name reader", output: "continues to work" }, { label: "CONTRACT", input: "old column removal", output: "deferred to later release" }],
    runtime: {
      minimumCodeLength: 900,
      requiredPatterns: [{ pattern: "NOT\\s+VALID", flags: "i", name: "Adds constraints before scanning old rows", hint: "Create both named checks as NOT VALID." }, { pattern: "VALIDATE\\s+CONSTRAINT", flags: "i", name: "Verifies backfilled rows", hint: "Validate both readiness constraints after backfill." }],
      sqlTests: [
        { name: "Migrated profile columns are exact", kind: "result-columns", columns: ["customer_id","given_name","family_name"], hint: "Keep the final projection." },
        { name: "Given names are backfilled", kind: "result-ordered-values", column: "given_name", expected: ["Ada","Grace"], hint: "Backfill both rows before validation." },
        { name: "Compatibility column remains", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.columns WHERE table_name='customer_profiles' AND column_name='full_name'", column: "count", expected: 1, hint: "Do not contract the old representation in this release." },
        { name: "Only contract remains incomplete", kind: "database-value", query: "SELECT count(*)::int AS count FROM migration_audit WHERE NOT completed AND phase='contract'", column: "count", expected: 1, hint: "Complete expand through cutover but defer contract." },
      ],
    },
  };

  if (topic.title === "Database architecture") return {
    ...sqlBase,
    title: "Authoritative data-flow architecture mission",
    instructions: "Create architecture_components with component primary key, role restricted to source/derived/transport, authoritative boolean, consistency strong/eventual, rpo_minutes nonnegative, rto_minutes positive, and CHECK that role source equals authoritative. Insert orders-db/source/true/strong/0/15, event-stream/transport/false/eventual/5/30, search-index/derived/false/eventual/60/120, and warehouse/derived/false/eventual/1440/480. Create data_flows with source_component and target_component foreign keys, replayable boolean, deletion_propagates boolean, and composite primary key. Insert orders-db to event-stream true/true, event-stream to search-index true/true, event-stream to warehouse true/true. Return target component, consistency, rpo and rto for derived components ordered by component.",
    starterCode: "CREATE TABLE architecture_components (\n  component text PRIMARY KEY,\n  role text NOT NULL CHECK (role IN ('source','derived','transport')),\n  authoritative boolean NOT NULL,\n  consistency text NOT NULL CHECK (consistency IN ('strong','eventual')),\n  rpo_minutes integer NOT NULL CHECK (rpo_minutes >= 0),\n  rto_minutes integer NOT NULL CHECK (rto_minutes > 0),\n  /* TODO: source role must exactly match authority */\n);\nCREATE TABLE data_flows (\n  source_component text NOT NULL REFERENCES architecture_components(component),\n  target_component text NOT NULL REFERENCES architecture_components(component),\n  replayable boolean NOT NULL,\n  deletion_propagates boolean NOT NULL,\n  PRIMARY KEY (source_component,target_component)\n);\n/* TODO: insert four components and three replayable deletion-safe flows. */\n\nSELECT component,consistency,rpo_minutes,rto_minutes\nFROM architecture_components\nWHERE role='derived'\nORDER BY component;\n",
    visibleExamples: [{ label: "AUTHORITY", input: "orders-db", output: "only source of truth" }, { label: "REPLAY", input: "search-index loss", output: "rebuild from event-stream" }],
    runtime: {
      minimumCodeLength: 980,
      requiredPatterns: [{ pattern: "CHECK\\s*\\(\\s*\\(\\s*role\\s*=\\s*'source'\\s*\\)\\s*=\\s*authoritative", flags: "i", name: "Protects authority semantics", hint: "Use a boolean equality CHECK for role and authority." }, { pattern: "REFERENCES\\s+architecture_components", flags: "i", name: "Connects only known components", hint: "Both flow endpoints reference the component catalog." }],
      sqlTests: [
        { name: "Derived architecture columns are exact", kind: "result-columns", columns: ["component","consistency","rpo_minutes","rto_minutes"], hint: "Keep the final projection." },
        { name: "Derived systems are ordered", kind: "result-ordered-values", column: "component", expected: ["search-index","warehouse"], hint: "Mark search and warehouse as derived." },
        { name: "One source of truth exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM architecture_components WHERE authoritative", column: "count", expected: 1, hint: "Only orders-db is authoritative." },
        { name: "Every flow is replayable and deletion-safe", kind: "database-value", query: "SELECT count(*)::int AS count FROM data_flows WHERE replayable AND deletion_propagates", column: "count", expected: 3, hint: "Insert all three required flow guarantees." },
      ],
    },
  };

  return null;
}
