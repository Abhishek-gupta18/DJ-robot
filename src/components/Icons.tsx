type IconProps = { className?: string };

/** Thin `arrow-right` brand glyph, recolored via currentColor. */
export function ArrowRight({ className = 'h-3.5 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 180 136" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth={1.75} vectorEffect="non-scaling-stroke">
        <path d="M0 67.4961H179.77" vectorEffect="non-scaling-stroke" />
        <path d="M179.769 67.4969C142.349 67.4969 90.9693 37.3669 90.2793 0.046875" vectorEffect="non-scaling-stroke" />
        <path d="M179.769 67.4961C142.319 67.4961 90.8893 97.6661 90.2793 135.026" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

export function PlayIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M4 2.5v11l9.5-5.5z" fill="currentColor" />
    </svg>
  );
}

export function PauseIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" fill="currentColor" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="1" fill="currentColor" />
    </svg>
  );
}

export function VolumeIcon({ muted, className = 'h-4 w-4' }: IconProps & { muted: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M2 6h2.5L8 3v10L4.5 10H2z" fill="currentColor" />
      {muted ? (
        <path d="M10.5 6l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <path d="M10.5 5.5a3.5 3.5 0 010 5M12.5 3.5a6.5 6.5 0 010 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function SpotifyIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm5.521 17.34c-.18.33-.54.48-.84.33-1.83-1.08-3.72-1.62-5.67-1.62-3.42 0-6.33 1.23-8.25 3.3-.48.54-.48 1.29 0 1.83.42.54 1.29.54 1.71 0 2.58-1.5 5.58-2.58 8.43-2.58 1.74 0 3.42.48 5.01 1.41.48.27.66.03.78-.45.12-.51-.03-.96-.45-1.17z" />
    </svg>
  );
}

export function YouTubeIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
