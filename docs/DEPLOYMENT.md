# Deployment

## Where things run

| Part | Service | Deploys from |
| --- | --- | --- |
| Backend (Flask API) | Railway | `main` |
| Database | PostgreSQL on Railway | n/a |
| Frontend (React/Vite) | Vercel | `main` |
| Payments | Moyasar (sandbox keys) | n/a |
| Maps | TomTom | n/a |

## Release flow

1. Create a branch from `development` (`feature/...`, `fix/...`, `test/...`).
2. Open a Pull Request into `development`. GitHub Actions runs the backend
   tests and the frontend lint and build. Merge only when it is green.
3. When `development` is ready, open a Release Pull Request
   `development` into `main` and merge with a merge commit.
4. Railway and Vercel deploy `main` automatically.
5. Check the Railway Deployments tab and the Vercel Deployments tab, then open
   the live site in a private window.

Test-only changes do not need a Release.

## Backend environment variables (Railway, Variables tab)

`DATABASE_URL`, `JWT_SECRET` (32+ random characters, never committed),
`ALLOWED_ORIGINS` (must include the Vercel frontend URL),
`MOYASAR_SECRET_KEY`, `MOYASAR_PUBLISHABLE_KEY`, `MOYASAR_WEBHOOK_SECRET`,
`BREVO_API_KEY`, `EMAIL_FROM`.

If a Moyasar variable is missing the webhook answers 503 on purpose.

## Frontend environment variables (Vercel, Environment Variables)

`VITE_API_BASE_URL` (the Railway URL) and `VITE_TOMTOM_API_KEY`.
Variables starting with `VITE_` are public in the browser, so the TomTom key
is restricted to our domains in the TomTom dashboard.

## Database migrations

SQL files in `backend/migrations/` (`001` to `007`) are applied in order on
the Railway database. Check with:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

## Moyasar webhook

In the Moyasar dashboard set the webhook URL to
`https://<railway-url>/api/webhooks/moyasar` with the same secret token as
`MOYASAR_WEBHOOK_SECRET`.