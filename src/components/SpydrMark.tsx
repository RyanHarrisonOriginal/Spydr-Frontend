import spydrLogo from "@/assets/spydr-logo-512.png";

interface SpydrMarkProps {
  className?: string;
  size?: number;
  /** Kept for call-site compatibility; unused with the official logo asset. */
  strokeWidth?: number;
  alt?: string;
}

/**
 * Official Spydr mark — hexagonal network logo with luminous core.
 */
export function SpydrMark({
  className,
  size = 24,
  alt = "",
}: SpydrMarkProps) {
  return (
    <img
      src={spydrLogo}
      width={size}
      height={size}
      alt={alt}
      draggable={false}
      className={className}
      style={{ width: size, height: size }}
      aria-hidden={alt ? undefined : true}
    />
  );
}
