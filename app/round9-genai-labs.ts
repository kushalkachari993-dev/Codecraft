import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_NINE_LABS: Record<string, LabBlueprint> = {
  Guardrails: {
    labType: "evaluation",
    fileName: "layered_guardrails_lab.py",
    dataFiles: ["risk_scenarios.json", "guardrail_policy.json", "human_review_labels.json"],
    tools: ["Risk-scenario loader", "Controlled layered-policy runner", "Safety and friction evaluator"],
    requiredCalls: ["load_guardrail_cases", "run_layered_guardrails", "evaluate_guardrail_tradeoffs"],
    successCriteria: ["Place independent controls before, during, and after model execution", "Enforce tool authorization and high-risk approval outside the model", "Measure bypasses, false positives, latency, and uneven impact by scenario"],
    mockOutput: "Guardrail cases: 90\nCritical bypasses: 0\nTool authorization failures: 0\nFalse-positive rate: 2.1%\nHuman escalation recall: 100%\nGuardrails: PASS",
    mission: "Evaluate layered guardrails against both unsafe bypasses and legitimate-user friction before release.",
  },
  "Prompt injection": {
    labType: "security review",
    fileName: "prompt_injection_boundary_lab.py",
    dataFiles: ["direct_indirect_attacks.json", "tool_permissions.json", "retrieved_content.json"],
    tools: ["Injection-case loader", "Controlled trust-zone simulator", "Injection impact evaluator"],
    requiredCalls: ["load_injection_cases", "run_trust_zoned_agent", "evaluate_injection_resilience"],
    successCriteria: ["Mark user, retrieval, memory, and tool output as untrusted data", "Prevent content from granting permissions or changing tool scope", "Require deterministic authorization and approval so successful manipulation has bounded impact"],
    mockOutput: "Injection cases: 75\nInstruction-boundary violations: 0\nUnauthorized tool calls: 0\nCross-scope retrievals: 0\nInjection resilience: PASS",
    mission: "Test direct and indirect prompt injection across every content source while keeping action authority outside model reasoning.",
  },
  Security: {
    labType: "security review",
    fileName: "genai_threat_model_lab.py",
    dataFiles: ["system_data_flow.json", "threat_scenarios.json", "security_controls.json"],
    tools: ["System-boundary loader", "Controlled threat simulation", "Defense-coverage evaluator"],
    requiredCalls: ["load_security_scenarios", "run_genai_threat_model", "evaluate_security_coverage"],
    successCriteria: ["Cover identity, tenant isolation, secrets, retrieval, tools, output interpreters, logs, and eval data", "Treat generated output as untrusted before execution or rendering", "Map preventive, detective, and recovery controls to high-impact attack paths"],
    mockOutput: "Threat scenarios: 64\nCross-tenant disclosures: 0\nSecret exposures: 0\nUnsafe output executions: 0\nHigh-risk control coverage: 100%\nSecurity review: PASS",
    mission: "Threat-model the complete GenAI data and action path, including ordinary application vulnerabilities and model-specific manipulation.",
  },
  Streaming: {
    labType: "guided code",
    fileName: "typed_streaming_lab.py",
    dataFiles: ["stream_events.json", "disconnect_cases.json", "partial_output_policy.json"],
    tools: ["Stream-case loader", "Controlled event consumer", "Cancellation and completion evaluator"],
    requiredCalls: ["load_stream_cases", "run_typed_stream_consumer", "evaluate_stream_safety"],
    successCriteria: ["Handle text, tool, citation, usage, error, and completion events by type", "Propagate disconnect cancellation to model and tool work", "Never commit partial structured output or mark interrupted output complete"],
    mockOutput: "Streams: 40\nTyped events handled: 100%\nCancellation propagation: 12/12\nPartial outputs committed: 0\nResource leaks: 0\nStreaming: PASS",
    mission: "Build a typed stream consumer with safe partial rendering, cancellation propagation, and explicit terminal state.",
  },
  Caching: {
    labType: "system design",
    fileName: "tenant_safe_cache_lab.py",
    dataFiles: ["cache_requests.json", "source_versions.json", "authorization_scopes.json"],
    tools: ["Cache-case loader", "Controlled cache simulator", "Freshness and isolation evaluator"],
    requiredCalls: ["load_cache_cases", "run_scoped_genai_cache", "evaluate_cache_policy"],
    successCriteria: ["Key by tenant, authorization scope, model, prompt, tools, parameters, input, source, and policy version", "Apply TTL, event invalidation, and high-risk bypass rules", "Measure hit quality, staleness, cross-scope isolation, latency, and cost rather than hit rate alone"],
    mockOutput: "Cache cases: 80\nCross-tenant hits: 0\nStale high-risk answers: 0\nInvalidation checks: PASS\nQualified hit rate: 61%\nSafety & Scale: STABLE",
    mission: "Release a tenant-safe GenAI cache whose keys, freshness, and bypass policy preserve correctness while reducing cost.",
  },
};

export function buildRoundNineGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_NINE_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize Safety & Scale by releasing layered guardrails, prompt-injection trust zones, full-path security controls, typed cancellation-safe streaming, and a tenant-isolated cache with measured freshness. This applied project completes the world's checkpoint."
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
