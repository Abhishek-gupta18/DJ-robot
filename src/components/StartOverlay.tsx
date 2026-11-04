import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { PlayerApi } from '../hooks/usePlayer';
import { ArrowRight, SpotifyIcon, YouTubeIcon } from './Icons';
import { 
  fetchPlaylistTracks, 
  searchYouTubeBatch, 
  hasSpotifyCredentials, 
  hasYouTubeApiKey, 
  clearTokenCache 
} from '../lib/spotify';
import { detectPlaylistType, extractPlaylistId, getPlaceholderForType, type PlaylistType } from '../lib/playlist-detector';

const EASE = [0.2, 0.8, 0.2, 1] as const;

const card: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.3, staggerChildren: 0.08, delayChildren: 0.45 } },
  exit: { opacity: 0, y: 32, scale: 0.97, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

const credentialsConfigured = hasSpotifyCredentials();
const youtubeConfigured = hasYouTubeApiKey();

function getPlaylistIcon(type: PlaylistType) {
  switch (type) {
    case 'spotify':
      return <SpotifyIcon className="text-green-500" />;
    case 'youtube':
      return <YouTubeIcon className="text-red-500" />;
    default:
      return null;
  }
}

export function StartOverlay({ player }: { player: PlayerApi }) {
  const loading = player.status === 'loading' || player.status === 'loading-spotify';
  const failed = player.status === 'error';
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [showPlaylistInput, setShowPlaylistInput] = useState(false);
  const [detectedType, setDetectedType] = useState<PlaylistType>('unknown');

  const handlePlaylistUrlChange = (url: string) => {
    setPlaylistUrl(url);
    setDetectedType(detectPlaylistType(url));
    setPlaylistError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim() || playlistLoading) return;

    const type = detectPlaylistType(playlistUrl);
    const playlistId = extractPlaylistId(playlistUrl, type);
    
    if (!playlistId) {
      setPlaylistError(`Invalid ${type === 'spotify' ? 'Spotify' : 'YouTube'} playlist URL`);
      return;
    }

    // For Spotify: need both Spotify creds and YouTube API key
    if (type === 'spotify') {
      if (!credentialsConfigured) {
        setPlaylistError('Spotify credentials not configured. Add VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET to .env');
        return;
      }
      if (!youtubeConfigured) {
        setPlaylistError('YouTube API key not configured. Add VITE_YOUTUBE_API_KEY to .env');
        return;
      }
    }

    setPlaylistLoading(true);
    setPlaylistError(null);

    try {
      let videoIds: string[] = [];

      if (type === 'spotify') {
        // Spotify: fetch tracks, search YouTube for each
        const tracks = await fetchPlaylistTracks(playlistId);
        if (!tracks.length) {
          setPlaylistError('No tracks found in playlist');
          return;
        }

        const queries = tracks.map((t) => `${t.name} ${t.artists.map((a) => a.name).join(' ')} audio`);
        const results = await searchYouTubeBatch(queries);
        videoIds = results.filter((id): id is string => id !== null);

        if (!videoIds.length) {
          setPlaylistError('Could not find matching YouTube videos for playlist tracks');
          return;
        }
      } else if (type === 'youtube') {
        // YouTube: use playlist directly (handled by existing logic via URL param)
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('list', playlistId);
        newUrl.searchParams.delete('spotify');
        newUrl.searchParams.delete('spotify_tracks');
        window.history.replaceState({}, '', newUrl);
        window.location.reload();
        return;
      }

      // For Spotify: store video IDs and reload
      if (videoIds.length) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('spotify', playlistId);
        newUrl.searchParams.set('spotify_tracks', videoIds.join(','));
        window.history.replaceState({}, '', newUrl);
        window.location.reload();
      }
    } catch (err) {
      setPlaylistError(err instanceof Error ? err.message : 'Failed to load playlist');
    } finally {
      setPlaylistLoading(false);
    }
  };

  const storedTracks = new URLSearchParams(window.location.search).get('spotify_tracks');
  const storedYouTubeList = new URLSearchParams(window.location.search).get('list');
  const hasCustomQueue = !!storedTracks;
  const hasYouTubeQueue = !!storedYouTubeList;

  return (
    <motion.section
      className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      variants={card}
      initial="hidden"
      animate="show"
      exit="exit"
      aria-labelledby="start-title"
    >
      <div
        className="w-full max-w-[32rem] rounded-[1.5rem] border p-5 sm:p-6"
        style={{ background: 'rgba(255, 255, 255, 0.78)', borderColor: 'var(--border-subtle)', backdropFilter: 'blur(12px)' }}
      >
        <motion.p variants={item} className="eyebrow" style={{ color: 'var(--accent-halftone)' }}>
          {'// press play'}
        </motion.p>
        <motion.h1
          variants={item}
          id="start-title"
          className="mt-3 font-display font-bold"
          style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.15rem)', lineHeight: 1.2 }}
        >
          Robot DJ is warming up
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-2 hidden max-w-[60ch] text-muted min-[400px]:block"
          style={{ fontSize: 'clamp(0.98rem, 1.4vw, 1.1rem)', lineHeight: 1.6, textWrap: 'pretty' }}
        >
          A shuffled, audio-only set from Abhishek-gupta18. Hit start and let the bot take the decks.
        </motion.p>

        <motion.div variants={item} className="mt-4 border-t border-dashed pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
          {failed ? (
            <p className="font-mono text-sm" style={{ color: 'var(--halftone-red)' }}>
              {`// ${player.error}`}
            </p>
          ) : !credentialsConfigured || !youtubeConfigured ? (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                Spotify integration requires API keys. Add to <code className="font-mono">.env</code>:
              </p>
              <ul className="text-sm text-muted space-y-1 pl-4 list-disc">
                {!credentialsConfigured && (
                  <li><code className="font-mono">VITE_SPOTIFY_CLIENT_ID</code> & <code className="font-mono">VITE_SPOTIFY_CLIENT_SECRET</code> (from <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener" className="underline">Spotify Developer Dashboard</a>)</li>
                )}
                {!youtubeConfigured && (
                  <li><code className="font-mono">VITE_YOUTUBE_API_KEY</code> (from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" className="underline">Google Cloud Console</a>)</li>
                )}
              </ul>
              <p className="text-xs text-muted">YouTube playlists work without extra keys. Copy <code className="font-mono">.env.example</code> to <code className="font-mono">.env</code> and fill in your keys.</p>
            </div>
          ) : showPlaylistInput ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                {getPlaylistIcon(detectedType)}
                <span className="font-mono text-sm" style={{ color: detectedType === 'spotify' ? 'var(--green-500)' : detectedType === 'youtube' ? 'var(--red-500)' : 'var(--accent-halftone)' }}>
                  {detectedType === 'spotify' ? 'Spotify Playlist' : detectedType === 'youtube' ? 'YouTube Playlist' : 'Playlist'}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder={getPlaceholderForType(detectedType)}
                  value={playlistUrl}
                  onChange={(e) => handlePlaylistUrlChange(e.target.value)}
                  className="input flex-1"
                  required
                  disabled={playlistLoading}
                  autoFocus
                />
                <motion.button
                  type="submit"
                  className="btn-primary px-4 py-2 whitespace-nowrap"
                  disabled={playlistLoading || !playlistUrl.trim()}
                  whileTap={{ scale: 0.98 }}
                >
                  {playlistLoading ? 'Loading…' : 'Load Playlist'}
                </motion.button>
              </div>
              {playlistError && (
                <p className="font-mono text-sm" style={{ color: 'var(--halftone-red)' }}>
                  {`// ${playlistError}`}
                </p>
              )}
              <motion.button
                type="button"
                onClick={() => {
                  setShowPlaylistInput(false);
                  setPlaylistUrl('');
                  setPlaylistError(null);
                  setDetectedType('unknown');
                }}
                className="text-sm text-muted hover:underline"
                whileTap={{ scale: 0.98 }}
              >
                Use default playlist instead
              </motion.button>
            </form>
          ) : hasCustomQueue ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-green-600">
                <SpotifyIcon />
                <span className="font-mono text-sm">Custom Spotify Playlist Loaded</span>
              </div>
              <motion.button
                type="button"
                className={`btn-primary px-6 py-3 text-base ${loading ? '' : 'start-ring'}`}
                onClick={player.start}
                disabled={loading}
                autoFocus
                whileTap={{ scale: 0.95 }}
              >
                {loading ? 'Loading playlist…' : 'Start the set'}
                {!loading && <ArrowRight />}
              </motion.button>
              {!loading && (
                <motion.span
                  className="pill"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {`${player.queueLength} TRACKS · SHUFFLED`}
                </motion.span>
              )}
              <motion.button
                type="button"
                onClick={() => {
                  clearTokenCache();
                  const url = new URL(window.location.href);
                  url.searchParams.delete('spotify');
                  url.searchParams.delete('spotify_tracks');
                  window.history.replaceState({}, '', url);
                  window.location.reload();
                }}
                className="ml-auto btn-secondary px-3 py-2 text-sm"
                whileTap={{ scale: 0.98 }}
              >
                <SpotifyIcon className="inline mr-1" />
                Change Playlist
              </motion.button>
            </div>
          ) : hasYouTubeQueue ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-red-600">
                <YouTubeIcon />
                <span className="font-mono text-sm">Custom YouTube Playlist Loaded</span>
              </div>
              <motion.button
                type="button"
                className={`btn-primary px-6 py-3 text-base ${loading ? '' : 'start-ring'}`}
                onClick={player.start}
                disabled={loading}
                autoFocus
                whileTap={{ scale: 0.95 }}
              >
                {loading ? 'Loading playlist…' : 'Start the set'}
                {!loading && <ArrowRight />}
              </motion.button>
              {!loading && (
                <motion.span
                  className="pill"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {`${player.queueLength} TRACKS · SHUFFLED`}
                </motion.span>
              )}
              <motion.button
                type="button"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('list');
                  window.history.replaceState({}, '', url);
                  window.location.reload();
                }}
                className="ml-auto btn-secondary px-3 py-2 text-sm"
                whileTap={{ scale: 0.98 }}
              >
                <YouTubeIcon className="inline mr-1" />
                Change Playlist
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                type="button"
                className={`btn-primary px-6 py-3 text-base ${loading ? '' : 'start-ring'}`}
                onClick={player.start}
                disabled={loading}
                autoFocus
                whileTap={{ scale: 0.95 }}
              >
                {loading ? 'Loading playlist…' : 'Start the set'}
                {!loading && <ArrowRight />}
              </motion.button>
              {!loading && (
                <motion.span
                  className="pill"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {`${player.queueLength} TRACKS · SHUFFLED`}
                </motion.span>
              )}
              <motion.button
                type="button"
                onClick={() => setShowPlaylistInput(true)}
                className="ml-auto btn-secondary px-3 py-2 text-sm"
                whileTap={{ scale: 0.98 }}
              >
                <span className="inline-flex items-center gap-1 mr-1">
                  <SpotifyIcon className="h-3.5 w-3.5 text-green-500" />
                  <YouTubeIcon className="h-3.5 w-3.5 text-red-500" />
                </span>
                Load Playlist
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
