import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type {
  CreateProjectDecisionInput,
  CreateProjectIdeaInput,
  CreateProjectNoteInput,
  ProjectChildKind,
  UpdateProjectChildInput,
} from "@/domain/spydr/utils/types";

export function useCreateLogNoteMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: CreateProjectNoteInput;
    }) => spydrApi.projects.createNote(projectId, input),
    onSuccess: (_data, { projectId }) => {
      if (!activeOrgId) return;
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "projects", projectId),
      });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "notes") });
    },
  });
}

export function useCreateLogIdeaMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: CreateProjectIdeaInput;
    }) => spydrApi.projects.createIdea(projectId, input),
    onSuccess: (_data, { projectId }) => {
      if (!activeOrgId) return;
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "projects", projectId),
      });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "ideas") });
    },
  });
}

export function useCreateLogDecisionMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: CreateProjectDecisionInput;
    }) => spydrApi.projects.createDecision(projectId, input),
    onSuccess: (_data, { projectId }) => {
      if (!activeOrgId) return;
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "projects", projectId),
      });
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "decisions"),
      });
    },
  });
}

export function useUpdateLogChildMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({
      projectId,
      kind,
      childId,
      input,
    }: {
      projectId: string;
      kind: ProjectChildKind;
      childId: string;
      input: UpdateProjectChildInput;
    }) => spydrApi.projects.updateChild(projectId, kind, childId, input),
    onSuccess: (_data, { projectId, kind }) => {
      if (!activeOrgId) return;
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "projects", projectId),
      });
      const segment =
        kind === "note"
          ? "notes"
          : kind === "idea"
            ? "ideas"
            : kind === "decision"
              ? "decisions"
              : null;
      if (segment) {
        queryClient.invalidateQueries({
          queryKey: spydrOrgKey(activeOrgId, segment),
        });
      }
    },
  });
}
