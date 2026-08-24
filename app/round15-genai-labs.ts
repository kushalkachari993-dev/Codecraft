import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_FIFTEEN_LABS: Record<string, LabBlueprint> = {
  "Distributed systems": {
    labType: "system design",
    fileName: "durable_distributed_workflow_lab.py",
    dataFiles: ["ambiguous_outcomes.json", "delivery_histories.json", "capacity_failures.json"],
    tools: ["Distributed-scenario loader", "Controlled durable workflow simulator", "Replay and capacity evaluator"],
    requiredCalls: ["load_distributed_cases", "run_durable_workflow", "evaluate_distributed_invariants"],
    successCriteria: [
      "Persist versioned state transitions and stable operation identifiers around model jobs, queue delivery, tools, approvals, side effects, and terminal outcomes",
      "Reconcile ambiguous timeouts, duplicate delivery, stale workers, partial failure, cancellation, and compensation without repeating consequential effects",
      "Bound queues, concurrency, retries, tenant capacity, deadlines, and cost while measuring oldest-work age, saturation, success per attempt, and recovery",
    ],
    mockOutput: "Distributed cases: 108\nLost transitions: 0\nDuplicate effects: 0\nAmbiguous outcomes reconciled: 21/21\nCapacity breaches: 0\nDistributed invariants: PASS",
    mission: "Prove a GenAI workflow can survive partial failure and repeated delivery while deterministic state and bounded capacity preserve every invariant.",
  },
  "Docker/Kubernetes/GPU": {
    labType: "configuration",
    fileName: "gpu_platform_release_lab.py",
    dataFiles: ["gpu_workloads.json", "compatibility_matrix.json", "rollout_failures.json"],
    tools: ["GPU-workload loader", "Controlled cluster scheduler", "Compatibility and readiness evaluator"],
    requiredCalls: ["load_gpu_platform_cases", "run_gpu_release_plan", "evaluate_gpu_platform_gate"],
    successCriteria: [
      "Bind image, model, tokenizer, runtime, CUDA user-space, driver compatibility, weights, SBOM, signature, and security policy into one immutable release manifest",
      "Schedule GPU memory, device topology, interconnect, quotas, priority, isolation, disruption budget, storage, and network requirements without oversubscription",
      "Verify warmup, bounded inference readiness, draining, canary health, rollback, and scaling from queue, token, latency, and accelerator saturation signals",
    ],
    mockOutput: "GPU release cases: 72\nCompatibility mismatches: 0\nUnschedulable workloads: 0\nFalse-ready replicas: 0\nCanary regressions: 0\nGPU platform gate: PASS",
    mission: "Release a reproducible GPU inference service whose artifact compatibility, scheduling, readiness, and rollback are proven before traffic expands.",
  },
  LLMOps: {
    labType: "configuration",
    fileName: "llmops_promotion_lab.py",
    dataFiles: ["artifact_lineage.json", "evaluation_reports.json", "promotion_policies.json"],
    tools: ["Artifact-lineage loader", "Controlled promotion workflow", "Governance and rollback evaluator"],
    requiredCalls: ["load_llmops_releases", "run_llmops_promotion", "evaluate_release_lineage"],
    successCriteria: [
      "Version application, prompt, model, adapter, tokenizer, dataset, retrieval snapshot, tool, policy, grader, runtime, and configuration with ownership and provenance",
      "Promote only the evaluated artifact bundle through frozen quality, safety, security, reliability, and cost gates with required approvals and environment parity",
      "Trace production outcomes to versions, canary changes, detect drift, roll back compatible bundles, handle incidents, deprecate consumers, and honor data deletion",
    ],
    mockOutput: "Release bundles: 48\nUnversioned artifacts: 0\nLineage gaps: 0\nGate bypasses: 0\nRollback drills passed: 12/12\nLLMOps promotion: PASS",
    mission: "Build an auditable control plane that promotes only complete evaluated GenAI artifact bundles and can safely trace, roll back, or retire them.",
  },
  "Production feedback loops": {
    labType: "guided code",
    fileName: "production_feedback_loop_lab.py",
    dataFiles: ["feedback_events.json", "sampled_traces.json", "consent_policy.json"],
    tools: ["Feedback-case loader", "Controlled triage and evaluation pipeline", "Outcome and leakage evaluator"],
    requiredCalls: ["load_feedback_cases", "run_feedback_loop", "evaluate_feedback_outcomes"],
    successCriteria: [
      "Capture consented task context, explicit intent, outcome, correction, trace reference, artifact versions, tenant scope, retention, and deletion controls while minimizing sensitive content",
      "Triage product, retrieval, model, policy, tool, data, and UX failures; deduplicate; sample silent successes; adjudicate ambiguity; and preserve holdout separation",
      "Convert recurring failures into regression cases, validate the smallest candidate change, canary it, and attribute improved outcomes without adjacent quality, safety, privacy, or cost regressions",
    ],
    mockOutput: "Feedback events: 150\nConsent violations: 0\nRaw signals treated as labels: 0\nHoldout leaks: 0\nVerified outcome gain: +9.4%\nPlatform Frontier: STABLE",
    mission: "Turn privacy-governed production evidence into new evaluations and release only changes that measurably improve user outcomes.",
  },
};

export function buildRoundFifteenGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_FIFTEEN_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize Platform Frontier by proving durable distributed execution, releasing a compatible GPU platform, governing complete LLM artifact promotion, and closing a privacy-safe production feedback loop. This applied project completes the world's checkpoint."
    : blueprint.mission;
  const starterCode = [
    "# CodeCraft controlled GenAI lab",
    "# Mock tools only — no API key, credits, uploads, external models, clusters, agents, or external calls required.",
    "from codecraft_ai import " + blueprint.requiredCalls.join(", "),
    "",
    "topic = " + JSON.stringify(topic.title),
    "mission = " + JSON.stringify(blueprint.mission),
    "input_data = " + blueprint.requiredCalls[0] + "(" + JSON.stringify(blueprint.dataFiles[0]) + ")",
    "",
    "# TODO 1: run the controlled platform workflow.",
    "# TODO 2: store the response in a variable named result.",
    "# TODO 3: evaluate result with the final tool, then print the report.",
    "",
  ].join("\n");
  return { ...blueprint, title, brief, starterCode, required };
}
