import { useQuery } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";

export function useProjectsQuery() {
  return useQuery({
    queryKey: ["spydr", "projects"],
    queryFn: spydrApi.projects.list,
  });
}

export function useProjectQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: ["spydr", "projects", projectId],
    queryFn: () => spydrApi.projects.get(projectId!),
    enabled: !!projectId,
  });
}

export function useTasksQuery() {
  return useQuery({
    queryKey: ["spydr", "tasks"],
    queryFn: spydrApi.tasks.list,
  });
}

export function useDecisionsQuery() {
  return useQuery({
    queryKey: ["spydr", "decisions"],
    queryFn: spydrApi.decisions.list,
  });
}

export function useNotesQuery() {
  return useQuery({
    queryKey: ["spydr", "notes"],
    queryFn: spydrApi.notes.list,
  });
}

export function useResourcesQuery() {
  return useQuery({
    queryKey: ["spydr", "resources"],
    queryFn: spydrApi.resources.list,
  });
}

export function useIdeasQuery() {
  return useQuery({
    queryKey: ["spydr", "ideas"],
    queryFn: spydrApi.ideas.list,
  });
}
