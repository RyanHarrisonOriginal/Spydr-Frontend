import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ontologyApi } from "../utils/api";

export function useCreateOntologyMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      ontologyApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ontologies"] });
      navigate(`/ontology/${data.id}`);
    },
  });
}
