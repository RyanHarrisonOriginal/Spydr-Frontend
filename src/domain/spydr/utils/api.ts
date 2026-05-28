import { apiRequest } from "@/lib/apiClient";
import type {
  CreateProjectInput,
  CreateProjectTaskInput,
  DecisionNode,
  NoteNode,
  ProjectDetailNode,
  ProjectNode,
  ResourceNode,
  TaskNode,
  UpdateProjectInput,
} from "./types";

export const spydrApi = {
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
};
