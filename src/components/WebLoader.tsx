import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { mountWebLoaderScene, type WebLoaderScene } from "@/components/webLoaderScene";

type WebLoaderSize = "sm" | "md" | "lg";

interface WebLoaderProps {
  className?: string;
  size?: WebLoaderSize;
  label?: string;
}

const SIZE_PX: Record<WebLoaderSize, number> = {
  sm: 160,
  md: 228,
  lg: 336,
};

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function WebLoaderFallback({ size }: { size: number }) {
  const uid = useId();
  const hubId = `${uid}-hub`;
  const emberId = `${uid}-ember`;

  return (
    <svg
      viewBox="-12 -12 152 152"
      width={size}
      height={size}
      className="spydr-web-loader-mark pointer-events-none select-none"
      aria-hidden
    >
      <defs>
        <radialGradient id={hubId} cx="50%" cy="50%" r="42%">
          <stop offset="0%" stopColor="hsl(var(--highlight))" stopOpacity="0.55" />
          <stop offset="55%" stopColor="hsl(var(--highlight))" stopOpacity="0.12" />
          <stop offset="100%" stopColor="hsl(var(--highlight))" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={emberId} cx="50%" cy="50%" r="12%">
          <stop offset="0%" stopColor="hsl(var(--highlight))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--highlight))" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="128" height="128" fill={`url(#${hubId})`} />

      <g fill="none" strokeLinecap="round">
        <polygon
          points="64,10 112,37 112,91 64,118 16,91 16,37"
          stroke="hsl(var(--foreground))"
          strokeOpacity="0.55"
          strokeWidth="3.2"
        />
        <polygon
          points="64,34 90,49 90,79 64,94 38,79 38,49"
          stroke="hsl(var(--foreground))"
          strokeOpacity="0.42"
          strokeWidth="1.6"
        />
        <polygon
          points="64,52 76,59 76,69 64,76 52,69 52,59"
          stroke="hsl(var(--highlight))"
          strokeOpacity="0.8"
          strokeWidth="2"
        />
        <path d="M64 64 L64 10 M64 64 L112 37 M64 64 L112 91 M64 64 L64 118 M64 64 L16 91 M64 64 L16 37" stroke="hsl(var(--foreground))" strokeOpacity="0.28" strokeWidth="1.4" />
      </g>

      <circle cx="64" cy="64" r="16" fill={`url(#${emberId})`} className="spydr-web-loader-pulse" />
      <circle cx="64" cy="64" r="5.5" fill="hsl(var(--highlight))" />

      <g className="spydr-web-loader-signal">
        <circle cx="64" cy="34" r="5" fill="hsl(var(--highlight-secondary))" />
      </g>
    </svg>
  );
}

export function WebLoader({ className, size = "md", label }: WebLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const px = SIZE_PX[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene: WebLoaderScene | null = mountWebLoaderScene(canvas, {
      reducedMotion: prefersReducedMotion(),
    });

    if (!scene) {
      setUseFallback(true);
      return;
    }

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => scene.resize());
    observer?.observe(canvas.parentElement ?? canvas);

    return () => {
      observer?.disconnect();
      scene.destroy();
    };
  }, []);

  return (
    <div
      className={cn("flex flex-col items-center justify-center", className)}
      role="status"
      aria-live="polite"
    >
      <div className="relative" style={{ width: px, height: px }}>
        {useFallback ? (
          <WebLoaderFallback size={px} />
        ) : (
          <canvas
            ref={canvasRef}
            className="block h-full w-full"
            style={{ width: px, height: px }}
          />
        )}
      </div>
      {label ? (
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}

export function WebLoaderScreen({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[240px] w-full flex-col items-center justify-center bg-background",
        className,
      )}
    >
      <WebLoader size="lg" label={label} />
    </div>
  );
}
