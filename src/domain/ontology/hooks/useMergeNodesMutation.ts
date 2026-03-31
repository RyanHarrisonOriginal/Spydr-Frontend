import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ontologyApi } from "../utils/api";

export function useMergeNodesMutation(ontologyId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sourceId,
      targetId,
    }: { sourceId: string; targetId: string }) =>
      ontologyApi.nodes.merge(ontologyId!, sourceId, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ontology", ontologyId] });
    },
  });
}
