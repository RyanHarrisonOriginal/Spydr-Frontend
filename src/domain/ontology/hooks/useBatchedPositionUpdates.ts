import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Ontology } from "../utils/types";

export interface UseBatchedPositionUpdatesArgs {
  ontologyId: string | undefined;
  updateNodeMutate: (params: {
    nodeId: string;
    data: { position: { x: number; y: number } };
  }) => void;
}

/**
 * Batches position updates and flushes once per frame: one setQueryData + N mutations,
 * no per-update invalidation. Use for layout observer and move up/down.
 */
export function useBatchedPositionUpdates({
  ontologyId,
  updateNodeMutate,
}: UseBatchedPositionUpdatesArgs) {
  const queryClient = useQueryClient();
  const pendingRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const flushScheduledRef = useRef(false);

  const onUpdateNodePosition = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      pendingRef.current.set(nodeId, position);
      if (flushScheduledRef.current) return;
      flushScheduledRef.current = true;
      requestAnimationFrame(() => {
        flushScheduledRef.current = false;
        const updates = new Map(pendingRef.current);
        pendingRef.current.clear();
        if (updates.size === 0 || !ontologyId) return;
        queryClient.setQueryData<Ontology>(["ontology", ontologyId], (prev) => {
          if (!prev) return prev;
          const nextNodes = { ...prev.nodes };
          updates.forEach((pos, id) => {
            if (nextNodes[id])
              nextNodes[id] = { ...nextNodes[id], position: pos };
          });
          return { ...prev, nodes: nextNodes };
        });
        updates.forEach((position, id) => {
          updateNodeMutate({ nodeId: id, data: { position } });
        });
      });
    },
    [ontologyId, queryClient, updateNodeMutate]
  );

  return { onUpdateNodePosition };
}
