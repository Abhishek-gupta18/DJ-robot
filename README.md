# 🤖 Robot DJ

**Your playlist. A shuffled set. A robot on the decks.**

Robot DJ is a browser based music player with an animated 3D DJ scene. Load a YouTube playlist, hit play, and let the robot mix through the tracks in shuffle order.

⚡ **No API key required** - Just paste a YouTube playlist URL and start mixing. Videos must allow embedding (private videos with embedding enabled can play).

## ✨ What's inside

- 🎧 Shuffled playback from a YouTube playlist
- 🪩 Animated 3D robot DJ and deck scene
- 🎛️ Simple keyboard controls for playback
- ⚡ Built with React, TypeScript, Vite, and Three.js

## 🚀 Get started

**Requirements:** Node.js and npm

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open the local URL printed in your terminal (usually [http://localhost:5173](http://localhost:5173)).

## 🎵 Load a playlist

1. Open Robot DJ in your browser.
2. Select **Load Playlist**.
3. Paste a YouTube playlist URL, such as:
   - `https://www.youtube.com/playlist?list=PLxxx`
   - `https://youtube.com/playlist?list=PLxxx`
   - `https://youtu.be/playlist?list=PLxxx`
   - `https://www.youtube.com/watch?v=ESQLR69wdms&list=RDEM5-vO2zQHTHdDS3Q-8I5B0g` (default)
4. Select **Load Playlist**, then **Start the set**.

⚡ **No API key needed** - Paste any YouTube playlist URL and start mixing. Videos must allow embedding (check video settings; private videos with embedding enabled can play).

💡 **Default playlist** - The app loads `RDEM5-vO2zQHTHdDS3Q-8I5B0g` automatically on startup.

## ⌨️ Controls

| Key | Action |
|:---:|---|
| `Space` | Play or pause |
| `→` or `N` | Skip to the next track |
| `M` | Mute or unmute |

## 🏗️ Production build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

The build output is written to `dist/`.

## 🧰 Built with

React 18 · TypeScript · Vite · Three.js · React Three Fiber · Framer Motion · Tailwind CSS v4 · YouTube IFrame Player API