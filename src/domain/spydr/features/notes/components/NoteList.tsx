import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, FolderKanban } from "lucide-react";
import type { NoteNode } from "@/domain/spydr/utils/types";
import {
  EntityTag,
  PriorityBadge,
  StatusPill,
} from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { SelectionCheckbox } from "@/domain/spydr/features/shared/components/SelectionCheckbox";
import { BulkDeleteBar } from "@/domain/spydr/features/shared/components/BulkDeleteBar";
import { useItemSelection } from "@/domain/spydr/features/shared/hooks/useItemSelection";
import {
  formatRelativeTime,
  formatShortDate,
} from "@/domain/spydr/features/shared/components/time";
import { isRichTextEmpty } from "@/domain/spydr/utils/richText";
import { cn } from "@/lib/utils";

interface NoteListProps {
  notes: NoteNode[];
  getPriorityRank(id: string): number | undefined;
  reorderEnabled?: boolean;
  onReorder?(orderedIds: string[]): void;
  onDelete?(noteId: string): void;
  onDeleteSelected?(noteIds: string[]): void;
  deletingNoteIds?: string[];
}

export function NoteList({
  notes,
  getPriorityRank,
  reorderEnabled = false,
  onReorder,
  onDelete,
  onDeleteSelected,
  deletingNoteIds = [],
}: NoteListProps) {
  const noteIds = useMemo(() => notes.map((note) => note.id), [notes]);
  const selection = useItemSelection(noteIds);
  const canSelect = Boolean(onDeleteSelected);
  const isBulkDeleting =
    deletingNoteIds.length > 0 &&
    selection.selectedIds.some((id) => deletingNoteIds.includes(id));

  return (
    <div>
      {canSelect && notes.length > 0 ? (
        <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-6 py-1.5">
          <SelectionCheckbox
            checked={selection.allSelected}
            indeterminate={selection.someSelected}
            disabled={deletingNoteIds.length > 0}
            label="Select all notes"
            onChange={selection.setAll}
          />
          {selection.selectedCount > 0 ? (
            <BulkDeleteBar
              count={selection.selectedCount}
              noun="note"
              isDeleting={isBulkDeleting}
              disabled={deletingNoteIds.length > 0}
              onDelete={() => onDeleteSelected?.(selection.selectedIds)}
              onClear={selection.clear}
            />
          ) : (
            <span className="font-mono text-[10px] text-muted-foreground">
              Select notes to delete
            </span>
          )}
        </div>
      ) : null}
      <CollectionSortableList
        items={notes}
        enabled={reorderEnabled}
        className="divide-y divide-border"
        onReorder={(orderedIds) => onReorder?.(orderedIds)}
        renderItem={(note, sortable) => {
          const hasBody = !isRichTextEmpty(note.body);
          const isDeleting = deletingNoteIds.includes(note.id);

          return (
            <div className="flex items-start gap-4 px-6 py-4 row-hover">
              {reorderEnabled ? (
                <CollectionDragHandle className="mt-0.5" {...sortable.dragHandleProps} />
              ) : null}
              {canSelect ? (
                <SelectionCheckbox
                  className="mt-0.5"
                  checked={selection.isSelected(note.id)}
                  disabled={deletingNoteIds.length > 0}
                  label={`Select ${note.title || "note"}`}
                  onChange={() => selection.toggle(note.id)}
                />
              ) : null}
              <CollectionPriorityRank rank={getPriorityRank(note.id)} className="mt-0.5 shrink-0" />
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <Link
                    to={`/notes/${note.id}`}
                    className="min-w-0 truncate text-[13.5px] font-medium hover:text-primary"
                  >
                    {note.title}
                  </Link>
                  <span
                    className="shrink-0 font-mono text-[10px] text-muted-foreground"
                    title={formatShortDate(note.updatedAt)}
                  >
                    {formatRelativeTime(note.updatedAt)}
                  </span>
                </div>

                {note.project ? (
                  <Link
                    to={`/projects/${note.project.id}`}
                    className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-[11px] text-muted-foreground hover:text-primary"
                  >
                    <FolderKanban className="h-3 w-3 shrink-0" />
                    <span className="truncate">{note.project.title}</span>
                  </Link>
                ) : null}

                {hasBody ? (
                  <div
                    className="spydr-rich-text mt-1.5 line-clamp-3 overflow-hidden text-[12.5px] leading-snug text-muted-foreground [&_li]:my-0 [&_ol]:my-0 [&_p]:my-0 [&_ul]:my-0"
                    dangerouslySetInnerHTML={{ __html: note.body }}
                  />
                ) : (
                  <p className="mt-1.5 text-[11px] italic text-muted-foreground/70">
                    No additional detail.
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <StatusPill status={note.status} />
                  <PriorityBadge priority={note.priority} />
                  {note.area ? <EntityTag tag={note.area} /> : null}
                  {note.tags.slice(0, 3).map((tag) => (
                    <EntityTag key={tag} tag={tag} />
                  ))}
                  {note.tags.length > 3 ? (
                    <span className="font-mono text-[9px] text-muted-foreground">
                      +{note.tags.length - 3}
                    </span>
                  ) : null}
                  <Link
                    to={`/notes/${note.id}`}
                    className={cn(
                      "font-mono text-[9px] uppercase tracking-wider text-muted-foreground",
                      "hover:text-primary"
                    )}
                  >
                    Read note
                  </Link>
                </div>
              </div>
              {onDelete ? (
                <InlineDeleteButton
                  label={note.title}
                  isDeleting={isDeleting}
                  disabled={deletingNoteIds.length > 0 && !isDeleting}
                  onDelete={() => onDelete(note.id)}
                />
              ) : null}
            </div>
          );
        }}
      />
    </div>
  );
}
