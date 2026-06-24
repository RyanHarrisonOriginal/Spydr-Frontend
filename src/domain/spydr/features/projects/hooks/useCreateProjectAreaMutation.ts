import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateProjectAreaInput } from "@/domain/spydr/utils/types";

export function useCreateProjectAreaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectAreaInput) => spydrApi.projectAreas.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spydr", "project-areas"] });
    },
  });
}
