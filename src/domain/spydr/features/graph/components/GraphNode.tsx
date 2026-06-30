import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { GRAPH_NODE_WIDTH } from "@/domain/spydr/utils/workspaceGraphLayout";
import type { GraphNodeData, GraphNodeKind } from "@/domain/spydr/utils/workspaceGraphModel";

const kindStyles: Record<
  GraphNodeKind,
  { border: string; bg: string; label: string }
> = {
  project: {
    border: "border-highlight/35",
    bg: "bg-highlight/8",
    label: "text-highlight",
  },
  task: {
    border: "border-border",
    bg: "bg-card",
    label: "text-muted-foreground",
  },
  person: {
    border: "border-highlight-secondary/30",
    bg: "bg-highlight-secondary/6",
    label: "text-highlight-secondary-muted",
  },
  project_area: {
    border: "border-border/80",
    bg: "bg-muted/30",
    label: "text-muted-foreground",
  },
};

export type GraphFlowNode = Node<GraphNodeData, "graphNode">;

export function GraphNode({ data, selected }: NodeProps<GraphFlowNode>) {
  const styles = kindStyles[data.kind];

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1 !w-1 !border-0 !bg-transparent"
      />
      <div
        className={cn(
          "rounded-md border px-2.5 py-1.5 shadow-sm transition-shadow",
          styles.border,
          styles.bg,
          selected && "shadow-[0_0_0_1px_hsl(var(--highlight)/0.35)]",
          data.href && "cursor-pointer"
        )}
        style={{ width: GRAPH_NODE_WIDTH }}
      >
        <div
          className={cn(
            "font-mono text-[8px] uppercase tracking-[0.14em]",
            styles.label
          )}
        >
          {data.kind.replace("_", " ")}
        </div>
        <div className="mt-0.5 truncate text-[11px] font-medium leading-snug text-foreground">
          {data.label}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1 !w-1 !border-0 !bg-transparent"
      />
    </>
  );
}
