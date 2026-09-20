export type FrontendEnrichment = {
  label: string;
  mentalModel: string;
  implementation: string;
  example: string;
  exampleNote: string;
  diagnostic: string;
  deliverable: string;
  success: string;
  review: { question: string; correct: string; trap: string };
};

type Profile = {
  title: string;
  label: string;
  model: string;
  code: string;
  note: string;
  diagnostic: string;
  decision: string;
};

const p = (title: string, label: string, model: string, code: string, note: string, diagnostic: string, decision: string): Profile => ({ title, label, model, code, note, diagnostic, decision });

const PROFILES: Profile[] = [
  p("How Browsers and URLs Work", "REQUEST TRACE", "Navigation is a pipeline: URL parsing, DNS, connection, HTTP, parsing, and rendering. A later layer cannot repair an earlier contract failure.", `GET /products?sort=price HTTP/2
Host: shop.example
Accept: text/html

HTTP/2 200
Content-Type: text/html; charset=utf-8`, "The path and query select a resource; the origin selects the server. A 200 HTML document still does not prove its subresources will load.", "A deep link is blank, and its final 200 response contains JSON after two redirects.", "Inspect the redirect chain and final document Content-Type before changing page code."),
  p("HTTP Basics for Frontend Developers", "DEFENSIVE FETCH", "fetch can resolve for HTTP failures, so network completion, status, representation type, and payload validity are separate decisions.", `const response = await fetch("/api/profile");
if (!response.ok) throw new Error("HTTP " + response.status);
if (!response.headers.get("content-type")?.includes("application/json"))
  throw new Error("Unexpected response type");
const profile = await response.json();`, "The code classifies HTTP and media type before parsing, allowing the UI to show the real failure instead of a misleading JSON error.", "The API returns a branded HTML 503 page and response.json() throws.", "Classify status and Content-Type first, then map the failure to an explicit recovery state."),
  p("HTML Document Structure", "DOCUMENT OUTLINE", "Landmarks and headings create a navigable information structure independent of visual styling. Language and title orient users and assistive technology.", `<!doctype html>
<html lang="en"><head><title>Orders · Relay</title></head>
<body><header><nav aria-label="Primary">…</nav></header>
<main><h1>Orders</h1><section><h2>Open orders</h2></section></main></body></html>`, "The landmark list and heading list communicate the same hierarchy a sighted reader sees.", "Four large divs look like headings, and keyboard users cannot jump to main content.", "Replace visual-only structure with one main landmark and a logical heading hierarchy."),
  p("Semantic HTML", "NATIVE CONTROL", "Native controls bundle role, name, focus, keyboard activation, and platform behavior. Rebuilding that contract on a generic element is costly and incomplete.", `<button type="button" aria-expanded="false" aria-controls="filters">
  Filters
</button>
<section id="filters" hidden>…</section>`, "The button works with pointer, Enter, and Space. aria-expanded communicates state but does not implement the disclosure behavior.", "A clickable div has tabindex=0 and an onClick handler but ignores Enter and Space.", "Use a native button and keep its expanded state synchronized with the controlled region."),
  p("Links, Images, and Media", "RESPONSIVE MEDIA", "Links describe destinations; images communicate content or decoration; intrinsic dimensions reserve stable space.", `<a href="/reports/weekly">Read the weekly reliability report</a>
<img src="chart-640.png" srcset="chart-1280.png 2x"
 width="640" height="360"
 alt="Error rate falls from 8% to 2% after rollback">`, "The link makes sense out of context, the alternative conveys the chart's conclusion, and dimensions reduce layout shift.", "A hero image shifts the primary button while loading and its alt text is the filename.", "Reserve the image's aspect ratio and write an alternative that communicates its relevant meaning."),
  p("CSS Selectors and the Cascade", "CASCADE TRACE", "The cascade resolves origin, importance, layer, specificity, scope, and source order. Specificity is only one part of the decision.", `@layer reset, base, components, utilities;
@layer components { :where(.card) { padding: 1rem; } }
@layer utilities { .compact { padding: .5rem; } }`, "Declared layers make the utility intentionally stronger without ID selectors or !important escalation.", "A spacing fix requires .page #app .panel.card!important and breaks another route.", "Trace the winning rule, then move ownership into explicit layers with low-specificity selectors."),
  p("Box Model and Spacing", "INTRINSIC SIZE", "Content, padding, border, margin, and intrinsic minimums determine the final box. Overflow is evidence of a sizing-contract failure.", `*, *::before, *::after { box-sizing: border-box; }
.card { padding: 1rem; max-inline-size: 42rem; }
.card__content { min-inline-size: 0; overflow-wrap: anywhere; }`, "The component can shrink inside flex or grid and wrap long content instead of clipping it.", "At 200% zoom, a fixed-height card clips translated button text.", "Remove the fixed height, preserve content flow, and test long text in a narrow container."),
  p("Typography and Color", "READING SYSTEM", "Readable type depends on measure, size, line height, weight, and contrast. Color should reinforce meaning rather than carry it alone.", `:root { --text: #f5f7ff; --danger: #ff6b7a; }
.prose { max-inline-size: 68ch; line-height: 1.65; }
.error { color: var(--danger); }
.error::before { content: "Error: "; font-weight: 700; }`, "The measure supports scanning and the error remains understandable without perceiving red.", "Success and failure differ only by green and red borders, while paragraphs span an ultrawide screen.", "Add semantic text or icon cues and constrain reading measure before adjusting decorative color."),
  p("Flexbox Layouts", "FLEX AXIS", "Flexbox distributes free space on one main axis. Basis, growth, shrinkage, minimum size, and wrapping jointly determine results.", `.toolbar { display: flex; flex-wrap: wrap; gap: .75rem; }
.toolbar__search { flex: 1 1 16rem; min-inline-size: 10rem; }
.toolbar__actions { flex: 0 0 auto; }`, "Search uses available room and wraps before essential actions become unusably narrow.", "A growing search input causes action buttons to shrink into unreadable slivers.", "Give essential actions explicit shrink behavior and test the toolbar at its smallest realistic width."),
  p("CSS Grid Layouts", "GRID TRACKS", "Grid sizes two-dimensional tracks, then places items. minmax(0, 1fr) permits a fractional track to shrink below min-content width.", `.cards { display: grid; gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
}
.cards > * { min-inline-size: 0; }`, "The layout forms as many usable columns as fit and collapses without changing DOM order.", "Visual reordering puts the sidebar first while keyboard focus still follows the original DOM.", "Keep meaningful source order and adapt the track definition instead of reordering content."),
  p("Responsive Design", "CONTENT BREAKPOINT", "Responsive layouts react to available space and user preferences, not a list of devices. A breakpoint belongs where content stops working.", `.shell { inline-size: min(100% - 2rem, 72rem); margin-inline: auto; }
.panel { container-type: inline-size; }
@container (min-width: 42rem) {
  .panel__body { display: grid; grid-template-columns: 2fr 1fr; }
}`, "The shell is fluid and the component adapts to its allocated space, including when embedded.", "The page works at 375px and 1440px but overflows at 820px and high zoom.", "Introduce a query at the observed content failure and verify intermediate widths and zoom."),
  p("Mobile-first Layouts", "BASELINE FIRST", "Mobile-first makes the simplest constrained layout the default and adds capabilities as space grows. It is a dependency strategy, not a device preference.", `.actions { display: grid; gap: .75rem; }
.actions button { min-block-size: 44px; }
@media (min-width: 48rem) {
  .actions { display: flex; justify-content: flex-end; }
}`, "Removing the media query still leaves a complete, usable vertical action flow.", "Desktop defaults are repeatedly cancelled by max-width rules, leaving an unstable middle range.", "Make the narrow task complete by default, then add only the wider enhancement."),
  p("Forms and Native Validation", "FORM CONTRACT", "A form is a conversation: label, purpose, constraints, input, error, correction, and submission must stay connected.", `<label for="email">Work email</label>
<input id="email" name="email" type="email" autocomplete="email"
 aria-describedby="email-hint email-error" required>
<p id="email-hint">Use your team address.</p>
<p id="email-error" role="alert" hidden>Enter a valid email.</p>`, "The accessible description includes instruction and active error while the server remains authoritative.", "Placeholder-only labels disappear during entry and one server error clears every field.", "Preserve valid input, associate each error, and provide an error summary for multi-field failures."),
  p("Basic Interaction Design", "INTENT TO FEEDBACK", "Every action needs an affordance, activation path, immediate feedback, and recovery proportional to its consequence.", `async function archive(item) {
  showPending(item.id);
  try { await api.archive(item.id); showUndo(item); }
  catch { restore(item); announce("Archive failed; item restored"); }
}`, "Optimistic feedback is paired with rollback and undo instead of leaving unexplained state.", "A destructive icon has no label, produces no feedback, and cannot be undone.", "Add an accessible name, pending state, failure recovery, and a reliable undo path."),
  p("Accessibility Fundamentals", "POUR REVIEW", "Accessible experiences must be perceivable, operable, understandable, and robust. Passing rules is an input; completing the task is the outcome.", `<a class="skip-link" href="#main">Skip to main content</a>
<header>…</header>
<main id="main" tabindex="-1"><h1>Dashboard</h1></main>`, "The skip link bypasses repetition and the main region can receive programmatic focus after navigation.", "An automated scan is green, but a keyboard user cannot open the menu.", "Test the whole task with keyboard, zoom, reduced motion, and name-role-value review."),
  p("JavaScript Values and Variables", "VALUE BOUNDARY", "Conversion at uncontrolled boundaries can turn missing or malformed input into plausible but wrong state.", `const raw = formData.get("count");
const count = typeof raw === "string" ? Number(raw) : NaN;
if (!Number.isInteger(count) || count < 0)
  throw new Error("Count must be a non-negative integer");`, "Parsing and domain validation are separate; an empty or absent value cannot silently become accepted data.", "The UI uses value || 10, replacing a legitimate zero with the default.", "Use a nullish default only for missing values and validate the parsed domain value explicitly."),
  p("Functions, Arrays, and Objects", "PURE TRANSFORM", "A focused function maps explicit inputs to output without mutating shared state, making updates and tests predictable.", `function toggleTodo(todos, id) {
  return todos.map(todo =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  );
}`, "The original array remains intact and reference changes occur only where data changed.", "Calling sort() on received props silently changes another component's order.", "Return a derived collection and prove the original reference and values remain unchanged."),
  p("DOM Selection and Events", "EVENT LIFECYCLE", "Events travel through capture, target, and bubble phases. Delegation serves dynamic children, but listeners still need stable ownership and cleanup.", `function onListClick(event) {
  const button = event.target.closest("button[data-remove-id]");
  if (!button || !event.currentTarget.contains(button)) return;
  removeItem(button.dataset.removeId);
}
list.addEventListener("click", onListClick);`, "One listener handles present and future buttons while remaining bounded to the owned list.", "Every render adds another anonymous listener, so one click performs five removals.", "Attach one owned handler and remove it when the list lifecycle ends."),
  p("State-driven Rendering", "STATE MACHINE", "The visible interface should be a projection of explicit state. Mutually exclusive variants prevent contradictory combinations.", `const render = {
  idle: () => showForm(),
  loading: () => showSpinner(),
  success: state => showItems(state.items),
  empty: () => showEmpty(),
  error: state => showError(state.message)
}[state.status];
render(state);`, "One status chooses the view, so loading, empty, and error cannot appear simultaneously.", "Several booleans allow isLoading, hasError, and isEmpty to all become true.", "Replace unrelated flags with explicit states and an allowed transition table."),
  p("Fetching Data and Handling States", "REQUEST OWNERSHIP", "A request belongs to one user intent. When intent changes, obsolete work should stop or lose permission to update the view.", `let controller;
async function search(query) {
  controller?.abort();
  controller = new AbortController();
  const response = await fetch("/api/search?q=" + encodeURIComponent(query), { signal: controller.signal });
  if (!response.ok) throw new Error("HTTP " + response.status);
  return response.json();
}`, "Cancellation prevents an earlier slow query from replacing newer results.", "Typing quickly shows results for the first query after the final query already completed.", "Abort or ignore the obsolete request and keep state tied to the latest query."),
  p("Accessible Responsive Dashboard Capstone", "INTEGRATED DASHBOARD", "A production interface is a chain of semantic, layout, state, interaction, accessibility, and recovery contracts.", `<main id="main"><h1>Service health</h1>
<section aria-labelledby="incidents-title">
  <h2 id="incidents-title">Open incidents</h2>
  <div role="status" aria-live="polite">3 incidents loaded</div>
  <ul class="dashboard-grid">…</ul>
</section></main>`, "The capstone begins with a durable document and announced data state; layout and scripting enhance that core.", "The happy path looks polished, but failure replaces the page and focus returns to browser chrome.", "Verify one complete dashboard task across slow, empty, failed, narrow, zoomed, and keyboard-only states."),
  p("Modules and Imports", "MODULE BOUNDARY", "A module exposes a small public contract and hides implementation. Imports form a graph; hidden side effects and cycles make it order-dependent.", `// price.ts
export function formatPrice(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(cents / 100);
}
// consumer.ts
const formatted = formatPrice(1999, "en-US");`, "The formatter has no startup side effect and can be tested without a view or browser global.", "Importing a utility registers global listeners, and a circular import leaves an export undefined.", "Move startup work to the composition root and break the cycle around a narrow public interface."),
  p("npm and Package Hygiene", "DEPENDENCY CONTRACT", "Every package adds runtime, maintenance, licensing, and supply-chain surface. A lockfile records a resolution; it does not certify safety.", `{
  "scripts": { "ci": "npm ci && npm test && npm run build" },
  "dependencies": { "zod": "^4.0.0" },
  "devDependencies": { "typescript": "^5.9.0" },
  "engines": { "node": ">=22" }
}`, "The manifest states runtime ownership and the CI command requires the lockfile to match before verification.", "A tiny formatting need adds a large unmaintained runtime package with an install script.", "Review purpose, alternatives, maintenance, install behavior, bundle cost, and a removal path before adoption."),
  p("TypeScript Fundamentals", "PARSE THEN TRUST", "TypeScript checks compiled code; external input remains unknown at runtime. Narrowing converts uncertain values into trusted domain data.", `type Result = { ok: true; value: string } | { ok: false; error: string };
function parseName(input: unknown): Result {
  if (typeof input !== "string" || input.trim().length < 2)
    return { ok: false, error: "Name is too short" };
  return { ok: true, value: input.trim() };
}`, "The discriminator forces callers to handle failure without asserting that unknown data is already valid.", "An API response is cast with as User and crashes when a nested field is missing.", "Validate unknown data at runtime and return a discriminated success or failure result."),
  p("Async JavaScript and Promises", "ASYNC OWNERSHIP", "A promise represents eventual completion, not automatic cancellation or error ownership. The starter of work must decide who awaits and reports it.", `async function loadPage(signal: AbortSignal) {
  const [profile, projects] = await Promise.all([
    fetchProfile({ signal }), fetchProjects({ signal })
  ]);
  return { profile, projects };
}`, "Independent reads run concurrently and share one cancellation boundary owned by the page load.", "A click handler starts save().then(...) without awaiting, disabling, catching, or cancelling it.", "Give the operation one owner, await its result, propagate cancellation, and route failure to a visible state."),
  p("Browser Storage and Serialization", "VERSIONED STORAGE", "Stored strings are not trustworthy application objects. Data may be stale, corrupt, user-edited, unavailable, or evicted.", `function loadPrefs() {
  try {
    const data = JSON.parse(localStorage.getItem("prefs") ?? "null");
    if (data?.version === 2 && typeof data.theme === "string") return data;
  } catch {}
  return { version: 2, theme: "system" };
}`, "Corrupt or obsolete data falls back safely instead of blocking application startup.", "A new version assumes the old stored shape and crashes before a reset control can render.", "Version, parse, validate, migrate known shapes, and recover to a safe non-sensitive default."),
  p("Component Design", "COMPONENT CONTRACT", "A component owns a focused responsibility and exposes inputs describing valid product states. Composition is safer than growing boolean combinations.", `type NoticeProps = {
  tone: "info" | "success" | "warning" | "danger";
  title: string;
  children: React.ReactNode;
};`, "One tone excludes contradictory success and danger flags while children preserve composition.", "A component accepts compact, large, success, danger, link, and submit booleans in impossible combinations.", "Replace contradictory booleans with semantic variants and document ownership and accessible defaults."),
  p("Design Tokens and CSS Architecture", "SEMANTIC TOKEN", "A token names a design decision. Primitive values describe raw scales; semantic tokens describe purpose and can adapt by theme.", `@layer tokens, components;
@layer tokens {
  :root { --blue-500: #3977ff; --surface-action: var(--blue-500); }
  [data-theme="dark"] { --surface-action: #75a4ff; }
}
@layer components { .button { background: var(--surface-action); } }`, "The component requests an action surface instead of hard-coding a shade, so theming can preserve meaning.", "Dark mode overrides hundreds of component hex values independently.", "Route primitive values through semantic roles and keep component rules inside an owned layer."),
  p("Routing and Navigation", "URL CONTRACT", "A route maps a durable URL to content and state while preserving history, deep links, document title, and focus orientation.", `async function afterRouteChange(title: string) {
  document.title = title + " · Relay";
  await nextPaint();
  document.querySelector("main h1")?.focus({ preventScroll: true });
}`, "The router owns history while the transition updates title and orientation for assistive-technology users.", "Client navigation swaps the view, but the title stays stale and focus remains on a removed link.", "Test direct load, refresh, back/forward, unknown routes, title updates, and post-navigation focus."),
  p("Forms with Server-backed Validation", "TWO-LAYER VALIDATION", "Client validation improves feedback; server validation protects data and authorization. Repeat-sensitive writes also need replay safety.", `const result = await saveProfile(values, { idempotencyKey });
if (!result.ok) {
  setErrors(result.fieldErrors);
  focusErrorSummary();
  return;
}
navigate("/profile?updated=1");`, "Server field errors return to the form without discarding valid work, and a stable key protects retries.", "The server rejects one field and the page clears all values with only 'invalid request'.", "Map authoritative errors to fields and summary, preserve valid input, and make repeated submission safe."),
  p("Data Fetching, Caching, and Retries", "CACHE IDENTITY", "A cache is correct only when its key includes every input that changes the representation. Freshness and invalidation are product decisions.", `const key = ["projects", { userId, teamId, page, filters }];
const policy = {
  staleTime: 30_000,
  retry: (count, error) => error.transient && count < 2
};`, "Identity, scope, page, and filters all participate in the key; retry is bounded to transient reads.", "Changing accounts briefly shows the previous user's projects because identity is absent from the key.", "Complete the cache key, define freshness and invalidation, and retry only repeat-safe transient operations."),
  p("Unit Testing UI Logic", "PURE BEHAVIOR TEST", "A unit test is strongest when it exercises deterministic inputs and outputs instead of mirroring private implementation steps.", `test("adds a filter without mutation", () => {
  const before = { status: ["open"], owner: "me" };
  const after = toggleStatus(before, "closed");
  expect(after.status).toEqual(["open", "closed"]);
  expect(before.status).toEqual(["open"]);
});`, "The test proves observable behavior and immutability while allowing internal refactoring.", "A test spies on every helper call and breaks when code is reorganized without behavior change.", "Assert boundary cases and public outcomes while injecting time, randomness, and I/O."),
  p("Component Testing", "USER-VISIBLE CONTRACT", "Component tests should query semantics, perform user actions, and assert visible state at the component boundary.", `render(<SearchForm onSearch={onSearch} />);
await user.type(screen.getByRole("searchbox", { name: /projects/i }), "relay");
await user.click(screen.getByRole("button", { name: /search/i }));
expect(onSearch).toHaveBeenCalledWith("relay");`, "A lost accessible name now fails the same query a user depends on.", "Tests locate .btn-primary:nth-child(2) and call a private submit method directly.", "Interact through roles and accessible names, then assert the visible transition or public callback."),
  p("End-to-end Testing", "CRITICAL JOURNEY", "E2E tests buy system confidence at high cost. Protect a small set of valuable journeys with isolated data and meaningful outcomes.", `test("learner resumes a lesson", async ({ page }) => {
  await page.goto("/tracks/frontend");
  await page.getByRole("link", { name: /continue learning/i }).click();
  await expect(page.getByRole("heading", { name: /state-driven rendering/i })).toBeVisible();
});`, "The test captures a user promise without depending on DOM depth or arbitrary waiting.", "A large suite shares one account, uses fixed sleeps, and fails differently on every run.", "Isolate test data, use user-facing locators, and wait for the journey's observable outcome."),
  p("Accessibility Testing", "LAYERED ACCESSIBILITY", "Automation, keyboard review, assistive-technology reasoning, zoom, and human usability expose different accessibility failures.", `await expect(page).toHaveNoAccessibilityViolations();
await page.keyboard.press("Tab");
await expect(page.getByRole("link", { name: /skip to main/i })).toBeFocused();
// Manual: reading order, announcements, zoom, and task completion.`, "Automated and keyboard evidence are separate; neither pretends to replace disabled-user research.", "The team calls a zero-violation scan an accessibility certification.", "Record automated, keyboard, screen-reader, zoom, and usability evidence separately for the full task."),
  p("Visual Regression Testing", "VISUAL CONTRACT", "Screenshot tests compare pixels, so live data, fonts, motion, time, and platform differences can create meaningless noise.", `await page.emulateMedia({ reducedMotion: "reduce" });
await page.route("**/api/report", route => route.fulfill({ json: stableReport }));
await expect(page.getByRole("main")).toHaveScreenshot("report-empty.png", {
  animations: "disabled"
});`, "Stable data, motion, and scope make a diff more likely to represent a real product change.", "Live dates and random avatars change every baseline, so reviewers accept all updates blindly.", "Stabilize fixtures and fonts, scope the screenshot, and review intent before updating the baseline."),
  p("Web APIs and Browser Capabilities", "CAPABILITY DETECTION", "Browser APIs vary by capability, permission, secure context, and lifecycle. A user-agent string is an unreliable proxy.", `async function copy(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return "copied";
  }
  selectTextFallback(text);
  return "selected";
}`, "The fallback still advances the user's task instead of hiding it based on a browser-brand guess.", "A feature is enabled by user agent even when permission is denied and the page is not secure.", "Detect the actual capability and permission, request access after intent, and provide a usable fallback."),
  p("Loading, Empty, and Failure States", "COMPLETE STATE MODEL", "Loading, empty, stale, partial, error, and success are different product states with different context and next actions.", `switch (state.status) {
  case "loading": return <ProjectsSkeleton />;
  case "empty": return <EmptyProjects onCreate={openCreate} />;
  case "error": return <InlineError onRetry={retry} />;
  case "success": return <ProjectList projects={state.projects} />;
}`, "Empty offers creation; error offers retry; neither masquerades as indefinite loading.", "An empty API array leaves the spinner running because only success-with-items was handled.", "Give every state a message, retained context, recovery action, and predictable focus behavior."),
  p("Animation and Motion Preferences", "MOTION WITH PURPOSE", "Motion can explain continuity and feedback, but it must not carry essential meaning and should respect reduced-motion preferences.", `.panel { transition: transform 180ms ease, opacity 180ms ease; }
@media (prefers-reduced-motion: reduce) {
  .panel { transition: none; }
}
[data-state="closed"] { opacity: 0; transform: translateY(.5rem); }`, "Reduced motion removes the transition, not the state change or its meaning.", "An error is communicated only by a looping shake animation.", "Preserve the final state and non-motion cue while removing nonessential movement."),
  p("Performance Measurement and Core Web Vitals", "MEASURE USER EXPERIENCE", "Loading, responsiveness, and stability are distributions across real devices. One fast local score cannot represent users.", `const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) sendMetric(entry.name, entry.duration);
});
observer.observe({ type: "long-animation-frame", buffered: true });
performance.mark("filters-open-start");`, "A product mark connects platform timing to one interaction; collection still needs sampling and privacy controls.", "A fast laptop scores 100 while real-user interaction latency regresses at the 75th percentile.", "Use field distributions to select the problem and a trace to localize the responsible work."),
  p("Code Splitting and Asset Optimization", "LOAD BY NEED", "Splitting trades initial bytes for later requests. Useful boundaries follow routes or capabilities; excessive fragments create waterfalls.", `const Editor = React.lazy(() => import("./editor"));
function ReportRoute({ editable }) {
  return editable
    ? <Suspense fallback={<EditorSkeleton />}><Editor /></Suspense>
    : <ReadOnlyReport />;
}`, "Editor code loads only for the editing capability, with a stable fallback at the same layout boundary.", "Every small component is lazy-loaded, creating a sequential request waterfall after navigation.", "Split at a meaningful deferred capability, remove duplicate modules, and verify user timing instead of bytes alone."),
  p("Multi-page Product Application Capstone", "PRODUCT VERTICAL SLICE", "A production flow crosses routing, types, data, forms, components, testing, accessibility, and performance; each boundary must survive integration.", `type CheckoutState =
  | { step: "details"; draft: Draft }
  | { step: "review"; order: ValidatedOrder }
  | { step: "submitting"; order: ValidatedOrder }
  | { step: "complete"; receipt: Receipt }
  | { step: "failed"; order: ValidatedOrder; message: string };`, "The state model defines navigation and retry expectations before page components are implemented.", "Pages work alone, but Back loses the draft and Retry creates a duplicate order.", "Build a thin complete journey, then prove refresh, history, slow data, duplicate submission, keyboard access, and budgets."),
  p("Rendering Pipeline and Layout", "RENDER PIPELINE", "DOM and style changes may invalidate style, layout, paint, and compositing. Alternating geometry reads and writes forces synchronous layout.", `const cards = [...document.querySelectorAll(".card")];
const heights = cards.map(card => card.getBoundingClientRect().height);
requestAnimationFrame(() => {
  cards.forEach((card, i) => card.style.setProperty("--height", heights[i] + "px"));
});`, "Geometry is read in one phase and mutations happen later, avoiding a read-write-read loop.", "A scroll handler reads offsetHeight and writes style.width for every item on every event.", "Batch reads before writes, constrain invalidation scope, then compare frame traces."),
  p("Event Loop and Scheduling", "SCHEDULING BUDGET", "Tasks, microtasks, rendering, and input compete on the main thread. One long task delays paint even when each inner operation seems small.", `async function processItems(items, signal) {
  for (let i = 0; i < items.length; i += 100) {
    if (signal.aborted) throw signal.reason;
    processChunk(items.slice(i, i + 100));
    await new Promise(requestAnimationFrame);
  }
}`, "Chunking creates rendering and input opportunities while retaining cancellation ownership.", "A microtask chain processes 50,000 items and the loading indicator never paints.", "Split and yield measured CPU work, cancel obsolete jobs, and verify interaction latency."),
  p("Memory, Leaks, and Cleanup", "REACHABILITY", "Memory remains while an object is reachable. Listeners, timers, detached nodes, subscriptions, and unbounded caches often retain whole feature graphs.", `function mountPanel(node) {
  const controller = new AbortController();
  window.addEventListener("resize", () => layout(node), { signal: controller.signal });
  const timer = setInterval(() => refresh(node), 30000);
  return () => { controller.abort(); clearInterval(timer); };
}`, "One disposer releases both event and timer ownership when the panel unmounts.", "A removed DOM node remains reachable through a window-listener closure after every navigation.", "Name each resource owner and cleanup point, then compare heap and listener counts across repeated lifecycle cycles."),
  p("Advanced TypeScript API Design", "INVALID STATES", "A public type API should guide inference and prevent contradictory options without exposing implementation details.", `type Request =
  | { mode: "cached"; key: string; maxAgeMs: number }
  | { mode: "live"; signal: AbortSignal };
function load(request: Request) {
  if (request.mode === "cached") return readCache(request.key, request.maxAgeMs);
  return fetchLive(request.signal);
}`, "Consumers cannot combine cache-only and live-only options, and narrowing exposes the correct fields.", "A generic API accepts incompatible optional properties and returns broad unknown values.", "Use discriminated contracts and type tests so invalid combinations fail at the call site."),
  p("Framework Trade-offs and Boundaries", "TOOL BOUNDARY", "Frameworks optimize particular workflows; product rules remain healthier when they do not depend directly on framework lifecycle details.", `export interface Navigator { to(path: string): void }
export function completeCheckout(order: Order, nav: Navigator) {
  saveReceipt(order);
  nav.to("/receipt/" + order.id);
}`, "The use case depends on one narrow capability, not a framework router object.", "Every domain function imports hooks and can run only inside a rendering component.", "Isolate framework services behind adapters selected from written product constraints and exit costs."),
  p("Component API Architecture", "DESIGN-SYSTEM CONTRACT", "Shared components are governed products: ownership, variants, accessibility, change policy, and migration matter as much as visuals.", `<Dialog.Root>
  <Dialog.Trigger>Delete project</Dialog.Trigger>
  <Dialog.Content aria-labelledby="delete-title">
    <Dialog.Title id="delete-title">Delete project?</Dialog.Title>
    <Dialog.Actions>…</Dialog.Actions>
  </Dialog.Content>
</Dialog.Root>`, "Composition keeps content flexible while the primitive owns focus, Escape, labelling, and restoration.", "A universal Modal has 48 props and teams bypass its focus behavior with private overrides.", "Define valid compositions, behavior contracts, ownership, deprecation, and migration before adding variants."),
  p("Theming and Token Governance", "TOKEN GOVERNANCE", "Tokens are cross-product contracts. Semantic roles, contrast rules, ownership, aliases, and versioned migration prevent unreviewed overrides.", `{
  "color.action.primary.background": { "value": "{color.blue.600}", "type": "color" },
  "color.action.primary.text": { "value": "{color.white}", "type": "color" },
  "color.focus.ring": { "value": "{color.cyan.300}", "type": "color" }
}`, "Usage-based names allow automated state and contrast checks across themes.", "A brand overrides --blue-500 until focus, disabled, and text contrast fail in three products.", "Review affected consumers and contrast pairs, then publish a versioned alias migration."),
  p("Advanced CSS Composition", "LOCAL COMPOSITION", "Layers control cascade order, scopes limit ownership, container queries adapt components, and logical properties respect writing modes.", `@layer reset, theme, components, utilities;
@scope (.profile-card) {
  :scope { container-type: inline-size; padding-inline: 1rem; }
  @container (min-width: 32rem) {
    .details { display: grid; grid-template-columns: 1fr 2fr; }
  }
}`, "The component adapts to its allocated space while scope limits internal selectors.", "An unlayered global .title rule silently overrides headings in three products.", "Declare ownership with layers and scope, then query the component container instead of leaking global overrides."),
  p("Internationalization and Localization", "LOCALE AS INPUT", "Locale affects messages, plurals, dates, numbers, direction, and layout. Translation is not word substitution.", `const countText = new Intl.NumberFormat(locale).format(count);
const dateText = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);

.icon-label { margin-inline-start: .5rem; }`, "Intl formatting and logical spacing adapt to locale and writing direction without duplicated layout rules.", "The UI concatenates count + ' files deleted', producing broken grammar in several languages.", "Use complete parameterized messages and test long, plural, RTL, date, number, and missing-key cases."),
  p("Accessibility Architecture and Keyboard UX", "INTERACTION PATTERN", "Complex widgets need consistent contracts for role, name, state, focus movement, activation, Escape, announcements, and focus restoration.", `function onMenuKeyDown(event) {
  if (event.key === "ArrowDown") moveActive(1);
  else if (event.key === "ArrowUp") moveActive(-1);
  else if (event.key === "Escape") { closeMenu(); trigger.focus(); }
}`, "This is only part of the menu contract; roles, roving focus, typeahead, disabled items, and announcements must align.", "Three products implement different arrow-key and Escape behavior for the same combobox.", "Adopt one established pattern and verify its complete keyboard, focus, and announcement contract."),
  p("Performance Budgets", "BUDGET AS CONTRACT", "A performance budget converts experience goals into release constraints and needs measurement, ownership, enforcement, and exceptions.", `{
  "route": "/dashboard",
  "budgets": { "initialJsKb": 220, "lcpMsP75": 2500, "inpMsP75": 200 },
  "owner": "dashboard-platform",
  "exceptionExpires": null
}`, "Build output and field outcomes share a named owner; thresholds must come from product goals and evidence.", "The bundle grows every release because performance is checked only during an annual audit.", "Enforce a journey-specific threshold in CI and field monitoring with an expiring exception process."),
  p("Critical Rendering Path", "FIRST USEFUL VIEW", "The browser must discover, fetch, parse, and apply critical resources before useful content appears. Priority should match first-view value.", `<link rel="preload" href="/fonts/ui.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/critical.css">
<script type="module" src="/app.js"></script>
<img src="hero.avif" width="960" height="540" fetchpriority="high" alt="">`, "The browser prioritizes proven first-view resources; unnecessary preloads would compete for bandwidth.", "Ten fonts and below-the-fold images are preloaded, delaying the real largest element.", "Annotate the waterfall, remove noncritical blockers, and preload only a critical resource discovered too late."),
  p("Caching and Service Workers", "VERSIONED CACHE", "A service worker may outlive a release. Cache keys, activation, cleanup, offline fallback, and client compatibility are release contracts.", `const CACHE = "shell-v7";
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith("shell-") && key !== CACHE)
      .map(key => caches.delete(key))
  )));
});`, "Activation removes only obsolete owned shell caches; data needs a separate policy.", "A new bundle runs against old cached HTML and users cannot start or update the app.", "Version caches and test N-1 to N across open tabs, offline start, cleanup, and rollback."),
  p("Offline-first Behavior", "LOCAL FIRST, HONESTLY", "Offline-first deliberately models local reads, durable writes, status, retry, and conflict. It does not pretend queued data is server-confirmed.", `const operation = {
  id: crypto.randomUUID(), type: "rename", recordId, value, baseVersion
};
await outbox.put(operation);
applyOptimistic(operation);
setSyncState({ status: "queued", operationId: operation.id });`, "The write is durable before optimistic feedback and carries a version for conflict detection.", "The UI says Saved before persistence, and closing the offline tab loses the change.", "Persist an identified outbox operation first, then define idempotent retry, status, and conflict resolution."),
  p("Streaming and Progressive Rendering", "STABLE BOUNDARY", "Streaming delivers independent regions early, but shell, order, error, hydration, and focus must remain compatible as content arrives.", `<main>
  <h1>Account</h1>
  <Suspense fallback={<ProfileSkeleton />}><Profile /></Suspense>
  <Suspense fallback={<ActivitySkeleton rows={5} />}><Activity /></Suspense>
</main>`, "Independent boundaries can complete separately while stable fallbacks reduce layout shift.", "Late content inserts above the focused form and hydrates from different locale data.", "Use stable-size boundaries, consistent data, isolated errors, and tests for focus and hydration."),
  p("XSS and Safe DOM Updates", "CONTEXTUAL OUTPUT", "Untrusted strings become dangerous in executable HTML, URL, CSS, or script contexts; each sink has different handling rules.", `const message = document.createElement("p");
message.textContent = externalMessage;
container.replaceChildren(message);
// External text remains data, not markup.`, "textContent preserves plain input as text even when it contains tags or handlers.", "A query parameter is concatenated into innerHTML to highlight search text.", "Trace every external source to its sink and keep plain text out of HTML-parsing APIs."),
  p("Content Security Policy", "DEFENSE IN DEPTH", "CSP restricts resource and script capabilities. It limits impact but does not replace safe output handling.", `Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-random-per-response';
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'none'`, "The nonce must be unpredictable per response and applied only to trusted scripts.", "A policy permits unsafe-inline and all HTTPS origins, so injected script still runs.", "Inventory sources, deploy report-only, remove violations, generate per-response nonces, then enforce."),
  p("Authentication and Session Boundaries", "SESSION TRUST", "Authentication establishes identity; server authorization protects each operation. Storage choice changes exposure but never makes client checks authoritative.", `Set-Cookie: session=opaque; Path=/; HttpOnly; Secure; SameSite=Lax
Cache-Control: no-store

POST /api/projects/42/delete
X-CSRF-Token: request-bound-token`, "The session is script-inaccessible, HTTPS-only, and the write has a CSRF control; server authorization remains required.", "A durable token sits in localStorage while hidden buttons are the only authorization check.", "Use a protected session, defend state-changing requests, validate redirects, and authorize every server action."),
  p("Privacy-aware Analytics", "MINIMUM NECESSARY", "Analytics events are data collection. Each field needs a defined purpose, consent basis where applicable, access policy, and deletion time.", `track("lesson_completed", {
  track: "frontend",
  level: "intermediate",
  lessonId: 12,
  attemptsBucket: "2-3"
});
// Excluded: answer text, email, editor contents.`, "The event supports curriculum decisions without collecting learner code or direct identity.", "A generic click event captures full URLs, inputs, email, and indefinite identity.", "Keep only decision-critical fields, exclude raw content, honor consent, and enforce retention."),
  p("CI/CD, Preview, and Rollback", "IMMUTABLE PROMOTION", "One tested artifact should move through preview, canary, and production. Rebuilding per environment breaks provenance and rollback confidence.", `build -> test -> sign artifact web-7f3a
web-7f3a -> preview -> accessibility + e2e
web-7f3a -> 10% canary -> observe errors and INP
web-7f3a -> 100% or rollback to web-7e91`, "Every environment receives the same artifact and the canary has explicit success and rollback signals.", "Production rebuilds from floating dependencies and rollback reruns the broken build process.", "Promote an immutable artifact through owned gates and keep a known-good version for atomic rollback."),
  p("Production-grade Offline App Capstone", "RESILIENT RELEASE", "An offline app combines runtime performance, versioned caches, durable sync, security, privacy, observability, and reversible delivery.", `release: web-9c2a
shellCache: shell-v9
dataSchema: 4
apiContract: 2026-09
outboxProtocol: 2
rollout: preview -> 5% -> 25% -> 100%
rollbackCompatibleWith: web-9b81`, "The manifest names the versions that must stay compatible across cached and live clients.", "A partial rollout leaves offline clients with a new shell, old schema, and writes the rolled-back server cannot read.", "Prove upgrade and rollback for online, offline, and mixed-version clients without losing queued work."),
];

const PROFILE_MAP = new Map(PROFILES.map((profile) => [profile.title, profile]));

export function getFrontendEnrichment(title: string, goal: string, failure: string, metric: string, controls: [string, string, string]): FrontendEnrichment {
  const profile = PROFILE_MAP.get(title);
  if (!profile) throw new Error(`Missing Frontend enrichment for ${title}`);
  return {
    label: profile.label,
    mentalModel: profile.model,
    implementation: `${profile.decision} ${goal}`,
    example: profile.code,
    exampleNote: profile.note,
    diagnostic: profile.diagnostic,
    deliverable: `Produce a focused ${title.toLowerCase()} review that names the user contract, the failing boundary, and the smallest justified repair.`,
    success: `The ${metric} signal improves while ${controls.join(", ")} remain independently verifiable.`,
    review: {
      question: `${profile.diagnostic} Which decision is best supported?`,
      correct: profile.decision,
      trap: `Hide or work around “${failure}” without testing the underlying ${title.toLowerCase()} contract.`,
    },
  };
}

export const FRONTEND_ENRICHMENT_COUNT = PROFILES.length;
