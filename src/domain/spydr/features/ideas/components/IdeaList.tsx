import { Lightbulb, Sparkles } from "lucide-react";
import type { IdeaNode } from "@/domain/spydr/utils/types";
import {
  EntityTag,
  PriorityBadge,
  StatusPill,
} from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import { cn } from "@/lib/utils";

interface IdeaListProps {
  ideas: IdeaNode[];
  getPriorityRank(id: string): number | undefined;
  reorderEnabled?: boolean;
  onReorder?(orderedIds: string[]): void;
}

function formatConfidence(confidence: number | null | undefined) {
  if (confidence === null || confidence === undefined) return null;
  return `${Math.round(confidence)}%`;
}

export function IdeaList({
  ideas,
  getPriorityRank,
  reorderEnabled = false,
  onReorder,
}: IdeaListProps) {
  return (
    <CollectionSortableList
      items={ideas}
      enabled={reorderEnabled}
      layout="grid"
      className="grid gap-2 px-4 pb-4 sm:grid-cols-2 xl:grid-cols-3"
      onReorder={(orderedIds) => onReorder?.(orderedIds)}
      renderItem={(idea, sortable) => {
        const confidence = formatConfidence(idea.details?.confidence);
        const potentialValue = idea.details?.potentialValue;
        const isPromoted = !!idea.details?.promotedToProjectNodeId;

        return (
          <div
            className={cn(
              "rounded-lg border border-border/70 bg-card/30 p-3 row-hover",
              "hover:border-highlight-secondary/30"
            )}
          >
            <div className="flex items-start gap-2">
              {reorderEnabled ? (
                <CollectionDragHandle
                  className="mt-0.5"
                  {...sortable.dragHandleProps}
                />
              ) : null}
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-highlight-secondary/25 bg-highlight-secondary/10">
                <Lightbulb className="h-3.5 w-3.5 text-highlight-secondary" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <CollectionPriorityRank rank={getPriorityRank(idea.id)} className="mt-0.5 shrink-0" />
                  <h2 className="min-w-0 flex-1 text-[13px] font-semibold leading-snug">
                    {idea.title}
                  </h2>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {formatRelativeTime(idea.updatedAt)}
                  </span>
                </div>

                {idea.body ? (
                  <p className="mt-1.5 line-clamp-3 text-[12px] leading-relaxed text-muted-foreground">
                    {idea.body}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[11px] italic text-muted-foreground/70">
                    No description yet.
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <StatusPill status={idea.status} />
                  <PriorityBadge priority={idea.priority} />
                  {potentialValue && (
                    <span className="inline-flex items-center gap-1 rounded border border-highlight-secondary/30 bg-highlight-secondary/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-highlight-secondary">
                      <Sparkles className="h-2.5 w-2.5" />
                      {potentialValue} value
                    </span>
                  )}
                  {confidence && (
                    <span className="rounded border border-border/60 bg-muted/30 px-1.5 py-px font-mono text-[9px] tabular-nums text-muted-foreground">
                      {confidence} confidence
                    </span>
                  )}
                  {idea.area && <EntityTag tag={idea.area} />}
                  {isPromoted && (
                    <span className="rounded border border-border/60 bg-muted/20 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      promoted
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
