export type BackendPaceId = "beginner" | "intermediate" | "expert";
export type BackendWorld = { id: number; name: string; start: number; end: number; summary: string; focus: string };

export const BACKEND_PATH_TOTAL = 21;
export const BACKEND_TRACK = {
  id: "backend" as const,
  label: "Backend Engineering",
  icon: "BE",
  world: "Service Foundry",
  total: 63,
  title: "Backend Engineering & System Design",
};

export const BACKEND_PATHS = [
  { id: "beginner", label: "Beginner", title: "Backend Foundations", tagline: "Build a dependable service from request to data", description: "Learn HTTP, API contracts, relational data, identity, background work, testing, and the operating habits behind a production-ready service.", estimatedLevel: "NEW TO BACKENDS", recommendedFor: "Developers who can write basic code and want to build complete server-side applications." },
  { id: "intermediate", label: "Intermediate", title: "Reliable Services", tagline: "Design change-safe, observable distributed workflows", description: "Practice modular architecture, database performance, queues, idempotency, resilience, delivery, SLOs, and evidence-led incident response.", estimatedLevel: "BUILDING SERVICES", recommendedFor: "Developers who have built APIs and want stronger production engineering skills." },
  { id: "expert", label: "Expert", title: "System Architecture", tagline: "Reason about scale, boundaries, and failure", description: "Design distributed data, service platforms, multi-region systems, tenancy controls, evolutionary architecture, and architecture review programs.", estimatedLevel: "DESIGNING SYSTEMS", recommendedFor: "Senior engineers preparing to own large systems and architecture decisions." },
] as const satisfies ReadonlyArray<{ id: BackendPaceId; label: string; title: string; tagline: string; description: string; estimatedLevel: string; recommendedFor: string }>;

export const BACKEND_WORLDS_BY_PACE: Record<BackendPaceId, BackendWorld[]> = {
  beginner: [
    { id: 1, name: "Request Gateway", start: 1, end: 5, focus: "HTTP and API contracts", summary: "Turn incoming requests into predictable, validated application behavior." },
    { id: 2, name: "Persistence Vault", start: 6, end: 10, focus: "Relational data and change", summary: "Model durable data, protect consistency, and evolve schemas safely." },
    { id: 3, name: "Trust Boundary", start: 11, end: 15, focus: "Identity and application structure", summary: "Authenticate callers, authorize actions, and keep responsibilities explicit." },
    { id: 4, name: "Operations Harbor", start: 16, end: 21, focus: "Async work and operability", summary: "Add caching, queues, observability, tests, graceful shutdown, and recovery." },
  ],
  intermediate: [
    { id: 1, name: "Domain Forge", start: 1, end: 5, focus: "Modular service design", summary: "Shape business rules behind stable boundaries and evolvable contracts." },
    { id: 2, name: "Query Observatory", start: 6, end: 10, focus: "Data performance", summary: "Diagnose query cost, contention, pools, and cache correctness with evidence." },
    { id: 3, name: "Event Relay", start: 11, end: 15, focus: "Reliable asynchronous workflows", summary: "Make messages duplicate-safe and coordinate work across failure boundaries." },
    { id: 4, name: "Reliability Command", start: 16, end: 21, focus: "Production control", summary: "Protect capacity, release safely, measure user outcomes, and lead incidents." },
  ],
  expert: [
    { id: 1, name: "Distributed Data Core", start: 1, end: 5, focus: "Consistency and partitioning", summary: "Choose explicit consistency, replication, partitioning, and failover contracts." },
    { id: 2, name: "Service Meshworks", start: 6, end: 10, focus: "Service boundaries and routing", summary: "Design independently owned services without hiding coupling or failure." },
    { id: 3, name: "Global Control Plane", start: 11, end: 15, focus: "Scale, regions, and tenancy", summary: "Model capacity, backpressure, regional failure, privacy, and tenant isolation." },
    { id: 4, name: "Architecture Commons", start: 16, end: 21, focus: "Evolution and governance", summary: "Turn decisions, platform contracts, fitness functions, cost, and game days into an operating practice." },
  ],
};

export const isBackendPaceId = (value: string): value is BackendPaceId => value === "beginner" || value === "intermediate" || value === "expert";
export const getBackendPath = (paceId: BackendPaceId) => BACKEND_PATHS.find((path) => path.id === paceId) ?? BACKEND_PATHS[0];
export const getBackendWorlds = (paceId: BackendPaceId) => BACKEND_WORLDS_BY_PACE[paceId];
export const isBackendWorldProject = (paceId: BackendPaceId, lessonId: number) => getBackendWorlds(paceId).some((world) => world.end === lessonId);
export const backendProgressKey = (paceId: BackendPaceId) => "backend-" + paceId;
