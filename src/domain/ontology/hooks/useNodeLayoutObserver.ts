import { useEffect, useRef } from "react";
import { useOntologyFlowContext } from "../context/OntologyFlowContext";
import {
  NODE_LAYOUT,
  getEffectiveNodeHeight,
  calculateVisibleSubtreeHeight,
} from "../utils/nodePositioning";
import { nodeLayoutEvents, type NodeLayoutEvent } from "../utils/nodeLayoutEvents";
import type { OntologyNode } from "../utils/types";

/**
 * Subscribes to node layout events and repositions sibling subtrees when nodes
 * are added, deleted, moved, or toggled so the tree layout stays consistent.
 * Uses dynamic node heights (computedHeight or getNodeHeight from title length).
 *
 * Physics (aligned with mock-up): when a sibling's position changes, we always
 * recurse into its children so the whole subtree moves. On expand we position
 * the toggled node's children first, then recalc from parent.
 */
export function useNodeLayoutObserver() {
  const { nodes, onUpdateNodePosition } = useOntologyFlowContext();
  const nodesRef = useRef(nodes);
  const onUpdateRef = useRef(onUpdateNodePosition);
  const toggleOverrideRef = useRef<{ nodeId: string; isExpanded: boolean } | null>(null);
  nodesRef.current = nodes;
  onUpdateRef.current = onUpdateNodePosition;

  useEffect(() => {
    const getNodes = (): Record<string, OntologyNode> => {
      const current = nodesRef.current;
      const o = toggleOverrideRef.current;
      if (o && current[o.nodeId]) {
        return { ...current, [o.nodeId]: { ...current[o.nodeId], isExpanded: o.isExpanded } };
      }
      return current;
    };
    const updatePosition = (nodeId: string, position: { x: number; y: number }) => {
      onUpdateRef.current(nodeId, position);
    };

    const { NODE_GAP, HORIZONTAL_OFFSET } = NODE_LAYOUT;

    /**
     * Recursively position all visible children of a node. Uses positionOverride
     * when the node was just moved this pass (batch not flushed yet) so children
     * are laid out relative to the new parent position.
     */
    const recalculateChildPositionsRecursively = (
      nodeId: string,
      positionOverride?: { x: number; y: number }
    ) => {
      const currentNodes = getNodes();
      const node = currentNodes[nodeId];
      if (!node?.isExpanded) return;
      const nodePosition = positionOverride ?? node.position;
      const nodeHeight = getEffectiveNodeHeight(node);
      const children = Object.values(currentNodes)
        .filter((n): n is OntologyNode => n.parentId === nodeId)
        .sort((a, b) => a.createdAt - b.createdAt);
      let currentY = nodePosition.y + nodeHeight + NODE_GAP;
      children.forEach((child) => {
        const expected = {
          x: nodePosition.x + HORIZONTAL_OFFSET,
          y: currentY,
        };
        const childMoved =
          child.position.x !== expected.x || child.position.y !== expected.y;
        if (childMoved) {
          updatePosition(child.id, expected);
        }
        if (child.isExpanded) {
          recalculateChildPositionsRecursively(
            child.id,
            childMoved ? expected : undefined
          );
        }
        currentY +=
          calculateVisibleSubtreeHeight(child.id, currentNodes) + NODE_GAP;
      });
    };

    const recalculateSiblingPositionsWithVisibility = (parentId: string) => {
      const currentNodes = getNodes();
      const parentNode = currentNodes[parentId];
      if (!parentNode) return;
      const parentHeight = getEffectiveNodeHeight(parentNode);
      const siblings = Object.values(currentNodes)
        .filter((n): n is OntologyNode => n.parentId === parentId)
        .sort((a, b) => a.createdAt - b.createdAt);
      let currentY = parentNode.position.y + parentHeight + NODE_GAP;
      siblings.forEach((sibling) => {
        const expected = {
          x: parentNode.position.x + HORIZONTAL_OFFSET,
          y: currentY,
        };
        const siblingMoved =
          sibling.position.x !== expected.x ||
          sibling.position.y !== expected.y;
        if (siblingMoved) {
          updatePosition(sibling.id, expected);
        }
        // Always recurse into expanded siblings so their children (and nested descendants) move with them.
        // Pass expected when we just moved this sibling so children use the new position (batch not flushed yet).
        if (sibling.isExpanded) {
          recalculateChildPositionsRecursively(
            sibling.id,
            siblingMoved ? expected : undefined
          );
        }
        currentY +=
          calculateVisibleSubtreeHeight(sibling.id, currentNodes) + NODE_GAP;
      });
    };

    const propagateRecalculationUpward = (nodeId: string) => {
      const currentNodes = getNodes();
      const node = currentNodes[nodeId];
      if (!node?.parentId) return;
      recalculateSiblingPositionsWithVisibility(node.parentId);
      propagateRecalculationUpward(node.parentId);
    };

    const recalculateRootPositions = () => {
      const currentNodes = getNodes();
      const rootNodes = Object.values(currentNodes)
        .filter((n): n is OntologyNode => n.parentId === null)
        .sort((a, b) => a.createdAt - b.createdAt);
      let currentY = 100;
      rootNodes.forEach((rootNode) => {
        const expected = { x: rootNode.position.x, y: currentY };
        const rootMoved =
          rootNode.position.x !== expected.x ||
          rootNode.position.y !== expected.y;
        if (rootMoved) {
          updatePosition(rootNode.id, expected);
        }
        if (rootNode.isExpanded) {
          recalculateChildPositionsRecursively(
            rootNode.id,
            rootMoved ? expected : undefined
          );
        }
        currentY +=
          calculateVisibleSubtreeHeight(rootNode.id, currentNodes) + NODE_GAP;
      });
    };

    const handleEvent = (event: NodeLayoutEvent) => {
      switch (event.type) {
        case "node:added":
          if (event.parentId != null) {
            recalculateSiblingPositionsWithVisibility(event.parentId);
            propagateRecalculationUpward(event.parentId);
          } else {
            recalculateRootPositions();
          }
          break;
        case "node:deleted":
          if (event.parentId != null) {
            recalculateSiblingPositionsWithVisibility(event.parentId);
            propagateRecalculationUpward(event.parentId);
          } else {
            recalculateRootPositions();
          }
          break;
        case "node:moved":
          if (event.previousParentId != null) {
            recalculateSiblingPositionsWithVisibility(event.previousParentId);
            propagateRecalculationUpward(event.previousParentId);
          }
          if (event.parentId != null && event.parentId !== event.previousParentId) {
            recalculateSiblingPositionsWithVisibility(event.parentId);
            propagateRecalculationUpward(event.parentId);
          }
          if (
            event.parentId == null &&
            event.previousParentId != null
          ) {
            recalculateRootPositions();
          }
          break;
        case "node:toggled": {
          toggleOverrideRef.current = { nodeId: event.nodeId, isExpanded: event.isExpanded };
          try {
            // When expanding, position this node's children (and their descendants) first so
            // the newly visible subtree is laid out before we recalc sibling positions.
            if (event.isExpanded) {
              recalculateChildPositionsRecursively(event.nodeId);
            }
            if (event.parentId != null) {
              recalculateSiblingPositionsWithVisibility(event.parentId);
              propagateRecalculationUpward(event.parentId);
            } else {
              recalculateRootPositions();
            }
          } finally {
            toggleOverrideRef.current = null;
          }
          break;
        }
        case "node:heightChanged":
          requestAnimationFrame(() => {
            if (event.parentId != null) {
              recalculateSiblingPositionsWithVisibility(event.parentId);
              propagateRecalculationUpward(event.parentId);
            } else {
              recalculateRootPositions();
            }
          });
          break;
      }
    };

    return nodeLayoutEvents.on(handleEvent);
  }, []);
}

/**
 * Renderless component that runs the layout observer inside the flow provider.
 */
export function NodePositionObserver() {
  useNodeLayoutObserver();
  return null;
}
