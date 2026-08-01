import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ActiveNoteProposalOperation,
  DuplicateResolution,
} from "@/domain/spydr/utils/activeNoteTypes";
import { cn } from "@/lib/utils";
import { ActiveNoteDuplicateResolver } from "./ActiveNoteDuplicateResolver";
import { ActiveNoteProjectSelector } from "./ActiveNoteProjectSelector";
import { ActiveNoteWarning } from "./ActiveNoteWarning";
import {
  confidenceLabel,
  operationActionLabel,
  operationDescription,
  operationDetailFacts,
  operationSourceLabel,
  operationTitle,
  presentationKind,
} from "../utils/proposalPresentation";

interface ActiveNoteProposalCardProps {
  operation: ActiveNoteProposalOperation;
  nestedOperations?: ActiveNoteProposalOperation[];
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
}

function NestedProposalRow({
  operation,
  validationError,
  disabled,
  onToggleSelected,
  onReject,
  onEdit,
  onDuplicateResolution,
  onProjectChange,
}: {
  operation: ActiveNoteProposalOperation;
  validationError?: string;
  disabled: boolean;
  onToggleSelected(selected: boolean): void;
  onReject(): void;
  onEdit(): void;
  onDuplicateResolution(resolution: DuplicateResolution): void;
  onProjectChange(projectId: string | null): void;
}) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const action = operationActionLabel(operation);
  const title = operationTitle(operation);
  const description = operationDescription(operation);
  const source = operationSourceLabel(operation);
  const facts = operationDetailFacts(operation).filter(
    (fact) => fact !== "Depends on proposed project"
  );
  const rejected = operation.status === "rejected";
  const hasDetails =
    Boolean(description) ||
    facts.length > 0 ||
    Boolean(source) ||
    operation.evidence.length > 0 ||
    Boolean(operation.reasoningSummary) ||
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
      <div className="flex items-start gap-2 px-3 py-2.5">
        <button
          type="button"
          className="mt-0.5 flex min-w-0 flex-1 items-start gap-2 text-left"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={hasDetails ? detailsId : undefined}
          aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
        >
          <ChevronDown
            className={cn(
              "mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
          <div className="min-w-0 space-y-0.5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {action}
            </p>
            <p className="text-[13.5px] font-medium tracking-tight">{title}</p>
          </div>
        </button>

        <label
          className="flex shrink-0 items-center gap-2 pt-0.5 text-[12px] text-foreground/90"
          onClick={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={operation.selected && !rejected}
            onChange={(event) => onToggleSelected(event.target.checked)}
            disabled={disabled || rejected}
            aria-label={
              operation.selected
                ? `Deselect: ${action} — ${title}`
                : `Accept: ${action} — ${title}`
            }
          />
          <span>{operation.selected && !rejected ? "Accepted" : "Accept"}</span>
        </label>
      </div>

      {expanded && hasDetails ? (
        <div id={detailsId} className="space-y-2.5 border-t border-border/70 px-3 py-2.5">
          {description ? (
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
          {facts.length > 0 ? (
            <p className="text-[11.5px] text-foreground/75">{facts.join(" · ")}</p>
          ) : null}
          {source ? (
            <p className="text-[11px] text-muted-foreground">
              {source}
              {` · ${confidenceLabel(operation.confidence)} confidence (${Math.round(
                operation.confidence * 100
              )}%)`}
            </p>
          ) : null}
          {operation.evidence.length > 0 ? (
            <ul className="space-y-1">
              {operation.evidence.map((item) => (
                <li
                  key={item}
                  className="text-[12px] text-foreground/80 before:mr-2 before:text-muted-foreground before:content-['—']"
                >
                  “{item}”
                </li>
              ))}
            </ul>
          ) : null}
          {operation.reasoningSummary ? (
            <p className="text-[11.5px] text-muted-foreground">
              Why: {operation.reasoningSummary}
            </p>
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
          <div className="flex flex-wrap gap-2 pt-0.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onEdit}
              disabled={disabled || rejected}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onReject}
              disabled={disabled || rejected}
            >
              Reject
            </Button>
            {rejected ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onToggleSelected(true)}
                disabled={disabled}
              >
                Undo reject
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

export function ActiveNoteProposalCard({
  operation,
  nestedOperations = [],
  validationErrors,
  validationError,
  disabled = false,
  onToggleSelected,
  onReject,
  onEdit,
  onDuplicateResolution,
  onProjectChange,
}: ActiveNoteProposalCardProps) {
  const [expanded, setExpanded] = useState(nestedOperations.length > 0);
  const detailsId = useId();
  const kind = presentationKind(operation);
  const action = operationActionLabel(operation);
  const title = operationTitle(operation);
  const description = operationDescription(operation);
  const source = operationSourceLabel(operation);
  const facts = operationDetailFacts(operation);
  const isNoAction = operation.operationType === "no_action";
  const rejected = operation.status === "rejected";
  const rootValidationError =
    validationError ?? validationErrors?.[operation.id];
  const hasNested = nestedOperations.length > 0;
  const acceptedChildCount = nestedOperations.filter(
    (child) => child.selected && child.status !== "rejected"
  ).length;
  const hasDetails =
    Boolean(description) ||
    facts.length > 0 ||
    Boolean(source) ||
    !isNoAction ||
    operation.evidence.length > 0 ||
    Boolean(operation.reasoningSummary) ||
    Boolean(operation.warning) ||
    Boolean(operation.candidateProjects && operation.candidateProjects.length > 1) ||
    Boolean(operation.duplicateOf) ||
    Boolean(rootValidationError);

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
      <div className="flex items-start gap-2 p-4">
        <button
          type="button"
          className="mt-0.5 flex min-w-0 flex-1 items-start gap-2 text-left"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={hasDetails || hasNested ? detailsId : undefined}
          aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
        >
          <ChevronDown
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
          <div className="min-w-0 space-y-0.5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-highlight">
              {action}
            </p>
            <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
            {!expanded && hasNested ? (
              <p className="pt-0.5 text-[12px] text-foreground/70">
                {nestedOperations.length} included item
                {nestedOperations.length === 1 ? "" : "s"}
                {acceptedChildCount > 0
                  ? ` · ${acceptedChildCount} accepted`
                  : ""}
              </p>
            ) : null}
            {!expanded && !hasNested && facts.length > 0 ? (
              <p className="pt-0.5 text-[12px] text-foreground/70">
                {facts.join(" · ")}
              </p>
            ) : null}
          </div>
        </button>

        {!isNoAction ? (
          <label
            className="flex shrink-0 items-center gap-2 pt-0.5 text-[12.5px] text-foreground/90"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="checkbox"
              className="h-4 w-4"
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
            <span>{operation.selected && !rejected ? "Accepted" : "Accept"}</span>
          </label>
        ) : null}
      </div>

      {expanded && (hasDetails || hasNested) ? (
        <div id={detailsId} className="space-y-3 border-t border-border px-4 py-3">
          {description ? (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
          {facts.length > 0 ? (
            <p className="text-[12px] text-foreground/75">{facts.join(" · ")}</p>
          ) : null}
          {source || !isNoAction ? (
            <p className="text-[11.5px] text-muted-foreground">
              {source}
              {source && !isNoAction ? " · " : null}
              {!isNoAction
                ? `${confidenceLabel(operation.confidence)} confidence (${Math.round(
                    operation.confidence * 100
                  )}%)`
                : null}
            </p>
          ) : null}

          {operation.evidence.length > 0 ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                From your note
              </p>
              <ul className="mt-1.5 space-y-1">
                {operation.evidence.map((item) => (
                  <li
                    key={item}
                    className="text-[12.5px] text-foreground/80 before:mr-2 before:text-muted-foreground before:content-['—']"
                  >
                    “{item}”
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {operation.reasoningSummary ? (
            <p className="text-[12px] text-muted-foreground">
              Why: {operation.reasoningSummary}
            </p>
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
            <p className="text-[12.5px] text-destructive" role="alert">
              {rootValidationError}
            </p>
          ) : null}

          {hasNested ? (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {operation.objectType === "project"
                  ? "Included in this project"
                  : "Included items"}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {operation.objectType === "project"
                  ? "Accept only the items you want to create with this project."
                  : "Accept only the items you want to create."}
              </p>
              <ul className="mt-2.5 space-y-2" aria-label="Included proposals">
                {nestedOperations.map((child) => (
                  <NestedProposalRow
                    key={child.id}
                    operation={child}
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
                  />
                ))}
              </ul>
            </div>
          ) : null}

          {!isNoAction ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onEdit(operation.id)}
                disabled={disabled || rejected}
              >
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
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
                  onClick={() => onToggleSelected(operation.id, true)}
                  disabled={disabled}
                >
                  Undo reject
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
