import type {
  BackendActiveNoteAnalyzeResponse,
  BackendExistingProjectActionPlan,
  BackendNewProjectCandidateActionPlan,
  BackendSegmentActionPlan,
  BackendUnassignedActionPlan,
} from "./activeNoteAnalyzeTypes";
import type {
  ActiveNote,
  ActiveNoteProposal,
  ActiveNoteProposalAttachment,
  ActiveNoteProposalOperation,
  ActiveNoteSegment,
  DuplicateResolution,
  NoteOperationPayload,
  OperationPayload,
  OperationType,
  RelatedSpydrObject,
  SpydrObjectType,
} from "./activeNoteTypes";

function isExistingProjectPlan(
  plan: BackendSegmentActionPlan
): plan is BackendExistingProjectActionPlan {
  return !("destination" in plan);
}

function isNewProjectCandidatePlan(
  plan: BackendSegmentActionPlan
): plan is BackendNewProjectCandidateActionPlan {
  return "destination" in plan && plan.destination === "new_project_candidate";
}

function isUnassignedPlan(
  plan: BackendSegmentActionPlan
): plan is BackendUnassignedActionPlan {
  return "destination" in plan && plan.destination === "unassigned";
}

function toSegment(
  segment: BackendActiveNoteAnalyzeResponse["segments"][number],
  index: number
): ActiveNoteSegment {
  const ref = `seg-${index}`;
  return {
    ref,
    topic: segment.topic,
    sourceText: segment.sourceText,
    contextualText: segment.contextualText,
    subject: segment.topic,
    text: segment.sourceText,
  };
}

function intentLabel(intent: string): string {
  return intent.replace(/_/g, " ");
}

function applyNotePayload(
  payload: { subject?: string; title?: string; content?: string },
  projectId: string
): NoteOperationPayload {
  const content = payload.content?.trim() || "";
  const title =
    payload.subject?.trim() ||
    payload.title?.trim() ||
    content.split(/\r?\n/)[0]?.trim().slice(0, 80) ||
    "Note";
  return {
    kind: "note",
    title,
    content,
    projectId,
  };
}

function buildSummary(actionPlans: BackendSegmentActionPlan[]): string {
  const actionable = actionPlans.filter((plan) => !isUnassignedPlan(plan));
  if (actionable.length === 0) {
    return "Your note was read, but nothing needs to be captured in Spydr yet.";
  }
  if (actionable.length === 1) {
    return "One segment from your note is ready to review.";
  }
  return `${actionable.length} segments from your note are ready to review.`;
}

function collectRelatedProjects(
  actionPlans: BackendSegmentActionPlan[]
): RelatedSpydrObject[] {
  const byId = new Map<string, RelatedSpydrObject>();
  for (const plan of actionPlans) {
    if (isExistingProjectPlan(plan) && plan.projectId) {
      byId.set(plan.projectId, {
        id: plan.projectId,
        type: "project",
        title: plan.projectName,
        relevanceReason: "Matched from your note",
      });
    }
    if (isNewProjectCandidatePlan(plan)) {
      byId.set(`candidate:${plan.projectName}`, {
        id: `candidate:${plan.projectName}`,
        type: "project",
        title: plan.projectName,
        relevanceReason: "Suggested new project",
      });
    }
  }
  return [...byId.values()];
}

function mapExistingProjectPlan(
  plan: BackendExistingProjectActionPlan,
  index: number,
  segmentRef: string,
  relatedProjects: RelatedSpydrObject[]
): ActiveNoteProposalOperation {
  const { action } = plan;
  const confidence = action.confidence;
  const reason = action.reason;
  const projectId = plan.projectId;

  let objectType: SpydrObjectType;
  let operationType: OperationType;
  let payload: OperationPayload;
  let attachment: ActiveNoteProposalAttachment | null = null;
  let targetObjectId: string | null = projectId;
  let targetTaskTitle: string | undefined;
  let selected = true;
  let duplicateResolution: DuplicateResolution | null = null;
  let explicitlyStated = plan.intent === "task_action" || plan.intent === "progress_update";

  switch (action.type) {
    case "create_task":
      objectType = "task";
      operationType = "create";
      payload = {
        kind: "task",
        title: action.payload.title,
        description: action.payload.description ?? undefined,
        projectId,
      };
      break;
    case "create_note":
      objectType = "note";
      operationType = "create";
      payload = applyNotePayload(action.payload, projectId);
      break;
    case "attach_note_to_task":
      objectType = "note";
      operationType = "attach_context";
      payload = applyNotePayload(action.payload, projectId);
      attachment = { type: "task", id: action.targetTaskId, ref: null };
      targetObjectId = action.targetTaskId;
      targetTaskTitle = action.targetTaskTitle;
      explicitlyStated = true;
      break;
    case "create_decision":
      objectType = "decision";
      operationType = "create";
      payload = {
        kind: "decision",
        title: action.payload.title,
        rationale: action.payload.rationale ?? undefined,
        projectId,
      };
      break;
    case "create_idea":
      objectType = "idea";
      operationType = "create";
      payload = {
        kind: "idea",
        title: action.payload.title,
        description: action.payload.description ?? undefined,
        projectId,
      };
      break;
    case "use_existing_task":
      objectType = "task";
      operationType = "update";
      payload = {
        kind: "task",
        title: action.targetTaskTitle,
        projectId,
      };
      targetObjectId = action.targetTaskId;
      targetTaskTitle = action.targetTaskTitle;
      attachment = { type: "task", id: action.targetTaskId, ref: null };
      duplicateResolution = "attach_existing";
      break;
    default:
      objectType = "note";
      operationType = "create";
      payload = {
        kind: "note",
        title: plan.topic ?? "Note",
        content: plan.originalText,
        projectId,
      };
  }

  const candidateProjects = relatedProjects.filter((p) => !p.id.startsWith("candidate:"));

  return {
    id: `op-${index}`,
    operationType,
    objectType,
    targetObjectId,
    segmentRef,
    attachment,
    payload,
    confidence,
    evidence: [plan.originalText],
    reasoningSummary: reason,
    explicitlyStated,
    status: "proposed",
    selected,
    duplicateResolution,
    candidateProjects: candidateProjects.length > 0 ? candidateProjects : undefined,
    selectedProjectId: projectId,
    segmentTopic: plan.topic ?? undefined,
    segmentText: plan.originalText,
    contextualText: plan.contextualText ?? plan.originalText,
    intent: plan.intent,
    routingDestination: "existing_project",
    suggestedProjectName: plan.projectName,
    targetTaskTitle,
  };
}

function mapNewProjectCandidatePlan(
  plan: BackendNewProjectCandidateActionPlan,
  index: number,
  segmentRef: string
): ActiveNoteProposalOperation {
  return {
    id: `op-${index}`,
    operationType: "create",
    objectType: "project",
    targetObjectId: null,
    segmentRef,
    attachment: null,
    payload: {
      kind: "project",
      title: plan.projectName,
      description: plan.contextualText ?? plan.originalText,
    },
    confidence: plan.confidence,
    evidence: [plan.originalText],
    reasoningSummary: plan.reason,
    explicitlyStated: false,
    status: "proposed",
    selected: true,
    selectedProjectId: null,
    segmentTopic: plan.topic ?? undefined,
    segmentText: plan.originalText,
    contextualText: plan.contextualText ?? plan.originalText,
    routingDestination: "new_project_candidate",
    suggestedProjectName: plan.projectName,
  };
}

function mapUnassignedPlan(
  plan: BackendUnassignedActionPlan,
  index: number,
  segmentRef: string
): ActiveNoteProposalOperation {
  const title = plan.topic?.trim() || plan.originalText.trim().slice(0, 80) || "Untitled";
  return {
    id: `op-${index}`,
    operationType: "suggest_create",
    objectType: "idea",
    targetObjectId: null,
    segmentRef,
    attachment: null,
    payload: {
      kind: "idea",
      title,
      description: plan.contextualText ?? plan.originalText,
      projectId: null,
    },
    confidence: plan.confidence,
    evidence: [plan.originalText],
    reasoningSummary: plan.reason,
    explicitlyStated: false,
    status: "proposed",
    selected: false,
    selectedProjectId: null,
    segmentTopic: plan.topic ?? undefined,
    segmentText: plan.originalText,
    contextualText: plan.contextualText ?? plan.originalText,
    routingDestination: "unassigned",
    needsUserDecision: true,
  };
}

function mapActionPlan(
  plan: BackendSegmentActionPlan,
  index: number,
  segmentRef: string,
  relatedProjects: RelatedSpydrObject[]
): ActiveNoteProposalOperation {
  if (isUnassignedPlan(plan)) {
    return mapUnassignedPlan(plan, index, segmentRef);
  }
  if (isNewProjectCandidatePlan(plan)) {
    return mapNewProjectCandidatePlan(plan, index, segmentRef);
  }
  return mapExistingProjectPlan(plan, index, segmentRef, relatedProjects);
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
  const segments = (input.response.segments ?? []).map(toSegment);
  const relatedObjects = collectRelatedProjects(input.response.actionPlans ?? []);

  const operations = (input.response.actionPlans ?? []).map((plan, index) =>
    mapActionPlan(plan, index, segments[index]?.ref ?? `seg-${index}`, relatedObjects)
  );

  const summary = buildSummary(input.response.actionPlans ?? []);

  return {
    activeNote: toActiveNote(
      input.activeNote,
      input.content,
      input.projectId
    ),
    summary,
    routing: null,
    impact: null,
    segments,
    routes: [],
    operations,
    warnings: [],
    relatedObjects,
  };
}

export { intentLabel };
