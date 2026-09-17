import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NoteNode, ProjectNode, UpdateProjectChildInput } from "@/domain/spydr/utils/types";
import { RichTextEditor } from "@/domain/spydr/features/shared/components/RichTextEditor";
import { RichTextHtml } from "@/domain/spydr/features/shared/components/RichTextHtml";
import {
  formatRelativeTime,
  formatShortDate,
} from "@/domain/spydr/features/shared/components/time";
import { isRichTextEmpty } from "@/domain/spydr/utils/richText";
import { cn } from "@/lib/utils";
import type { ProjectNoteFormValues } from "../hooks/useProjectDetailPage";
import {
  ProjectDetailEmpty,
  ProjectDetailEntry,
  ProjectDetailInlineError,
  detailQuietInputClassName,
} from "./ProjectDetailSection";
import { EntityTransformMenu } from "@/domain/spydr/features/shared/components/EntityTransformMenu";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { SelectionCheckbox } from "@/domain/spydr/features/shared/components/SelectionCheckbox";
import { BulkDeleteBar } from "@/domain/spydr/features/shared/components/BulkDeleteBar";
import { useItemSelection } from "@/domain/spydr/features/shared/hooks/useItemSelection";

interface ProjectNotesLogProps {
  notes: NoteNode[];
  projects: ProjectNode[];
  projectId: string;
  form: ProjectNoteFormValues;
  formResetKey?: number;
  canAdd: boolean;
  isAdding: boolean;
  error: string | null;
  onFieldChange<TField extends keyof ProjectNoteFormValues>(
    field: TField,
    value: ProjectNoteFormValues[TField]
  ): void;
  onAdd(): void;
  onUpdate(childId: string, input: UpdateProjectChildInput): void;
  onDelete(childId: string): void;
  onDeleteSelected(childIds: string[]): void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  deletingChildIds?: string[];
}

export function ProjectNotesLog({
  notes,
  projects,
  projectId,
  form,
  formResetKey = 0,
  canAdd,
  isAdding,
  error,
  onFieldChange,
  onAdd,
  onUpdate,
  onDelete,
  onDeleteSelected,
  isUpdating = false,
  deletingChildIds = [],
}: ProjectNotesLogProps) {
  const orderedNotes = useMemo(
    () =>
      [...notes].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [notes]
  );
  const noteIds = useMemo(
    () => orderedNotes.map((note) => note.id),
    [orderedNotes]
  );
  const selection = useItemSelection(noteIds);
  const isDeletingSelected =
    deletingChildIds.length > 0 &&
    selection.selectedIds.some((id) => deletingChildIds.includes(id));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd();
        }}
      >
        <input
          value={form.title}
          onChange={(event) => onFieldChange("title", event.target.value)}
          placeholder="Title (optional)"
          className={detailQuietInputClassName}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <RichTextEditor
            key={formResetKey}
            value={form.body}
            onChange={(body) => onFieldChange("body", body)}
            placeholder="Details, links, or context…"
            className="flex-1"
            minHeightClassName="min-h-[5.5rem]"
            quiet
          />
          <Button
            type="submit"
            className="h-8 shrink-0 gap-1.5 rounded-md sm:px-3"
            disabled={!canAdd}
          >
            <Plus className="h-3.5 w-3.5" />
            {isAdding ? "Adding…" : "Add note"}
          </Button>
        </div>
        {error ? <ProjectDetailInlineError>{error}</ProjectDetailInlineError> : null}
      </form>

      {orderedNotes.length > 0 ? (
        <>
          {selection.selectedCount > 0 ? (
            <div className="flex items-center gap-2 px-0.5">
              <SelectionCheckbox
                checked={selection.allSelected}
                indeterminate={selection.someSelected}
                disabled={deletingChildIds.length > 0}
                label="Select all notes"
                onChange={selection.setAll}
              />
              <BulkDeleteBar
                count={selection.selectedCount}
                noun="note"
                isDeleting={isDeletingSelected}
                disabled={deletingChildIds.length > 0}
                onDelete={() => onDeleteSelected(selection.selectedIds)}
                onClear={selection.clear}
              />
            </div>
          ) : null}
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {orderedNotes.map((note) => (
              <NoteEntry
                key={note.id}
                note={note}
                projects={projects}
                projectId={projectId}
                selected={selection.isSelected(note.id)}
                onToggleSelected={() => selection.toggle(note.id)}
                onUpdate={(input) => onUpdate(note.id, input)}
                onDelete={() => onDelete(note.id)}
                isUpdating={isUpdating}
                isDeleting={deletingChildIds.includes(note.id)}
                deleteDisabled={
                  deletingChildIds.length > 0 &&
                  !deletingChildIds.includes(note.id)
                }
                selectDisabled={deletingChildIds.length > 0}
              />
            ))}
          </ul>
        </>
      ) : (
        <ProjectDetailEmpty
          title="No notes linked yet."
          description="Capture meeting takeaways, references, and working context above."
        />
      )}
    </div>
  );
}

function NoteEntry({
  note,
  projects,
  projectId,
  selected,
  onToggleSelected,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  deleteDisabled,
  selectDisabled,
}: {
  note: NoteNode;
  projects: ProjectNode[];
  projectId: string;
  selected: boolean;
  onToggleSelected: () => void;
  onUpdate: (input: UpdateProjectChildInput) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
  deleteDisabled: boolean;
  selectDisabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(note.title);
  const [draftBody, setDraftBody] = useState(note.body);
  const hasBody = !isRichTextEmpty(note.body);
  const titleLabel = note.title || "Untitled note";

  const startEdit = () => {
    setDraftTitle(note.title);
    setDraftBody(note.body);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraftTitle(note.title);
    setDraftBody(note.body);
    setEditing(false);
  };

  const saveEdit = () => {
    const title = draftTitle.trim();
    const body = draftBody;
    if (title === note.title.trim() && body === note.body) {
      setEditing(false);
      return;
    }
    onUpdate({ title, body });
    setEditing(false);
  };

  return (
    <ProjectDetailEntry>
      <div className="flex min-w-0 items-center gap-x-2 gap-y-1">
        <SelectionCheckbox
          className="mt-0.5"
          checked={selected}
          disabled={selectDisabled || editing}
          label={`Select ${titleLabel}`}
          onChange={onToggleSelected}
        />
        {editing ? (
          <input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="Title (optional)"
            className={cn(detailQuietInputClassName, "h-8 min-w-0 flex-1")}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                cancelEdit();
              }
            }}
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="min-w-0 flex-1 truncate text-left text-[13px] font-semibold hover:text-highlight"
          >
            {note.title || (
              <span className="font-medium italic text-muted-foreground">
                Untitled note
              </span>
            )}
          </button>
        )}
        <time
          className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground"
          dateTime={note.updatedAt}
          title={formatShortDate(note.updatedAt)}
        >
          {formatRelativeTime(note.updatedAt)}
        </time>
        <div className="flex shrink-0 items-center gap-0.5">
          {editing ? null : (
            <>
              <button
                type="button"
                onClick={startEdit}
                disabled={isUpdating || isDeleting}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label={`Edit ${titleLabel}`}
              >
                <Pencil className="h-3 w-3" />
              </button>
              <Link
                to={`/notes/${note.id}`}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Open ${titleLabel}`}
                title="Open note"
              >
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </>
          )}
          <InlineDeleteButton
            label={titleLabel}
            isDeleting={isDeleting}
            disabled={deleteDisabled || editing}
            onDelete={onDelete}
          />
          <EntityTransformMenu
            nodeId={note.id}
            sourceType="note"
            sourceTitle={note.title}
            projects={projects}
            defaultProjectId={projectId}
            compact
          />
        </div>
      </div>
      {editing ? (
        <div
          className="mt-1.5 space-y-2"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              cancelEdit();
            }
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              saveEdit();
            }
          }}
        >
          <RichTextEditor
            value={draftBody}
            onChange={setDraftBody}
            placeholder="Details, links, or context…"
            minHeightClassName="min-h-[7rem]"
            quiet
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-[11px]"
              onClick={cancelEdit}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 px-2.5 text-[11px]"
              onClick={saveEdit}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      ) : hasBody ? (
        <div
          role="button"
          tabIndex={0}
          onClick={startEdit}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              startEdit();
            }
          }}
          className="mt-1.5 cursor-pointer rounded-sm text-left hover:bg-muted/30"
        >
          <RichTextHtml
            html={note.body}
            className="text-[12px] leading-relaxed text-muted-foreground"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className="mt-1.5 text-left text-[11px] italic text-muted-foreground/70 hover:text-muted-foreground"
        >
          No additional detail. Click to edit.
        </button>
      )}
    </ProjectDetailEntry>
  );
}
