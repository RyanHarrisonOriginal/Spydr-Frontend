interface SpydrMarkProps {
  className?: string;
  size?: number;
  /** Stroke width for the web strands. */
  strokeWidth?: number;
}

/**
 * Abstract web-intelligence mark — radial hub + strands + connector nodes.
 * Reads as spiderweb and ontology graph. Geometric, quiet, not a mascot.
 */
export function SpydrMark({
  className,
  size = 24,
  strokeWidth = 1.25,
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
      {/* Radial spokes — uneven opacity: spun, not stamped */}
      <path d="M12 12 L12 2.8" opacity="0.92" />
      <path d="M12 12 L20.1 7.2" opacity="0.42" />
      <path d="M12 12 L20.1 16.8" opacity="0.85" />
      <path d="M12 12 L12 21.2" opacity="0.4" />
      <path d="M12 12 L3.9 16.8" opacity="0.88" />
      <path d="M12 12 L3.9 7.2" opacity="0.48" />

      {/* Outer ring */}
      <path
        d="M12 2.8 L20.1 7.2 L20.1 16.8 L12 21.2 L3.9 16.8 L3.9 7.2 Z"
        opacity="0.38"
      />
      {/* Inner ring */}
      <path
        d="M12 7.2 L16.2 9.6 L16.2 14.4 L12 16.8 L7.8 14.4 L7.8 9.6 Z"
        opacity="0.72"
      />

      {/* Connector nodes */}
      <circle cx="12" cy="2.8" r="1" fill="currentColor" stroke="none" opacity="0.9" />
      <circle cx="20.1" cy="16.8" r="1" fill="currentColor" stroke="none" opacity="0.75" />
      <circle cx="3.9" cy="16.8" r="1" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="20.1" cy="7.2" r="0.7" fill="currentColor" stroke="none" opacity="0.4" />

      {/* Center anchor — the pulse */}
      <circle cx="12" cy="12" r="1.55" fill="currentColor" stroke="none" />
    </svg>
  );
}
