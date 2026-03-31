/**
 * Node positioning constants and utilities.
 * Centralized configuration for consistent node layout.
 * Nodes have dynamic heights based on text content; use getNodeHeight() or node.computedHeight.
 */

export const NODE_LAYOUT = {
  NODE_WIDTH: 400,
  LINE_HEIGHT: 22, // 14px font * 1.6 line-height
  NODE_PADDING_Y: 44, // pt-4 + pb-7 (type badge spacing)
  NODE_GAP: 32, // vertical gap between nodes (larger for current node size)
  HORIZONTAL_OFFSET: 448, // NODE_WIDTH + horizontal gap (48px)
  CHARS_PER_LINE: 45,
  MAX_CHARS: 120,
} as const;

export function getLineCount(textLength: number): number {
  const { CHARS_PER_LINE, MAX_CHARS } = NODE_LAYOUT;
  const clampedLength = Math.min(textLength, MAX_CHARS);
  if (clampedLength === 0) return 1;
  return Math.ceil(clampedLength / CHARS_PER_LINE);
}

export function getNodeHeight(titleLength: number): number {
  const { LINE_HEIGHT, NODE_PADDING_Y } = NODE_LAYOUT;
  const lines = getLineCount(titleLength);
  return NODE_PADDING_Y + lines * LINE_HEIGHT;
}

export function getEffectiveNodeHeight(node: {
  title: string;
  computedHeight?: number;
}): number {
  return node.computedHeight ?? getNodeHeight((node.title ?? "").length);
}

export function getBaseVerticalOffset(parentHeight: number): number {
  return parentHeight + NODE_LAYOUT.NODE_GAP;
}

export function calculateSubtreeHeight(
  nodeId: string,
  nodes: Record<
    string,
    { id: string; parentId: string | null; title: string; computedHeight?: number }
  >,
  visited = new Set<string>()
): number {
  if (visited.has(nodeId)) return 0;
  visited.add(nodeId);
  const node = nodes[nodeId];
  if (!node) return 0;
  const children = Object.values(nodes).filter((n) => n.parentId === nodeId);
  if (children.length === 0) return getEffectiveNodeHeight(node);
  let totalHeight = getEffectiveNodeHeight(node);
  children.forEach((child) => {
    totalHeight +=
      NODE_LAYOUT.NODE_GAP +
      calculateSubtreeHeight(child.id, nodes, new Set(visited));
  });
  return totalHeight;
}

export function getDescendantCount(
  nodeId: string,
  nodes: Record<string, { id: string; parentId: string | null }>,
  visited = new Set<string>()
): number {
  if (visited.has(nodeId)) return 0;
  visited.add(nodeId);
  const children = Object.values(nodes).filter((n) => n.parentId === nodeId);
  let count = children.length;
  children.forEach((child) => {
    count += getDescendantCount(child.id, nodes, new Set(visited));
  });
  return count;
}

export function calculateVisibleSubtreeHeight(
  nodeId: string,
  nodes: Record<
    string,
    {
      id: string;
      parentId: string | null;
      title: string;
      computedHeight?: number;
      isExpanded: boolean;
    }
  >,
  visited = new Set<string>()
): number {
  if (visited.has(nodeId)) return 0;
  visited.add(nodeId);
  const node = nodes[nodeId];
  if (!node) return 0;
  let totalHeight = getEffectiveNodeHeight(node);
  if (!node.isExpanded) return totalHeight;
  const children = Object.values(nodes).filter((n) => n.parentId === nodeId);
  children.forEach((child) => {
    totalHeight +=
      NODE_LAYOUT.NODE_GAP +
      calculateVisibleSubtreeHeight(child.id, nodes, new Set(visited));
  });
  return totalHeight;
}
