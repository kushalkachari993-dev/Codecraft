# Temporary owner access

The `/admin/analytics` passcode is a closed-beta fallback only. It does not replace Clerk and does not grant learner account access.

## Hosting secrets

- `CODECRAFT_TEMP_ADMIN_PASSCODE`: a random owner-only passcode with at least 16 characters.
- `CODECRAFT_TEMP_ADMIN_SESSION_SECRET`: a random signing secret with at least 32 characters.

The login route validates same-origin requests, rate-limits failed attempts, and creates an eight-hour signed `HttpOnly`, `SameSite=Strict` cookie. Neither secret belongs in source control, browser storage, URLs, analytics, or logs.

## Mandatory removal checkpoint

Remove the fallback immediately after the production Clerk custom domain and production `pk_live` / `sk_live` credentials have been verified on the public site:

1. Verify owner sign-in and the server-side Clerk admin allowlist on `/admin/analytics`.
2. Delete `app/api/admin/session/route.ts` and `server/temporary-admin-session.ts`.
3. Remove temporary-cookie authorization and the passcode form from the analytics endpoint and page.
4. Delete `CODECRAFT_TEMP_ADMIN_PASSCODE` and `CODECRAFT_TEMP_ADMIN_SESSION_SECRET` from every hosting environment.
5. Remove the temporary variables from `server/config.ts` and `.env.example`, update tests, and publish.

This checklist is the persistent reminder; do not carry the fallback into general availability.
