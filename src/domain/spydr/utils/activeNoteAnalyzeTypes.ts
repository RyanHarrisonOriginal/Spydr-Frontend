/** Backend analyze contract (POST /active-notes/analyze). */

export type BackendSegmentIntent =
  | "progress_update"
  | "task_action"
  | "decision"
  | "idea"
  | "project_context"
  | "mixed";

export type BackendPlannedActionType =
  | "create_task"
  | "create_note"
  | "attach_note_to_task"
  | "create_decision"
  | "create_idea"
  | "use_existing_task";

export type BackendProjectAssignmentDestination =
  | "new_project_candidate"
  | "unassigned";

export interface BackendActiveNoteSegment {
  topic: string;
  sourceText: string;
  contextualText: string;
}

export interface BackendExistingProjectActionPlan {
  originalText: string;
  contextualText?: string;
  topic?: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  intent: BackendSegmentIntent;
  action:
    | {
        type: "create_task";
        confidence: number;
        reason: string;
        payload: {
          title: string;
          description?: string | null;
        };
      }
    | {
        type: "create_note";
        confidence: number;
        reason: string;
        payload: {
          subject: string;
          content: string;
        };
      }
    | {
        type: "attach_note_to_task";
        confidence: number;
        reason: string;
        targetTaskId: string;
        targetTaskTitle: string;
        payload: {
          subject: string;
          content: string;
        };
      }
    | {
        type: "create_decision";
        confidence: number;
        reason: string;
        payload: {
          title: string;
          rationale?: string | null;
        };
      }
    | {
        type: "create_idea";
        confidence: number;
        reason: string;
        payload: {
          title: string;
          description?: string | null;
        };
      }
    | {
        type: "use_existing_task";
        confidence: number;
        reason: string;
        targetTaskId: string;
        targetTaskTitle: string;
      };
}

export interface BackendNewProjectCandidateActionPlan {
  destination: "new_project_candidate";
  originalText: string;
  contextualText?: string;
  topic?: string;
  projectId: null;
  projectName: string;
  confidence: number;
  reason: string;
}

export interface BackendUnassignedActionPlan {
  destination: "unassigned";
  originalText: string;
  contextualText?: string;
  topic?: string;
  projectId: null;
  projectName: null;
  confidence: number;
  reason: string;
}

export type BackendSegmentActionPlan =
  | BackendExistingProjectActionPlan
  | BackendNewProjectCandidateActionPlan
  | BackendUnassignedActionPlan;

export interface BackendActiveNoteAnalyzeResponse {
  sessionId?: string | null;
  segments: BackendActiveNoteSegment[];
  actionPlans: BackendSegmentActionPlan[];
}

export type BackendActiveNotePipelineStep =
  | "segment"
  | "project_context"
  | "project_assignment"
  | "action_plan";

export interface BackendActiveNoteAnalyzeAccepted {
  sessionId: string;
  status: "analyzing";
}

export interface BackendActiveNoteAnalysisSnapshot {
  sessionId: string;
  status: "analyzing" | "review" | "applying" | "completed" | "failed";
  content: string;
  projectId: string | null;
  completedSteps: BackendActiveNotePipelineStep[];
  segments?: BackendActiveNoteSegment[];
  actionPlans?: BackendSegmentActionPlan[];
  reviewSnapshot?: BackendActiveNoteReviewSnapshot | null;
  errorMessage?: string | null;
  failedStep?: string | null;
}

export interface BackendActiveNoteReviewSnapshot {
  operations: Array<{
    operationId: string;
    title: string;
    objectType: string | null;
    selected: boolean;
    outcome: "accepted" | "rejected" | "failed";
  }>;
  applied: Array<{
    id: string;
    type: string;
    title: string;
    action: "created" | "updated" | "linked";
    href: string;
    operationId?: string;
  }>;
  failed: Array<{
    operationId: string;
    message: string;
  }>;
  appliedAt: string;
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
  onProgress?: (completedSteps: BackendActiveNotePipelineStep[]) => void;
  signal?: AbortSignal;
}
