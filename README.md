# CodeCraft

CodeCraft is a game-inspired learning platform with Python, SQL, and GenAI tracks. Lessons, examples, assessments, browser-based code labs, saved progress, profiles, and optional hosted AI coaching are delivered through a vinext/React application.

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
