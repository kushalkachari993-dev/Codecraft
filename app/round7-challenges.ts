import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundSevenPythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Pythonic Forge") return {
    title: "Pythonic Forge Python project",
    instructions: "Restore the forge toolkit. Define a frozen RelaySnapshot dataclass with name, power, and independent tuple tags and validate power from 0 to 100. Implement record_calls(log), a metadata-preserving decorator factory that appends the wrapped function name. Implement maintenance_window(log) with @contextmanager so it appends open before yielding and closed in finally. Decorate build_forge_report(snapshots) and return names of snapshots at power >= 70 plus their count. Keep the supplied type hints.",
    starterCode: "from contextlib import contextmanager\nfrom dataclasses import dataclass, field\nfrom functools import wraps\n\n@dataclass(frozen=True)\nclass RelaySnapshot:\n    name: str\n    power: int\n    tags: tuple[str, ...] = field(default_factory=tuple)\n\n    def __post_init__(self) -> None:\n        # TODO: reject power outside 0..100.\n        pass\n\ndef record_calls(log: list[str]):\n    # TODO: return a decorator with a transparent wrapper.\n    pass\n\n@contextmanager\ndef maintenance_window(log: list[str]):\n    # TODO: append open, yield, and always append closed.\n    yield\n\ncall_log: list[str] = []\n\n@record_calls(call_log)\ndef build_forge_report(snapshots: list[RelaySnapshot]) -> dict[str, object]:\n    # TODO: report active_names and active_count.\n    return {}\n",
    visibleExamples: [
      { label: "FORGE REPORT", input: "Aurora 82; Ember 44", output: "{'active_names': ['Aurora'], 'active_count': 1}" },
      { label: "LIFECYCLE", input: "with maintenance_window(events)", output: "['open', 'closed'] even after failure" },
    ],
    runtime: {
      minimumCodeLength: 420,
      requiredPatterns: [
        { pattern: "@dataclass\\s*\\(\\s*frozen\\s*=\\s*True", flags: "im", name: "Defines an immutable snapshot", hint: "Keep @dataclass(frozen=True)." },
        { pattern: "@wraps\\s*\\(", flags: "im", name: "Preserves decorated metadata", hint: "Apply @wraps(func) to the wrapper." },
        { pattern: "@contextmanager", flags: "im", name: "Defines the forge lifecycle", hint: "Keep @contextmanager on maintenance_window." },
        { pattern: "\\bfinally\\s*:", flags: "im", name: "Guarantees cleanup", hint: "Append closed in a finally block." },
      ],
      pythonTests: [
        { name: "Snapshot validates its invariant", code: "assert RelaySnapshot('Aurora',82).tags == ();\nfor bad in (-1,101):\n    try:\n        RelaySnapshot('bad',bad)\n        assert False\n    except ValueError:\n        pass", hint: "Raise ValueError from __post_init__ unless 0 <= power <= 100." },
        { name: "Decorator records and preserves metadata", code: "events=[]\n@record_calls(events)\ndef ping(value):\n    return value*2\nassert ping(4)==8 and events==['ping'] and ping.__name__=='ping'", hint: "Append func.__name__, return func(*args, **kwargs), and use wraps." },
        { name: "Context manager always closes", code: "events=[]\ntry:\n    with maintenance_window(events):\n        assert events==['open']\n        raise RuntimeError('test')\nexcept RuntimeError:\n    pass\nassert events==['open','closed']", hint: "Put the yield inside try and append closed in finally." },
        { name: "Project report is exact", code: "call_log.clear(); report=build_forge_report([RelaySnapshot('Aurora',82),RelaySnapshot('Ember',44),RelaySnapshot('Tidal',70)]); assert report=={'active_names':['Aurora','Tidal'],'active_count':2} and call_log==['build_forge_report']", hint: "Filter snapshots at the inclusive threshold and let the decorator log the call." },
        { name: "Empty forge is handled", code: "call_log.clear(); assert build_forge_report([])=={'active_names':[],'active_count':0} and call_log==['build_forge_report']", hint: "Return an explicit empty report." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Decorators") return {
    title: "Power-gate decorator mission",
    instructions: "Complete require_power(minimum). The returned decorator must use functools.wraps, forward every argument, read power from the second positional argument or the power keyword, raise ValueError below the threshold, and return the wrapped result unchanged.",
    starterCode: "from functools import wraps\n\ndef require_power(minimum):\n    def decorator(func):\n        @wraps(func)\n        def wrapper(*args, **kwargs):\n            # TODO: find power, enforce the threshold, and forward the call.\n            pass\n        return wrapper\n    return decorator\n\n@require_power(70)\ndef activate(name, power):\n    return f'{name}:{power}'\n",
    visibleExamples: [
      { label: "ALLOWED", input: "activate('Aurora', 82)", output: "Aurora:82" },
      { label: "REJECTED", input: "activate(name='Ember', power=44)", output: "ValueError" },
    ],
    runtime: {
      minimumCodeLength: 210,
      requiredPatterns: [{ pattern: "@wraps\\s*\\(\\s*func\\s*\\)", flags: "im", name: "Preserves callable metadata", hint: "Decorate wrapper with @wraps(func)." }],
      pythonTests: [
        { name: "Allows qualifying positional calls", code: "assert activate('Aurora',82)=='Aurora:82' and activate.__name__=='activate'", hint: "Return func(*args, **kwargs) after validation." },
        { name: "Allows the inclusive keyword boundary", code: "assert activate(name='Edge',power=70)=='Edge:70'", hint: "Read kwargs['power'] when it is supplied." },
        { name: "Rejects low power", code: "for call in (lambda: activate('E',69), lambda: activate(name='E',power=1)):\n    try:\n        call(); assert False\n    except ValueError:\n        pass", hint: "Raise ValueError when power < minimum." },
      ],
    },
  };

  if (topic.title === "Closures") return {
    title: "Charge-counter closure mission",
    instructions: "Complete make_charge_counter(limit). Return a charge(amount) closure that remembers its private total, rejects negative amounts, rejects additions above limit without changing state, and returns the updated total.",
    starterCode: "def make_charge_counter(limit):\n    total = 0\n\n    def charge(amount):\n        # TODO: update the captured total safely.\n        pass\n\n    return charge\n",
    visibleExamples: [
      { label: "CAPTURED STATE", input: "counter(20), counter(15)", output: "20, then 35" },
      { label: "LIMIT", input: "limit 40, then charge 10", output: "ValueError and total remains 35" },
    ],
    runtime: {
      minimumCodeLength: 115,
      requiredPatterns: [{ pattern: "\\bnonlocal\\s+total", flags: "im", name: "Updates captured state", hint: "Declare nonlocal total inside charge." }],
      pythonTests: [
        { name: "Closure accumulates independently", code: "a=make_charge_counter(100); b=make_charge_counter(10); assert (a(20),a(15),b(4))==(20,35,4)", hint: "Each factory call owns a separate total." },
        { name: "Limit failure preserves state", code: "c=make_charge_counter(40); assert c(35)==35\ntry:\n    c(10); assert False\nexcept ValueError:\n    pass\nassert c(0)==35", hint: "Validate the proposed total before rebinding it." },
        { name: "Negative charge is rejected", code: "c=make_charge_counter(10)\ntry:\n    c(-1); assert False\nexcept ValueError:\n    pass\nassert c(0)==0", hint: "Reject negative amounts before changing total." },
      ],
    },
  };

  if (topic.title === "Context managers") return {
    title: "Relay-lock context mission",
    instructions: "Complete RelayLock. __enter__ appends acquired:<name> and returns self. __exit__ always appends released:<name>, never suppresses exceptions, and exposes locked as true only inside the block.",
    starterCode: "class RelayLock:\n    def __init__(self, name, events):\n        self.name = name\n        self.events = events\n        self.locked = False\n\n    def __enter__(self):\n        # TODO: acquire and return this manager.\n        pass\n\n    def __exit__(self, exc_type, exc, traceback):\n        # TODO: release and allow failures to propagate.\n        pass\n",
    visibleExamples: [
      { label: "NORMAL EXIT", input: "with RelayLock('A', events)", output: "acquired:A, released:A" },
      { label: "FAILED BLOCK", input: "raise RuntimeError inside with", output: "released:A then RuntimeError propagates" },
    ],
    runtime: {
      minimumCodeLength: 190,
      requiredPatterns: [{ pattern: "def\\s+__enter__|def\\s+__exit__", flags: "im", name: "Implements the context protocol", hint: "Keep both __enter__ and __exit__." }],
      pythonTests: [
        { name: "Acquires and releases normally", code: "events=[]\nwith RelayLock('A',events) as lock:\n    assert lock.locked and lock.name=='A'\nassert events==['acquired:A','released:A'] and not lock.locked", hint: "Return self and update locked on both boundaries." },
        { name: "Releases without hiding failure", code: "events=[]\ntry:\n    with RelayLock('B',events):\n        raise RuntimeError('boom')\n    assert False\nexcept RuntimeError:\n    pass\nassert events==['acquired:B','released:B']", hint: "Return False or None from __exit__." },
      ],
    },
  };

  if (topic.title === "Type hints") return {
    title: "Typed reading summary mission",
    instructions: "Complete summarize_readings with the supplied annotations. Return active_count, average, and maximum for readings at or above minimum. Empty qualifying input returns zeros. Round average to two decimals.",
    starterCode: "def summarize_readings(\n    readings: list[float],\n    minimum: float = 70.0,\n) -> dict[str, int | float]:\n    # TODO: filter and summarize without changing the annotations.\n    return {}\n",
    visibleExamples: [
      { label: "VISIBLE", input: "[82.0, 44.0, 70.0]", output: "{'active_count': 2, 'average': 76.0, 'maximum': 82.0}" },
      { label: "EMPTY MATCH", input: "[1.0], minimum 70", output: "all zero values" },
    ],
    runtime: {
      minimumCodeLength: 135,
      requiredPatterns: [{ pattern: "readings\\s*:\\s*list\\[float\\][\\s\\S]*->\\s*dict\\[str,\\s*int\\s*\\|\\s*float\\]", flags: "im", name: "Keeps a precise function contract", hint: "Preserve the list[float] input and dict[str, int | float] return annotations." }],
      pythonTests: [
        { name: "Visible summary is exact", code: "assert summarize_readings([82.0,44.0,70.0])=={'active_count':2,'average':76.0,'maximum':82.0}", hint: "The threshold includes exactly 70." },
        { name: "Custom threshold works", code: "assert summarize_readings([80.0,90.0,100.0],90.0)=={'active_count':2,'average':95.0,'maximum':100.0}", hint: "Use the minimum parameter instead of a constant." },
        { name: "Empty match is explicit", code: "assert summarize_readings([],70.0)=={'active_count':0,'average':0.0,'maximum':0.0} and summarize_readings([1.0],70.0)=={'active_count':0,'average':0.0,'maximum':0.0}", hint: "Return zeros before dividing or calling max." },
      ],
    },
  };

  if (topic.title === "Dataclasses") return {
    title: "Immutable snapshot mission",
    instructions: "Complete the frozen RelaySnapshot dataclass. tags must use a tuple default_factory, and __post_init__ must reject blank names or power outside 0 through 100.",
    starterCode: "from dataclasses import dataclass, field\n\n@dataclass(frozen=True)\nclass RelaySnapshot:\n    name: str\n    power: int\n    tags: tuple[str, ...] = field(default_factory=tuple)\n\n    def __post_init__(self) -> None:\n        # TODO: enforce both invariants.\n        pass\n",
    visibleExamples: [
      { label: "VALID", input: "RelaySnapshot('Aurora', 82)", output: "independent empty tags tuple" },
      { label: "INVALID", input: "blank name or power 101", output: "ValueError" },
    ],
    runtime: {
      minimumCodeLength: 175,
      requiredPatterns: [
        { pattern: "@dataclass\\s*\\(\\s*frozen\\s*=\\s*True", flags: "im", name: "Declares immutable value semantics", hint: "Keep @dataclass(frozen=True)." },
        { pattern: "default_factory\\s*=\\s*tuple", flags: "im", name: "Creates a safe default", hint: "Use field(default_factory=tuple)." },
      ],
      pythonTests: [
        { name: "Valid snapshots are values", code: "a=RelaySnapshot('Aurora',82); b=RelaySnapshot('Aurora',82); assert a==b and a.tags==()", hint: "Keep the declared fields and dataclass equality." },
        { name: "Invalid values are rejected", code: "for args in (('',10),('A',-1),('A',101)):\n    try:\n        RelaySnapshot(*args); assert False\n    except ValueError:\n        pass", hint: "Strip the name and require 0 <= power <= 100." },
        { name: "Frozen state cannot be reassigned", code: "r=RelaySnapshot('A',1)\ntry:\n    r.power=2; assert False\nexcept Exception:\n    pass", hint: "Retain frozen=True." },
      ],
    },
  };

  return null;
}

const sqlBase = { dataPreview: ["sectors · 3 rows", "relays · 4 rows", "Aurora power average · 89", "online relays · 3"] };

export function buildRoundSevenSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Analytical Engine") return {
    ...sqlBase,
    title: "Analytical Engine SQL project",
    instructions: "Create relay_health as an explicit-column view. Create sector_analytics as a materialized view with one row per sector, relay_count, an online_count using FILTER, rounded avg_power, and DENSE_RANK by average power descending. Create a unique index on sector_name. Finish with the three sector rows UNION ALL an ALL summary computed from relays, ordered by power_rank with the summary last.",
    starterCode: "CREATE VIEW relay_health AS\nSELECT relay_id, sector_id, name, online, power\nFROM relays;\n\nCREATE MATERIALIZED VIEW sector_analytics AS\nSELECT\n  s.name AS sector_name,\n  /* relay count */ AS relay_count,\n  /* online count with FILTER */ AS online_count,\n  /* rounded average power */ AS avg_power,\n  /* dense rank by the aggregate */ AS power_rank\nFROM sectors s\nLEFT JOIN relay_health r ON r.sector_id = s.sector_id\nGROUP BY s.sector_id, s.name;\n\nCREATE UNIQUE INDEX sector_analytics_name_idx ON sector_analytics(sector_name);\n\nSELECT sector_name, relay_count, online_count, avg_power, power_rank\nFROM sector_analytics\nUNION ALL\nSELECT 'ALL', COUNT(*)::bigint, COUNT(*) FILTER (WHERE online)::bigint, ROUND(AVG(power), 2), NULL::bigint\nFROM relays\nORDER BY power_rank NULLS LAST, sector_name;\n",
    visibleExamples: [
      { label: "TOP SECTOR", input: "Aurora", output: "2 relays · 2 online · average 89 · rank 1" },
      { label: "SUMMARY", input: "ALL", output: "4 relays · 3 online · average 72.50" },
    ],
    runtime: {
      minimumCodeLength: 450,
      requiredPatterns: [
        { pattern: "CREATE\\s+VIEW\\s+relay_health", flags: "i", name: "Publishes the live health view", hint: "Create relay_health before the materialized summary." },
        { pattern: "CREATE\\s+MATERIALIZED\\s+VIEW\\s+sector_analytics", flags: "i", name: "Stores the analytical snapshot", hint: "Create sector_analytics with the exact name." },
        { pattern: "COUNT\\s*\\(\\s*\\*\\s*\\)\\s+FILTER", flags: "i", name: "Counts online relays conditionally", hint: "Use COUNT(*) FILTER (WHERE r.online)." },
        { pattern: "DENSE_RANK\\s*\\(\\s*\\)\\s+OVER", flags: "i", name: "Ranks sector aggregates", hint: "Use DENSE_RANK() OVER (ORDER BY AVG(r.power) DESC)." },
        { pattern: "\\bUNION\\s+ALL\\b", flags: "i", name: "Adds the grand-total row", hint: "Combine sector_analytics with the ALL summary using UNION ALL." },
      ],
      sqlTests: [
        { name: "Live view was created", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.views WHERE table_name = 'relay_health'", column: "count", expected: 1, hint: "Create relay_health as a normal view." },
        { name: "Materialized snapshot was created", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_matviews WHERE matviewname = 'sector_analytics'", column: "count", expected: 1, hint: "Create sector_analytics as a materialized view." },
        { name: "Project columns are exact", kind: "result-columns", columns: ["sector_name", "relay_count", "online_count", "avg_power", "power_rank"], hint: "Return and alias all five requested columns." },
        { name: "Ranked sectors and summary are ordered", kind: "result-ordered-values", column: "sector_name", expected: ["Aurora","Tidal","Ember","ALL"], hint: "Order ranks ascending and place the NULL summary rank last." },
        { name: "Online counts are correct", kind: "result-ordered-values", column: "online_count", expected: [2,1,0,3], hint: "Use FILTER on online status for sectors and the final summary." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Window functions") return {
    ...sqlBase,
    title: "Sector power-rank mission",
    instructions: "Return relay name, sector_name, and power_rank. Use DENSE_RANK over each sector ordered by power descending, then display rows by sector_id, power descending, and relay_id.",
    starterCode: "SELECT\n  r.name,\n  s.name AS sector_name,\n  /* rank within each sector */ AS power_rank\nFROM relays r\nJOIN sectors s ON s.sector_id = r.sector_id\nORDER BY r.sector_id, r.power DESC, r.relay_id;\n",
    visibleExamples: [
      { label: "AURORA", input: "96 and 82 power", output: "ranks 1 and 2" },
      { label: "EMBER", input: "single relay", output: "rank 1" },
    ],
    runtime: {
      minimumCodeLength: 145,
      requiredPatterns: [{ pattern: "DENSE_RANK\\s*\\(\\s*\\)\\s+OVER\\s*\\([\\s\\S]*PARTITION\\s+BY", flags: "i", name: "Ranks inside each sector", hint: "Use DENSE_RANK() OVER (PARTITION BY r.sector_id ORDER BY r.power DESC)." }],
      sqlTests: [
        { name: "Window columns are exact", kind: "result-columns", columns: ["name","sector_name","power_rank"], hint: "Return all three aliases exactly." },
        { name: "Relay order is deterministic", kind: "result-ordered-values", column: "name", expected: ["Aurora Prime","Aurora Edge","Ember Gate","Tidal Link"], hint: "Use the requested outer ORDER BY." },
        { name: "Ranks reset per sector", kind: "result-ordered-values", column: "power_rank", expected: [1,2,1,1], hint: "PARTITION BY sector_id before ordering power descending." },
      ],
    },
  };

  if (topic.title === "Set operations") return {
    ...sqlBase,
    title: "Relay-state union mission",
    instructions: "Build two compatible SELECT branches. Return online relays with state online, UNION ALL offline relays with state offline, then order the combined result by name.",
    starterCode: "SELECT name, 'online'::text AS state\nFROM relays\nWHERE /* online rows */\n\n/* preserve both branches */\n\nSELECT name, 'offline'::text AS state\nFROM relays\nWHERE /* offline rows */\nORDER BY name;\n",
    visibleExamples: [
      { label: "ONLINE", input: "Aurora Prime", output: "online" },
      { label: "OFFLINE", input: "Ember Gate", output: "offline" },
    ],
    runtime: {
      minimumCodeLength: 120,
      requiredPatterns: [{ pattern: "\\bUNION\\s+ALL\\b", flags: "i", name: "Combines compatible state sets", hint: "Put UNION ALL between the online and offline SELECT branches." }],
      sqlTests: [
        { name: "Set result columns are exact", kind: "result-columns", columns: ["name","state"], hint: "Both branches must expose name and state." },
        { name: "Every relay appears in name order", kind: "result-ordered-values", column: "name", expected: ["Aurora Edge","Aurora Prime","Ember Gate","Tidal Link"], hint: "Use complementary online predicates and a final ORDER BY name." },
        { name: "States follow the source sets", kind: "result-ordered-values", column: "state", expected: ["online","online","offline","online"], hint: "Label each branch with the correct text literal." },
      ],
    },
  };

  if (topic.title === "Advanced aggregation") return {
    ...sqlBase,
    title: "Conditional sector summary mission",
    instructions: "Preserve every sector and return sector_name, relay_count, online_count, and rounded avg_power. Use COUNT(*) FILTER for online_count, group by the stable sector key and name, and order by sector_id.",
    starterCode: "SELECT\n  s.name AS sector_name,\n  COUNT(r.relay_id) AS relay_count,\n  /* conditional online aggregate */ AS online_count,\n  ROUND(COALESCE(AVG(r.power), 0), 2) AS avg_power\nFROM sectors s\nLEFT JOIN relays r ON r.sector_id = s.sector_id\nGROUP BY s.sector_id, s.name\nORDER BY s.sector_id;\n",
    visibleExamples: [
      { label: "AURORA", input: "2 relays", output: "2 total · 2 online · average 89" },
      { label: "EMBER", input: "1 offline relay", output: "1 total · 0 online · average 44" },
    ],
    runtime: {
      minimumCodeLength: 210,
      requiredPatterns: [{ pattern: "COUNT\\s*\\(\\s*\\*\\s*\\)\\s+FILTER\\s*\\(\\s*WHERE\\s+r\\.online", flags: "i", name: "Calculates the conditional metric", hint: "Use COUNT(*) FILTER (WHERE r.online) AS online_count." }],
      sqlTests: [
        { name: "Aggregate columns are exact", kind: "result-columns", columns: ["sector_name","relay_count","online_count","avg_power"], hint: "Alias all four requested metrics." },
        { name: "Sectors stay ordered", kind: "result-ordered-values", column: "sector_name", expected: ["Aurora","Ember","Tidal"], hint: "Order by s.sector_id." },
        { name: "Online counts are correct", kind: "result-ordered-values", column: "online_count", expected: [2,0,1], hint: "Apply FILTER only to the online count." },
      ],
    },
  };

  if (topic.title === "Views") return {
    ...sqlBase,
    title: "Strong-relay view mission",
    instructions: "Create strong_relays as an explicit-column view containing relay_id, name, and power for power at least 70. Finish by querying those columns ordered by power descending and relay_id.",
    starterCode: "CREATE VIEW strong_relays AS\nSELECT /* explicit columns */\nFROM relays\nWHERE /* inclusive power threshold */;\n\nSELECT relay_id, name, power\nFROM strong_relays\nORDER BY power DESC, relay_id;\n",
    visibleExamples: [
      { label: "INCLUDED", input: "Aurora Prime 96", output: "present" },
      { label: "EXCLUDED", input: "Tidal Link 68", output: "absent" },
    ],
    runtime: {
      minimumCodeLength: 130,
      requiredPatterns: [{ pattern: "CREATE\\s+(?:OR\\s+REPLACE\\s+)?VIEW\\s+strong_relays", flags: "i", name: "Creates the reusable relation", hint: "Create a view named strong_relays." }],
      sqlTests: [
        { name: "View exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM information_schema.views WHERE table_name = 'strong_relays'", column: "count", expected: 1, hint: "Create the view before the final query." },
        { name: "View columns are explicit", kind: "result-columns", columns: ["relay_id","name","power"], hint: "Expose only relay_id, name, and power." },
        { name: "Only strong relays remain", kind: "result-ordered-values", column: "name", expected: ["Aurora Prime","Aurora Edge"], hint: "Filter power >= 70 and order descending." },
      ],
    },
  };

  if (topic.title === "Materialized views") return {
    ...sqlBase,
    title: "Online-power snapshot mission",
    instructions: "Create online_power_snapshot as a materialized view containing relay_id, name, and power for online relays. Create a unique index on relay_id, refresh the snapshot, then query it by relay_id.",
    starterCode: "CREATE MATERIALIZED VIEW online_power_snapshot AS\nSELECT /* explicit columns */\nFROM relays\nWHERE /* online only */;\n\nCREATE UNIQUE INDEX online_power_snapshot_relay_idx\nON online_power_snapshot(relay_id);\n\nREFRESH MATERIALIZED VIEW online_power_snapshot;\nSELECT relay_id, name, power FROM online_power_snapshot ORDER BY relay_id;\n",
    visibleExamples: [
      { label: "SNAPSHOT SIZE", input: "online relays", output: "3 rows" },
      { label: "OFFLINE", input: "Ember Gate", output: "not stored" },
    ],
    runtime: {
      minimumCodeLength: 205,
      requiredPatterns: [
        { pattern: "CREATE\\s+MATERIALIZED\\s+VIEW\\s+online_power_snapshot", flags: "i", name: "Creates a stored snapshot", hint: "Use the exact materialized-view name." },
        { pattern: "REFRESH\\s+MATERIALIZED\\s+VIEW\\s+online_power_snapshot", flags: "i", name: "Refreshes the snapshot", hint: "Keep the explicit refresh statement." },
      ],
      sqlTests: [
        { name: "Materialized view exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_matviews WHERE matviewname = 'online_power_snapshot'", column: "count", expected: 1, hint: "Create a materialized view, not a normal view." },
        { name: "Unique refresh key exists", kind: "database-value", query: "SELECT count(*)::int AS count FROM pg_indexes WHERE indexname = 'online_power_snapshot_relay_idx'", column: "count", expected: 1, hint: "Create the named unique index on relay_id." },
        { name: "Snapshot columns are exact", kind: "result-columns", columns: ["relay_id","name","power"], hint: "Return the three requested columns." },
        { name: "Only online rows are stored", kind: "result-ordered-values", column: "name", expected: ["Aurora Prime","Aurora Edge","Tidal Link"], hint: "Filter where online before materializing." },
      ],
    },
  };

  return null;
}
