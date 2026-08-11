import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  ActiveNoteProposal,
  ActiveNoteProposalAttachment,
  ActiveNoteProposalOperation,
  DuplicateResolution,
  OperationPayload,
  SpydrObjectType,
} from "@/domain/spydr/utils/activeNoteTypes";
import { ACTIVE_NOTE_MAX_LENGTH } from "@/domain/spydr/utils/activeNoteTypes";
import type { ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { cn } from "@/lib/utils";
import { groupProposalOperations } from "../utils/proposalPresentation";
import { ActiveNoteProposalCard } from "./ActiveNoteProposalCard";
import { ActiveNoteProposalEditor } from "./ActiveNoteProposalEditor";

interface ActiveNoteReviewProps {
  proposal: ActiveNoteProposal;
  operations: ActiveNoteProposalOperation[];
  projects: ProjectNode[];
  tasks: TaskNode[];
  content: string;
  characterCount: number;
  selectedCount: number;
  isApplying: boolean;
  isReanalyzing: boolean;
  applyError: string | null;
  noteError: string | null;
  validationErrors: Record<string, string>;
  editingOperationId: string | null;
  onContentChange(value: string): void;
  onReanalyze(): void;
  onToggleSelected(operationId: string, selected: boolean): void;
  onReject(operationId: string): void;
  onEdit(operationId: string): void;
  onEditingOpenChange(open: boolean): void;
  onSaveEditedPayload(operationId: string, payload: OperationPayload): void;
  onDuplicateResolution(
    operationId: string,
    resolution: DuplicateResolution
  ): void;
  onProjectChange(operationId: string, projectId: string | null): void;
  onObjectTypeChange(operationId: string, objectType: SpydrObjectType): void;
  onAttachmentChange(
    operationId: string,
    attachment: ActiveNoteProposalAttachment | null
  ): void;
  onApply(): void;
}

export function ActiveNoteReview({
  proposal,
  operations,
  projects,
  tasks,
  content,
  characterCount,
  selectedCount,
  isApplying,
  isReanalyzing,
  applyError,
  noteError,
  validationErrors,
  editingOperationId,
  onContentChange,
  onReanalyze,
  onToggleSelected,
  onReject,
  onEdit,
  onEditingOpenChange,
  onSaveEditedPayload,
  onDuplicateResolution,
  onProjectChange,
  onObjectTypeChange,
  onAttachmentChange,
  onApply,
}: ActiveNoteReviewProps) {
  const editingOperation =
    operations.find((op) => op.id === editingOperationId) ?? null;
  const actionable = operations.filter((op) => op.operationType !== "no_action");
  const onlyNoAction =
    actionable.length === 0 &&
    operations.some((op) => op.operationType === "no_action");
  const cardGroups = groupProposalOperations(
    onlyNoAction ? [] : actionable,
    proposal.segments ?? []
  );
  const reviewCountLabel = onlyNoAction
    ? "None"
    : String(cardGroups.length);
  const overLimit = characterCount > ACTIVE_NOTE_MAX_LENGTH;
  const noteBusy = isApplying || isReanalyzing;
  const canReanalyze =
    content.trim().length > 0 && !overLimit && !noteBusy;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="mx-auto grid h-full min-h-0 w-full max-w-6xl grid-rows-[minmax(0,auto)_minmax(0,1fr)] gap-4 px-6 pt-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:grid-rows-1 lg:gap-6 md:px-8">
        <aside className="flex min-h-0 flex-col gap-3 overflow-hidden lg:gap-4">
          <section className="flex min-h-0 flex-col rounded-md border border-border bg-muted/10 p-4 lg:min-h-0 lg:flex-1">
            <div className="flex shrink-0 items-center justify-between gap-3">
              <Label
                htmlFor="active-note-review-content"
                className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Active note
              </Label>
              <span
                className={cn(
                  "font-mono text-[10px] tabular-nums",
                  overLimit ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {characterCount.toLocaleString()} /{" "}
                {ACTIVE_NOTE_MAX_LENGTH.toLocaleString()}
              </span>
            </div>
            <Textarea
              id="active-note-review-content"
              value={content}
              onChange={(event) => onContentChange(event.target.value)}
              className="mt-3 min-h-[160px] flex-1 resize-y border-border/80 bg-background text-[14px] leading-relaxed lg:min-h-0"
              disabled={noteBusy}
              aria-invalid={Boolean(noteError) || overLimit}
            />
            {(noteError || overLimit) && (
              <p className="mt-2 text-[12.5px] text-destructive" role="alert">
                {noteError ??
                  `Notes can be at most ${ACTIVE_NOTE_MAX_LENGTH.toLocaleString()} characters.`}
              </p>
            )}
            <div className="mt-3 flex shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onReanalyze}
                disabled={!canReanalyze}
              >
                {isReanalyzing ? "Re-analyzing…" : "Re-analyze"}
              </Button>
            </div>
          </section>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-md border border-border bg-muted/5">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <h2 className="text-[14px] font-semibold tracking-tight">Suggestions</h2>
            <p
              className="font-mono text-[11px] tabular-nums text-muted-foreground"
              aria-live="polite"
            >
              {onlyNoAction ? "0" : reviewCountLabel}
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
            {onlyNoAction ? (
              <p className="py-6 text-center text-[13px] text-muted-foreground">
                Nothing to capture from this note.
              </p>
            ) : (
              cardGroups.map((group) => (
                <ActiveNoteProposalCard
                  key={group.root.id}
                  operation={group.root}
                  nestedOperations={group.children}
                  projects={projects}
                  tasks={tasks}
                  validationErrors={validationErrors}
                  disabled={noteBusy}
                  onToggleSelected={onToggleSelected}
                  onReject={onReject}
                  onEdit={onEdit}
                  onDuplicateResolution={onDuplicateResolution}
                  onProjectChange={onProjectChange}
                  onObjectTypeChange={onObjectTypeChange}
                  onAttachmentChange={onAttachmentChange}
                />
              ))
            )}

            {applyError ? (
              <p className="text-[12.5px] text-destructive" role="alert">
                {applyError}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-2.5">
            <p className="text-[12px] text-muted-foreground">
              {selectedCount === 0 ? "None selected" : `${selectedCount} selected`}
            </p>
            <Button
              type="button"
              size="sm"
              onClick={onApply}
              disabled={selectedCount === 0 || noteBusy || onlyNoAction}
              aria-label={
                isApplying
                  ? "Applying selected changes"
                  : `Apply ${selectedCount} selected changes`
              }
            >
              {isApplying ? "Applying…" : selectedCount === 0 ? "Apply" : `Apply (${selectedCount})`}
            </Button>
          </div>
        </section>
      </div>

      <ActiveNoteProposalEditor
        operation={editingOperation}
        projects={projects}
        open={Boolean(editingOperation)}
        onOpenChange={onEditingOpenChange}
        onSave={(payload) => {
          if (editingOperation) {
            onSaveEditedPayload(editingOperation.id, payload);
          }
        }}
      />
    </div>
  );
}
