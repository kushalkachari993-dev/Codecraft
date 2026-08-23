import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_EIGHT_LABS: Record<string, LabBlueprint> = {
  "Agent workflows": {
    labType: "system design",
    fileName: "agent_workflow_recovery_lab.py",
    dataFiles: ["workflow_cases.json", "transition_policy.json", "side_effect_ledger.json"],
    tools: ["Workflow-case loader", "Controlled workflow simulator", "Recovery-path evaluator"],
    requiredCalls: ["load_workflow_cases", "run_recoverable_workflow", "evaluate_workflow_recovery"],
    successCriteria: ["Keep deterministic policy and authorization outside model nodes", "Define success, retry, cancellation, approval, and terminal-failure edges", "Resume with checkpoints and idempotency keys without duplicating effects"],
    mockOutput: "Workflow cases: 42\nInvalid transitions: 0\nDuplicate effects after retry: 0\nApproval routing recall: 100%\nWorkflow recovery: PASS",
    mission: "Design a hybrid agent workflow whose explicit transitions and replay-safe effects recover cleanly from interruption.",
  },
  LangChain: {
    labType: "guided code",
    fileName: "langchain_boundary_lab.py",
    dataFiles: ["chain_inputs.json", "provider_failures.json", "structured_contract.json"],
    tools: ["Runnable-input loader", "Controlled chain runner", "Boundary and trace evaluator"],
    requiredCalls: ["load_chain_cases", "run_typed_chain", "evaluate_chain_boundaries"],
    successCriteria: ["Keep domain policy outside framework callbacks", "Validate typed stage inputs and structured outputs", "Trace retrieval, model, parsing, latency, and provider errors without exposing secrets"],
    mockOutput: "Chain cases: 35\nSchema-valid outputs: 100%\nProvider errors normalized: 8/8\nHidden policy callbacks: 0\nChain boundary: PASS",
    mission: "Compose a typed, observable chain while isolating provider and framework details from application policy.",
  },
  LangGraph: {
    labType: "configuration",
    fileName: "langgraph_checkpoint_lab.py",
    dataFiles: ["graph_runs.json", "checkpoint_events.json", "cycle_limits.json"],
    tools: ["Graph-run loader", "Controlled checkpoint replay", "Cycle and idempotency evaluator"],
    requiredCalls: ["load_graph_runs", "replay_checkpointed_graph", "evaluate_graph_recovery"],
    successCriteria: ["Use typed state and deterministic reducers", "Bound every cycle and route stalled work to escalation", "Resume checkpoints without replaying completed external effects"],
    mockOutput: "Graph runs: 30\nCheckpoint resumes: 12/12\nCycle-limit escapes: 6/6\nDuplicate external effects: 0\nGraph recovery: PASS",
    mission: "Evaluate a checkpointed state graph for bounded cycles, valid state merges, and replay-safe recovery.",
  },
  MCP: {
    labType: "security review",
    fileName: "mcp_trust_boundary_lab.py",
    dataFiles: ["server_capabilities.json", "tool_requests.json", "hostile_resources.json"],
    tools: ["MCP case loader", "Controlled client policy engine", "Trust-boundary evaluator"],
    requiredCalls: ["load_mcp_cases", "run_policy_controlled_mcp_client", "evaluate_mcp_boundaries"],
    successCriteria: ["Verify server identity and capability negotiation", "Authorize tool calls from user identity and scope rather than tool descriptions", "Treat resources and tool results as untrusted data and prevent instruction-driven escalation"],
    mockOutput: "MCP cases: 40\nUnauthorized calls: 0\nSchema violations blocked: 100%\nHostile resource escalations: 0\nMCP boundary: PASS",
    mission: "Harden an MCP client so interoperability never bypasses identity, consent, authorization, or content trust boundaries.",
  },
  Evaluation: {
    labType: "evaluation",
    fileName: "evaluation_release_gate_lab.py",
    dataFiles: ["workflow_eval_set.json", "expert_judgments.json", "release_candidates.json"],
    tools: ["Versioned eval-set loader", "Controlled multi-grader runner", "Release-gate evaluator"],
    requiredCalls: ["load_evaluation_suite", "run_calibrated_evaluation", "evaluate_release_gate"],
    successCriteria: ["Report quality and risk by task, difficulty, user, and failure-severity slices", "Calibrate model graders against expert labels and deterministic checks", "Block hard safety regressions, compare uncertainty, and retain production-monitoring feedback"],
    mockOutput: "Evaluation cases: 120\nDeterministic checks: 100%\nJudge/expert agreement: 0.91\nCritical regressions: 0\nRelease decision: APPROVED\nWorkflow Graphs: STABLE",
    mission: "Build a calibrated, slice-aware evaluation gate that converts workflow behavior into defensible release evidence.",
  },
};

export function buildRoundEightGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_EIGHT_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize Workflow Graphs by releasing a recoverable hybrid agent workflow with typed framework boundaries, checkpointed graph execution, policy-controlled MCP connections, and a calibrated evaluation gate. This applied project completes the world's checkpoint."
    : blueprint.mission;
  const starterCode = [
    "# CodeCraft controlled GenAI lab",
    "# Mock tools only — no API key, credits, uploads, or external calls required.",
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
