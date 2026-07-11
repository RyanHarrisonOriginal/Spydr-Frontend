export type SpydrNodeType =
  | "project"
  | "project_area"
  | "task"
  | "idea"
  | "note"
  | "decision"
  | "resource"
  | "inbox_item"
  | "person";

export type { TaskStatus } from "./taskStatus";
import type { TaskStatus } from "./taskStatus";

export type SpydrNodeStatus =
  | TaskStatus
  | "inactive"
  | "archived"
  | "snoozed";

export type SpydrPriority = "low" | "medium" | "high" | "critical";

export type OrganizationMemberRole = "owner" | "admin" | "member";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: OrganizationMemberRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationInput {
  name: string;
}

export interface SpydrNode<TType extends SpydrNodeType = SpydrNodeType, TDetails = unknown> {
  id: string;
  organizationId: string;
  userId: string;
  nodeType: TType;
  title: string;
  body: string;
  status: SpydrNodeStatus | string;
  priority: SpydrPriority | string;
  area: string | null;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  details: TDetails | null;
}

export interface ProjectDetails {
  outcome: string | null;
  startDate: string | null;
  targetDate: string | null;
  riskLevel: string;
  lastActivityAt: string | null;
  requesterPersonNodeId: string | null;
  assigneePersonNodeId: string | null;
  sponsorPersonNodeId: string | null;
  reviewerPersonNodeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonDetails {
  fullName: string;
  email: string | null;
  title: string | null;
  organization: string | null;
  relationshipContext: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PersonNode = SpydrNode<"person", PersonDetails>;

export interface ProjectPersonas {
  requester: PersonNode | null;
  assignee: PersonNode | null;
  sponsor: PersonNode | null;
  reviewer: PersonNode | null;
}

export interface ProjectAreaDetails {
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetails {
  dueDate: string | null;
  completedAt: string | null;
  isBlocked: boolean;
  estimatedMinutes: number | null;
  assigneePersonNodeId: string | null;
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

export type ProjectNode = SpydrNode<"project", ProjectDetails> & {
  personas?: ProjectPersonas;
};
export type ProjectAreaNode = SpydrNode<"project_area", ProjectAreaDetails>;
export interface TaskProjectRef {
  id: string;
  title: string;
}

export type TaskNode = SpydrNode<"task", TaskDetails> & {
  project?: TaskProjectRef | null;
  assignee?: PersonNode | null;
};
export type NoteNode = SpydrNode<"note", null> & {
  project?: TaskProjectRef | null;
};
export type DecisionNode = SpydrNode<"decision", DecisionDetails> & {
  project?: TaskProjectRef | null;
};
export type ResourceNode = SpydrNode<"resource", ResourceDetails>;

export interface CreateProjectInput {
  title: string;
  body?: string;
  status?: SpydrNodeStatus;
  priority?: SpydrPriority;
  area?: string | null;
  areaNodeId?: string | null;
  tags?: string[];
  outcome?: string | null;
  startDate?: string | null;
  targetDate?: string | null;
  riskLevel?: SpydrPriority;
}

export interface ProjectDetailNode extends ProjectNode {
  personas: ProjectPersonas;
  tasks: TaskNode[];
  decisions: DecisionNode[];
  ideas: IdeaNode[];
  notes: NoteNode[];
  resources: ResourceNode[];
  deleted: {
    tasks: TaskNode[];
    decisions: DecisionNode[];
    ideas: IdeaNode[];
    notes: NoteNode[];
    resources: ResourceNode[];
  };
}

export type ProjectChildKind = "task" | "note" | "decision" | "idea" | "resource";

export interface UpdateProjectChildInput {
  title?: string;
  body?: string;
  status?: string;
  priority?: SpydrPriority | string;
  dueDate?: string | null;
  rationale?: string;
  impact?: string;
  estimatedMinutes?: number | null;
  assigneePersonNodeId?: string | null;
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
  status?: SpydrNodeStatus;
  priority?: SpydrPriority;
  areaNodeId?: string | null;
  startDate?: string | null;
  targetDate?: string | null;
  riskLevel?: SpydrPriority;
  requesterPersonNodeId?: string | null;
  assigneePersonNodeId?: string | null;
  sponsorPersonNodeId?: string | null;
  reviewerPersonNodeId?: string | null;
}

export interface CreatePersonInput {
  fullName: string;
  body?: string;
  email?: string | null;
  title?: string | null;
  organization?: string | null;
  relationshipContext?: string | null;
}

export interface UpdatePersonInput {
  fullName?: string;
  body?: string;
  email?: string | null;
  title?: string | null;
  organization?: string | null;
  relationshipContext?: string | null;
}

export interface CreateProjectAreaInput {
  title: string;
  body?: string;
  color?: string;
}

export interface UpdateProjectAreaInput {
  color: string;
}

export interface CreateProjectTaskInput {
  title: string;
  body?: string;
  status?: TaskStatus;
  priority?: SpydrPriority;
  dueDate?: string | null;
  estimatedMinutes?: number | null;
  assigneePersonNodeId?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  body?: string;
  status?: TaskStatus;
  priority?: SpydrPriority;
  dueDate?: string | null;
  estimatedMinutes?: number | null;
  projectNodeId?: string | null;
  assigneePersonNodeId?: string | null;
}

export interface UpdateNoteInput {
  title?: string;
  body?: string;
}

export interface CreateProjectNoteInput {
  title?: string;
  body?: string;
  status?: SpydrNodeStatus;
  priority?: SpydrPriority;
}

export interface CreateProjectDecisionInput {
  title: string;
  body?: string;
  rationale?: string;
  impact?: string;
  status?: SpydrNodeStatus;
  priority?: SpydrPriority;
}

export interface CreateProjectIdeaInput {
  title: string;
  body?: string;
  confidence?: number | null;
  potentialValue?: SpydrPriority;
  status?: SpydrNodeStatus;
  priority?: SpydrPriority;
}
