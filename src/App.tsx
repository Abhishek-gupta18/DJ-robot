import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePlayer } from './hooks/usePlayer';
import { HiddenYouTube } from './components/HiddenYouTube';
import { StartOverlay } from './components/StartOverlay';
import { Dock, TopBar } from './components/Hud';
import { Stage } from './scene/Stage';
import { kick, scene, type RobotMode } from './scene/state';
import { SPOTIFY_PLAYLIST_ID, type CustomQueue } from './data/playlist';

function getCustomQueue(): CustomQueue | undefined {
  const tracksParam = new URLSearchParams(window.location.search).get('spotify_tracks');
  const playlistId = SPOTIFY_PLAYLIST_ID;
  if (tracksParam && playlistId) {
    return {
      videoIds: tracksParam.split(',').filter(Boolean),
      source: 'spotify',
      name: `Spotify Playlist (${playlistId})`,
    };
  }
  return undefined;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem('robot-dj-theme') === 'dark');
  const mountRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const customQueue = getCustomQueue();
  const player = usePlayer(mountRef, customQueue);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    window.localStorage.setItem('robot-dj-theme', darkMode ? 'dark' : 'light');
    scene.darkMode = darkMode;
  }, [darkMode]);

  useEffect(() => {
    let mode: RobotMode = 'idle';
    if (player.started) {
      if (player.status === 'playing') mode = 'playing';
      else if (player.status === 'buffering') mode = 'buffering';
      else mode = 'paused';
    }
    scene.mode = mode;
    scene.started = player.started;
    scene.loading = player.status === 'loading' || player.status === 'loading-spotify';
    scene.error = player.status === 'error';
    scene.accent = player.accent;
    scene.trackChangedAt = player.trackChangedAt;
  }, [player.started, player.status, player.accent, player.trackChangedAt]);

  // Per-frame bridge back to the DOM without re-renders: track progress and a beat pulse as CSS vars.
  const { getCurrentTime, getDuration } = player;
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const duration = getDuration();
      scene.progress = duration > 0 ? Math.min(1, getCurrentTime() / duration) : 0;
      const el = mainRef.current;
      if (el) {
        el.style.setProperty('--progress', scene.progress.toFixed(4));
        el.style.setProperty('--beat', (kick(scene.beat, 5) * scene.energy * (scene.reducedMotion ? 0 : 1)).toFixed(3));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [getCurrentTime, getDuration]);

  // Keyboard: space = play/pause, → or N = next, M = mute.
  const { started, toggle, next, toggleMute } = player;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'BUTTON') return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') next();
      else if (e.key.toLowerCase() === 'm') toggleMute();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, toggle, next, toggleMute]);

  return (
    <main ref={mainRef} data-accent={player.accent} className="relative h-dvh w-full overflow-hidden">
      <Stage darkMode={darkMode} />
      <TopBar player={player} darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />
      <AnimatePresence>{!player.started && <StartOverlay key="start" player={player} />}</AnimatePresence>
      {player.started && <Dock player={player} />}
      <HiddenYouTube ref={mountRef} />
    </main>
  );
}
