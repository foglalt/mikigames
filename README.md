# QR Quiz Game 🎮

A mobile-friendly quiz game where users visit physical locations, scan QR codes, and answer questions. Perfect for treasure hunts, educational tours, or team-building events.

## Features

- **📱 Mobile-First Design** - Optimized for scanning QR codes on phones
- **👤 User Tracking** - Remember users by username on each device
- **❓ Random Questions** - Each location shows a random question from its pool
- **🔐 Admin Dashboard** - Track which users visited which locations
- **📊 Statistics** - View correct answer rates and user progress
- **🚀 Static Hosting** - Deploy easily on GitHub Pages

## How It Works

1. **Users register** with a username on their first visit
2. **Scan QR codes** at different physical locations
3. **Answer questions** - each location has its own question pool
4. **Admin tracks** all visits and answers in the dashboard

## Project Structure

```
docs/
├── index.html          # User registration & home
├── location.html       # Question page (accessed via QR)
├── admin.html          # Admin dashboard
├── css/
│   └── style.css       # Styling
├── data/
│   └── questions.json  # Questions database
└── js/
    ├── app.js          # Registration logic
    ├── location.js     # Question display logic
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

## Customizing Questions

Edit `docs/data/questions.json` to add your own locations and questions:

```json
{
  "locations": {
    "a7b3d8e2-4f1c-9a6b-3e5d-8c2f1a9b7e4d": {
      "name": "Your Location Name",
      "questions": [
        {
          "id": "q1",
          "question": "Your question here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0
        }
      ]
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
- Admin can only see visits from the same device

For cross-device tracking, you would need to integrate with a backend service like Firebase Realtime Database (the structure is already prepared in `firebase.js`).

## License

MIT
