import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { IdeaNode } from "@/domain/spydr/utils/types";

export function useDeleteIdeaMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (ideaId: string) => spydrApi.ideas.delete(ideaId),
    onSuccess: (_data, ideaId) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<IdeaNode[]>(spydrOrgKey(activeOrgId, "ideas"), (current) =>
        current?.filter((idea) => idea.id !== ideaId)
      );
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "dashboard") });
    },
  });
}
