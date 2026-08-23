import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_TWO_LABS: Record<string, LabBlueprint> = {
  Tokens: {
    labType: "guided code",
    fileName: "token_budget_lab.py",
    dataFiles: ["multilingual_samples.json", "model_tokenizer.json"],
    tools: ["Text sample loader", "Tokenizer inspector", "Token-count comparator"],
    requiredCalls: ["load_text_samples", "inspect_tokenization", "compare_token_counts"],
    successCriteria: ["Inspect the target tokenizer", "Compare text, code, and multilingual samples", "Reserve input and output token budgets"],
    mockOutput: "Samples inspected: 9\nLargest word/token variance: multilingual\nOutput reserve: 512 tokens\nBudget check: PASS",
    mission: "Measure real tokenization across representative inputs and produce a safe request budget.",
  },
  "Context windows": {
    labType: "configuration",
    fileName: "context_budget_lab.py",
    dataFiles: ["mission_context.json", "evidence_candidates.json"],
    tools: ["Context bundle loader", "Budget allocator", "Context-selection evaluator"],
    requiredCalls: ["load_context_bundle", "allocate_context_budget", "evaluate_context_selection"],
    successCriteria: ["Reserve enough output capacity", "Keep relevant evidence within the model limit", "Reject irrelevant context that adds cost without support"],
    mockOutput: "Model limit: 8192\nSelected input: 6048 tokens\nOutput reserve: 1024 tokens\nRelevant-evidence coverage: 100%\nContext check: PASS",
    mission: "Allocate a limited context window across instructions, evidence, conversation state, and response reserve.",
  },
  "Generation parameters": {
    labType: "guided code",
    fileName: "generation_sweep_lab.py",
    dataFiles: ["generation_cases.json", "parameter_profiles.json"],
    tools: ["Generation case loader", "Parameter sweep", "Output comparator"],
    requiredCalls: ["load_generation_case", "run_parameter_sweep", "compare_generation_outputs"],
    successCriteria: ["Hold model and prompt constant", "Compare controlled and varied sampling", "Measure format validity, variation, and unsupported claims"],
    mockOutput: "Profiles compared: 3\nStructured-output validity: 100%\nVariation range: expected\nUnsupported claims: 0\nParameter check: PASS",
    mission: "Compare generation settings on the same cases and select a profile using measured behavior.",
  },
  "Prompt engineering": {
    labType: "guided code",
    fileName: "prompt_contract_lab.py",
    dataFiles: ["prompt_requirements.json", "prompt_eval_cases.json"],
    tools: ["Requirement loader", "Structured prompt builder", "Prompt-contract evaluator"],
    requiredCalls: ["load_prompt_requirements", "build_structured_prompt", "evaluate_prompt_contract"],
    successCriteria: ["Separate stable rules from untrusted evidence", "Specify an explicit output schema", "Pass normal, ambiguous, and adversarial prompt cases"],
    mockOutput: "Evaluation cases: 14\nSchema validity: 100%\nInstruction-boundary violations: 0\nPrompt contract: PASS",
    mission: "Build and evaluate a versioned prompt contract with clear authority, evidence boundaries, and structured output.",
  },
};

export function buildRoundTwoGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_TWO_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize this world with a complete " + topic.title + " workflow. This applied project completes the world's checkpoint."
    : blueprint.mission;
  const starterCode = [
    "# CodeCraft controlled GenAI lab",
    "# Mock tools only — no API key, credits, or external calls required.",
    "from codecraft_ai import " + blueprint.requiredCalls.join(", "),
    "",
    "topic = " + JSON.stringify(topic.title),
    "mission = " + JSON.stringify(blueprint.mission),
    "input_data = " + blueprint.requiredCalls[0] + "(" + JSON.stringify(blueprint.dataFiles[0]) + ")",
    "",
    "# TODO 1: use the second tool to process input_data.",
    "# TODO 2: store that response in a variable named result.",
    "# TODO 3: use the final tool to evaluate result, then print the report.",
    "",
  ].join("\n");
  return { ...blueprint, title, brief, starterCode, required };
}

