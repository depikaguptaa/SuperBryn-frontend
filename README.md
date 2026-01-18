# Voice Agent Frontend

Modern React web app for AI Voice Agent with real-time avatar and appointment booking.

## Features

- 🎙️ Real-time voice conversation with AI
- 👤 Animated avatar (with Beyond Presence integration)
- 🔧 Live tool call visualization
- 📋 Call summary with cost breakdown
- 🌙 Premium dark mode UI

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your token server URL:
```
VITE_TOKEN_SERVER_URL=http://localhost:8080
```

Optional: Add Beyond Presence API key for realistic avatar:
```
VITE_BEYOND_PRESENCE_API_KEY=your_key
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── App.jsx              # Main app with LiveKit integration
├── App.css              # Main styles
├── components/
│   ├── Avatar.jsx       # Avatar with Beyond Presence fallback
│   ├── Avatar.css
│   ├── ToolCallDisplay.jsx  # Real-time tool visualization
│   ├── ToolCallDisplay.css
│   ├── CallSummary.jsx  # End-of-call summary
│   └── CallSummary.css
└── main.jsx             # Entry point
```

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables:
   - `VITE_TOKEN_SERVER_URL` = Backend URL
   - `VITE_BEYOND_PRESENCE_API_KEY` = Beyond Presence key
4. Deploy!

## License

MIT
