import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundTwelvePythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Object Core") return {
    title: "Object Core Python project",
    instructions: "Complete BoundedPower, RelayMeta, Relay, and SolarRelay. BoundedPower must use __set_name__, return itself on class access, store per-instance values under a private name, and accept non-boolean int/float power from 0 through 100. RelayMeta.registry must register every concrete Relay subclass by a unique nonblank string kind and reject duplicates or missing kinds, while leaving the base Relay unregistered. Relay must expose name and descriptor-backed power, normalize a nonblank name, implement an unambiguous __repr__, value equality only with the same concrete type, and iteration yielding name then power. SolarRelay.kind must be 'solar'. Keep equal mutable relays unhashable.",
    starterCode: "class BoundedPower:\n    def __set_name__(self, owner, name):\n        # TODO: derive a private storage name.\n        pass\n\n    def __get__(self, instance, owner=None):\n        # TODO: support class and instance access.\n        pass\n\n    def __set__(self, instance, value):\n        # TODO: validate and store per-instance power.\n        pass\n\nclass RelayMeta(type):\n    registry = {}\n\n    def __new__(mcls, name, bases, namespace):\n        # TODO: create the class and register concrete kinds safely.\n        return super().__new__(mcls, name, bases, namespace)\n\nclass Relay(metaclass=RelayMeta):\n    kind = None\n    power = BoundedPower()\n\n    def __init__(self, name, power):\n        # TODO: normalize name and use the descriptor.\n        pass\n\n    # TODO: implement repr, equality, and iteration protocols.\n\nclass SolarRelay(Relay):\n    kind = 'solar'\n",
    visibleExamples: [
      { label: "PROTOCOLS", input: "SolarRelay(' Dawn ', 82)", output: "repr is diagnostic; tuple(relay) is ('Dawn',82)" },
      { label: "CLASS CREATION", input: "second subclass with kind solar", output: "ValueError during class definition" },
    ],
    runtime: {
      minimumCodeLength: 650,
      requiredPatterns: [
        { pattern: "def\\s+__set_name__", flags: "im", name: "Names descriptor storage", hint: "Derive a private key such as '_' + name." },
        { pattern: "def\\s+__get__", flags: "im", name: "Implements descriptor reads", hint: "Return self when instance is None, otherwise the stored value." },
        { pattern: "class\\s+RelayMeta\\s*\\(\\s*type\\s*\\)", flags: "im", name: "Controls class creation", hint: "Keep RelayMeta as a type subclass." },
        { pattern: "def\\s+__(?:repr|eq|iter)__", flags: "im", name: "Integrates with object protocols", hint: "Implement __repr__, __eq__, and __iter__ on Relay." },
      ],
      pythonTests: [
        { name: "Descriptor and dunder protocols work", code: "r=SolarRelay(' Dawn ',82); assert r.name=='Dawn' and r.power==82 and tuple(r)==('Dawn',82) and 'SolarRelay' in repr(r) and 'Dawn' in repr(r) and SolarRelay.power is Relay.__dict__['power']", hint: "Normalize name, assign via the descriptor, yield two values, and return the descriptor on class access." },
        { name: "Equality is typed and relays stay unhashable", code: "a=SolarRelay('Dawn',82); b=SolarRelay('Dawn',82); assert a==b and not (a==('Dawn',82))\ntry:\n    hash(a); assert False\nexcept TypeError:\n    pass", hint: "Compare only the same concrete type and do not define a hash for mutable value equality." },
        { name: "Power and names are validated per instance", code: "a=SolarRelay('A',1); b=SolarRelay('B',2); a.power=99; assert a.power==99 and b.power==2\nfor value in (True,-1,101,'high'):\n    try:\n        a.power=value; assert False\n    except (TypeError,ValueError):\n        pass\ntry:\n    SolarRelay(' ',1); assert False\nexcept ValueError:\n    pass", hint: "Store on each instance and reject bool, nonnumeric, or out-of-range power and blank names." },
        { name: "Metaclass registry enforces unique concrete kinds", code: "assert RelayMeta.registry.get('solar') is SolarRelay and None not in RelayMeta.registry\ntry:\n    class DuplicateSolar(Relay): kind='solar'\n    assert False\nexcept ValueError:\n    pass\ntry:\n    class MissingKind(Relay): pass\n    assert False\nexcept ValueError:\n    pass", hint: "Register concrete subclasses only after validating their own kind declaration." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Object model") return {
    title: "Attribute-resolution trace mission",
    instructions: "Implement trace_attribute(obj, name). Require name to be a string. Return {'instance_has': bool, 'mro_definitions': tuple(class names), 'resolved': value}. instance_has checks obj.__dict__ without triggering lookup. mro_definitions lists every class in type(obj).__mro__ whose own __dict__ contains name, in MRO order. resolved must use getattr and therefore honor descriptors and fallback; propagate AttributeError when absent. Support objects without __dict__.",
    starterCode: "def trace_attribute(obj, name):\n    # TODO: inspect instance storage and each class namespace before resolving.\n    return {}\n",
    visibleExamples: [
      { label: "SHADOW", input: "instance x plus class x", output: "instance_has true; class still appears in definitions" },
      { label: "BINDING", input: "instance method", output: "resolved is a bound method" },
    ],
    runtime: {
      minimumCodeLength: 220,
      requiredPatterns: [
        { pattern: "type\\s*\\(\\s*obj\\s*\\)\\.__mro__", flags: "im", name: "Walks the method resolution order", hint: "Inspect type(obj).__mro__ in order." },
        { pattern: "__dict__", flags: "im", name: "Inspects namespaces directly", hint: "Use class and optional instance dictionaries without triggering lookup." },
        { pattern: "getattr\\s*\\(", flags: "im", name: "Performs real resolution", hint: "Resolve the final value with getattr(obj, name)." },
      ],
      pythonTests: [
        { name: "Instance and MRO origins are traced", code: "class Base: x='base'\nclass Child(Base): x='child'\nc=Child(); c.x='instance'; assert trace_attribute(c,'x')=={'instance_has':True,'mro_definitions':('Child','Base'),'resolved':'instance'}", hint: "Inspect each class own dictionary and the instance dictionary separately." },
        { name: "Method binding is preserved", code: "class A:\n    def ping(self): return 'pong'\na=A(); t=trace_attribute(a,'ping'); assert t['instance_has'] is False and t['mro_definitions']==('A',) and t['resolved']()=='pong' and t['resolved'].__self__ is a", hint: "Use getattr for the final result so the function descriptor binds." },
        { name: "Missing and invalid names fail naturally", code: "for name in (1,None):\n    try:\n        trace_attribute(object(),name); assert False\n    except TypeError:\n        pass\ntry:\n    trace_attribute(object(),'missing'); assert False\nexcept AttributeError:\n    pass", hint: "Validate name type and do not hide a missing attribute." },
      ],
    },
  };

  if (topic.title === "Dunder methods") return {
    title: "Relay sequence protocol mission",
    instructions: "Complete RelaySequence as an immutable-style wrapper around a copied tuple of nonblank normalized names. Implement __len__, __iter__, __contains__ with normalized string membership, __getitem__ supporting normal index/slice tuple behavior, __repr__ as RelaySequence(('A', 'B')), and __eq__ only against RelaySequence while returning NotImplemented for other types. Source mutations must not affect it.",
    starterCode: "class RelaySequence:\n    def __init__(self, names):\n        # TODO: validate, normalize, and snapshot.\n        pass\n\n    # TODO: implement length, iteration, membership, indexing, repr, and equality.\n",
    visibleExamples: [
      { label: "SEQUENCE", input: "RelaySequence([' A ','B'])", output: "len 2, index 0 A, slice ('A','B')" },
      { label: "MEMBERSHIP", input: "' A ' in sequence", output: "True after normalization" },
    ],
    runtime: {
      minimumCodeLength: 360,
      requiredPatterns: [
        { pattern: "def\\s+__len__", flags: "im", name: "Implements the sized protocol", hint: "Return the tuple length." },
        { pattern: "def\\s+__iter__", flags: "im", name: "Implements iteration", hint: "Return an iterator over the snapshot." },
        { pattern: "def\\s+__getitem__", flags: "im", name: "Implements sequence access", hint: "Delegate integer and slice access to the tuple." },
        { pattern: "NotImplemented", flags: "im", name: "Handles cross-type equality", hint: "Return NotImplemented for another type." },
      ],
      pythonTests: [
        { name: "All sequence protocols are coherent", code: "s=RelaySequence([' A ','B']); assert len(s)==2 and list(s)==['A','B'] and s[0]=='A' and s[:]==('A','B') and ' A ' in s and 'C' not in s and repr(s)==\"RelaySequence(('A', 'B'))\"", hint: "Snapshot as a tuple and delegate sequence operations consistently." },
        { name: "Equality is typed and source is isolated", code: "src=['A']; a=RelaySequence(src); src.append('B'); assert a==RelaySequence(['A']) and a!=RelaySequence(['B']) and not (a==('A',)) and list(a)==['A']", hint: "Copy into a tuple and compare only RelaySequence snapshots." },
        { name: "Bad names are rejected", code: "for names in ([''],[' '],[1],None):\n    try:\n        RelaySequence(names); assert False\n    except (TypeError,ValueError):\n        pass", hint: "Require an iterable of nonblank strings and reject a missing source." },
      ],
    },
  };

  if (topic.title === "Descriptors") return {
    title: "Reusable bounded descriptor mission",
    instructions: "Implement BoundedNumber(minimum, maximum). Validate numeric non-boolean bounds with minimum <= maximum. Use __set_name__ for a private storage key, __get__ returning self on class access and raising AttributeError before assignment, and __set__ accepting only non-boolean numbers within the inclusive bounds. Values must be stored per owning instance without recursion.",
    starterCode: "class BoundedNumber:\n    def __init__(self, minimum, maximum):\n        # TODO: validate descriptor configuration.\n        pass\n\n    def __set_name__(self, owner, name):\n        pass\n\n    def __get__(self, instance, owner=None):\n        pass\n\n    def __set__(self, instance, value):\n        pass\n",
    visibleExamples: [
      { label: "FIELD", input: "power = BoundedNumber(0,100)", output: "each instance has independently validated power" },
      { label: "CLASS ACCESS", input: "Relay.power", output: "the BoundedNumber descriptor" },
    ],
    runtime: {
      minimumCodeLength: 300,
      requiredPatterns: [
        { pattern: "def\\s+__set_name__", flags: "im", name: "Receives the assigned attribute name", hint: "Store a private key derived from name." },
        { pattern: "instance\\.__dict__", flags: "im", name: "Stores values per instance", hint: "Read and write the private key in instance.__dict__." },
      ],
      pythonTests: [
        { name: "Descriptor validates independent instances", code: "class Relay: power=BoundedNumber(0,100)\na=Relay(); b=Relay(); a.power=1; b.power=2; a.power=99; assert a.power==99 and b.power==2 and isinstance(Relay.power,BoundedNumber)", hint: "Store under a private key on each instance and return self for class access." },
        { name: "Unassigned access is explicit", code: "class Relay: power=BoundedNumber(0,100)\ntry:\n    Relay().power; assert False\nexcept AttributeError:\n    pass", hint: "Raise AttributeError when the private key is absent." },
        { name: "Configuration and assigned values are validated", code: "for bounds in [(2,1),(True,2),('0',1)]:\n    try:\n        BoundedNumber(*bounds); assert False\n    except (TypeError,ValueError):\n        pass\nclass Relay: power=BoundedNumber(0,100)\nr=Relay()\nfor v in (True,-1,101,'x'):\n    try:\n        r.power=v; assert False\n    except (TypeError,ValueError):\n        pass", hint: "Reject boolean/non-numeric values and reversed or exceeded bounds." },
      ],
    },
  };

  if (topic.title === "Metaclasses") return {
    title: "Validated plugin registry mission",
    instructions: "Implement PluginMeta with registry. Do not register the base Plugin. Every direct or indirect subclass must declare its own nonblank string code and a callable run method somewhere in its MRO. Normalize code to lowercase, reject duplicate codes during class definition, and register the created class. Plugin.available() must return a new dictionary snapshot so callers cannot mutate the registry. Define ScannerPlugin with code='scanner' and run returning 'scan:<payload>'.",
    starterCode: "class PluginMeta(type):\n    registry = {}\n\n    def __new__(mcls, name, bases, namespace):\n        # TODO: create, validate, normalize, and register concrete classes.\n        return super().__new__(mcls, name, bases, namespace)\n\nclass Plugin(metaclass=PluginMeta):\n    @classmethod\n    def available(cls):\n        # TODO: return an isolated snapshot.\n        return {}\n\nclass ScannerPlugin(Plugin):\n    code = 'scanner'\n\n    def run(self, payload):\n        return 'scan:' + str(payload)\n",
    visibleExamples: [
      { label: "REGISTRY", input: "Plugin.available()", output: "{'scanner': ScannerPlugin}" },
      { label: "DUPLICATE", input: "another code Scanner", output: "ValueError at class creation" },
    ],
    runtime: {
      minimumCodeLength: 440,
      requiredPatterns: [
        { pattern: "class\\s+PluginMeta\\s*\\(\\s*type\\s*\\)", flags: "im", name: "Defines a metaclass", hint: "Keep PluginMeta as a type subclass." },
        { pattern: "registry", flags: "im", name: "Maintains the class registry", hint: "Store normalized code to created class mappings." },
        { pattern: "dict\\s*\\(", flags: "im", name: "Returns an isolated registry", hint: "Return dict(PluginMeta.registry)." },
      ],
      pythonTests: [
        { name: "Concrete plugin is registered and runnable", code: "a=Plugin.available(); assert a=={'scanner':ScannerPlugin} and a['scanner']().run('x')=='scan:x'", hint: "Normalize and register ScannerPlugin during class creation." },
        { name: "Registry snapshot cannot mutate source", code: "a=Plugin.available(); a.clear(); assert Plugin.available()=={'scanner':ScannerPlugin}", hint: "Return a fresh dictionary from available()." },
        { name: "Invalid class declarations fail early", code: "cases=[]\ntry:\n    class Missing(Plugin):\n        def run(self,x): return x\n    cases.append(False)\nexcept ValueError: cases.append(True)\ntry:\n    class Duplicate(Plugin):\n        code=' SCANNER '\n        def run(self,x): return x\n    cases.append(False)\nexcept ValueError: cases.append(True)\ntry:\n    class NoRun(Plugin): code='new'\n    cases.append(False)\nexcept ValueError: cases.append(True)\nassert all(cases)", hint: "Require each concrete class own code, normalize it, reject duplicates, and require callable run." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["relays · 4 rows", "relay_events · JSONB telemetry", "sectors · Aurora, Ember, Tidal", "PostgreSQL planner and catalog practice"] };

export function buildRoundTwelveSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Optimizer Core") return {
    ...sqlBase,
    title: "Optimizer Core SQL project",
    instructions: "Create idx_relays_optimizer_online as a partial covering B-tree on relays(sector_id, power DESC) INCLUDE(name,status) WHERE online and idx_relay_events_payload_gin as a GIN index on relay_events(payload). Set relays.status statistics target to 250, ANALYZE relays and relay_events, then run EXPLAIN (ANALYZE, BUFFERS, VERBOSE, SETTINGS, FORMAT TEXT) for the supplied high-severity event join. Finish with the actual query returning event_id, relay_name, sector_name, power, and source ordered by event_id. Do not disable planner algorithms.",
    starterCode: "-- TODO: create the partial covering B-tree and JSONB GIN indexes.\n-- TODO: raise the status statistics target, then analyze both tables.\n\nEXPLAIN (ANALYZE, BUFFERS, VERBOSE, SETTINGS, FORMAT TEXT)\nSELECT e.event_id, r.name AS relay_name, s.name AS sector_name,\n       r.power, e.payload->>'source' AS source\nFROM relay_events e\nJOIN relays r ON r.relay_id = e.relay_id\nJOIN sectors s ON s.sector_id = r.sector_id\nWHERE e.payload @> '{\"severity\":\"high\"}'::jsonb\nORDER BY e.event_id;\n\nSELECT e.event_id, r.name AS relay_name, s.name AS sector_name,\n       r.power, e.payload->>'source' AS source\nFROM relay_events e\nJOIN relays r ON r.relay_id = e.relay_id\nJOIN sectors s ON s.sector_id = r.sector_id\nWHERE e.payload @> '{\"severity\":\"high\"}'::jsonb\nORDER BY e.event_id;\n",
    visibleExamples: [
      { label: "ACCESS METHODS", input: "online sector ordering + JSONB containment", output: "partial covering B-tree plus GIN" },
      { label: "PLAN EVIDENCE", input: "representative joined lookup", output: "actual rows, loops, buffers, settings, and verbose nodes" },
    ],
    runtime: {
      minimumCodeLength: 720,
      requiredPatterns: [
        { pattern: "CREATE\\s+INDEX\\s+idx_relays_optimizer_online[\\s\\S]*INCLUDE\\s*\\(\\s*name\\s*,\\s*status\\s*\\)[\\s\\S]*WHERE\\s+online", flags: "i", name: "Builds the partial covering B-tree", hint: "Use sector_id, power DESC, INCLUDE(name,status), and WHERE online." },
        { pattern: "CREATE\\s+INDEX\\s+idx_relay_events_payload_gin[\\s\\S]*USING\\s+gin\\s*\\(\\s*payload\\s*\\)", flags: "i", name: "Builds the JSONB GIN path", hint: "Create a GIN index on relay_events(payload)." },
        { pattern: "SET\\s+STATISTICS\\s+250", flags: "i", name: "Increases targeted statistics", hint: "ALTER the status column SET STATISTICS 250." },
        { pattern: "EXPLAIN\\s*\\(\\s*ANALYZE\\s*,\\s*BUFFERS\\s*,\\s*VERBOSE\\s*,\\s*SETTINGS", flags: "i", name: "Captures executor evidence", hint: "Keep the supplied advanced EXPLAIN options." },
      ],
      sqlTests: [
        { name: "Both access paths exist", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname IN ('idx_relays_optimizer_online','idx_relay_events_payload_gin')", column: "count", expected: 2, hint: "Create both exact index names." },
        { name: "Status statistics target is set", kind: "database-value", query: "SELECT attstattarget::int AS target FROM pg_attribute WHERE attrelid = 'relays'::regclass AND attname = 'status'", column: "target", expected: 250, hint: "Alter relays.status SET STATISTICS 250." },
        { name: "Project result columns are exact", kind: "result-columns", columns: ["event_id","relay_name","sector_name","power","source"], hint: "Finish with the supplied actual SELECT." },
        { name: "High-severity evidence is exact", kind: "result-value", column: "source", expected: "sensor-b", hint: "Keep the JSONB containment filter and source extraction." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Query optimizer") return {
    ...sqlBase,
    title: "Cardinality statistics mission",
    instructions: "Set the statistics target for relays.status to 200, ANALYZE relays, run EXPLAIN (COSTS, VERBOSE, FORMAT TEXT) for status='stable' AND online, then finish with the actual query returning relay_id, name, and status ordered by relay_id.",
    starterCode: "ALTER TABLE relays ALTER COLUMN status /* statistics target */;\nANALYZE relays;\n\nEXPLAIN (COSTS, VERBOSE, FORMAT TEXT)\nSELECT relay_id, name, status FROM relays\nWHERE status = 'stable' AND online\nORDER BY relay_id;\n\nSELECT relay_id, name, status FROM relays\nWHERE status = 'stable' AND online\nORDER BY relay_id;\n",
    visibleExamples: [
      { label: "STATISTICS", input: "status distribution", output: "higher per-column target collected by ANALYZE" },
      { label: "RESULT", input: "stable and online", output: "Aurora Edge and Tidal Link" },
    ],
    runtime: {
      minimumCodeLength: 330,
      requiredPatterns: [
        { pattern: "ALTER\\s+TABLE\\s+relays\\s+ALTER\\s+COLUMN\\s+status\\s+SET\\s+STATISTICS\\s+200", flags: "i", name: "Targets cardinality statistics", hint: "Complete the ALTER COLUMN statement." },
        { pattern: "EXPLAIN\\s*\\(\\s*COSTS\\s*,\\s*VERBOSE", flags: "i", name: "Inspects optimizer estimates", hint: "Keep EXPLAIN COSTS and VERBOSE." },
      ],
      sqlTests: [
        { name: "Statistics target is exact", kind: "database-value", query: "SELECT attstattarget::int AS target FROM pg_attribute WHERE attrelid = 'relays'::regclass AND attname = 'status'", column: "target", expected: 200, hint: "Set the target to 200." },
        { name: "Result columns are exact", kind: "result-columns", columns: ["relay_id","name","status"], hint: "Finish with the actual query projection." },
        { name: "Stable online relays are exact", kind: "result-ordered-values", column: "relay_id", expected: [2,4], hint: "Keep both status and online predicates." },
      ],
    },
  };

  if (topic.title === "Execution internals") return {
    ...sqlBase,
    title: "Executor tuple-flow mission",
    instructions: "Run EXPLAIN (ANALYZE, BUFFERS, VERBOSE, SUMMARY, FORMAT TEXT) for a join and grouped aggregate counting online relays and summing power per sector. Then run the actual query returning sector_name, online_count, and total_power for sectors with an online relay, ordered by sector_name.",
    starterCode: "EXPLAIN (ANALYZE, BUFFERS, VERBOSE, SUMMARY, FORMAT TEXT)\nSELECT s.name AS sector_name, count(*)::int AS online_count, sum(r.power)::int AS total_power\nFROM sectors s\nJOIN relays r ON r.sector_id = s.sector_id\nWHERE r.online\nGROUP BY s.name\nORDER BY s.name;\n\n-- TODO: repeat the actual query so its structured rows can be checked.\n",
    visibleExamples: [
      { label: "TUPLE FLOW", input: "scan → join → aggregate → sort", output: "actual rows and loops at each executor node" },
      { label: "AURORA", input: "two online relays", output: "count 2, total power 178" },
    ],
    runtime: {
      minimumCodeLength: 360,
      requiredPatterns: [{ pattern: "EXPLAIN\\s*\\(\\s*ANALYZE\\s*,\\s*BUFFERS\\s*,\\s*VERBOSE\\s*,\\s*SUMMARY", flags: "i", name: "Captures executor instrumentation", hint: "Keep all supplied EXPLAIN options." }],
      sqlTests: [
        { name: "Aggregate result columns are exact", kind: "result-columns", columns: ["sector_name","online_count","total_power"], hint: "Repeat the actual query after EXPLAIN." },
        { name: "Online counts are exact", kind: "result-ordered-values", column: "online_count", expected: [2,1], hint: "Filter online before grouping and order by sector name." },
        { name: "Power totals are exact", kind: "result-ordered-values", column: "total_power", expected: [178,68], hint: "Sum power for Aurora then Tidal." },
      ],
    },
  };

  if (topic.title === "Advanced EXPLAIN") return {
    ...sqlBase,
    title: "Rollback-safe write plan mission",
    instructions: "Inside an explicit transaction run EXPLAIN (ANALYZE, BUFFERS, WAL, SETTINGS, SUMMARY, FORMAT TEXT) for updating relay 3 power by +1, then ROLLBACK so the practice state is unchanged. Finish by returning relay_id, name, and power for relay 3.",
    starterCode: "BEGIN;\nEXPLAIN (ANALYZE, BUFFERS, WAL, SETTINGS, SUMMARY, FORMAT TEXT)\nUPDATE relays SET power = power + 1 WHERE relay_id = 3;\n/* undo the analyzed write */\n\nSELECT relay_id, name, power FROM relays WHERE relay_id = 3;\n",
    visibleExamples: [
      { label: "ANALYZE", input: "UPDATE relay 3", output: "actual buffers and WAL are measured" },
      { label: "SAFETY", input: "after plan capture", output: "relay 3 remains power 44" },
    ],
    runtime: {
      minimumCodeLength: 250,
      requiredPatterns: [
        { pattern: "EXPLAIN\\s*\\(\\s*ANALYZE\\s*,\\s*BUFFERS\\s*,\\s*WAL\\s*,\\s*SETTINGS\\s*,\\s*SUMMARY", flags: "i", name: "Captures write evidence", hint: "Keep the complete advanced EXPLAIN option list." },
        { pattern: "\\bROLLBACK\\s*;", flags: "i", name: "Reverts the analyzed write", hint: "Add ROLLBACK before the final SELECT." },
      ],
      sqlTests: [
        { name: "Final state columns are exact", kind: "result-columns", columns: ["relay_id","name","power"], hint: "Finish with the supplied relay query." },
        { name: "Analyzed write was rolled back", kind: "result-value", column: "power", expected: 44, hint: "ROLLBACK after EXPLAIN ANALYZE executes the UPDATE." },
      ],
    },
  };

  if (topic.title === "Join algorithms") return {
    ...sqlBase,
    title: "Join-shape evidence mission",
    instructions: "Create idx_relays_sector_join on relays(sector_id, relay_id) INCLUDE(name,power), ANALYZE relays, then run EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) for the supplied sector-to-relay join filtered to north and power >= 68. Finish with the actual query returning sector_name, relay_name, and power ordered by sector_name then relay_name. Do not disable any join algorithm.",
    starterCode: "-- TODO: create the join-supporting covering index.\nANALYZE relays;\n\nEXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)\nSELECT s.name AS sector_name, r.name AS relay_name, r.power\nFROM sectors s\nJOIN relays r ON r.sector_id = s.sector_id\nWHERE s.region = 'north' AND r.power >= 68\nORDER BY s.name, r.name;\n\n-- TODO: repeat the actual query for structured results.\n",
    visibleExamples: [
      { label: "CHOICE", input: "small dimension plus indexed fact side", output: "planner chooses from costed legal join paths" },
      { label: "RESULT", input: "north and power >=68", output: "three Aurora/Tidal relays" },
    ],
    runtime: {
      minimumCodeLength: 430,
      requiredPatterns: [
        { pattern: "CREATE\\s+INDEX\\s+idx_relays_sector_join[\\s\\S]*\\(\\s*sector_id\\s*,\\s*relay_id\\s*\\)[\\s\\S]*INCLUDE\\s*\\(\\s*name\\s*,\\s*power\\s*\\)", flags: "i", name: "Supports the join access path", hint: "Create the exact composite covering index." },
        { pattern: "EXPLAIN\\s*\\(\\s*ANALYZE\\s*,\\s*BUFFERS", flags: "i", name: "Measures the chosen join", hint: "Keep EXPLAIN ANALYZE with buffers." },
      ],
      sqlTests: [
        { name: "Join index exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname = 'idx_relays_sector_join'", column: "count", expected: 1, hint: "Create the exact index name." },
        { name: "Join result columns are exact", kind: "result-columns", columns: ["sector_name","relay_name","power"], hint: "Repeat the actual query after EXPLAIN." },
        { name: "Joined relays are exact", kind: "result-ordered-values", column: "relay_name", expected: ["Aurora Edge","Aurora Prime","Tidal Link"], hint: "Filter north and power >= 68, then preserve the supplied ordering." },
      ],
    },
  };

  if (topic.title === "Index internals") return {
    ...sqlBase,
    title: "Access-method selection mission",
    instructions: "Create idx_relay_events_payload_internals using GIN(payload) for JSONB containment and idx_relay_events_time_brin using BRIN(occurred_at) for block-range time filtering. ANALYZE relay_events, then finish with pg_indexes returning indexname and indexdef for both indexes ordered by indexname.",
    starterCode: "-- TODO: create a GIN payload index and BRIN time index.\nANALYZE relay_events;\n\nSELECT indexname, indexdef\nFROM pg_indexes\nWHERE indexname IN ('idx_relay_events_payload_internals','idx_relay_events_time_brin')\nORDER BY indexname;\n",
    visibleExamples: [
      { label: "GIN", input: "payload @> document", output: "inverted multi-key containment access" },
      { label: "BRIN", input: "large append-ordered time range", output: "compact block summaries" },
    ],
    runtime: {
      minimumCodeLength: 300,
      requiredPatterns: [
        { pattern: "CREATE\\s+INDEX\\s+idx_relay_events_payload_internals[\\s\\S]*USING\\s+gin\\s*\\(\\s*payload\\s*\\)", flags: "i", name: "Chooses GIN for JSONB", hint: "Create GIN(payload) with the exact index name." },
        { pattern: "CREATE\\s+INDEX\\s+idx_relay_events_time_brin[\\s\\S]*USING\\s+brin\\s*\\(\\s*occurred_at\\s*\\)", flags: "i", name: "Chooses BRIN for time correlation", hint: "Create BRIN(occurred_at) with the exact index name." },
      ],
      sqlTests: [
        { name: "Both specialized indexes exist", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname IN ('idx_relay_events_payload_internals','idx_relay_events_time_brin')", column: "count", expected: 2, hint: "Create both exact index names." },
        { name: "Catalog columns are exact", kind: "result-columns", columns: ["indexname","indexdef"], hint: "Keep the supplied pg_indexes query." },
        { name: "Indexes are ordered deterministically", kind: "result-ordered-values", column: "indexname", expected: ["idx_relay_events_payload_internals","idx_relay_events_time_brin"], hint: "Order by indexname." },
      ],
    },
  };

  return null;
}
