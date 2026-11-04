let tokenCache: { token: string; expiresAt: number } | null = null;

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export function extractPlaylistId(url: string): string | null {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export function isSpotifyPlaylistUrl(url: string): boolean {
  return /open\.spotify\.com\/playlist\//.test(url);
}

export function hasSpotifyCredentials(): boolean {
  return !!(SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET);
}

export function hasYouTubeApiKey(): boolean {
  return !!YOUTUBE_API_KEY;
}

async function getAccessToken(): Promise<string> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured. Add VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET to .env');
  }

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60000) {
    return tokenCache.token;
  }

  const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token. Check your credentials.');
  }

  const data = await response.json();
  tokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return data.access_token;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  tracks: { items: { track: SpotifyTrack }[] };
}

export async function fetchPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const token = await getAccessToken();
  const tracks: SpotifyTrack[] = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        tokenCache = null;
        return fetchPlaylistTracks(playlistId);
      }
      throw new Error('Failed to fetch playlist tracks');
    }

    const data = await response.json();
    for (const item of data.items) {
      if (item.track && item.track.id) {
        tracks.push(item.track);
      }
    }
    url = data.next;
  }

  return tracks;
}

export function createSearchQuery(track: SpotifyTrack): string {
  const artists = track.artists.map((a) => a.name).join(' ');
  return `${track.name} ${artists} audio`;
}

export async function searchYouTube(query: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return null;
  }

  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodedQuery}&maxResults=1&key=${YOUTUBE_API_KEY}`
  );

  if (!response.ok) return null;

  const data = await response.json();
  return data.items?.[0]?.id?.videoId ?? null;
}

export async function searchYouTubeBatch(queries: string[]): Promise<(string | null)[]> {
  const results = await Promise.all(queries.map(searchYouTube));
  return results;
}

export function clearTokenCache(): void {
  tokenCache = null;
}