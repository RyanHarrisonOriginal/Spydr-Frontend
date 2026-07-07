import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { DecisionNode } from "@/domain/spydr/utils/types";

export function useDeleteDecisionMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (decisionId: string) => spydrApi.decisions.delete(decisionId),
    onSuccess: (_data, decisionId) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<DecisionNode[]>(
        spydrOrgKey(activeOrgId, "decisions"),
        (current) => current?.filter((decision) => decision.id !== decisionId)
      );
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "dashboard") });
    },
  });
}
