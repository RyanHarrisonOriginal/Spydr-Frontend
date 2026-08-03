import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  ActiveNoteProposal,
  ActiveNoteProposalOperation,
  DuplicateResolution,
  OperationPayload,
} from "@/domain/spydr/utils/activeNoteTypes";
import { ACTIVE_NOTE_MAX_LENGTH } from "@/domain/spydr/utils/activeNoteTypes";
import type { ProjectNode } from "@/domain/spydr/utils/types";
import { cn } from "@/lib/utils";
import { filterUserFacingWarnings } from "@/domain/spydr/utils/activeNoteWarnings";
import {
  groupProposalOperations,
  routingDestinationLabel,
} from "../utils/proposalPresentation";
import { ActiveNoteProposalCard } from "./ActiveNoteProposalCard";
import { ActiveNoteProposalEditor } from "./ActiveNoteProposalEditor";
import { ActiveNoteWarning } from "./ActiveNoteWarning";

interface ActiveNoteReviewProps {
  proposal: ActiveNoteProposal;
  operations: ActiveNoteProposalOperation[];
  projects: ProjectNode[];
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
  onApply(): void;
}

export function ActiveNoteReview({
  proposal,
  operations,
  projects,
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
    ? "Nothing to review"
    : cardGroups.length === 1
      ? "1 suggestion to review"
      : `${cardGroups.length} suggestions to review`;
  const userWarnings = filterUserFacingWarnings(proposal.warnings);
  const overLimit = characterCount > ACTIVE_NOTE_MAX_LENGTH;
  const noteBusy = isApplying || isReanalyzing;
  const canReanalyze =
    content.trim().length > 0 && !overLimit && !noteBusy;
  const routes = proposal.routes ?? [];
  const multiRoute = routes.length > 1;
  const subjectBySegment = new Map(
    (proposal.segments ?? []).map((segment) => [segment.ref, segment.subject])
  );
  const projectTitleById = new Map(projects.map((project) => [project.id, project.title]));
  const candidateTitleById = new Map(
    (proposal.candidateProjects ?? []).map((candidate) => [candidate.id, candidate.title])
  );

  function routeProjectLabel(route: (typeof routes)[number]): string | null {
    if (route.destination === "new_project") return null;
    const projectId = route.projectId?.trim();
    if (!projectId) return null;
    return projectTitleById.get(projectId) ?? candidateTitleById.get(projectId) ?? null;
  }

  function routeConfidenceLabel(confidence: number | null | undefined): string {
    if (confidence == null || Number.isNaN(confidence)) return "";
    return ` (${Math.round(confidence * 100)}%)`;
  }

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
            <div className="mt-3 flex shrink-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onReanalyze}
                disabled={!canReanalyze}
              >
                {isReanalyzing ? "Re-analyzing…" : "Re-analyze"}
              </Button>
              <p className="text-[11.5px] text-muted-foreground">
                Edit the note, then re-analyze to refresh suggestions.
              </p>
            </div>
          </section>

          {multiRoute ? (
            <section className="shrink-0 rounded-md border border-border bg-background p-4">
              <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Routing
              </h2>
              <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
                {proposal.routing?.reason ??
                  `${routes.length} project contexts detected`}
              </p>
              <ul className="mt-3 space-y-2.5">
                {routes.map((route) => {
                  const projectLabel = routeProjectLabel(route);
                  return (
                  <li key={route.segmentRef} className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground">
                      {projectLabel ??
                        subjectBySegment.get(route.segmentRef) ??
                        route.segmentRef}
                      {projectLabel &&
                      subjectBySegment.get(route.segmentRef) &&
                      projectLabel !== subjectBySegment.get(route.segmentRef)
                        ? ` — ${subjectBySegment.get(route.segmentRef)}`
                        : null}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {routingDestinationLabel(route.destination)}
                      {routeConfidenceLabel(route.confidence)}
                      {route.reason ? ` — ${route.reason}` : ""}
                    </p>
                  </li>
                  );
                })}
              </ul>
            </section>
          ) : proposal.routing ? (
            <section className="shrink-0 rounded-md border border-border bg-background p-4">
              <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Routing
              </h2>
              <p className="mt-3 text-[13px] font-medium text-foreground">
                {routingDestinationLabel(proposal.routing.destination)}
                {routeConfidenceLabel(proposal.routing.confidence)}
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                {proposal.routing.reason}
              </p>
              {proposal.impact ? (
                <p className="mt-2 text-[11.5px] text-muted-foreground">
                  Impact: {proposal.impact.type.replace(/_/g, " ")} —{" "}
                  {proposal.impact.reason}
                </p>
              ) : null}
            </section>
          ) : null}
{/*  
          {userWarnings.length > 0 ? (
            <div className="shrink-0 space-y-2 overflow-hidden">
              {userWarnings.slice(0, 3).map((warning) => (
                <ActiveNoteWarning key={warning} message={warning} />
              ))}
            </div>
          ) : null} */}
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-md border border-border bg-muted/5">
          <div className="flex shrink-0 items-end justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-tight">
                Suggested changes
              </h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                {proposal.summary}
              </p>
            </div>
            <p
              className="shrink-0 rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-foreground/80"
              aria-live="polite"
            >
              {reviewCountLabel}
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
            {onlyNoAction ? (
              <div className="rounded-md border border-border bg-muted/10 p-5">
                <h3 className="text-[14px] font-semibold">No new objects detected</h3>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  This note can remain as written without creating additional tasks,
                  projects, or relationships.
                </p>
              </div>
            ) : (
              cardGroups.map((group, index) => {
                const previous = cardGroups[index - 1];
                const showSegmentHeading =
                  multiRoute &&
                  Boolean(group.segmentSubject) &&
                  group.segmentRef !== previous?.segmentRef;

                return (
                  <div key={group.root.id} className="space-y-2">
                    {showSegmentHeading ? (
                      <h3 className="pt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {group.segmentSubject}
                      </h3>
                    ) : null}
                    <ActiveNoteProposalCard
                      operation={group.root}
                      nestedOperations={group.children}
                      validationErrors={validationErrors}
                      disabled={noteBusy}
                      onToggleSelected={onToggleSelected}
                      onReject={onReject}
                      onEdit={onEdit}
                      onDuplicateResolution={onDuplicateResolution}
                      onProjectChange={onProjectChange}
                    />
                  </div>
                );
              })
            )}

            {applyError ? (
              <p className="text-[12.5px] text-destructive" role="alert">
                {applyError}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3">
            <p className="text-[12.5px] text-muted-foreground">
              {selectedCount === 0
                ? "Nothing selected yet"
                : `${selectedCount} change${selectedCount === 1 ? "" : "s"} ready to apply`}
            </p>
            <Button
              type="button"
              onClick={onApply}
              disabled={selectedCount === 0 || noteBusy || onlyNoAction}
              aria-label={
                isApplying
                  ? "Applying selected changes"
                  : `Apply ${selectedCount} selected changes`
              }
            >
              {isApplying
                ? "Applying…"
                : selectedCount === 0
                  ? "Apply changes"
                  : `Apply ${selectedCount} change${selectedCount === 1 ? "" : "s"}`}
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
