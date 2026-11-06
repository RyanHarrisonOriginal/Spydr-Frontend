import { useId } from "react";
import { cn } from "@/lib/utils";
import "./spydr-mark.css";

const OUTER =
  "M0 -1.78 L1.541 -0.89 L1.541 0.89 L0 1.78 L-1.541 0.89 L-1.541 -0.89 Z";
const MID =
  "M0 -1.1 L0.953 -0.55 L0.953 0.55 L0 1.1 L-0.953 0.55 L-0.953 -0.55 Z";
const INNER =
  "M0 -0.5 L0.433 -0.25 L0.433 0.25 L0 0.5 L-0.433 0.25 L-0.433 -0.25 Z";

const MID_VERTS = [
  [0, -1.1],
  [0.953, -0.55],
  [0.953, 0.55],
  [0, 1.1],
  [-0.953, 0.55],
  [-0.953, -0.55],
] as const;

const OUTER_VERTS = [
  [0, -1.78],
  [1.541, -0.89],
  [1.541, 0.89],
  [0, 1.78],
  [-1.541, 0.89],
  [-1.541, -0.89],
] as const;

const SIGNAL =
  "M0 0 L0 -1.1 L0.953 -0.55 L0.953 0.55 L0 1.1 L-0.953 0.55 L-0.953 -0.55 L0 -1.1 L0 -1.78";

const SPOKES = MID_VERTS.map(([x, y]) => `M0 0 L${x} ${y}`).join(" ");
const LINKS = MID_VERTS.map(([x, y], i) => {
  const [ox, oy] = OUTER_VERTS[i];
  return `M${x} ${y} L${ox} ${oy}`;
}).join(" ");

export interface SpydrMarkProps {
  size?: number;
  /** Play the draw-in sequence before the loop. */
  intro?: boolean;
  /** Compact omits inner hex + radial links (intended for sizes under 48px). */
  variant?: "full" | "compact";
  /** Fully drawn, no signal or rotation. */
  static?: boolean;
  /** When true, mark is hidden from AT (`aria-hidden`). */
  decorative?: boolean;
  className?: string;
}

export function SpydrMark({
  size = 24,
  intro = false,
  variant,
  static: isStatic = false,
  decorative = false,
  className,
}: SpydrMarkProps) {
  const uid = useId();
  const resolvedVariant = variant ?? (size < 48 ? "compact" : "full");
  const compact = resolvedVariant === "compact";
  const animate = !isStatic;

  return (
    <svg
      className={cn(
        "spydr-mark",
        intro && !isStatic && "spydr-mark--intro",
        animate && "spydr-mark--animate",
        isStatic && "spydr-mark--static",
        className,
      )}
      width={size}
      height={size}
      viewBox="-2 -2 4 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Spydr"}
      aria-hidden={decorative ? true : undefined}
      data-spydr-mark={uid}
    >
      <g className="spydr-mark__spin">
        <path
          className="spydr-mark__stroke spydr-mark__outer spydr-mark__draw"
          d={OUTER}
          pathLength={100}
          strokeWidth={1}
        />
        <path
          className="spydr-mark__stroke spydr-mark__mid spydr-mark__draw"
          d={MID}
          pathLength={100}
          strokeWidth={1}
        />
        {!compact ? (
          <path
            className="spydr-mark__stroke spydr-mark__inner spydr-mark__draw"
            d={INNER}
            pathLength={100}
            strokeWidth={1}
          />
        ) : null}
        <path
          className="spydr-mark__stroke spydr-mark__spokes spydr-mark__draw"
          d={SPOKES}
          pathLength={100}
          strokeWidth={1}
        />
        {!compact ? (
          <path
            className="spydr-mark__stroke spydr-mark__links spydr-mark__draw"
            d={LINKS}
            pathLength={100}
            strokeWidth={1}
          />
        ) : null}

        <g className="spydr-mark__nodes">
          {MID_VERTS.map(([x, y], i) => (
            <circle
              key={i}
              className="spydr-mark__node"
              cx={x}
              cy={y}
              r={0.08}
            />
          ))}
        </g>

        <circle className="spydr-mark__hub" cx={0} cy={0} r={0.14} />

        {animate ? (
          <>
            <path
              className="spydr-mark__trail"
              d={SIGNAL}
              pathLength={100}
            />
            <path
              className="spydr-mark__signal"
              d={SIGNAL}
              pathLength={100}
            />
          </>
        ) : null}
      </g>
    </svg>
  );
}
