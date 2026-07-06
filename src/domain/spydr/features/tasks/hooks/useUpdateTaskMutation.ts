import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { TaskNode, UpdateTaskInput } from "@/domain/spydr/utils/types";

export function useUpdateTaskMutation(taskId?: string) {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({
      taskId: id,
      input,
    }: {
      taskId: string;
      input: UpdateTaskInput;
    }) => spydrApi.tasks.update(id, input),
    onSuccess: (updatedTask) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<TaskNode>(
        spydrOrgKey(activeOrgId, "tasks", updatedTask.id),
        updatedTask
      );
      queryClient.setQueryData<TaskNode[]>(spydrOrgKey(activeOrgId, "tasks"), (current) => {
        if (!current) return current;
        return current.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        );
      });
      if (taskId && taskId !== updatedTask.id) {
        queryClient.invalidateQueries({
          queryKey: spydrOrgKey(activeOrgId, "tasks", taskId),
        });
      }
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
    },
  });
}
