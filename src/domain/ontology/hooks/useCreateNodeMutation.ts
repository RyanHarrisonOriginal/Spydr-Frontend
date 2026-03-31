import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ontologyApi } from "../utils/api";

export function useCreateNodeMutation(ontologyId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      type: string;
      parentId?: string | null;
      title?: string;
      position?: { x: number; y: number };
    }) => ontologyApi.nodes.create(ontologyId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ontology", ontologyId] });
    },
  });
}
