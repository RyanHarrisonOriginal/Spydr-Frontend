import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateProjectDecisionInput } from "@/domain/spydr/utils/types";

export function useCreateProjectDecisionMutation(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (input: CreateProjectDecisionInput) =>
      spydrApi.projects.createDecision(projectId!, input),
    onSuccess: () => {
      if (!activeOrgId) return;
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "projects", projectId!),
      });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "decisions") });
    },
  });
}
