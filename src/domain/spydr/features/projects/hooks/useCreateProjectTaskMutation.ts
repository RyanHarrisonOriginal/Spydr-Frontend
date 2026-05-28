import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateProjectTaskInput } from "@/domain/spydr/utils/types";

export function useCreateProjectTaskMutation(projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectTaskInput) =>
      spydrApi.projects.createTask(projectId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spydr", "projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["spydr", "tasks"] });
    },
  });
}
