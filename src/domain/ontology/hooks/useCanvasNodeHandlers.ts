import { useCallback } from "react";
import { nodeLayoutEvents } from "../utils/nodeLayoutEvents";
import {
  NODE_LAYOUT,
  getEffectiveNodeHeight,
  calculateVisibleSubtreeHeight,
} from "../utils/nodePositioning";
import type { OntologyNode } from "../utils/types";

export interface UseCanvasNodeHandlersArgs {
  nodes: Record<string, OntologyNode>;
  updateNodeMutate: (
    params: { nodeId: string; data: Partial<OntologyNode> },
    options?: { onSuccess?: () => void }
  ) => void;
  createNodeMutate: (
    payload: {
      type: string;
      parentId?: string | null;
      title?: string;
      position?: { x: number; y: number };
    },
    options?: { onSuccess?: () => void }
  ) => void;
  deleteNodeMutate: (nodeId: string, options?: { onSuccess?: () => void }) => void;
  moveNodeMutate: (
    params: { nodeId: string; newParentId: string | null },
    options?: { onSuccess?: () => void }
  ) => void;
}

/**
 * All node mutation handlers for the canvas: update, create, delete, move, save notes.
 * Emits layout events so the position observer runs. Keeps TSX free of mutation logic.
 */
export function useCanvasNodeHandlers({
  nodes,
  updateNodeMutate,
  createNodeMutate,
  deleteNodeMutate,
  moveNodeMutate,
}: UseCanvasNodeHandlersArgs) {
  const computeNewChildPosition = useCallback(
    (parentId: string | null): { x: number; y: number } | undefined => {
      if (parentId == null) return undefined;
      const parent = nodes[parentId];
      if (!parent) return undefined;
      const { NODE_GAP, HORIZONTAL_OFFSET } = NODE_LAYOUT;
      const parentHeight = getEffectiveNodeHeight(parent);
      const siblings = Object.values(nodes)
        .filter((n) => n.parentId === parentId)
        .sort((a, b) => a.createdAt - b.createdAt);
      let y = parent.position.y + parentHeight + NODE_GAP;
      siblings.forEach((s) => {
        y += calculateVisibleSubtreeHeight(s.id, nodes) + NODE_GAP;
      });
      return {
        x: parent.position.x + HORIZONTAL_OFFSET,
        y,
      };
    },
    [nodes]
  );

  const onUpdateNode = useCallback(
    (nodeId: string, updates: Partial<OntologyNode>) => {
      const parentId = nodes[nodeId]?.parentId ?? null;
      updateNodeMutate(
        { nodeId, data: updates },
        updates.computedHeight !== undefined
          ? {
              onSuccess: () =>
                nodeLayoutEvents.emitNodeHeightChanged(nodeId, parentId),
            }
          : undefined
      );
      if (updates.isExpanded !== undefined) {
        nodeLayoutEvents.emitNodeToggled(nodeId, parentId, updates.isExpanded);
        if (updates.isExpanded) {
          setTimeout(() => nodeLayoutEvents.emitScopeToSubtree(nodeId), 320);
        }
      }
    },
    [nodes, updateNodeMutate]
  );

  const onCreateNode = useCallback(
    (type: string, parentId: string | null, position?: { x: number; y: number }) => {
      const pos = position ?? computeNewChildPosition(parentId);
      createNodeMutate(
        { type, parentId, position: pos },
        {
          onSuccess: () => {
            setTimeout(() => nodeLayoutEvents.emitNodeAdded(parentId), 120);
            if (parentId != null) {
              setTimeout(() => nodeLayoutEvents.emitFitViewToSubtree(parentId), 320);
            }
          },
        }
      );
    },
    [createNodeMutate, computeNewChildPosition]
  );

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      const parentId = nodes[nodeId]?.parentId ?? null;
      deleteNodeMutate(nodeId, {
        onSuccess: () =>
          setTimeout(() => nodeLayoutEvents.emitNodeDeleted(parentId), 120),
      });
    },
    [nodes, deleteNodeMutate]
  );

  const onSaveNotes = useCallback(
    (nodeId: string, notes: string) => {
      updateNodeMutate({ nodeId, data: { notes } });
    },
    [updateNodeMutate]
  );

  const moveNodeWithLayout = useCallback(
    (nodeId: string, newParentId: string | null) => {
      const previousParentId = nodes[nodeId]?.parentId ?? null;
      moveNodeMutate(
        { nodeId, newParentId },
        {
          onSuccess: () =>
            setTimeout(
              () => nodeLayoutEvents.emitNodeMoved(newParentId, previousParentId),
              120
            ),
        }
      );
    },
    [nodes, moveNodeMutate]
  );

  return {
    onUpdateNode,
    onCreateNode,
    onDeleteNode,
    onSaveNotes,
    moveNodeWithLayout,
    computeNewChildPosition,
  };
}
