# Quote Collector

A mobile-friendly collection game where users visit physical locations, scan QR codes, and collect inspiring quotes. Perfect for treasure hunts, educational tours, or team-building events.

## Features

- Mobile-first design for scanning QR codes on phones
- User tracking by username on each device
- Collect unique quotes at physical locations
- View your collection and remaining locations
- Admin dashboard to see all collections
- Progress tracking with a completion bar
- Static hosting on GitHub Pages

## How It Works

1. Users register with a username on their first visit
2. Scan QR codes at different physical locations
3. Collect a quote at each location
4. View your collection and remaining locations
5. Admin tracks collections in the dashboard

## Project Structure

```
app/
  public/
    data/
      questions.json  # Collectibles database
  src/
    pages/            # App pages
    services/         # Firebase + storage helpers
docs/                 # Build output (GitHub Pages)
```

## Setup

### Local Development

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### Firebase Configuration

This app uses Firebase Firestore for cross-device collections. Create a Firebase project and add these build-time variables (they are public, not secrets):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

You can set them locally in an `.env` file inside `app/` and in GitHub Actions secrets or variables for deployment.

### Admin Password

Set the `ADMIN_PASSWORD` GitHub secret. It is embedded into the client bundle at build time, so treat it as a lightweight gate rather than secure authentication.

### Deploy to GitHub Pages

1. Push the code to GitHub
2. Go to **Settings** -> **Pages**
3. Set **Source** to "GitHub Actions"
4. Ensure the `Deploy to GitHub Pages` workflow runs on `main`

Your site will be available at `https://your-username.github.io/your-repo-name/`

## Customizing Collectibles

Edit `app/public/data/questions.json` to add your own locations and collectibles:

```json
{
  "gameTitle": "Quote Collector",
  "gameDescription": "Visit all locations to collect inspiring quotes!",
  "locations": {
    "a7b3d8e2-4f1c-9a6b-3e5d-8c2f1a9b7e4d": {
      "name": "Park Entrance",
      "icon": "??",
      "collectible": {
        "id": "quote1",
        "type": "quote",
        "title": "The Journey Begins",
        "content": "The journey of a thousand miles begins with a single step.",
        "author": "Lao Tzu"
      }
    }
  }
}
```

Note: Location IDs use GUIDs to prevent users from guessing URLs. Generate new GUIDs for each location using an online generator or your programming language's UUID library.

## Generating QR Codes

For each location, create a QR code pointing to:

```
https://your-site.github.io/your-repo/#/location?id=a7b3d8e2-4f1c-9a6b-3e5d-8c2f1a9b7e4d
```

You can use any QR code generator like:
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)

## Data Storage

Collections are stored in Firebase Firestore, which means:
- Users on different devices contribute to the same dataset
- The admin dashboard aggregates results across devices

Usernames are still stored locally per device for a lightweight sign-in. If you need real authentication, add Firebase Auth and lock down Firestore rules.

## License

MIT
