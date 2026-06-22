import { useMemo } from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NoteNode, UpdateProjectChildInput } from "@/domain/spydr/utils/types";
import {
  formatRelativeTime,
  formatShortDate,
} from "@/domain/spydr/features/shared/components/time";
import type { ProjectNoteFormValues } from "../hooks/useProjectDetailPage";
import { ProjectItemActions } from "./ProjectItemActions";

interface ProjectNotesLogProps {
  notes: NoteNode[];
  form: ProjectNoteFormValues;
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
}

export function ProjectNotesLog({
  notes,
  form,
  canAdd,
  isAdding,
  error,
  onFieldChange,
  onAdd,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: ProjectNotesLogProps) {
  const orderedNotes = useMemo(
    () =>
      [...notes].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [notes]
  );

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card/30">
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Notes
        </span>
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {notes.length} linked
        </span>
      </div>

      <form
        className="border-b border-border/60 p-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd();
        }}
      >
        <div className="rounded-md border border-border/60 bg-muted/15 p-2">
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Add note
          </label>
          <div className="space-y-2">
            <input
              value={form.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
              placeholder="Note title"
              className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-[13px] ring-focus placeholder:text-muted-foreground"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <textarea
                value={form.body}
                onChange={(event) => onFieldChange("body", event.target.value)}
                placeholder="Details, links, or context (optional)"
                rows={2}
                className="min-h-[3.25rem] min-w-0 flex-1 resize-y rounded-md border border-input bg-background px-2.5 py-1.5 text-[12px] leading-snug ring-focus placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="sm"
                className="shrink-0 gap-1.5 sm:mt-0 sm:px-4"
                disabled={!canAdd}
              >
                <Plus className="h-3.5 w-3.5" />
                {isAdding ? "Adding…" : "Add note"}
              </Button>
            </div>
          </div>
        </div>
        {error && (
          <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-[12px] text-destructive">
            {error}
          </p>
        )}
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        {orderedNotes.length > 0 ? (
          <ul className="space-y-2">
            {orderedNotes.map((note) => (
              <NoteEntry
                key={note.id}
                note={note}
                onUpdate={(input) => onUpdate(note.id, input)}
                onDelete={() => onDelete(note.id)}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-md border border-dashed border-border/70 bg-muted/10 px-3 py-6 text-center">
            <p className="text-[13px] text-muted-foreground">
              No notes linked to this project yet.
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground/80">
              Capture meeting takeaways, references, and working context above.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function NoteEntry({
  note,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  note: NoteNode;
  onUpdate: (input: UpdateProjectChildInput) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  const hasBody = note.body.trim().length > 0;

  return (
    <li className="rounded-md border border-border/60 bg-background/40 px-2.5 py-2">
      <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
        <h3 className="min-w-0 flex-1 text-[13px] font-semibold leading-snug">
          {note.title}
        </h3>
        <time
          className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground"
          dateTime={note.updatedAt}
          title={formatShortDate(note.updatedAt)}
        >
          {formatRelativeTime(note.updatedAt)}
        </time>
        <ProjectItemActions
          fieldSet="note"
          values={{ title: note.title, body: note.body }}
          onSave={onUpdate}
          onDelete={onDelete}
          isSaving={isUpdating}
          isDeleting={isDeleting}
        />
      </div>
      {hasBody ? (
        <p className="mt-1.5 whitespace-pre-wrap text-[12px] leading-relaxed text-muted-foreground">
          {note.body}
        </p>
      ) : (
        <p className="mt-1.5 text-[11px] italic text-muted-foreground/70">
          No additional detail.
        </p>
      )}
    </li>
  );
}
