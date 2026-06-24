import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { UpdateProjectAreaInput } from "@/domain/spydr/utils/types";

export function useUpdateProjectAreaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      areaId,
      input,
    }: {
      areaId: string;
      input: UpdateProjectAreaInput;
    }) => spydrApi.projectAreas.update(areaId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spydr", "project-areas"] });
    },
  });
}
