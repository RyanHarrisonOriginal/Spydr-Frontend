import { useCallback } from "react";
import { getSiblings } from "../utils/treeUtils";
import type { OntologyNode } from "../utils/types";

export interface UseCanvasActionsArgs {
  nodes: Record<string, OntologyNode>;
  onUpdateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  onMoveNode: (nodeId: string, newParentId: string | null) => void;
}

/**
 * Move up/down/indent implemented via sibling order (position swap) or move parent.
 * Keeps all reorder logic in one place. Position updates go through onUpdateNodePosition (batched).
 */
export function useCanvasActions({
  nodes,
  onUpdateNodePosition,
  onMoveNode,
}: UseCanvasActionsArgs) {
  const onMoveNodeUp = useCallback(
    (nodeId: string) => {
      const siblings = getSiblings(nodes, nodeId);
      const idx = siblings.findIndex((s) => s.id === nodeId);
      if (idx <= 0) return;
      const prev = siblings[idx - 1];
      onUpdateNodePosition(nodeId, prev.position);
      onUpdateNodePosition(prev.id, nodes[nodeId].position);
    },
    [nodes, onUpdateNodePosition]
  );

  const onMoveNodeDown = useCallback(
    (nodeId: string) => {
      const siblings = getSiblings(nodes, nodeId);
      const idx = siblings.findIndex((s) => s.id === nodeId);
      if (idx < 0 || idx >= siblings.length - 1) return;
      const next = siblings[idx + 1];
      onUpdateNodePosition(nodeId, next.position);
      onUpdateNodePosition(next.id, nodes[nodeId].position);
    },
    [nodes, onUpdateNodePosition]
  );

  const onIndent = useCallback(
    (nodeId: string) => {
      const siblings = getSiblings(nodes, nodeId);
      const idx = siblings.findIndex((s) => s.id === nodeId);
      if (idx <= 0) return;
      const siblingAbove = siblings[idx - 1];
      onMoveNode(nodeId, siblingAbove.id);
    },
    [nodes, onMoveNode]
  );

  return { onMoveNodeUp, onMoveNodeDown, onIndent };
}
