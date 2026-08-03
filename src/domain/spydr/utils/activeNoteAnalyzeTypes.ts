/** Backend analyze contract (POST /active-notes/analyze). */

export type BackendActiveNoteOperationType =
  | "create"
  | "suggest_create"
  | "attach_context"
  | "no_action";

export type BackendActiveNoteObjectType =
  | "project"
  | "task"
  | "note"
  | "decision"
  | "idea"
  | "person";

export type BackendActiveNoteRoutingDestination =
  | "existing_project"
  | "new_project"
  | "idea_only"
  | "no_action";

export type BackendExistingProjectImpact =
  | "task_context"
  | "new_task"
  | "project_context"
  | "decision"
  | "idea"
  | "mixed";

export interface BackendActiveNoteProposalPayload {
  title?: string;
  description?: string;
  content?: string;
  rationale?: string;
  name?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string | null;
}

export interface BackendActiveNoteSegment {
  ref: string;
  text: string;
  subject: string;
}

export interface BackendActiveNoteSegmentRoute {
  segmentRef: string;
  destination: BackendActiveNoteRoutingDestination;
  projectId?: string | null;
  relatedTaskId?: string | null;
  reason: string;
  confidence: number;
  impact?: {
    type: BackendExistingProjectImpact;
    reason: string;
  } | null;
}

export interface BackendActiveNoteProposal {
  ref: string;
  operationType: BackendActiveNoteOperationType;
  objectType: BackendActiveNoteObjectType;
  parent?: {
    projectId?: string | null;
    projectRef?: string | null;
  } | null;
  attachment?: {
    type: "project" | "task";
    id?: string | null;
    ref?: string | null;
  } | null;
  payload: BackendActiveNoteProposalPayload;
  explicitlyStated: boolean;
  confidence: number;
  evidence: string[];
  reason: string;
  segmentRef?: string | null;
  requiresProject?: boolean;
  suggestedProjectId?: string | null;
}

export interface BackendActiveNoteCandidateProject {
  id: string;
  title: string;
  relevanceReason?: string;
}

export interface BackendActiveNoteAnalyzeResponse {
  routing: {
    destination: BackendActiveNoteRoutingDestination;
    projectId?: string | null;
    relatedTaskId?: string | null;
    reason: string;
    confidence: number;
  };
  impact?: {
    type: BackendExistingProjectImpact;
    reason: string;
  } | null;
  summary: string;
  segments?: BackendActiveNoteSegment[];
  routes?: BackendActiveNoteSegmentRoute[];
  proposals: BackendActiveNoteProposal[];
  candidateProjects: BackendActiveNoteCandidateProject[];
  warnings: string[];
}

export interface AnalyzeActiveNoteInput {
  content: string;
  projectId?: string | null;
  /** Optional draft note used to keep UI state after analysis. */
  activeNote?: {
    id: string;
    content: string;
    projectId?: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}
