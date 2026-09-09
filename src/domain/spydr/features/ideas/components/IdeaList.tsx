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
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import {
  CAPTURE_CARD_BODY_CLASS,
  CAPTURE_CARD_BODY_EMPTY_CLASS,
  CAPTURE_CARD_CLASS,
  CAPTURE_CARD_FOOTER_CLASS,
  CAPTURE_CARD_GRID_CLASS,
  CAPTURE_CARD_META_CLASS,
  CAPTURE_CARD_TITLE_CLASS,
} from "@/domain/spydr/features/shared/components/captureCardStyles";
import { cn } from "@/lib/utils";

interface IdeaListProps {
  ideas: IdeaNode[];
  getPriorityRank(id: string): number | undefined;
  reorderEnabled?: boolean;
  onReorder?(orderedIds: string[]): void;
  onDelete?(ideaId: string): void;
  deletingIdeaId?: string | null;
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
  onDelete,
  deletingIdeaId = null,
}: IdeaListProps) {
  return (
    <CollectionSortableList
      items={ideas}
      enabled={reorderEnabled}
      layout="grid"
      className={CAPTURE_CARD_GRID_CLASS}
      onReorder={(orderedIds) => onReorder?.(orderedIds)}
      renderItem={(idea, sortable) => {
        const confidence = formatConfidence(idea.details?.confidence);
        const potentialValue = idea.details?.potentialValue;
        const isPromoted = !!idea.details?.promotedToProjectNodeId;

        return (
          <div className={CAPTURE_CARD_CLASS}>
            <div className="flex min-h-0 flex-1 items-start gap-2">
              {reorderEnabled ? (
                <CollectionDragHandle
                  className="mt-0.5"
                  {...sortable.dragHandleProps}
                />
              ) : null}
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-highlight-secondary/25 bg-highlight-secondary/10">
                <Lightbulb className="h-3.5 w-3.5 text-highlight-secondary" />
              </span>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="flex items-start gap-2">
                  <CollectionPriorityRank
                    rank={getPriorityRank(idea.id)}
                    className="mt-0.5 shrink-0"
                  />
                  <h2 className={cn(CAPTURE_CARD_TITLE_CLASS, "min-w-0 flex-1")}>
                    {idea.title}
                  </h2>
                  {onDelete ? (
                    <InlineDeleteButton
                      label={idea.title}
                      isDeleting={deletingIdeaId === idea.id}
                      disabled={Boolean(deletingIdeaId && deletingIdeaId !== idea.id)}
                      onDelete={() => onDelete(idea.id)}
                    />
                  ) : null}
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {formatRelativeTime(idea.updatedAt)}
                  </span>
                </div>

                <div className={CAPTURE_CARD_META_CLASS} aria-hidden />

                {idea.body ? (
                  <p className={CAPTURE_CARD_BODY_CLASS}>{idea.body}</p>
                ) : (
                  <p className={CAPTURE_CARD_BODY_EMPTY_CLASS}>No description yet.</p>
                )}

                <div className={CAPTURE_CARD_FOOTER_CLASS}>
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
