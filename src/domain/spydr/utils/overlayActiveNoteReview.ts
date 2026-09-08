import type { BackendActiveNoteReviewSnapshot } from "./activeNoteAnalyzeTypes";
import type {
  ActiveNoteHistoryDecision,
  ActiveNoteProposal,
  ActiveNoteProposalOperation,
  AppliedActiveNoteObject,
  ApplyActiveNoteProposalResult,
  SpydrObjectType,
} from "./activeNoteTypes";

function asObjectType(value: string | null | undefined): SpydrObjectType | undefined {
  if (
    value === "project" ||
    value === "task" ||
    value === "note" ||
    value === "goal" ||
    value === "decision" ||
    value === "idea" ||
    value === "person" ||
    value === "relationship"
  ) {
    return value;
  }
  return undefined;
}

function indexAppliedByOperationId(
  review: BackendActiveNoteReviewSnapshot
): Map<string, AppliedActiveNoteObject> {
  const byId = new Map<string, AppliedActiveNoteObject>();
  const acceptedIds = review.operations
    .filter((operation) => operation.outcome === "accepted")
    .map((operation) => operation.operationId);

  let unpairedIndex = 0;
  for (const item of review.applied) {
    const operationId =
      item.operationId?.trim() || acceptedIds[unpairedIndex++] || "";
    if (!operationId || byId.has(operationId)) continue;
    const type = asObjectType(item.type);
    if (!type) continue;
    byId.set(operationId, {
      id: item.id,
      type,
      title: item.title,
      action: item.action,
      href: item.href,
      operationId,
    });
  }

  return byId;
}

function overlayDecision(
  operation: ActiveNoteProposalOperation,
  decision: Exclude<ActiveNoteHistoryDecision, "pending">,
  appliedObject: AppliedActiveNoteObject | null,
  errorMessage: string | null
): ActiveNoteProposalOperation {
  return {
    ...operation,
    applyDecision: decision,
    appliedObject,
    applyErrorMessage: errorMessage,
    status:
      decision === "accepted"
        ? "executed"
        : decision === "failed"
          ? "failed"
          : "proposed",
    selected: decision === "failed",
  };
}

export function overlayReviewSnapshotOnProposal(
  proposal: ActiveNoteProposal,
  review: BackendActiveNoteReviewSnapshot | null | undefined
): ActiveNoteProposal {
  if (!review) return proposal;

  const outcomes = new Map(
    review.operations.map((operation) => [operation.operationId, operation])
  );
  const appliedById = indexAppliedByOperationId(review);
  const failedById = new Map(
    review.failed.map((item) => [item.operationId, item.message])
  );

  return {
    ...proposal,
    operations: proposal.operations.map((operation) => {
      const reviewOperation = outcomes.get(operation.id);
      if (!reviewOperation) return operation;
      return overlayDecision(
        operation,
        reviewOperation.outcome,
        appliedById.get(operation.id) ?? null,
        failedById.get(operation.id) ?? null
      );
    }),
  };
}

export function overlayApplyResultOnOperations(
  operations: ActiveNoteProposalOperation[],
  result: ApplyActiveNoteProposalResult
): ActiveNoteProposalOperation[] {
  const failedById = new Map(
    result.failed.map((item) => [item.operationId, item.message])
  );
  const appliedById = new Map<string, AppliedActiveNoteObject>();
  for (const item of result.applied) {
    if (item.operationId) appliedById.set(item.operationId, item);
  }

  return operations.map((operation) => {
    const applied = appliedById.get(operation.id);
    if (applied) {
      return overlayDecision(operation, "accepted", applied, null);
    }
    const failedMessage = failedById.get(operation.id);
    if (failedMessage) {
      return overlayDecision(operation, "failed", operation.appliedObject ?? null, failedMessage);
    }
    return operation;
  });
}
