import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { mountWebFieldScene, type WebFieldScene } from "@/components/webFieldScene";

interface WebFieldProps {
  className?: string;
  /** Visual density — page heroes use ambient; auth/marketing use focus. */
  intensity?: "ambient" | "focus";
  /** How the SVG fallback fills its box — slice for full-bleed heroes. */
  fit?: "meet" | "slice";
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Geometric web field — radial strands + connector nodes.
 * Focus intensity mounts a Three.js spinning web; ambient stays SVG-light.
 */
export function WebField({
  className,
  intensity = "ambient",
  fit = "meet",
}: WebFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useCanvas, setUseCanvas] = useState(false);
  const wantsScene = intensity === "focus";

  useEffect(() => {
    if (!wantsScene) {
      setUseCanvas(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene: WebFieldScene | null = mountWebFieldScene(canvas, {
      reducedMotion: prefersReducedMotion(),
      intensity: "focus",
    });

    if (!scene) {
      setUseCanvas(false);
      return;
    }

    setUseCanvas(true);

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => scene.resize());
    observer?.observe(canvas.parentElement ?? canvas);

    return () => {
      observer?.disconnect();
      scene.destroy();
    };
  }, [wantsScene]);

  return (
    <div className={cn("pointer-events-none relative h-full w-full select-none", className)}>
      {(!wantsScene || !useCanvas) && (
        <SvgWebField
          className="absolute inset-0 h-full w-full"
          intensity={intensity}
          fit={fit}
        />
      )}
      {wantsScene && (
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 block h-full w-full",
            useCanvas ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        />
      )}
    </div>
  );
}

function SvgWebField({
  className,
  intensity,
  fit,
}: Required<Pick<WebFieldProps, "className" | "intensity" | "fit">>) {
  const uid = useId();
  const hubId = `${uid}-hub`;
  const emberId = `${uid}-ember`;
  const isFocus = intensity === "focus";

  return (
    <svg
      viewBox="0 0 640 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none select-none", className)}
      aria-hidden
      preserveAspectRatio={
        fit === "slice" ? "xMidYMid slice" : "xMaxYMid meet"
      }
    >
      <defs>
        <radialGradient id={hubId} cx="52%" cy="48%" r="42%">
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
        <radialGradient id={emberId} cx="52%" cy="48%" r="8%">
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

      <rect width="640" height="360" fill={`url(#${hubId})`} />

      <path
        d="M332 48 L476 118 L476 242 L332 312 L188 242 L188 118 Z"
        stroke="hsl(var(--foreground))"
        strokeOpacity={isFocus ? 0.14 : 0.08}
        strokeWidth="1"
      />
      <path
        d="M332 96 L428 144 L428 216 L332 264 L236 216 L236 144 Z"
        stroke="hsl(var(--highlight))"
        strokeOpacity={isFocus ? 0.28 : 0.16}
        strokeWidth="1"
      />
      <path
        d="M332 138 L386 166 L386 194 L332 222 L278 194 L278 166 Z"
        stroke="hsl(var(--highlight))"
        strokeOpacity={isFocus ? 0.42 : 0.26}
        strokeWidth="1"
      />

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

      <g stroke="hsl(var(--foreground))" strokeWidth="0.75">
        <path d="M236 144 L278 166" strokeOpacity="0.12" />
        <path d="M428 144 L386 166" strokeOpacity="0.16" />
        <path d="M428 216 L386 194" strokeOpacity="0.1" />
        <path d="M236 216 L278 194" strokeOpacity="0.14" />
        <path d="M188 118 L236 144" strokeOpacity="0.08" />
        <path d="M476 118 L428 144" strokeOpacity="0.1" />
      </g>

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

      <circle cx="332" cy="180" r="18" fill={`url(#${emberId})`} />
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
