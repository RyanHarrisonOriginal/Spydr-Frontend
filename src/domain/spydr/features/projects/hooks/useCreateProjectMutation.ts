import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateProjectInput } from "@/domain/spydr/utils/types";

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => spydrApi.projects.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spydr", "projects"] });
    },
  });
}
