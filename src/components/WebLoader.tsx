import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { mountWebLoaderScene, type WebLoaderScene } from "@/components/webLoaderScene";

type WebLoaderSize = "sm" | "md" | "lg";

interface WebLoaderProps {
  className?: string;
  size?: WebLoaderSize;
  label?: string;
  /** When false, fades out after the minimum visible duration. Defaults to true. */
  active?: boolean;
}

const SIZE_PX: Record<WebLoaderSize, number> = {
  sm: 40,
  md: 72,
  lg: 128,
};

const SHOW_DELAY_MS = 250;
const MIN_VISIBLE_MS = 400;
const FADE_MS = 150;

/** Pointy-top hex ring in a 128×128 viewBox centered at 64,64. */
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = Math.PI / 2 + (i * Math.PI) / 3;
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
  }).join(" ");
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function WebLoaderFallback({
  size,
  reducedMotion,
}: {
  size: number;
  reducedMotion: boolean;
}) {
  const cx = 64;
  const cy = 64;
  const outerR = 54;
  const midR = 35;
  const innerR = 15;
  const hubR = 4.5;
  const nodeR = 2.5;

  const outer = hexPoints(cx, cy, outerR);
  const mid = hexPoints(cx, cy, midR);
  const inner = hexPoints(cx, cy, innerR);

  const midPts = Array.from({ length: 6 }, (_, i) => {
    const angle = Math.PI / 2 + (i * Math.PI) / 3;
    return { x: cx + Math.cos(angle) * midR, y: cy + Math.sin(angle) * midR };
  });
  const outerPts = Array.from({ length: 6 }, (_, i) => {
    const angle = Math.PI / 2 + (i * Math.PI) / 3;
    return { x: cx + Math.cos(angle) * outerR, y: cy + Math.sin(angle) * outerR };
  });

  // Signal path: hub → mid0 → around mid → outer0 → around outer → mid0 → hub
  const signalD = [
    `M ${cx} ${cy}`,
    `L ${midPts[0].x} ${midPts[0].y}`,
    ...midPts.slice(1).map((p) => `L ${p.x} ${p.y}`),
    `L ${midPts[0].x} ${midPts[0].y}`,
    `L ${outerPts[0].x} ${outerPts[0].y}`,
    ...outerPts.slice(1).map((p) => `L ${p.x} ${p.y}`),
    `L ${outerPts[0].x} ${outerPts[0].y}`,
    `L ${midPts[0].x} ${midPts[0].y}`,
    `L ${cx} ${cy}`,
  ].join(" ");

  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      className={cn(
        "spydr-web-loader-mark pointer-events-none select-none",
        reducedMotion && "spydr-web-loader-mark--static",
      )}
      aria-hidden
    >
      <polygon
        points={outer}
        fill="none"
        stroke="var(--fg, #e8eaed)"
        strokeOpacity="0.22"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <polygon
        points={inner}
        fill="none"
        stroke="var(--fg, #e8eaed)"
        strokeOpacity="0.45"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <polygon
        points={mid}
        fill="none"
        stroke="var(--fg, #e8eaed)"
        strokeOpacity="0.45"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {midPts.map((p, i) => (
        <line
          key={`spoke-${i}`}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="var(--fg, #e8eaed)"
          strokeOpacity="0.3"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      ))}
      {midPts.map((p, i) => (
        <line
          key={`frame-${i}`}
          x1={p.x}
          y1={p.y}
          x2={outerPts[i].x}
          y2={outerPts[i].y}
          stroke="var(--fg, #e8eaed)"
          strokeOpacity="0.3"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      ))}
      {midPts.map((p, i) => (
        <circle
          key={`node-${i}`}
          cx={p.x}
          cy={p.y}
          r={nodeR}
          // Root --muted is an HSL surface token; prefer the hex text muted used on work/shell.
          fill="#8a9099"
        />
      ))}
      <circle cx={cx} cy={cy} r={hubR} fill="var(--fg, #e8eaed)" className="spydr-web-loader-hub" />
      {!reducedMotion ? (
        <path
          d={signalD}
          fill="none"
          stroke="var(--active, #3FB5A3)"
          strokeWidth="1.25"
          strokeLinecap="round"
          pathLength={100}
          className="spydr-web-loader-signal-path"
        />
      ) : null}
    </svg>
  );
}

/**
 * Presence-aware web loader. Delays paint by 250ms so fast loads never flash,
 * fades in/out over 150ms, and once shown holds at least 400ms before fading out
 * when `active` becomes false. Uncontrolled usage (`active` omitted) stays shown
 * until unmount; the delay alone prevents flash.
 */
export function WebLoader({
  className,
  size = "md",
  label,
  active = true,
}: WebLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shownAtRef = useRef<number | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paint, setPaint] = useState(false);
  const [opaque, setOpaque] = useState(false);
  const px = SIZE_PX[size];
  const ariaLabel = label ?? "Loading";

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!active) return;
    const showTimer = window.setTimeout(() => {
      shownAtRef.current = performance.now();
      setPaint(true);
      requestAnimationFrame(() => setOpaque(true));
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(showTimer);
  }, [active]);

  useEffect(() => {
    if (active || !paint) return;
    const shownAt = shownAtRef.current ?? performance.now();
    const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - shownAt));
    const fadeTimer = window.setTimeout(() => setOpaque(false), remaining);
    const hideTimer = window.setTimeout(() => {
      setPaint(false);
      shownAtRef.current = null;
    }, remaining + FADE_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [active, paint]);

  useEffect(() => {
    if (!paint) return;
    const canvas = canvasRef.current;
    if (!canvas || useFallback) return;

    const scene: WebLoaderScene | null = mountWebLoaderScene(canvas, {
      reducedMotion,
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
  }, [paint, reducedMotion, useFallback]);

  return (
    <div
      className={cn("flex flex-col items-center justify-center", className)}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      aria-busy={opaque}
    >
      <div
        className="relative transition-opacity ease-out"
        style={{
          width: px,
          height: px,
          opacity: opaque ? 1 : 0,
          transitionDuration: `${FADE_MS}ms`,
        }}
      >
        {paint ? (
          useFallback ? (
            <WebLoaderFallback size={px} reducedMotion={reducedMotion} />
          ) : (
            <canvas
              ref={canvasRef}
              className="block h-full w-full"
              style={{ width: px, height: px }}
            />
          )
        ) : null}
      </div>
      {label ? (
        <p
          className="spydr-web-loader-label transition-opacity ease-out"
          style={{
            opacity: opaque ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
        >
          {label}
        </p>
      ) : (
        <span className="sr-only">{ariaLabel}</span>
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
