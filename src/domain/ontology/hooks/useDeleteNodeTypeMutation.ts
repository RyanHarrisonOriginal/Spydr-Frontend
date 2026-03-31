import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ontologyApi } from "../utils/api";

export function useDeleteNodeTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ontologyApi.nodeTypes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["node-types"] });
    },
  });
}
