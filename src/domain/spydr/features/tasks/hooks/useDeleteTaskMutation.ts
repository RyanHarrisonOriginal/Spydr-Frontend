import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { TaskNode } from "@/domain/spydr/utils/types";

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (taskId: string) => spydrApi.tasks.delete(taskId),
    onSuccess: (_data, taskId) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<TaskNode[]>(spydrOrgKey(activeOrgId, "tasks"), (current) =>
        current?.filter((task) => task.id !== taskId)
      );
      queryClient.removeQueries({
        queryKey: spydrOrgKey(activeOrgId, "tasks", taskId),
      });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "dashboard") });
    },
  });
}
