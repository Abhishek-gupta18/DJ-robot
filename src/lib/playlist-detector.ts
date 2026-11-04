export type PlaylistType = 'spotify' | 'youtube' | 'unknown';

export function detectPlaylistType(url: string): PlaylistType {
  if (!url) return 'unknown';
  
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    if (hostname.includes('spotify.com') && parsed.pathname.includes('/playlist/')) {
      return 'spotify';
    }
    
    if (
      (hostname.includes('youtube.com') || hostname.includes('youtu.be')) &&
      (parsed.searchParams.has('list') || parsed.pathname.includes('/playlist'))
    ) {
      return 'youtube';
    }
    
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

export function extractSpotifyPlaylistId(url: string): string | null {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export function extractYouTubePlaylistId(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Check query param first (works for all youtube.com, youtu.be, m.youtube.com)
    const listParam = parsed.searchParams.get('list');
    if (listParam) return listParam;
    
    // Check pathname for /playlist/ID format
    const pathMatch = parsed.pathname.match(/\/playlist\/([a-zA-Z0-9_-]+)/);
    if (pathMatch) return pathMatch[1];
    
    // Handle embed URLs: youtube.com/embed/videoseries?list=PLxxx
    if (parsed.pathname.includes('/embed/videoseries')) {
      return parsed.searchParams.get('list');
    }
    
    return null;
  } catch {
    // Try regex fallback for non-standard URLs
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }
}

export function extractPlaylistId(url: string, type: PlaylistType): string | null {
  switch (type) {
    case 'spotify':
      return extractSpotifyPlaylistId(url);
    case 'youtube':
      return extractYouTubePlaylistId(url);
    default:
      return null;
  }
}

export function getPlaceholderForType(type: PlaylistType): string {
  switch (type) {
    case 'spotify':
      return 'https://open.spotify.com/playlist/...';
    case 'youtube':
      return 'https://www.youtube.com/playlist?list=...';
    default:
      return 'Paste Spotify or YouTube playlist URL';
  }
}

export function getIconForType(type: PlaylistType): 'spotify' | 'youtube' | 'link' {
  switch (type) {
    case 'spotify':
      return 'spotify';
    case 'youtube':
      return 'youtube';
    default:
      return 'link';
  }
}