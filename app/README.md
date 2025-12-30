# Quote Collector App

This is the Next.js frontend and API layer for the QR-based collection game. The full project overview lives in the repo root `README.md`.

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment

Copy `app/.env.example` to `app/.env` and fill in:

- `DATABASE_URL` (Neon connection string)
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET` (random string to sign admin session cookies)

## Database Setup

Run the SQL in `app/db/schema.sql` against your Neon database.

## Build Output

`npm run build` creates the production Next.js build for Vercel.
