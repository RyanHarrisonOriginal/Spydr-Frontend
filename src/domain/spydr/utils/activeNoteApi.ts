import { apiRequest } from "@/lib/apiClient";
import type { AnalyzeActiveNoteInput } from "./activeNoteAnalyzeTypes";
import type {
  BackendActiveNoteAnalysisSnapshot,
  BackendActiveNoteAnalyzeAccepted,
  BackendActiveNoteAnalyzeResponse,
} from "./activeNoteAnalyzeTypes";
import {
  mockAnalyzeActiveNote,
  mockApplyActiveNoteProposal,
  mockCreateActiveNote,
  mockGetActiveNoteProposal,
  mockUpdateActiveNote,
} from "./activeNoteMocks";
import { mapActiveNoteAnalyzeResponse } from "./mapActiveNoteAnalyzeResponse";
import { overlayReviewSnapshotOnProposal } from "./overlayActiveNoteReview";
import type {
  ActiveNote,
  ActiveNoteHistoryItem,
  ActiveNoteProposal,
  ApplyActiveNoteProposalInput,
  ApplyActiveNoteProposalResult,
  CreateActiveNoteInput,
  OperationPayload,
  UpdateActiveNoteInput,
} from "./activeNoteTypes";

export function isActiveNoteMockMode(): boolean {
  return import.meta.env.VITE_USE_ACTIVE_NOTE_MOCKS === "true";
}

function createLocalDraft(input: CreateActiveNoteInput): ActiveNote {
  const timestamp = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    content: input.content,
    projectId: input.projectId ?? null,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function createActiveNote(
  input: CreateActiveNoteInput
): Promise<ActiveNote> {
  if (isActiveNoteMockMode()) {
    return mockCreateActiveNote(input);
  }
  // Persist endpoint is not available yet — keep a local draft for the UI flow.
  return createLocalDraft(input);
}

export async function updateActiveNote(
  activeNoteId: string,
  input: UpdateActiveNoteInput
): Promise<ActiveNote> {
  if (isActiveNoteMockMode()) {
    return mockUpdateActiveNote(activeNoteId, input);
  }
  const timestamp = new Date().toISOString();
  return {
    id: activeNoteId,
    content: input.content ?? "",
    projectId: input.projectId ?? null,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function analyzeActiveNote(
  input: AnalyzeActiveNoteInput
): Promise<ActiveNoteProposal> {
  if (isActiveNoteMockMode()) {
    const note = input.activeNote
      ? await mockUpdateActiveNote(input.activeNote.id, {
          content: input.content,
          projectId: input.projectId ?? input.activeNote.projectId ?? null,
        })
      : await mockCreateActiveNote({
          content: input.content,
          projectId: input.projectId,
        });

    return mockAnalyzeActiveNote(note.id);
  }

  const accepted = await apiRequest<BackendActiveNoteAnalyzeAccepted>(
    "/active-notes/analyze",
    {
      method: "POST",
      body: {
        content: input.content,
        projectId: input.projectId ?? null,
      },
      signal: input.signal,
    }
  );

  const snapshot = await waitForActiveNoteAnalysis(accepted.sessionId, input);
  const response: BackendActiveNoteAnalyzeResponse = {
    sessionId: snapshot.sessionId,
    segments: snapshot.segments ?? [],
    actionPlans: snapshot.actionPlans ?? [],
  };

  return mapActiveNoteAnalyzeResponse({
    response,
    content: input.content,
    projectId: input.projectId,
    activeNote: input.activeNote,
  });
}

const ANALYSIS_POLL_MS = 1_000;
const ANALYSIS_TIMEOUT_MS = 180_000;

function throwIfAborted(signal?: AbortSignal): void {
  if (!signal?.aborted) return;
  const error = new Error("Analysis cancelled");
  error.name = "AbortError";
  throw error;
}

async function waitForActiveNoteAnalysis(
  sessionId: string,
  input: AnalyzeActiveNoteInput
): Promise<BackendActiveNoteAnalysisSnapshot> {
  const startedAt = Date.now();

  while (true) {
    throwIfAborted(input.signal);

    const snapshot = await apiRequest<BackendActiveNoteAnalysisSnapshot>(
      `/active-notes/${sessionId}`,
      { signal: input.signal }
    );
    input.onProgress?.(snapshot.completedSteps ?? []);

    if (snapshot.status === "review" || snapshot.status === "completed") {
      return snapshot;
    }

    if (snapshot.status === "failed") {
      throw new Error(
        snapshot.errorMessage ??
          "Analysis could not be completed. Your note was kept — you can retry."
      );
    }

    if (Date.now() - startedAt > ANALYSIS_TIMEOUT_MS) {
      throw new Error("Analysis timed out. Please try again.");
    }

    await sleep(ANALYSIS_POLL_MS, input.signal);
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      const error = new Error("Analysis cancelled");
      error.name = "AbortError";
      reject(error);
    };
    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function getActiveNoteProposal(
  activeNoteId: string
): Promise<ActiveNoteProposal> {
  if (isActiveNoteMockMode()) {
    return mockGetActiveNoteProposal(activeNoteId);
  }

  const snapshot = await apiRequest<BackendActiveNoteAnalysisSnapshot>(
    `/active-notes/${activeNoteId}`
  );
  if (snapshot.status === "analyzing" || snapshot.status === "applying") {
    throw new Error("Active note analysis is still in progress.");
  }
  if (snapshot.status === "failed" && !snapshot.actionPlans?.length) {
    throw new Error(snapshot.errorMessage ?? "Active note analysis failed.");
  }

  const proposal = mapActiveNoteAnalyzeResponse({
    response: {
      sessionId: snapshot.sessionId,
      segments: snapshot.segments ?? [],
      actionPlans: snapshot.actionPlans ?? [],
    },
    content: snapshot.content,
    projectId: snapshot.projectId,
  });

  const status =
    snapshot.status === "completed"
      ? "completed"
      : snapshot.status === "failed"
        ? "failed"
        : "review";

  return overlayReviewSnapshotOnProposal(
    {
      ...proposal,
      activeNote: {
        ...proposal.activeNote,
        status,
      },
    },
    snapshot.reviewSnapshot
  );
}

export async function applyActiveNoteProposal(
  activeNoteId: string,
  input: ApplyActiveNoteProposalInput
): Promise<ApplyActiveNoteProposalResult> {
  if (isActiveNoteMockMode()) {
    return mockApplyActiveNoteProposal(activeNoteId, input);
  }

  const body = buildActiveNoteApplyRequestBody(activeNoteId, input);
  console.info("[active-note.apply] request", {
    path: "/active-notes/apply",
    activeNoteId,
    projectId: body.projectId,
    operations: (body.operations as Array<{ operationId: string; selected: boolean; objectType?: string | null; payload?: { kind?: string } }>).map(
      (operation) => ({
        operationId: operation.operationId,
        selected: operation.selected,
        objectType: operation.objectType ?? null,
        kind: operation.payload?.kind ?? null,
      })
    ),
  });

  try {
    const result = await apiRequest<ApplyActiveNoteProposalResult>(
      "/active-notes/apply",
      {
        method: "POST",
        body,
        signal: AbortSignal.timeout(45_000),
      }
    );
    console.info("[active-note.apply] response", {
      applied: result.applied.length,
      failed: result.failed.length,
      partial: result.partial,
      failedMessages: result.failed,
    });
    return result;
  } catch (error) {
    console.error("[active-note.apply] request failed", error);
    throw error;
  }
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toApplyPayload(payload: OperationPayload): Record<string, unknown> {
  const projectId =
    "projectId" in payload ? emptyToNull(payload.projectId) : undefined;

  if (payload.kind === "person") {
    return {
      ...payload,
      name: payload.title,
    };
  }

  if (payload.kind === "link") {
    return {
      ...payload,
      sourceObjectId: emptyToNull(payload.sourceObjectId),
      targetObjectId: emptyToNull(payload.targetObjectId),
    };
  }

  if (projectId !== undefined) {
    return { ...payload, projectId };
  }

  return { ...payload };
}

export function buildActiveNoteApplyRequestBody(
  activeNoteId: string,
  input: ApplyActiveNoteProposalInput
): Record<string, unknown> {
  return {
    activeNoteId: emptyToNull(activeNoteId) ?? emptyToNull(input.activeNoteId),
    content: input.content,
    projectId: emptyToNull(input.projectId),
    operations: input.operations.map((operation) => ({
      operationId: operation.operationId,
      selected: operation.selected,
      objectType: operation.objectType ?? null,
      payload: toApplyPayload(operation.payload),
      selectedProjectId: emptyToNull(operation.selectedProjectId),
      projectRef: emptyToNull(operation.projectRef),
      duplicateResolution: operation.duplicateResolution ?? null,
      targetObjectId: emptyToNull(operation.targetObjectId),
      attachment: operation.attachment
        ? {
            type: operation.attachment.type,
            id: emptyToNull(operation.attachment.id),
            ref: emptyToNull(operation.attachment.ref),
          }
        : null,
    })),
  };
}

export async function listActiveNotes(): Promise<ActiveNoteHistoryItem[]> {
  if (isActiveNoteMockMode()) {
    return [];
  }
  return apiRequest<ActiveNoteHistoryItem[]>("/active-notes");
}

export const activeNoteApi = {
  create: createActiveNote,
  update: updateActiveNote,
  analyze: analyzeActiveNote,
  getProposal: getActiveNoteProposal,
  apply: applyActiveNoteProposal,
  list: listActiveNotes,
};
