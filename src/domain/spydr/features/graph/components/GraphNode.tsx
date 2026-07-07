import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import { PersonMeBadge } from "@/domain/spydr/features/people/components/PersonIdentity";
import { parseNodeId } from "@/domain/spydr/utils/workspaceGraphModel";
import { GRAPH_NODE_WIDTH } from "@/domain/spydr/utils/workspaceGraphLayout";
import type { GraphNodeData, GraphNodeKind } from "@/domain/spydr/utils/workspaceGraphModel";

const kindStyles: Record<
  GraphNodeKind,
  { accent: string; badge: string; badgeText: string }
> = {
  project_area: {
    accent: "bg-muted-foreground/70",
    badge: "border-border/70 bg-muted/40",
    badgeText: "text-muted-foreground",
  },
  project: {
    accent: "bg-highlight",
    badge: "border-highlight/35 bg-highlight/10",
    badgeText: "text-highlight",
  },
  task: {
    accent: "bg-[hsl(var(--status-doing))]",
    badge: "border-border bg-card/80",
    badgeText: "text-foreground/70",
  },
  person: {
    accent: "bg-highlight-secondary",
    badge: "border-highlight-secondary/30 bg-highlight-secondary/10",
    badgeText: "text-highlight-secondary-muted",
  },
};

const kindDisplayName: Record<GraphNodeKind, string> = {
  project_area: "area",
  project: "project",
  task: "task",
  person: "person",
};

export type GraphFlowNode = Node<GraphNodeData, "graphNode">;

export function GraphNode({ id, data, selected }: NodeProps<GraphFlowNode>) {
  const { isMe } = useCurrentUserPerson();
  const parsed = parseNodeId(id);
  const isCurrentUser = parsed?.kind === "person" && isMe(parsed.id);
  const styles = kindStyles[data.kind];

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!-left-[1px] !h-2 !w-2 !border-0 !bg-foreground/25"
      />
      <div
        className={cn(
          "group relative overflow-hidden rounded-md border border-border/80 bg-card/95 shadow-sm transition-shadow",
          selected && "border-foreground/30 shadow-[0_0_0_1px_hsl(var(--foreground)/0.15)]",
          data.href && "cursor-pointer hover:border-foreground/25",
          isCurrentUser && "person-me-card border-highlight/45 shadow-[0_0_20px_hsl(var(--highlight)/0.12)]"
        )}
        style={{ width: GRAPH_NODE_WIDTH, minHeight: 56 }}
      >
        <span
          className={cn("absolute inset-y-0 left-0 w-1", styles.accent)}
          aria-hidden
        />
        <div className="flex min-w-0 flex-col gap-1 px-3 py-2 pl-3.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "inline-flex shrink-0 rounded border px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.12em]",
                styles.badge,
                styles.badgeText
              )}
            >
              {kindDisplayName[data.kind]}
            </span>
            {isCurrentUser ? <PersonMeBadge compact /> : null}
          </div>
          <div
            className={cn(
              "truncate text-[12px] font-medium leading-snug text-foreground",
              isCurrentUser && "text-highlight"
            )}
          >
            {data.label}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!-right-[1px] !h-2 !w-2 !border-0 !bg-foreground/25"
      />
    </>
  );
}
