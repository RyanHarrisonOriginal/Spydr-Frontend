import type { DecisionNode } from "@/domain/spydr/utils/types";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import { cn } from "@/lib/utils";

interface DecisionTimelineProps {
  decisions: DecisionNode[];
  getPriorityRank(id: string): number | undefined;
  reorderEnabled?: boolean;
  onReorder?(orderedIds: string[]): void;
}

const impactColor: Record<string, string> = {
  high: "bg-[hsl(var(--status-blocked))]",
  medium: "bg-[hsl(var(--status-doing))]",
  low: "bg-[hsl(var(--status-todo))]",
};

export function DecisionTimeline({
  decisions,
  getPriorityRank,
  reorderEnabled = false,
  onReorder,
}: DecisionTimelineProps) {
  return (
    <CollectionSortableList
      items={decisions}
      enabled={reorderEnabled}
      className="relative ml-6 border-l border-border"
      onReorder={(orderedIds) => onReorder?.(orderedIds)}
      renderItem={(decision, sortable) => {
        const impact = decision.details?.impact ?? "medium";
        const rationale = decision.details?.rationale || decision.body;

        return (
          <div className="relative px-6 py-5 row-hover">
            <span
              className={cn(
                "absolute -left-[5px] top-7 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                impactColor[impact] ?? "bg-muted-foreground"
              )}
            />
            <div className="flex items-center gap-3">
              {reorderEnabled ? (
                <CollectionDragHandle {...sortable.dragHandleProps} />
              ) : null}
              <CollectionPriorityRank rank={getPriorityRank(decision.id)} />
              <h2 className="text-[14px] font-semibold">{decision.title}</h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {impact} impact
              </span>
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                {formatRelativeTime(decision.details?.decidedAt ?? decision.updatedAt)}
              </span>
            </div>
            {rationale && (
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                {rationale}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
