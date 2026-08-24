import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_THIRTEEN_LABS: Record<string, LabBlueprint> = {
  "Evaluation engineering": {
    labType: "configuration",
    fileName: "evaluation_release_gate_lab.py",
    dataFiles: ["evaluation_cases.json", "human_labels.json", "release_candidates.json"],
    tools: ["Versioned evaluation-case loader", "Controlled evaluation runner", "Release-gate evaluator"],
    requiredCalls: ["load_evaluation_cases", "run_evaluation_suite", "evaluate_release_gate"],
    successCriteria: [
      "Translate product promises and safety boundaries into versioned contracts, representative slices, counterexamples, and leakage-resistant holdouts",
      "Combine deterministic checks, calibrated model graders, and blinded human review while measuring grader agreement and uncertainty",
      "Compare candidates against a frozen baseline with confidence intervals, regression budgets, and explicit block, review, or release gates",
    ],
    mockOutput: "Evaluation cases: 120\nSlice regressions: 0\nGrader agreement: 0.91\nLeakage checks: PASS\nEvaluation gate: PASS",
    mission: "Design a repeatable evaluation release gate that measures the real product contract instead of a single average score.",
  },
  "Agent evaluation": {
    labType: "guided code",
    fileName: "agent_trajectory_eval_lab.py",
    dataFiles: ["agent_trajectories.json", "tool_policies.json", "recovery_cases.json"],
    tools: ["Trajectory-case loader", "Controlled agent replay", "Outcome and policy evaluator"],
    requiredCalls: ["load_agent_trajectories", "run_agent_evaluation", "evaluate_agent_release"],
    successCriteria: [
      "Score task outcome, evidence quality, trajectory efficiency, tool choice, argument validity, authorization, and side effects separately",
      "Replay timeouts, partial failures, stale state, denied tools, and ambiguous outcomes to test bounded recovery and escalation",
      "Report success per cost and latency alongside unsafe-action, duplicate-side-effect, no-progress-loop, and human-handoff rates",
    ],
    mockOutput: "Agent trajectories: 96\nUnauthorized actions: 0\nDuplicate side effects: 0\nRecovery pass rate: 100%\nAgent release: PASS",
    mission: "Evaluate an agent as a stateful decision system, including its tool trajectory, recovery behavior, and real-world side effects.",
  },
  Observability: {
    labType: "system design",
    fileName: "genai_observability_lab.py",
    dataFiles: ["trace_cases.json", "redaction_policy.json", "quality_signals.json"],
    tools: ["Trace-case loader", "Controlled telemetry pipeline", "Coverage and privacy evaluator"],
    requiredCalls: ["load_trace_cases", "run_observability_pipeline", "evaluate_observability_coverage"],
    successCriteria: [
      "Correlate request, retrieval, model, tool, agent-step, cache, fallback, and user-feedback spans with versioned configuration",
      "Capture latency, token and cost totals, errors, quality signals, and terminal outcomes without storing unnecessary prompts or secrets",
      "Apply sampling, redaction, retention, tenant isolation, and access controls while preserving enough evidence for debugging and evaluation replay",
    ],
    mockOutput: "Trace cases: 84\nBroken correlations: 0\nSecret leaks: 0\nQuality-signal coverage: 98.8%\nObservability coverage: PASS",
    mission: "Build privacy-aware end-to-end telemetry that connects system behavior, cost, quality, and user outcomes.",
  },
  "Cost optimization": {
    labType: "configuration",
    fileName: "cost_quality_frontier_lab.py",
    dataFiles: ["cost_cases.json", "quality_thresholds.json", "usage_traces.json"],
    tools: ["Cost-case loader", "Controlled optimization simulator", "Quality-frontier evaluator"],
    requiredCalls: ["load_cost_cases", "run_cost_optimization", "evaluate_cost_quality_frontier"],
    successCriteria: [
      "Measure cost per successful outcome by feature, tenant, model, prompt version, retrieval path, tool, retry, and failure class",
      "Remove waste through bounded context, caching, batching, early exits, streaming, smaller qualified models, and retry controls",
      "Protect quality and safety with slice-level gates, rollback thresholds, canaries, and a Pareto frontier instead of optimizing token price alone",
    ],
    mockOutput: "Cost scenarios: 72\nCost per success: -31.4%\nQuality regressions: 0\nSafety regressions: 0\nCost-quality frontier: IMPROVED",
    mission: "Reduce cost per successful user outcome while holding every quality and safety constraint.",
  },
  "Model routing": {
    labType: "system design",
    fileName: "model_routing_lab.py",
    dataFiles: ["routing_cases.json", "model_capabilities.json", "fallback_policy.json"],
    tools: ["Routing-case loader", "Controlled model router", "Routing-policy evaluator"],
    requiredCalls: ["load_routing_cases", "run_model_router", "evaluate_routing_policy"],
    successCriteria: [
      "Filter candidates by capability, modality, context, tool support, jurisdiction, privacy, safety, and availability before optimizing price or latency",
      "Use calibrated task and risk signals with explicit confidence, deterministic overrides, budgets, and bounded fallback escalation",
      "Evaluate routing against one-model and oracle baselines with shadow traffic, per-slice quality, cost, latency, failure, drift, and rollback metrics",
    ],
    mockOutput: "Routing cases: 110\nPolicy violations: 0\nQuality versus baseline: +6.2%\nCost per success: -24.7%\nFallback loops: 0\nEvaluation Operations: STABLE",
    mission: "Route each request to the least expensive eligible model that can meet its measured quality, safety, and reliability contract.",
  },
};

export function buildRoundThirteenGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_THIRTEEN_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize Evaluation Operations by building a versioned release gate, judging complete agent trajectories, tracing quality and cost safely, improving the cost-quality frontier, and deploying a measured model-routing policy. This applied project completes the world's checkpoint."
    : blueprint.mission;
  const starterCode = [
    "# CodeCraft controlled GenAI lab",
    "# Mock tools only — no API key, credits, uploads, external models, or external calls required.",
    "from codecraft_ai import " + blueprint.requiredCalls.join(", "),
    "",
    "topic = " + JSON.stringify(topic.title),
    "mission = " + JSON.stringify(blueprint.mission),
    "input_data = " + blueprint.requiredCalls[0] + "(" + JSON.stringify(blueprint.dataFiles[0]) + ")",
    "",
    "# TODO 1: process input_data with the controlled evaluation or routing tool.",
    "# TODO 2: store the response in a variable named result.",
    "# TODO 3: evaluate result with the final tool, then print the report.",
    "",
  ].join("\n");
  return { ...blueprint, title, brief, starterCode, required };
}
