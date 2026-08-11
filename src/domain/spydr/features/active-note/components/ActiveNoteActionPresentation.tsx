import type { ActiveNoteProposalOperation } from "@/domain/spydr/utils/activeNoteTypes";
import type { ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import {
  actionDetailFacts,
  operationActionLabel,
  operationReason,
  operationRoutingSummary,
  operationTitle,
  segmentContent,
  segmentSummary,
  type OperationRoutingContext,
} from "../utils/proposalPresentation";

function presentationHeadline(operation: ActiveNoteProposalOperation): string {
  const action = operationActionLabel(operation);
  const title = operationTitle(operation);
  const summary = segmentSummary(operation);

  if (title && title !== summary && !action.toLowerCase().includes(title.toLowerCase())) {
    return `${action} · ${title}`;
  }

  return action;
}

function RoutingContextLine({
  project,
  task,
}: {
  project: string | null;
  task: string | null;
}) {
  if (!project && !task) return null;

  return (
    <p className="text-[12px] leading-snug text-foreground/85">
      {project ? <span className="font-medium text-highlight">{project}</span> : null}
      {project && task ? <span className="text-muted-foreground"> · </span> : null}
      {task ? <span className="text-foreground/80">{task}</span> : null}
    </p>
  );
}

export function ActiveNoteActionPresentation({
  operation,
  compact = false,
  routingContext,
}: {
  operation: ActiveNoteProposalOperation;
  compact?: boolean;
  routingContext?: OperationRoutingContext;
}) {
  const headline = presentationHeadline(operation);
  const excerpt = segmentContent(operation);
  const reason = operationReason(operation);
  const facts = actionDetailFacts(operation);
  const routing = operationRoutingSummary(operation, routingContext);

  if (compact) {
    return (
      <div className="min-w-0 space-y-0.5">
        <p className="text-[13px] font-medium leading-snug text-foreground">{headline}</p>
        <RoutingContextLine project={routing.project} task={routing.task} />
        {reason ? (
          <p className="line-clamp-2 text-[12px] leading-snug text-muted-foreground">
            {reason}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[14px] font-semibold leading-snug tracking-tight text-foreground">
        {headline}
      </p>
      <RoutingContextLine project={routing.project} task={routing.task} />
      {excerpt && excerpt !== reason ? (
        <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
          {excerpt}
        </p>
      ) : null}
      {reason ? (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{reason}</p>
      ) : null}
      {facts.length > 0 ? (
        <p className="text-[11px] text-muted-foreground/80">{facts.join(" · ")}</p>
      ) : null}
    </div>
  );
}
