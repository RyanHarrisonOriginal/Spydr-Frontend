import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, GitBranch, History } from "lucide-react";
import type { DecisionNode } from "@/domain/spydr/utils/types";
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

interface DecisionListProps {
  decisions: DecisionNode[];
  getPriorityRank(id: string): number | undefined;
  reorderEnabled?: boolean;
  onReorder?(orderedIds: string[]): void;
  onDelete?(decisionId: string): void;
  deletingDecisionId?: string | null;
}

const impactStyles: Record<string, string> = {
  high: "border-[hsl(var(--status-blocked)/0.35)] bg-[hsl(var(--status-blocked)/0.12)] text-[hsl(var(--status-blocked))]",
  medium:
    "border-[hsl(var(--status-doing)/0.35)] bg-[hsl(var(--status-doing)/0.12)] text-[hsl(var(--status-doing))]",
  low: "border-[hsl(var(--status-todo)/0.35)] bg-[hsl(var(--status-todo)/0.12)] text-[hsl(var(--status-todo))]",
};

function ImpactBadge({ impact }: { impact: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded border px-1.5 py-px font-mono text-[9px] uppercase tracking-wider",
        impactStyles[impact] ?? "border-border bg-muted/30 text-muted-foreground"
      )}
    >
      {impact} impact
    </span>
  );
}

export function DecisionList({
  decisions,
  getPriorityRank,
  reorderEnabled = false,
  onReorder,
  onDelete,
  deletingDecisionId = null,
}: DecisionListProps) {
  const supersededTitlesById = useMemo(() => {
    const titlesById = new Map(
      decisions.map((decision) => [decision.id, decision.title])
    );

    return new Map(
      decisions.map((decision) => {
        const supersededId = decision.details?.supersedesDecisionNodeId;
        return [
          decision.id,
          supersededId ? titlesById.get(supersededId) ?? null : null,
        ] as const;
      })
    );
  }, [decisions]);

  return (
    <CollectionSortableList
      items={decisions}
      enabled={reorderEnabled}
      layout="grid"
      className={CAPTURE_CARD_GRID_CLASS}
      onReorder={(orderedIds) => onReorder?.(orderedIds)}
      renderItem={(decision, sortable) => {
        const impact = decision.details?.impact ?? "medium";
        const rationale = decision.details?.rationale || decision.body;
        const decidedAt = decision.details?.decidedAt ?? decision.updatedAt;
        const supersededTitle = supersededTitlesById.get(decision.id) ?? null;

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
                <GitBranch className="h-3.5 w-3.5 text-highlight-secondary" />
              </span>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="flex items-start gap-2">
                  <CollectionPriorityRank
                    rank={getPriorityRank(decision.id)}
                    className="mt-0.5 shrink-0"
                  />
                  <h2 className={cn(CAPTURE_CARD_TITLE_CLASS, "min-w-0 flex-1")}>
                    {decision.title}
                  </h2>
                  {onDelete ? (
                    <InlineDeleteButton
                      label={decision.title}
                      isDeleting={deletingDecisionId === decision.id}
                      disabled={Boolean(
                        deletingDecisionId && deletingDecisionId !== decision.id
                      )}
                      onDelete={() => onDelete(decision.id)}
                    />
                  ) : null}
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {formatRelativeTime(decidedAt)}
                  </span>
                </div>

                {decision.project ? (
                  <Link
                    to={`/projects/${decision.project.id}`}
                    className={cn(CAPTURE_CARD_META_CLASS, "hover:text-highlight")}
                  >
                    <FolderKanban className="h-3 w-3 shrink-0" />
                    <span className="truncate">{decision.project.title}</span>
                  </Link>
                ) : (
                  <div className={CAPTURE_CARD_META_CLASS} aria-hidden />
                )}

                {rationale ? (
                  <p className={CAPTURE_CARD_BODY_CLASS}>{rationale}</p>
                ) : (
                  <p className={CAPTURE_CARD_BODY_EMPTY_CLASS}>
                    No rationale recorded.
                  </p>
                )}

                <div className={CAPTURE_CARD_FOOTER_CLASS}>
                  <StatusPill status={decision.status} />
                  <PriorityBadge priority={decision.priority} />
                  <ImpactBadge impact={impact} />
                  {supersededTitle ? (
                    <span className="inline-flex max-w-full items-center gap-1 rounded border border-border/70 bg-muted/20 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      <History className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate normal-case tracking-normal">
                        Replaces {supersededTitle}
                      </span>
                    </span>
                  ) : null}
                  {decision.area ? <EntityTag tag={decision.area} /> : null}
                  {decision.tags.slice(0, 2).map((tag) => (
                    <EntityTag key={tag} tag={tag} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
