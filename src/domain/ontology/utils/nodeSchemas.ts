import type { NodeType, NodeTypeId } from "./types";

/** Allowed child type ids for a node type (for canHaveChildren). */
export function getAllowedChildren(
  type: NodeTypeId,
  nodeTypes: Record<string, NodeType>
): string[] {
  const nt = nodeTypes[type];
  if (!nt) return [];
  return (nt.allowedChildren ?? []).filter((t) => t !== "custom") as string[];
}

/** Type ids that are valid as children of the given parent type (for type picker). */
export function getAllowedTypesForParent(
  parentType: NodeTypeId | null,
  nodeTypes: Record<string, NodeType>
): string[] {
  const parentKey = parentType ?? null;
  const isParentCustom =
    parentType !== null && nodeTypes[parentType] && !nodeTypes[parentType].isPreset;
  const allowed: string[] = [];
  for (const nt of Object.values(nodeTypes)) {
    const parents = nt.allowedParents ?? [];
    const canBeRoot = parentKey === null && (parents.includes(null) || parents.includes("null"));
    if (parents.includes(parentKey) || canBeRoot) allowed.push(nt.id);
    else if (isParentCustom && parents.includes("custom")) allowed.push(nt.id);
  }
  return [...new Set(allowed)];
}

/** Display label for a type. */
export function getTypeLabel(type: NodeTypeId, nodeTypes: Record<string, NodeType>): string {
  return nodeTypes[type]?.label ?? type;
}

/** CSS color for a type. Presets use theme vars when available; others use stored color. */
export function getTypeColor(type: NodeTypeId, nodeTypes: Record<string, NodeType>): string {
  const nt = nodeTypes[type];
  if (!nt?.color) return "hsl(var(--primary))";
  const c = nt.color;
  return c.startsWith("hsl(") ? c : `hsl(${c})`;
}

/** Node badge class for presets (node-badge-thought etc.), or null for custom (use inline style). */
export function getNodeBadgeClass(type: NodeTypeId, nodeTypes: Record<string, NodeType>): string | null {
  const nt = nodeTypes[type];
  if (nt?.isPreset && type) {
    const k = type.replace(/-/g, "-");
    return `node-badge node-badge-${k}`;
  }
  return null;
}

/** Field schema for a type (for node editor). */
export function getFieldSchema(
  type: NodeTypeId,
  nodeTypes: Record<string, NodeType>
): { key: string; label: string; type: string }[] {
  const nt = nodeTypes[type];
  return nt?.fieldSchema ?? [];
}
