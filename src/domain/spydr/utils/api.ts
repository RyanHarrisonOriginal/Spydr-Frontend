import { apiRequest } from "@/lib/apiClient";
import type {
  CreateProjectAreaInput,
  CreateProjectDecisionInput,
  CreateProjectIdeaInput,
  CreateProjectInput,
  CreateProjectNoteInput,
  CreateProjectTaskInput,
  DecisionNode,
  IdeaNode,
  NoteNode,
  ProjectChildKind,
  ProjectDetailNode,
  ProjectAreaNode,
  ProjectNode,
  ResourceNode,
  TaskNode,
  UpdateProjectAreaInput,
  UpdateProjectChildInput,
  UpdateProjectInput,
} from "./types";

function childPath(
  projectId: string,
  kind: ProjectChildKind,
  childId: string,
  action?: "restore"
) {
  const base = `/projects/${projectId}/${kind}s/${childId}`;
  return action === "restore" ? `${base}/restore` : base;
}

export const spydrApi = {
  projectAreas: {
    list: () => apiRequest<ProjectAreaNode[]>("/project-areas"),
    create: (input: CreateProjectAreaInput) =>
      apiRequest<ProjectAreaNode>("/project-areas", { method: "POST", body: input }),
    update: (areaId: string, input: UpdateProjectAreaInput) =>
      apiRequest<ProjectAreaNode>(`/project-areas/${areaId}`, {
        method: "PATCH",
        body: input,
      }),
    delete: (areaId: string) =>
      apiRequest<void>(`/project-areas/${areaId}`, { method: "DELETE" }),
  },
  projects: {
    list: () => apiRequest<ProjectNode[]>("/projects"),
    get: (projectId: string) =>
      apiRequest<ProjectDetailNode>(`/projects/${projectId}`),
    create: (input: CreateProjectInput) =>
      apiRequest<ProjectNode>("/projects", { method: "POST", body: input }),
    update: (projectId: string, input: UpdateProjectInput) =>
      apiRequest<ProjectDetailNode>(`/projects/${projectId}`, {
        method: "PATCH",
        body: input,
      }),
    createTask: (projectId: string, input: CreateProjectTaskInput) =>
      apiRequest<TaskNode>(`/projects/${projectId}/tasks`, {
        method: "POST",
        body: input,
      }),
    createNote: (projectId: string, input: CreateProjectNoteInput) =>
      apiRequest<NoteNode>(`/projects/${projectId}/notes`, {
        method: "POST",
        body: input,
      }),
    createDecision: (projectId: string, input: CreateProjectDecisionInput) =>
      apiRequest<DecisionNode>(`/projects/${projectId}/decisions`, {
        method: "POST",
        body: input,
      }),
    createIdea: (projectId: string, input: CreateProjectIdeaInput) =>
      apiRequest<IdeaNode>(`/projects/${projectId}/ideas`, {
        method: "POST",
        body: input,
      }),
    updateChild: (
      projectId: string,
      kind: ProjectChildKind,
      childId: string,
      input: UpdateProjectChildInput
    ) =>
      apiRequest<ProjectDetailNode>(childPath(projectId, kind, childId), {
        method: "PATCH",
        body: input,
      }),
    deleteChild: (
      projectId: string,
      kind: ProjectChildKind,
      childId: string
    ) =>
      apiRequest<ProjectDetailNode>(childPath(projectId, kind, childId), {
        method: "DELETE",
      }),
    restoreChild: (
      projectId: string,
      kind: ProjectChildKind,
      childId: string
    ) =>
      apiRequest<ProjectDetailNode>(
        childPath(projectId, kind, childId, "restore"),
        { method: "POST" }
      ),
  },
  tasks: {
    list: () => apiRequest<TaskNode[]>("/tasks"),
  },
  decisions: {
    list: () => apiRequest<DecisionNode[]>("/decisions"),
  },
  notes: {
    list: () => apiRequest<NoteNode[]>("/notes"),
  },
  resources: {
    list: () => apiRequest<ResourceNode[]>("/resources"),
  },
  ideas: {
    list: () => apiRequest<IdeaNode[]>("/ideas"),
  },
};
