import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_SEVEN_LABS: Record<string, LabBlueprint> = {
  "Model selection": {
    labType: "evaluation",
    fileName: "model_selection_bakeoff.py",
    dataFiles: ["support_task_slices.json", "candidate_model_runs.json", "hard_release_gates.json"],
    tools: ["Task-slice loader", "Controlled candidate runner", "Quality-latency-cost evaluator"],
    requiredCalls: ["load_model_candidates", "run_candidate_bakeoff", "evaluate_model_selection"],
    successCriteria: ["Apply safety and reliability gates before weighted ranking", "Compare quality, p95 latency, cost, structured output, and tool success", "Report results by common, difficult, high-risk, and long-context slices"],
    mockOutput: "Candidates: 3\nHard-gate survivors: 2\nSelected default: swift-2\nEscalation model: reason-4\np95 latency: 820 ms\nSelection evidence: PASS",
    mission: "Select a default and escalation model using representative task slices and non-negotiable release gates.",
  },
  Agents: {
    labType: "system design",
    fileName: "bounded_agent_lab.py",
    dataFiles: ["agent_goals.json", "tool_permissions.json", "approval_cases.json"],
    tools: ["Goal-case loader", "Policy-controlled agent simulator", "Autonomy evaluator"],
    requiredCalls: ["load_agent_cases", "run_bounded_agent", "evaluate_agent_controls"],
    successCriteria: ["Use measurable goals and completion evidence", "Authorize every tool call outside the model", "Require approval for costly or externally visible actions"],
    mockOutput: "Cases: 36\nUnauthorized tool calls: 0\nApproval recall: 100%\nFalse completion: 0\nBounded agent: PASS",
    mission: "Design a bounded agent whose tools, permissions, completion evidence, and approval points match action risk.",
  },
  "Agent loops": {
    labType: "guided code",
    fileName: "agent_loop_breakers_lab.py",
    dataFiles: ["loop_scenarios.json", "tool_result_events.json", "budget_policy.json"],
    tools: ["Loop-scenario loader", "Controlled observe-act runner", "Loop-safety evaluator"],
    requiredCalls: ["load_loop_scenarios", "run_bounded_agent_loop", "evaluate_loop_breakers"],
    successCriteria: ["Normalize tool success and failure observations", "Enforce step, time, and cost budgets", "Detect repeated actions, stalled state, and unverified completion"],
    mockOutput: "Scenarios: 28\nBudget violations: 0\nRepeated-action stops: 5/5\nVerified completions: 14/14\nLoop controls: PASS",
    mission: "Run observe-decide-act cycles with deterministic breakers and application-verified completion.",
  },
  "Agent state": {
    labType: "configuration",
    fileName: "durable_agent_state_lab.py",
    dataFiles: ["state_transitions.json", "retry_events.json", "schema_versions.json"],
    tools: ["State-event loader", "Controlled transition reducer", "Resume and replay evaluator"],
    requiredCalls: ["load_agent_state_events", "reduce_agent_state", "evaluate_state_recovery"],
    successCriteria: ["Reject invalid state transitions", "Resume retries without duplicating effects", "Migrate versioned state while excluding secrets from model-visible fields"],
    mockOutput: "Transitions checked: 64\nInvalid transitions accepted: 0\nDuplicate effects after replay: 0\nSchema migrations: PASS\nDurable state: PASS",
    mission: "Model typed, versioned agent state that can be replayed and resumed safely across retries and releases.",
  },
  Memory: {
    labType: "system design",
    fileName: "governed_memory_lab.py",
    dataFiles: ["memory_candidates.json", "consent_and_scope.json", "retrieval_judgments.json"],
    tools: ["Memory-policy loader", "Controlled write and retrieval simulator", "Privacy and relevance evaluator"],
    requiredCalls: ["load_memory_cases", "run_governed_memory", "evaluate_memory_policy"],
    successCriteria: ["Write only consented, useful memories with provenance and expiry", "Enforce tenant and user scope before similarity ranking", "Support correction and deletion while measuring relevance and staleness"],
    mockOutput: "Memory cases: 50\nCross-tenant leaks: 0\nUnconsented writes: 0\nCorrection/deletion: PASS\nRetrieval relevance: 0.94\nAgent Relay: STABLE",
    mission: "Build a governed memory lifecycle with selective writes, scoped retrieval, provenance, expiry, correction, and deletion.",
  },
};

export function buildRoundSevenGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_SEVEN_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize the Agent Relay by selecting models with evidence, enforcing bounded tools and loop breakers, persisting typed state safely, and releasing governed memory with privacy controls. This applied project completes the world's checkpoint."
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
