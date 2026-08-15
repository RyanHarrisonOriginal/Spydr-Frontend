import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { TaskNode } from "@/domain/spydr/utils/types";

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: async (taskIdOrIds: string | string[]) => {
      const ids = Array.isArray(taskIdOrIds) ? taskIdOrIds : [taskIdOrIds];
      for (const taskId of ids) {
        await spydrApi.tasks.delete(taskId);
      }
      return ids;
    },
    onSuccess: (ids) => {
      if (!activeOrgId) return;
      const removed = new Set(ids);
      queryClient.setQueryData<TaskNode[]>(spydrOrgKey(activeOrgId, "tasks"), (current) =>
        current?.filter((task) => !removed.has(task.id))
      );
      for (const taskId of ids) {
        queryClient.removeQueries({
          queryKey: spydrOrgKey(activeOrgId, "tasks", taskId),
        });
      }
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "dashboard") });
    },
  });
}
