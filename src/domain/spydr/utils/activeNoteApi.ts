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
  ActiveNoteProposal,
  ApplyActiveNoteProposalInput,
  ApplyActiveNoteProposalResult,
  CreateActiveNoteInput,
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

  return apiRequest<ApplyActiveNoteProposalResult>("/active-notes/apply", {
    method: "POST",
    body: {
      activeNoteId,
      content: input.content,
      projectId: input.projectId ?? null,
      operations: input.operations.map((operation) => ({
        operationId: operation.operationId,
        selected: operation.selected,
        objectType: operation.objectType ?? null,
        payload: operation.payload,
        selectedProjectId: operation.selectedProjectId ?? null,
        projectRef: operation.projectRef ?? null,
        duplicateResolution: operation.duplicateResolution ?? null,
        targetObjectId: operation.targetObjectId ?? null,
        attachment: operation.attachment ?? null,
      })),
    },
  });
}

export const activeNoteApi = {
  create: createActiveNote,
  update: updateActiveNote,
  analyze: analyzeActiveNote,
  getProposal: getActiveNoteProposal,
  apply: applyActiveNoteProposal,
};
