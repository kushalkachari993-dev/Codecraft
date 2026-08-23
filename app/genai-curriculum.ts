import { buildRoundTwoGenAILab } from "./round2-genai-labs";
import { buildRoundThreeGenAILab } from "./round3-genai-labs";
import { buildRoundFourGenAILab } from "./round4-genai-labs";

export type GenAIPaceId = "beginner" | "intermediate" | "expert";

export type GenAITopic = {
  title: string;
  summary: string;
  learningGoal: string;
  example: string;
  keyIdeas: Array<{ title: string; body: string }>;
  commonMistake: string;
  mentalModel: string;
};

export type GenAILabSpec = {
  title: string;
  brief: string;
  labType: "guided code" | "configuration" | "system design";
  fileName: string;
  starterCode: string;
  dataFiles: string[];
  tools: string[];
  successCriteria: string[];
  requiredCalls: string[];
  mockOutput: string;
  required: boolean;
};

type GenAILabFamily = Omit<GenAILabSpec, "title" | "brief" | "starterCode" | "required"> & {
  mission: string;
};

const GENAI_LAB_FAMILIES: Array<{ pattern: RegExp; spec: GenAILabFamily }> = [
  {
    pattern: /rag|retrieval|embedding|vector|chunk|document|hybrid search|rerank/i,
    spec: {
      labType: "guided code",
      fileName: "retrieval_lab.py",
      dataFiles: ["archive_docs.json", "test_queries.json"],
      tools: ["Document loader", "Mock vector index", "Retrieval scorer"],
      requiredCalls: ["load_documents", "retrieve_evidence", "score_retrieval"],
      successCriteria: ["Load the supplied archive", "Return grounded evidence", "Measure retrieval quality"],
      mockOutput: "Retrieved 3 grounded passages\nRecall@3: 1.00\nGrounding check: PASS",
      mission: "Build a grounded retrieval step and verify that the evidence supports the answer.",
    },
  },
  {
    pattern: /agent|tool calling|mcp|memory|workflow|langgraph|langchain/i,
    spec: {
      labType: "guided code",
      fileName: "agent_lab.py",
      dataFiles: ["mission_state.json", "tool_permissions.json"],
      tools: ["Mock tool registry", "State inspector", "Trace viewer"],
      requiredCalls: ["load_agent_state", "run_agent_step", "inspect_trace"],
      successCriteria: ["Read the saved state", "Choose an allowed tool", "Inspect the decision trace"],
      mockOutput: "Agent step: complete\nAllowed tool used: archive_search\nTrace policy: PASS",
      mission: "Run one controlled agent step while preserving state and respecting tool permissions.",
    },
  },
  {
    pattern: /evaluation|guardrail|injection|security|authorization|reliability/i,
    spec: {
      labType: "configuration",
      fileName: "safety_eval_lab.py",
      dataFiles: ["eval_cases.json", "policy_rules.json"],
      tools: ["Policy sandbox", "Evaluation runner", "Failure explorer"],
      requiredCalls: ["load_eval_cases", "evaluate_policy", "summarize_failures"],
      successCriteria: ["Run every supplied case", "Apply the policy consistently", "Summarize unsafe failures"],
      mockOutput: "Evaluation cases: 12\nPolicy pass rate: 100%\nUnsafe failures: 0",
      mission: "Evaluate a controlled AI policy against normal, adversarial, and boundary cases.",
    },
  },
  {
    pattern: /training|fine-tun|lora|qlora|peft|quantization|inference|gpu|serving|transformer internals|distributed inference/i,
    spec: {
      labType: "system design",
      fileName: "model_system_lab.py",
      dataFiles: ["model_profile.json", "hardware_budget.json"],
      tools: ["Model profiler", "Runtime configurator", "Benchmark simulator"],
      requiredCalls: ["load_model_profile", "configure_runtime", "benchmark_plan"],
      successCriteria: ["Respect the hardware budget", "Choose a compatible runtime", "Compare latency and quality"],
      mockOutput: "Runtime plan: compatible\nEstimated p95 latency: 420 ms\nQuality budget: PASS",
      mission: "Design a model runtime plan that balances memory, latency, throughput, and quality.",
    },
  },
  {
    pattern: /observability|cost|routing|llmops|feedback|docker|kubernetes|production|streaming|caching|system design/i,
    spec: {
      labType: "system design",
      fileName: "production_ai_lab.py",
      dataFiles: ["traffic_sample.json", "service_limits.json"],
      tools: ["Traffic simulator", "Route planner", "Service evaluator"],
      requiredCalls: ["load_traffic", "design_route", "evaluate_service"],
      successCriteria: ["Handle the traffic profile", "Stay inside service limits", "Explain the reliability tradeoff"],
      mockOutput: "Traffic replay: stable\nBudget variance: 2.4%\nReliability target: PASS",
      mission: "Plan a production AI service and test it against traffic, cost, and reliability limits.",
    },
  },
  {
    pattern: /multimodal/i,
    spec: {
      labType: "guided code",
      fileName: "multimodal_lab.py",
      dataFiles: ["inspection_sample.json", "media_policy.json"],
      tools: ["Media loader", "Mock vision-language model", "Finding validator"],
      requiredCalls: ["load_media_sample", "analyze_modalities", "validate_findings"],
      successCriteria: ["Read both text and media inputs", "Produce structured findings", "Validate claims against the sample"],
      mockOutput: "Modalities analyzed: text, image\nStructured findings: 4\nEvidence check: PASS",
      mission: "Combine text and visual evidence into a structured, verifiable result.",
    },
  },
  {
    pattern: /prompt|token|context|generation|hallucination|llm|conversation|structured|ai\/ml|neural|nlp|transformer/i,
    spec: {
      labType: "guided code",
      fileName: "model_behavior_lab.py",
      dataFiles: ["prompt_cases.json", "expected_behavior.json"],
      tools: ["Prompt case loader", "Mock language model", "Behavior comparator"],
      requiredCalls: ["load_prompt_case", "run_mock_model", "compare_behavior"],
      successCriteria: ["Run the supplied prompt case", "Capture structured model output", "Compare it with expected behavior"],
      mockOutput: "Prompt case: complete\nStructured output: valid\nBehavior comparison: PASS",
      mission: "Run a controlled model-behavior experiment and explain what changed the result.",
    },
  },
];

const DEFAULT_GENAI_LAB: GenAILabFamily = {
  labType: "guided code",
  fileName: "genai_lab.py",
  dataFiles: ["mission_input.json", "expected_result.json"],
  tools: ["Mission loader", "Mock AI system", "Result checker"],
  requiredCalls: ["load_mission", "run_mock_system", "check_result"],
  successCriteria: ["Load the mission input", "Run the controlled system", "Check the result against the target"],
  mockOutput: "Mission run: complete\nResult schema: valid\nTarget check: PASS",
  mission: "Build and verify a small controlled AI workflow for this topic.",
};

const AUTHORED_BEGINNER_LABS: Record<string, GenAILabFamily> = {
  "AI/ML basics": {
    labType: "guided code",
    fileName: "baseline_comparison.py",
    dataFiles: ["routing_cases.json", "candidate_predictions.json"],
    tools: ["Routing case loader", "Rule baseline", "Candidate comparator"],
    requiredCalls: ["load_routing_case", "run_rule_baseline", "compare_model_candidate"],
    successCriteria: ["Establish a deterministic baseline", "Compare the model candidate on the same cases", "Explain whether learned complexity adds measurable value"],
    mockOutput: "Cases evaluated: 12\nRule baseline accuracy: 83%\nModel candidate accuracy: 92%\nAdded-value check: PASS",
    mission: "Compare a learned routing candidate with a deterministic rule baseline before recommending AI.",
  },
  "Neural network basics": {
    labType: "guided code",
    fileName: "network_trace.py",
    dataFiles: ["training_batch.json", "network_snapshot.json"],
    tools: ["Training batch loader", "Forward-pass tracer", "Loss inspector"],
    requiredCalls: ["load_training_batch", "run_forward_pass", "inspect_loss"],
    successCriteria: ["Trace features through a forward pass", "Connect predictions to a target", "Interpret loss without claiming that inference trains the model"],
    mockOutput: "Batch size: 8\nForward pass: complete\nLoss: 0.184\nTraining/inference distinction: PASS",
    mission: "Trace one small neural-network batch from input through prediction and loss.",
  },
  "NLP basics": {
    labType: "guided code",
    fileName: "nlp_task_eval.py",
    dataFiles: ["support_messages.json", "expected_labels.json"],
    tools: ["Language case loader", "Task pipeline", "Task-output evaluator"],
    requiredCalls: ["load_language_cases", "run_task_pipeline", "evaluate_task_output"],
    successCriteria: ["Define a classification output contract", "Run representative and ambiguous language cases", "Evaluate task correctness instead of fluency alone"],
    mockOutput: "Language cases: 16\nSchema validity: 100%\nMacro F1: 0.88\nAmbiguity review: PASS",
    mission: "Evaluate a support-message classifier on ordinary, ambiguous, and domain-specific language.",
  },
  "Transformers": {
    labType: "guided code",
    fileName: "attention_trace.py",
    dataFiles: ["token_sequence.json", "attention_mask.json"],
    tools: ["Token sequence loader", "Attention tracer", "Context-state inspector"],
    requiredCalls: ["load_token_sequence", "trace_attention", "inspect_context_states"],
    successCriteria: ["Preserve token order information", "Apply the supplied attention mask", "Explain which tokens influence the inspected representation"],
    mockOutput: "Tokens traced: 9\nMask violations: 0\nHighest contextual influence: relay\nAttention interpretation: PASS",
    mission: "Trace how token order, masking, and attention contribute to one contextual representation.",
  },
  "LLM fundamentals": {
    labType: "guided code",
    fileName: "generation_comparison.py",
    dataFiles: ["prompt_case.json", "generation_settings.json"],
    tools: ["Prompt case loader", "Continuation generator", "Generation comparator"],
    requiredCalls: ["load_prompt_case", "generate_continuations", "compare_generation_settings"],
    successCriteria: ["Generate controlled token continuations", "Compare deterministic and sampled settings", "Identify unsupported claims rather than treating fluency as truth"],
    mockOutput: "Continuations generated: 4\nDeterministic agreement: 100%\nSampled variation detected: yes\nUnsupported-claim check: PASS",
    mission: "Compare token continuations under two decoding settings and inspect their factual support.",
  },
};

export function buildGenAILab(topic: GenAITopic, required = false, worldName = "GenAI world"): GenAILabSpec {
  const roundTwoLab = buildRoundTwoGenAILab(topic, required, worldName);
  if (roundTwoLab) return roundTwoLab;
  const roundThreeLab = buildRoundThreeGenAILab(topic, required, worldName);
  if (roundThreeLab) return roundThreeLab;
  const roundFourLab = buildRoundFourGenAILab(topic, required, worldName);
  if (roundFourLab) return roundFourLab;
  const family = AUTHORED_BEGINNER_LABS[topic.title]
    ?? GENAI_LAB_FAMILIES.find((item) => item.pattern.test(topic.title))?.spec
    ?? DEFAULT_GENAI_LAB;
  const title = required ? worldName + " applied project" : topic.title + " practice lab";
  const brief = required
    ? "Stabilize this world by applying " + topic.title + " in a complete, controlled workflow. This project completes the world's applied checkpoint."
    : family.mission;
  const importedTools = family.requiredCalls.join(", ");
  const starterCode = [
    "# CodeCraft controlled GenAI lab",
    "# Mock tools only — no API key, credits, or external calls required.",
    "from codecraft_ai import " + importedTools,
    "",
    "topic = " + JSON.stringify(topic.title),
    "mission = " + JSON.stringify(family.mission),
    "input_data = " + family.requiredCalls[0] + "(" + JSON.stringify(family.dataFiles[0]) + ")",
    "",
    "# TODO 1: use the second tool to process input_data.",
    "# TODO 2: store that response in a variable named result.",
    "# TODO 3: use the final tool to verify result, then print the report.",
    "",
  ].join("\n");

  return { ...family, title, brief, starterCode, required };
}

export function validateGenAILab(lab: GenAILabSpec, code: string): string | null {
  const missingCall = lab.requiredCalls.find((tool) => !new RegExp("\\b" + tool + "\\s*\\(", "i").test(code));
  if (missingCall) return "Use the controlled " + missingCall + " tool in your solution.";
  if (!/\bresult\s*=/.test(code)) return "Store the main lab response in a variable named result.";
  if (!/\bprint\s*\(/.test(code)) return "Print the final checked report so the mock runtime can inspect it.";
  return null;
}

export type GenAIPace = {
  id: GenAIPaceId;
  label: string;
  tagline: string;
  description: string;
  recommendedFor: string;
  estimatedLevel: string;
  topics: GenAITopic[];
};

const makeTopic = (
  title: string,
  summary: string,
  learningGoal: string,
  example: string,
  principles: [string, string, string],
  commonMistake: string,
  mentalModel: string,
): GenAITopic => ({
  title,
  summary,
  learningGoal,
  example,
  keyIdeas: [
    { title: "Core idea", body: principles[0] },
    { title: "System view", body: principles[1] },
    { title: "Production check", body: principles[2] },
  ],
  commonMistake,
  mentalModel,
});

export const GENAI_PACES: GenAIPace[] = [
  {
    id: "beginner",
    label: "Beginner",
    tagline: "Understand how modern AI systems work.",
    description:
      "Build a practical foundation in machine learning, language models, prompting, retrieval, tools, and multimodal systems without assuming prior AI experience.",
    recommendedFor:
      "Developers, students, and product builders who are new to generative AI and want a complete conceptual foundation.",
    estimatedLevel: "No prior GenAI experience",
    topics: [
      makeTopic(
        "AI/ML basics",
        "Artificial intelligence describes systems that perform tasks associated with human intelligence, while machine learning is the approach of learning useful patterns from data.",
        "Distinguish AI, machine learning, deep learning, and generative AI, then identify where learned models fit inside a complete product.",
        "task = {\"input\": user_request, \"model\": classifier, \"output\": predicted_label}",
        [
          "AI is the broad product capability; machine learning is one way to implement that capability.",
          "A model transforms inputs into predictions, but data pipelines and product rules determine how those predictions are used.",
          "A useful system is measured against a baseline, not judged only by whether its output looks impressive.",
        ],
        "Treating every automated rule as AI or assuming a model can replace deterministic business logic.",
        "Think of a model as one decision module inside a larger machine, not as the entire machine.",
      ),
      makeTopic(
        "Neural network basics",
        "A neural network learns layered mathematical transformations whose parameters are adjusted to reduce prediction error.",
        "Explain neurons, layers, activations, weights, forward passes, loss, and gradient-based learning at a conceptual level.",
        "prediction = network(features)\nloss = loss_fn(prediction, target)\nloss.backward()",
        [
          "Each layer turns one numerical representation into another, progressively extracting useful patterns.",
          "Training changes parameters; inference uses the learned parameters to produce an output.",
          "More layers or parameters do not guarantee better behavior when data, objectives, or evaluation are weak.",
        ],
        "Imagining that individual neurons store complete human-readable facts rather than participating in distributed representations.",
        "A neural network is a chain of adjustable signal mixers tuned by examples and feedback.",
      ),
      makeTopic(
        "NLP basics",
        "Natural language processing turns human language into representations and tasks that software can analyze or generate.",
        "Recognize common NLP tasks and understand why language ambiguity, context, and evaluation make them difficult.",
        "result = nlp_pipeline(task=\"sentiment\", text=\"The relay is finally stable\")",
        [
          "Classification, extraction, search, translation, summarization, and generation require different outputs and metrics.",
          "Text must be represented numerically before a model can process it.",
          "Language varies across domains, cultures, and time, so evaluation data must reflect real users.",
        ],
        "Using one generic accuracy score for every language task or assuming fluent text is necessarily correct.",
        "NLP is a translation layer between flexible human language and numerical model operations.",
      ),
      makeTopic(
        "Transformers",
        "Transformers process token relationships with attention, enabling models to use context efficiently across language sequences.",
        "Describe attention, token representations, positional information, and the difference between encoder, decoder, and encoder-decoder models.",
        "contextual_states = transformer(token_ids, attention_mask=mask)",
        [
          "Attention lets each token combine information from other relevant tokens in the current sequence.",
          "Position information is required because attention alone does not know token order.",
          "Architecture choice should follow the task: understanding, generation, or sequence-to-sequence transformation.",
        ],
        "Reducing transformers to a vague idea that every token simply looks at every other token equally.",
        "A transformer is a signal-routing network that lets each token gather context from the rest of the sequence.",
      ),
      makeTopic(
        "LLM fundamentals",
        "A large language model predicts likely token continuations using patterns learned from very large text and code datasets.",
        "Explain pretraining, next-token prediction, instruction tuning, inference, and why an LLM is probabilistic rather than a database.",
        "response = llm.generate(prompt, max_new_tokens=120)",
        [
          "Pretraining learns general language patterns; later tuning shapes the model toward useful interactions.",
          "Generation samples a continuation from probability distributions over tokens.",
          "Knowledge is encoded imperfectly in parameters, so external evidence and validation remain important.",
        ],
        "Assuming the model retrieves a stored answer verbatim or understands truth in the same way a database does.",
        "An LLM is an extremely capable continuation engine whose behavior can be directed but not perfectly dictated.",
      ),
      makeTopic(
        "Tokens",
        "Tokens are the model-specific units used to represent text, code, punctuation, and sometimes fragments of words.",
        "Estimate token usage, inspect tokenization, and explain how token boundaries affect cost, limits, and model behavior.",
        "tokens = tokenizer.encode(\"Reconnect the Signal Archive\")\nprint(len(tokens))",
        [
          "A token is not consistently a word; its size depends on the tokenizer and the text.",
          "Input and generated tokens jointly consume context and usually determine API cost.",
          "Languages, formatting, and unusual identifiers can tokenize very differently.",
        ],
        "Estimating limits by character or word count alone and forgetting to reserve space for the model's response.",
        "Tokens are the packets a language model reads and writes across its communication channel.",
      ),
      makeTopic(
        "Context windows",
        "The context window is the limited token workspace containing instructions, conversation, evidence, and generated output for one request.",
        "Budget context deliberately, prioritize relevant information, and recognize that longer context does not guarantee better attention.",
        "budget = model_limit - system_tokens - evidence_tokens - response_reserve",
        [
          "Everything the model needs for the current response must be represented in the active context or learned parameters.",
          "Important instructions can be diluted by irrelevant or duplicated content.",
          "Context selection should be measured by answer quality, latency, and cost.",
        ],
        "Filling the entire window because space is available, without checking whether each token helps the task.",
        "The context window is Byte's temporary mission console: only the loaded records are visible right now.",
      ),
      makeTopic(
        "Generation parameters",
        "Generation parameters control how a model selects tokens and when it stops, influencing creativity, consistency, and response length.",
        "Use temperature, top-p, maximum tokens, stop sequences, and deterministic settings appropriately for different tasks.",
        "answer = client.generate(prompt, temperature=0.2, max_tokens=300)",
        [
          "Lower randomness often helps extraction and coding; higher randomness can increase variety for ideation.",
          "Temperature and top-p both affect sampling and should rarely be tuned aggressively together.",
          "Parameters cannot repair a missing instruction, weak evidence, or unsuitable model.",
        ],
        "Treating temperature as a truth or intelligence control instead of a sampling control.",
        "Generation parameters are the control surface for how the model travels through possible continuations.",
      ),
      makeTopic(
        "Prompt engineering",
        "Prompt engineering supplies clear instructions, context, constraints, and output expectations so a model can perform a task reliably.",
        "Write structured prompts with goals, boundaries, examples, and explicit success criteria.",
        "prompt = {\"role\": \"system\", \"content\": \"Extract risks as valid JSON. Use only supplied evidence.\"}",
        [
          "Separate stable system behavior from the user's changing request and external evidence.",
          "Concrete constraints and representative examples reduce ambiguity.",
          "A prompt is production code: version it, test it, and observe failures.",
        ],
        "Writing increasingly long prompts without first clarifying the task, data, and measurable output contract.",
        "A prompt is a mission specification: it defines the objective, available signals, and rules of engagement.",
      ),
      makeTopic(
        "Hallucinations",
        "A hallucination is unsupported or incorrect model output presented with plausible language and confidence.",
        "Identify common causes, design grounded workflows, and choose abstention or verification strategies based on risk.",
        "if not evidence_supports(answer):\n    return {\"status\": \"insufficient_evidence\"}",
        [
          "Fluency is generated from language patterns and is not evidence of factual correctness.",
          "Retrieval, tools, citations, constraints, and deterministic checks reduce different failure modes.",
          "High-risk claims require source validation outside the model.",
        ],
        "Trying to eliminate hallucinations only by telling the model to be accurate.",
        "The model can draw a convincing route through missing terrain; grounding supplies the actual map.",
      ),
      makeTopic(
        "LLM APIs",
        "LLM APIs expose models through structured requests containing messages, parameters, tools, and response formats.",
        "Send a basic request, handle credentials safely, parse responses, and plan for errors, limits, and model changes.",
        "response = client.responses.create(model=model_id, input=messages)",
        [
          "The API contract includes authentication, model identifiers, input structure, and output events.",
          "Applications must handle timeouts, rate limits, retries, and partial failures.",
          "Model output is untrusted input and should be validated before use.",
        ],
        "Embedding API keys in browser code or assuming every successful HTTP response contains usable model output.",
        "An LLM API is a guarded gateway between your application and a remote inference system.",
      ),
      makeTopic(
        "Conversation state",
        "Conversation state is the selected history and application data carried forward so later turns remain coherent.",
        "Represent messages explicitly, decide what to retain, and separate temporary context from durable user memory.",
        "messages = previous_turns[-8:] + [{\"role\": \"user\", \"content\": request}]",
        [
          "Most model APIs are stateless unless the platform explicitly manages a conversation object.",
          "Not every prior message remains relevant; selection and summarization can improve results.",
          "Users need control over durable personal information and retention.",
        ],
        "Resending an unlimited transcript on every turn and calling that a memory system.",
        "Conversation state is a mission log assembled for the current request, not the model's private memory.",
      ),
      makeTopic(
        "Structured outputs",
        "Structured outputs constrain model responses to a machine-readable schema that downstream code can validate.",
        "Design a useful schema, request typed output, validate it, and handle refusals or invalid data safely.",
        "schema = {\"type\": \"object\", \"required\": [\"answer\", \"confidence\"]}",
        [
          "A schema defines shape and types, not whether the content is factually correct.",
          "Small, explicit structures are easier for models and applications to handle.",
          "Validation, repair, and fallback behavior belong at the system boundary.",
        ],
        "Trusting schema compliance as proof that every field is accurate or safe to execute.",
        "Structured output is a signal packet with named, typed channels instead of free-form transmission.",
      ),
      makeTopic(
        "Tool calling",
        "Tool calling lets a model request a predefined function while application code validates and executes the real operation.",
        "Define a narrow tool schema, route calls through trusted code, and return results for the model to interpret.",
        "tools = [{\"name\": \"lookup_relay\", \"parameters\": {\"relay_id\": \"string\"}}]",
        [
          "The model proposes a tool and arguments; the application remains the authority that executes it.",
          "Tool descriptions and schemas strongly influence selection quality.",
          "Permissions, input validation, timeouts, and audit logs are required for consequential tools.",
        ],
        "Letting model-generated arguments directly trigger privileged actions without policy checks.",
        "The model can request a module from the tool router, but the relay controller decides whether it may run.",
      ),
      makeTopic(
        "Embeddings",
        "Embeddings map content into numerical vectors so semantically related items can be compared by distance.",
        "Create embeddings, compare vector similarity, and choose representations suited to search, clustering, or recommendation.",
        "query_vector = embed(\"relay outage procedure\")\nscore = cosine(query_vector, document_vector)",
        [
          "Nearby vectors often represent similar meaning even when exact words differ.",
          "The embedding model and input formatting must be consistent across indexed content and queries.",
          "Semantic similarity is not the same as factual relevance or authorization.",
        ],
        "Mixing vectors from different embedding models or using semantic distance as the only retrieval signal.",
        "An embedding is a coordinate in a learned meaning-space where related signals cluster together.",
      ),
      makeTopic(
        "Vector DB basics",
        "A vector database stores embeddings with identifiers and metadata, then retrieves nearby vectors efficiently.",
        "Index records, issue a filtered similarity search, and understand the role of metadata, top-k, and index configuration.",
        "matches = vector_store.search(query_vector, top_k=5, filter={\"realm\": \"signal\"})",
        [
          "The database links vectors back to original records and searchable metadata.",
          "Approximate nearest-neighbor indexes trade small accuracy differences for large speed gains.",
          "Tenant, permission, freshness, and deletion rules must apply to the stored records.",
        ],
        "Indexing vectors without stable source identifiers, metadata, or a process for updates and deletion.",
        "A vector database is a navigable coordinate grid pointing back to trusted records.",
      ),
      makeTopic(
        "Basic RAG",
        "Retrieval-augmented generation finds relevant external evidence and includes it in the model context before generation.",
        "Build the retrieve-assemble-generate flow and require answers to remain grounded in supplied evidence.",
        "evidence = retrieve(question)\nanswer = generate(question, evidence=evidence)",
        [
          "Retrieval gives the model current or private knowledge that is not reliably stored in its parameters.",
          "The final prompt must clearly separate evidence from instructions and user input.",
          "Retrieval quality and answer faithfulness must be evaluated separately.",
        ],
        "Assuming RAG is complete after connecting a vector search call, without measuring whether the right evidence reaches the model.",
        "RAG opens the relevant archive records on Byte's console before asking for a decision.",
      ),
      makeTopic(
        "Multimodal basics",
        "Multimodal models can interpret or generate across text, images, audio, and other media within one workflow.",
        "Choose suitable modalities, prepare inputs, and reason about modality-specific quality, cost, privacy, and accessibility.",
        "result = model.analyze(text=question, image=inspection_photo)",
        [
          "Each modality has its own encoding, limits, and failure modes.",
          "Combining modalities can resolve ambiguity that one input alone cannot.",
          "Sensitive media, unsupported formats, and accessibility alternatives require deliberate handling.",
        ],
        "Assuming a model reads every visual detail perfectly or treating media inputs as harmless attachments.",
        "A multimodal model receives several sensor channels and fuses their signals into one response.",
      ),
    ],
  },
  {
    id: "intermediate",
    label: "Intermediate",
    tagline: "Build grounded agents and production RAG.",
    description:
      "Move from model calls to real GenAI systems: ingestion, retrieval, agent state, workflow graphs, evaluation, security, streaming, and caching.",
    recommendedFor:
      "Developers who have built basic LLM features and now need reliable architecture, evaluation, and operational patterns.",
    estimatedLevel: "Comfortable with LLM APIs",
    topics: [
      makeTopic(
        "Transformers deeper",
        "Transformer behavior emerges from repeated attention and feed-forward blocks operating on residual token representations.",
        "Trace a token through multi-head attention, residual connections, normalization, and feed-forward transformations.",
        "x = x + attention(norm(x))\nx = x + feed_forward(norm(x))",
        ["Different attention heads can learn different relationship patterns.", "Residual streams carry and combine information through every layer.", "Layer behavior must be studied empirically rather than assigned simple human meanings."],
        "Assuming each head or layer has one stable, interpretable purpose across prompts.",
        "A deep transformer is a stack of relay stages repeatedly routing and refining the same signal stream.",
      ),
      makeTopic(
        "Embeddings deeper",
        "Embedding quality depends on model choice, representation strategy, distance metric, and alignment with the retrieval task.",
        "Compare embedding models, normalize vectors, and evaluate retrieval with domain-specific query-document pairs.",
        "vectors = embed(texts, task=\"retrieval_document\")\nnormalized = l2_normalize(vectors)",
        ["Query and document encoders may need different task prefixes.", "Cosine, dot product, and Euclidean distance behave differently with normalization.", "Offline retrieval metrics should be paired with real answer-quality tests."],
        "Choosing an embedding model from leaderboard scores without testing the target domain and content length.",
        "Embedding engineering calibrates the coordinate system used by the archive map.",
      ),
      makeTopic(
        "Document ingestion",
        "Document ingestion converts heterogeneous sources into clean, traceable records ready for indexing and retrieval.",
        "Design extraction, normalization, deduplication, metadata, versioning, and failure-handling stages.",
        "record = ingest(source_uri, parser=detect_parser, preserve_layout=True)",
        ["Parsing must preserve the structure that carries meaning, such as headings and tables.", "Stable source IDs connect chunks to versions, permissions, and deletions.", "Failed or partial extraction must be observable and retryable."],
        "Sending raw files directly to chunking without checking extraction quality or provenance.",
        "Ingestion is the intake relay that turns many source formats into trusted archive records.",
      ),
      makeTopic(
        "Chunking",
        "Chunking divides content into retrieval units whose size and boundaries affect both recall and answer usefulness.",
        "Select structural, semantic, or fixed-size chunking and measure how overlap and context expansion affect retrieval.",
        "chunks = split_by_headings(document, max_tokens=500, overlap=60)",
        ["Natural document structure is usually more meaningful than arbitrary character windows.", "Chunks need enough standalone context to be interpreted after retrieval.", "Parent-child and neighboring-chunk expansion can recover broader context."],
        "Using one chunk size for every content type and tuning it without retrieval evaluation.",
        "Chunking cuts archive records into addressable signal packets without losing their origin.",
      ),
      makeTopic(
        "Retrieval engineering",
        "Retrieval engineering shapes queries, indexes, filters, and result assembly to surface the best evidence for a task.",
        "Build query transformation, metadata filtering, top-k selection, deduplication, and context assembly as measurable stages.",
        "query = rewrite(user_question)\ncandidates = retrieve(query, filters=access_scope)",
        ["The user's wording may not match the language used in source documents.", "Filters can improve relevance and enforce data boundaries.", "Retrieval traces should show which stage lost or improved relevant evidence."],
        "Optimizing only vector similarity while ignoring metadata, query intent, and downstream context quality.",
        "Retrieval engineering tunes every junction between the question and the evidence archive.",
      ),
      makeTopic(
        "Hybrid search",
        "Hybrid search combines lexical matching with semantic vector retrieval to capture both exact terms and conceptual similarity.",
        "Fuse keyword and vector rankings, tune weights, and evaluate performance across different query types.",
        "results = reciprocal_rank_fusion(bm25(query), vector_search(query))",
        ["Lexical search excels at identifiers, names, and exact phrases.", "Vector search helps when queries and documents use different wording.", "Rank fusion is more robust than comparing raw scores from unrelated retrieval systems."],
        "Adding keyword and vector scores directly even though their scales are not comparable.",
        "Hybrid search sends two scout signals through different routes and merges their ranked discoveries.",
      ),
      makeTopic(
        "Reranking",
        "Reranking applies a stronger relevance model to a small candidate set after fast first-stage retrieval.",
        "Choose a reranker, set candidate depth, and measure the latency-quality tradeoff on labeled queries.",
        "top_docs = reranker.rank(query, candidates[:50])[:8]",
        ["First-stage retrieval favors speed and recall; reranking favors precision.", "Cross-encoders can inspect query-document interactions more deeply than independent embeddings.", "Reranking cannot recover a relevant document absent from the candidate set."],
        "Reranking too many documents without a latency budget or too few to improve recall.",
        "A reranker is the archive's final inspection gate before evidence reaches the model.",
      ),
      makeTopic(
        "Advanced RAG",
        "Advanced RAG adapts retrieval and context construction to query complexity, evidence quality, and multi-step reasoning.",
        "Use routing, decomposition, iterative retrieval, context compression, and evidence-aware generation where justified.",
        "plan = decompose(question)\nevidence = [retrieve(step) for step in plan]",
        ["Different query types may need different indexes, tools, or retrieval strategies.", "Multi-hop questions require evidence from several linked facts.", "Every added stage needs an evaluation showing that it improves outcomes."],
        "Building an elaborate agentic retrieval loop before a simple baseline has been measured.",
        "Advanced RAG is a coordinated search mission that can adapt its route as evidence appears.",
      ),
      makeTopic(
        "RAG evaluation",
        "RAG evaluation separately measures retrieval relevance, context quality, answer correctness, and faithfulness to evidence.",
        "Create representative query sets and combine retrieval metrics, grounded-answer checks, and human review.",
        "metrics = evaluate_rag(dataset, measures=[\"recall@k\", \"faithfulness\", \"correctness\"])",
        ["Retrieval recall asks whether necessary evidence was found.", "Faithfulness asks whether claims are supported by supplied evidence.", "Synthetic judges should be calibrated against human decisions."],
        "Reporting one aggregate score that hides whether failures come from retrieval or generation.",
        "RAG evaluation instruments each relay stage so the location of signal loss is visible.",
      ),
      makeTopic(
        "Production prompting",
        "Production prompts are versioned, tested interfaces with stable policies, input boundaries, and output contracts.",
        "Build prompt templates, manage versions, protect instruction hierarchy, and run regression evaluations before release.",
        "prompt = registry.load(\"support-answer\", version=\"2.4.1\")",
        ["Prompt changes can alter behavior as significantly as code changes.", "Untrusted content must be clearly delimited from trusted instructions.", "A prompt release needs datasets, metrics, rollback, and ownership."],
        "Editing prompts directly in production without version history or regression tests.",
        "A production prompt is a deployed control program for model behavior.",
      ),
      makeTopic(
        "Model selection",
        "Model selection matches task quality, latency, context, modality, privacy, and cost requirements to available models.",
        "Create a task-based model evaluation and choose the smallest model that satisfies the product's requirements.",
        "model = choose_model(task, constraints={\"p95_ms\": 1800, \"quality\": 0.9})",
        ["No single model leads every task and operational constraint.", "Provider benchmarks rarely represent your prompts, data, and failure costs.", "Fallback and migration plans reduce dependence on one model version."],
        "Selecting the largest model by reputation without measuring task-specific value.",
        "Model selection assigns each mission to the right engine rather than sending every request to one giant core.",
      ),
      makeTopic(
        "Agents",
        "An agent lets a model choose actions, use tools, and update a plan in pursuit of a goal within application-controlled boundaries.",
        "Identify when an agent is justified and design its goals, tools, termination conditions, and oversight.",
        "decision = agent.step(goal=goal, state=state, tools=allowed_tools)",
        ["Agents are useful when the correct action sequence cannot be fully known in advance.", "The application controls tools, permissions, budgets, and execution.", "Deterministic workflows are preferable when the process is stable and known."],
        "Calling any multi-step prompt an agent or giving an agent autonomy without a bounded objective.",
        "An agent is a planner operating inside a fenced relay yard with approved controls.",
      ),
      makeTopic(
        "Agent loops",
        "An agent loop alternates between observing state, choosing an action, executing it, and deciding whether the goal is complete.",
        "Implement bounded observe-think-act cycles with step limits, validation, and explicit completion criteria.",
        "while not done(state) and steps < limit:\n    state = execute(agent.choose(state))",
        ["The state must contain enough evidence for the next decision.", "Every loop needs limits for steps, time, tokens, and spending.", "Tool results and errors should be normalized before returning to the model."],
        "Letting the model decide indefinitely whether it is finished without external limits.",
        "The agent loop is a relay circuit that must include a breaker and a measurable finish signal.",
      ),
      makeTopic(
        "Agent state",
        "Agent state records the goal, current plan, observations, tool results, pending actions, and execution status.",
        "Design typed state that can be inspected, persisted, resumed, and validated between agent steps.",
        "state = {\"goal\": goal, \"plan\": plan, \"observations\": [], \"status\": \"running\"}",
        ["Typed state makes decisions reproducible and failures diagnosable.", "State transitions should be explicit rather than hidden in prompt text.", "Sensitive values and tool credentials should not be copied into model-visible state."],
        "Using the chat transcript as the only state representation for a complex workflow.",
        "Agent state is the mission control board showing where the operation is and what happens next.",
      ),
      makeTopic(
        "Memory",
        "Agent memory selects and retrieves useful information from prior interactions or long-running work beyond the active context.",
        "Separate working, episodic, semantic, and user-profile memory and define consent, retention, and deletion behavior.",
        "memory.write(event, scope=user_id, ttl_days=30)\ncontext = memory.retrieve(query)",
        ["Working memory supports the current run; durable memory survives beyond it.", "Memory retrieval is a search problem and can return irrelevant or stale records.", "Users need visibility and control over personal memory."],
        "Persisting every conversation detail forever and calling it personalization.",
        "Memory is a governed archive, not an unlimited hidden transcript.",
      ),
      makeTopic(
        "Agent workflows",
        "Agent workflows combine deterministic steps and model decisions into an explicit, maintainable process.",
        "Choose where to use fixed code, model classification, tools, human approval, and recovery paths.",
        "workflow = ingest >> classify >> route >> human_if_high_risk >> resolve",
        ["Deterministic nodes provide consistency where the process is known.", "Model nodes are most valuable at ambiguous interpretation or planning points.", "Each edge should define success, failure, retry, and cancellation behavior."],
        "Replacing an understandable workflow with one unconstrained agent prompt.",
        "A workflow is the realm map; agents may choose paths only at marked junctions.",
      ),
      makeTopic(
        "LangChain",
        "LangChain provides composable interfaces for models, prompts, retrievers, tools, and runnable application pipelines.",
        "Use core abstractions selectively, trace data through a chain, and avoid coupling domain logic to framework details.",
        "chain = prompt | model | output_parser\nresult = chain.invoke(inputs)",
        ["Runnable composition can make common model pipelines concise.", "Framework abstractions should not hide provider errors or application policy.", "Pin versions and isolate integrations because the ecosystem changes quickly."],
        "Adopting a framework abstraction before understanding the underlying API and data flow.",
        "LangChain is a connector kit; the architecture and safety rules still belong to your application.",
      ),
      makeTopic(
        "LangGraph",
        "LangGraph represents long-running agent workflows as stateful graphs with nodes, edges, checkpoints, and controlled cycles.",
        "Model a workflow graph, define typed shared state, and use checkpoints for pause, recovery, and human review.",
        "graph.add_edge(\"retrieve\", \"grade_evidence\")\ngraph.compile(checkpointer=store)",
        ["Graph structure makes branching and cycles explicit.", "Checkpoints enable durable execution and inspection between steps.", "Node operations should be idempotent when retries are possible."],
        "Using graph cycles without termination conditions or replay-safe side effects.",
        "LangGraph is a visible relay circuit whose state can pause and resume at each junction.",
      ),
      makeTopic(
        "MCP",
        "The Model Context Protocol standardizes how AI applications discover and use external tools, resources, and prompts through servers.",
        "Explain MCP clients and servers, inspect capabilities, and apply trust, consent, and authorization boundaries.",
        "capabilities = await client.list_tools()\nresult = await client.call_tool(\"lookup_record\", args)",
        ["MCP provides a protocol boundary, not automatic trust.", "Servers can expose tools, resources, and reusable prompts with structured schemas.", "Clients must validate server identity, user intent, arguments, and returned content."],
        "Treating every connected MCP server or advertised tool as safe to invoke.",
        "MCP is a universal docking interface; every connected module still passes security inspection.",
      ),
      makeTopic(
        "Evaluation",
        "GenAI evaluation measures model and system behavior against representative tasks, criteria, and risk thresholds.",
        "Build versioned datasets, deterministic checks, model-based graders, and human review into a repeatable evaluation pipeline.",
        "report = eval_run(app_version, dataset=\"support-v3\", graders=graders)",
        ["Task-specific examples matter more than generic model benchmarks.", "Automated graders need calibration, variance checks, and clear rubrics.", "Evaluation should run before release and continue on production samples."],
        "Using a handful of favorite prompts as the entire test suite.",
        "Evaluation is the relay test bench that sends known signals through every release.",
      ),
      makeTopic(
        "Guardrails",
        "Guardrails are layered controls that constrain inputs, outputs, tool use, and application behavior around probabilistic models.",
        "Combine deterministic validation, policy models, permissions, rate limits, and human review based on risk.",
        "decision = policy.check(user, action, model_output)\nif not decision.allowed: block()",
        ["No single prompt or classifier is a complete safety boundary.", "Controls should be placed before and after the model and around tools.", "Guardrails need adversarial testing and monitored false-positive rates."],
        "Calling one moderation API and assuming the complete system is now safe.",
        "Guardrails are independent circuit breakers placed around every consequential relay.",
      ),
      makeTopic(
        "Prompt injection",
        "Prompt injection occurs when untrusted content attempts to override instructions or manipulate model-driven actions.",
        "Separate trust zones, minimize model authority, detect suspicious instructions, and keep authorization outside the model.",
        "evidence = mark_untrusted(retrieved_text)\nallowed = authorize(user, requested_tool)",
        ["Retrieved pages, emails, documents, and tool results can all contain hostile instructions.", "Instruction hierarchy helps but cannot guarantee isolation.", "The model must never be the sole authority for privileged actions."],
        "Trying to solve prompt injection only by adding a stronger system message.",
        "Untrusted content is a signal entering through an external port; it cannot rewrite the relay controller.",
      ),
      makeTopic(
        "Security",
        "GenAI security combines standard application security with model-specific risks involving data, tools, prompts, and generated output.",
        "Threat-model assets and trust boundaries, then protect secrets, tenant data, tools, logs, and downstream interpreters.",
        "security_context = {\"tenant\": tenant_id, \"scopes\": scopes, \"data_class\": \"private\"}",
        ["LLM output is untrusted data even when it looks like code or a valid command.", "Access controls must be enforced by backend systems on every request.", "Logs and evaluation datasets can accidentally retain sensitive prompts and outputs."],
        "Focusing on jailbreaks while neglecting ordinary authentication, authorization, injection, and data isolation.",
        "The model is one component inside the security perimeter, never the perimeter itself.",
      ),
      makeTopic(
        "Streaming",
        "Streaming delivers model output incrementally, improving perceived latency while introducing partial-state and cancellation concerns.",
        "Process token or event streams, render partial output safely, handle disconnects, and record final usage and status.",
        "for event in client.stream(request):\n    handle(event.type, event.data)",
        ["Time to first token and total completion time are different user-experience metrics.", "Structured tool and output events must not be rendered as plain text.", "Cancellation should stop downstream work and close resources cleanly."],
        "Appending every event's raw payload to the UI without handling event types or incomplete output.",
        "Streaming opens the signal channel before the full transmission has finished.",
      ),
      makeTopic(
        "Caching",
        "Caching reuses stable model, embedding, retrieval, or prefix results to reduce cost and latency.",
        "Choose safe cache keys, freshness rules, tenant boundaries, and invalidation strategies for each GenAI stage.",
        "key = hash(model, prompt_version, normalized_input, tenant_scope)",
        ["Exact response caches suit deterministic repeated requests.", "Semantic caches trade stricter correctness for broader hit rates.", "Private data and model changes must be reflected in keys and invalidation."],
        "Caching responses across users without tenant isolation or serving stale answers after source updates.",
        "A cache is a nearby signal buffer whose contents need identity, expiry, and provenance.",
      ),
    ],
  },
  {
    id: "expert",
    label: "Expert",
    tagline: "Engineer reliable GenAI platforms at scale.",
    description:
      "Master model internals, training and inference, durable multi-agent systems, evaluation, observability, security, distributed infrastructure, and LLMOps.",
    recommendedFor:
      "Experienced AI engineers and technical leads designing high-scale, high-reliability GenAI products and platforms.",
    estimatedLevel: "Production GenAI experience",
    topics: [
      makeTopic(
        "Transformer internals",
        "Transformer internals connect tensor shapes, attention projections, positional methods, residual streams, normalization, and feed-forward computation.",
        "Reason about Q/K/V projections, attention complexity, grouped-query variants, rotary position encoding, and residual pathways.",
        "scores = (Q @ K.transpose(-2, -1)) * scale\nattention = softmax(scores + mask)",
        ["Attention cost grows rapidly with sequence length.", "Multi-query and grouped-query attention reduce key-value memory during inference.", "Numerical stability and tensor layout strongly affect real implementations."],
        "Understanding equations but ignoring tensor dimensions, masking, memory movement, and kernel behavior.",
        "Transformer internals are the wiring diagram and signal timing of the model core.",
      ),
      makeTopic(
        "LLM training",
        "LLM training coordinates data preparation, distributed optimization, objective design, checkpointing, and evaluation across large compute clusters.",
        "Explain pretraining pipelines, optimizer states, mixed precision, parallelism strategies, and checkpoint recovery.",
        "loss = model(batch).loss\nscaler.scale(loss).backward()\noptimizer.step()",
        ["Training data quality and deduplication shape model behavior as much as raw token count.", "Optimizer and activation state often consume more memory than model weights.", "Evaluation and checkpoint cadence must detect regressions before compute is wasted."],
        "Estimating training feasibility from parameter count alone and ignoring data, optimizer, communication, and failure recovery.",
        "Training is a synchronized factory that adjusts billions of controls from a continuous stream of examples.",
      ),
      makeTopic(
        "Fine-tuning",
        "Fine-tuning adapts a pretrained model to target behavior or a domain using curated examples and an explicit evaluation objective.",
        "Choose supervised or preference-based tuning, prepare high-quality data, and compare against prompting and retrieval baselines.",
        "trainer.fit(model, train_dataset, eval_dataset, objective=\"instruction_following\")",
        ["Fine-tuning changes behavior and style more reliably than it injects precise changing facts.", "Data diversity and label quality determine whether the model generalizes.", "A base-model and prompt baseline is necessary to prove the tuning adds value."],
        "Fine-tuning on a small noisy dataset simply because prompting needs improvement.",
        "Fine-tuning recalibrates the model core; it should not replace the external knowledge archive.",
      ),
      makeTopic(
        "LoRA/QLoRA/PEFT",
        "Parameter-efficient fine-tuning adapts a model by training small added parameter sets instead of updating every base weight.",
        "Select target modules, ranks, precision, and adapter strategies, then evaluate merge and serving tradeoffs.",
        "adapter = LoRA(rank=16, target_modules=[\"q_proj\", \"v_proj\"])",
        ["LoRA learns low-rank weight updates while preserving frozen base weights.", "QLoRA reduces memory further by training adapters over a quantized base model.", "Adapter quality, storage, routing, and merge behavior must be managed operationally."],
        "Assuming parameter efficiency removes the need for careful data, evaluation, or sufficient GPU memory.",
        "PEFT adds a compact calibration circuit beside a large fixed model core.",
      ),
      makeTopic(
        "Quantization",
        "Quantization represents weights or activations with lower precision to reduce memory and accelerate inference at a possible quality cost.",
        "Compare post-training and quantization-aware approaches, calibration, formats, kernels, and task-specific accuracy impact.",
        "quantized = quantize(model, bits=4, calibration=sample_prompts)",
        ["Weight-only, activation, and KV-cache quantization affect different memory and compute paths.", "Hardware kernels determine whether a compressed representation yields real speedups.", "Quality loss varies by layer, task, model size, and quantization method."],
        "Choosing the smallest bit width without verifying kernel support and workload quality.",
        "Quantization compresses signal precision so the model can travel through narrower hardware channels.",
      ),
      makeTopic(
        "LLM inference",
        "LLM inference has a compute-heavy prompt prefill phase and a memory-bandwidth-sensitive autoregressive decode phase.",
        "Analyze throughput, latency, batching, KV-cache use, speculative decoding, and scheduling for a target workload.",
        "metrics = benchmark(server, prompt_lengths, output_lengths, concurrency)",
        ["Prefill and decode stress hardware differently.", "Continuous batching improves throughput while scheduling influences tail latency.", "Tokens per second is incomplete without concurrency, sequence lengths, and quality constraints."],
        "Comparing serving systems with one short prompt and no concurrent traffic.",
        "Inference is a two-stage relay: absorb the mission context, then transmit one token at a time.",
      ),
      makeTopic(
        "Model serving",
        "Model serving exposes inference through reliable APIs while managing batching, replicas, memory, rollout, and failure isolation.",
        "Design a serving tier with admission control, health checks, autoscaling, model loading, and safe deployments.",
        "route = gateway.assign(model_id, estimated_tokens, priority=\"interactive\")",
        ["Admission control protects latency and memory when demand exceeds capacity.", "Model loading and warmup affect rollout time and availability.", "Canaries and rollback require versioned model, tokenizer, and runtime artifacts."],
        "Treating a running inference process as a production serving platform.",
        "Model serving is the dispatch layer that assigns each signal to a healthy inference engine.",
      ),
      makeTopic(
        "GPU fundamentals",
        "GPU performance depends on massive parallelism, memory hierarchy, tensor cores, kernel efficiency, and data movement.",
        "Relate model operations to compute, VRAM, bandwidth, precision, kernels, and profiling results.",
        "profile(model_step, metrics=[\"sm_util\", \"hbm_bandwidth\", \"kernel_time\"])",
        ["VRAM capacity decides whether model state fits; bandwidth often limits token decoding.", "Lower precision can unlock faster tensor-core paths.", "Profiling distinguishes compute, memory, communication, and launch bottlenecks."],
        "Using GPU utilization alone to diagnose performance without inspecting memory bandwidth and kernel timelines.",
        "A GPU is a parallel signal array whose speed depends on keeping thousands of lanes supplied with data.",
      ),
      makeTopic(
        "Distributed inference",
        "Distributed inference partitions model computation or replicas across accelerators to serve models and workloads that exceed one device.",
        "Choose tensor, pipeline, data, or expert parallelism and reason about communication, placement, and failure tradeoffs.",
        "deployment = shard(model, tensor_parallel=4, pipeline_parallel=2)",
        ["Tensor parallelism communicates within layers; pipeline parallelism splits layers across stages.", "Network topology and collective operations can dominate performance.", "Replicas improve throughput and resilience but require routing and capacity coordination."],
        "Adding more GPUs without accounting for interconnect bandwidth, synchronization, and uneven stages.",
        "Distributed inference splits one signal engine across coordinated relay chambers.",
      ),
      makeTopic(
        "Advanced RAG",
        "Expert RAG systems combine multiple indexes, graph or structured retrieval, adaptive planning, and provenance-aware synthesis.",
        "Architect retrieval across unstructured, relational, graph, and tool-based sources with explicit evidence lineage.",
        "evidence = router.query(question, sources=[vector, sql, graph, api])",
        ["Source routing should depend on query intent and evidence type.", "Claims need traceable links to source versions and access decisions.", "Complexity is justified only when measured against simpler retrieval baselines."],
        "Using one vector index as the universal interface to data that is naturally relational or transactional.",
        "Expert RAG is a federated evidence network with routing, provenance, and quality control.",
      ),
      makeTopic(
        "Context engineering",
        "Context engineering designs the complete information state presented to a model: instructions, evidence, tools, memory, examples, and output contracts.",
        "Build context selection, ordering, compression, conflict handling, and token budgeting as an evaluated system.",
        "context = assemble(policy, task, retrieved_evidence, memory, tool_schemas, budget)",
        ["Context quality depends on relevance, authority, order, and clear trust boundaries.", "Compression must preserve task-critical evidence and uncertainty.", "The best context is task-specific and often much smaller than the maximum window."],
        "Treating context engineering as merely writing a longer prompt.",
        "Context engineering configures the entire mission console before the model makes a decision.",
      ),
      makeTopic(
        "Advanced agents",
        "Advanced agents plan under uncertainty, use heterogeneous tools, revise based on observations, and escalate when autonomy is unsafe.",
        "Design planning, reflection, tool routing, uncertainty handling, budgets, and human control around a bounded objective.",
        "policy = agent.decide(state, uncertainty_threshold=0.2, budget=remaining_budget)",
        ["Planning and execution should be separated when plans need review or adaptation.", "Uncertainty and risk should influence whether the agent acts, asks, or escalates.", "Agent capability must remain bounded by externally enforced permissions."],
        "Adding self-reflection loops that increase cost without measurable improvement.",
        "An advanced agent is an adaptive operator inside a monitored, permissioned control room.",
      ),
      makeTopic(
        "Durable agents",
        "Durable agents persist state and resume correctly across long waits, process restarts, retries, and human approvals.",
        "Implement checkpoints, idempotent activities, event histories, cancellation, deadlines, and recovery.",
        "checkpoint.save(run_id, state, next_node)\nresume(run_id)",
        ["Workflow state must be stored outside model context.", "Side effects require idempotency keys or compensating actions.", "Long-running work needs explicit ownership, timeout, and cancellation semantics."],
        "Retrying a failed agent step that sends the same external message or payment twice.",
        "A durable agent leaves verified checkpoints along the route so any worker can resume safely.",
      ),
      makeTopic(
        "Multi-agent systems",
        "Multi-agent systems divide work among specialized agents that coordinate through explicit tasks, messages, and shared artifacts.",
        "Decide when specialization adds value and design orchestration, conflict resolution, budgets, and observability.",
        "results = orchestrator.run(tasks, workers=[researcher, verifier, synthesizer])",
        ["Specialization can improve focus but increases coordination and failure surfaces.", "Shared state and message contracts must remain structured and traceable.", "Independent verification can improve reliability more than redundant agent conversation."],
        "Using many agents for a task one well-designed workflow could complete more cheaply and reliably.",
        "A multi-agent system is a relay team with defined roles, handoffs, and one accountable mission controller.",
      ),
      makeTopic(
        "Advanced memory",
        "Advanced memory systems consolidate, retrieve, update, and forget information across long-running agents and users.",
        "Design memory schemas, salience scoring, conflict resolution, temporal validity, and privacy controls.",
        "memory.upsert(fact, valid_from=now, source=event_id, confidence=0.92)",
        ["Memories need provenance, time, scope, and confidence.", "New evidence may supersede rather than simply append to earlier memory.", "Retrieval, consolidation, deletion, and auditability are distinct operations."],
        "Storing model-generated summaries as permanent facts without source links or user correction.",
        "Advanced memory is a living knowledge archive whose records can age, conflict, and be retired.",
      ),
      makeTopic(
        "Evaluation engineering",
        "Evaluation engineering creates dependable measurement infrastructure for prompts, models, retrieval, agents, and complete user journeys.",
        "Build dataset governance, experiment tracking, grader calibration, statistical analysis, and release gates.",
        "gate = compare(candidate, baseline, slices=risk_slices, confidence=0.95)",
        ["Datasets require lineage, coverage, versioning, and leakage controls.", "Metrics should be segmented by task and risk, not only averaged.", "Release decisions need uncertainty estimates and documented thresholds."],
        "Optimizing repeatedly on a fixed test set until it no longer predicts production performance.",
        "Evaluation engineering is the calibrated sensor network that decides whether a release may enter the realm.",
      ),
      makeTopic(
        "Agent evaluation",
        "Agent evaluation measures task completion, trajectory quality, tool correctness, efficiency, safety, and recovery behavior.",
        "Evaluate final outcomes and intermediate traces using simulated environments, deterministic checks, and human review.",
        "score = evaluate_trajectory(trace, goal, allowed_actions, expected_invariants)",
        ["A correct final answer can hide unsafe or wasteful actions.", "Tool-call precision, step count, and recovery are trajectory-level properties.", "Reproducible sandboxes enable safe testing of consequential behavior."],
        "Scoring only the agent's final message while ignoring its actions and side effects.",
        "Agent evaluation audits the complete flight recorder, not just the final arrival signal.",
      ),
      makeTopic(
        "Observability",
        "GenAI observability connects traces, prompts, retrieval results, tool calls, model usage, latency, cost, and user feedback.",
        "Define structured telemetry, privacy controls, sampling, correlation IDs, and actionable service-level indicators.",
        "trace.record(model=model_id, prompt_version=version, tokens=usage, latency_ms=elapsed)",
        ["A request trace should cross retrieval, model, tool, and application boundaries.", "Sensitive content needs redaction, access control, and retention limits.", "Operational dashboards should connect system metrics to user-visible quality."],
        "Logging complete prompts everywhere without privacy review or capturing only provider latency.",
        "Observability is the sensor mesh that reveals how every signal moved through the system.",
      ),
      makeTopic(
        "Cost optimization",
        "GenAI cost optimization improves unit economics through model choice, token efficiency, caching, batching, retrieval, and workload design.",
        "Attribute cost per feature and user outcome, then optimize without violating quality or latency thresholds.",
        "unit_cost = (input_tokens * input_rate) + (output_tokens * output_rate) + tool_costs",
        ["Costs must be allocated to actual workflows, tenants, and outcomes.", "Smaller models, shorter context, and cached stages often outperform blunt output limits.", "Optimization needs quality guardrails to avoid silent degradation."],
        "Focusing on per-token price while ignoring retries, oversized context, low cache hits, and failed tasks.",
        "Cost optimization measures how much relay energy produces one successful mission.",
      ),
      makeTopic(
        "Model routing",
        "Model routing dynamically assigns requests to models based on task, risk, complexity, latency, and cost.",
        "Build policy-based or learned routers with confidence thresholds, fallbacks, and evaluation against a stable baseline.",
        "model = router.route(features={\"task\": task, \"risk\": risk, \"length\": tokens})",
        ["Routing features must be available before the expensive model call.", "Escalation can send uncertain or high-risk tasks to stronger models or humans.", "Router mistakes and drift require their own evaluation and monitoring."],
        "Optimizing route cost without measuring how often difficult tasks are sent to inadequate models.",
        "A model router is the dispatch relay that chooses the right engine for each incoming signal.",
      ),
      makeTopic(
        "Reliability",
        "Reliable GenAI systems deliver acceptable behavior despite stochastic outputs, provider faults, overload, bad inputs, and changing models.",
        "Define service levels, timeouts, retries, circuit breakers, fallbacks, degradation, and chaos tests for model workflows.",
        "result = resilient_call(primary, timeout=8, fallback=backup, retry=retry_policy)",
        ["Retries must distinguish transient failures from deterministic bad requests.", "Fallbacks need compatibility checks for prompts, tools, context, and schemas.", "Quality reliability belongs beside availability and latency."],
        "Retrying every failure or switching models without verifying equivalent capabilities.",
        "Reliability is a redundant relay network that preserves useful service when individual nodes fail.",
      ),
      makeTopic(
        "Advanced security",
        "Advanced GenAI security uses threat modeling, isolation, provenance, secure execution, and continuous adversarial testing across model workflows.",
        "Design defenses for data exfiltration, supply-chain risk, indirect injection, unsafe code, and cross-tenant access.",
        "sandbox.execute(generated_code, network=\"deny\", filesystem=\"ephemeral\", cpu_limit=2)",
        ["Model and tool supply chains include providers, adapters, datasets, plugins, and parsers.", "Generated code and content need isolation before interpretation or execution.", "Security testing should cover multi-step attacks across trust boundaries."],
        "Testing only direct jailbreak prompts while ignoring retrieved content, files, tools, and agent chains.",
        "Advanced security maps every path a hostile signal could take from source to sensitive sink.",
      ),
      makeTopic(
        "Agent authorization",
        "Agent authorization ensures every requested action is permitted for the user, resource, purpose, and current workflow state.",
        "Enforce capability-scoped tools, policy decisions, approvals, delegated authority, and auditable action receipts.",
        "decision = authorize(subject=user, action=tool_call, resource=target, context=run_state)",
        ["Authentication identifies the actor; authorization decides the allowed action.", "The model may recommend but cannot grant itself or the user additional authority.", "High-impact actions can require fresh consent or human approval."],
        "Giving an agent one broad service credential and relying on its prompt to respect boundaries.",
        "Authorization is the access controller outside the agent's reach at every relay gate.",
      ),
      makeTopic(
        "GenAI system design",
        "GenAI system design combines model capabilities with data, workflows, controls, evaluation, operations, and user experience.",
        "Translate product requirements into components, trust boundaries, failure modes, and measurable architecture decisions.",
        "design = map_requirements_to_components(quality, latency, privacy, cost, risk)",
        ["Start with the user outcome and uncertainty, not with a preferred model or framework.", "Probabilistic components need deterministic contracts and recovery paths around them.", "Architecture should expose replaceable model, retrieval, and tool boundaries."],
        "Drawing a model box at the center and leaving data quality, policy, evaluation, and operations unspecified.",
        "System design is the complete Code Realm map showing signal flows, controls, stores, and recovery routes.",
      ),
      makeTopic(
        "Distributed systems",
        "GenAI platforms inherit distributed-systems challenges including partial failure, concurrency, queues, consistency, retries, and backpressure.",
        "Apply idempotency, durable messaging, state ownership, load shedding, and consistency choices to AI workflows.",
        "job_id = queue.publish(request, idempotency_key=run_id)\nworker.process_once(job_id)",
        ["Network calls can time out even when the remote operation succeeded.", "Backpressure protects finite model capacity from unbounded queues.", "State transitions and side effects need explicit consistency and replay semantics."],
        "Assuming a timeout means nothing happened and retrying a consequential action without an idempotency key.",
        "A distributed GenAI system is a relay mesh where messages can be delayed, repeated, or lost.",
      ),
      makeTopic(
        "Docker/Kubernetes/GPU",
        "Container and cluster orchestration packages model services, schedules GPU workloads, manages configuration, and controls rollout and recovery.",
        "Build GPU-ready containers and reason about device plugins, scheduling, storage, networking, probes, and autoscaling.",
        "resources:\n  limits:\n    nvidia.com/gpu: 1\nreadinessProbe: /ready",
        ["Containers must match CUDA, driver, framework, and model-runtime compatibility.", "GPU scheduling needs resource awareness beyond ordinary CPU and memory requests.", "Readiness should verify the model can serve, not only that the process started."],
        "Building a huge image with model weights baked in and using a basic process health check as readiness.",
        "Kubernetes is the realm dispatcher coordinating packaged model engines across scarce GPU chambers.",
      ),
      makeTopic(
        "LLMOps",
        "LLMOps manages the lifecycle of prompts, datasets, models, evaluations, deployments, telemetry, feedback, and governance.",
        "Design versioned artifacts, promotion workflows, lineage, rollback, approval, and environment parity.",
        "release = promote(prompt_version, model_version, eval_report, policy_version)",
        ["Every behavior-affecting artifact should be versioned and traceable.", "Promotion gates connect evaluation evidence to deployment decisions.", "Operational ownership includes rollback, incidents, audits, and deprecation."],
        "Versioning the application code while prompts, datasets, and model configuration change invisibly.",
        "LLMOps is the control plane that moves tested AI artifacts safely from lab to live realms.",
      ),
      makeTopic(
        "Production feedback loops",
        "Production feedback loops turn user outcomes, corrections, incidents, and sampled traces into prioritized improvements and new evaluations.",
        "Collect consented signals, triage them, create labeled examples, validate changes, and monitor for unintended effects.",
        "feedback_event = capture(outcome, user_signal, trace_id, consent=True)",
        ["Explicit feedback is useful but sparse and biased.", "Operational and behavioral signals need interpretation before becoming labels.", "Feedback-derived data requires privacy, quality review, and train-test leakage controls."],
        "Training directly on raw thumbs-up or thumbs-down events without understanding user intent or data rights.",
        "A production feedback loop returns field signals to the test bench, then releases only verified improvements.",
      ),
    ],
  },
];
