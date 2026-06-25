import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { ProjectNode } from "@/domain/spydr/utils/types";

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => spydrApi.projects.delete(projectId),
    onSuccess: (_data, projectId) => {
      queryClient.setQueryData<ProjectNode[]>(["spydr", "projects"], (current) =>
        current?.filter((project) => project.id !== projectId)
      );
      queryClient.removeQueries({ queryKey: ["spydr", "projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["spydr", "projects", "trash"] });
    },
  });
}
