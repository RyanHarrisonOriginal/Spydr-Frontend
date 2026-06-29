import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { TaskNode, UpdateTaskInput } from "@/domain/spydr/utils/types";

export function useUpdateTaskMutation(taskId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId: id,
      input,
    }: {
      taskId: string;
      input: UpdateTaskInput;
    }) => spydrApi.tasks.update(id, input),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<TaskNode>(["spydr", "tasks", updatedTask.id], updatedTask);
      queryClient.setQueryData<TaskNode[]>(["spydr", "tasks"], (current) => {
        if (!current) return current;
        return current.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        );
      });
      if (taskId && taskId !== updatedTask.id) {
        queryClient.invalidateQueries({ queryKey: ["spydr", "tasks", taskId] });
      }
      queryClient.invalidateQueries({ queryKey: ["spydr", "projects"] });
    },
  });
}
