interface SpydrMarkProps {
  className?: string;
  size?: number;
  /** Stroke width for the web strands. */
  strokeWidth?: number;
}

/**
 * Abstract "web intelligence" mark — a radial web of strands and connector
 * nodes around a central anchor. Deliberately geometric and original: no
 * Spider-Man logo, mask, or trademarked pattern, just a quiet web motif that
 * doubles as a node graph.
 */
export function SpydrMark({
  className,
  size = 24,
  strokeWidth = 1.4,
}: SpydrMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* Radial spokes */}
      <path d="M12 12 L12 3" opacity="0.9" />
      <path d="M12 12 L19.79 7.5" opacity="0.55" />
      <path d="M12 12 L19.79 16.5" opacity="0.9" />
      <path d="M12 12 L12 21" opacity="0.55" />
      <path d="M12 12 L4.21 16.5" opacity="0.9" />
      <path d="M12 12 L4.21 7.5" opacity="0.55" />

      {/* Outer web ring */}
      <path
        d="M12 3 L19.79 7.5 L19.79 16.5 L12 21 L4.21 16.5 L4.21 7.5 Z"
        opacity="0.45"
      />
      {/* Inner web ring */}
      <path
        d="M12 7 L16.33 9.5 L16.33 14.5 L12 17 L7.67 14.5 L7.67 9.5 Z"
        opacity="0.75"
      />

      {/* Connector nodes */}
      <circle cx="12" cy="3" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="19.79" cy="16.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.21" cy="16.5" r="1.1" fill="currentColor" stroke="none" />

      {/* Center anchor */}
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
