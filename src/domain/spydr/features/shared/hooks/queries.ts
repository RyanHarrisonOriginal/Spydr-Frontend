import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { apiRequestAuthed } from "@/lib/apiClient";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { IdeaNode } from "@/domain/spydr/utils/types";
import { spydrOrgKey } from "./spydrQueryKeys";

function useSpydrQueryEnabled() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isReady } = useOrganizationContext();
  return isLoaded && isSignedIn && isReady;
}

export function usePeopleQuery() {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "people"),
    queryFn: spydrApi.people.list,
    enabled: enabled && !!activeOrgId,
    refetchOnMount: "always",
  });
}

export function usePersonQuery(personId: string | undefined) {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "people", personId ?? ""),
    queryFn: () => spydrApi.people.get(personId!),
    enabled: enabled && !!activeOrgId && !!personId,
    refetchOnMount: "always",
  });
}

export function useProjectsQuery() {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "projects"),
    queryFn: spydrApi.projects.list,
    enabled: enabled && !!activeOrgId,
    refetchOnMount: "always",
  });
}

export function useDeletedProjectsQuery() {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "projects", "trash"),
    queryFn: spydrApi.projects.listTrash,
    enabled: enabled && !!activeOrgId,
    refetchOnMount: "always",
  });
}

export function useProjectQuery(projectId: string | undefined) {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "projects", projectId ?? ""),
    queryFn: () => spydrApi.projects.get(projectId!),
    enabled: enabled && !!activeOrgId && !!projectId,
    refetchOnMount: "always",
  });
}

export function useTasksQuery() {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "tasks"),
    queryFn: spydrApi.tasks.list,
    enabled: enabled && !!activeOrgId,
    refetchOnMount: "always",
  });
}

export function useWorkspaceDashboardQuery() {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "dashboard"),
    queryFn: spydrApi.dashboard.getWorkspace,
    enabled: enabled && !!activeOrgId,
    refetchOnMount: "always",
  });
}

export function useTaskQuery(taskId: string | undefined) {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "tasks", taskId ?? ""),
    queryFn: () => spydrApi.tasks.get(taskId!),
    enabled: enabled && !!activeOrgId && !!taskId,
    refetchOnMount: "always",
  });
}

export function useDecisionsQuery() {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "decisions"),
    queryFn: spydrApi.decisions.list,
    enabled: enabled && !!activeOrgId,
    refetchOnMount: "always",
  });
}

export function useNotesQuery() {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "notes"),
    queryFn: spydrApi.notes.list,
    enabled: enabled && !!activeOrgId,
    refetchOnMount: "always",
  });
}

export function useNoteQuery(noteId: string | undefined) {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "notes", noteId ?? ""),
    queryFn: () => spydrApi.notes.get(noteId!),
    enabled: enabled && !!activeOrgId && !!noteId,
    refetchOnMount: "always",
  });
}

export function useResourcesQuery() {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "resources"),
    queryFn: spydrApi.resources.list,
    enabled: enabled && !!activeOrgId,
    refetchOnMount: "always",
  });
}

export function useProjectAreasQuery() {
  const enabled = useSpydrQueryEnabled();
  const { activeOrgId } = useOrganizationContext();
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "project-areas"),
    queryFn: spydrApi.projectAreas.list,
    enabled: enabled && !!activeOrgId,
    refetchOnMount: "always",
  });
}

export function useIdeasQuery() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { isReady, activeOrgId } = useOrganizationContext();
  const enabled = isLoaded && isSignedIn && isReady && !!activeOrgId;
  return useQuery({
    queryKey: spydrOrgKey(activeOrgId!, "ideas"),
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
