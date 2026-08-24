import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_ELEVEN_LABS: Record<string, LabBlueprint> = {
  "LLM inference": {
    labType: "inference benchmark",
    fileName: "prefill_decode_benchmark_lab.py",
    dataFiles: ["inference_workload.json", "sequence_distributions.json", "scheduler_traces.json"],
    tools: ["Workload-profile loader", "Controlled inference scheduler", "Latency and capacity evaluator"],
    requiredCalls: ["load_inference_workload", "run_inference_benchmark", "evaluate_inference_capacity"],
    successCriteria: ["Separate prompt prefill, queue delay, time to first token, decode, and end-to-end latency", "Measure continuous batching, KV-cache pressure, throughput, fairness, and tail latency across representative prompt and output lengths", "Reject configurations that improve aggregate tokens per second by violating interactive latency or quality constraints"],
    mockOutput: "Workload cases: 72\nTTFT p95: 410 ms\nInter-token p95: 42 ms\nKV-cache rejections: 0\nFairness violations: 0\nInference capacity: PASS",
    mission: "Benchmark prefill and decode under realistic concurrency, then choose a schedule from latency, throughput, cache, and fairness evidence.",
  },
  "Model serving": {
    labType: "serving architecture",
    fileName: "admission_rollout_lab.py",
    dataFiles: ["traffic_forecast.json", "replica_health.json", "release_candidates.json"],
    tools: ["Serving-case loader", "Controlled admission and rollout simulator", "Availability and rollback evaluator"],
    requiredCalls: ["load_serving_cases", "run_serving_rollout", "evaluate_serving_release"],
    successCriteria: ["Apply token-aware admission, bounded queues, deadlines, priority, and overload behavior before saturation", "Require model-aware readiness, warmup, health routing, canary limits, immutable artifacts, and rollback capacity", "Measure errors, queue delay, saturation, latency, quality, and recovery instead of process health alone"],
    mockOutput: "Traffic scenarios: 60\nOver-capacity accepts: 0\nCold replicas routed: 0\nCanary regressions caught: 8/8\nRollback objective: 54 s\nServing release: READY",
    mission: "Design a serving tier that admits only sustainable work and can canary, observe, and roll back a complete model-runtime release.",
  },
  "GPU fundamentals": {
    labType: "hardware profiling",
    fileName: "gpu_bottleneck_lab.py",
    dataFiles: ["gpu_profiles.json", "memory_budgets.json", "kernel_timelines.json"],
    tools: ["GPU-profile loader", "Controlled kernel and memory analyzer", "Hardware-efficiency evaluator"],
    requiredCalls: ["load_gpu_profiles", "run_gpu_bottleneck_analysis", "evaluate_gpu_efficiency"],
    successCriteria: ["Account for weights, activations, KV cache, workspaces, fragmentation, and runtime memory at target concurrency", "Distinguish compute, HBM bandwidth, communication, synchronization, and kernel-launch bottlenecks from profiler evidence", "Verify precision, tensor-core paths, fusion, shapes, and kernels on the actual hardware target"],
    mockOutput: "Profiles analyzed: 48\nMemory-budget misses: 0\nBottlenecks classified: 48/48\nUnsupported tensor paths: 0\nPredicted vs measured error: 3.2%\nGPU plan: PASS",
    mission: "Turn GPU profiler evidence into a memory-safe kernel and precision plan instead of optimizing from utilization alone.",
  },
  "Distributed inference": {
    labType: "distributed systems design",
    fileName: "distributed_inference_topology_lab.py",
    dataFiles: ["model_partitions.json", "cluster_topology.json", "failure_scenarios.json"],
    tools: ["Topology-case loader", "Controlled sharding simulator", "Communication and resilience evaluator"],
    requiredCalls: ["load_distributed_cases", "run_distributed_inference_plan", "evaluate_distributed_topology"],
    successCriteria: ["Choose replicas, tensor, pipeline, or expert parallelism from fit, latency, throughput, and model architecture", "Place communication-heavy groups on measured links and quantify collectives, pipeline bubbles, imbalance, and capacity headroom", "Define shard health, coordinated recovery, request retry boundaries, and behavior under accelerator or link failure"],
    mockOutput: "Topologies tested: 32\nSlow-link placements promoted: 0\nPipeline idle fraction: 6.4%\nImbalance alerts: PASS\nFailure recovery cases: 18/18\nDistributed plan: READY",
    mission: "Select and place a distributed inference strategy whose communication, balance, and failure behavior are proven on the target topology.",
  },
  "Advanced RAG": {
    labType: "federated retrieval evaluation",
    fileName: "federated_rag_lab.py",
    dataFiles: ["multi_source_queries.json", "source_versions.json", "authorization_matrix.json"],
    tools: ["Federated-query loader", "Controlled evidence router", "Provenance and answer evaluator"],
    requiredCalls: ["load_federated_queries", "run_provenance_rag", "evaluate_federated_rag"],
    successCriteria: ["Route semantic, lexical, relational, graph, and live-tool evidence by query intent and source authority", "Carry tenant authorization, source identity, version, timestamp, and passage or record lineage into claim-level citations", "Beat a simpler RAG baseline on routing, retrieval, citation support, correctness, freshness, isolation, latency, and cost"],
    mockOutput: "Federated questions: 84\nUnauthorized source reads: 0\nUnsupported claims: 0\nFreshness violations: 0\nQuality over simple baseline: +14.6%\nInference Grid: STABLE",
    mission: "Evaluate a federated RAG router that preserves authorization and provenance while proving its complexity against a simpler baseline.",
  },
};

export function buildRoundElevenGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_ELEVEN_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize Inference Grid by benchmarking prefill and decode, protecting serving capacity, diagnosing GPU bottlenecks, placing distributed inference on measured topology, and releasing federated RAG with authorization and provenance. This applied project completes the world's checkpoint."
    : blueprint.mission;
  const starterCode = [
    "# CodeCraft controlled GenAI lab",
    "# Mock tools only — no API key, credits, uploads, GPUs, or external calls required.",
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
