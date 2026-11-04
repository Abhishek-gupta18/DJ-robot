# Robot DJ - Abhishek-gupta18

A shuffled, audio-only music player with a 3D robot DJ visualization. Paste a YouTube playlist URL and let the bot take the decks.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** (or the port shown in terminal).

## How to Use

1. **Open the app** in your browser
2. **Click "Load Playlist"** button at the bottom
3. **Paste a YouTube playlist URL** — formats that work:
   - `https://www.youtube.com/playlist?list=PLxxx`
   - `https://youtube.com/playlist?list=PLxxx`
   - `https://youtu.be/playlist?list=PLxxx`
4. **Click "Load Playlist"** — the page will reload with your playlist loaded
5. **Click "Start the set"** — the robot DJ starts playing shuffled tracks

## Requirements for YouTube Playlists

- Playlist must be **Public** or **Unlisted**
- Videos must allow **embedding** (Creator → Video details → Allow embedding)
- Private playlists or videos with embedding disabled won't play

## Controls

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| → or N | Next track |
| M | Mute / Unmute |

## Build for Production

```bash
npm run build
```

Output in `dist/` folder.

## Tech Stack

- React 18 + TypeScript + Vite
- Three.js / React Three Fiber for 3D scene
- Framer Motion for animations
- Tailwind CSS v4 for styling
- YouTube IFrame Player API for audio