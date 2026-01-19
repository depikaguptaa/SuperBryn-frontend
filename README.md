# Voice Agent Frontend

Modern React web app for AI Voice Agent with real-time Beyond Presence avatar and appointment booking.

## Features

- 🎙️ Real-time voice conversation with AI
- 👤 Beyond Presence realistic avatar (with animated fallback)
- 🔧 Live tool call visualization
- 📋 Call summary with conversation details
- 🌙 Premium dark mode UI with glassmorphism
- ✅ Connection state tracking with End Call button

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
├── App.jsx              # Main app with LiveKit + Beyond Presence
├── App.css              # Main styles with glassmorphism
├── components/
│   ├── Avatar.jsx       # Animated fallback avatar
│   ├── Avatar.css
│   ├── ToolCallDisplay.jsx  # Real-time tool visualization
│   ├── ToolCallDisplay.css
│   ├── CallSummary.jsx  # End-of-call summary
│   └── CallSummary.css
└── main.jsx             # Entry point
```

## Avatar Behavior

- **Beyond Presence Available**: Shows realistic, lip-synced avatar video
- **Loading State**: Shows animated avatar with "Loading AI Avatar..." text
- **Fallback**: Animated avatar that pulses when speaking

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables:
   - `VITE_TOKEN_SERVER_URL` = Your Render backend URL (e.g., `https://voice-agent-backend.onrender.com`)
4. Deploy!

## License

MIT
