# Quote Collector

A mobile-friendly collection game where users visit physical locations, scan QR codes, and collect inspiring quotes. Perfect for treasure hunts, educational tours, or team-building events.

## Features

- Mobile-first design for scanning QR codes on phones
- Username-based registration per device
- Cross-device collections stored in a shared database
- Admin dashboard for live progress
- Progress tracking with completion stats
- Next.js frontend + API layer (Vercel-ready)

## How It Works

1. Users register with a username on their first visit
2. Scan QR codes at different physical locations
3. Collect a quote at each location
4. View your collection and remaining locations
5. Admin tracks collections in the dashboard

## Project Structure

```
app/
  db/
    schema.sql         # Neon schema
  public/
    data/
      questions.json   # Collectibles database
  src/
    app/               # Next.js app routes + API
    services/          # Client data helpers
```

## Setup

### Local Development

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### Environment

Copy `app/.env.example` to `app/.env` and set:

- `DATABASE_URL` (Neon connection string)
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

### Database Setup

Run the SQL in `app/db/schema.sql` against your Neon database.

## Customizing Collectibles

Edit `app/public/data/questions.json` to add your own locations and collectibles.

Note: Location IDs use GUIDs to prevent users from guessing URLs. Generate new GUIDs for each location using an online generator or your programming language's UUID library.

## Generating QR Codes

For each location, create a QR code pointing to:

```
https://your-site.example.com/location?id=a7b3d8e2-4f1c-9a6b-3e5d-8c2f1a9b7e4d
```

You can use any QR code generator like:
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)

## Data Storage

Collections and users are stored in Neon (Postgres), which means:
- Users on different devices contribute to the same dataset
- The admin dashboard aggregates results across devices

Usernames are still stored locally per device for a lightweight sign-in. If you need real authentication, add a user identity provider and lock down admin access.

## License

MIT
