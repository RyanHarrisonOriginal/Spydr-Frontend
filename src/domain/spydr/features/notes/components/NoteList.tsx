import { useEffect, useMemo, useState } from "react";
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
import {
  isRichTextEmpty,
  richTextToPlainText,
} from "@/domain/spydr/utils/richText";
import { useIsPhone } from "@/hooks/useIsPhone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { groupNotesForMobile } from "../utils/notesMobileGroups";

interface NoteListProps {
  notes: NoteNode[];
  getPriorityRank(id: string): number | undefined;
  reorderEnabled?: boolean;
  onReorder?(orderedIds: string[]): void;
  onDelete?(noteId: string): void;
  onDeleteSelected?(noteIds: string[]): void;
  deletingNoteIds?: string[];
}

function notePreview(note: NoteNode): string {
  const plain = richTextToPlainText(note.body);
  return plain || "No additional detail";
}

function MobileNoteFeed({
  notes,
  onDeleteSelected,
  deletingNoteIds,
}: {
  notes: NoteNode[];
  onDeleteSelected?(noteIds: string[]): void;
  deletingNoteIds: string[];
}) {
  const [selectMode, setSelectMode] = useState(false);
  const noteIds = useMemo(() => notes.map((note) => note.id), [notes]);
  const selection = useItemSelection(noteIds);
  const { clear: clearSelection } = selection;
  const canSelect = Boolean(onDeleteSelected);
  const groups = useMemo(() => groupNotesForMobile(notes), [notes]);
  const isBulkDeleting =
    deletingNoteIds.length > 0 &&
    selection.selectedIds.some((id) => deletingNoteIds.includes(id));

  useEffect(() => {
    if (!selectMode) clearSelection();
  }, [selectMode, clearSelection]);

  return (
    <div className="pb-4">
      {canSelect ? (
        <div className="flex items-center gap-2 border-b border-border/80 px-4 py-2">
          {selectMode ? (
            <>
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
                <span className="min-w-0 flex-1 font-mono text-[10px] text-muted-foreground">
                  Tap notes to select
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto h-8 px-2.5 text-[12px]"
                onClick={() => setSelectMode(false)}
              >
                Done
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto h-8 px-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
              onClick={() => setSelectMode(true)}
            >
              Select
            </Button>
          )}
        </div>
      ) : null}

      <div className="divide-y divide-border/70">
        {groups.map((group) => (
          <section key={group.id} className="pt-3">
            <h2 className="px-4 pb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {group.label}
            </h2>
            <ul className="divide-y divide-border/50">
              {group.notes.map((note) => {
                const preview = notePreview(note);
                const emptyPreview = isRichTextEmpty(note.body);

                if (selectMode && canSelect) {
                  return (
                    <li key={note.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-pressed={selection.isSelected(note.id)}
                        aria-label={`Select ${note.title || "note"}`}
                        onClick={() => {
                          if (deletingNoteIds.length > 0) return;
                          selection.toggle(note.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            if (deletingNoteIds.length > 0) return;
                            selection.toggle(note.id);
                          }
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors",
                          deletingNoteIds.length > 0 && "pointer-events-none opacity-60",
                          selection.isSelected(note.id)
                            ? "bg-highlight/[0.06]"
                            : "active:bg-muted/40"
                        )}
                      >
                        <SelectionCheckbox
                          className="mt-0.5"
                          checked={selection.isSelected(note.id)}
                          disabled={deletingNoteIds.length > 0}
                          label={`Select ${note.title || "note"}`}
                          onChange={() => selection.toggle(note.id)}
                        />
                        <MobileNoteBody
                          note={note}
                          preview={preview}
                          emptyPreview={emptyPreview}
                        />
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={note.id}>
                    <Link
                      to={`/notes/${note.id}`}
                      className="block px-4 py-3.5 active:bg-muted/40"
                    >
                      <MobileNoteBody
                        note={note}
                        preview={preview}
                        emptyPreview={emptyPreview}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function MobileNoteBody({
  note,
  preview,
  emptyPreview,
}: {
  note: NoteNode;
  preview: string;
  emptyPreview: boolean;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 truncate text-[15px] font-medium leading-snug tracking-[-0.01em] text-foreground">
          {note.title || "Untitled note"}
        </h3>
        <time
          dateTime={note.updatedAt}
          className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground"
          title={formatShortDate(note.updatedAt)}
        >
          {formatRelativeTime(note.updatedAt)}
        </time>
      </div>
      <p
        className={cn(
          "mt-1 line-clamp-2 text-[13px] leading-snug",
          emptyPreview
            ? "italic text-muted-foreground/65"
            : "text-muted-foreground"
        )}
      >
        {preview}
      </p>
      {note.project ? (
        <span className="mt-2 inline-flex max-w-full items-center gap-1 rounded-md bg-muted/40 px-1.5 py-0.5 text-[11px] text-muted-foreground">
          <FolderKanban className="h-3 w-3 shrink-0" />
          <span className="truncate">{note.project.title}</span>
        </span>
      ) : null}
    </div>
  );
}

function DesktopNoteList({
  notes,
  getPriorityRank,
  reorderEnabled,
  onReorder,
  onDelete,
  onDeleteSelected,
  deletingNoteIds,
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
        <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-4 py-1.5 md:px-6">
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
            <div className="flex items-start gap-3 px-4 py-4 row-hover md:gap-4 md:px-6">
              {reorderEnabled ? (
                <CollectionDragHandle
                  className="mt-0.5"
                  {...sortable.dragHandleProps}
                />
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
              <CollectionPriorityRank
                rank={getPriorityRank(note.id)}
                className="mt-0.5 shrink-0"
              />
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

export function NoteList(props: NoteListProps) {
  const isPhone = useIsPhone();

  if (isPhone) {
    return (
      <MobileNoteFeed
        notes={props.notes}
        onDeleteSelected={props.onDeleteSelected}
        deletingNoteIds={props.deletingNoteIds ?? []}
      />
    );
  }

  return <DesktopNoteList {...props} />;
}
