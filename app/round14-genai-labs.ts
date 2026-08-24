import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_FOURTEEN_LABS: Record<string, LabBlueprint> = {
  Reliability: {
    labType: "configuration",
    fileName: "resilient_model_workflow_lab.py",
    dataFiles: ["failure_scenarios.json", "fallback_compatibility.json", "service_levels.json"],
    tools: ["Failure-scenario loader", "Controlled resilience simulator", "Semantic reliability evaluator"],
    requiredCalls: ["load_failure_scenarios", "run_resilient_workflow", "evaluate_reliability_gate"],
    successCriteria: [
      "Define availability, latency, schema, grounding, safety, and cost service levels per task and risk slice",
      "Apply deadlines, classified bounded retries, circuit breakers, capacity limits, idempotency, and load shedding across every dependency",
      "Verify fallback compatibility and graceful degradation under provider faults, overload, malformed output, missing evidence, and ambiguous side effects",
    ],
    mockOutput: "Failure scenarios: 90\nUnbounded retries: 0\nDuplicate side effects: 0\nFallback incompatibilities: 0\nSemantic SLO met: 99.2%\nReliability gate: PASS",
    mission: "Prove that a model workflow preserves useful, safe service across stochastic output, overload, dependency failure, and partial execution.",
  },
  "Advanced security": {
    labType: "system design",
    fileName: "genai_attack_path_lab.py",
    dataFiles: ["attack_paths.json", "trust_boundaries.json", "sandbox_policy.json"],
    tools: ["Attack-path loader", "Controlled adversarial workflow", "Source-to-sink security evaluator"],
    requiredCalls: ["load_attack_paths", "run_adversarial_workflow", "evaluate_security_boundaries"],
    successCriteria: [
      "Track authority and provenance across direct prompts, retrieved documents, files, tool output, memory, generated code, renderers, and cross-tenant stores",
      "Constrain every sensitive sink with scoped credentials, typed tools, resource authorization, egress-denied sandboxes, output encoding, and high-impact approval",
      "Block direct and indirect injection, data exfiltration, unsafe execution, parser confusion, supply-chain tampering, and multi-step privilege escalation",
    ],
    mockOutput: "Adversarial paths: 140\nAuthority inversions: 0\nSecret exfiltrations: 0\nSandbox escapes: 0\nCross-tenant accesses: 0\nSecurity boundaries: PASS",
    mission: "Trace hostile content from every source to every sensitive sink and enforce deterministic isolation outside the model.",
  },
  "Agent authorization": {
    labType: "guided code",
    fileName: "agent_authorization_lab.py",
    dataFiles: ["delegations.json", "tool_requests.json", "approval_events.json"],
    tools: ["Delegation-case loader", "Controlled policy decision point", "Authorization and receipt evaluator"],
    requiredCalls: ["load_authorization_cases", "run_authorized_agent_actions", "evaluate_authorization_receipts"],
    successCriteria: [
      "Bind authority to authenticated subject, tenant, tool, action, resource, purpose, expiry, workflow state, and spend or count limits",
      "Revalidate typed arguments and current resource state immediately before execution, including after approvals and long waits",
      "Record policy version, delegation chain, approval receipt, idempotency key, request digest, effect, and terminal outcome for reconciliation",
    ],
    mockOutput: "Authorization cases: 112\nSelf-granted capabilities: 0\nStale approvals accepted: 0\nScope escapes: 0\nAmbiguous retries reconciled: 18/18\nAuthorization gate: PASS",
    mission: "Allow agents to propose actions while deterministic policy, narrow delegation, and fresh informed consent retain control of every effect.",
  },
  "GenAI system design": {
    labType: "system design",
    fileName: "genai_system_design_lab.py",
    dataFiles: ["product_requirements.json", "failure_modes.json", "release_evidence.json"],
    tools: ["Requirement-case loader", "Controlled architecture composer", "End-to-end design evaluator"],
    requiredCalls: ["load_system_requirements", "run_system_design", "evaluate_architecture_contract"],
    successCriteria: [
      "Map user outcomes, task slices, uncertainty, quality, safety, privacy, latency, availability, and cost to explicit component responsibilities",
      "Separate probabilistic generation from deterministic identity, authorization, validation, state ownership, budgets, idempotency, and side effects",
      "Version and observe models, prompts, data, retrieval, tools, policy, and evaluations with compatible degradation, canaries, feedback, and rollback",
    ],
    mockOutput: "Architecture cases: 64\nUnowned states: 0\nImplicit trust boundaries: 0\nUnbounded failure paths: 0\nRollback coverage: 100%\nReliability & Security: STABLE",
    mission: "Turn product requirements into a measurable, replaceable, secure GenAI architecture with explicit ownership and recovery.",
  },
};

export function buildRoundFourteenGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_FOURTEEN_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize Reliability & Security by proving semantic service levels under failure, blocking source-to-sink attack paths, enforcing scoped agent authorization, and producing an end-to-end architecture with explicit trust, state, evaluation, and rollback. This applied project completes the world's checkpoint."
    : blueprint.mission;
  const starterCode = [
    "# CodeCraft controlled GenAI lab",
    "# Mock tools only — no API key, credits, uploads, external models, agents, or external calls required.",
    "from codecraft_ai import " + blueprint.requiredCalls.join(", "),
    "",
    "topic = " + JSON.stringify(topic.title),
    "mission = " + JSON.stringify(blueprint.mission),
    "input_data = " + blueprint.requiredCalls[0] + "(" + JSON.stringify(blueprint.dataFiles[0]) + ")",
    "",
    "# TODO 1: run the controlled resilience, security, authorization, or design workflow.",
    "# TODO 2: store the response in a variable named result.",
    "# TODO 3: evaluate result with the final tool, then print the report.",
    "",
  ].join("\n");
  return { ...blueprint, title, brief, starterCode, required };
}
