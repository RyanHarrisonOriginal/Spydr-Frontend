import { useMemo } from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NoteNode, ProjectNode, UpdateProjectChildInput } from "@/domain/spydr/utils/types";
import { RichTextEditor } from "@/domain/spydr/features/shared/components/RichTextEditor";
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
  ProjectDetailFormPanel,
  ProjectDetailInlineError,
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
  detailFieldClassName,
} from "./ProjectDetailSection";
import { ProjectItemActions } from "./ProjectItemActions";
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
    <ProjectDetailSection className="min-h-[360px]">
      <ProjectDetailSectionHeader
        icon={<FileText className="h-3.5 w-3.5" />}
        label="Notes"
        hint={`${notes.length} linked`}
      />

      <ProjectDetailSectionBody className="min-h-0 flex-1 gap-3 p-3">
        <ProjectDetailFormPanel label="Add note">
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              onAdd();
            }}
          >
            <input
              value={form.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
              placeholder="Title (optional)"
              className={cn(detailFieldClassName, "h-8 px-3.5 py-2")}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <RichTextEditor
                key={formResetKey}
                value={form.body}
                onChange={(body) => onFieldChange("body", body)}
                placeholder="Details, links, or context…"
                className="flex-1"
                minHeightClassName="min-h-[5.5rem]"
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
          <>
            <div className="flex items-center gap-2 px-0.5">
              <SelectionCheckbox
                checked={selection.allSelected}
                indeterminate={selection.someSelected}
                disabled={deletingChildIds.length > 0}
                label="Select all notes"
                onChange={selection.setAll}
              />
              {selection.selectedCount > 0 ? (
                <BulkDeleteBar
                  count={selection.selectedCount}
                  noun="note"
                  isDeleting={isDeletingSelected}
                  disabled={deletingChildIds.length > 0}
                  onDelete={() => onDeleteSelected(selection.selectedIds)}
                  onClear={selection.clear}
                />
              ) : (
                <span className="font-mono text-[10px] text-muted-foreground">
                  Select notes to delete
                </span>
              )}
            </div>
            <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
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
  const hasBody = !isRichTextEmpty(note.body);

  return (
    <ProjectDetailEntry>
      <div className="flex min-w-0 items-start gap-x-2 gap-y-1">
        <SelectionCheckbox
          className="mt-0.5"
          checked={selected}
          disabled={selectDisabled}
          label={`Select ${note.title || "note"}`}
          onChange={onToggleSelected}
        />
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
        <div className="flex shrink-0 items-center gap-0.5">
          <ProjectItemActions
            fieldSet="note"
            values={{ title: note.title, body: note.body }}
            onSave={onUpdate}
            onDelete={onDelete}
            isSaving={isUpdating}
            isDeleting={isDeleting}
            showDelete={false}
          />
          <InlineDeleteButton
            label={note.title || "note"}
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
      {hasBody ? (
        <div
          className="spydr-rich-text mt-1.5 text-[12px] leading-relaxed text-muted-foreground [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1"
          dangerouslySetInnerHTML={{ __html: note.body }}
        />
      ) : (
        <p className="mt-1.5 text-[11px] italic text-muted-foreground/70">
          No additional detail.
        </p>
      )}
    </ProjectDetailEntry>
  );
}
