import type { GenAILabSpec, GenAITopic } from "./genai-curriculum";

type LabBlueprint = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & { mission: string };

const ROUND_THREE_LABS: Record<string, LabBlueprint> = {
  Hallucinations: {
    labType: "guided code",
    fileName: "grounding_eval_lab.py",
    dataFiles: ["claim_cases.json", "evidence_archive.json"],
    tools: ["Claim case loader", "Grounded answer runner", "Claim-support evaluator"],
    requiredCalls: ["load_claim_cases", "ground_answers", "evaluate_claim_support"],
    successCriteria: ["Tie every answer claim to supplied evidence", "Abstain when evidence is insufficient", "Evaluate support and citation correctness separately from fluency"],
    mockOutput: "Claim cases: 15\nUnsupported claims: 0\nCorrect abstentions: 4/4\nCitation support: PASS",
    mission: "Run evidence-rich and evidence-poor questions through a grounded answer policy and measure unsupported claims.",
  },
  "LLM APIs": {
    labType: "guided code",
    fileName: "api_gateway_lab.py",
    dataFiles: ["request_cases.json", "service_limits.json"],
    tools: ["API case loader", "Mock model gateway", "Resilience evaluator"],
    requiredCalls: ["load_api_cases", "run_mock_api_gateway", "evaluate_api_resilience"],
    successCriteria: ["Keep credentials behind the trusted gateway", "Handle timeout, rate-limit, and provider failures", "Validate provider output before returning it"],
    mockOutput: "Request cases: 12\nSecret exposure: 0\nRetry budget respected: yes\nOutput validation: PASS",
    mission: "Build a controlled model API gateway and test its timeout, retry, secret, and response-validation behavior.",
  },
  "Conversation state": {
    labType: "configuration",
    fileName: "conversation_state_lab.py",
    dataFiles: ["conversation_turns.json", "retention_policy.json"],
    tools: ["Conversation loader", "Active-state selector", "State-policy evaluator"],
    requiredCalls: ["load_conversation_turns", "select_active_state", "evaluate_state_policy"],
    successCriteria: ["Preserve role and chronological meaning", "Select only task-relevant state within budget", "Apply retention and privacy rules to durable memory"],
    mockOutput: "Turns inspected: 18\nRelevant state retained: 100%\nExpired sensitive state retained: 0\nState policy: PASS",
    mission: "Select the minimum conversation state needed for a reliable next turn while respecting retention policy.",
  },
  "Structured outputs": {
    labType: "guided code",
    fileName: "structured_output_lab.py",
    dataFiles: ["output_cases.json", "answer_schema.json"],
    tools: ["Output case loader", "Structured answer generator", "Contract validator"],
    requiredCalls: ["load_output_cases", "generate_structured_answers", "validate_output_contract"],
    successCriteria: ["Generate values that match the declared schema", "Reject malformed and semantically invalid fields", "Version the contract so consumers can evolve safely"],
    mockOutput: "Cases generated: 20\nSchema validity: 100%\nSemantic violations: 0\nContract check: PASS",
    mission: "Generate typed responses and validate both their syntax and domain meaning against an explicit contract.",
  },
  "Tool calling": {
    labType: "guided code",
    fileName: "tool_router_lab.py",
    dataFiles: ["tool_requests.json", "tool_permissions.json"],
    tools: ["Tool request loader", "Authorized tool router", "Tool-trace evaluator"],
    requiredCalls: ["load_tool_requests", "route_authorized_tools", "evaluate_tool_trace"],
    successCriteria: ["Select only a relevant, narrowly described tool", "Validate arguments and authorization before execution", "Record proposed, denied, and executed actions in an audit trace"],
    mockOutput: "Tool requests: 16\nUnauthorized executions: 0\nArgument violations: 0\nAudit trace coverage: PASS",
    mission: "Route proposed model tool calls through validation and authorization, then evaluate the resulting audit trace.",
  },
};

export function buildRoundThreeGenAILab(topic: GenAITopic, required: boolean, worldName: string): GenAILabSpec | null {
  const blueprint = ROUND_THREE_LABS[topic.title];
  if (!blueprint) return null;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize this world by combining grounded outputs, controlled API boundaries, explicit state, structured contracts, and authorized tool execution. This applied project completes the world's checkpoint."
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
    "# TODO 1: use the second controlled tool to process input_data.",
    "# TODO 2: store that response in a variable named result.",
    "# TODO 3: use the final evaluator on result, then print the report.",
    "",
  ].join("\n");
  return { ...blueprint, title, brief, starterCode, required };
}
