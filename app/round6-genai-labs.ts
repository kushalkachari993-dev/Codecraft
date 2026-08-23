import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_SIX_LABS: Record<string, LabBlueprint> = {
  "Hybrid search": {
    labType: "guided code",
    fileName: "hybrid_search_lab.py",
    dataFiles: ["query_slices.json", "lexical_vector_rankings.json"],
    tools: ["Query slice loader", "Controlled rank fusion", "Hybrid-search evaluator"],
    requiredCalls: ["load_query_slices", "fuse_search_rankings", "evaluate_hybrid_search"],
    successCriteria: ["Preserve exact-term and semantic candidates", "Fuse ranked lists without adding uncalibrated raw scores", "Measure exact-id, paraphrase, multilingual, and ambiguous query slices"],
    mockOutput: "Query slices: 4\nExact-id recall@5: 1.00\nParaphrase recall@5: 0.94\nFusion regressions: 0\nHybrid search: PASS",
    mission: "Fuse lexical and semantic retrieval and verify that each query category benefits without hiding regressions.",
  },
  Reranking: {
    labType: "configuration",
    fileName: "reranking_budget_lab.py",
    dataFiles: ["candidate_sets.json", "latency_budget.json"],
    tools: ["Candidate-set loader", "Controlled reranker sweep", "Quality-latency evaluator"],
    requiredCalls: ["load_candidate_sets", "compare_reranker_depths", "evaluate_reranking_budget"],
    successCriteria: ["Preserve first-stage recall", "Select candidate depth using ranking gain and latency", "Define timeout and first-stage fallback behavior"],
    mockOutput: "Depths compared: 10, 25, 50\nSelected depth: 25\nNDCG@8 gain: 11%\np95 latency: 180 ms\nFallback check: PASS",
    mission: "Choose a reranking depth that improves precision while staying inside a measured latency and fallback budget.",
  },
  "Advanced RAG": {
    labType: "system design",
    fileName: "adaptive_rag_lab.py",
    dataFiles: ["complex_query_cases.json", "rag_routes.json"],
    tools: ["Complex-query loader", "Bounded adaptive RAG runner", "Route-value evaluator"],
    requiredCalls: ["load_complex_queries", "run_adaptive_rag", "evaluate_rag_routes"],
    successCriteria: ["Route simple, multi-hop, structured, and unanswerable questions appropriately", "Bound decomposition and iterative retrieval", "Prove each advanced route beats the simple baseline on its target slice"],
    mockOutput: "Queries: 30\nRoute accuracy: 93%\nIteration budget violations: 0\nBaseline-adjusted quality: +12%\nAdaptive RAG: PASS",
    mission: "Route complex questions through bounded retrieval strategies and keep only stages with measured value over the baseline.",
  },
  "RAG evaluation": {
    labType: "configuration",
    fileName: "rag_evaluation_lab.py",
    dataFiles: ["rag_regression_set.json", "human_judgments.json"],
    tools: ["Regression-set loader", "Stage-level RAG evaluator", "Judge-calibration analyzer"],
    requiredCalls: ["load_rag_regression_set", "evaluate_rag_pipeline", "calibrate_rag_judges"],
    successCriteria: ["Measure retrieval, context, answer, citation, and abstention separately", "Slice failures by query and permission type", "Calibrate automated judgments against expert labels"],
    mockOutput: "Cases: 80\nRecall@8: 0.96\nFaithfulness: 0.97\nCorrect abstention: 0.94\nJudge/human agreement: 0.89\nRAG evaluation: PASS",
    mission: "Build a stage-level RAG scorecard and calibrate automated evaluation before it gates releases.",
  },
  "Production prompting": {
    labType: "system design",
    fileName: "prompt_release_lab.py",
    dataFiles: ["prompt_release_candidate.json", "prompt_regression_suite.json"],
    tools: ["Prompt release loader", "Controlled canary simulator", "Prompt-release evaluator"],
    requiredCalls: ["load_prompt_release", "run_prompt_canary", "evaluate_prompt_release"],
    successCriteria: ["Version the complete inference contract", "Separate trusted instructions from untrusted evidence", "Gate rollout on regression, adversarial, canary, monitoring, and rollback checks"],
    mockOutput: "Release candidate: support-answer@2.5.0\nRegression delta: +3.2%\nInstruction-boundary failures: 0\nRollback rehearsal: PASS\nPrompt release: APPROVED",
    mission: "Evaluate and canary a versioned production prompt as a reversible model-behavior release.",
  },
};

export function buildRoundSixGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_SIX_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize the Search & RAG Grid by releasing an evaluated hybrid, reranked, adaptive RAG system with calibrated metrics and a reversible production prompt. This applied project completes the world's checkpoint."
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
    "# TODO 1: process input_data with the second controlled tool.",
    "# TODO 2: store the response in a variable named result.",
    "# TODO 3: evaluate result with the final tool, then print the report.",
    "",
  ].join("\n");
  return { ...blueprint, title, brief, starterCode, required };
}
