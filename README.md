# Quote Collector 📚

A mobile-friendly collection game where users visit physical locations, scan QR codes, and collect inspiring quotes. Perfect for treasure hunts, educational tours, or team-building events.

## Features

- **📱 Mobile-First Design** - Optimized for scanning QR codes on phones
- **👤 User Tracking** - Remember users by username on each device
- **✨ Collect Items** - Each location has a unique quote to collect
- **📖 View Collection** - Users can see their collected items and remaining locations
- **🔐 Admin Dashboard** - Track which users collected which items
- **📊 Progress Tracking** - Visual progress bar shows collection completion
- **🚀 Static Hosting** - Deploy easily on GitHub Pages

## How It Works

1. **Users register** with a username on their first visit
2. **Scan QR codes** at different physical locations
3. **Collect quotes** - each location has a unique quote
4. **View collection** - see all collected quotes and remaining locations
5. **Admin tracks** all collections in the dashboard

## Project Structure

```
docs/
├── index.html          # User registration & home
├── location.html       # Collection page (accessed via QR)
├── collection.html     # User's collection view
├── admin.html          # Admin dashboard
├── css/
│   └── style.css       # Styling
├── data/
│   └── questions.json  # Collectibles database
└── js/
    ├── app.js          # Registration logic
    ├── location.js     # Collection logic
    ├── collection.js   # Collection view logic
    ├── admin.js        # Admin dashboard logic
    └── firebase.js     # Data storage (localStorage)
```

## Setup

### Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### Deploy to GitHub Pages

1. Push the code to GitHub
2. Go to **Settings** → **Pages**
3. Set **Source** to "Deploy from a branch"
4. Select `main` branch and `/docs` folder
5. Click **Save**

Your site will be available at `https://your-username.github.io/your-repo-name/`

## Customizing Collectibles

Edit `docs/data/questions.json` to add your own locations and collectibles:

```json
{
  "gameTitle": "Quote Collector",
  "gameDescription": "Visit all locations to collect inspiring quotes!",
  "locations": {
    "a7b3d8e2-4f1c-9a6b-3e5d-8c2f1a9b7e4d": {
      "name": "Park Entrance",
      "icon": "🌳",
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

**Note:** Location IDs use GUIDs to prevent users from guessing URLs. Generate new GUIDs for each location using an online generator or your programming language's UUID library.

## Generating QR Codes

For each location, create a QR code pointing to:

```
https://your-site.github.io/your-repo/location.html?id=a7b3d8e2-4f1c-9a6b-3e5d-8c2f1a9b7e4d
```

You can use any QR code generator like:
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)

## Data Storage

Currently, the app uses **localStorage** for data storage, which means:
- User data persists on each device
- Admin can only see collections from the same device

For cross-device tracking, you would need to integrate with a backend service like Firebase Realtime Database (the structure is already prepared in `firebase.js`).

## License

MIT
