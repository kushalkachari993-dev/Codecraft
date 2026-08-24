# CodeCraft portability and operations

CodeCraft uses application ports for persistence and hosted AI evaluation. The current implementations live under `infrastructure/cloudflare/`; curriculum, UI, browser-based Python/SQL runtimes, and application routes do not depend on D1 query APIs or Workers AI request formats.

## Required services

| Capability | Current provider | Required configuration |
| --- | --- | --- |
| Web and API runtime | Cloudflare Worker through Sites/vinext | `.openai/hosting.json` and the `DB` binding |
| Authentication | Clerk | publishable and secret keys |
| Learner persistence | Cloudflare D1 | binding named `DB` |
| Hosted GenAI coaching | Workers AI (optional) | binding named `AI` |
| Python labs | Pyodide in the browser | runtime assets produced during build |
| SQL labs | PGlite in the browser | no hosted database required for lab execution |

Without the `AI` binding, GenAI labs keep deterministic rubric feedback and do not consume daily model reviews.

## Environment variables

Copy `.env.example` to an ignored local environment file. Never commit real keys.

- `VITE_CLERK_PUBLISHABLE_KEY`: public Clerk publishable key.
- `CLERK_SECRET_KEY`: server-only Clerk secret.
- `CODECRAFT_AI_MODEL`: hosted evaluator model identifier.
- `CODECRAFT_AI_REVIEW_DAILY_LIMIT`: per-account UTC daily review limit; default `3`.
- `CODECRAFT_GENAI_REQUESTS_PER_MINUTE`: per-IP Worker throttle; default `12`.
- `CODECRAFT_D1_DATABASE`: Wrangler database name used only by backup and restore commands.

The `DB` and optional `AI` values are runtime bindings, not secrets stored in source.

## Provider boundaries

- `server/repositories/progress-repository.ts` defines persistence behavior.
- `server/ai/ai-evaluator.ts` defines hosted model evaluation.
- `infrastructure/cloudflare/d1-progress-repository.ts` contains all D1 queries.
- `infrastructure/cloudflare/workers-ai-evaluator.ts` contains the Workers AI payload.
- `infrastructure/cloudflare/runtime.ts` is the route composition root.
- `worker/index.ts` is the Cloudflare entry point and composes the same adapters.

To migrate providers, implement the two server interfaces and change only the composition root/entry point. API response formats should stay unchanged.

## Versioned migrations

Reviewed SQL history is stored in `drizzle/` and tracked by `drizzle/meta/_journal.json`. Generate a new migration after editing `db/schema.ts`:

```bash
npm run db:generate
```

The Cloudflare adapter safely adopts existing deployments through the matching ordered migration manifest in `infrastructure/cloudflare/migrations.ts`. Every schema change must update the Drizzle SQL history and the runtime manifest in the same pull request. Migrations must be additive or include an explicit rollback/recovery procedure.

## Backup and recovery

Create a timestamped remote backup:

```bash
npm run db:export
```

Override the database or destination:

```bash
npm run db:export -- my-d1-database backups/before-release.sql
```

Test recovery locally before touching production:

```bash
npm run db:restore -- my-d1-database backups/before-release.sql --local --confirm-restore
```

A remote restore requires the same explicit confirmation flag:

```bash
npm run db:restore -- my-d1-database backups/before-release.sql --confirm-restore
```

The restore command changes database state. Verify the resolved database name and backup file before confirming it. Backup files are ignored by Git.
