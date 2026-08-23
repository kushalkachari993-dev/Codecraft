import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_FIVE_LABS: Record<string, LabBlueprint> = {
  "Transformers deeper": {
    labType: "guided code",
    fileName: "transformer_trace_lab.py",
    dataFiles: ["layer_trace_cases.json", "attention_masks.json"],
    tools: ["Layer trace loader", "Mock transformer tracer", "Representation-flow evaluator"],
    requiredCalls: ["load_layer_traces", "trace_transformer_blocks", "evaluate_representation_flow"],
    successCriteria: ["Trace attention, residual, normalization, and feed-forward stages separately", "Respect causal and padding masks", "Avoid treating attention weights as a complete causal explanation"],
    mockOutput: "Layer cases: 10\nMask violations: 0\nResidual continuity: PASS\nUnsupported head interpretations: 0\nTransformer trace: PASS",
    mission: "Trace token representations through controlled transformer blocks and explain how attention and feed-forward updates enter the residual stream.",
  },
  "Embeddings deeper": {
    labType: "guided code",
    fileName: "embedding_engineering_lab.py",
    dataFiles: ["domain_retrieval_pairs.json", "embedding_profiles.json"],
    tools: ["Retrieval pair loader", "Embedding configuration sweep", "Ranking-quality evaluator"],
    requiredCalls: ["load_retrieval_pairs", "compare_embedding_configs", "evaluate_ranking_quality"],
    successCriteria: ["Apply correct query and document encoding roles", "Compare normalization and distance metrics consistently", "Measure recall, ranking, hard negatives, and downstream answer quality"],
    mockOutput: "Configurations: 6\nBest recall@5: 0.95\nHard-negative precision: 0.91\nDownstream grounded answers: 94%\nEmbedding engineering: PASS",
    mission: "Select an embedding configuration from domain retrieval evidence rather than generic leaderboard scores.",
  },
  "Document ingestion": {
    labType: "configuration",
    fileName: "ingestion_pipeline_lab.py",
    dataFiles: ["source_documents.json", "ingestion_policy.json"],
    tools: ["Source manifest loader", "Controlled ingestion pipeline", "Ingestion-quality evaluator"],
    requiredCalls: ["load_source_manifest", "run_ingestion_pipeline", "evaluate_ingestion_quality"],
    successCriteria: ["Preserve headings, tables, source locations, and reading order", "Attach stable source, version, parser, permission, and content-hash metadata", "Quarantine partial extraction and propagate updates and deletions"],
    mockOutput: "Sources processed: 32\nStructure preservation: 98%\nSilent partial extractions: 0\nDeletion propagation: 100%\nIngestion quality: PASS",
    mission: "Convert a heterogeneous source manifest into traceable retrieval records with observable failure and lifecycle handling.",
  },
  Chunking: {
    labType: "guided code",
    fileName: "chunking_eval_lab.py",
    dataFiles: ["structured_documents.json", "retrieval_questions.json"],
    tools: ["Structured document loader", "Chunking strategy runner", "Chunk-retrieval evaluator"],
    requiredCalls: ["load_structured_documents", "compare_chunking_strategies", "evaluate_chunk_retrieval"],
    successCriteria: ["Compare structural, fixed-size, and parent-child strategies", "Measure boundary quality, recall, duplication, and context cost", "Retain source, section, neighbor, and parent provenance"],
    mockOutput: "Strategies compared: 4\nBest recall@5: 0.93\nOrphan fragments: 0\nDuplicate context rate: 4%\nChunking evaluation: PASS",
    mission: "Compare chunking strategies on representative documents and choose boundaries using measured retrieval and answer usefulness.",
  },
  "Retrieval engineering": {
    labType: "system design",
    fileName: "retrieval_pipeline_lab.py",
    dataFiles: ["retrieval_eval_set.json", "access_and_index_policy.json"],
    tools: ["Retrieval evaluation loader", "Controlled retrieval pipeline", "Stage-trace evaluator"],
    requiredCalls: ["load_retrieval_eval_set", "run_retrieval_pipeline", "evaluate_retrieval_trace"],
    successCriteria: ["Trace original and transformed queries through every stage", "Apply authorization and metadata filters before candidate exposure", "Deduplicate, diversify, expand, and budget context using measured relevance"],
    mockOutput: "Queries traced: 25\nUnauthorized candidates: 0\nRecall@8: 0.96\nContext duplication: 3%\nStage attribution coverage: 100%\nRetrieval system: PASS",
    mission: "Build an observable retrieval pipeline and identify exactly where query transformation, filters, ranking, or context assembly changes evidence quality.",
  },
};

export function buildRoundFiveGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_FIVE_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize Transformer Systems by tracing model representations and delivering an evaluated ingestion, chunking, embedding, and retrieval pipeline. This applied project completes the world's checkpoint."
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
