import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { ProjectNode } from "@/domain/spydr/utils/types";

export function useRestoreProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => spydrApi.projects.restore(projectId),
    onSuccess: (project) => {
      queryClient.setQueryData<ProjectNode[]>(["spydr", "projects"], (current) => {
        const next = current ? [project, ...current] : [project];
        return next.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      queryClient.setQueryData<ProjectNode[]>(["spydr", "projects", "trash"], (current) =>
        current?.filter((item) => item.id !== project.id)
      );
      queryClient.setQueryData(["spydr", "projects", project.id], project);
    },
  });
}
