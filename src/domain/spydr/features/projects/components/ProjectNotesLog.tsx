import { useMemo } from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NoteNode, UpdateProjectChildInput } from "@/domain/spydr/utils/types";
import {
  formatRelativeTime,
  formatShortDate,
} from "@/domain/spydr/features/shared/components/time";
import { cn } from "@/lib/utils";
import type { ProjectNoteFormValues } from "../hooks/useProjectDetailPage";
import {
  ProjectDetailEmpty,
  ProjectDetailEntry,
  ProjectDetailFormPanel,
  ProjectDetailInlineError,
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
  detailFieldClassName,
  detailTextareaClassName,
} from "./ProjectDetailSection";
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
    <ProjectDetailSection>
      <ProjectDetailSectionHeader
        icon={<FileText className="h-3.5 w-3.5" />}
        label="Notes"
        hint={`${notes.length} linked`}
      />

      <ProjectDetailSectionBody>
        <ProjectDetailFormPanel label="Add note">
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
              placeholder="Note title"
              className={cn(detailFieldClassName, "h-8")}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <textarea
                value={form.body}
                onChange={(event) => onFieldChange("body", event.target.value)}
                placeholder="Details, links, or context (optional)"
                rows={2}
                className={cn(detailTextareaClassName, "min-h-[3.25rem] flex-1")}
              />
              <Button
                type="submit"
                size="sm"
                className="shrink-0 gap-1.5 sm:px-4"
                disabled={!canAdd}
              >
                <Plus className="h-3.5 w-3.5" />
                {isAdding ? "Adding…" : "Add note"}
              </Button>
            </div>
            {error && <ProjectDetailInlineError>{error}</ProjectDetailInlineError>}
          </form>
        </ProjectDetailFormPanel>

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
          <ProjectDetailEmpty
            title="No notes linked to this project yet."
            description="Capture meeting takeaways, references, and working context above."
          />
        )}
      </ProjectDetailSectionBody>
    </ProjectDetailSection>
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
    <ProjectDetailEntry>
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
    </ProjectDetailEntry>
  );
}
