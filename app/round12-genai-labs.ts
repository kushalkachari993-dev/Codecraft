import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_TWELVE_LABS: Record<string, LabBlueprint> = {
  "Context engineering": {
    labType: "context systems evaluation",
    fileName: "authority_context_lab.py",
    dataFiles: ["context_snapshots.json", "authority_policy.json", "token_budgets.json"],
    tools: ["Context-snapshot loader", "Controlled context assembler", "Authority and evidence evaluator"],
    requiredCalls: ["load_context_cases", "run_context_assembly", "evaluate_context_system"],
    successCriteria: ["Order trusted policy, user intent, evidence, memory, tools, and examples without allowing untrusted content to grant authority", "Allocate input, tool, and output budgets while preserving critical qualifiers, provenance, and uncertainty through compression", "Measure instruction adherence, evidence recall, conflict resolution, citation support, injection resistance, latency, and cost on complete context snapshots"],
    mockOutput: "Context cases: 80\nAuthority inversions: 0\nUnsupported compressed claims: 0\nOutput-budget failures: 0\nInjection boundary: PASS\nContext system: READY",
    mission: "Assemble and evaluate complete model context with explicit authority, evidence lineage, compression, and token budgets.",
  },
  "Advanced agents": {
    labType: "agent control evaluation",
    fileName: "authorized_agent_loop_lab.py",
    dataFiles: ["agent_goals.json", "tool_policies.json", "loop_failures.json"],
    tools: ["Agent-case loader", "Controlled authorized-agent runner", "Progress and safety evaluator"],
    requiredCalls: ["load_advanced_agent_cases", "run_authorized_agent_loop", "evaluate_agent_control"],
    successCriteria: ["Represent typed goals, observations, actions, state, budgets, approvals, and terminal outcomes in an inspectable loop", "Validate and authorize every tool call outside the model with scope, idempotency, and high-impact approval", "Detect repetition, no progress, ambiguous outcomes, cost exhaustion, and partial failure before unsafe retries or endless execution"],
    mockOutput: "Agent missions: 64\nUnauthorized actions: 0\nDuplicate side effects: 0\nNo-progress loops stopped: 12/12\nAmbiguous outcomes escalated: 9/9\nAgent control: PASS",
    mission: "Release an agent loop whose reasoning remains flexible while authorization, budgets, idempotency, and stopping remain deterministic.",
  },
  "Durable agents": {
    labType: "durable workflow simulation",
    fileName: "durable_agent_recovery_lab.py",
    dataFiles: ["workflow_histories.json", "activity_results.json", "recovery_scenarios.json"],
    tools: ["Workflow-history loader", "Controlled crash-and-resume simulator", "Durability evaluator"],
    requiredCalls: ["load_durable_workflows", "run_durable_agent_recovery", "evaluate_workflow_durability"],
    successCriteria: ["Persist versioned workflow state and append-only transitions around every meaningful decision, wait, approval, and activity result", "Use leases, idempotency keys, recorded outcomes, bounded retries, timeouts, and deterministic orchestration to survive duplicate delivery", "Recover across crashes and code versions while revalidating authorization and resource state after long pauses"],
    mockOutput: "Recovery scenarios: 54\nLost transitions: 0\nDuplicate side effects: 0\nLease conflicts contained: 14/14\nStale approvals rejected: 8/8\nDurable recovery: PASS",
    mission: "Prove that a long-running agent can crash, wait, retry, upgrade, and resume without losing state or repeating side effects.",
  },
  "Multi-agent systems": {
    labType: "coordination evaluation",
    fileName: "multi_agent_coordination_lab.py",
    dataFiles: ["delegation_graphs.json", "handoff_contracts.json", "conflict_cases.json"],
    tools: ["Coordination-case loader", "Controlled multi-agent orchestrator", "Delegation and merge evaluator"],
    requiredCalls: ["load_multi_agent_cases", "run_bounded_coordination", "evaluate_multi_agent_system"],
    successCriteria: ["Delegate only independent bounded subtasks with typed inputs, outputs, budgets, permissions, and stop conditions", "Preserve evidence provenance, versioned shared state, write ownership, timeout handling, and deterministic conflict resolution", "Demonstrate end-to-end quality or latency benefit over one capable agent after duplication, handoff loss, cost, and unsafe-action risk"],
    mockOutput: "Coordination cases: 45\nAuthority leaks: 0\nUnresolved write conflicts: 0\nUnsupported handoffs: 0\nDuplicate work rate: 3.1%\nMulti-agent benefit: PROVEN",
    mission: "Evaluate bounded multi-agent delegation and accept it only when coordination evidence beats a simpler single-agent baseline.",
  },
  "Advanced memory": {
    labType: "memory governance evaluation",
    fileName: "governed_memory_lab.py",
    dataFiles: ["memory_records.json", "consent_policy.json", "deletion_events.json"],
    tools: ["Memory-case loader", "Controlled governed-memory system", "Recall and lifecycle evaluator"],
    requiredCalls: ["load_memory_cases", "run_governed_memory", "evaluate_memory_governance"],
    successCriteria: ["Separate working, episodic, semantic, procedural, and workflow memory with source, tenant, consent, sensitivity, confidence, and expiry", "Gate writes and retrieval by present task and authorization while reconciling contradictions by explicit authority, recency, and correction rules", "Propagate edits and deletion tombstones through primary records, summaries, embeddings, caches, backups, and evaluation fixtures"],
    mockOutput: "Memory cases: 90\nCross-tenant recalls: 0\nStale fact decisions: 0\nDeletion propagation: 100%\nHelpful recall gain: +18.3%\nContext & Agent Core: STABLE",
    mission: "Build a governed memory lifecycle that improves future work without retaining, recalling, or trusting information beyond its authority and purpose.",
  },
};

export function buildRoundTwelveGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_TWELVE_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize Context & Agent Core by assembling authority-aware context, enforcing a bounded agent loop, proving crash-safe durable execution, coordinating specialized agents with deterministic ownership, and governing long-term memory through correction and deletion. This applied project completes the world's checkpoint."
    : blueprint.mission;
  const starterCode = [
    "# CodeCraft controlled GenAI lab",
    "# Mock tools only — no API key, credits, uploads, external agents, or external calls required.",
    "from codecraft_ai import " + blueprint.requiredCalls.join(", "),
    "",
    "topic = " + JSON.stringify(topic.title),
    "mission = " + JSON.stringify(blueprint.mission),
    "input_data = " + blueprint.requiredCalls[0] + "(" + JSON.stringify(blueprint.dataFiles[0]) + ")",
    "",
    "# TODO 1: process input_data with the controlled system tool.",
    "# TODO 2: store the response in a variable named result.",
    "# TODO 3: evaluate result with the final tool, then print the report.",
    "",
  ].join("\n");
  return { ...blueprint, title, brief, starterCode, required };
}
