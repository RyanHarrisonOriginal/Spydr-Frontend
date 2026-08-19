import { apiRequest } from "@/lib/apiClient";
import type { AnalyzeActiveNoteInput } from "./activeNoteAnalyzeTypes";
import type { BackendActiveNoteAnalyzeResponse } from "./activeNoteAnalyzeTypes";
import {
  mockAnalyzeActiveNote,
  mockApplyActiveNoteProposal,
  mockCreateActiveNote,
  mockGetActiveNoteProposal,
  mockUpdateActiveNote,
} from "./activeNoteMocks";
import { mapActiveNoteAnalyzeResponse } from "./mapActiveNoteAnalyzeResponse";
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

  const response = await apiRequest<BackendActiveNoteAnalyzeResponse>(
    "/active-notes/analyze",
    {
      method: "POST",
      body: {
        content: input.content,
        projectId: input.projectId ?? null,
      },
    }
  );

  return mapActiveNoteAnalyzeResponse({
    response,
    content: input.content,
    projectId: input.projectId,
    activeNote: input.activeNote,
  });
}

export async function getActiveNoteProposal(
  activeNoteId: string
): Promise<ActiveNoteProposal> {
  if (isActiveNoteMockMode()) {
    return mockGetActiveNoteProposal(activeNoteId);
  }
  throw new Error("Loading saved Active Note proposals is not available yet.");
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
