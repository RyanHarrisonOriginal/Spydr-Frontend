import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ontologyApi } from "../utils/api";
import type { Ontology } from "../utils/types";

export function useUpdateNodeMutation(ontologyId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      nodeId,
      data,
    }: {
      nodeId: string;
      data: Partial<{
        title: string;
        notes: string;
        type: string;
        position: { x: number; y: number };
        isExpanded: boolean;
        lifecycleState: string | null;
        fields: Record<string, string>;
      }>;
    }) => ontologyApi.nodes.update(ontologyId!, nodeId, data),
    onMutate: async ({ nodeId, data }) => {
      if (ontologyId == null) return;
      const hasOptimistic =
        data.isExpanded !== undefined ||
        data.type !== undefined ||
        data.fields !== undefined ||
        data.lifecycleState !== undefined;
      if (!hasOptimistic) return;
      await queryClient.cancelQueries({ queryKey: ["ontology", ontologyId] });
      const prev = queryClient.getQueryData<Ontology>(["ontology", ontologyId]);
      if (!prev?.nodes[nodeId]) return;
      const node = prev.nodes[nodeId];
      const nextNode = {
        ...node,
        ...(data.isExpanded !== undefined && { isExpanded: data.isExpanded }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.fields !== undefined && { fields: data.fields }),
        ...(data.lifecycleState !== undefined && {
          lifecycleState: data.lifecycleState,
        }),
      };
      queryClient.setQueryData<Ontology>(["ontology", ontologyId], {
        ...prev,
        nodes: { ...prev.nodes, [nodeId]: nextNode },
      });
      return { prev };
    },
    onSuccess: (updatedNode, variables) => {
      const keys = Object.keys(variables.data);
      const isPositionOnly =
        keys.length === 1 && "position" in variables.data;
      const isExpandedOnly =
        keys.length === 1 && "isExpanded" in variables.data;
      // Don't refetch: we already updated cache optimistically for position and isExpanded.
      if (isPositionOnly || isExpandedOnly) return;
      // Merge server response into cache so UI doesn't blink from invalidation/refetch.
      if (updatedNode && ontologyId) {
        queryClient.setQueryData<Ontology>(["ontology", ontologyId], (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            nodes: {
              ...prev.nodes,
              [variables.nodeId]: updatedNode,
            },
          };
        });
      }
    },
  });
}
