import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { UpdateProjectInput } from "@/domain/spydr/utils/types";

export function useUpdateProjectMutation(projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProjectInput) =>
      spydrApi.projects.update(projectId!, input),
    onSuccess: (project) => {
      queryClient.setQueryData(["spydr", "projects", project.id], project);
      queryClient.invalidateQueries({ queryKey: ["spydr", "projects"] });
    },
  });
}
