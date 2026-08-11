import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ActiveNoteProposalOperation,
  ActiveNoteProposalAttachment,
  DuplicateResolution,
  SpydrObjectType,
} from "@/domain/spydr/utils/activeNoteTypes";
import type { ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { cn } from "@/lib/utils";
import { ActiveNoteActionPresentation } from "./ActiveNoteActionPresentation";
import { ActiveNoteDuplicateResolver } from "./ActiveNoteDuplicateResolver";
import { ActiveNoteProjectSelector } from "./ActiveNoteProjectSelector";
import { ActiveNoteSuggestionControls } from "./ActiveNoteSuggestionControls";
import { ActiveNoteWarning } from "./ActiveNoteWarning";
import {
  operationActionLabel,
  operationTitle,
  presentationKind,
  shouldShowSuggestionControls,
  type OperationRoutingContext,
} from "../utils/proposalPresentation";

interface ActiveNoteProposalCardProps {
  operation: ActiveNoteProposalOperation;
  nestedOperations?: ActiveNoteProposalOperation[];
  projects: ProjectNode[];
  tasks: TaskNode[];
  validationErrors?: Record<string, string>;
  /** @deprecated prefer validationErrors; kept for single-op callers */
  validationError?: string;
  disabled?: boolean;
  onToggleSelected(operationId: string, selected: boolean): void;
  onReject(operationId: string): void;
  onEdit(operationId: string): void;
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
}

function routingContextFromLists(
  projects: ProjectNode[],
  tasks: TaskNode[]
): OperationRoutingContext {
  return { projects, tasks };
}

function NestedProposalRow({
  operation,
  projects,
  tasks,
  validationError,
  disabled,
  onToggleSelected,
  onReject,
  onEdit,
  onDuplicateResolution,
  onProjectChange,
  onObjectTypeChange,
  onAttachmentChange,
}: {
  operation: ActiveNoteProposalOperation;
  projects: ProjectNode[];
  tasks: TaskNode[];
  validationError?: string;
  disabled: boolean;
  onToggleSelected(selected: boolean): void;
  onReject(): void;
  onEdit(): void;
  onDuplicateResolution(resolution: DuplicateResolution): void;
  onProjectChange(projectId: string | null): void;
  onObjectTypeChange(objectType: SpydrObjectType): void;
  onAttachmentChange(attachment: ActiveNoteProposalAttachment | null): void;
}) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const action = operationActionLabel(operation);
  const title = operationTitle(operation);
  const rejected = operation.status === "rejected";
  const showControls = shouldShowSuggestionControls(operation);
  const routingContext = routingContextFromLists(projects, tasks);
  const hasDetails =
    showControls ||
    Boolean(operation.warning) ||
    Boolean(operation.candidateProjects && operation.candidateProjects.length > 1) ||
    Boolean(operation.duplicateOf) ||
    Boolean(validationError);

  return (
    <li
      className={cn(
        "rounded-md border border-border/80 bg-background/60",
        operation.selected && !rejected && "border-highlight/30",
        rejected && "opacity-60"
      )}
      data-operation-id={operation.id}
      data-operation-type={operation.operationType}
      data-nested="true"
    >
      <div className="flex items-start gap-2 px-3 py-2">
        <button
          type="button"
          className="mt-0.5 flex min-w-0 flex-1 items-start gap-2 text-left"
          onClick={() => hasDetails && setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={hasDetails ? detailsId : undefined}
          disabled={!hasDetails}
        >
          {hasDetails ? (
            <ChevronDown
              className={cn(
                "mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-180"
              )}
              aria-hidden
            />
          ) : (
            <span className="h-3.5 w-3.5 shrink-0" aria-hidden />
          )}
          <ActiveNoteActionPresentation
            operation={operation}
            compact
            routingContext={routingContext}
          />
        </button>

        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0"
          checked={operation.selected && !rejected}
          onChange={(event) => onToggleSelected(event.target.checked)}
          disabled={disabled || rejected}
          aria-label={
            operation.selected
              ? `Deselect: ${action} — ${title}`
              : `Accept: ${action} — ${title}`
          }
        />
      </div>

      {expanded && hasDetails ? (
        <div id={detailsId} className="space-y-2 border-t border-border/70 px-3 py-2">
          {showControls ? (
            <ActiveNoteSuggestionControls
              operation={operation}
              projects={projects}
              tasks={tasks}
              disabled={disabled || rejected}
              onObjectTypeChange={onObjectTypeChange}
              onProjectChange={onProjectChange}
              onAttachmentChange={onAttachmentChange}
            />
          ) : null}
          {operation.warning ? (
            <ActiveNoteWarning message={operation.warning} />
          ) : null}
          {operation.candidateProjects &&
          operation.candidateProjects.length > 1 ? (
            <ActiveNoteProjectSelector
              options={operation.candidateProjects}
              value={operation.selectedProjectId ?? null}
              onChange={onProjectChange}
              disabled={disabled || rejected}
            />
          ) : null}
          {operation.duplicateOf ? (
            <ActiveNoteDuplicateResolver
              existing={operation.duplicateOf}
              value={operation.duplicateResolution}
              onChange={onDuplicateResolution}
              disabled={disabled || rejected}
            />
          ) : null}
          {validationError ? (
            <p className="text-[12px] text-destructive" role="alert">
              {validationError}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[11px]"
              onClick={onEdit}
              disabled={disabled || rejected}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[11px]"
              onClick={onReject}
              disabled={disabled || rejected}
            >
              Reject
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

export function ActiveNoteProposalCard({
  operation,
  nestedOperations = [],
  projects,
  tasks,
  validationErrors,
  validationError,
  disabled = false,
  onToggleSelected,
  onReject,
  onEdit,
  onDuplicateResolution,
  onProjectChange,
  onObjectTypeChange,
  onAttachmentChange,
}: ActiveNoteProposalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const kind = presentationKind(operation);
  const action = operationActionLabel(operation);
  const title = operationTitle(operation);
  const isNoAction = operation.operationType === "no_action";
  const rejected = operation.status === "rejected";
  const showControls = shouldShowSuggestionControls(operation);
  const routingContext = routingContextFromLists(projects, tasks);
  const rootValidationError =
    validationError ?? validationErrors?.[operation.id];
  const hasNested = nestedOperations.length > 0;
  const hasExpandableDetails =
    showControls ||
    Boolean(operation.warning) ||
    Boolean(operation.candidateProjects && operation.candidateProjects.length > 1) ||
    Boolean(operation.duplicateOf) ||
    Boolean(rootValidationError) ||
    hasNested;

  return (
    <article
      className={cn(
        "rounded-md border border-border bg-muted/10 transition-colors",
        operation.selected && !rejected && "border-highlight/35 bg-highlight/[0.03]",
        rejected && "opacity-70"
      )}
      data-operation-id={operation.id}
      data-operation-type={operation.operationType}
      data-presentation={kind}
      data-expanded={expanded ? "true" : "false"}
      data-has-children={hasNested ? "true" : "false"}
    >
      <div className="flex items-start gap-2 p-3">
        <button
          type="button"
          className="mt-0.5 flex min-w-0 flex-1 items-start gap-2 text-left"
          onClick={() => hasExpandableDetails && setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={hasExpandableDetails ? detailsId : undefined}
          disabled={!hasExpandableDetails}
        >
          {hasExpandableDetails ? (
            <ChevronDown
              className={cn(
                "mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-180"
              )}
              aria-hidden
            />
          ) : (
            <span className="h-3.5 w-3.5 shrink-0" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <ActiveNoteActionPresentation
              operation={operation}
              compact
              routingContext={routingContext}
            />
            {!expanded && hasNested ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                +{nestedOperations.length} related
              </p>
            ) : null}
          </div>
        </button>

        {!isNoAction ? (
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0"
            checked={operation.selected && !rejected}
            onChange={(event) =>
              onToggleSelected(operation.id, event.target.checked)
            }
            disabled={disabled || rejected}
            aria-label={
              operation.selected
                ? `Deselect: ${action} — ${title}`
                : `Accept: ${action} — ${title}`
            }
          />
        ) : null}
      </div>

      {expanded && hasExpandableDetails ? (
        <div id={detailsId} className="space-y-2.5 border-t border-border px-3 py-2.5">
          <ActiveNoteActionPresentation
            operation={operation}
            routingContext={routingContext}
          />

          {showControls ? (
            <ActiveNoteSuggestionControls
              operation={operation}
              projects={projects}
              tasks={tasks}
              disabled={disabled || rejected}
              onObjectTypeChange={(objectType) =>
                onObjectTypeChange(operation.id, objectType)
              }
              onProjectChange={(projectId) =>
                onProjectChange(operation.id, projectId)
              }
              onAttachmentChange={(attachment) =>
                onAttachmentChange(operation.id, attachment)
              }
            />
          ) : null}

          {operation.warning ? (
            <ActiveNoteWarning message={operation.warning} />
          ) : null}

          {operation.candidateProjects &&
          operation.candidateProjects.length > 1 ? (
            <ActiveNoteProjectSelector
              options={operation.candidateProjects}
              value={operation.selectedProjectId ?? null}
              onChange={(projectId) => onProjectChange(operation.id, projectId)}
              disabled={disabled || rejected}
            />
          ) : null}

          {operation.duplicateOf ? (
            <ActiveNoteDuplicateResolver
              existing={operation.duplicateOf}
              value={operation.duplicateResolution}
              onChange={(resolution) =>
                onDuplicateResolution(operation.id, resolution)
              }
              disabled={disabled || rejected}
            />
          ) : null}

          {rootValidationError ? (
            <p className="text-[12px] text-destructive" role="alert">
              {rootValidationError}
            </p>
          ) : null}

          {hasNested ? (
            <ul className="space-y-1.5" aria-label="Related suggestions">
              {nestedOperations.map((child) => (
                <NestedProposalRow
                  key={child.id}
                  operation={child}
                  projects={projects}
                  tasks={tasks}
                  validationError={validationErrors?.[child.id]}
                  disabled={disabled}
                  onToggleSelected={(selected) =>
                    onToggleSelected(child.id, selected)
                  }
                  onReject={() => onReject(child.id)}
                  onEdit={() => onEdit(child.id)}
                  onDuplicateResolution={(resolution) =>
                    onDuplicateResolution(child.id, resolution)
                  }
                  onProjectChange={(projectId) =>
                    onProjectChange(child.id, projectId)
                  }
                  onObjectTypeChange={(objectType) =>
                    onObjectTypeChange(child.id, objectType)
                  }
                  onAttachmentChange={(attachment) =>
                    onAttachmentChange(child.id, attachment)
                  }
                />
              ))}
            </ul>
          ) : null}

          {!isNoAction ? (
            <div className="flex gap-2 pt-0.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px]"
                onClick={() => onEdit(operation.id)}
                disabled={disabled || rejected}
              >
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px]"
                onClick={() => onReject(operation.id)}
                disabled={disabled || rejected}
              >
                Reject
              </Button>
              {rejected ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => onToggleSelected(operation.id, true)}
                  disabled={disabled}
                >
                  Undo
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
