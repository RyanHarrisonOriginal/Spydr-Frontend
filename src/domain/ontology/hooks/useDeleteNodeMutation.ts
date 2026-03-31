import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ontologyApi } from "../utils/api";

export function useDeleteNodeMutation(ontologyId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nodeId: string) =>
      ontologyApi.nodes.delete(ontologyId!, nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ontology", ontologyId] });
    },
  });
}
