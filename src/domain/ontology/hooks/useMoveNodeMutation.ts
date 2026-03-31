import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ontologyApi } from "../utils/api";

export function useMoveNodeMutation(ontologyId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      nodeId,
      newParentId,
    }: {
      nodeId: string;
      newParentId: string | null;
    }) => ontologyApi.nodes.move(ontologyId!, nodeId, newParentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ontology", ontologyId] });
    },
  });
}
