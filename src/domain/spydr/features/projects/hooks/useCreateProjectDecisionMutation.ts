import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateProjectDecisionInput } from "@/domain/spydr/utils/types";

export function useCreateProjectDecisionMutation(projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectDecisionInput) =>
      spydrApi.projects.createDecision(projectId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spydr", "projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["spydr", "decisions"] });
    },
  });
}
