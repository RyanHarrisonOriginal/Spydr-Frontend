import { useQuery } from "@tanstack/react-query";
import { ontologyApi } from "../utils/api";
import type { Ontology, NodeType } from "../utils/types";

export function useOntologiesQuery() {
  return useQuery({
    queryKey: ["ontologies"],
    queryFn: () => ontologyApi.list(),
  });
}

export function useOntologyQuery(ontologyId: string | undefined) {
  return useQuery<Ontology>({
    queryKey: ["ontology", ontologyId],
    queryFn: () => ontologyApi.get(ontologyId!),
    enabled: !!ontologyId,
  });
}

export function useNodeTypesQuery() {
  return useQuery<NodeType[]>({
    queryKey: ["node-types"],
    queryFn: () => ontologyApi.nodeTypes.list(),
  });
}
