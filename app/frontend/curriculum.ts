import { check, exactSet, field, type CloudLesson, type CloudPlan } from "../cloud/model";
import type { FrontendPaceId } from "./track";

type SourceKey = "mdn" | "html" | "css" | "javascript" | "a11y" | "performance" | "typescript" | "security" | "testing";
type TopicSpec = { title: string; goal: string; boundary: string; failure: string; metric: string; controls: [string, string, string]; source: SourceKey };
const SOURCES: Record<SourceKey, { label: string; url: string }> = {
  mdn: { label: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web" },
  html: { label: "MDN HTML guide", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content" },
  css: { label: "MDN CSS guide", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics" },
  javascript: { label: "MDN JavaScript guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
  a11y: { label: "W3C Web Accessibility Initiative", url: "https://www.w3.org/WAI/fundamentals/accessibility-intro/" },
  performance: { label: "web.dev performance guidance", url: "https://web.dev/performance" },
  typescript: { label: "TypeScript handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
  security: { label: "OWASP frontend security guidance", url: "https://cheatsheetseries.owasp.org/" },
  testing: { label: "Playwright documentation", url: "https://playwright.dev/docs/best-practices" },
};
const topic = (title: string, goal: string, boundary: string, failure: string, metric: string, controls: [string, string, string], source: SourceKey): TopicSpec => ({ title, goal, boundary, failure, metric, controls, source });

const BEGINNER: TopicSpec[] = [
  topic("How Browsers and URLs Work", "Trace navigation from a URL through DNS, HTTP, parsing, and rendering.", "address-network-browser", "a navigation failure is blamed on page code before the request path is checked", "successful_navigation_rate", ["valid-url", "response-status", "document-entry"], "mdn"),
  topic("HTTP Basics for Frontend Developers", "Use methods, status codes, headers, caching, and content types correctly from the browser.", "browser-http-server", "the UI treats every response as successful JSON", "classified_response_rate", ["status-check", "content-type-check", "cache-contract"], "mdn"),
  topic("HTML Document Structure", "Build a valid document with language, metadata, landmarks, and one meaningful heading hierarchy.", "document-outline", "visual containers replace document meaning", "valid_document_landmarks", ["document-language", "unique-main", "heading-order"], "html"),
  topic("Semantic HTML", "Choose native elements whose meaning and behavior match the content.", "content-semantic-element", "clickable divs hide roles and keyboard behavior", "native_element_coverage", ["native-control", "landmark-role", "meaningful-label"], "html"),
  topic("Links, Images, and Media", "Create navigable links and responsive media with useful alternatives and stable dimensions.", "content-resource-user", "missing alternatives and dimensions create inaccessible layout shifts", "media_accessibility_rate", ["descriptive-alt", "intrinsic-size", "safe-link"], "html"),
  topic("CSS Selectors and the Cascade", "Predict which declaration wins using origin, importance, specificity, and source order.", "stylesheet-element", "specificity escalates until components cannot be safely changed", "override_depth", ["low-specificity", "layer-order", "local-scope"], "css"),
  topic("Box Model and Spacing", "Reason about content, padding, border, margin, sizing, and overflow.", "component-box-container", "fixed dimensions clip content when text or zoom changes", "overflow_defects", ["border-box", "content-fit", "logical-spacing"], "css"),
  topic("Typography and Color", "Create readable type and color systems that preserve contrast and hierarchy.", "design-token-readable-text", "visual styling depends on color alone or unreadable line lengths", "readability_checks", ["contrast-token", "line-length", "type-scale"], "css"),
  topic("Flexbox Layouts", "Use one-dimensional alignment, growth, shrinkage, and wrapping deliberately.", "flex-container-items", "implicit shrink behavior crushes essential controls", "layout_overflow_rate", ["explicit-gap", "min-size", "wrap-policy"], "css"),
  topic("CSS Grid Layouts", "Model two-dimensional tracks, placement, and responsive repetition without source-order damage.", "grid-container-areas", "visual reordering breaks reading and focus order", "order_mismatch_count", ["semantic-order", "minmax-track", "responsive-repeat"], "css"),
  topic("Responsive Design", "Adapt content to available space using flexible media, queries, and resilient breakpoints.", "viewport-layout-content", "device-specific widths fail on zoom and intermediate sizes", "responsive_failure_count", ["fluid-width", "content-breakpoint", "responsive-media"], "css"),
  topic("Mobile-first Layouts", "Start with the essential narrow layout and enhance as space and capability grow.", "base-layout-enhancement", "desktop assumptions are patched with conflicting max-width rules", "mobile_task_success", ["small-default", "min-width-enhancement", "touch-target"], "css"),
  topic("Forms and Native Validation", "Associate labels, inputs, instructions, errors, and native constraints into a usable form.", "user-form-submit", "placeholder-only labels and hidden errors block completion", "valid_form_completion", ["explicit-label", "input-purpose", "error-summary"], "html"),
  topic("Basic Interaction Design", "Make actions discoverable, reversible where needed, and clear across pointer and keyboard input.", "intent-control-feedback", "an action changes state without confirmation or recovery", "interaction_success_rate", ["visible-affordance", "immediate-feedback", "undo-path"], "a11y"),
  topic("Accessibility Fundamentals", "Design for perceivable, operable, understandable, and robust use from the start.", "content-assistive-technology", "a mouse-only custom control excludes keyboard and screen-reader users", "accessible_task_rate", ["keyboard-path", "visible-focus", "accessible-name"], "a11y"),
  topic("JavaScript Values and Variables", "Choose types, declarations, equality, and conversions without hidden coercion.", "input-value-program", "implicit conversion turns missing data into plausible output", "invalid_state_count", ["const-default", "explicit-conversion", "null-check"], "javascript"),
  topic("Functions, Arrays, and Objects", "Transform data with focused functions and non-destructive collection operations.", "data-function-view", "shared mutation creates order-dependent UI bugs", "pure_transform_rate", ["single-purpose", "immutable-update", "explicit-return"], "javascript"),
  topic("DOM Selection and Events", "Connect events to stable elements while respecting propagation, defaults, and cleanup.", "event-target-handler", "duplicate listeners trigger one action multiple times", "duplicate_handler_count", ["stable-selector", "event-delegation", "listener-cleanup"], "javascript"),
  topic("State-driven Rendering", "Represent UI state explicitly and derive the visible interface from it.", "state-rendered-view", "manual DOM patches let visual state contradict application state", "state_view_mismatch", ["single-source", "derived-view", "atomic-update"], "javascript"),
  topic("Fetching Data and Handling States", "Fetch remote data with explicit loading, success, empty, error, and cancellation behavior.", "view-network-resource", "a late response overwrites newer screen state", "stale_response_count", ["response-check", "abort-stale", "state-model"], "javascript"),
  topic("Accessible Responsive Dashboard Capstone", "Assemble a semantic, responsive, data-driven dashboard that survives slow and failed requests.", "browser-dashboard-api", "the happy path works while keyboard, empty, and error states fail", "complete_dashboard_journeys", ["semantic-layout", "resilient-fetch", "accessible-interaction"], "a11y"),
];

const INTERMEDIATE: TopicSpec[] = [
  topic("Modules and Imports", "Define explicit module boundaries and avoid circular, side-effect-heavy dependency graphs.", "module-public-interface", "an import runs hidden setup and creates order-dependent behavior", "module_boundary_violations", ["named-export", "acyclic-dependency", "isolated-side-effect"], "javascript"),
  topic("npm and Package Hygiene", "Treat dependencies, scripts, lockfiles, and update policy as part of the product contract.", "application-package-registry", "an unreviewed update changes runtime code or build output", "dependency_risk_count", ["locked-install", "minimal-dependency", "update-review"], "mdn"),
  topic("TypeScript Fundamentals", "Model values with narrowing, unions, generics, and strict compiler feedback.", "external-data-typed-domain", "a type assertion hides unchecked runtime input", "unsafe_assertion_count", ["strict-mode", "runtime-parse", "discriminated-union"], "typescript"),
  topic("Async JavaScript and Promises", "Coordinate asynchronous work with clear sequencing, cancellation, and error ownership.", "user-intent-async-task", "floating promises turn failures into unhandled background behavior", "unhandled_rejection_count", ["await-owned", "abort-signal", "error-boundary"], "javascript"),
  topic("Browser Storage and Serialization", "Choose storage by lifetime and sensitivity, version data, and recover from corruption.", "application-browser-storage", "stale serialized state crashes a new application version", "storage_recovery_rate", ["versioned-schema", "safe-parse", "non-sensitive-only"], "mdn"),
  topic("Component Design", "Create components with narrow responsibilities, explicit inputs, and predictable composition.", "component-api-consumer", "boolean prop combinations create impossible visual states", "component_variant_count", ["focused-contract", "composition-slot", "state-enum"], "mdn"),
  topic("Design Tokens and CSS Architecture", "Separate shared design decisions from component implementation and theme output.", "design-token-component", "raw values drift across features and themes", "token_adoption_rate", ["semantic-token", "layered-style", "component-scope"], "css"),
  topic("Routing and Navigation", "Map URLs to views while preserving history, deep links, focus, and not-found behavior.", "url-router-view", "client navigation changes content without focus or title updates", "deep_link_success", ["canonical-route", "history-contract", "focus-restore"], "mdn"),
  topic("Forms with Server-backed Validation", "Combine immediate client guidance with authoritative server validation and replay-safe submission.", "form-client-server", "client validation is mistaken for authorization or data integrity", "valid_submission_rate", ["client-guidance", "server-authority", "field-error-map"], "html"),
  topic("Data Fetching, Caching, and Retries", "Define cache keys, freshness, deduplication, cancellation, and safe retry policy.", "view-cache-api", "automatic retries duplicate a non-idempotent action", "stale_or_duplicate_rate", ["complete-cache-key", "freshness-policy", "safe-retry"], "mdn"),
  topic("Unit Testing UI Logic", "Test deterministic state and transformation logic through observable outcomes.", "input-logic-output", "tests mirror implementation details and block harmless refactors", "behavior_test_ratio", ["public-behavior", "edge-case", "deterministic-fixture"], "testing"),
  topic("Component Testing", "Verify a component through roles, names, interactions, and visible state transitions.", "user-component-boundary", "tests query class names and miss broken accessible behavior", "accessible_query_rate", ["role-query", "user-event", "visible-outcome"], "testing"),
  topic("End-to-end Testing", "Protect a small set of critical journeys with isolated data and resilient locators.", "browser-product-system", "a large brittle suite produces noise instead of release confidence", "e2e_signal_rate", ["critical-journey", "test-isolation", "user-locator"], "testing"),
  topic("Accessibility Testing", "Combine automated checks, keyboard review, screen-reader reasoning, and human judgment.", "interface-accessibility-review", "a zero-violation scan is treated as proof of usability", "manual_a11y_coverage", ["automated-scan", "keyboard-review", "name-role-value"], "a11y"),
  topic("Visual Regression Testing", "Use stable screenshots for high-value visual contracts without masking functional failures.", "render-baseline-diff", "uncontrolled fonts and data create meaningless pixel changes", "actionable_visual_diffs", ["stable-fixture", "targeted-snapshot", "review-threshold"], "testing"),
  topic("Web APIs and Browser Capabilities", "Use capability detection, permission-aware fallbacks, and lifecycle-safe browser APIs.", "browser-capability-feature", "user-agent checks assume features that are missing or restricted", "fallback_success_rate", ["feature-detect", "permission-state", "fallback-path"], "mdn"),
  topic("Loading, Empty, and Failure States", "Design every meaningful state as part of the product rather than as an afterthought.", "request-ui-state", "an empty result is rendered as an infinite loading spinner", "state_completeness", ["explicit-state", "recovery-action", "preserved-context"], "a11y"),
  topic("Animation and Motion Preferences", "Use motion to explain change while respecting reduced-motion and interruption.", "state-transition-user", "essential meaning exists only in animation that some users disable", "reduced_motion_coverage", ["purposeful-motion", "reduced-motion", "interruptible"], "css"),
  topic("Performance Measurement and Core Web Vitals", "Measure real loading, responsiveness, and stability before choosing an optimization.", "user-device-page", "lab speed on a fast laptop hides slow field experiences", "web_vitals_pass_rate", ["field-data", "performance-mark", "interaction-trace"], "performance"),
  topic("Code Splitting and Asset Optimization", "Load the smallest useful resources with stable caching and no critical-path regressions.", "route-bundle-browser", "over-splitting creates request waterfalls and duplicate modules", "route_transfer_bytes", ["route-boundary", "hashed-asset", "budget-check"], "performance"),
  topic("Multi-page Product Application Capstone", "Ship a typed, routed, tested product flow with resilient data and measured performance.", "browser-product-api", "individually sound components fail across navigation and recovery", "successful_product_journeys", ["typed-contract", "layered-tests", "performance-budget"], "testing"),
];

const EXPERT: TopicSpec[] = [
  topic("Rendering Pipeline and Layout", "Explain style, layout, paint, compositing, and invalidation costs before changing code.", "dom-style-render-pipeline", "layout reads and writes alternate inside a hot loop", "long_render_frame_count", ["batched-mutation", "contained-layout", "compositor-safe"], "performance"),
  topic("Event Loop and Scheduling", "Schedule user-visible, background, and idle work without starving input or rendering.", "task-queue-render", "one long task blocks input and delays the next paint", "interaction_latency_ms", ["yield-long-task", "priority-work", "abort-obsolete"], "javascript"),
  topic("Memory, Leaks, and Cleanup", "Use heap and lifecycle evidence to remove retained listeners, timers, nodes, and caches.", "component-lifecycle-memory", "detached DOM remains reachable after repeated navigation", "retained_heap_bytes", ["listener-cleanup", "bounded-cache", "heap-comparison"], "performance"),
  topic("Advanced TypeScript API Design", "Design inference-friendly public types that prevent invalid states without exposing internals.", "library-type-consumer", "a generic API accepts contradictory options and returns broad unknown shapes", "consumer_type_errors", ["discriminated-contract", "generic-constraint", "exhaustive-check"], "typescript"),
  topic("Framework Trade-offs and Boundaries", "Choose rendering and state tools from product constraints rather than fashion.", "framework-platform-product", "framework features leak across every domain boundary", "framework_coupling_score", ["decision-record", "platform-adapter", "exit-boundary"], "mdn"),
  topic("Component API Architecture", "Govern component ownership, variants, slots, state, and deprecation across teams.", "design-system-product", "one universal component accumulates incompatible responsibilities", "breaking_component_changes", ["composable-api", "deprecation-path", "contract-test"], "a11y"),
  topic("Theming and Token Governance", "Evolve semantic tokens across brands, modes, products, and versions with measurable compatibility.", "brand-token-component", "theme overrides bypass semantics and break contrast", "theme_contract_failures", ["semantic-layer", "contrast-check", "versioned-token"], "css"),
  topic("Advanced CSS Composition", "Use cascade layers, scopes, queries, and logical properties as explicit composition tools.", "global-layer-component", "unowned global rules silently override local components", "cross_component_override_count", ["cascade-layer", "container-query", "logical-property"], "css"),
  topic("Internationalization and Localization", "Design text, layout, dates, numbers, direction, and message structure for locale change.", "locale-message-layout", "concatenated strings cannot be translated or reordered correctly", "locale_render_failures", ["message-template", "locale-format", "direction-aware"], "mdn"),
  topic("Accessibility Architecture and Keyboard UX", "Define focus, names, roles, announcements, and interaction patterns across a product.", "interaction-pattern-assistive-tech", "each team invents incompatible focus and keyboard behavior", "keyboard_journey_success", ["pattern-contract", "focus-strategy", "assistive-test"], "a11y"),
  topic("Performance Budgets", "Convert user goals into enforceable budgets for loading, responsiveness, stability, and assets.", "experience-budget-pipeline", "performance is reviewed only after release", "budget_regression_count", ["route-budget", "field-threshold", "ci-check"], "performance"),
  topic("Critical Rendering Path", "Prioritize document, styles, fonts, images, and scripts needed for the first useful view.", "network-parser-render", "render-blocking resources delay useful content without adding first-view value", "largest_contentful_paint", ["critical-css", "defer-script", "preload-evidence"], "performance"),
  topic("Caching and Service Workers", "Version shell and data caches with explicit update, invalidation, and failure behavior.", "browser-service-worker-origin", "a stale service worker traps users on incompatible assets", "cache_version_mismatch", ["versioned-cache", "activate-cleanup", "network-fallback"], "mdn"),
  topic("Offline-first Behavior", "Model offline reads, queued writes, conflict resolution, and honest connectivity states.", "local-state-sync-server", "the UI claims success before a queued mutation is durably recorded", "sync_conflict_rate", ["durable-outbox", "conflict-policy", "sync-status"], "mdn"),
  topic("Streaming and Progressive Rendering", "Stream useful boundaries while preserving order, focus, errors, and hydration correctness.", "server-stream-browser", "late content shifts focus or hydrates against different data", "stream_recovery_rate", ["stable-shell", "error-boundary", "hydration-contract"], "performance"),
  topic("XSS and Safe DOM Updates", "Treat all external strings as data and use context-appropriate output handling.", "untrusted-input-dom", "HTML strings cross into an executable DOM sink", "unsafe_dom_sink_count", ["text-sink", "sanitizer-policy", "trusted-types"], "security"),
  topic("Content Security Policy", "Use CSP as defense in depth with nonces, reporting, and a staged rollout.", "document-browser-policy", "unsafe-inline turns policy into documentation instead of protection", "csp_violation_rate", ["nonce-script", "report-only-first", "strict-source"], "security"),
  topic("Authentication and Session Boundaries", "Keep tokens, cookies, redirects, and authorization responsibilities at explicit trust boundaries.", "browser-session-api", "a token in durable script-readable storage expands XSS impact", "session_exposure_count", ["secure-cookie", "csrf-defense", "server-authorization"], "security"),
  topic("Privacy-aware Analytics", "Collect the minimum useful event data with consent, retention, and identity boundaries.", "user-event-analytics", "raw content or stable identity is captured without necessity", "unnecessary_field_count", ["data-minimization", "consent-state", "retention-limit"], "security"),
  topic("CI/CD, Preview, and Rollback", "Promote immutable frontend artifacts through checks, previews, staged release, and fast rollback.", "commit-artifact-edge", "the build is repeated per environment and rollback cannot reproduce prior assets", "rollback_time_minutes", ["immutable-build", "preview-gate", "atomic-rollback"], "testing"),
  topic("Production-grade Offline App Capstone", "Design, secure, test, ship, observe, and recover an offline-capable application across multiple release stages.", "user-browser-edge-api", "partial updates break cached clients and hide sync conflicts", "resilient_user_journeys", ["versioned-contract", "security-policy", "rollback-drill"], "performance"),
];

function buildLesson(spec: TopicSpec, id: number, paceId: FrontendPaceId): CloudLesson {
  const latencyBudget = 100 + ((id + (paceId === "expert" ? 2 : paceId === "intermediate" ? 1 : 0)) % 5) * 100;
  const retryLimit = spec.title.includes("Fetching") || spec.title.includes("Caching") || spec.title.includes("Offline") ? 2 : 1;
  const solution: CloudPlan = { boundary: spec.boundary, failure_mode: spec.failure, timeout_ms: latencyBudget, retry_limit: retryLimit, idempotent: true, safeguards: [...spec.controls] };
  const starter: CloudPlan = { boundary: "implicit", failure_mode: "happy-path-only", timeout_ms: 5000, retry_limit: 6, idempotent: false, safeguards: [spec.controls[0]] };
  const level = paceId === "expert" ? "architecture" : paceId === "intermediate" ? "product" : "foundation";
  return {
    id, title: spec.title, minutes: id % 5 === 0 || id === 21 ? 32 : paceId === "expert" ? 24 : paceId === "intermediate" ? 21 : 18,
    objective: spec.goal,
    story: `The ${spec.boundary} interface is reporting ${spec.metric}, but its failure behavior is still implicit. Make the user contract measurable before Byte restores the ${level} relay.`,
    concepts: [
      { title: "Model the user contract", body: `${spec.goal} Treat ${spec.boundary} as an observable boundary with clear inputs, outputs, states, and ownership—not only a visual implementation.` },
      { title: "Design the failure state", body: `Plan for this realistic failure: ${spec.failure}. Apply ${spec.controls.join(", ")} as independent protections so the interface remains understandable and recoverable.` },
      { title: "Verify the experience", body: `Measure ${spec.metric} across keyboard, narrow viewport, slow network, and recovery scenarios. A green build alone does not prove the user journey works.` },
    ],
    example: JSON.stringify(solution, null, 2),
    exampleNote: `This rendering contract gives ${spec.boundary} a ${latencyBudget} ms interaction budget, at most ${retryLimit} safe ${retryLimit === 1 ? "retry" : "retries"}, repeat-safe behavior, and three topic-specific controls.`,
    mistake: `Do not hide “${spec.failure}” behind a generic fallback. If the interface does not model the failure, users lose context while tests exercise only the happy path.`,
    mission: `Repair the ${spec.boundary} experience, investigate ${spec.metric} evidence, and statically review a realistic frontend artifact.`,
    fields: [
      field("boundary", "string", `Exact browser or UI boundary: ${spec.boundary}.`),
      field("failure_mode", "string", `The user-visible failure to handle: ${spec.failure}.`),
      field("timeout_ms", "number", `A ${latencyBudget} ms budget for the simulated interaction or transition.`),
      field("retry_limit", "number", `At most ${retryLimit} safe retries; user actions are never blindly replayed.`),
      field("idempotent", "boolean", "Whether repeated rendering or delivery preserves the same user outcome."),
      field("safeguards", "strings", `The three required interface controls: ${spec.controls.join(", ")}.`),
    ],
    starter, solution,
    checks: [
      check("Boundary is explicit", `Set boundary to ${spec.boundary}.`, (plan) => plan.boundary === spec.boundary),
      check("Failure state is modeled", `Use the exact scenario: ${spec.failure}.`, (plan) => plan.failure_mode === spec.failure),
      check("Interaction budget is bounded", `Use ${latencyBudget} ms and no more than ${retryLimit} retries.`, (plan) => plan.timeout_ms === latencyBudget && typeof plan.retry_limit === "number" && plan.retry_limit >= 0 && plan.retry_limit <= retryLimit),
      check("Repeated behavior is safe", "Enable repeat-safe rendering and delivery.", (plan) => plan.idempotent === true),
      check("Controls match the lesson", `Use exactly ${spec.controls.join(", ")}.`, (plan) => exactSet(plan.safeguards, spec.controls)),
    ],
    observations: (plan) => [
      `Boundary: ${String(plan.boundary)} · expected ${spec.boundary}.`, `Failure model: ${String(plan.failure_mode)}.`,
      `Interaction budget and retries: ${String(plan.timeout_ms)} ms / ${String(plan.retry_limit)}.`, `Primary signal: ${spec.metric}; repeat-safe=${String(plan.idempotent)}.`,
      `Controls: ${Array.isArray(plan.safeguards) ? plan.safeguards.join(" → ") : "not configured"}.`,
    ],
    source: SOURCES[spec.source],
  };
}

export const FRONTEND_CURRICULA: Record<FrontendPaceId, CloudLesson[]> = {
  beginner: BEGINNER.map((spec, index) => buildLesson(spec, index + 1, "beginner")),
  intermediate: INTERMEDIATE.map((spec, index) => buildLesson(spec, index + 1, "intermediate")),
  expert: EXPERT.map((spec, index) => buildLesson(spec, index + 1, "expert")),
};
export const getFrontendLessons = (paceId: FrontendPaceId) => FRONTEND_CURRICULA[paceId];
export const getFrontendLesson = (paceId: FrontendPaceId, id: number) => getFrontendLessons(paceId).find((lesson) => lesson.id === id);
