# Amidia AI & Tech — Media Kit & Creator Partnerships Portal

The official YouTube media kit, audience analytics, and brand partnership portal for **Amidia AI & Tech**. Features live channel telemetry, 3D brand integration showcases, gated media kit token access, custom partnership rate cards, and administrator dashboard.

---

## Getting Started

### Prerequisites
- **Node.js**: Version 18.0.0 or higher (Node 20+ recommended)
- **npm**: Version 9.0.0 or higher

### 1. Installation
Install the project dependencies:
```bash
npm install
```

### 2. Local Development
To launch the full-stack development server with live frontend reloading and backend API services:
```bash
npm run dev
```
Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## Production Build & Run

To build the optimized client bundle and backend server for deployment:

```bash
# 1. Compile frontend and bundle backend
npm run build

# 2. Launch production server
npm start
```

The server binds to port `3000` by default, or the port specified in `process.env.PORT`.

---

## Environment Variables & Configuration

No secrets are bundled with the source. Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description | Behaviour when unset |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for AI pitch generation and email extraction | AI endpoints return a clear "not configured" error; email extraction falls back to regex parsing |
| `GEMINI_MODEL` | Gemini model id used by the AI endpoints | `gemini-3.7-flash` |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key for real-time video stats | Served from the built-in fallback video list |
| `YOUTUBE_PLAYLIST_ID` | Uploads playlist fetched for the video grid | Amidia channel uploads playlist |
| `ADMIN_USERNAME` | Username for accessing `/admin` dashboard | `admin` |
| `ADMIN_PASSWORD` | Password for accessing `/admin` dashboard | **Required** — admin login is disabled until it is set |
| `SESSION_SECRET` | Secret key for signing admin session tokens | A random secret is generated per boot (sessions drop on restart) |
| `PORT` | Web server listening port | `3000` |

> Set a strong `ADMIN_PASSWORD` and `SESSION_SECRET` before deploying. Never commit your `.env` file — it is already git-ignored.

---

## Key Portal Routes

- **Public Media Kit**: `http://localhost:3000/` — High-level metrics, video portfolio, audience demographics overview, and sponsorship inquiry form.
- **Brand Partnership Inquiries**: `http://localhost:3000/partners` — Legacy route; redirects to the unified public media kit at `/`.
- **Admin Dashboard**: `http://localhost:3000/admin` — Review partner applications, generate gated 14-day token links, upload demographic screenshots, and configure rate cards.
- **Gated Media Kit**: `http://localhost:3000/kit/:token` — Private access token URL containing locked studio proofs, rate cards, and production requirement terms.

---

## Storage & Reliability
- **Dual Persistence**: The server automatically connects to Firebase Firestore when credentials are present, and seamlessly falls back to persistent JSON storage in `/data/` when running offline or without cloud credentials.
- **Offline Proofing**: If the YouTube or Gemini APIs encounter network delays or rate limits, the portal gracefully falls back to cached channel data and mock generation so that the user interface never errors or crashes.
