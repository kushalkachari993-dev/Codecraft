import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_TEN_LABS: Record<string, LabBlueprint> = {
  "Transformer internals": {
    labType: "model analysis",
    fileName: "attention_trace_lab.py",
    dataFiles: ["attention_cases.json", "block_shapes.json", "cache_traces.json"],
    tools: ["Attention-case loader", "Controlled transformer-block tracer", "Shape and masking evaluator"],
    requiredCalls: ["load_attention_cases", "trace_transformer_block", "evaluate_attention_internals"],
    successCriteria: ["Trace Q, K, V, masking, softmax, projection, residual, normalization, and MLP with valid tensor shapes", "Distinguish causal and padding masks and detect future-token leakage", "Explain KV-cache compute savings and memory growth for prefill and decoding"],
    mockOutput: "Blocks traced: 24\nShape violations: 0\nFuture-token leaks: 0\nResidual paths verified: 24/24\nKV-cache accounting: PASS\nTransformer trace: PASS",
    mission: "Trace a transformer block end to end and diagnose masking, shape, residual-stream, and KV-cache failures.",
  },
  "LLM training": {
    labType: "training design",
    fileName: "llm_training_pipeline_lab.py",
    dataFiles: ["data_mixture.json", "training_budget.json", "evaluation_splits.json"],
    tools: ["Governed-data loader", "Controlled training-plan simulator", "Training-readiness evaluator"],
    requiredCalls: ["load_training_inputs", "run_training_plan", "evaluate_training_readiness"],
    successCriteria: ["Track provenance, licensing, filtering, deduplication, split isolation, tokenization, and packing", "Fit parameters, tokens, sequence length, precision, optimizer state, parallelism, checkpoints, and recovery into the compute budget", "Gate checkpoints on capability, safety, memorization, contamination, and regression suites rather than training loss alone"],
    mockOutput: "Training tokens planned: 18.2B\nCross-split duplicates: 0\nBudget violations: 0\nCheckpoint recovery: PASS\nEvaluation gates: 14/14\nTraining plan: READY",
    mission: "Design a governed, recoverable LLM training pipeline whose data, compute, and evaluation claims can be audited.",
  },
  "Fine-tuning": {
    labType: "adaptation evaluation",
    fileName: "fine_tuning_decision_lab.py",
    dataFiles: ["adaptation_cases.json", "fine_tune_dataset.json", "release_evals.json"],
    tools: ["Adaptation-case loader", "Controlled fine-tuning planner", "Baseline and release evaluator"],
    requiredCalls: ["load_fine_tuning_cases", "run_fine_tuning_plan", "evaluate_fine_tuning_release"],
    successCriteria: ["Choose prompting, retrieval, tools, or fine-tuning from evidence rather than defaulting to weight changes", "Create clean train, validation, and entity- or time-isolated test splits with hard negatives and lineage", "Compare quality and safety with the base model and define canary, monitoring, versioning, and rollback gates"],
    mockOutput: "Decision cases: 48\nIncorrect fine-tune choices: 0\nSplit leakage: 0\nTarget quality delta: +11.8%\nSafety regressions: 0\nFine-tune release: APPROVED",
    mission: "Decide when fine-tuning is justified, design a leakage-resistant dataset, and gate the adapted release against its base model.",
  },
  "LoRA/QLoRA/PEFT": {
    labType: "adapter engineering",
    fileName: "peft_adapter_lab.py",
    dataFiles: ["adapter_targets.json", "memory_profiles.json", "adapter_evals.json"],
    tools: ["Adapter-case loader", "Controlled PEFT configurator", "Compatibility and quality evaluator"],
    requiredCalls: ["load_peft_cases", "run_peft_configuration", "evaluate_peft_adapter"],
    successCriteria: ["Select target modules, rank, alpha, dropout, precision, and trainable parameter budget from measured needs", "Keep QLoRA base quantization separate from adapter compute and optimizer precision", "Version base revision, tokenizer, adapter, configuration, and evals while testing merged and unmerged serving paths"],
    mockOutput: "Adapter configurations: 36\nBase mismatches: 0\nTrainable parameters: 0.72%\nMemory budget: PASS\nMerged/unmerged parity: PASS\nPEFT adapter: READY",
    mission: "Configure and validate a parameter-efficient adapter with explicit capacity, precision, compatibility, and deployment tradeoffs.",
  },
  Quantization: {
    labType: "inference optimization",
    fileName: "quantization_tradeoff_lab.py",
    dataFiles: ["quantization_candidates.json", "calibration_slice.json", "hardware_kernels.json"],
    tools: ["Quantization-case loader", "Controlled serving benchmark", "Quality and systems tradeoff evaluator"],
    requiredCalls: ["load_quantization_cases", "run_quantized_benchmark", "evaluate_quantization_release"],
    successCriteria: ["Choose weight, activation, and KV-cache precision using representative calibration and task slices", "Measure memory, prefill latency, decode latency, throughput, power, and quality on target hardware", "Reject unsupported kernels, unacceptable safety or quality regressions, and savings that disappear end to end"],
    mockOutput: "Candidates benchmarked: 20\nUnsupported kernels promoted: 0\nMemory reduction: 61%\nP95 decode improvement: 34%\nCritical quality regressions: 0\nModel Engine: STABLE",
    mission: "Select a quantized serving configuration only when target-hardware benchmarks prove worthwhile savings without unacceptable quality loss.",
  },
};

export function buildRoundTenGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_TEN_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize Model Engine by tracing transformer internals, governing an LLM training plan, proving a fine-tuning decision, engineering a compatible PEFT adapter, and selecting quantization from target-hardware quality and systems evidence. This applied project completes the world's checkpoint."
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
