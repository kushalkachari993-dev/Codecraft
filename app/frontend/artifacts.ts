import type { CloudArtifact, CloudArtifactCheck, CloudArtifactResult } from "../cloud/artifacts";
import type { CloudLesson } from "../cloud/model";
import type { FrontendPaceId } from "./track";

const MAX = 24_000;
const artifactCheck = (name: string, hint: string, test: (source: string) => boolean): CloudArtifactCheck => ({ name, hint, test });
const slug = (lesson: CloudLesson) => lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 36);

function htmlArtifact(lesson: CloudLesson, safe: boolean) {
  return `<main id="main-content">
  <section aria-labelledby="${slug(lesson)}-title">
    <h1 id="${slug(lesson)}-title">${lesson.title}</h1>
    <p id="lesson-status" ${safe ? 'role="status"' : ""}>Ready to practice.</p>
    <form ${safe ? 'aria-describedby="lesson-help"' : ""}>
      ${safe ? '<label for="lesson-input">Your response</label>' : '<span>Your response</span>'}
      <input id="lesson-input" name="response" required autocomplete="off" />
      <small id="lesson-help">Complete the field before continuing.</small>
      ${safe ? '<button type="submit">Continue</button>' : '<div class="button" onclick="submitLesson()">Continue</div>'}
    </form>
  </section>
</main>`;
}
function cssArtifact(lesson: CloudLesson, safe: boolean) {
  return `/* ${lesson.title}: responsive component review */
@layer reset, tokens, components;
@layer tokens {
  :root { --space: 1rem; --focus: #a8ff3e; --measure: 68ch; }
}
@layer components {
  .lesson-card { display: grid; gap: var(--space); max-inline-size: var(--measure); }
  .lesson-card__actions { display: flex; flex-wrap: wrap; gap: var(--space); }
  ${safe ? ".lesson-card :focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }" : ".lesson-card * { outline: none; }"}
  @container (min-width: 36rem) { .lesson-card { grid-template-columns: 2fr 1fr; } }
  ${safe ? "@media (prefers-reduced-motion: reduce) { .lesson-card * { animation-duration: 0.01ms; animation-iteration-count: 1; } }" : ".lesson-card { width: 980px; animation: pulse 1s infinite; }"}
}`;
}
function scriptArtifact(lesson: CloudLesson, safe: boolean) {
  return `// ${lesson.title}: typed interaction review
type ViewState =
  | { status: "idle" }
  | { status: "loading"; requestId: string }
  | { status: "success"; items: string[] }
  | { status: "error"; message: string };

let state: ViewState = { status: "idle" };
let controller: AbortController | null = null;

export async function loadItems(): Promise<void> {
  ${safe ? "controller?.abort();\n  controller = new AbortController();" : "controller = new AbortController();"}
  const requestId = crypto.randomUUID();
  state = { status: "loading", requestId };
  try {
    const response = await fetch("/api/items", { signal: controller.signal });
    ${safe ? 'if (!response.ok) throw new Error(`Request failed: ${response.status}`);' : "// response status intentionally unchecked"}
    const items: unknown = await response.json();
    ${safe ? 'if (!Array.isArray(items) || !items.every((item) => typeof item === "string")) throw new Error("Invalid response");' : "// external data intentionally trusted"}
    state = { status: "success", items: items as string[] };
  } catch (error) {
    ${safe ? 'if ((error as Error).name === "AbortError") return;\n    state = { status: "error", message: "Items could not be loaded. Try again." };' : "console.error(error);"}
  }
}`;
}
function policyArtifact(lesson: CloudLesson, safe: boolean) {
  return JSON.stringify({
    lesson: lesson.title,
    build: { immutable: safe, source_maps: safe ? "private" : "public", budgets: { initial_kb: safe ? 220 : 900, route_kb: safe ? 420 : 1200 } },
    quality: { unit: true, component: safe, e2e: safe, accessibility: safe },
    security: { csp: safe ? "script-src 'self' 'nonce-{RANDOM}'; object-src 'none'; base-uri 'none'" : "script-src * 'unsafe-inline' 'unsafe-eval'", trusted_types: safe },
    release: { preview: safe, canary_percent: safe ? 10 : 100, atomic_rollback: safe },
  }, null, 2);
}

export function getFrontendArtifact(paceId: FrontendPaceId, lesson: CloudLesson): CloudArtifact {
  const title = lesson.title;
  const kind = /Browsers and URLs|HTML|Semantic|Links|Media|Forms|Accessibility|Interaction Design|Internationalization/.test(title) ? 0
    : /CSS|Layout|Typography|Flexbox|Grid|Responsive|Mobile-first|Animation|Theming|Rendering Pipeline/.test(title) ? 1
      : /HTTP Basics|JavaScript|Functions|DOM|State-driven|Fetching|TypeScript|Async|Storage|Modules|Component Design|Web APIs|Offline|Streaming|Memory|Event Loop/.test(title) ? 2
        : 3;
  const variants = [
    { artifactKind: "iam" as const, label: "Semantic interface fragment", filename: "lesson.html", language: "HTML", starter: htmlArtifact(lesson, false), solution: htmlArtifact(lesson, true), checks: [
      artifactCheck("Document has one meaningful main region", "Keep a main element and label the lesson section from its heading.", (s) => /<main\b/i.test(s) && /<section\s+aria-labelledby=/i.test(s)),
      artifactCheck("Input has an explicit label", "Associate a label with lesson-input.", (s) => /<label\s+for=["']lesson-input["']/i.test(s)),
      artifactCheck("Action uses a native button", "Use a submit button instead of a clickable div.", (s) => /<button\s+type=["']submit["']/i.test(s) && !/onclick=/i.test(s)),
      artifactCheck("Status is announced", "Give lesson-status role=status.", (s) => /id=["']lesson-status["'][^>]*role=["']status["']/i.test(s)),
    ] },
    { artifactKind: "terraform" as const, label: "Responsive component stylesheet", filename: "lesson-card.css", language: "CSS", starter: cssArtifact(lesson, false), solution: cssArtifact(lesson, true), checks: [
      artifactCheck("Cascade layers are explicit", "Keep reset, tokens, and components layers.", (s) => /@layer\s+reset,\s*tokens,\s*components/.test(s)),
      artifactCheck("Keyboard focus remains visible", "Add a :focus-visible outline.", (s) => /:focus-visible/.test(s) && /outline:\s*3px/.test(s) && !/outline:\s*none/.test(s)),
      artifactCheck("Layout responds to its container", "Use a container query rather than a fixed viewport assumption.", (s) => /@container\s*\(/.test(s) && !/width:\s*980px/.test(s)),
      artifactCheck("Reduced motion is respected", "Add a prefers-reduced-motion rule.", (s) => /prefers-reduced-motion:\s*reduce/.test(s)),
    ] },
    { artifactKind: "kubernetes" as const, label: "Typed asynchronous view model", filename: "load-items.ts", language: "TypeScript", starter: scriptArtifact(lesson, false), solution: scriptArtifact(lesson, true), checks: [
      artifactCheck("Obsolete requests are cancelled", "Abort the previous controller before creating the next request.", (s) => /controller\?\.abort\(\)/.test(s)),
      artifactCheck("HTTP failure is classified", "Check response.ok before parsing the payload.", (s) => /if\s*\(!response\.ok\)/.test(s)),
      artifactCheck("External data is validated", "Validate the array and item types before using it.", (s) => /Array\.isArray\(items\)/.test(s) && /typeof item === ["']string["']/.test(s)),
      artifactCheck("Cancellation and user error differ", "Ignore AbortError and render a safe recovery message for other errors.", (s) => /AbortError/.test(s) && /could not be loaded/.test(s)),
    ] },
    { artifactKind: "cicd" as const, label: "Frontend delivery policy", filename: "frontend.release.json", language: "JSON", starter: policyArtifact(lesson, false), solution: policyArtifact(lesson, true), checks: [
      artifactCheck("Build output is immutable and bounded", "Enable immutable builds with initial and route budgets.", (s) => /"immutable": true/.test(s) && /"initial_kb": 220/.test(s) && /"route_kb": 420/.test(s)),
      artifactCheck("Quality gates cover user behavior", "Enable component, end-to-end, and accessibility gates.", (s) => /"component": true/.test(s) && /"e2e": true/.test(s) && /"accessibility": true/.test(s)),
      artifactCheck("CSP is strict", "Remove unsafe-inline and unsafe-eval; require a nonce and Trusted Types.", (s) => /nonce-\{RANDOM\}/.test(s) && /"trusted_types": true/.test(s) && !/unsafe-(?:inline|eval)/.test(s)),
      artifactCheck("Release can be previewed and rolled back", "Use preview, a 10% canary, and atomic rollback.", (s) => /"preview": true/.test(s) && /"canary_percent": 10/.test(s) && /"atomic_rollback": true/.test(s)),
    ] },
  ];
  const selected = variants[kind];
  return { kind: selected.artifactKind, label: selected.label, filename: selected.filename, language: selected.language, brief: `Review a realistic ${selected.label.toLowerCase()} for ${lesson.title}. Repair the injected accessibility, resilience, security, and delivery gaps without executing it.`, starter: selected.starter, solution: selected.solution, checks: selected.checks };
}

export function evaluateFrontendArtifact(artifact: CloudArtifact, source: string): CloudArtifactResult {
  if (!source.trim()) return { passed: false, error: "The artifact is empty.", checks: [] };
  if (source.length > MAX) return { passed: false, error: "Keep the training artifact under 24,000 characters.", checks: [] };
  if (source.includes("\0")) return { passed: false, error: "Null bytes are not allowed in training artifacts.", checks: [] };
  if (artifact.filename.endsWith(".json")) {
    try { const parsed: unknown = JSON.parse(source); if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(); }
    catch { return { passed: false, error: "The delivery policy must be one valid JSON object.", checks: [] }; }
  }
  const checks = artifact.checks.map((entry) => ({ name: entry.name, hint: entry.hint, passed: entry.test(source) }));
  return { passed: checks.length > 0 && checks.every((entry) => entry.passed), checks };
}
