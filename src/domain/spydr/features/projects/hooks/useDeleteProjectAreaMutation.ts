import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";

export function useDeleteProjectAreaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (areaId: string) => spydrApi.projectAreas.delete(areaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spydr", "project-areas"] });
      queryClient.invalidateQueries({ queryKey: ["spydr", "projects"] });
    },
  });
}
