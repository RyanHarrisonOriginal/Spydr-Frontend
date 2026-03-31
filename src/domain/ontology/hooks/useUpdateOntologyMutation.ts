import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ontologyApi } from "../utils/api";

export function useUpdateOntologyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; description?: string };
    }) => ontologyApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["ontologies"] });
      queryClient.invalidateQueries({ queryKey: ["ontology", id] });
    },
  });
}
