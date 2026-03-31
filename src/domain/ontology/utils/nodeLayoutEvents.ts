/**
 * Lightweight event bus for node layout: when nodes are added, deleted, moved,
 * toggled (expand/collapse), or height changes, the position observer recalculates
 * sibling positions and propagates updates.
 */

export type NodeLayoutEvent =
  | { type: "node:added"; parentId: string | null }
  | { type: "node:deleted"; parentId: string | null }
  | { type: "node:moved"; parentId: string | null; previousParentId: string | null }
  | { type: "node:toggled"; nodeId: string; parentId: string | null; isExpanded: boolean }
  | { type: "node:heightChanged"; nodeId: string; parentId: string | null }
  | { type: "canvas:fitToSubtree"; parentId: string }
  | { type: "canvas:scopeToSubtree"; nodeId: string };

type Listener = (event: NodeLayoutEvent) => void;
const listeners: Listener[] = [];

function emit(event: NodeLayoutEvent) {
  listeners.forEach((fn) => fn(event));
}

export const nodeLayoutEvents = {
  on(fn: Listener): () => void {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  },
  emitNodeAdded(parentId: string | null) {
    emit({ type: "node:added", parentId });
  },
  emitNodeDeleted(parentId: string | null) {
    emit({ type: "node:deleted", parentId });
  },
  emitNodeMoved(parentId: string | null, previousParentId: string | null) {
    emit({ type: "node:moved", parentId, previousParentId });
  },
  emitNodeToggled(nodeId: string, parentId: string | null, isExpanded: boolean) {
    emit({ type: "node:toggled", nodeId, parentId, isExpanded });
  },
  emitNodeHeightChanged(nodeId: string, parentId: string | null) {
    emit({ type: "node:heightChanged", nodeId, parentId });
  },
  /** Emit when canvas should zoom/fit to show a parent and its children (e.g. after adding a child). */
  emitFitViewToSubtree(parentId: string) {
    emit({ type: "canvas:fitToSubtree", parentId });
  },
  /** Emit when canvas should scope view to an expanded node's subtree (node at top-left, children in view). */
  emitScopeToSubtree(nodeId: string) {
    emit({ type: "canvas:scopeToSubtree", nodeId });
  },
};
