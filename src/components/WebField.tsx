import { cn } from "@/lib/utils";

interface WebFieldProps {
  className?: string;
  /** Visual density — page heroes use ambient; auth uses focus. */
  intensity?: "ambient" | "focus";
}

/**
 * Geometric web field — radial strands + connector nodes.
 * Reads as spiderweb and ontology graph at once. Thin strokes, uneven
 * opacity, quiet pulse at the hub. Never a literal spider.
 */
export function WebField({
  className,
  intensity = "ambient",
}: WebFieldProps) {
  const isFocus = intensity === "focus";

  return (
    <svg
      viewBox="0 0 640 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none select-none", className)}
      aria-hidden
      preserveAspectRatio="xMaxYMid meet"
    >
      <defs>
        <radialGradient id="web-hub" cx="52%" cy="48%" r="42%">
          <stop
            offset="0%"
            stopColor="hsl(var(--highlight))"
            stopOpacity={isFocus ? 0.14 : 0.08}
          />
          <stop
            offset="55%"
            stopColor="hsl(var(--highlight))"
            stopOpacity={isFocus ? 0.04 : 0.02}
          />
          <stop offset="100%" stopColor="hsl(var(--highlight))" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="web-ember" cx="52%" cy="48%" r="8%">
          <stop
            offset="0%"
            stopColor="hsl(var(--highlight-secondary))"
            stopOpacity={isFocus ? 0.55 : 0.35}
          />
          <stop
            offset="100%"
            stopColor="hsl(var(--highlight-secondary))"
            stopOpacity="0"
          />
        </radialGradient>
      </defs>

      <rect width="640" height="360" fill="url(#web-hub)" />

      {/* Outer constellation ring */}
      <path
        d="M332 48 L476 118 L476 242 L332 312 L188 242 L188 118 Z"
        stroke="hsl(var(--foreground))"
        strokeOpacity={isFocus ? 0.14 : 0.08}
        strokeWidth="1"
      />
      {/* Mid ring */}
      <path
        d="M332 96 L428 144 L428 216 L332 264 L236 216 L236 144 Z"
        stroke="hsl(var(--highlight))"
        strokeOpacity={isFocus ? 0.28 : 0.16}
        strokeWidth="1"
      />
      {/* Inner ring */}
      <path
        d="M332 138 L386 166 L386 194 L332 222 L278 194 L278 166 Z"
        stroke="hsl(var(--highlight))"
        strokeOpacity={isFocus ? 0.42 : 0.26}
        strokeWidth="1"
      />

      {/* Radial strands — uneven opacity so it feels spun, not stamped */}
      <g strokeLinecap="round">
        <path d="M332 180 L332 36" stroke="hsl(var(--highlight))" strokeOpacity="0.45" strokeWidth="1" />
        <path d="M332 180 L498 96" stroke="hsl(var(--foreground))" strokeOpacity="0.12" strokeWidth="1" />
        <path d="M332 180 L546 180" stroke="hsl(var(--highlight))" strokeOpacity="0.32" strokeWidth="1" />
        <path d="M332 180 L498 264" stroke="hsl(var(--foreground))" strokeOpacity="0.1" strokeWidth="1" />
        <path d="M332 180 L332 324" stroke="hsl(var(--highlight))" strokeOpacity="0.28" strokeWidth="1" />
        <path d="M332 180 L166 264" stroke="hsl(var(--foreground))" strokeOpacity="0.14" strokeWidth="1" />
        <path d="M332 180 L118 180" stroke="hsl(var(--highlight))" strokeOpacity="0.22" strokeWidth="1" />
        <path d="M332 180 L166 96" stroke="hsl(var(--foreground))" strokeOpacity="0.11" strokeWidth="1" />
      </g>

      {/* Cross-links between rings */}
      <g stroke="hsl(var(--foreground))" strokeWidth="0.75">
        <path d="M236 144 L278 166" strokeOpacity="0.12" />
        <path d="M428 144 L386 166" strokeOpacity="0.16" />
        <path d="M428 216 L386 194" strokeOpacity="0.1" />
        <path d="M236 216 L278 194" strokeOpacity="0.14" />
        <path d="M188 118 L236 144" strokeOpacity="0.08" />
        <path d="M476 118 L428 144" strokeOpacity="0.1" />
      </g>

      {/* Connector nodes */}
      <g fill="hsl(var(--highlight))">
        <circle cx="332" cy="48" r="2.2" opacity="0.7" />
        <circle cx="476" cy="118" r="1.8" opacity="0.35" />
        <circle cx="476" cy="242" r="2.2" opacity="0.55" />
        <circle cx="332" cy="312" r="1.6" opacity="0.3" />
        <circle cx="188" cy="242" r="2" opacity="0.5" />
        <circle cx="188" cy="118" r="1.5" opacity="0.28" />
        <circle cx="428" cy="144" r="1.7" opacity="0.45" />
        <circle cx="236" cy="216" r="1.5" opacity="0.32" />
        <circle cx="546" cy="180" r="1.8" opacity="0.4" />
        <circle cx="118" cy="180" r="1.4" opacity="0.25" />
      </g>

      {/* Hub pulse — crimson heartbeat */}
      <circle cx="332" cy="180" r="18" fill="url(#web-ember)" />
      <circle
        cx="332"
        cy="180"
        r="3.2"
        fill="hsl(var(--highlight-secondary))"
        opacity={isFocus ? 0.95 : 0.8}
      />
      <circle
        cx="332"
        cy="180"
        r="7"
        stroke="hsl(var(--highlight))"
        strokeOpacity={isFocus ? 0.35 : 0.22}
        strokeWidth="1"
      />
    </svg>
  );
}
