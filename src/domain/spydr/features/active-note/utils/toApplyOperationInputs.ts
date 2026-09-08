import type {
  ActiveNoteProposalOperation,
  ApplyActiveNoteOperationInput,
} from "@/domain/spydr/utils/activeNoteTypes";

export function toApplyOperationInputs(
  operations: ActiveNoteProposalOperation[]
): ApplyActiveNoteOperationInput[] {
  return operations.map((op) => ({
    operationId: op.id,
    selected:
      op.selected &&
      op.operationType !== "no_action" &&
      op.duplicateResolution !== "ignore",
    objectType: op.objectType ?? null,
    payload: op.payload,
    duplicateResolution:
      op.duplicateResolution ??
      (op.operationType === "update" &&
      Boolean(op.attachment?.id ?? op.duplicateOf?.id)
        ? "attach_existing"
        : null),
    selectedProjectId: op.selectedProjectId ?? null,
    projectRef: op.projectRef ?? null,
    targetObjectId:
      op.attachment?.type === "task"
        ? op.attachment.id ?? null
        : op.payload.kind === "link"
          ? op.payload.targetObjectId || null
          : op.duplicateResolution === "attach_existing" ||
              op.operationType === "update"
            ? op.targetObjectId ?? op.duplicateOf?.id ?? null
            : null,
    attachment: op.attachment ?? null,
  }));
}
