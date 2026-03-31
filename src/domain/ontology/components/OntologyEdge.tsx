import { memo } from "react";
import type { EdgeProps } from "@xyflow/react";
import { getTypeColor } from "../utils/nodeSchemas";

/** Gentle curve path — almost straight with softness (moc-up style). */
function getGentlePath(sx: number, sy: number, tx: number, ty: number): string {
  const dx = tx - sx;
  const dy = ty - sy;
  const offset = Math.max(Math.abs(dx) * 0.25, 36);
  const cx1 = sx + offset;
  const cy1 = sy + dy * 0.15;
  const cx2 = tx - offset;
  const cy2 = ty - dy * 0.15;
  return `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;
}

function OntologyEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps) {
  const sourceType = (data as { sourceType?: string })?.sourceType ?? "thought";
  const nodeTypes = (data as { nodeTypes?: Record<string, { color: string }> })?.nodeTypes ?? {};
  const color = getTypeColor(sourceType, nodeTypes);
  /** Raw HSL for stroke with alpha: hsl(var(--thought) / 0.4) */
  const colorRaw = color.replace(/^hsl\(|\)$/g, "");
  const path = getGentlePath(sourceX, sourceY, targetX, targetY);

  return (
    <>
      {/* Main edge — visible, confident (MOC-up style) */}
      <path
        id={id}
        d={path}
        fill="none"
        stroke={`hsl(${colorRaw} / ${selected ? 0.7 : 0.4})`}
        strokeWidth={selected ? 2.2 : 1.6}
        strokeLinecap="round"
        className="transition-all duration-300"
      />
      {/* Glow on selection */}
      {selected && (
        <path
          d={path}
          fill="none"
          stroke={`hsl(${colorRaw})`}
          strokeWidth={8}
          strokeOpacity={0.12}
          strokeLinecap="round"
          style={{ pointerEvents: "none", filter: "blur(4px)" }}
        />
      )}
    </>
  );
}

export const OntologyEdge = memo(OntologyEdgeComponent);
