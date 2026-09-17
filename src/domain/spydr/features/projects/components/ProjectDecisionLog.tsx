import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DecisionNode, UpdateProjectChildInput } from "@/domain/spydr/utils/types";
import {
  formatRelativeTime,
  formatShortDate,
} from "@/domain/spydr/features/shared/components/time";
import { cn } from "@/lib/utils";
import type { ProjectDecisionFormValues } from "../hooks/useProjectDetailPage";
import {
  ProjectDetailEmpty,
  ProjectDetailEntry,
  ProjectDetailInlineError,
  detailFieldClassName,
} from "./ProjectDetailSection";
import { ProjectItemActions } from "./ProjectItemActions";

const impactStyles: Record<string, string> = {
  high: "border-[hsl(var(--status-blocked)/0.3)] bg-[hsl(var(--status-blocked)/0.1)] text-[hsl(var(--status-blocked))]",
  medium: "border-[hsl(var(--status-doing)/0.3)] bg-[hsl(var(--status-doing)/0.1)] text-[hsl(var(--status-doing))]",
  low: "border-[hsl(var(--status-todo)/0.3)] bg-[hsl(var(--status-todo)/0.1)] text-[hsl(var(--status-todo))]",
};

interface ProjectDecisionLogProps {
  decisions: DecisionNode[];
  form: ProjectDecisionFormValues;
  canAdd: boolean;
  isAdding: boolean;
  error: string | null;
  onFieldChange<TField extends keyof ProjectDecisionFormValues>(
    field: TField,
    value: ProjectDecisionFormValues[TField]
  ): void;
  onAdd(): void;
  onUpdate(childId: string, input: UpdateProjectChildInput): void;
  onDelete(childId: string): void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function ProjectDecisionLog({
  decisions,
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
}: ProjectDecisionLogProps) {
  const orderedDecisions = useMemo(
    () =>
      [...decisions].sort((a, b) => {
        const aTime = new Date(a.details?.decidedAt ?? a.updatedAt).getTime();
        const bTime = new Date(b.details?.decidedAt ?? b.updatedAt).getTime();
        return bTime - aTime;
      }),
    [decisions]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <form
        className="space-y-2 rounded-sm border border-border/50 bg-muted/20 px-2.5 py-1.5"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd();
        }}
      >
        <input
          value={form.title}
          onChange={(event) => onFieldChange("title", event.target.value)}
          placeholder="What was decided?"
          className={detailFieldClassName}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={form.rationale}
            onChange={(event) => onFieldChange("rationale", event.target.value)}
            placeholder="Why — context, tradeoffs, constraints (optional)"
            className={cn(detailFieldClassName, "min-w-0 flex-1")}
          />
          <Button
            type="submit"
            className="h-10 shrink-0 gap-1.5 rounded-lg sm:px-4"
            disabled={!canAdd}
          >
            <Plus className="h-3.5 w-3.5" />
            {isAdding ? "Recording…" : "Record"}
          </Button>
        </div>
        {error ? <ProjectDetailInlineError>{error}</ProjectDetailInlineError> : null}
      </form>

      {orderedDecisions.length > 0 ? (
        <ol className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
          {orderedDecisions.map((decision) => (
            <DecisionEntry
              key={decision.id}
              decision={decision}
              onUpdate={(input) => onUpdate(decision.id, input)}
              onDelete={() => onDelete(decision.id)}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
            />
          ))}
        </ol>
      ) : (
        <ProjectDetailEmpty
          title="No decisions recorded yet."
          description="Log choices so the team has a durable record of what was decided and why."
        />
      )}
    </div>
  );
}

function DecisionEntry({
  decision,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  decision: DecisionNode;
  onUpdate: (input: UpdateProjectChildInput) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  const impact = decision.details?.impact ?? "medium";
  const rationale = decision.details?.rationale || decision.body;
  const decidedAt = decision.details?.decidedAt ?? decision.updatedAt;

  return (
    <ProjectDetailEntry>
      <div className="flex min-w-0 items-center gap-x-2 gap-y-1">
        <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold">
          {decision.title}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              "rounded border px-1.5 py-px font-mono text-[9px] uppercase tracking-wider",
              impactStyles[impact] ?? "border-border text-muted-foreground"
            )}
          >
            {impact} impact
          </span>
          <time
            className="font-mono text-[10px] tabular-nums text-muted-foreground"
            dateTime={decidedAt}
            title={formatShortDate(decidedAt)}
          >
            {formatRelativeTime(decidedAt)}
          </time>
          <ProjectItemActions
            fieldSet="decision"
            values={{
              title: decision.title,
              rationale: decision.details?.rationale || decision.body,
            }}
            onSave={onUpdate}
            onDelete={onDelete}
            isSaving={isUpdating}
            isDeleting={isDeleting}
          />
        </div>
      </div>
      {rationale ? (
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
          {rationale}
        </p>
      ) : (
        <p className="mt-1.5 text-[11px] italic text-muted-foreground/70">
          No rationale provided.
        </p>
      )}
    </ProjectDetailEntry>
  );
}
