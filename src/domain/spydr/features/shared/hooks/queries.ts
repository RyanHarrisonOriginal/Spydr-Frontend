import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { apiRequestAuthed } from "@/lib/apiClient";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { IdeaNode } from "@/domain/spydr/utils/types";

function useSpydrQueryEnabled() {
  const { isLoaded, isSignedIn } = useAuth();
  return isLoaded && isSignedIn;
}

export function useProjectsQuery() {
  const enabled = useSpydrQueryEnabled();
  return useQuery({
    queryKey: ["spydr", "projects"],
    queryFn: spydrApi.projects.list,
    enabled,
    refetchOnMount: "always",
  });
}

export function useProjectQuery(projectId: string | undefined) {
  const enabled = useSpydrQueryEnabled();
  return useQuery({
    queryKey: ["spydr", "projects", projectId],
    queryFn: () => spydrApi.projects.get(projectId!),
    enabled: enabled && !!projectId,
    refetchOnMount: "always",
  });
}

export function useTasksQuery() {
  const enabled = useSpydrQueryEnabled();
  return useQuery({
    queryKey: ["spydr", "tasks"],
    queryFn: spydrApi.tasks.list,
    enabled,
    refetchOnMount: "always",
  });
}

export function useDecisionsQuery() {
  const enabled = useSpydrQueryEnabled();
  return useQuery({
    queryKey: ["spydr", "decisions"],
    queryFn: spydrApi.decisions.list,
    enabled,
    refetchOnMount: "always",
  });
}

export function useNotesQuery() {
  const enabled = useSpydrQueryEnabled();
  return useQuery({
    queryKey: ["spydr", "notes"],
    queryFn: spydrApi.notes.list,
    enabled,
    refetchOnMount: "always",
  });
}

export function useResourcesQuery() {
  const enabled = useSpydrQueryEnabled();
  return useQuery({
    queryKey: ["spydr", "resources"],
    queryFn: spydrApi.resources.list,
    enabled,
    refetchOnMount: "always",
  });
}

export function useProjectAreasQuery() {
  const enabled = useSpydrQueryEnabled();
  return useQuery({
    queryKey: ["spydr", "project-areas"],
    queryFn: spydrApi.projectAreas.list,
    enabled,
    refetchOnMount: "always",
  });
}

export function useIdeasQuery() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const enabled = isLoaded && isSignedIn;
  return useQuery({
    queryKey: ["spydr", "ideas"],
    queryFn: () => apiRequestAuthed<IdeaNode[]>(getToken, "/ideas"),
    enabled,
    refetchOnMount: "always",
    staleTime: 0,
    retry: (failureCount, error) =>
      failureCount < 2 &&
      error instanceof Error &&
      error.message === "Unauthorized",
  });
}
