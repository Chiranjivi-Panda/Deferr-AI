# 🚀 Last-Minute Life Saver

**An AI productivity companion that doesn't just remind you about deadlines — it takes the first real step to clear them for you, and shows you why.**

Built with React, Express, TypeScript, and Google Gemini AI.

---

## Prerequisites

Before you start, make sure you have these installed:

| Tool | Version | How to check |
|---|---|---|
| **Node.js** | 18 or higher | `node --version` |
| **npm** | 9 or higher (comes with Node) | `npm --version` |

> 💡 **Don't have Node.js?** Download it free from [nodejs.org](https://nodejs.org). Pick the LTS version.

---

## Getting a Free Gemini API Key

The AI features use Google's Gemini API (free tier — no credit card needed).

1. Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
2. Sign in with any Google account
3. Click **"Create API Key"**
4. Select or create a Google Cloud project when prompted
5. Copy the key — you'll paste it in the next step

> ⚠️ **Keep your key secret.** Never commit it to git or share it publicly.

---

## Setup (One-Time)

```bash
# 1. Clone or navigate to the project
cd last-minute-lifesaver

# 2. Create your .env file from the template
cp .env.example .env

# 3. Open .env in your editor and paste your Gemini API key
#    Replace "your_gemini_api_key_here" with your actual key

# 4. Install server dependencies
cd server
npm install

# 5. Install client dependencies
cd ../client
npm install
```

---

## Running Locally

You need **two terminals** — one for the backend, one for the frontend.

### Terminal 1: Start the Backend

```bash
cd server
npm run dev
```

You should see:

```
🚀 Server running on http://localhost:3001
📅 Mock calendar seeded with 10 events
✅ Gemini AI connected
```

### Terminal 2: Start the Frontend

```bash
cd client
npm run dev
```

You should see:

```
  VITE v6.x.x  ready in XXms

  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser (Chrome recommended for voice features in Phase 3).

---

## Verifying It Works

After both servers are running, check these endpoints:

| Endpoint | What it does | Expected result |
|---|---|---|
| `http://localhost:5173` | Frontend app | Styled placeholder page with aurora background |
| `http://localhost:3001/api/health` | Server health check | `{ "status": "ok", ... }` |
| `http://localhost:3001/api/test-gemini` | Gemini API test | `{ "success": true, "response": "..." }` |
| `http://localhost:3001/api/calendar/events` | Mock calendar events | JSON array of 10 seeded events |

---

## Project Structure

```
last-minute-lifesaver/
├── .env.example          # Environment variable template
├── .gitignore            # Git ignore rules
├── README.md             # You are here
├── server/               # Express backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── index.ts              # Server entry point
│   │   ├── config.ts             # All configuration constants
│   │   ├── types/                # TypeScript type definitions
│   │   ├── routes/               # API route handlers
│   │   ├── services/             # Business logic (Gemini, ranking)
│   │   ├── calendar/             # Calendar adapter pattern
│   │   ├── store/                # JSON file-based storage
│   │   └── middleware/           # Error handling
│   └── data/                     # Runtime JSON files (git-ignored)
└── client/               # React frontend (Vite + Tailwind v4)
    ├── src/
    │   ├── App.tsx               # Main app component
    │   ├── index.css             # Tailwind + custom styles
    │   ├── components/ui/        # Reusable UI primitives
    │   ├── hooks/                # Custom React hooks
    │   ├── pages/                # Page components
    │   ├── lib/                  # Utilities (API client)
    │   └── types/                # Frontend type definitions
    └── public/                   # Static assets
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite + TypeScript | Fast dev experience, type safety |
| Styling | Tailwind CSS v4 + Framer Motion | Utility-first CSS, smooth animations |
| Backend | Express + TypeScript | Simple, well-documented, beginner-friendly |
| AI | Google Gemini (`gemini-2.5-flash`) | Free tier, fast, good at structured output |
| Storage | File-based JSON (lowdb-style) | Zero setup, no database server needed |
| Calendar | Adapter pattern (mock/Google) | Works offline, extensible |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Your Google Gemini API key |
| `CALENDAR_PROVIDER` | No | `mock` | `mock` or `google` |
| `SERVER_PORT` | No | `3001` | Backend server port |

---

## Troubleshooting

### "Port 3001 is already in use"

Something else is using port 3001. Either:

- **Option A:** Kill the other process:
  ```bash
  # On Windows (PowerShell)
  netstat -ano | findstr :3001
  taskkill /PID <the_PID_number> /F

  # On Mac/Linux
  lsof -i :3001
  kill -9 <the_PID_number>
  ```
- **Option B:** Use a different port — edit `.env` and set `SERVER_PORT=3002`

Same fix applies if Vite says port 5173 is busy (Vite will usually auto-pick the next port).

### "GEMINI_API_KEY is not set" / Gemini test returns an error

1. Make sure you have a `.env` file in the project **root** (not inside `server/` or `client/`)
2. Make sure it contains: `GEMINI_API_KEY=your_actual_key_here` (no quotes around the key)
3. Restart the server after editing `.env`
4. If you still get errors, verify your key works at [aistudio.google.com](https://aistudio.google.com)

> 💡 The app still works without a valid Gemini key — AI features will return
> errors but the mock calendar and basic UI will function normally.

### CORS errors in the browser console

If you see `Access-Control-Allow-Origin` errors:

1. Make sure the **backend** is running on port 3001 (`cd server && npm run dev`)
2. Make sure the **frontend** is running on port 5173 (`cd client && npm run dev`)
3. The Vite dev server proxies `/api/*` requests to the backend automatically,
   so you should not see CORS errors during normal use
4. If testing the API directly (e.g., from a different origin), the server
   allows requests from `http://localhost:5173` by default

### "Module not found" or dependency errors

```bash
# Delete node_modules and reinstall in both directories
cd server && rm -rf node_modules && npm install
cd ../client && rm -rf node_modules && npm install
```

On Windows PowerShell, use `Remove-Item -Recurse -Force node_modules` instead of `rm -rf`.

### TypeScript errors during development

These are warnings, not blockers — the app still runs because we use `tsx` (server)
and Vite (client) which transpile TypeScript without strict type checking at runtime.
Fix them if you want cleaner code, but they won't stop the demo from working.

---

## What's Next

This is **Phase 0** — the foundation. Upcoming phases:

- **Phase 1:** Task input → Gemini parse → deterministic ranking → dashboard UI
- **Phase 2:** Calendar view + at-risk detection + proposal + Apply
- **Phase 3:** Voice input + visual polish + reasoning trail
- **Phase 4:** Impact strip + optional Google Calendar integration
