import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useActiveNoteSessionQuery,
  useProjectsQuery,
  useTasksQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { activeNoteApi } from "@/domain/spydr/utils/activeNoteApi";
import { overlayApplyResultOnOperations } from "@/domain/spydr/utils/overlayActiveNoteReview";
import type {
  ActiveNoteProposalAttachment,
  ActiveNoteProposalOperation,
  DuplicateResolution,
  OperationPayload,
  SpydrObjectType,
} from "@/domain/spydr/utils/activeNoteTypes";
import {
  rejectOperation as rejectOperationState,
  saveEditedPayload as saveEditedPayloadState,
  setAttachment as setAttachmentState,
  setDuplicateResolution as setDuplicateResolutionState,
  setObjectType as setObjectTypeState,
  setSelectedProjectId as setSelectedProjectIdState,
  toggleOperationSelected as toggleOperationSelectedState,
} from "../utils/activeNoteOperationReducers";
import { toApplyOperationInputs } from "../utils/toApplyOperationInputs";
import {
  friendlyApiError,
  validateSelectedOperations,
} from "../utils/validateActiveNote";

function clearValidationError(
  current: Record<string, string>,
  operationId: string
): Record<string, string> {
  if (!current[operationId]) return current;
  const next = { ...current };
  delete next[operationId];
  return next;
}

export function usePastActiveNotePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();
  const sessionQuery = useActiveNoteSessionQuery(sessionId);
  const projectsQuery = useProjectsQuery();
  const tasksQuery = useTasksQuery();

  const proposal = sessionQuery.data ?? null;
  const [operations, setOperations] = useState<ActiveNoteProposalOperation[]>(
    []
  );
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applyNotice, setApplyNotice] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isApplying, setIsApplying] = useState(false);
  const [editingOperationId, setEditingOperationId] = useState<string | null>(
    null
  );

  useLayoutEffect(() => {
    if (!proposal) return;
    setOperations(proposal.operations.map((operation) => ({ ...operation })));
    setApplyError(null);
    setApplyNotice(null);
    setValidationErrors({});
    setEditingOperationId(null);
  }, [proposal?.activeNote.id]);

  const selectedCount = operations.filter(
    (op) =>
      op.selected &&
      op.operationType !== "no_action" &&
      op.duplicateResolution !== "ignore"
  ).length;
  const selectedAlreadyApplied = operations.some(
    (op) =>
      op.selected &&
      op.operationType !== "no_action" &&
      op.duplicateResolution !== "ignore" &&
      op.applyDecision === "accepted"
  );

  function updateOperations(
    updater: (current: ActiveNoteProposalOperation[]) => ActiveNoteProposalOperation[]
  ) {
    setOperations((current) => updater(current));
  }

  async function handleApply() {
    if (!proposal || isApplying) return;

    const applyInput = toApplyOperationInputs(operations);
    const selected = applyInput.filter((item) => item.selected);
    if (selected.length === 0) {
      setApplyError("Select at least one proposal to apply.");
      return;
    }

    const errors = validateSelectedOperations(operations, applyInput);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      setApplyError("Fix validation issues before applying.");
      return;
    }

    setApplyError(null);
    setApplyNotice(null);
    setIsApplying(true);

    try {
      const result = await activeNoteApi.apply(proposal.activeNote.id, {
        content: proposal.activeNote.content,
        projectId: proposal.activeNote.projectId ?? null,
        operations: applyInput,
      });

      setOperations((current) => overlayApplyResultOnOperations(current, result));

      if (result.failed.length > 0 && result.applied.length === 0) {
        setApplyError(
          result.failed[0]?.message ??
            "Could not apply the selected proposals. Your edits were kept."
        );
        return;
      }

      if (result.partial) {
        setApplyError(
          "Some proposals could not be applied. Successful results are listed below."
        );
      } else {
        const count = result.applied.length;
        setApplyNotice(
          count === 1
            ? "1 suggestion was written to your workspace."
            : `${count} suggestions were written to your workspace.`
        );
      }

      if (activeOrgId) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: spydrOrgKey(activeOrgId, "projects"),
          }),
          queryClient.invalidateQueries({
            queryKey: spydrOrgKey(activeOrgId, "tasks"),
          }),
          queryClient.invalidateQueries({
            queryKey: spydrOrgKey(activeOrgId, "notes"),
          }),
          queryClient.invalidateQueries({
            queryKey: spydrOrgKey(activeOrgId, "people"),
          }),
          queryClient.invalidateQueries({
            queryKey: spydrOrgKey(activeOrgId, "decisions"),
          }),
          queryClient.invalidateQueries({
            queryKey: spydrOrgKey(activeOrgId, "ideas"),
          }),
          queryClient.invalidateQueries({
            queryKey: spydrOrgKey(activeOrgId, "dashboard"),
          }),
          queryClient.invalidateQueries({
            queryKey: spydrOrgKey(activeOrgId, "active-notes"),
          }),
        ]);
      }
    } catch (error) {
      setApplyError(
        friendlyApiError(
          error,
          "Could not apply proposals. Your edits were kept — try again."
        )
      );
    } finally {
      setIsApplying(false);
    }
  }

  return {
    sessionId,
    isLoading: sessionQuery.isLoading,
    isError: sessionQuery.isError,
    errorMessage: sessionQuery.error
      ? friendlyApiError(sessionQuery.error, "Could not load this active note.")
      : null,
    proposal,
    operations,
    projects: projectsQuery.data ?? [],
    tasks: tasksQuery.data ?? [],
    selectedCount,
    selectedAlreadyApplied,
    isApplying,
    applyError,
    applyNotice,
    validationErrors,
    editingOperationId,
    setEditingOperationId,
    toggleOperationSelected(operationId: string, selected: boolean) {
      updateOperations((current) =>
        toggleOperationSelectedState(current, operationId, selected)
      );
      setValidationErrors((current) =>
        clearValidationError(current, operationId)
      );
    },
    rejectOperation(operationId: string) {
      updateOperations((current) => rejectOperationState(current, operationId));
      setValidationErrors((current) =>
        clearValidationError(current, operationId)
      );
    },
    setDuplicateResolution(operationId: string, resolution: DuplicateResolution) {
      updateOperations((current) =>
        setDuplicateResolutionState(current, operationId, resolution)
      );
    },
    setSelectedProjectId(operationId: string, projectId: string | null) {
      updateOperations((current) =>
        setSelectedProjectIdState(current, operationId, projectId)
      );
    },
    setObjectType(operationId: string, objectType: SpydrObjectType) {
      updateOperations((current) =>
        setObjectTypeState(current, operationId, objectType)
      );
    },
    setAttachment(
      operationId: string,
      attachment: ActiveNoteProposalAttachment | null
    ) {
      updateOperations((current) =>
        setAttachmentState(current, operationId, attachment)
      );
    },
    saveEditedPayload(operationId: string, payload: OperationPayload) {
      updateOperations((current) =>
        saveEditedPayloadState(current, operationId, payload)
      );
      setEditingOperationId(null);
    },
    handleApply,
  };
}
