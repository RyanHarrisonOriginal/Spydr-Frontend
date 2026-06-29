import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateProjectTaskInput, ProjectNode, TaskNode } from "@/domain/spydr/utils/types";

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: CreateProjectTaskInput;
    }) => spydrApi.projects.createTask(projectId, input),
    onSuccess: (task, variables) => {
      const projects = queryClient.getQueryData<ProjectNode[]>(["spydr", "projects"]);
      const project = projects?.find((item) => item.id === variables.projectId);

      queryClient.setQueryData<TaskNode[]>(["spydr", "tasks"], (current) => [
        {
          ...task,
          project: project ? { id: project.id, title: project.title } : null,
        },
        ...(current ?? []),
      ]);
      queryClient.invalidateQueries({ queryKey: ["spydr", "projects", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["spydr", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["spydr", "tasks"] });
    },
  });
}
