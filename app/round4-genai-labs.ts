import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_FOUR_LABS: Record<string, LabBlueprint> = {
  Embeddings: {
    labType: "guided code",
    fileName: "embedding_quality_lab.py",
    dataFiles: ["semantic_pairs.json", "embedding_models.json"],
    tools: ["Semantic pair loader", "Mock embedding comparator", "Embedding-quality evaluator"],
    requiredCalls: ["load_semantic_pairs", "compare_embedding_models", "evaluate_embedding_quality"],
    successCriteria: ["Embed queries and candidates in one compatible space", "Compare relevant, irrelevant, and domain-specific pairs", "Choose a model using measured ranking quality instead of vector size alone"],
    mockOutput: "Semantic pairs: 24\nBest model: relay-embed-v2\nRecall@3: 0.92\nDomain confusion cases: 1\nEmbedding evaluation: PASS",
    mission: "Compare two controlled embedding models on representative semantic pairs and justify the stronger retrieval representation.",
  },
  "Vector DB basics": {
    labType: "configuration",
    fileName: "vector_index_lab.py",
    dataFiles: ["document_vectors.json", "access_metadata.json"],
    tools: ["Vector record loader", "Mock nearest-neighbor index", "Index-policy evaluator"],
    requiredCalls: ["load_vector_records", "build_filtered_index", "evaluate_index_policy"],
    successCriteria: ["Store stable source and embedding-version metadata", "Apply tenant and permission filters before returning candidates", "Measure recall, latency, and stale-vector cleanup"],
    mockOutput: "Indexed records: 240\nCross-tenant results: 0\nStale vectors: 0\nRecall@5: 0.96\nIndex policy: PASS",
    mission: "Build a filtered vector index and verify retrieval quality, access isolation, and content lifecycle handling.",
  },
  "Basic RAG": {
    labType: "guided code",
    fileName: "basic_rag_lab.py",
    dataFiles: ["support_questions.json", "knowledge_passages.json"],
    tools: ["RAG case loader", "Controlled retrieval-and-answer pipeline", "RAG stage evaluator"],
    requiredCalls: ["load_rag_cases", "run_grounded_rag", "evaluate_rag_stages"],
    successCriteria: ["Retrieve relevant authorized passages", "Generate answers supported by retrieved evidence with citations", "Evaluate retrieval and answer failures separately and abstain on evidence gaps"],
    mockOutput: "Questions: 18\nRetrieval recall@4: 0.94\nSupported answers: 100%\nCorrect abstentions: 3/3\nRAG evaluation: PASS",
    mission: "Run a basic grounded RAG pipeline and locate failures in retrieval, evidence use, citation support, or abstention.",
  },
  "Multimodal basics": {
    labType: "guided code",
    fileName: "multimodal_evidence_lab.py",
    dataFiles: ["inspection_cases.json", "media_evidence_policy.json"],
    tools: ["Multimodal case loader", "Controlled media inspector", "Evidence-provenance evaluator"],
    requiredCalls: ["load_multimodal_cases", "inspect_modal_evidence", "evaluate_multimodal_findings"],
    successCriteria: ["Combine text and image evidence without treating either as automatically authoritative", "Attach findings to regions, timestamps, or transcript spans", "Report unreadable or missing modalities and enforce media privacy rules"],
    mockOutput: "Inspection cases: 14\nUnsupported visual claims: 0\nUnreadable-media abstentions: 2/2\nProvenance coverage: 100%\nMultimodal evaluation: PASS",
    mission: "Inspect controlled text-and-image cases and produce evidence-linked findings with explicit modality limitations.",
  },
};

export function buildRoundFourGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_FOUR_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize the Retrieval Frontier by combining evaluated embeddings, permission-aware vector search, grounded RAG, and evidence-linked multimodal findings. This applied project completes the world's checkpoint."
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
