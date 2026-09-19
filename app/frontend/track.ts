export type FrontendPaceId = "beginner" | "intermediate" | "expert";
export type FrontendWorld = { id: number; name: string; start: number; end: number; summary: string; focus: string };

export const FRONTEND_PATH_TOTAL = 21;
export const FRONTEND_TRACK = {
  id: "frontend" as const,
  label: "Frontend Web Development",
  icon: "FE",
  world: "Interface Nexus",
  total: 63,
  title: "Frontend Web Development",
};

export const FRONTEND_PATHS = [
  { id: "beginner", label: "Beginner", title: "Web Foundations", tagline: "Build accessible interfaces from browser primitives", description: "Learn how the web works, structure pages with semantic HTML, create responsive layouts, add JavaScript behavior, and handle real loading and error states.", estimatedLevel: "NEW TO THE WEB", recommendedFor: "Learners who know basic computer use and want to build complete, accessible browser experiences." },
  { id: "intermediate", label: "Intermediate", title: "Product Interfaces", tagline: "Ship typed, tested, maintainable web applications", description: "Practice modules, TypeScript, components, routing, forms, data flows, test strategy, animation, browser APIs, and performance optimization.", estimatedLevel: "BUILDING UIs", recommendedFor: "Developers who can build a page and want production-ready application engineering habits." },
  { id: "expert", label: "Expert", title: "Frontend Architecture", tagline: "Design secure, fast, resilient interface platforms", description: "Reason about rendering internals, memory, API architecture, accessibility systems, offline behavior, security, privacy, streaming, delivery, and rollback.", estimatedLevel: "DESIGNING PLATFORMS", recommendedFor: "Senior frontend engineers preparing to own architecture, reliability, and cross-team standards." },
] as const satisfies ReadonlyArray<{ id: FrontendPaceId; label: string; title: string; tagline: string; description: string; estimatedLevel: string; recommendedFor: string }>;

export const FRONTEND_WORLDS_BY_PACE: Record<FrontendPaceId, FrontendWorld[]> = {
  beginner: [
    { id: 1, name: "Browser Gateway", start: 1, end: 5, focus: "Web, HTTP, and semantic HTML", summary: "Understand the browser request path and build meaningful document structure." },
    { id: 2, name: "Layout Workshop", start: 6, end: 10, focus: "CSS foundations and layout", summary: "Control cascade, spacing, typography, Flexbox, and Grid without fragile overrides." },
    { id: 3, name: "Inclusive Interface", start: 11, end: 15, focus: "Responsive forms and accessibility", summary: "Design mobile-first forms and interactions that work across inputs and abilities." },
    { id: 4, name: "Interaction Relay", start: 16, end: 21, focus: "JavaScript, DOM, state, and data", summary: "Turn a static document into a resilient data-driven interface." },
  ],
  intermediate: [
    { id: 1, name: "Typed Module Forge", start: 1, end: 5, focus: "Modules, packages, types, and storage", summary: "Build dependable language and package boundaries for growing applications." },
    { id: 2, name: "Component District", start: 6, end: 10, focus: "Components, tokens, routing, forms, and data", summary: "Compose maintainable product flows from explicit UI contracts." },
    { id: 3, name: "Quality Observatory", start: 11, end: 15, focus: "Unit, component, E2E, accessibility, and visual tests", summary: "Choose the right testing layer and diagnose failures with trustworthy evidence." },
    { id: 4, name: "Experience Launchpad", start: 16, end: 21, focus: "Browser APIs, UX states, motion, and performance", summary: "Use platform capabilities responsibly and ship a fast multi-page product experience." },
  ],
  expert: [
    { id: 1, name: "Rendering Engine", start: 1, end: 5, focus: "Browser internals, scheduling, memory, and type APIs", summary: "Model the runtime costs and boundaries beneath modern frameworks." },
    { id: 2, name: "Interface Platform", start: 6, end: 10, focus: "Component architecture, theming, CSS, i18n, and accessibility", summary: "Create shared interface contracts that scale across products and teams." },
    { id: 3, name: "Delivery Accelerator", start: 11, end: 15, focus: "Performance, caching, offline, and streaming", summary: "Protect user experience under slow networks, stale assets, and partial responses." },
    { id: 4, name: "Trust Control Plane", start: 16, end: 21, focus: "Security, privacy, sessions, delivery, and recovery", summary: "Ship a secure, measurable, offline-capable application with a safe rollback path." },
  ],
};

export const isFrontendPaceId = (value: string): value is FrontendPaceId => value === "beginner" || value === "intermediate" || value === "expert";
export const getFrontendPath = (paceId: FrontendPaceId) => FRONTEND_PATHS.find((path) => path.id === paceId) ?? FRONTEND_PATHS[0];
export const getFrontendWorlds = (paceId: FrontendPaceId) => FRONTEND_WORLDS_BY_PACE[paceId];
export const isFrontendWorldProject = (paceId: FrontendPaceId, lessonId: number) => getFrontendWorlds(paceId).some((world) => world.end === lessonId);
export const frontendProgressKey = (paceId: FrontendPaceId) => "frontend-" + paceId;
