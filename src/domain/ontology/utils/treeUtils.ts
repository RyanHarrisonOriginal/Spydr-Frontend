import type { OntologyNode, SelectedNodePayload } from "./types";

/** Pure: get root nodes (parentId null) in creation order. */
export function getRootNodes(nodes: Record<string, OntologyNode>): OntologyNode[] {
  return Object.values(nodes)
    .filter((n) => n.parentId === null)
    .sort((a, b) => a.createdAt - b.createdAt);
}

/** Pure: get direct children of a parent. */
export function getChildren(
  nodes: Record<string, OntologyNode>,
  parentId: string
): OntologyNode[] {
  return Object.values(nodes)
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

/** Pure: get siblings of a node (same parent), ordered by createdAt. */
export function getSiblings(
  nodes: Record<string, OntologyNode>,
  nodeId: string
): OntologyNode[] {
  const node = nodes[nodeId];
  if (!node) return [];
  const parentId = node.parentId;
  return Object.values(nodes)
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

/** Pure: set of node ids that are visible (no ancestor is collapsed). */
export function getVisibleNodeIds(
  nodes: Record<string, OntologyNode>
): Set<string> {
  const visible = new Set<string>();
  const isHidden = (nodeId: string): boolean => {
    const node = nodes[nodeId];
    if (!node) return true;
    if (node.parentId == null) return false;
    const parent = nodes[node.parentId];
    if (!parent || !parent.isExpanded) return true;
    return isHidden(node.parentId);
  };
  Object.keys(nodes).forEach((id) => {
    if (!isHidden(id)) visible.add(id);
  });
  return visible;
}

/** Pure: get ids of all descendants of a node (for collapse/hide). */
export function getDescendantIds(
  nodes: Record<string, OntologyNode>,
  parentId: string
): Set<string> {
  const out = new Set<string>();
  const collect = (id: string) => {
    Object.values(nodes).forEach((n) => {
      if (n.parentId === id) {
        out.add(n.id);
        collect(n.id);
      }
    });
  };
  collect(parentId);
  return out;
}

/** Pure: rootId plus all visible descendants. Used to scope the canvas to a subtree. */
export function getVisibleSubtreeNodeIds(
  nodes: Record<string, OntologyNode>,
  rootId: string
): string[] {
  const visible = getVisibleNodeIds(nodes);
  if (!visible.has(rootId)) return [];
  const ids = [rootId];
  getDescendantIds(nodes, rootId).forEach((id) => {
    if (visible.has(id)) ids.push(id);
  });
  return ids;
}

/** Pure: compute CommandBar payload for a selected node. */
export function getSelectedNodePayload(
  nodes: Record<string, OntologyNode>,
  nodeId: string,
  allowedChildrenTypes: string[]
): SelectedNodePayload {
  const node = nodes[nodeId];
  if (!node) {
    return {
      nodeId,
      canHaveChildren: false,
      canMoveUp: false,
      canMoveDown: false,
      canIndent: false,
    };
  }
  const siblings = getSiblings(nodes, nodeId);
  const idx = siblings.findIndex((s) => s.id === nodeId);
  const canMoveUp = idx > 0;
  const canMoveDown = idx >= 0 && idx < siblings.length - 1;
  const canIndent = idx > 0;
  const canHaveChildren = allowedChildrenTypes.length > 0;
  return {
    nodeId,
    canHaveChildren,
    canMoveUp,
    canMoveDown,
    canIndent,
  };
}
