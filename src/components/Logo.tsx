import { Link } from "react-router-dom";
import { SpydrMark } from "@/components/SpydrMark";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 22, fontSize: 15, gap: 8 },
    md: { icon: 26, fontSize: 17, gap: 10 },
    lg: { icon: 34, fontSize: 22, gap: 12 },
    xl: { icon: 44, fontSize: 28, gap: 14 },
  };

  const { icon: iconSize, fontSize, gap } = sizes[size];

  return (
    <Link
      to="/"
      className={`flex items-center shrink-0 ${className}`}
      style={{ gap: `${gap}px` }}
    >
      <div
        className="relative flex items-center justify-center rounded-lg bg-primary/12 text-highlight ring-1 ring-highlight/25"
        style={{ width: iconSize, height: iconSize }}
      >
        <SpydrMark size={iconSize * 0.62} strokeWidth={1.5} className="shrink-0" />
      </div>
      <span
        className="font-semibold tracking-[-0.03em] text-foreground"
        style={{ fontSize: `${fontSize}px` }}
      >
        Spydr<span className="text-highlight-secondary">.</span>
      </span>
    </Link>
  );
}
