import type {
  BackendActiveNoteAnalyzeResponse,
  BackendActiveNoteProposal,
} from "./activeNoteAnalyzeTypes";
import type {
  ActiveNote,
  ActiveNoteProposal,
  ActiveNoteProposalAttachment,
  ActiveNoteProposalOperation,
  OperationPayload,
  OperationType,
  RelatedSpydrObject,
  SpydrObjectType,
} from "./activeNoteTypes";
import { filterUserFacingWarnings } from "./activeNoteWarnings";

function resolveProjectId(
  proposal: BackendActiveNoteProposal,
  response: BackendActiveNoteAnalyzeResponse
): string | null {
  if (proposal.suggestedProjectId) return proposal.suggestedProjectId;
  if (proposal.parent?.projectId) return proposal.parent.projectId;
  if (proposal.parent?.projectRef) return null;

  const segmentRef = proposal.segmentRef?.trim();
  if (segmentRef && response.routes?.length) {
    const route = response.routes.find((item) => item.segmentRef === segmentRef);
    if (route?.destination === "existing_project" && route.projectId) {
      return route.projectId;
    }
  }

  if (response.routing.destination === "existing_project") {
    return response.routing.projectId ?? null;
  }
  return null;
}

function toUiOperationType(
  proposal: BackendActiveNoteProposal
): OperationType {
  if (proposal.operationType === "attach_context") return "attach_context";
  if (proposal.operationType === "no_action") return "no_action";
  if (proposal.operationType === "suggest_create") return "suggest_create";
  return "create";
}

function isSelected(proposal: BackendActiveNoteProposal): boolean {
  if (proposal.operationType === "no_action") return false;
  if (proposal.operationType === "suggest_create") return false;
  return (
    proposal.explicitlyStated ||
    proposal.operationType === "create" ||
    proposal.operationType === "attach_context"
  );
}

function toPayload(
  proposal: BackendActiveNoteProposal,
  projectId: string | null
): OperationPayload {
  const { payload, objectType, operationType } = proposal;

  if (operationType === "no_action") {
    return {
      kind: "no_action",
      message:
        payload.description ||
        payload.title ||
        "No useful Spydr change should result from this note.",
    };
  }

  switch (objectType) {
    case "note":
      return {
        kind: "note",
        title:
          payload.title?.trim() ||
          payload.content?.trim().split(/\r?\n/)[0]?.trim().slice(0, 80) ||
          "Active note",
        content: payload.content ?? payload.description ?? "",
        projectId,
      };
    case "task":
      return {
        kind: "task",
        title: payload.title?.trim() || "Untitled task",
        description: payload.description,
        priority: payload.priority,
        dueDate: payload.dueDate ?? null,
        projectId,
      };
    case "decision":
      return {
        kind: "decision",
        title: payload.title?.trim() || "Untitled decision",
        description: payload.description,
        rationale: payload.rationale,
        projectId,
      };
    case "idea":
      return {
        kind: "idea",
        title: payload.title?.trim() || "Untitled idea",
        description: payload.description,
        projectId,
      };
    case "project":
      return {
        kind: "project",
        title: payload.title?.trim() || "Untitled project",
        description: payload.description,
      };
    case "person":
      return {
        kind: "person",
        title: (payload.name ?? payload.title)?.trim() || "Untitled person",
        description: payload.description,
      };
    default:
      return {
        kind: "note",
        title:
          payload.title?.trim() ||
          payload.content?.trim().split(/\r?\n/)[0]?.trim().slice(0, 80) ||
          "Active note",
        content: payload.content ?? payload.description ?? "",
        projectId,
      };
  }
}

function relatedTaskIdForProposal(
  proposal: BackendActiveNoteProposal,
  response: BackendActiveNoteAnalyzeResponse
): string | null {
  const segmentRef = proposal.segmentRef?.trim();
  if (segmentRef && response.routes?.length) {
    const route = response.routes.find((item) => item.segmentRef === segmentRef);
    if (route?.relatedTaskId) return route.relatedTaskId;
  }
  return response.routing.relatedTaskId ?? null;
}

function toAttachment(
  proposal: BackendActiveNoteProposal,
  response: BackendActiveNoteAnalyzeResponse
): ActiveNoteProposalAttachment | null {
  if (proposal.attachment) {
    return {
      type: proposal.attachment.type,
      id: proposal.attachment.id ?? null,
      ref: proposal.attachment.ref ?? null,
    };
  }

  const relatedTaskId = relatedTaskIdForProposal(proposal, response);
  if (
    (proposal.objectType === "note" ||
      proposal.operationType === "attach_context") &&
    relatedTaskId
  ) {
    return {
      type: "task",
      id: relatedTaskId,
      ref: null,
    };
  }

  return null;
}

function toOperation(
  proposal: BackendActiveNoteProposal,
  index: number,
  response: BackendActiveNoteAnalyzeResponse,
  candidateProjects: RelatedSpydrObject[]
): ActiveNoteProposalOperation {
  const objectType = proposal.objectType as SpydrObjectType;
  const operationType = toUiOperationType(proposal);
  const projectId = resolveProjectId(proposal, response);
  const projectRef = proposal.parent?.projectRef?.trim() || null;
  const requiresProject =
    proposal.requiresProject ??
    ["task", "note", "decision", "idea"].includes(proposal.objectType);
  const projectCandidates =
    requiresProject && !projectRef && candidateProjects.length > 0
      ? candidateProjects
      : undefined;

  const attachment = toAttachment(proposal, response);
  const relatedTaskId = relatedTaskIdForProposal(proposal, response);
  const targetObjectId =
    attachment?.type === "task"
      ? attachment.id ?? relatedTaskId
      : projectId;

  return {
    id: proposal.ref || `op-${index}-${proposal.objectType}`,
    operationType,
    objectType,
    targetObjectId,
    projectRef,
    segmentRef: proposal.segmentRef?.trim() || null,
    attachment,
    payload: toPayload(proposal, projectId),
    confidence: proposal.confidence,
    evidence: proposal.evidence ?? [],
    reasoningSummary: proposal.reason,
    explicitlyStated: proposal.explicitlyStated,
    status: "proposed",
    selected: isSelected(proposal),
    candidateProjects: projectCandidates,
    selectedProjectId: projectId,
  };
}

interface AnalyzeActiveNoteDraft {
  id: string;
  content: string;
  projectId?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function toActiveNote(
  responseNote: AnalyzeActiveNoteDraft | null | undefined,
  content: string,
  projectId?: string | null
): ActiveNote {
  const timestamp = new Date().toISOString();
  if (responseNote) {
    return {
      id: responseNote.id,
      content,
      projectId: projectId ?? responseNote.projectId ?? null,
      status: "review",
      createdAt: responseNote.createdAt,
      updatedAt: timestamp,
    };
  }

  return {
    id: crypto.randomUUID(),
    content,
    projectId: projectId ?? null,
    status: "review",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function mapActiveNoteAnalyzeResponse(input: {
  response: BackendActiveNoteAnalyzeResponse;
  content: string;
  projectId?: string | null;
  activeNote?: AnalyzeActiveNoteDraft | null;
}): ActiveNoteProposal {
  const relatedObjects: RelatedSpydrObject[] = (
    input.response.candidateProjects ?? []
  ).map((project) => ({
    id: project.id,
    type: "project" as const,
    title: project.title,
    relevanceReason: project.relevanceReason,
  }));

  if (input.response.routing.relatedTaskId) {
    relatedObjects.push({
      id: input.response.routing.relatedTaskId,
      type: "task",
      title: "Related task",
      relevanceReason: "Identified as the best existing task attachment",
    });
  }

  const routedProjectId =
    input.projectId ?? input.response.routing.projectId ?? null;

  const operations = (input.response.proposals ?? []).map((proposal, index) =>
    toOperation(proposal, index, input.response, relatedObjects)
  );

  return {
    activeNote: toActiveNote(
      input.activeNote,
      input.content,
      routedProjectId
    ),
    summary: input.response.summary,
    routing: input.response.routing,
    impact: input.response.impact ?? null,
    segments: input.response.segments ?? [],
    routes: input.response.routes ?? [],
    operations,
    warnings: filterUserFacingWarnings(input.response.warnings ?? []),
    relatedObjects,
  };
}
