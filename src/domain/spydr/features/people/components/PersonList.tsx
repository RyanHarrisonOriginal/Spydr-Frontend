import { Link } from "react-router-dom";
import type { PersonNode } from "@/domain/spydr/utils/types";
import {
  personDisplayName,
  personInitial,
} from "@/domain/spydr/utils/projectPersonas";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import { CollectionSortableHeader } from "@/domain/spydr/features/shared/components/CollectionSortableHeader";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import type { CollectionSortState } from "@/domain/spydr/utils/collectionView";

interface PersonListProps {
  people: PersonNode[];
  sort: CollectionSortState;
  getPriorityRank(id: string): number | undefined;
  reorderEnabled?: boolean;
  onSortColumn(column: string): void;
  onReorder?(orderedIds: string[]): void;
  onDelete?(personId: string): void;
  deletingPersonId?: string | null;
}

const ROW_INNER =
  "grid grid-cols-[36px_40px_minmax(220px,1fr)_minmax(160px,1fr)_minmax(180px,1fr)_72px] items-center gap-4";

export function PersonList({
  people,
  sort,
  getPriorityRank,
  reorderEnabled = false,
  onSortColumn,
  onReorder,
  onDelete,
  deletingPersonId = null,
}: PersonListProps) {
  return (
    <div className="overflow-x-auto">
      <div
        className={`${reorderEnabled ? "grid grid-cols-[24px_minmax(0,1fr)] items-center gap-4 px-6" : "px-6"} border-b border-border bg-muted/20 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground`}
      >
        {reorderEnabled ? <span aria-hidden /> : null}
        <div className={ROW_INNER}>
          <CollectionSortableHeader
            label="Rank"
            column="order"
            sort={sort}
            onSort={onSortColumn}
          />
          <span />
          <span>Name</span>
          <span>Role</span>
          <span>Organization</span>
          <span />
        </div>
      </div>
      <CollectionSortableList
        items={people}
        enabled={reorderEnabled}
        className="divide-y divide-border"
        onReorder={(orderedIds) => onReorder?.(orderedIds)}
        renderItem={(person, sortable) => (
          <div
            className={`${reorderEnabled ? "grid grid-cols-[24px_minmax(0,1fr)] items-center gap-4 px-6 py-3 row-hover" : "px-6 py-3 row-hover"}`}
          >
            {reorderEnabled ? (
              <CollectionDragHandle {...sortable.dragHandleProps} />
            ) : null}
            <div className={ROW_INNER}>
              <CollectionPriorityRank rank={getPriorityRank(person.id)} />
              <Link to={`/people/${person.id}`} className="contents">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-muted/40 font-mono text-[11px] font-medium text-foreground/80">
                  {personInitial(person)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium hover:text-primary">
                    {personDisplayName(person)}
                  </p>
                  {person.details?.email ? (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {person.details.email}
                    </p>
                  ) : null}
                </div>
                <span className="truncate text-[12px] text-foreground/85">
                  {person.details?.title || "—"}
                </span>
                <span className="truncate text-[12px] text-muted-foreground">
                  {person.details?.organization || "—"}
                </span>
              </Link>
              {onDelete ? (
                <InlineDeleteButton
                  label={personDisplayName(person)}
                  isDeleting={deletingPersonId === person.id}
                  disabled={Boolean(deletingPersonId && deletingPersonId !== person.id)}
                  onDelete={() => onDelete(person.id)}
                />
              ) : null}
            </div>
          </div>
        )}
      />
    </div>
  );
}

export function PersonListCard({ person }: { person: PersonNode }) {
  const subtitle = [person.details?.title, person.details?.organization]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      to={`/people/${person.id}`}
      className="flex min-w-0 items-center gap-2 rounded-md border border-border/60 bg-background px-2 py-1.5 transition-colors hover:border-border hover:bg-muted/20"
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border bg-muted/40 font-mono text-[10px]">
        {personInitial(person)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-medium">
          {personDisplayName(person)}
        </span>
        {subtitle ? (
          <span className="block truncate text-[10px] text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
    </Link>
  );
}
