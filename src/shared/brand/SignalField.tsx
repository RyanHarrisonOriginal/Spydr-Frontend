import { useId, useMemo, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import "./signal-field.css";

const FIELD_W = 1800;
const FIELD_H = 1100;
const HEX_W = 69.28;
const HALF_W = 34.64;

const HONEYCOMB_CELL =
  "M34.64 0V20L69.28 40V80L34.64 100L0 80V40L34.64 20M34.64 100V120";

const H_ROWS = [40, 200, 280, 440, 520, 680, 760, 920] as const;
const V_XS = [831.36, 1212.4] as const;

/** Zigzag along a horizontal lattice seam across the full field width. */
function horizontalZigzag(y: number, upFirst: boolean): string {
  const parts = [`M0 ${y}`];
  let x = 0;
  while (x < FIELD_W - 0.01) {
    if (upFirst) {
      parts.push(`l${HALF_W} -20 l${HALF_W} 20`);
    } else {
      parts.push(`l${HALF_W} 20 l${HALF_W} -20`);
    }
    x += HEX_W;
  }
  return parts.join(" ");
}

/** Zigzag down a vertical lattice column. */
function verticalZigzag(x: number): string {
  const parts = [`M${x} 0`, "v20"];
  let y = 20;
  let right = true;
  while (y < FIELD_H) {
    parts.push(right ? `l${HALF_W} 20` : `l-${HALF_W} 20`);
    y += 20;
    if (y >= FIELD_H) break;
    parts.push("v40");
    y += 40;
    right = !right;
  }
  return parts.join(" ");
}

interface SignalSpec {
  d: string;
  dur: number;
  delay: number;
  dim?: boolean;
  reverse?: boolean;
}

function buildSignals(): SignalSpec[] {
  const horizontals: SignalSpec[] = H_ROWS.map((y, i) => ({
    d: horizontalZigzag(y, i % 2 === 0),
    dur: 5.5 + ((i * 1.7) % 5.5),
    delay: -((i * 1.9) % 9),
    dim: i % 3 === 1,
    reverse: i === 1 || i === 4 || i === 6,
  }));

  const verticals: SignalSpec[] = V_XS.map((x, i) => ({
    d: verticalZigzag(x),
    dur: 8.5 + i * 2.2,
    delay: -(3.5 + i * 2.8),
    dim: i === 1,
    reverse: i === 0,
  }));

  return [...horizontals, ...verticals];
}

const LATTICE_VERTICES = [
  { x: 34.64, y: 40 },
  { x: 346.4, y: 200 },
  { x: 692.8, y: 280 },
  { x: 831.36, y: 100 },
  { x: 1039.2, y: 440 },
  { x: 1212.4, y: 200 },
  { x: 1385.6, y: 520 },
  { x: 554.24, y: 680 },
  { x: 900, y: 760 },
  { x: 1454.88, y: 920 },
] as const;

export interface SignalFieldProps {
  className?: string;
  static?: boolean;
}

export function SignalField({
  className,
  static: isStatic = false,
}: SignalFieldProps) {
  const uid = useId();
  const patternId = `${uid}-honey`;
  const signals = useMemo(() => buildSignals(), []);

  return (
    <div
      className={cn(
        "spydr-signal-field",
        isStatic && "spydr-signal-field--static",
        className,
      )}
      aria-hidden
    >
      <svg
        className="spydr-signal-field__svg"
        viewBox={`0 0 ${FIELD_W} ${FIELD_H}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id={patternId}
            width={HEX_W}
            height={120}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={HONEYCOMB_CELL}
              fill="none"
              stroke="var(--fg, #e8eaed)"
              strokeOpacity={0.11}
              strokeWidth={1}
            />
          </pattern>
        </defs>

        <rect
          className="spydr-signal-field__lattice"
          width={FIELD_W}
          height={FIELD_H}
          fill={`url(#${patternId})`}
        />

        {!isStatic
          ? signals.map((s, i) => (
              <path
                key={i}
                className={cn(
                  "spydr-signal-field__signal",
                  s.dim && "spydr-signal-field__signal--dim",
                )}
                d={s.d}
                pathLength={100}
                style={
                  {
                    "--sf-dur": `${s.dur}s`,
                    "--sf-delay": `${s.delay}s`,
                    "--sf-dir": s.reverse ? "reverse" : "normal",
                  } as CSSProperties
                }
              />
            ))
          : null}

        {LATTICE_VERTICES.map((v, i) => (
          <g key={i}>
            <circle
              className="spydr-signal-field__dot"
              cx={v.x}
              cy={v.y}
              r={2}
            />
            {!isStatic ? (
              <circle
                className="spydr-signal-field__pulse"
                cx={v.x}
                cy={v.y}
                r={4}
                style={
                  {
                    "--sf-pulse-delay": `${-(i * 0.55)}s`,
                  } as CSSProperties
                }
              />
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}
