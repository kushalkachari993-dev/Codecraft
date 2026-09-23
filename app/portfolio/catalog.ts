import {
  PORTFOLIO_MILESTONE_IDS,
  PORTFOLIO_RUBRIC_IDS,
  type PlayerProgress,
  type PortfolioProjectProgress,
  type PortfolioTrackId,
} from "../progress";

export type PortfolioMilestone = {
  id: typeof PORTFOLIO_MILESTONE_IDS[number];
  title: string;
  deliverable: string;
  evidencePrompt: string;
};

export type PortfolioProject = {
  id: PortfolioTrackId;
  label: string;
  icon: string;
  title: string;
  role: string;
  scenario: string;
  outcome: string;
  skills: string[];
  artifacts: string[];
  milestones: PortfolioMilestone[];
};

const milestone = (id: PortfolioMilestone["id"], title: string, deliverable: string, evidencePrompt: string): PortfolioMilestone => ({ id, title, deliverable, evidencePrompt });

export const PORTFOLIO_RUBRIC = [
  { id: "correctness", label: "Technical correctness", description: "The solution behaves as claimed and handles its stated edge cases." },
  { id: "decisions", label: "Engineering decisions", description: "Important tradeoffs and rejected alternatives are explained with evidence." },
  { id: "reliability", label: "Verification and reliability", description: "Tests, failure handling, accessibility, security, or operational checks fit the project." },
  { id: "communication", label: "Communication", description: "A reviewer can understand, run, and evaluate the work without hidden context." },
] as const;

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "python", label: "Python", icon: "Py", title: "Operations Automation Toolkit", role: "Automation engineer",
    scenario: "A support team manually validates daily delivery files, summarizes failures, and prepares a handoff report. The process is slow, inconsistent, and difficult to replay.",
    outcome: "Build a command-line toolkit that validates inputs, records rejected rows, produces a deterministic report, and can be safely rerun.",
    skills: ["Python architecture", "File processing", "Error handling", "Automated tests", "CLI design"],
    artifacts: ["Architecture note", "Python package", "Test report", "Sample input/output", "Operator guide"],
    milestones: [
      milestone("brief", "Define the operational contract", "A concise problem statement with input, output, users, constraints, and failure policy.", "Record the workflow, two failure cases, and the measurable result the team needs."),
      milestone("design", "Design the toolkit", "A module map, data flow, command interface, and rejected alternative.", "Explain where validation, transformation, reporting, and side effects live."),
      milestone("build", "Implement the vertical slice", "A runnable flow that handles valid, invalid, and duplicate records.", "Describe the implemented commands and link each behavior to a requirement."),
      milestone("verify", "Test replay and failure behavior", "Unit tests plus a replay check proving the same input converges on the same output.", "Summarize test cases, observed failures, and the evidence that retries are safe."),
      milestone("present", "Prepare the reviewer handoff", "A README with setup, examples, limitations, and the next engineering improvement.", "Write the short demonstration path a reviewer should follow."),
    ],
  },
  {
    id: "genai", label: "GenAI", icon: "AI", title: "Evidence-Grounded Support Assistant", role: "AI application engineer",
    scenario: "A product team needs an assistant that answers policy questions from an approved knowledge pack without inventing unsupported instructions.",
    outcome: "Design an assistant with retrieval, citations, refusal behavior, evaluation cases, and an incident-ready trace of every answer.",
    skills: ["Prompt contracts", "Retrieval design", "Tool boundaries", "Evaluation", "Safety cases"],
    artifacts: ["System contract", "Knowledge pack", "Evaluation set", "Trace samples", "Risk register"],
    milestones: [
      milestone("brief", "Define the answer contract", "Supported questions, prohibited behavior, source rules, and success measures.", "List answerable and unanswerable cases plus the evidence required for a response."),
      milestone("design", "Design retrieval and guardrails", "A grounded response flow with source selection, refusal, and trace boundaries.", "Explain the retrieval unit, context budget, and one rejected architecture."),
      milestone("build", "Create the assistant slice", "A working flow for retrieval, cited answers, and safe abstention.", "Capture representative prompts, retrieved evidence, and final outputs."),
      milestone("verify", "Run an evaluation campaign", "A balanced test set covering accuracy, grounding, refusal, and adversarial inputs.", "Report pass rates, important failures, and the change made from the results."),
      milestone("present", "Publish the model card", "A reviewer guide describing capabilities, limits, risks, and monitoring signals.", "Summarize what the assistant can be trusted to do and where human review remains required."),
    ],
  },
  {
    id: "sql", label: "SQL", icon: "DB", title: "Trusted Commerce Analytics Mart", role: "Analytics engineer",
    scenario: "Finance and product teams report different revenue because orders, returns, discounts, and customer history are modeled at mixed grains.",
    outcome: "Deliver a documented analytical model with reconciled metrics, tested transformations, and performance evidence.",
    skills: ["Dimensional modeling", "Advanced SQL", "Data tests", "Query plans", "Metric definitions"],
    artifacts: ["Grain declaration", "DDL and models", "Reconciliation query", "Query-plan comparison", "Metric guide"],
    milestones: [
      milestone("brief", "Define trusted metrics", "A reviewed metric contract for revenue, orders, returns, active customers, and reporting time.", "State each metric grain, time rule, exclusions, accountable owner, and approval evidence."),
      milestone("design", "Design the analytical model", "A fact-and-dimension design covering keys, history, late-arriving data, and mixed-grain protection.", "Explain every table grain, the joining rules, and why the model prevents double counting."),
      milestone("build", "Implement the mart", "DDL and transformations for a complete commerce slice with documented incremental behavior.", "Record the model objects, incremental boundary, representative queries, and generated outputs."),
      milestone("verify", "Reconcile and tune", "Quality tests, source-to-mart reconciliation, and a measured before/after query-plan comparison.", "Provide counts, totals, failed tests, query-plan evidence, and the measured performance change."),
      milestone("present", "Publish the analytics contract", "A complete data dictionary and reviewer query pack with ownership and known limitations.", "Explain how another analyst should safely answer three business questions and verify each result."),
    ],
  },
  {
    id: "cloud", label: "Cloud Engineering", icon: "CL", title: "Resilient Multi-Environment Service Platform", role: "Cloud platform engineer",
    scenario: "A growing service is deployed manually with broad permissions, inconsistent environments, and no tested recovery path.",
    outcome: "Design a reproducible platform with infrastructure as code, least privilege, safe delivery, observability, and recovery evidence.",
    skills: ["Infrastructure as code", "IAM", "CI/CD", "Observability", "Disaster recovery"],
    artifacts: ["Architecture decision record", "Terraform modules", "Pipeline policy", "Runbook", "Recovery exercise"],
    milestones: [
      milestone("brief", "Define service objectives", "Workload, environments, SLOs, threats, data boundaries, and cost constraints.", "State the traffic, recovery, security, and budget assumptions that drive the design."),
      milestone("design", "Design the platform", "A network, identity, compute, data, and delivery architecture with tradeoffs.", "Explain trust boundaries, blast radius, and one rejected topology."),
      milestone("build", "Author the infrastructure slice", "Static infrastructure and pipeline artifacts for dev and production.", "List the modules, policies, promotion rules, and safe defaults implemented."),
      milestone("verify", "Exercise failure and recovery", "Policy checks, plan review, rollback evidence, and a timed recovery drill.", "Capture the failure timeline, operator actions, and whether objectives were met."),
      milestone("present", "Defend the architecture", "A concise platform brief with cost model, risks, and operational ownership.", "Write the reviewer walkthrough from deploy through incident recovery."),
    ],
  },
  {
    id: "backend", label: "Backend Engineering", icon: "BE", title: "Production Order Service", role: "Backend engineer",
    scenario: "An order API must survive duplicate requests, partial payment failures, concurrent updates, and traffic spikes without corrupting state.",
    outcome: "Build and defend an API service with explicit contracts, durable transactions, authorization, tests, and production diagnostics.",
    skills: ["API contracts", "Transactions", "Authorization", "Concurrency", "Observability"],
    artifacts: ["OpenAPI contract", "Domain model", "Service implementation", "Test suite", "Incident runbook"],
    milestones: [
      milestone("brief", "Define the service contract", "A reviewed contract covering actors, API operations, invariants, failure semantics, and service objectives.", "Document two normal flows, three failure cases, protected resources, and measurable success criteria."),
      milestone("design", "Model consistency boundaries", "A domain model, transaction boundaries, idempotency strategy, authorization map, and rejected alternative.", "Explain exactly how duplicate, concurrent, unauthorized, and partially completed requests resolve."),
      milestone("build", "Implement the order slice", "Create, read, update, and cancel behavior with structured errors, authorization, and audit context.", "Record the endpoints, invariants, storage transitions, and representative responses implemented."),
      milestone("verify", "Test under pressure", "Contract, integration, authorization, concurrency, and failure-injection evidence with observed results.", "Summarize the highest-risk test, its observed result, and the service property that result proves."),
      milestone("present", "Prepare production handoff", "An API guide, deployment assumptions, diagnostic dashboards, alerts, and an actionable operator runbook.", "Explain how a reviewer can validate correctness, reproduce a failure, and diagnose one production incident."),
    ],
  },
  {
    id: "frontend", label: "Frontend Web Development", icon: "FE", title: "Accessible Learning Dashboard", role: "Frontend engineer",
    scenario: "Learners need a fast dashboard that works with keyboard, screen reader, touch, slow networks, and interrupted sessions.",
    outcome: "Deliver a responsive interface with durable state, accessible interaction, error recovery, tests, and performance evidence.",
    skills: ["Semantic UI", "Responsive design", "State management", "Accessibility", "Web performance"],
    artifacts: ["User-flow map", "Component contract", "Responsive implementation", "Accessibility report", "Performance budget"],
    milestones: [
      milestone("brief", "Define learner journeys", "Primary tasks, user states, accessibility needs, and measurable experience targets.", "Describe first-time, returning, empty, loading, error, and success states."),
      milestone("design", "Design the interaction system", "Information architecture, component boundaries, focus order, and responsive behavior.", "Explain keyboard, screen-reader, touch, and narrow-screen decisions."),
      milestone("build", "Implement the dashboard slice", "A responsive flow for discovering, resuming, and reviewing learning.", "Record the components, state transitions, and recovery behavior implemented."),
      milestone("verify", "Audit quality", "Keyboard, accessibility, responsive, error-state, and performance evidence.", "Report findings, fixes, remaining exceptions, and the measured performance budget."),
      milestone("present", "Publish the case study", "A concise case study connecting user needs, decisions, implementation, and measured outcomes.", "Write the reviewer path and explain the most important tradeoff."),
    ],
  },
  {
    id: "data", label: "Data Engineering", icon: "DE", title: "Governed Incremental Data Platform", role: "Data engineer",
    scenario: "Operations data arrives late, changes schema, and is replayed during incidents. Consumers need trustworthy daily and near-real-time products.",
    outcome: "Design a replay-safe platform with contracts, incremental processing, quality gates, lineage, cost controls, and recovery proof.",
    skills: ["Data contracts", "Incremental pipelines", "Data quality", "Lineage", "Platform reliability"],
    artifacts: ["Source contract", "Pipeline design", "Transformation models", "Quality report", "Replay runbook"],
    milestones: [
      milestone("brief", "Define the data product", "Consumers, grain, freshness, quality, ownership, and privacy requirements.", "Record the source realities, consumer promises, and reconciliation equation."),
      milestone("design", "Design batch and streaming paths", "Ingestion, storage, transformation, publication, lineage, and replay boundaries.", "Explain the incremental key, lateness policy, schema evolution, and rejected alternative."),
      milestone("build", "Implement the trusted slice", "Contracts, transformations, workflow, and publication artifacts for one product.", "List the static or executable artifacts and how each preserves evidence."),
      milestone("verify", "Run a data-trust incident", "Quality results, lineage trace, plan or cost evidence, and a bounded replay.", "Capture the incident timeline, root cause, affected consumers, and reconciliation after repair."),
      milestone("present", "Defend the platform", "An architecture brief, dataset guide, ownership map, and operator runbook.", "Explain how a reviewer can verify trust, cost, recovery, and consumer outcomes."),
    ],
  },
  {
    id: "security", label: "Cybersecurity Engineering", icon: "SE", title: "Trustworthy Multi-Service Platform", role: "Security engineer",
    scenario: "A fictional multi-tenant service has broad permissions, untrusted inputs, weak release provenance, and fragmented incident evidence.",
    outcome: "Produce a defensible architecture, tested positive and negative controls, detection evidence, and a bounded recovery plan.",
    skills: ["Threat modeling", "Identity and isolation", "Secure delivery", "Detection", "Incident response"],
    artifacts: ["Threat model", "Policy and infrastructure review", "Release evidence", "Detection cases", "Incident runbook"],
    milestones: [
      milestone("brief", "Map the trust boundary", "Assets, actors, abuse cases, legitimate journeys, and assumptions.", "Explain which request crosses which boundary and how harm could occur."),
      milestone("design", "Choose layered controls", "A control map with least privilege, isolation, data protection, and rejected alternatives.", "Connect each control to an abuse case and a known failure mode."),
      milestone("build", "Repair the static system", "Policy, infrastructure, and delivery artifacts with safe defaults.", "Show the artifact diffs and how each change preserves legitimate access."),
      milestone("verify", "Investigate and test", "Allowed, denied, and failure-path tests plus correlated synthetic evidence.", "Record expected versus observed results and residual uncertainty."),
      milestone("present", "Defend recovery", "A reviewer brief, detection ownership, containment timeline, and recovery runbook.", "Explain how the team can identify, contain, restore, and learn from an incident."),
    ],
  },
];

export function emptyPortfolioProject(): PortfolioProjectProgress {
  return { completedMilestones: [], evidence: {}, rubric: {}, updatedAt: 0 };
}

export function portfolioProjectProgress(progress: PlayerProgress, trackId: PortfolioTrackId) {
  return progress.portfolio.projects[trackId] ?? emptyPortfolioProject();
}

export function portfolioProjectScore(project: PortfolioProjectProgress) {
  const total = PORTFOLIO_RUBRIC_IDS.reduce((sum, id) => sum + (project.rubric[id] ?? 0), 0);
  return Math.round(total / (PORTFOLIO_RUBRIC_IDS.length * 3) * 100);
}

export function portfolioProjectComplete(project: PortfolioProjectProgress) {
  return PORTFOLIO_MILESTONE_IDS.every((id) => project.completedMilestones.includes(id))
    && PORTFOLIO_RUBRIC_IDS.every((id) => (project.rubric[id] ?? 0) >= 2);
}

export type PortfolioShowcase = {
  version: 1;
  learner: string;
  generatedAt: string;
  projects: Array<{ id: PortfolioTrackId; score: number; milestones: number; complete: boolean }>;
};

export function buildPortfolioShowcase(progress: PlayerProgress, learner: string): PortfolioShowcase {
  const projects = PORTFOLIO_PROJECTS.flatMap((definition) => {
    const project = portfolioProjectProgress(progress, definition.id);
    const started = project.completedMilestones.length > 0 || Object.values(project.evidence).some(Boolean) || Object.values(project.rubric).some((score) => score > 0);
    return started ? [{ id: definition.id, score: portfolioProjectScore(project), milestones: project.completedMilestones.length, complete: portfolioProjectComplete(project) }] : [];
  });
  return { version: 1, learner: learner.trim().slice(0, 80) || "CodeCraft learner", generatedAt: new Date().toISOString(), projects };
}

export function encodePortfolioShowcase(showcase: PortfolioShowcase) {
  const bytes = new TextEncoder().encode(JSON.stringify(showcase));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodePortfolioShowcase(token: string): PortfolioShowcase | null {
  if (!token || token.length > 12_000) return null;
  try {
    const base64 = token.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(token.length / 4) * 4, "=");
    const binary = globalThis.atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const value = JSON.parse(new TextDecoder().decode(bytes)) as Partial<PortfolioShowcase>;
    const validIds = new Set(PORTFOLIO_PROJECTS.map((project) => project.id));
    if (value.version !== 1 || typeof value.learner !== "string" || value.learner.length > 80 || typeof value.generatedAt !== "string" || !Array.isArray(value.projects)) return null;
    const projects = value.projects.filter((project): project is PortfolioShowcase["projects"][number] => Boolean(project && validIds.has(project.id) && Number.isInteger(project.score) && project.score >= 0 && project.score <= 100 && Number.isInteger(project.milestones) && project.milestones >= 0 && project.milestones <= 5 && typeof project.complete === "boolean")).slice(0, PORTFOLIO_PROJECTS.length);
    return { version: 1, learner: value.learner, generatedAt: value.generatedAt, projects };
  } catch {
    return null;
  }
}
