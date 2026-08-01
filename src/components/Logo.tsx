import { Link } from "react-router-dom";
import { SpydrMark } from "@/components/SpydrMark";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 40, fontSize: 18, gap: 6 },
    md: { icon: 48, fontSize: 20, gap: 7 },
    lg: { icon: 64, fontSize: 26, gap: 8 },
    xl: { icon: 88, fontSize: 34, gap: 10 },
  };

  const { icon: iconSize, fontSize, gap } = sizes[size];

  return (
    <Link
      to="/"
      className={`flex shrink-0 items-center ${className}`}
      style={{ gap: `${gap}px` }}
    >
      <SpydrMark size={iconSize} className="shrink-0" />
      <span
        className="font-semibold tracking-[-0.04em] text-foreground"
        style={{ fontSize: `${fontSize}px`, lineHeight: 1 }}
      >
        Spydr<span className="text-highlight-secondary">.</span>
      </span>
    </Link>
  );
}
