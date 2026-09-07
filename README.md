# CodeCraft

CodeCraft is a game-inspired learning platform with Python, SQL, GenAI, and a three-level Cloud Engineering beta. Lessons, examples, assessments, rotating Daily Quests, browser-based code labs, saved progress, profiles, and optional hosted AI coaching are delivered through a vinext/React application.

## Prerequisites

- Node.js `>=22.13.0`
- A Clerk application for account features
- A Cloudflare D1 binding named `DB` for cloud progress
- An optional Workers AI binding named `AI` for hosted GenAI coaching

## Local development

```bash
npm install
copy .env.example .env.local
npm run dev
```

Use development Clerk credentials in `.env.local`. Python executes through Pyodide and SQL executes through PGlite in browser workers; they do not require hosted Python or PostgreSQL servers.

For local development without remote Workers AI bindings (PowerShell):

```powershell
$env:CODECRAFT_LOCAL_ONLY = "true"
npm run dev -- --port 3000
```

This switch disables remote development bindings, not Clerk account requests or production services. No deployment is performed.

## Cloud Engineering beta

Open `http://localhost:3000/tracks/cloud`. The track contains 63 interactive topics split into three independently saved 21-topic paths:

- **Beginner — Cloud Foundations:** compute, storage, networking, identity, containers, monitoring, scaling, caching, queues, managed data, cost ownership, and recovery objectives.
- **Intermediate — Cloud Delivery:** infrastructure as code, CI/CD, Kubernetes, service objectives, observability, tested recovery, drift control, GitOps, demand scaling, service trust, and game days.
- **Expert — Cloud Platforms:** governed foundations, zero trust, supply-chain security, regional recovery, incident command, FinOps, multi-tenancy, data residency, capacity, platform APIs, and product operations.

Every topic includes three scenario-based architecture decisions, an evidence investigation using logs, traces, an incident timeline, a plan diff, or a cost report, and a practical failure scenario. Learners repair a realistic nested Terraform, Kubernetes, IAM, or CI/CD artifact with safe static validation, then repair the same flat fictional system model in JSON, HCL, or YAML and use an evidence-led troubleshooting runbook when a control fails. Each path has four worlds: three five-topic worlds followed by a six-topic mastery world. Projects at topics 5, 10, 15, and 21 become four-stage architecture, incident-triage, artifact-repair, and system-verification missions. The final project produces a downloadable review bundle. None of these exercises run infrastructure tools, execute the supplied artifact, contact a provider, or require cloud credentials. Capacity and costs are teaching models, not provider quotations.

Pass all three decisions, the evidence investigation, the static artifact review, and every system simulation check, then select **Complete lesson** to save progress and unlock the next lesson. XP is awarded once; projects earn Uptime Cells. A deterministic Cloud Daily Quest rotates at 00:00 UTC and shares the platform-wide one-reward-per-day streak contract. The progress schema accepts `cloud-beginner`, `cloud-intermediate`, and `cloud-expert`, so local storage and optional account sync use the same progress contract with no database migration. Editor drafts are isolated by path and format in session storage; plans, artifacts, and credentials are not sent to the server.

Cloud curriculum and simulation rules live in `app/cloud/`; focused checks run with `node --test tests/cloud-track.test.mjs`.

## Verification

```bash
npm run lint
npm test
```

The test command builds the production Worker and verifies rendered output, authored curriculum rounds, runtime behavior, and provider boundaries.

## Architecture

Application contracts are provider-neutral:

- `server/repositories/progress-repository.ts`: learner progress, submissions, quotas, deletion, and health.
- `server/repositories/analytics-repository.ts`: privacy-safe events, beta feedback, retention, and owner summaries.
- `server/ai/ai-evaluator.ts`: hosted coaching evaluation.
- `infrastructure/cloudflare/`: D1, Workers AI, runtime bindings, and migration adoption.
- `worker/index.ts`: Cloudflare/vinext entry point.
- `app/`: product UI, curriculum, browser runtimes, and API routes.
- `drizzle/`: versioned SQL migration history.

The current Cloudflare implementation can be replaced by implementing the repository and AI interfaces and changing the composition root. Product UI, curriculum, Clerk authentication, Pyodide, and PGlite remain portable.

## Database commands

```bash
npm run db:generate
npm run db:export
npm run db:restore -- my-d1-database backups/backup.sql --local --confirm-restore
```

Restore requires explicit confirmation. Backups are ignored by Git.

See [docs/PORTABILITY.md](docs/PORTABILITY.md) for services, variables, migration rules, provider boundaries, and production backup/recovery procedures.

## Deployment configuration

`.openai/hosting.json` declares the Sites project and D1 binding. Runtime configuration and secrets belong in the hosting environment, based on `.env.example`; real keys must never be committed.

Set `CODECRAFT_ADMIN_USER_IDS` or `CODECRAFT_ADMIN_EMAILS` to a comma-separated Clerk allowlist before using `/admin/analytics`. The dashboard is protected server-side. Analytics uses predefined first-party events, keeps raw event rows for 90 days, and stores no code, prompts, answers, names, or emails in event records.

During the closed beta only, the owner dashboard can also use the temporary passcode flow documented in [docs/TEMP_ADMIN_ACCESS.md](docs/TEMP_ADMIN_ACCESS.md). Clerk remains the permanent authentication path. The fallback and its secrets must be removed as soon as production Clerk is configured and verified.
