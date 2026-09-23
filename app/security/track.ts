export type SecurityPaceId = "beginner" | "intermediate" | "expert";
export type SecurityWorld = { id: number; name: string; start: number; end: number; focus: string; summary: string };

export const SECURITY_PATH_TOTAL = 21;
export const SECURITY_TRACK = { id: "security" as const, label: "Cybersecurity Engineering", icon: "SE", world: "Trust Citadel", total: 63, title: "Cybersecurity Engineering" };

export const SECURITY_PATHS = [
  { id: "beginner", label: "Beginner", title: "Security Foundations", tagline: "Protect a small web application", description: "Learn trust boundaries, identity, safe data handling, detection, and incident response through a fictional service.", estimatedLevel: "NEW TO SECURITY", recommendedFor: "Developers who want to understand how common security failures happen and how to verify a fix." },
  { id: "intermediate", label: "Intermediate", title: "Secure Delivery", tagline: "Build security into services and releases", description: "Threat-model product features, harden cloud and CI/CD artifacts, triage findings, and investigate production evidence.", estimatedLevel: "BUILDING SYSTEMS", recommendedFor: "Developers who ship APIs or cloud services and want dependable security practices." },
  { id: "expert", label: "Expert", title: "Security Architecture", tagline: "Design, detect, and lead recovery", description: "Review multi-tenant systems, federated identity, supply chains, AI boundaries, detection rules, and coordinated recovery.", estimatedLevel: "OWNING SYSTEMS", recommendedFor: "Engineers responsible for cross-service security architecture and incident decisions." },
] as const satisfies ReadonlyArray<{ id: SecurityPaceId; label: string; title: string; tagline: string; description: string; estimatedLevel: string; recommendedFor: string }>;

export const SECURITY_WORLDS_BY_PACE: Record<SecurityPaceId, SecurityWorld[]> = {
  beginner: [
    { id: 1, name: "Trust Map", start: 1, end: 5, focus: "Assets, requests, and boundaries", summary: "Follow a request and locate what must be protected and where trust changes." },
    { id: 2, name: "Identity Gate", start: 6, end: 10, focus: "Sessions and safe web behavior", summary: "Verify callers, authorize actions, and keep untrusted input out of executable contexts." },
    { id: 3, name: "Data Vault", start: 11, end: 15, focus: "Queries, secrets, and ownership", summary: "Protect records and credentials while preserving legitimate access." },
    { id: 4, name: "Response Harbor", start: 16, end: 21, focus: "Detection and recovery", summary: "Read evidence, contain a simulated incident, and explain the repair." },
  ],
  intermediate: [
    { id: 1, name: "Threat Workshop", start: 1, end: 5, focus: "Feature threat modeling", summary: "Find abuse paths and choose controls from product context." },
    { id: 2, name: "Cloud Shield", start: 6, end: 10, focus: "IAM and infrastructure", summary: "Review service identities, private data paths, workloads, and change plans." },
    { id: 3, name: "Trusted Pipeline", start: 11, end: 15, focus: "Dependencies and releases", summary: "Prove what is built, who can deploy it, and how a bad release is stopped." },
    { id: 4, name: "Incident Observatory", start: 16, end: 21, focus: "Investigation and response", summary: "Correlate evidence, bound the impact, and make a tested recovery plan." },
  ],
  expert: [
    { id: 1, name: "Architecture Council", start: 1, end: 5, focus: "Systemic risk and isolation", summary: "Review cross-service trust and tenant boundaries with explicit assumptions." },
    { id: 2, name: "Identity and Supply Chain", start: 6, end: 10, focus: "Federation, keys, builds, and AI", summary: "Control identity and artifact provenance across complex systems." },
    { id: 3, name: "Detection Studio", start: 11, end: 15, focus: "Signals and automated response", summary: "Design useful detections and tune them against normal behavior." },
    { id: 4, name: "Resilience Command", start: 16, end: 21, focus: "Governance and recovery", summary: "Prioritize fixes, run a contained exercise, and defend a platform recovery plan." },
  ],
};

export const isSecurityPaceId = (value: string): value is SecurityPaceId => value === "beginner" || value === "intermediate" || value === "expert";
export const getSecurityPath = (paceId: SecurityPaceId) => SECURITY_PATHS.find((path) => path.id === paceId) ?? SECURITY_PATHS[0];
export const getSecurityWorlds = (paceId: SecurityPaceId) => SECURITY_WORLDS_BY_PACE[paceId];
export const isSecurityWorldProject = (paceId: SecurityPaceId, lessonId: number) => getSecurityWorlds(paceId).some((world) => world.end === lessonId);
export const securityProgressKey = (paceId: SecurityPaceId) => "security-" + paceId;
