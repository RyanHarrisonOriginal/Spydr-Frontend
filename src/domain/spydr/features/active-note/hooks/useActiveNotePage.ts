import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useProjectsQuery,
  useTasksQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import {
  activeNoteApi,
} from "@/domain/spydr/utils/activeNoteApi";
import type {
  ActiveNote,
  ActiveNoteProposal,
  ActiveNoteProposalAttachment,
  ActiveNoteProposalOperation,
  ActiveNoteUiPhase,
  ApplyActiveNoteProposalResult,
  DuplicateResolution,
  OperationPayload,
  SpydrObjectType,
} from "@/domain/spydr/utils/activeNoteTypes";
import {
  buildPayloadForObjectType,
  operationTypeForObjectType,
} from "../utils/buildOperationPayload";
import {
  friendlyApiError,
  validateNoteContent,
  validateSelectedOperations,
} from "../utils/validateActiveNote";

export type ActiveNoteSaveState =
  | "idle"
  | "unsaved"
  | "pending"
  | "saving"
  | "saved"
  | "error";

export type AnalysisStatusText =
  | "Reading note"
  | "Finding related Spydr objects"
  | "Preparing suggestions";

const SAVE_DEBOUNCE_MS = 700;
const ANALYSIS_STATUS_ROTATE_MS = 1600;

function serializeDraft(content: string, projectId: string | null) {
  return JSON.stringify({ content, projectId });
}

export function useActiveNotePage() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();
  const projectsQuery = useProjectsQuery();
  const tasksQuery = useTasksQuery();
  const [phase, setPhase] = useState<ActiveNoteUiPhase>("compose");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<ActiveNote | null>(null);
  const [proposal, setProposal] = useState<ActiveNoteProposal | null>(null);
  const [operations, setOperations] = useState<ActiveNoteProposalOperation[]>(
    []
  );
  const [saveState, setSaveState] = useState<ActiveNoteSaveState>("idle");
  const [composeError, setComposeError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [analysisStatus, setAnalysisStatus] =
    useState<AnalysisStatusText>("Reading note");
  const [applyResult, setApplyResult] =
    useState<ApplyActiveNoteProposalResult | null>(null);
  const [editingOperationId, setEditingOperationId] = useState<string | null>(
    null
  );

  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedSnapshotRef = useRef<string>(serializeDraft("", null));
  const analysisRequestRef = useRef(0);
  const cancelledAnalysisRef = useRef(false);

  const characterCount = content.length;
  const selectedCount = operations.filter(
    (op) =>
      op.selected &&
      op.operationType !== "no_action" &&
      op.duplicateResolution !== "ignore"
  ).length;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      const dirty =
        serializeDraft(content, projectId) !== lastSavedSnapshotRef.current;
      if (dirty && content.trim()) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [content, projectId]);

  useEffect(() => {
    if (phase !== "compose" || !activeNote) return;

    const snapshot = serializeDraft(content, projectId);
    if (snapshot === lastSavedSnapshotRef.current) {
      if (saveState === "unsaved" || saveState === "pending") {
        setSaveState("saved");
      }
      return;
    }

    setSaveState("pending");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void persistNote({ silent: true });
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(saveTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- persistNote closes over latest state
  }, [content, projectId, activeNote?.id, phase]);

  useEffect(() => {
    if (!isAnalyzing) return;
    const stages: AnalysisStatusText[] = [
      "Reading note",
      "Finding related Spydr objects",
      "Preparing suggestions",
    ];
    let index = 0;
    setAnalysisStatus(stages[0]);
    const timer = setInterval(() => {
      index = (index + 1) % stages.length;
      setAnalysisStatus(stages[index]);
    }, ANALYSIS_STATUS_ROTATE_MS);
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  async function persistNote(options?: {
    silent?: boolean;
  }): Promise<ActiveNote | null> {
    const contentError = validateNoteContent(content);
    if (contentError) {
      if (!options?.silent) setComposeError(contentError);
      setSaveState("error");
      return null;
    }

    setComposeError(null);
    setSaveState("saving");

    try {
      let note: ActiveNote;
      if (activeNote) {
        note = await activeNoteApi.update(activeNote.id, {
          content,
          projectId,
        });
      } else {
        note = await activeNoteApi.create({ content, projectId });
      }
      setActiveNote(note);
      lastSavedSnapshotRef.current = serializeDraft(
        note.content,
        note.projectId ?? null
      );
      setSaveState("saved");
      return note;
    } catch (error) {
      setSaveState("error");
      if (!options?.silent) {
        setComposeError(
          friendlyApiError(error, "Could not save the note. Try again.")
        );
      }
      return null;
    }
  }

  async function handleSave() {
    await persistNote();
  }

  async function handleAnalyze() {
    setComposeError(null);
    setAnalysisError(null);
    cancelledAnalysisRef.current = false;
    const requestId = ++analysisRequestRef.current;

    const contentError = validateNoteContent(content);
    if (contentError) {
      setComposeError(contentError);
      return;
    }

    setPhase("analyze");
    setIsAnalyzing(true);

    try {
      let note = activeNote;
      const needsSave =
        !note ||
        serializeDraft(content, projectId) !== lastSavedSnapshotRef.current;

      if (needsSave) {
        setSaveState("saving");
        note = await persistNote({ silent: true });
      }

      if (!note) {
        setPhase("compose");
        setIsAnalyzing(false);
        setComposeError("Could not save the note before analysis.");
        return;
      }

      if (cancelledAnalysisRef.current || requestId !== analysisRequestRef.current) {
        return;
      }

      const nextProposal = await activeNoteApi.analyze({
        content,
        projectId,
        activeNote: note,
      });

      if (cancelledAnalysisRef.current || requestId !== analysisRequestRef.current) {
        return;
      }

      setActiveNote(nextProposal.activeNote);
      setProposal(nextProposal);
      setOperations(nextProposal.operations.map((op) => ({ ...op })));
      setPhase("review");
    } catch (error) {
      if (cancelledAnalysisRef.current || requestId !== analysisRequestRef.current) {
        return;
      }
      setAnalysisError(
        friendlyApiError(
          error,
          "Analysis could not be completed. Your note was kept — you can retry."
        )
      );
      setPhase("analyze");
    } finally {
      if (requestId === analysisRequestRef.current) {
        setIsAnalyzing(false);
      }
    }
  }

  function handleCancelAnalysis() {
    cancelledAnalysisRef.current = true;
    analysisRequestRef.current += 1;
    setIsAnalyzing(false);
    setAnalysisError(null);
    setPhase("compose");
  }

  function handleRetryAnalysis() {
    void handleAnalyze();
  }

  function updateOperation(
    operationId: string,
    updater: (operation: ActiveNoteProposalOperation) => ActiveNoteProposalOperation
  ) {
    setOperations((current) =>
      current.map((op) => (op.id === operationId ? updater(op) : op))
    );
    setValidationErrors((current) => {
      if (!current[operationId]) return current;
      const next = { ...current };
      delete next[operationId];
      return next;
    });
  }

  function toggleOperationSelected(operationId: string, selected: boolean) {
    setOperations((current) => {
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
                : op.status
              : op.status,
          };
        }

        // Selecting a child under a proposed project also accepts the project.
        if (
          selected &&
          target.projectRef &&
          op.id === target.projectRef &&
          op.status !== "rejected"
        ) {
          return { ...op, selected: true };
        }

        // Deselecting a proposed project clears nested children.
        if (
          !selected &&
          target.objectType === "project" &&
          op.projectRef === target.id
        ) {
          return { ...op, selected: false };
        }

        return op;
      });
    });
    setValidationErrors((current) => {
      if (!current[operationId] && Object.keys(current).length === 0) {
        return current;
      }
      const next = { ...current };
      delete next[operationId];
      return next;
    });
  }

  function rejectOperation(operationId: string) {
    setOperations((current) => {
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
    });
    setValidationErrors((current) => {
      if (!current[operationId]) return current;
      const next = { ...current };
      delete next[operationId];
      return next;
    });
  }

  function acceptOperation(operationId: string) {
    updateOperation(operationId, (op) => ({
      ...op,
      selected: true,
      status: op.status === "edited" ? "edited" : "accepted",
      duplicateResolution:
        op.duplicateResolution === "ignore" ? null : op.duplicateResolution,
    }));
  }

  function setDuplicateResolution(
    operationId: string,
    resolution: DuplicateResolution
  ) {
    updateOperation(operationId, (op) => ({
      ...op,
      duplicateResolution: resolution,
      selected: resolution !== "ignore",
      status: resolution === "ignore" ? "rejected" : "accepted",
    }));
  }

  function setSelectedProjectId(operationId: string, nextProjectId: string | null) {
    updateOperation(operationId, (op) => {
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
        op.attachment?.type === "task" &&
        nextProjectId &&
        op.attachment.id
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

  function setObjectType(operationId: string, objectType: SpydrObjectType) {
    updateOperation(operationId, (op) => {
      const segment = {
        topic: op.segmentTopic ?? "",
        sourceText: op.segmentText ?? "",
        contextualText: op.contextualText ?? op.segmentText ?? "",
      };
      const projectId = op.selectedProjectId ?? null;
      const attachment =
        objectType === "note" ? op.attachment : null;
      const payload = buildPayloadForObjectType(
        objectType,
        segment,
        projectId
      );

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

  function setAttachment(
    operationId: string,
    attachment: ActiveNoteProposalAttachment | null
  ) {
    updateOperation(operationId, (op) => ({
      ...op,
      attachment,
      operationType: operationTypeForObjectType(
        op.objectType ?? "note",
        attachment?.type === "task"
      ),
      targetObjectId:
        attachment?.type === "task"
          ? attachment.id ?? null
          : null,
      targetTaskTitle:
        attachment?.type === "task" && attachment.id
          ? undefined
          : op.targetTaskTitle,
      selected: true,
      status: "edited",
    }));
  }

  function saveEditedPayload(operationId: string, payload: OperationPayload) {
    updateOperation(operationId, (op) => ({
      ...op,
      payload,
      status: "edited",
      selected: true,
    }));
    setEditingOperationId(null);
  }

  async function handleApply() {
    if (!activeNote || isApplying) return;

    const applyInput = operations.map((op) => ({
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
    setIsApplying(true);

    try {
      const result = await activeNoteApi.apply(activeNote.id, {
        content: activeNote.content,
        projectId: activeNote.projectId ?? projectId,
        operations: applyInput,
      });
      setApplyResult(result);
      setActiveNote(result.activeNote);

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
        ]);
      }

      setPhase("completed");
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

  function resetToCompose(options?: { keepContent?: boolean }) {
    analysisRequestRef.current += 1;
    cancelledAnalysisRef.current = false;
    setPhase("compose");
    setProposal(null);
    setOperations([]);
    setApplyResult(null);
    setAnalysisError(null);
    setApplyError(null);
    setValidationErrors({});
    setEditingOperationId(null);
    setIsAnalyzing(false);
    setIsApplying(false);
    setActiveNote(null);
    lastSavedSnapshotRef.current = serializeDraft(
      options?.keepContent ? content : "",
      options?.keepContent ? projectId : null
    );
    if (!options?.keepContent) {
      setContent("");
      setProjectId(null);
    }
    setSaveState("idle");
    setComposeError(null);
  }

  function handleContentChange(next: string) {
    setContent(next);
    setComposeError(null);
    if (saveState === "saved" || saveState === "idle") {
      setSaveState("unsaved");
    }
  }

  return {
    phase,
    content,
    projectId,
    activeNote,
    proposal,
    operations,
    projects: projectsQuery.data ?? [],
    tasks: tasksQuery.data ?? [],
    projectsLoading: projectsQuery.isLoading || tasksQuery.isLoading,
    saveState,
    composeError,
    analysisError,
    applyError,
    validationErrors,
    isAnalyzing,
    isApplying,
    analysisStatus,
    applyResult,
    editingOperationId,
    characterCount,
    selectedCount,
    setProjectId,
    setEditingOperationId,
    handleContentChange,
    handleSave,
    handleAnalyze,
    handleCancelAnalysis,
    handleRetryAnalysis,
    toggleOperationSelected,
    rejectOperation,
    acceptOperation,
    setDuplicateResolution,
    setSelectedProjectId,
    setObjectType,
    setAttachment,
    saveEditedPayload,
    handleApply,
    resetToCompose,
    returnToCompose: () => {
      setPhase("compose");
      setAnalysisError(null);
    },
  };
}
