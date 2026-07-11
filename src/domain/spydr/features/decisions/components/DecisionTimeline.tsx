import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, FolderKanban, GitBranch, History } from "lucide-react";
import type { DecisionNode } from "@/domain/spydr/utils/types";
import {
  EntityTag,
  PriorityBadge,
  StatusPill,
} from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import { CollectionSortableHeader } from "@/domain/spydr/features/shared/components/CollectionSortableHeader";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import {
  formatRelativeTime,
  formatShortDate,
} from "@/domain/spydr/features/shared/components/time";
import type { CollectionSortState } from "@/domain/spydr/utils/collectionView";
import { cn } from "@/lib/utils";

interface DecisionTimelineProps {
  decisions: DecisionNode[];
  sort: CollectionSortState;
  getPriorityRank(id: string): number | undefined;
  reorderEnabled?: boolean;
  onSortColumn(column: string): void;
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

const ROW_BASE =
  "grid grid-cols-[36px_32px_minmax(0,1fr)_96px_120px_72px] items-start gap-3";
const ROW_WITH_HANDLE =
  "grid grid-cols-[24px_36px_32px_minmax(0,1fr)_96px_120px_72px] items-start gap-3";
const ROW_MIN_WIDTH = 920;
const ROW_MIN_WIDTH_WITH_HANDLE = 944;

function ImpactBadge({ impact }: { impact: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded border px-1.5 py-px font-mono text-[9px] uppercase tracking-wider",
        impactStyles[impact] ?? "border-border bg-muted/30 text-muted-foreground"
      )}
    >
      {impact}
    </span>
  );
}

function SupersedesBadge({
  title,
}: {
  title: string | null;
}) {
  if (!title) return null;

  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded border border-border/70 bg-muted/20 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
      <History className="h-2.5 w-2.5 shrink-0" />
      <span className="truncate normal-case tracking-normal">Replaces {title}</span>
    </span>
  );
}

function DecisionRow({
  decision,
  reorderEnabled,
  getPriorityRank,
  sortable,
  supersededTitle,
  onDelete,
  deletingDecisionId,
}: {
  decision: DecisionNode;
  reorderEnabled: boolean;
  getPriorityRank(id: string): number | undefined;
  sortable: { dragHandleProps: Record<string, unknown> | undefined; isDragging: boolean };
  supersededTitle: string | null;
  onDelete?: (decisionId: string) => void;
  deletingDecisionId?: string | null;
}) {
  const impact = decision.details?.impact ?? "medium";
  const rationale = decision.details?.rationale || decision.body;
  const decidedAt = decision.details?.decidedAt ?? decision.updatedAt;
  const rowClass = reorderEnabled ? ROW_WITH_HANDLE : ROW_BASE;
  const minWidth = reorderEnabled ? ROW_MIN_WIDTH_WITH_HANDLE : ROW_MIN_WIDTH;

  return (
    <div className={cn(rowClass, "px-6 py-4 row-hover")} style={{ minWidth }}>
      {reorderEnabled ? (
        <CollectionDragHandle className="mt-1" {...sortable.dragHandleProps} />
      ) : null}
      <CollectionPriorityRank rank={getPriorityRank(decision.id)} className="mt-0.5" />
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/25 text-muted-foreground">
        <GitBranch className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <h2 className="text-[13.5px] font-semibold leading-snug text-foreground">
          {decision.title}
        </h2>

        {decision.project ? (
          <Link
            to={`/projects/${decision.project.id}`}
            className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-[11px] text-muted-foreground hover:text-highlight"
          >
            <FolderKanban className="h-3 w-3 shrink-0" />
            <span className="truncate">{decision.project.title}</span>
          </Link>
        ) : (
          <p className="mt-1 text-[11px] italic text-muted-foreground/70">
            No linked project
          </p>
        )}

        {rationale ? (
          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
            {rationale}
          </p>
        ) : (
          <p className="mt-1.5 text-[11px] italic text-muted-foreground/70">
            No rationale recorded — add context on the project decision log.
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <StatusPill status={decision.status} />
          <PriorityBadge priority={decision.priority} />
          <SupersedesBadge title={supersededTitle} />
          {decision.area ? <EntityTag tag={decision.area} /> : null}
          {decision.tags.slice(0, 2).map((tag) => (
            <EntityTag key={tag} tag={tag} />
          ))}
          {decision.project ? (
            <Link
              to={`/projects/${decision.project.id}`}
              className="inline-flex items-center gap-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground hover:text-highlight"
            >
              Open project
              <ArrowUpRight className="h-2.5 w-2.5" />
            </Link>
          ) : null}
        </div>
      </div>
      <div className="pt-0.5">
        <ImpactBadge impact={impact} />
      </div>
      <div className="pt-0.5 text-right">
        <time
          className="block font-mono text-[10px] tabular-nums text-muted-foreground"
          dateTime={decidedAt}
          title={formatShortDate(decidedAt)}
        >
          {formatRelativeTime(decidedAt)}
        </time>
        <span className="mt-0.5 block font-mono text-[9px] tabular-nums text-muted-foreground/70">
          {formatShortDate(decidedAt)}
        </span>
      </div>
      {onDelete ? (
        <InlineDeleteButton
          label={decision.title}
          isDeleting={deletingDecisionId === decision.id}
          disabled={Boolean(deletingDecisionId && deletingDecisionId !== decision.id)}
          onDelete={() => onDelete(decision.id)}
        />
      ) : (
        <span />
      )}
    </div>
  );
}

export function DecisionTimeline({
  decisions,
  sort,
  getPriorityRank,
  reorderEnabled = false,
  onSortColumn,
  onReorder,
  onDelete,
  deletingDecisionId = null,
}: DecisionTimelineProps) {
  const headerClass = reorderEnabled ? ROW_WITH_HANDLE : ROW_BASE;
  const minWidth = reorderEnabled ? ROW_MIN_WIDTH_WITH_HANDLE : ROW_MIN_WIDTH;
  const supersededTitlesById = useMemo(() => {
    const titlesById = new Map(decisions.map((decision) => [decision.id, decision.title]));

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
    <div className="overflow-x-auto">
      <div
        className={cn(
          headerClass,
          "border-b border-border bg-muted/20 px-6 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        )}
        style={{ minWidth }}
      >
        {reorderEnabled ? <span aria-hidden /> : null}
        <CollectionSortableHeader
          label="Rank"
          column="order"
          sort={sort}
          onSort={onSortColumn}
        />
        <span aria-hidden />
        <CollectionSortableHeader
          label="Decision"
          column="title"
          sort={sort}
          onSort={onSortColumn}
        />
        <CollectionSortableHeader
          label="Impact"
          column="impact"
          sort={sort}
          onSort={onSortColumn}
        />
        <CollectionSortableHeader
          label="Decided"
          column="decided"
          sort={sort}
          align="end"
          onSort={onSortColumn}
        />
        <span aria-hidden />
      </div>

      <CollectionSortableList
        items={decisions}
        enabled={reorderEnabled}
        className="divide-y divide-border"
        onReorder={(orderedIds) => onReorder?.(orderedIds)}
        renderItem={(decision, sortable) => (
          <DecisionRow
            decision={decision}
            reorderEnabled={reorderEnabled}
            getPriorityRank={getPriorityRank}
            sortable={sortable}
            supersededTitle={supersededTitlesById.get(decision.id) ?? null}
            onDelete={onDelete}
            deletingDecisionId={deletingDecisionId}
          />
        )}
      />
    </div>
  );
}
