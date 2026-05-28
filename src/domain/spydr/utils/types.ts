export type SpydrNodeType =
  | "project"
  | "task"
  | "idea"
  | "note"
  | "decision"
  | "resource"
  | "inbox_item"
  | "person";

export type SpydrNodeStatus =
  | "active"
  | "inactive"
  | "completed"
  | "archived"
  | "blocked"
  | "waiting"
  | "snoozed";

export type SpydrPriority = "low" | "medium" | "high" | "critical";

export interface SpydrNode<TType extends SpydrNodeType = SpydrNodeType, TDetails = unknown> {
  id: string;
  userId: string;
  nodeType: TType;
  title: string;
  body: string;
  status: SpydrNodeStatus | string;
  priority: SpydrPriority | string;
  area: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  details: TDetails | null;
}

export interface ProjectDetails {
  outcome: string | null;
  startDate: string | null;
  targetDate: string | null;
  riskLevel: string;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetails {
  dueDate: string | null;
  completedAt: string | null;
  isBlocked: boolean;
  estimatedMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DecisionDetails {
  rationale: string;
  impact: string;
  decidedAt: string;
  supersedesDecisionNodeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceDetails {
  resourceType: string | null;
  url: string | null;
  fileRef: string | null;
  externalSource: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectNode = SpydrNode<"project", ProjectDetails>;
export type TaskNode = SpydrNode<"task", TaskDetails>;
export type NoteNode = SpydrNode<"note", null>;
export type DecisionNode = SpydrNode<"decision", DecisionDetails>;
export type ResourceNode = SpydrNode<"resource", ResourceDetails>;

export interface CreateProjectInput {
  title: string;
  body?: string;
  status?: SpydrNodeStatus;
  priority?: SpydrPriority;
  area?: string | null;
  tags?: string[];
  outcome?: string | null;
  startDate?: string | null;
  targetDate?: string | null;
  riskLevel?: SpydrPriority;
}

export interface ProjectDetailNode extends ProjectNode {
  tasks: TaskNode[];
  decisions: DecisionNode[];
  ideas: IdeaNode[];
  notes: NoteNode[];
  resources: ResourceNode[];
}

export type IdeaDetails = {
  confidence: number | null;
  potentialValue: string;
  promotedToProjectNodeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IdeaNode = SpydrNode<"idea", IdeaDetails>;

export interface UpdateProjectInput {
  body?: string;
  startDate?: string | null;
  targetDate?: string | null;
  riskLevel?: SpydrPriority;
}

export interface CreateProjectTaskInput {
  title: string;
  body?: string;
  status?: SpydrNodeStatus;
  priority?: SpydrPriority;
  dueDate?: string | null;
  estimatedMinutes?: number | null;
}
