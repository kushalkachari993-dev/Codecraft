import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundSixPythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Object Workshop") return {
    title: "Object Workshop Python project",
    instructions: "Build RelayFleet. Its constructor copies a list of relay dictionaries. __iter__ must be a generator yielding names of relays that are online with power at least 70. report() must use a comprehension for active names and sorted(..., key=lambda ...) to return active_names sorted by power descending then name, active_count, and average_power rounded to two decimals. Empty active fleets return 0.0.",
    starterCode: "# Object Workshop applied project\nclass RelayFleet:\n    def __init__(self, relays):\n        # TODO: copy the input list.\n        self.relays = None\n\n    def __iter__(self):\n        # TODO: yield qualifying relay names lazily.\n        return iter(())\n\n    def report(self):\n        # TODO: build, sort, and summarize active relay data.\n        return None\n\nsample = [\n    {'name':'Aurora','online':True,'power':82},\n    {'name':'Ember','online':False,'power':99},\n]\nprint(RelayFleet(sample).report())\n",
    visibleExamples: [
      { label: "VISIBLE FLEET", input: "Aurora 82 online; Ember 99 offline", output: "{'active_names': ['Aurora'], 'active_count': 1, 'average_power': 82.0}" },
      { label: "EMPTY ACTIVE FLEET", input: "no qualifying relays", output: "{'active_names': [], 'active_count': 0, 'average_power': 0.0}" },
    ],
    runtime: {
      minimumCodeLength: 270,
      requiredPatterns: [
        { pattern: "\\bclass\\s+RelayFleet", flags: "im", name: "Defines the fleet object", hint: "Keep the RelayFleet class and its methods." },
        { pattern: "\\byield\\b", flags: "im", name: "Streams active relay names", hint: "Yield each qualifying name from __iter__." },
        { pattern: "\\blambda\\b", flags: "im", name: "Defines the local sort key", hint: "Sort active records by negative power, then name with a lambda key." },
        { pattern: "\\[[^\\]]*\\bfor\\b", flags: "im", name: "Uses a focused comprehension", hint: "Build active records or names with a list comprehension." },
      ],
      pythonTests: [
        { name: "Fleet class exists", code: "assert isinstance(globals().get('RelayFleet'), type)", hint: "Keep RelayFleet as a class." },
        { name: "Builds the visible report", code: "f=RelayFleet([{'name':'Aurora','online':True,'power':82},{'name':'Ember','online':False,'power':99}]); assert list(f) == ['Aurora'] and f.report() == {'active_names':['Aurora'],'active_count':1,'average_power':82.0}", hint: "Only online relays with power >= 70 are active." },
        { name: "Sorts and averages active relays", code: "f=RelayFleet([{'name':'Zeta','online':True,'power':70},{'name':'Alpha','online':True,'power':90},{'name':'Beta','online':True,'power':90}]); assert f.report() == {'active_names':['Alpha','Beta','Zeta'],'active_count':3,'average_power':83.33}", hint: "Sort by power descending and name ascending; round the mean." },
        { name: "Handles no active relays", code: "assert RelayFleet([]).report() == {'active_names':[],'active_count':0,'average_power':0.0} and list(RelayFleet([{'name':'Weak','online':True,'power':69}])) == []", hint: "Return an explicit zero-valued report when no relay qualifies." },
        { name: "Preserves caller collection", code: "source=[{'name':'A','online':True,'power':70}]; fleet=RelayFleet(source); source.append({'name':'B','online':True,'power':80}); assert list(fleet) == ['A']", hint: "Copy the relays list in __init__." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "OOP") return {
    title: "Relay object mission",
    instructions: "Complete Relay. Validate initial power from 0 through 100, expose it through a read-only power property, and implement recharge(amount) that rejects negatives, clamps at 100, updates state, and returns the new power.",
    starterCode: "class Relay:\n    def __init__(self, name, power):\n        self.name = name\n        # TODO: validate and store private power.\n\n    @property\n    def power(self):\n        return None\n\n    def recharge(self, amount):\n        # TODO: protect the invariant and return new power.\n        return None\n",
    visibleExamples: [
      { label: "RECHARGE", input: "Relay('Aurora', 82).recharge(10)", output: "92" },
      { label: "CLAMP", input: "power 96, recharge 10", output: "100" },
    ],
    runtime: {
      minimumCodeLength: 160,
      requiredPatterns: [
        { pattern: "\\bclass\\s+Relay", flags: "im", name: "Models a relay object", hint: "Keep class Relay." },
        { pattern: "@property", flags: "im", name: "Exposes controlled state", hint: "Return self._power from the power property." },
      ],
      pythonTests: [
        { name: "Relay class exists", code: "assert isinstance(globals().get('Relay'), type)", hint: "Keep Relay as a class." },
        { name: "Recharges and clamps", code: "r=Relay('Aurora',82); assert r.recharge(10)==92 and r.power==92; assert r.recharge(20)==100 and r.power==100", hint: "Update _power with min(100, current + amount)." },
        { name: "Rejects invalid construction", code: "for bad in (-1,101):\n    try:\n        Relay('bad',bad)\n        assert False\n    except ValueError:\n        pass", hint: "Raise ValueError unless initial power is between 0 and 100." },
        { name: "Rejects negative recharge", code: "r=Relay('A',50)\ntry:\n    r.recharge(-1)\n    assert False\nexcept ValueError:\n    assert r.power == 50", hint: "Validate before changing state." },
      ],
    },
  };

  if (topic.title === "Comprehensions") return {
    title: "Telemetry comprehension mission",
    instructions: "Complete active_power_by_name(relays). Use one dictionary comprehension to return name-to-power pairs only for online relays with power at least 70. Do not mutate the input.",
    starterCode: "def active_power_by_name(relays):\n    # TODO: return one focused dictionary comprehension.\n    return None\n",
    visibleExamples: [
      { label: "VISIBLE INPUT", input: "Aurora online 82; Ember offline 99; Tidal online 68", output: "{'Aurora': 82}" },
      { label: "NO MATCH", input: "[]", output: "{}" },
    ],
    runtime: {
      minimumCodeLength: 65,
      requiredPatterns: [{ pattern: "\\{[^}]*:[^}]*\\bfor\\b[^}]*\\bif\\b[^}]*\\}", flags: "im", name: "Builds a filtered dictionary", hint: "Return {relay['name']: relay['power'] for relay in relays if ...}." }],
      pythonTests: [
        { name: "Comprehension function exists", code: "assert callable(globals().get('active_power_by_name'))", hint: "Keep active_power_by_name(relays)." },
        { name: "Filters the visible input", code: "r=[{'name':'Aurora','online':True,'power':82},{'name':'Ember','online':False,'power':99},{'name':'Tidal','online':True,'power':68}]; assert active_power_by_name(r)=={'Aurora':82}", hint: "Require online and power >= 70." },
        { name: "Includes the boundary", code: "assert active_power_by_name([{'name':'A','online':True,'power':70}]) == {'A':70}", hint: "Use >= 70." },
        { name: "Handles empty input", code: "assert active_power_by_name([]) == {}", hint: "A dictionary comprehension naturally creates an empty dictionary." },
      ],
    },
  };

  if (topic.title === "Lambda") return {
    title: "Relay ranking mission",
    instructions: "Complete rank_relays(relays). Return a new list sorted by power descending and then name ascending using sorted() with a lambda key. Preserve the original list.",
    starterCode: "def rank_relays(relays):\n    # TODO: use sorted with a tuple-producing lambda key.\n    return None\n",
    visibleExamples: [
      { label: "VISIBLE ORDER", input: "Zeta 82, Alpha 96, Beta 96", output: "Alpha, Beta, Zeta" },
      { label: "EMPTY INPUT", input: "[]", output: "[]" },
    ],
    runtime: {
      minimumCodeLength: 55,
      requiredPatterns: [{ pattern: "sorted\\s*\\([\\s\\S]*key\\s*=\\s*lambda", flags: "im", name: "Uses an anonymous sort key", hint: "Use sorted(relays, key=lambda relay: (-relay['power'], relay['name']))." }],
      pythonTests: [
        { name: "Ranking function exists", code: "assert callable(globals().get('rank_relays'))", hint: "Keep rank_relays(relays)." },
        { name: "Ranks power and tie names", code: "r=[{'name':'Zeta','power':82},{'name':'Beta','power':96},{'name':'Alpha','power':96}]; assert [x['name'] for x in rank_relays(r)] == ['Alpha','Beta','Zeta']", hint: "Use (-power, name) as the key tuple." },
        { name: "Preserves the source order", code: "r=[{'name':'B','power':1},{'name':'A','power':2}]; rank_relays(r); assert [x['name'] for x in r] == ['B','A']", hint: "Use sorted(), not list.sort()." },
        { name: "Handles empty input", code: "assert rank_relays([]) == []", hint: "sorted([]) returns a new empty list." },
      ],
    },
  };

  if (topic.title === "Iterators") return {
    title: "Countdown iterator mission",
    instructions: "Complete Countdown(start). It must be its own iterator, yield start down through 1, then raise StopIteration. Reject a negative start with ValueError.",
    starterCode: "class Countdown:\n    def __init__(self, start):\n        # TODO: validate and store current state.\n        pass\n\n    def __iter__(self):\n        return self\n\n    def __next__(self):\n        # TODO: return current and advance toward exhaustion.\n        pass\n",
    visibleExamples: [
      { label: "VISIBLE ITERATION", input: "list(Countdown(3))", output: "[3, 2, 1]" },
      { label: "EMPTY COUNTDOWN", input: "list(Countdown(0))", output: "[]" },
    ],
    runtime: {
      minimumCodeLength: 135,
      requiredPatterns: [
        { pattern: "def\\s+__iter__", flags: "im", name: "Implements iterable protocol", hint: "Return self from __iter__." },
        { pattern: "raise\\s+StopIteration", flags: "im", name: "Signals exhaustion", hint: "Raise StopIteration when current is zero." },
      ],
      pythonTests: [
        { name: "Countdown class exists", code: "assert isinstance(globals().get('Countdown'), type)", hint: "Keep Countdown as a class." },
        { name: "Counts down visibly", code: "assert list(Countdown(3)) == [3,2,1]", hint: "Return current before decrementing it." },
        { name: "Handles immediate exhaustion", code: "assert list(Countdown(0)) == []", hint: "Raise StopIteration before returning any value at zero." },
        { name: "Rejects negative starts", code: "try:\n    Countdown(-1)\n    assert False\nexcept ValueError:\n    pass", hint: "Validate start in __init__." },
      ],
    },
  };

  if (topic.title === "Generators") return {
    title: "Reading batch generator mission",
    instructions: "Complete batches(readings, size). Reject size below 1 with ValueError, then lazily yield new list chunks of at most size items without modifying readings.",
    starterCode: "def batches(readings, size):\n    # TODO: validate size, then yield slices lazily.\n    pass\n",
    visibleExamples: [
      { label: "VISIBLE BATCHES", input: "[1,2,3,4,5], size 2", output: "[[1,2], [3,4], [5]]" },
      { label: "EMPTY INPUT", input: "[], size 3", output: "[]" },
    ],
    runtime: {
      minimumCodeLength: 70,
      requiredPatterns: [{ pattern: "\\byield\\b", flags: "im", name: "Produces batches lazily", hint: "Yield readings[index:index + size] in a stepped range." }],
      pythonTests: [
        { name: "Batch generator exists", code: "assert callable(globals().get('batches'))", hint: "Keep batches(readings, size)." },
        { name: "Yields visible batches", code: "assert list(batches([1,2,3,4,5],2)) == [[1,2],[3,4],[5]]", hint: "Step from 0 by size and yield each slice." },
        { name: "Handles empty and large size", code: "assert list(batches([],3)) == [] and list(batches([1,2],5)) == [[1,2]]", hint: "The range should naturally handle these boundaries." },
        { name: "Rejects invalid size when iterated", code: "try:\n    list(batches([1],0))\n    assert False\nexcept ValueError:\n    pass", hint: "Raise ValueError before the yield loop when size < 1." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["relays · 4 rows", "predecessor hierarchy · 3 levels", "alerts · 2 rows", "one open high-severity alert"] };

export function buildRoundSixSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Advanced Query Grid") return {
    ...sqlBase,
    title: "Advanced Query Grid SQL project",
    instructions: "Build one WITH RECURSIVE report starting at root relays. Traverse predecessor_id with depth and a bigint path that prevents cycles. Join each row to its predecessor name and use a correlated EXISTS subquery to expose has_open_alert. Return name, predecessor, depth, and has_open_alert ordered by depth then relay_id.",
    starterCode: "WITH RECURSIVE relay_tree AS (\n  -- Anchor root relays with depth 0 and an initial bigint path.\n  SELECT /* columns */\n  FROM relays\n  WHERE predecessor_id IS NULL\n\n  UNION ALL\n\n  -- Expand children and reject ids already in the path.\n  SELECT /* columns */\n  FROM relays child\n  JOIN relay_tree parent ON child.predecessor_id = parent.relay_id\n  WHERE /* cycle protection */\n)\nSELECT\n  tree.name,\n  previous.name AS predecessor,\n  tree.depth,\n  EXISTS (\n    SELECT 1 FROM alerts a\n    WHERE a.relay_id = tree.relay_id AND a.open\n  ) AS has_open_alert\nFROM relay_tree tree\nLEFT JOIN relays previous ON previous.relay_id = tree.predecessor_id\nORDER BY tree.depth, tree.relay_id;\n",
    visibleExamples: [
      { label: "ROOT", input: "Aurora Prime", output: "depth 0 · predecessor NULL · no open alert" },
      { label: "ALERTED CHILD", input: "Ember Gate", output: "depth 1 · predecessor Aurora Prime · open alert true" },
    ],
    runtime: {
      minimumCodeLength: 300,
      requiredPatterns: [
        { pattern: "\\bWITH\\s+RECURSIVE\\b", flags: "i", name: "Defines hierarchy traversal", hint: "Start with WITH RECURSIVE relay_tree AS (...)." },
        { pattern: "<>\\s*ALL\\s*\\(", flags: "i", name: "Protects traversal from cycles", hint: "Require child.relay_id <> ALL(parent.path)." },
        { pattern: "\\bEXISTS\\s*\\(", flags: "i", name: "Checks alerts dependently", hint: "Use the supplied correlated EXISTS for open alerts." },
        { pattern: "\\bLEFT\\s+JOIN\\s+relays", flags: "i", name: "Preserves roots in the predecessor join", hint: "LEFT JOIN relays previous so roots keep NULL predecessor." },
      ],
      sqlTests: [
        { name: "Project columns are exact", kind: "result-columns", columns: ["name", "predecessor", "depth", "has_open_alert"], hint: "Return and alias all four requested columns." },
        { name: "Hierarchy order is correct", kind: "result-ordered-values", column: "name", expected: ["Aurora Prime", "Aurora Edge", "Ember Gate", "Tidal Link"], hint: "Order by depth, relay_id." },
        { name: "Depth is traced", kind: "result-ordered-values", column: "depth", expected: [0,1,1,2], hint: "Anchor at 0 and add one in the recursive term." },
        { name: "Predecessors are correct", kind: "result-ordered-values", column: "predecessor", expected: ["null","Aurora Prime","Aurora Prime","Aurora Edge"], hint: "Join predecessor_id back to relays." },
        { name: "Open alert is correlated", kind: "result-ordered-values", column: "has_open_alert", expected: ["false","false","true","false"], hint: "Only Ember Gate has an open alert." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Advanced JOINs") return {
    ...sqlBase,
    title: "Predecessor self-join mission",
    instructions: "Return every relay name and predecessor. Self-join relays with aliases, preserve roots with LEFT JOIN, use none for missing predecessor, and order by relay_id.",
    starterCode: "SELECT current.name, /* predecessor fallback */ AS predecessor\nFROM relays current\n/* self-join relays as previous */\nORDER BY current.relay_id;\n",
    visibleExamples: [
      { label: "ROOT", input: "Aurora Prime", output: "none" },
      { label: "DEEP CHILD", input: "Tidal Link", output: "Aurora Edge" },
    ],
    runtime: {
      minimumCodeLength: 80,
      requiredPatterns: [{ pattern: "LEFT\\s+JOIN\\s+relays\\s+previous\\s+ON\\s+previous\\.relay_id\\s*=\\s*current\\.predecessor_id", flags: "i", name: "Self-joins the predecessor relationship", hint: "LEFT JOIN relays previous ON previous.relay_id = current.predecessor_id." }],
      sqlTests: [
        { name: "Self-join columns are exact", kind: "result-columns", columns: ["name", "predecessor"], hint: "Return current.name and COALESCE(previous.name, 'none') AS predecessor." },
        { name: "Relays remain ordered", kind: "result-ordered-values", column: "name", expected: ["Aurora Prime","Aurora Edge","Ember Gate","Tidal Link"], hint: "Order by current.relay_id." },
        { name: "Predecessors match", kind: "result-ordered-values", column: "predecessor", expected: ["none","Aurora Prime","Aurora Prime","Aurora Edge"], hint: "Follow predecessor_id and preserve the root." },
      ],
    },
  };

  if (topic.title === "Advanced subqueries") return {
    ...sqlBase,
    title: "Open-alert existence mission",
    instructions: "Return relay names for which a correlated EXISTS subquery finds an open alert. Order alphabetically and do not join alerts into the outer result.",
    starterCode: "SELECT r.name\nFROM relays r\nWHERE EXISTS (\n  SELECT 1\n  FROM alerts a\n  WHERE /* correlate relay and require open */\n)\nORDER BY r.name;\n",
    visibleExamples: [
      { label: "EXPECTED RELAY", input: "Ember Gate", output: "has one open alert" },
      { label: "CLOSED ALERT", input: "Aurora Prime", output: "excluded" },
    ],
    runtime: {
      minimumCodeLength: 90,
      requiredPatterns: [{ pattern: "EXISTS\\s*\\([\\s\\S]*a\\.relay_id\\s*=\\s*r\\.relay_id[\\s\\S]*a\\.open", flags: "i", name: "Correlates alert existence", hint: "Match a.relay_id to r.relay_id and require a.open." }],
      sqlTests: [
        { name: "Existence result column is exact", kind: "result-columns", columns: ["name"], hint: "Return only relay name." },
        { name: "Only open-alert relays pass", kind: "result-value", column: "name", expected: "Ember Gate", hint: "Require a.open inside the correlated subquery." },
        { name: "No duplicate rows are introduced", kind: "result-max-rows", minRows: 1, maxRows: 1, hint: "Use EXISTS rather than joining alert rows." },
      ],
    },
  };

  if (topic.title === "CTEs") return {
    ...sqlBase,
    title: "Active sector CTE mission",
    instructions: "Use active_relays as a CTE containing only online relays, then return sector_id and relay_count from that named stage. Group and order by sector_id.",
    starterCode: "WITH active_relays AS (\n  SELECT /* needed columns */\n  FROM relays\n  WHERE /* online only */\n)\nSELECT sector_id, /* aggregate */ AS relay_count\nFROM active_relays\nGROUP BY sector_id\nORDER BY sector_id;\n",
    visibleExamples: [
      { label: "AURORA", input: "sector 1", output: "2 active relays" },
      { label: "TIDAL", input: "sector 3", output: "1 active relay" },
    ],
    runtime: {
      minimumCodeLength: 105,
      requiredPatterns: [{ pattern: "WITH\\s+active_relays\\s+AS\\s*\\(", flags: "i", name: "Names the active stage", hint: "Start with WITH active_relays AS (...)." }],
      sqlTests: [
        { name: "CTE result columns are exact", kind: "result-columns", columns: ["sector_id", "relay_count"], hint: "Return sector_id and COUNT(*) AS relay_count." },
        { name: "Active sectors are ordered", kind: "result-ordered-values", column: "sector_id", expected: [1,3], hint: "Filter online relays in the CTE and order by sector_id." },
        { name: "Active counts are correct", kind: "result-ordered-values", column: "relay_count", expected: [2,1], hint: "Aggregate rows from active_relays." },
      ],
    },
  };

  if (topic.title === "Recursive CTEs") return {
    ...sqlBase,
    title: "Relay hierarchy mission",
    instructions: "Use WITH RECURSIVE to traverse relays from roots through predecessor_id. Carry depth and a bigint path, reject child IDs already in the path, and return name plus depth ordered by depth and relay_id.",
    starterCode: "WITH RECURSIVE relay_tree AS (\n  SELECT relay_id, predecessor_id, name, 0 AS depth, ARRAY[relay_id]::bigint[] AS path\n  FROM relays\n  WHERE predecessor_id IS NULL\n\n  UNION ALL\n\n  SELECT child.relay_id, child.predecessor_id, child.name, parent.depth + 1, parent.path || child.relay_id\n  FROM relays child\n  JOIN relay_tree parent ON child.predecessor_id = parent.relay_id\n  WHERE /* reject ids already in path */\n)\nSELECT name, depth FROM relay_tree ORDER BY depth, relay_id;\n",
    visibleExamples: [
      { label: "ROOT", input: "Aurora Prime", output: "depth 0" },
      { label: "DEEPEST", input: "Tidal Link", output: "depth 2" },
    ],
    runtime: {
      minimumCodeLength: 245,
      requiredPatterns: [
        { pattern: "WITH\\s+RECURSIVE", flags: "i", name: "Starts recursive traversal", hint: "Keep WITH RECURSIVE relay_tree." },
        { pattern: "child\\.relay_id\\s*<>\\s*ALL\\s*\\(\\s*parent\\.path\\s*\\)", flags: "i", name: "Prevents cycles", hint: "Use child.relay_id <> ALL(parent.path)." },
      ],
      sqlTests: [
        { name: "Hierarchy columns are exact", kind: "result-columns", columns: ["name", "depth"], hint: "Return name and depth." },
        { name: "Traversal order is correct", kind: "result-ordered-values", column: "name", expected: ["Aurora Prime","Aurora Edge","Ember Gate","Tidal Link"], hint: "Order by depth and relay_id." },
        { name: "Depth values are correct", kind: "result-ordered-values", column: "depth", expected: [0,1,1,2], hint: "Anchor depth 0 and increment for each child layer." },
      ],
    },
  };

  return null;
}
