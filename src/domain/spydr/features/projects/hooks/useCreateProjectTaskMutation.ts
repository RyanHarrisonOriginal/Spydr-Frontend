import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateProjectTaskInput } from "@/domain/spydr/utils/types";

export function useCreateProjectTaskMutation(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (input: CreateProjectTaskInput) =>
      spydrApi.projects.createTask(projectId!, input),
    onSuccess: () => {
      if (!activeOrgId) return;
      queryClient.invalidateQueries({
        queryKey: spydrOrgKey(activeOrgId, "projects", projectId!),
      });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "tasks") });
    },
  });
}
