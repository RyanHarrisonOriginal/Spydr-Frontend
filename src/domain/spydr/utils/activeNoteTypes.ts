import type { SpydrPriority } from "./types";

export type ActiveNoteStatus =
  | "draft"
  | "analyzing"
  | "review"
  | "completed"
  | "failed";

export type ProposalStatus =
  | "proposed"
  | "accepted"
  | "rejected"
  | "edited"
  | "executed"
  | "failed";

export type OperationType =
  | "create"
  | "update"
  | "link"
  | "suggest_create"
  | "suggest_update"
  | "attach_context"
  | "no_action";

export type ActiveNoteRoutingDestination =
  | "existing_project"
  | "new_project"
  | "idea_only"
  | "no_action";

export type ExistingProjectImpact =
  | "task_context"
  | "new_task"
  | "project_context"
  | "decision"
  | "idea"
  | "mixed";

export interface ActiveNoteRoutingDecision {
  destination: ActiveNoteRoutingDestination;
  projectId?: string | null;
  relatedTaskId?: string | null;
  reason: string;
  confidence: number;
}

export interface ActiveNoteImpact {
  type: ExistingProjectImpact;
  reason: string;
}

export type ActiveNoteRoutingDestinationKind =
  | "existing_project"
  | "new_project_candidate"
  | "unassigned";

export interface ActiveNoteSegment {
  ref: string;
  topic: string;
  sourceText: string;
  contextualText: string;
  /** Legacy alias for topic */
  subject: string;
  /** Legacy alias for sourceText */
  text: string;
}

export interface ActiveNoteSegmentRoute {
  segmentRef: string;
  destination: ActiveNoteRoutingDestination;
  projectId?: string | null;
  relatedTaskId?: string | null;
  reason: string;
  confidence: number;
  impact?: ActiveNoteImpact | null;
}

export interface ActiveNoteProposalAttachment {
  type: "project" | "task";
  id?: string | null;
  ref?: string | null;
}

export type SpydrObjectType =
  | "project"
  | "task"
  | "note"
  | "goal"
  | "decision"
  | "idea"
  | "person"
  | "relationship";

export type ActiveNoteUiPhase = "compose" | "analyze" | "review" | "completed";

export type DuplicateResolution =
  | "attach_existing"
  | "create_new"
  | "ignore";

export type ProposalPresentationKind =
  | "detected"
  | "suggested"
  | "existing_match"
  | "needs_review"
  | "warning"
  | "no_action";

export interface ActiveNote {
  id: string;
  content: string;
  projectId?: string | null;
  status: ActiveNoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NoteOperationPayload {
  kind: "note";
  title: string;
  content: string;
  subtype?: string | null;
  projectId?: string | null;
}

export interface TaskOperationPayload {
  kind: "task";
  title: string;
  description?: string;
  priority?: SpydrPriority | string;
  dueDate?: string | null;
  projectId?: string | null;
}

export interface ProjectOperationPayload {
  kind: "project";
  title: string;
  description?: string;
  status?: string;
}

export interface GoalOperationPayload {
  kind: "goal";
  title: string;
  description?: string;
  projectId?: string | null;
}

export interface DecisionOperationPayload {
  kind: "decision";
  title: string;
  description?: string;
  rationale?: string;
  projectId?: string | null;
}

export interface IdeaOperationPayload {
  kind: "idea";
  title: string;
  description?: string;
  projectId?: string | null;
}

export interface PersonOperationPayload {
  kind: "person";
  title: string;
  description?: string;
}

export interface LinkOperationPayload {
  kind: "link";
  sourceObjectId?: string | null;
  sourceLabel?: string;
  targetObjectId: string;
  targetLabel?: string;
  targetObjectType?: SpydrObjectType;
  relationshipType: string;
}

export interface NoActionPayload {
  kind: "no_action";
  message: string;
}

export type OperationPayload =
  | NoteOperationPayload
  | TaskOperationPayload
  | ProjectOperationPayload
  | GoalOperationPayload
  | DecisionOperationPayload
  | IdeaOperationPayload
  | PersonOperationPayload
  | LinkOperationPayload
  | NoActionPayload;

export interface RelatedSpydrObject {
  id: string;
  type: SpydrObjectType;
  title: string;
  relevanceReason?: string;
}

export interface ActiveNoteProposalOperation {
  id: string;
  operationType: OperationType;
  objectType?: SpydrObjectType;
  targetObjectId?: string | null;
  relationshipType?: string | null;
  /** When set, this op depends on a Project proposal ref in the same plan. */
  projectRef?: string | null;
  /** Ties this op to a multi-subject note segment. */
  segmentRef?: string | null;
  attachment?: ActiveNoteProposalAttachment | null;
  payload: OperationPayload;
  confidence: number;
  evidence: string[];
  reasoningSummary?: string;
  explicitlyStated: boolean;
  status: ProposalStatus;
  selected: boolean;
  warning?: string | null;
  duplicateOf?: RelatedSpydrObject | null;
  candidateProjects?: RelatedSpydrObject[];
  duplicateResolution?: DuplicateResolution | null;
  selectedProjectId?: string | null;
  /** Segment topic from analysis */
  segmentTopic?: string;
  /** Original segment text from the note */
  segmentText?: string;
  /** Contextualized segment text */
  contextualText?: string;
  /** Backend segment intent (progress_update, task_action, etc.) */
  intent?: string;
  /** How the segment was routed to a project */
  routingDestination?: ActiveNoteRoutingDestinationKind;
  /** Suggested or matched project name */
  suggestedProjectName?: string;
  /** Target task title when attaching to a task */
  targetTaskTitle?: string;
  /** Unassigned segments need the user to pick an action */
  needsUserDecision?: boolean;
}

export interface ActiveNoteProposal {
  activeNote: ActiveNote;
  summary: string;
  routing?: ActiveNoteRoutingDecision | null;
  impact?: ActiveNoteImpact | null;
  segments?: ActiveNoteSegment[];
  routes?: ActiveNoteSegmentRoute[];
  operations: ActiveNoteProposalOperation[];
  warnings: string[];
  relatedObjects?: RelatedSpydrObject[];
}

export interface CreateActiveNoteInput {
  content: string;
  projectId?: string | null;
}

export interface UpdateActiveNoteInput {
  content?: string;
  projectId?: string | null;
}

export interface ApplyActiveNoteOperationInput {
  operationId: string;
  selected: boolean;
  objectType?: SpydrObjectType | null;
  payload: OperationPayload;
  duplicateResolution?: DuplicateResolution | null;
  selectedProjectId?: string | null;
  projectRef?: string | null;
  targetObjectId?: string | null;
  attachment?: ActiveNoteProposalAttachment | null;
}

export interface ApplyActiveNoteProposalInput {
  activeNoteId?: string;
  content?: string;
  projectId?: string | null;
  operations: ApplyActiveNoteOperationInput[];
}

export interface AppliedActiveNoteObject {
  id: string;
  type: SpydrObjectType;
  title: string;
  action: "created" | "updated" | "linked";
  href: string;
}

export interface ApplyActiveNoteProposalResult {
  activeNote: ActiveNote;
  applied: AppliedActiveNoteObject[];
  failed: Array<{
    operationId: string;
    message: string;
  }>;
  partial: boolean;
}

export const ACTIVE_NOTE_MAX_LENGTH = 8000;
export const ACTIVE_NOTE_MIN_LENGTH = 1;

export const SUPPORTED_OBJECT_TYPES: readonly SpydrObjectType[] = [
  "project",
  "task",
  "note",
  "goal",
  "decision",
  "idea",
  "person",
  "relationship",
] as const;
