import { FileText } from "lucide-react";
import type { NoteNode } from "@/domain/spydr/utils/types";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";

interface NoteListProps {
  notes: NoteNode[];
  getPriorityRank(id: string): number | undefined;
  reorderEnabled?: boolean;
  onReorder?(orderedIds: string[]): void;
}

export function NoteList({
  notes,
  getPriorityRank,
  reorderEnabled = false,
  onReorder,
}: NoteListProps) {
  return (
    <CollectionSortableList
      items={notes}
      enabled={reorderEnabled}
      className="divide-y divide-border"
      onReorder={(orderedIds) => onReorder?.(orderedIds)}
      renderItem={(note, sortable) => (
        <div className="flex items-start gap-4 px-6 py-4 row-hover">
          {reorderEnabled ? (
            <CollectionDragHandle className="mt-0.5" {...sortable.dragHandleProps} />
          ) : null}
          <CollectionPriorityRank rank={getPriorityRank(note.id)} className="mt-0.5 shrink-0" />
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="truncate text-[13.5px] font-medium">{note.title}</h2>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {formatRelativeTime(note.updatedAt)}
              </span>
            </div>
            {note.body && (
              <p className="mt-1 truncate text-[12.5px] text-muted-foreground">{note.body}</p>
            )}
          </div>
        </div>
      )}
    />
  );
}
