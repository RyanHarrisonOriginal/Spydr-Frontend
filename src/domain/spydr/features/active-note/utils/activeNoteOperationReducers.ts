import {
  buildPayloadForObjectType,
  operationTypeForObjectType,
} from "./buildOperationPayload";
import type {
  ActiveNoteProposalAttachment,
  ActiveNoteProposalOperation,
  DuplicateResolution,
  OperationPayload,
  SpydrObjectType,
} from "@/domain/spydr/utils/activeNoteTypes";

export function toggleOperationSelected(
  current: ActiveNoteProposalOperation[],
  operationId: string,
  selected: boolean
): ActiveNoteProposalOperation[] {
  const target = current.find((op) => op.id === operationId);
  if (!target) return current;

  return current.map((op) => {
    if (op.id === operationId) {
      return {
        ...op,
        selected,
        status: selected
          ? op.status === "rejected"
            ? "accepted"
            : op.status === "executed"
              ? "executed"
              : op.status
          : op.status,
      };
    }

    if (
      selected &&
      target.projectRef &&
      op.id === target.projectRef &&
      op.status !== "rejected"
    ) {
      return { ...op, selected: true };
    }

    if (
      !selected &&
      target.objectType === "project" &&
      op.projectRef === target.id
    ) {
      return { ...op, selected: false };
    }

    return op;
  });
}

export function rejectOperation(
  current: ActiveNoteProposalOperation[],
  operationId: string
): ActiveNoteProposalOperation[] {
  const target = current.find((op) => op.id === operationId);
  if (!target) return current;

  return current.map((op) => {
    const isTarget = op.id === operationId;
    const isChildOfRejectedProject =
      target.objectType === "project" && op.projectRef === target.id;
    if (!isTarget && !isChildOfRejectedProject) return op;

    return {
      ...op,
      selected: false,
      status: "rejected" as const,
      duplicateResolution:
        op.duplicateOf != null ? "ignore" : op.duplicateResolution,
    };
  });
}

export function setDuplicateResolution(
  current: ActiveNoteProposalOperation[],
  operationId: string,
  resolution: DuplicateResolution
): ActiveNoteProposalOperation[] {
  return current.map((op) =>
    op.id === operationId
      ? {
          ...op,
          duplicateResolution: resolution,
          selected: resolution !== "ignore",
          status: resolution === "ignore" ? "rejected" : "accepted",
        }
      : op
  );
}

export function setSelectedProjectId(
  current: ActiveNoteProposalOperation[],
  operationId: string,
  nextProjectId: string | null
): ActiveNoteProposalOperation[] {
  return current.map((op) => {
    if (op.id !== operationId) return op;

    const payload =
      op.payload.kind === "link"
        ? {
            ...op.payload,
            targetObjectId: nextProjectId ?? "",
            targetLabel:
              op.candidateProjects?.find((p) => p.id === nextProjectId)
                ?.title ?? op.payload.targetLabel,
          }
        : op.payload.kind === "task" ||
            op.payload.kind === "note" ||
            op.payload.kind === "decision" ||
            op.payload.kind === "idea" ||
            op.payload.kind === "goal"
          ? { ...op.payload, projectId: nextProjectId }
          : op.payload;

    const attachment =
      op.attachment?.type === "task" && nextProjectId && op.attachment.id
        ? op.attachment
        : op.attachment?.type === "task" && !nextProjectId
          ? null
          : op.attachment;

    return {
      ...op,
      selectedProjectId: nextProjectId,
      targetObjectId:
        attachment?.type === "task" ? attachment.id ?? null : op.targetObjectId,
      attachment,
      payload,
      operationType: operationTypeForObjectType(
        op.objectType ?? "note",
        attachment?.type === "task"
      ),
      selected: true,
      status: "edited",
      needsUserDecision: false,
    };
  });
}

export function setObjectType(
  current: ActiveNoteProposalOperation[],
  operationId: string,
  objectType: SpydrObjectType
): ActiveNoteProposalOperation[] {
  return current.map((op) => {
    if (op.id !== operationId) return op;

    const segment = {
      topic: op.segmentTopic ?? "",
      sourceText: op.segmentText ?? "",
      contextualText: op.contextualText ?? op.segmentText ?? "",
    };
    const projectId = op.selectedProjectId ?? null;
    const attachment = objectType === "note" ? op.attachment : null;
    const payload = buildPayloadForObjectType(objectType, segment, projectId);

    return {
      ...op,
      objectType,
      payload,
      attachment,
      operationType: operationTypeForObjectType(
        objectType,
        attachment?.type === "task"
      ),
      targetObjectId:
        attachment?.type === "task"
          ? attachment.id ?? null
          : objectType === "relationship"
            ? projectId
            : null,
      selected: objectType === "project" ? op.selected : true,
      status: "edited",
      needsUserDecision: false,
    };
  });
}

export function setAttachment(
  current: ActiveNoteProposalOperation[],
  operationId: string,
  attachment: ActiveNoteProposalAttachment | null
): ActiveNoteProposalOperation[] {
  return current.map((op) =>
    op.id === operationId
      ? {
          ...op,
          attachment,
          operationType: operationTypeForObjectType(
            op.objectType ?? "note",
            attachment?.type === "task"
          ),
          targetObjectId:
            attachment?.type === "task" ? attachment.id ?? null : null,
          targetTaskTitle:
            attachment?.type === "task" && attachment.id
              ? undefined
              : op.targetTaskTitle,
          selected: true,
          status: "edited",
        }
      : op
  );
}

export function saveEditedPayload(
  current: ActiveNoteProposalOperation[],
  operationId: string,
  payload: OperationPayload
): ActiveNoteProposalOperation[] {
  return current.map((op) =>
    op.id === operationId
      ? {
          ...op,
          payload,
          status: "edited",
          selected: true,
        }
      : op
  );
}
