import { Link } from "react-router-dom";
import { SpydrMark } from "@/components/SpydrMark";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Show mono tagline under the wordmark (auth surfaces). */
  showTagline?: boolean;
}

export function Logo({
  className = "",
  size = "md",
  showTagline = false,
}: LogoProps) {
  const sizes = {
    sm: { icon: 22, fontSize: 15, gap: 8, tile: "rounded-sm" },
    md: { icon: 26, fontSize: 17, gap: 10, tile: "rounded-sm" },
    lg: { icon: 34, fontSize: 22, gap: 12, tile: "rounded-md" },
    xl: { icon: 44, fontSize: 28, gap: 14, tile: "rounded-md" },
  };

  const { icon: iconSize, fontSize, gap, tile } = sizes[size];

  return (
    <Link
      to="/"
      className={`flex shrink-0 items-center ${className}`}
      style={{ gap: `${gap}px` }}
    >
      {/* Soft crimson-tinted tile · electric blue mark */}
      <div
        className={`relative flex items-center justify-center bg-[hsl(var(--highlight-secondary)/0.12)] text-highlight ring-1 ring-[hsl(var(--highlight-secondary)/0.28)] ${tile}`}
        style={{ width: iconSize, height: iconSize }}
      >
        <SpydrMark size={iconSize * 0.62} strokeWidth={1.35} className="shrink-0" />
      </div>
      <span className="flex flex-col">
        <span
          className="font-semibold tracking-[-0.04em] text-foreground"
          style={{ fontSize: `${fontSize}px` }}
        >
          Spydr<span className="text-highlight-secondary">.</span>
        </span>
        {showTagline ? (
          <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
            Structured thinking engine
          </span>
        ) : null}
      </span>
    </Link>
  );
}
