export type CloudPaceId = "beginner" | "intermediate" | "expert";
export type CloudWorld = { id: number; name: string; start: number; end: number; summary: string; focus: string };

export const CLOUD_PATH_TOTAL = 21;
export const CLOUD_TRACK = {
  id: "cloud" as const,
  label: "Cloud Engineering",
  icon: "CL",
  world: "Cloud Citadel",
  total: 63,
  title: "Cloud Engineering",
};

export const CLOUD_PATHS = [
  { id: "beginner", label: "Beginner", title: "Cloud Foundations", tagline: "Build and protect your first service", description: "Learn compute, storage, networking, identity, containers, monitoring, async work, cost controls, and tested recovery.", estimatedLevel: "NEW TO CLOUD", recommendedFor: "Developers who have never deployed or operated an application." },
  { id: "intermediate", label: "Intermediate", title: "Cloud Delivery", tagline: "Automate repeatable, reliable delivery", description: "Practice infrastructure as code, CI/CD, Kubernetes, SLOs, GitOps, demand scaling, service trust, and game days.", estimatedLevel: "SOME EXPERIENCE", recommendedFor: "Developers who understand basic cloud services and want production delivery skills." },
  { id: "expert", label: "Expert", title: "Cloud Platforms", tagline: "Design secure, resilient platforms", description: "Model governed foundations, zero trust, supply-chain security, regional capacity, multi-tenancy, platform APIs, and product operations.", estimatedLevel: "PRODUCTION READY", recommendedFor: "Engineers designing shared platforms or operating critical cloud services." },
] as const satisfies ReadonlyArray<{ id: CloudPaceId; label: string; title: string; tagline: string; description: string; estimatedLevel: string; recommendedFor: string }>;

export const CLOUD_WORLDS_BY_PACE: Record<CloudPaceId, CloudWorld[]> = {
  beginner: [
    { id: 1, name: "Foundation Spire", start: 1, end: 5, focus: "Compute and storage", summary: "Choose compute, place resources, and protect stored data." },
    { id: 2, name: "Network Bastion", start: 6, end: 10, focus: "Networking and security", summary: "Connect services with secure routes, identities, and secrets." },
    { id: 3, name: "Operations Summit", start: 11, end: 15, focus: "Deployment and operations", summary: "Release a Python API, diagnose failures, and stay within budget." },
    { id: 4, name: "Service Harbor", start: 16, end: 21, focus: "Data, cost, and recovery", summary: "Add edge delivery, queued work, managed data, cost ownership, and tested recovery." },
  ],
  intermediate: [
    { id: 1, name: "Infrastructure Forge", start: 1, end: 5, focus: "Infrastructure as code", summary: "Model repeatable environments with protected state, modules, and reviewed plans." },
    { id: 2, name: "Delivery Foundry", start: 6, end: 10, focus: "CI/CD and Kubernetes", summary: "Promote trusted artifacts through an automated pipeline and run resilient containers." },
    { id: 3, name: "Reliability Observatory", start: 11, end: 15, focus: "SRE and recovery", summary: "Define service targets, alert on user impact, and prove that recovery works." },
    { id: 4, name: "Production Control", start: 16, end: 21, focus: "Reconciliation and runtime trust", summary: "Control drift, reconcile releases, scale on demand, verify service calls, and exercise incidents." },
  ],
  expert: [
    { id: 1, name: "Platform Nexus", start: 1, end: 5, focus: "Cloud foundations at scale", summary: "Design account boundaries, shared networks, private access, and enforceable guardrails." },
    { id: 2, name: "Zero Trust Vault", start: 6, end: 10, focus: "Identity and supply chain", summary: "Replace persistent trust with verified identity, protected keys, evidence, and provenance." },
    { id: 3, name: "Resilience Command", start: 11, end: 15, focus: "Architecture and SRE leadership", summary: "Plan regional recovery, safe experiments, incident command, unit economics, and a paved platform." },
    { id: 4, name: "Platform Commons", start: 16, end: 21, focus: "Multi-tenant platform product", summary: "Govern tenants and data, reserve regional capacity, publish stable APIs, and measure platform outcomes." },
  ],
};

export const CLOUD_WORLDS = CLOUD_WORLDS_BY_PACE.beginner;
export const isCloudPaceId = (value: string): value is CloudPaceId => value === "beginner" || value === "intermediate" || value === "expert";
export const getCloudPath = (paceId: CloudPaceId) => CLOUD_PATHS.find((path) => path.id === paceId) ?? CLOUD_PATHS[0];
export const getCloudWorlds = (paceId: CloudPaceId) => CLOUD_WORLDS_BY_PACE[paceId];
export const isCloudWorldProject = (paceId: CloudPaceId, lessonId: number) => getCloudWorlds(paceId).some((world) => world.end === lessonId);
export const cloudProgressKey = (paceId: CloudPaceId) => "cloud-" + paceId;
