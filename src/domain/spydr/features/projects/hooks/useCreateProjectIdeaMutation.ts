import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateProjectIdeaInput } from "@/domain/spydr/utils/types";

export function useCreateProjectIdeaMutation(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (input: CreateProjectIdeaInput) =>
      spydrApi.projects.createIdea(projectId!, input),
    onSuccess: () => {
      if (!activeOrgId) return;
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "projects", projectId!),
      });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "ideas") });
    },
  });
}
