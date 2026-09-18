import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NoteNode, ProjectNode, UpdateProjectChildInput } from "@/domain/spydr/utils/types";
import { RichTextEditor } from "@/domain/spydr/features/shared/components/RichTextEditor";
import { formatNoteListDate } from "@/domain/spydr/features/shared/components/time";
import { cn } from "@/lib/utils";
import { useNoHover } from "@/hooks/useIsPhone";
import type { ProjectNoteFormValues } from "../hooks/useProjectDetailPage";
import {
  ProjectDetailEmpty,
  ProjectDetailInlineError,
  detailQuietInputClassName,
} from "./ProjectDetailSection";
import { EntityTransformMenu } from "@/domain/spydr/features/shared/components/EntityTransformMenu";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { getNotePreview } from "@/domain/spydr/features/notes/utils/notePreview";
import { groupNotesForMobile } from "@/domain/spydr/features/notes/utils/notesMobileGroups";

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
  const groups = useMemo(
    () => groupNotesForMobile(orderedNotes),
    [orderedNotes]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <form
        className="rounded-md bg-muted/25 px-3 py-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd();
        }}
      >
        <input
          value={form.title}
          onChange={(event) => onFieldChange("title", event.target.value)}
          placeholder="Title (optional)"
          className={cn(detailQuietInputClassName, "bg-transparent")}
        />
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
          <RichTextEditor
            key={formResetKey}
            value={form.body}
            onChange={(body) => onFieldChange("body", body)}
            placeholder="Write a note…"
            className="flex-1"
            minHeightClassName="min-h-[4.5rem]"
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
        {error ? (
          <div className="mt-2">
            <ProjectDetailInlineError>{error}</ProjectDetailInlineError>
          </div>
        ) : null}
      </form>

      {orderedNotes.length > 0 ? (
        <div className="flex flex-col">
          {groups.map((group, groupIndex) => (
            <section key={group.id}>
              <h3
                className={cn(
                  "px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground",
                  groupIndex === 0 ? "pb-1 pt-1" : "pb-1 pt-4"
                )}
              >
                {group.label}
              </h3>
              <ul>
                {group.notes.map((note) => (
                  <NoteEntry
                    key={note.id}
                    note={note}
                    projects={projects}
                    projectId={projectId}
                    onUpdate={(input) => onUpdate(note.id, input)}
                    onDelete={() => onDelete(note.id)}
                    isUpdating={isUpdating}
                    isDeleting={deletingChildIds.includes(note.id)}
                    deleteDisabled={
                      deletingChildIds.length > 0 &&
                      !deletingChildIds.includes(note.id)
                    }
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
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
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  deleteDisabled,
}: {
  note: NoteNode;
  projects: ProjectNode[];
  projectId: string;
  onUpdate: (input: UpdateProjectChildInput) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
  deleteDisabled: boolean;
}) {
  const noHover = useNoHover();
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(note.title);
  const [draftBody, setDraftBody] = useState(note.body);
  const preview = getNotePreview(note.title, note.body);
  const titleLabel = note.title.trim() || preview.title;

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
    <li
      className={cn(
        "group rounded-md px-2 py-2",
        editing ? "bg-muted/30" : "hover:bg-muted/25"
      )}
    >
      {editing ? (
        <div
          className="space-y-2"
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
          <input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="Title (optional)"
            className={cn(detailQuietInputClassName, "h-8")}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                cancelEdit();
              }
            }}
          />
          <RichTextEditor
            value={draftBody}
            onChange={setDraftBody}
            placeholder="Write a note…"
            minHeightClassName="min-h-[7rem]"
            quiet
          />
          <div className="flex items-center justify-end gap-2">
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
              {isUpdating ? "Saving…" : "Done"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={startEdit}
            className="min-w-0 flex-1 rounded-sm py-0.5 text-left"
          >
            <span className="flex items-baseline gap-2">
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[13px] font-semibold leading-snug",
                  preview.untitled && !preview.snippet && !note.title.trim()
                    ? "italic text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {preview.title}
              </span>
              <time
                className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground"
                dateTime={note.updatedAt}
                title={new Date(note.updatedAt).toLocaleString()}
              >
                {formatNoteListDate(note.updatedAt)}
              </time>
            </span>
            {preview.snippet ? (
              <span className="mt-0.5 line-clamp-2 block text-[12px] leading-relaxed text-muted-foreground">
                {preview.snippet}
              </span>
            ) : null}
          </button>
          <div
            className={cn(
              "flex shrink-0 items-center gap-0.5 pt-0.5",
              !noHover &&
                "opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
            )}
          >
            <Link
              to={`/notes/${note.id}`}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Open ${titleLabel}`}
              title="Open note"
            >
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <InlineDeleteButton
              label={titleLabel}
              isDeleting={isDeleting}
              disabled={deleteDisabled}
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
      )}
    </li>
  );
}
