import { memo } from "react";
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import type { GraphEdgeData } from "@/domain/spydr/utils/workspaceGraphModel";

function LineageEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as GraphEdgeData | undefined;
  const isAssociation = edgeData?.edgeKind === "association";

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 10,
  });

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        stroke: isAssociation
          ? "hsl(var(--muted-foreground) / 0.38)"
          : "hsl(var(--foreground) / 0.42)",
        strokeWidth: selected ? 2.25 : isAssociation ? 1 : 1.75,
        strokeDasharray: isAssociation ? "5 4" : undefined,
      }}
      markerEnd={isAssociation ? undefined : "url(#lineage-arrow)"}
      interactionWidth={20}
    />
  );
}

export const LineageEdge = memo(LineageEdgeComponent);
