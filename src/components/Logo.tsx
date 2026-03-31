import { Link } from "react-router-dom";

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
        className="relative flex items-center justify-center rounded-lg bg-primary/12 text-foreground ring-1 ring-primary/20"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          width={iconSize * 0.6}
          height={iconSize * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0"
          aria-hidden
        >
          {/* Root node — bold */}
          <circle cx="12" cy="5" r="2.5" fill="currentColor" />
          {/* Stem */}
          <path
            d="M12 7.5V11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Branch Y */}
          <path
            d="M12 11L7 17M12 11L17 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Child nodes */}
          <circle cx="7" cy="17" r="2" fill="currentColor" opacity="0.85" />
          <circle cx="17" cy="17" r="2" fill="currentColor" opacity="0.85" />
        </svg>
      </div>
      <span
        className="font-semibold tracking-[-0.03em] text-foreground"
        style={{ fontSize: `${fontSize}px` }}
      >
        Spydr<span className="text-primary">.</span>
      </span>
    </Link>
  );
}
