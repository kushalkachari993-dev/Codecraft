import type { PythonTopic } from "./python-curriculum";
import type { SQLTopic } from "./sql-curriculum";
import type { TopicChallenge } from "./challenges";

type ChallengeOptions = { required?: boolean; worldName?: string };

export function buildRoundTwoPythonChallenge(topic: PythonTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Inventory Basics") return {
    title: "Inventory Basics Python project",
    instructions: "Build inventory_report(entries). Each entry is a (name, quantity) tuple. Return total_units, an alphabetically sorted unique_items list, and stock_by_item with duplicate item quantities combined. This required project gates the next world.",
    starterCode: "# Inventory Basics applied project\ndef inventory_report(entries):\n    stock_by_item = {}\n    unique_items = set()\n    # TODO: unpack every (name, quantity) tuple and combine its stock.\n    return {\n        'total_units': None,\n        'unique_items': None,\n        'stock_by_item': None,\n    }\n\nprint(inventory_report([('cell', 2), ('map', 1), ('cell', 3)]))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "[('cell', 2), ('map', 1), ('cell', 3)]", output: "{'total_units': 6, 'unique_items': ['cell', 'map'], 'stock_by_item': {'cell': 5, 'map': 1}}" },
      { label: "EDGE CASE", input: "[]", output: "{'total_units': 0, 'unique_items': [], 'stock_by_item': {}}" },
    ],
    runtime: {
      minimumCodeLength: 150,
      requiredPatterns: [
        { pattern: "\\bfor\\s+\\w+\\s*,\\s*\\w+\\s+in\\s+entries", flags: "im", name: "Unpacks inventory tuples", hint: "Loop with for name, quantity in entries." },
        { pattern: "\\bset\\s*\\(\\s*\\)|\\{[^:]+\\}", flags: "im", name: "Tracks unique items", hint: "Use a set to track unique item names." },
        { pattern: "\\.get\\s*\\(", flags: "im", name: "Combines dictionary counts", hint: "Use stock_by_item.get(name, 0) when accumulating quantities." },
      ],
      pythonTests: [
        { name: "Inventory function exists", code: "assert callable(globals().get('inventory_report'))", hint: "Keep inventory_report(entries)." },
        { name: "Combines the visible inventory", code: "assert inventory_report([('cell', 2), ('map', 1), ('cell', 3)]) == {'total_units': 6, 'unique_items': ['cell', 'map'], 'stock_by_item': {'cell': 5, 'map': 1}}", hint: "Combine repeated names and sort the unique item list." },
        { name: "Handles an empty inventory", code: "assert inventory_report([]) == {'total_units': 0, 'unique_items': [], 'stock_by_item': {}}", hint: "Initialize empty list, set, and dictionary outcomes deliberately." },
        { name: "Uses every tuple entry", code: "assert inventory_report([('zeta', 4), ('alpha', 2), ('zeta', 1)]) == {'total_units': 7, 'unique_items': ['alpha', 'zeta'], 'stock_by_item': {'zeta': 5, 'alpha': 2}}", hint: "Derive all fields from entries instead of the visible example." },
      ],
    },
  };
  if (options.required) return null;

  if (topic.title === "Lists") return {
    title: "Loadout list mission",
    instructions: "Complete prepare_loadout(items, emergency_item). Return a new list, preserve the original list, and append the emergency item only when it is not already present.",
    starterCode: "def prepare_loadout(items, emergency_item):\n    # Copy before changing the loadout.\n    prepared = None\n    # TODO: append emergency_item only if it is missing.\n    return prepared\n\nprint(prepare_loadout(['scanner', 'cell'], 'map'))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "prepare_loadout(['scanner', 'cell'], 'map')", output: "['scanner', 'cell', 'map']" },
      { label: "NO DUPLICATE", input: "prepare_loadout(['scanner', 'map'], 'map')", output: "['scanner', 'map']" },
    ],
    runtime: {
      minimumCodeLength: 80,
      requiredPatterns: [{ pattern: "(\\[:\\]|\\blist\\s*\\(|\\.copy\\s*\\()", flags: "im", name: "Copies the input list", hint: "Create prepared with items.copy(), list(items), or items[:]." }],
      pythonTests: [
        { name: "Loadout function exists", code: "assert callable(globals().get('prepare_loadout'))", hint: "Keep prepare_loadout(items, emergency_item)." },
        { name: "Adds a missing item", code: "assert prepare_loadout(['scanner', 'cell'], 'map') == ['scanner', 'cell', 'map']", hint: "Append emergency_item to the copied list when missing." },
        { name: "Avoids duplicates", code: "assert prepare_loadout(['scanner', 'map'], 'map') == ['scanner', 'map']", hint: "Check membership before appending." },
        { name: "Preserves caller state", code: "original = ['cell']; result = prepare_loadout(original, 'map'); assert original == ['cell'] and result is not original", hint: "Return a new list instead of mutating items." },
      ],
    },
  };
  if (topic.title === "Tuples") return {
    title: "Beacon coordinate mission",
    instructions: "Complete move_beacon(position, delta). Unpack both three-value tuples and return a new tuple containing their coordinate-wise sum.",
    starterCode: "def move_beacon(position, delta):\n    # TODO: unpack both tuples into meaningful coordinate names.\n    return None\n\nprint(move_beacon((10, 5, -2), (3, -1, 4)))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "move_beacon((10, 5, -2), (3, -1, 4))", output: "(13, 4, 2)" },
      { label: "ORIGIN", input: "move_beacon((0, 0, 0), (-1, 2, 8))", output: "(-1, 2, 8)" },
    ],
    runtime: {
      minimumCodeLength: 70,
      requiredPatterns: [{ pattern: "\\w+\\s*,\\s*\\w+\\s*,\\s*\\w+\\s*=", flags: "im", name: "Unpacks fixed coordinates", hint: "Unpack each three-value tuple into x, y, and z names." }],
      pythonTests: [
        { name: "Coordinate function exists", code: "assert callable(globals().get('move_beacon'))", hint: "Keep move_beacon(position, delta)." },
        { name: "Moves the visible coordinate", code: "assert move_beacon((10, 5, -2), (3, -1, 4)) == (13, 4, 2)", hint: "Add corresponding x, y, and z values." },
        { name: "Returns a tuple", code: "result = move_beacon((0, 0, 0), (-1, 2, 8)); assert result == (-1, 2, 8) and type(result) is tuple", hint: "Return the three results as an immutable tuple." },
        { name: "Uses every coordinate", code: "assert move_beacon((5, 6, 7), (-5, -6, -7)) == (0, 0, 0)", hint: "Do not hard-code any position or delta." },
      ],
    },
  };
  if (topic.title === "Sets") return {
    title: "Missing badge mission",
    instructions: "Complete missing_badges(found, required). Use set difference to remove duplicates and return the missing badge names in alphabetical order.",
    starterCode: "def missing_badges(found, required):\n    # TODO: compare unique groups, then return deterministic output.\n    return None\n\nprint(missing_badges(['cyan', 'cyan'], ['cyan', 'amber', 'violet']))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "found=['cyan', 'cyan'], required=['cyan', 'amber', 'violet']", output: "['amber', 'violet']" },
      { label: "COMPLETE", input: "found=['amber'], required=['amber']", output: "[]" },
    ],
    runtime: {
      minimumCodeLength: 60,
      requiredPatterns: [{ pattern: "\\bset\\s*\\(|\\s-\\s", flags: "im", name: "Uses set membership and difference", hint: "Convert the inputs to sets and subtract found from required." }],
      pythonTests: [
        { name: "Badge function exists", code: "assert callable(globals().get('missing_badges'))", hint: "Keep missing_badges(found, required)." },
        { name: "Finds missing unique badges", code: "assert missing_badges(['cyan', 'cyan'], ['cyan', 'amber', 'violet']) == ['amber', 'violet']", hint: "Return sorted(set(required) - set(found))." },
        { name: "Handles a complete collection", code: "assert missing_badges(['amber'], ['amber']) == []", hint: "An empty difference should become an empty list." },
        { name: "Returns deterministic order", code: "assert missing_badges([], ['zeta', 'alpha', 'zeta']) == ['alpha', 'zeta']", hint: "Sort the unique missing values before returning them." },
      ],
    },
  };
  if (topic.title === "Dictionaries") return {
    title: "Shield profile mission",
    instructions: "Complete apply_damage(profile, damage). Return a copied dictionary, read missing shield as zero with get(), clamp shield at zero, and set status to active or offline without mutating the input.",
    starterCode: "def apply_damage(profile, damage):\n    updated = profile.copy()\n    # TODO: read shield safely, apply damage, and set status.\n    return updated\n\nprint(apply_damage({'name': 'Nova', 'shield': 10}, 4))\n",
    visibleExamples: [
      { label: "VISIBLE EXAMPLE", input: "{'name': 'Nova', 'shield': 10}, damage=4", output: "{'name': 'Nova', 'shield': 6, 'status': 'active'}" },
      { label: "MISSING SHIELD", input: "{'name': 'Kiro'}, damage=2", output: "{'name': 'Kiro', 'shield': 0, 'status': 'offline'}" },
    ],
    runtime: {
      minimumCodeLength: 100,
      requiredPatterns: [{ pattern: "\\.get\\s*\\(", flags: "im", name: "Reads an optional key safely", hint: "Use updated.get('shield', 0)." }],
      pythonTests: [
        { name: "Damage function exists", code: "assert callable(globals().get('apply_damage'))", hint: "Keep apply_damage(profile, damage)." },
        { name: "Updates the visible profile", code: "assert apply_damage({'name': 'Nova', 'shield': 10}, 4) == {'name': 'Nova', 'shield': 6, 'status': 'active'}", hint: "Subtract damage and set active while shield remains above zero." },
        { name: "Handles missing and depleted shield", code: "assert apply_damage({'name': 'Kiro'}, 2) == {'name': 'Kiro', 'shield': 0, 'status': 'offline'} and apply_damage({'shield': 3}, 9)['shield'] == 0", hint: "Default shield to zero and clamp negative results." },
        { name: "Preserves the input dictionary", code: "original = {'name': 'Mira', 'shield': 5}; result = apply_damage(original, 1); assert original == {'name': 'Mira', 'shield': 5} and result is not original", hint: "Modify a copy, not profile itself." },
      ],
    },
  };
  return null;
}

export function buildRoundTwoSQLChallenge(topic: SQLTopic, options: ChallengeOptions): TopicChallenge | null {
  if (options.required && options.worldName === "Query Relay") return {
    title: "Query Relay SQL project",
    instructions: "Return the two strongest online relays. Select distinct name and power, filter online rows, sort power descending with name as a deterministic tie-breaker, and limit the result to two. This project gates the next world.",
    starterCode: "-- Query Relay applied project\nSELECT /* unique name and power */\nFROM relays\nWHERE /* online only */\nORDER BY /* strongest first, then name */\nLIMIT /* exactly two */;\n",
    dataPreview: ["relays · 4 rows", "3 online relays", "Aurora Prime · 96", "Aurora Edge · 82", "Tidal Link · 68"],
    visibleExamples: [
      { label: "FIRST RESULT", input: "Strongest online relay", output: "Aurora Prime · 96" },
      { label: "SECOND RESULT", input: "Next strongest online relay", output: "Aurora Edge · 82" },
    ],
    runtime: {
      minimumCodeLength: 75,
      requiredPatterns: [
        { pattern: "\\bSELECT\\s+DISTINCT\\b", flags: "i", name: "Projects unique results", hint: "Start with SELECT DISTINCT name, power." },
        { pattern: "\\bWHERE\\b", flags: "i", name: "Filters online rows", hint: "Use WHERE online = true." },
        { pattern: "\\bORDER\\s+BY\\b", flags: "i", name: "Defines deterministic ranking", hint: "Order power DESC, then name ASC." },
        { pattern: "\\bLIMIT\\s+2\\b", flags: "i", name: "Returns the requested top two", hint: "Finish with LIMIT 2." },
      ],
      sqlTests: [
        { name: "Project columns are exact", kind: "result-columns", columns: ["name", "power"], hint: "Select name and power explicitly." },
        { name: "Returns exactly two relays", kind: "result-max-rows", minRows: 2, maxRows: 2, hint: "Filter first, then LIMIT 2." },
        { name: "Strongest relays are ordered", kind: "result-ordered-values", column: "name", expected: ["Aurora Prime", "Aurora Edge"], hint: "Sort by power DESC before applying LIMIT." },
      ],
    },
  };
  if (options.required) return null;

  const base = {
    title: topic.title + " SQL mission",
    dataPreview: ["relays · 4 rows", "sectors · 3 rows", "3 online relays", "Power range · 44 to 96"],
  };
  if (topic.title === "WHERE") return { ...base,
    instructions: "Return name and power for relays that are online and have power of at least 80. Do not include any other rows.",
    starterCode: "SELECT name, power\nFROM relays\nWHERE /* both required conditions */;\n",
    visibleExamples: [{ label: "EXPECTED MATCH", input: "online and power >= 80", output: "Aurora Prime, Aurora Edge" }, { label: "EXCLUDED", input: "Tidal Link · online · power 68", output: "Below the threshold" }],
    runtime: { minimumCodeLength: 35, requiredPatterns: [{ pattern: "\\bWHERE\\b[\\s\\S]*\\bAND\\b", flags: "i", name: "Combines both filters", hint: "Use online = true AND power >= 80." }], sqlTests: [
      { name: "Filtered columns are exact", kind: "result-columns", columns: ["name", "power"], hint: "Select name and power." },
      { name: "Only expected relays pass", kind: "result-value", column: "name", expected: ["Aurora Prime", "Aurora Edge"], hint: "Require both online and power >= 80." },
      { name: "No extra rows pass", kind: "result-max-rows", minRows: 2, maxRows: 2, hint: "Use AND rather than OR." },
    ] },
  };
  if (topic.title === "ORDER BY") return { ...base,
    instructions: "Rank every relay from highest to lowest power. Use relay_id ascending as a deterministic tie-breaker and return name and power.",
    starterCode: "SELECT name, power\nFROM relays\nORDER BY /* power direction */, /* stable tie-breaker */;\n",
    visibleExamples: [{ label: "FIRST", input: "Highest power", output: "Aurora Prime · 96" }, { label: "LAST", input: "Lowest power", output: "Ember Gate · 44" }],
    runtime: { minimumCodeLength: 35, requiredPatterns: [{ pattern: "\\bORDER\\s+BY\\b[\\s\\S]*\\bDESC\\b", flags: "i", name: "Ranks descending", hint: "Order by power DESC, relay_id ASC." }], sqlTests: [
      { name: "Ranking columns are exact", kind: "result-columns", columns: ["name", "power"], hint: "Select name and power." },
      { name: "Every relay is ranked", kind: "result-min-rows", minRows: 4, hint: "Do not filter the relay table." },
      { name: "Power ranking is ordered", kind: "result-ordered-values", column: "name", expected: ["Aurora Prime", "Aurora Edge", "Tidal Link", "Ember Gate"], hint: "Sort power from highest to lowest." },
    ] },
  };
  if (topic.title === "LIMIT") return { ...base,
    instructions: "Return the two newest relays deterministically. Order created_at descending, break ties with relay_id descending, then apply LIMIT 2.",
    starterCode: "SELECT relay_id, name, created_at\nFROM relays\nORDER BY /* newest first and stable tie-breaker */\nLIMIT /* count */;\n",
    visibleExamples: [{ label: "NEWEST", input: "Most recent created_at", output: "Tidal Link" }, { label: "RESULT SIZE", input: "Requested preview", output: "Exactly 2 rows" }],
    runtime: { minimumCodeLength: 55, requiredPatterns: [{ pattern: "\\bORDER\\s+BY\\b[\\s\\S]*\\bLIMIT\\s+2\\b", flags: "i", name: "Orders before limiting", hint: "Use ORDER BY created_at DESC, relay_id DESC followed by LIMIT 2." }], sqlTests: [
      { name: "Returns exactly two rows", kind: "result-max-rows", minRows: 2, maxRows: 2, hint: "Use LIMIT 2." },
      { name: "Newest relays are selected", kind: "result-ordered-values", column: "name", expected: ["Tidal Link", "Ember Gate"], hint: "Order newest to oldest before LIMIT." },
    ] },
  };
  if (topic.title === "DISTINCT") return { ...base,
    instructions: "Return the unique region values represented in sectors, alias the result as region, and order it alphabetically.",
    starterCode: "SELECT DISTINCT /* region expression */ AS region\nFROM sectors\nORDER BY region;\n",
    visibleExamples: [{ label: "SOURCE VALUES", input: "north, south, north", output: "north, south" }, { label: "ORDER", input: "Alphabetical", output: "north before south" }],
    runtime: { minimumCodeLength: 35, requiredPatterns: [{ pattern: "\\bSELECT\\s+DISTINCT\\b", flags: "i", name: "Deduplicates the projection", hint: "Use SELECT DISTINCT region." }], sqlTests: [
      { name: "Distinct column is named", kind: "result-columns", columns: ["region"], hint: "Return or alias the column as region." },
      { name: "Unique regions are ordered", kind: "result-ordered-values", column: "region", expected: ["north", "south"], hint: "Select DISTINCT region and ORDER BY region." },
      { name: "Returns one row per region", kind: "result-max-rows", minRows: 2, maxRows: 2, hint: "Do not include sector names in the projection." },
    ] },
  };
  if (topic.title === "Aggregates") return { ...base,
    instructions: "Return one summary row with relay_count, error_count, weakest_power, and strongest_power. Use COUNT(*) for rows and COUNT(last_error) for known errors.",
    starterCode: "SELECT\n  /* all relay rows */ AS relay_count,\n  /* non-null errors */ AS error_count,\n  /* minimum power */ AS weakest_power,\n  /* maximum power */ AS strongest_power\nFROM relays;\n",
    visibleExamples: [{ label: "ROW COUNT", input: "All relays", output: "4" }, { label: "POWER RANGE", input: "MIN and MAX", output: "44 to 96" }],
    runtime: { minimumCodeLength: 80, requiredPatterns: [{ pattern: "\\b(COUNT|MIN|MAX)\\s*\\(", flags: "i", name: "Calculates aggregate measurements", hint: "Use COUNT(*), COUNT(last_error), MIN(power), and MAX(power)." }], sqlTests: [
      { name: "Summary columns are exact", kind: "result-columns", columns: ["relay_count", "error_count", "weakest_power", "strongest_power"], hint: "Alias all four measurements exactly." },
      { name: "Counts every relay", kind: "result-value", column: "relay_count", expected: 4, hint: "Use COUNT(*) AS relay_count." },
      { name: "Counts only known errors", kind: "result-value", column: "error_count", expected: 1, hint: "Use COUNT(last_error) AS error_count." },
      { name: "Finds weakest power", kind: "result-value", column: "weakest_power", expected: 44, hint: "Use MIN(power)." },
      { name: "Finds strongest power", kind: "result-value", column: "strongest_power", expected: 96, hint: "Use MAX(power)." },
    ] },
  };
  return null;
}

