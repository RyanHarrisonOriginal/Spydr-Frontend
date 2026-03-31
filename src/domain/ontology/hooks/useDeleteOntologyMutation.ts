import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ontologyApi } from "../utils/api";

export function useDeleteOntologyMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (id: string) => ontologyApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["ontologies"] });
      queryClient.removeQueries({ queryKey: ["ontology", id] });
      navigate("/");
    },
  });
}
