import {
  ACTIVE_NOTE_MAX_LENGTH,
  ACTIVE_NOTE_MIN_LENGTH,
  SUPPORTED_OBJECT_TYPES,
  type ActiveNoteProposalOperation,
  type ApplyActiveNoteOperationInput,
  type OperationPayload,
} from "@/domain/spydr/utils/activeNoteTypes";

export function validateNoteContent(content: string): string | null {
  const trimmed = content.trim();
  if (trimmed.length < ACTIVE_NOTE_MIN_LENGTH) {
    return "Enter a note before saving.";
  }
  if (content.length > ACTIVE_NOTE_MAX_LENGTH) {
    return `Notes can be at most ${ACTIVE_NOTE_MAX_LENGTH.toLocaleString()} characters.`;
  }
  return null;
}

function isValidDate(value: string | null | undefined): boolean {
  if (value == null || value === "") return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function validateOperationPayload(
  operation: ActiveNoteProposalOperation,
  payload: OperationPayload
): string | null {
  if (operation.objectType && !SUPPORTED_OBJECT_TYPES.includes(operation.objectType)) {
    return "Unsupported object type.";
  }

  if (payload.kind === "no_action") return null;

  if (payload.kind === "link") {
    if (!payload.targetObjectId) {
      return "Choose a target object for this link.";
    }
    if (!payload.relationshipType.trim()) {
      return "Relationship type is required.";
    }
    return null;
  }

  if ("title" in payload) {
    if (!payload.title.trim()) {
      return "Title is required.";
    }
  }

  if (payload.kind === "task" && !isValidDate(payload.dueDate)) {
    return "Due date must be a valid date.";
  }

  if (payload.kind === "note" && !payload.content.trim()) {
    return "Note content is required.";
  }

  return null;
}

export function validateSelectedOperations(
  operations: ActiveNoteProposalOperation[],
  applyInput: ApplyActiveNoteOperationInput[]
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const item of applyInput) {
    if (!item.selected) continue;
    if (item.duplicateResolution === "ignore") continue;

    const operation = operations.find((op) => op.id === item.operationId);
    if (!operation) {
      errors[item.operationId] = "This proposal is no longer available.";
      continue;
    }

    if (operation.duplicateOf && !item.duplicateResolution) {
      errors[item.operationId] = "Choose how to handle the possible duplicate.";
      continue;
    }

    const payload = item.payload ?? operation.payload;
    const payloadError = validateOperationPayload(operation, payload);
    if (payloadError) {
      errors[item.operationId] = payloadError;
    }

    const needsProject =
      operation.objectType === "task" ||
      operation.objectType === "note" ||
      operation.objectType === "decision" ||
      operation.operationType === "attach_context";

    const hasProject =
      Boolean(item.selectedProjectId) ||
      Boolean(item.projectRef) ||
      Boolean(operation.projectRef) ||
      Boolean(
        payload &&
          "projectId" in payload &&
          payload.projectId
      );

    if (needsProject && !hasProject && operation.objectType !== "idea") {
      errors[item.operationId] =
        "Choose a project for this suggestion before applying.";
    }

    if (
      needsProject &&
      !hasProject &&
      operation.objectType === "idea" &&
      operation.candidateProjects &&
      operation.candidateProjects.length > 0
    ) {
      errors[item.operationId] =
        "Choose a project for this idea before applying.";
    }

    const parentRef = item.projectRef ?? operation.projectRef;
    if (parentRef) {
      const parent = operations.find((op) => op.id === parentRef);
      const parentApply = applyInput.find((entry) => entry.operationId === parentRef);
      const parentSelected =
        parentApply?.selected === true &&
        parentApply.duplicateResolution !== "ignore" &&
        parent?.status !== "rejected";
      if (!parentSelected) {
        errors[item.operationId] =
          "Accept the proposed project to apply this item.";
      }
    }
  }

  return errors;
}

export function friendlyApiError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  const message = error.message.trim();
  if (!message) return fallback;
  if (/openai|anthropic|claude|api key|provider|token/i.test(message)) {
    return fallback;
  }
  return message;
}
