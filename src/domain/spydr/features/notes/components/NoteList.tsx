import { Link } from "react-router-dom";
import { FileText, FolderKanban } from "lucide-react";
import type { NoteNode } from "@/domain/spydr/utils/types";
import {
  EntityTag,
  PriorityBadge,
  StatusPill,
} from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { CollectionReorderControls } from "@/domain/spydr/features/shared/components/CollectionReorderControls";
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
import {
  isRichTextEmpty,
  richTextToPlainText,
} from "@/domain/spydr/utils/richText";
import { moveIdInOrder } from "@/domain/spydr/utils/collectionReorder";
import { cn } from "@/lib/utils";

interface NoteListProps {
  notes: NoteNode[];
  getPriorityRank(id: string): number | undefined;
  reorderEnabled?: boolean;
  onReorder?(orderedIds: string[]): void;
  onDelete?(noteId: string): void;
  deletingNoteId?: string | null;
}

function notePreview(note: NoteNode): string {
  return richTextToPlainText(note.body).trim();
}

export function NoteList({
  notes,
  getPriorityRank,
  reorderEnabled = false,
  onReorder,
  onDelete,
  deletingNoteId = null,
}: NoteListProps) {
  const moveRank = (id: string, direction: "up" | "down") => {
    const next = moveIdInOrder(
      notes.map((note) => note.id),
      id,
      direction
    );
    if (next) onReorder?.(next);
  };

  return (
    <CollectionSortableList
      items={notes}
      enabled={reorderEnabled}
      layout="grid"
      className={CAPTURE_CARD_GRID_CLASS}
      onReorder={(orderedIds) => onReorder?.(orderedIds)}
      renderItem={(note, sortable) => {
        const preview = notePreview(note);
        const emptyPreview = isRichTextEmpty(note.body) || !preview;

        return (
          <div className={CAPTURE_CARD_CLASS}>
            <div className="flex min-h-0 flex-1 items-start gap-2">
              {reorderEnabled ? (
                <CollectionReorderControls
                  className="mt-0.5"
                  dragHandleProps={sortable.dragHandleProps}
                  canMoveUp={sortable.index > 0}
                  canMoveDown={sortable.index < notes.length - 1}
                  onMoveUp={() => moveRank(note.id, "up")}
                  onMoveDown={() => moveRank(note.id, "down")}
                />
              ) : null}
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-highlight-secondary/25 bg-highlight-secondary/10">
                <FileText className="h-3.5 w-3.5 text-highlight-secondary" />
              </span>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="flex items-start gap-2">
                  <CollectionPriorityRank
                    rank={getPriorityRank(note.id)}
                    className="mt-0.5 shrink-0"
                  />
                  <Link
                    to={`/notes/${note.id}`}
                    className={cn(
                      CAPTURE_CARD_TITLE_CLASS,
                      "min-w-0 flex-1 hover:text-highlight"
                    )}
                  >
                    {note.title || "Untitled note"}
                  </Link>
                  {onDelete ? (
                    <InlineDeleteButton
                      label={note.title || "note"}
                      isDeleting={deletingNoteId === note.id}
                      disabled={Boolean(
                        deletingNoteId && deletingNoteId !== note.id
                      )}
                      onDelete={() => onDelete(note.id)}
                    />
                  ) : null}
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {formatRelativeTime(note.updatedAt)}
                  </span>
                </div>

                {note.project ? (
                  <Link
                    to={`/projects/${note.project.id}`}
                    className={cn(CAPTURE_CARD_META_CLASS, "hover:text-highlight")}
                  >
                    <FolderKanban className="h-3 w-3 shrink-0" />
                    <span className="truncate">{note.project.title}</span>
                  </Link>
                ) : (
                  <div className={CAPTURE_CARD_META_CLASS} aria-hidden />
                )}

                {emptyPreview ? (
                  <p className={CAPTURE_CARD_BODY_EMPTY_CLASS}>No description yet.</p>
                ) : (
                  <p className={CAPTURE_CARD_BODY_CLASS}>{preview}</p>
                )}

                <div className={CAPTURE_CARD_FOOTER_CLASS}>
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
                </div>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
