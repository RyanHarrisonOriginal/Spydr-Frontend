import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import type { GraphNodeData, GraphNodeKind } from "./workspaceGraphModel";

/** Must match GraphNode rendered size for accurate spacing. */
export const GRAPH_NODE_WIDTH = 196;
export const GRAPH_NODE_HEIGHT = 56;

const COMPONENT_GAP_Y = 120;
const ORPHAN_GRID_GAP_X = 64;
const ORPHAN_GRID_GAP_Y = 52;

/** Fixed lineage columns — same entity types share a rank (dbt-style). */
export const graphKindRank: Record<GraphNodeKind, number> = {
  project_area: 0,
  project: 1,
  task: 2,
  person: 3,
};

export const graphRankLabels: Record<number, string> = {
  0: "Areas",
  1: "Projects",
  2: "Tasks",
  3: "People",
};

interface LayoutBounds {
  width: number;
  height: number;
}

function findConnectedComponents(nodeIds: string[], edges: Edge[]): string[][] {
  const adjacency = new Map<string, Set<string>>();

  for (const id of nodeIds) {
    adjacency.set(id, new Set());
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }

  const visited = new Set<string>();
  const components: string[][] = [];

  for (const id of nodeIds) {
    if (visited.has(id)) continue;

    const component: string[] = [];
    const stack = [id];
    visited.add(id);

    while (stack.length > 0) {
      const current = stack.pop()!;
      component.push(current);

      for (const neighbor of adjacency.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }

    components.push(component);
  }

  return components;
}

function layoutGrid(
  nodes: Node<GraphNodeData>[],
  columns: number,
  gapX: number,
  gapY: number
): { nodes: Node<GraphNodeData>[]; bounds: LayoutBounds } {
  if (nodes.length === 0) {
    return { nodes: [], bounds: { width: 0, height: 0 } };
  }

  const sorted = [...nodes].sort(
    (a, b) => graphKindRank[a.data.kind] - graphKindRank[b.data.kind]
  );
  const cols = Math.max(1, Math.min(columns, sorted.length));
  const laidOut = sorted.map((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      ...node,
      position: {
        x: col * (GRAPH_NODE_WIDTH + gapX),
        y: row * (GRAPH_NODE_HEIGHT + gapY),
      },
    };
  });

  const rows = Math.ceil(sorted.length / cols);
  return {
    nodes: laidOut,
    bounds: {
      width: cols * GRAPH_NODE_WIDTH + (cols - 1) * gapX,
      height: rows * GRAPH_NODE_HEIGHT + (rows - 1) * gapY,
    },
  };
}

function layoutDagreComponent(
  nodes: Node<GraphNodeData>[],
  edges: Edge[]
): { nodes: Node<GraphNodeData>[]; bounds: LayoutBounds } {
  if (nodes.length === 0) {
    return { nodes: [], bounds: { width: 0, height: 0 } };
  }

  if (edges.length === 0) {
    return layoutGrid(nodes, Math.ceil(Math.sqrt(nodes.length)), ORPHAN_GRID_GAP_X, ORPHAN_GRID_GAP_Y);
  }

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "LR",
    align: "UL",
    nodesep: 52,
    ranksep: 148,
    edgesep: 20,
    marginx: 48,
    marginy: 56,
  });

  const nodeIds = new Set(nodes.map((node) => node.id));

  for (const node of nodes) {
    graph.setNode(node.id, {
      width: GRAPH_NODE_WIDTH,
      height: GRAPH_NODE_HEIGHT,
      rank: graphKindRank[node.data.kind],
    });
  }

  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  }

  dagre.layout(graph);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const laidOut = nodes.map((node) => {
    const layoutNode = graph.node(node.id);
    if (!layoutNode) {
      return { ...node, position: { x: 0, y: 0 } };
    }

    const x = layoutNode.x - GRAPH_NODE_WIDTH / 2;
    const y = layoutNode.y - GRAPH_NODE_HEIGHT / 2;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + GRAPH_NODE_WIDTH);
    maxY = Math.max(maxY, y + GRAPH_NODE_HEIGHT);

    return { ...node, position: { x, y } };
  });

  const normalized =
    Number.isFinite(minX) && Number.isFinite(minY)
      ? laidOut.map((node) => ({
          ...node,
          position: {
            x: node.position.x - minX,
            y: node.position.y - minY,
          },
        }))
      : laidOut;

  return {
    nodes: normalized,
    bounds: {
      width: Number.isFinite(maxX - minX) ? maxX - minX : GRAPH_NODE_WIDTH,
      height: Number.isFinite(maxY - minY) ? maxY - minY : GRAPH_NODE_HEIGHT,
    },
  };
}

/**
 * Lays out workspace lineage nodes left-to-right with Dagre, stacking disconnected
 * subgraphs vertically so wide DAG columns stay readable.
 */
export function layoutWorkspaceGraph(
  nodes: Node<GraphNodeData>[],
  edges: Edge[]
): Node<GraphNodeData>[] {
  if (nodes.length === 0) return [];

  if (edges.length === 0) {
    return layoutGrid(
      nodes,
      Math.ceil(Math.sqrt(nodes.length)),
      ORPHAN_GRID_GAP_X,
      ORPHAN_GRID_GAP_Y
    ).nodes;
  }

  const components = findConnectedComponents(
    nodes.map((node) => node.id),
    edges
  );

  const positioned: Node<GraphNodeData>[] = [];
  let offsetY = 0;

  for (const componentIds of components) {
    const componentIdSet = new Set(componentIds);
    const componentNodes = nodes.filter((node) => componentIdSet.has(node.id));
    const componentEdges = edges.filter(
      (edge) => componentIdSet.has(edge.source) && componentIdSet.has(edge.target)
    );

    const { nodes: laidOut, bounds } = layoutDagreComponent(
      componentNodes,
      componentEdges
    );

    for (const node of laidOut) {
      positioned.push({
        ...node,
        position: {
          x: node.position.x,
          y: node.position.y + offsetY,
        },
      });
    }

    offsetY += bounds.height + COMPONENT_GAP_Y;
  }

  return positioned;
}

export function workspaceGraphLayoutKey(
  nodes: Node<GraphNodeData>[],
  edges: Edge[]
): string {
  return `${nodes.length}:${edges.length}:${nodes.map((node) => node.id).join(",")}`;
}
