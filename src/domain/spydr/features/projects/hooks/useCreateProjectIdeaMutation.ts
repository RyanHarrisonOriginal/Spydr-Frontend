import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateProjectIdeaInput } from "@/domain/spydr/utils/types";

export function useCreateProjectIdeaMutation(projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectIdeaInput) =>
      spydrApi.projects.createIdea(projectId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spydr", "projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["spydr", "ideas"] });
    },
  });
}
