import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { ProjectNode } from "@/domain/spydr/utils/types";

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (projectId: string) => spydrApi.projects.delete(projectId),
    onSuccess: (_data, projectId) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<ProjectNode[]>(spydrOrgKey(activeOrgId, "projects"), (current) =>
        current?.filter((project) => project.id !== projectId)
      );
      queryClient.removeQueries({
        queryKey: spydrOrgKey(activeOrgId, "projects", projectId),
      });
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "projects", "trash"),
      });
    },
  });
}
