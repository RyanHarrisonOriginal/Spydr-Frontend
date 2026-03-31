import { useMemo, useEffect, useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useStore,
  type Node,
  type Edge,
  type OnSelectionChangeFunc,
  BackgroundVariant,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { OntologyFlowProvider, useOntologyFlowContext } from "../context/OntologyFlowContext";
import { OntologyNode } from "./OntologyNode";
import { OntologyEdge } from "./OntologyEdge";
import { getSelectedNodePayload, getVisibleNodeIds, getVisibleSubtreeNodeIds } from "../utils/treeUtils";
import { getAllowedChildren } from "../utils/nodeSchemas";
import { getViewportForBoundsWithOrigin } from "../utils/viewportScopeUtils";
import { NodePositionObserver } from "../hooks/useNodeLayoutObserver";
import { nodeLayoutEvents, type NodeLayoutEvent } from "../utils/nodeLayoutEvents";

const nodeTypes = { ontologyNode: OntologyNode };
const edgeTypes = { ontologyEdge: OntologyEdge };

import type { SelectedNodePayload } from "../utils/types";

/** Listens for canvas:fitToSubtree and fits view to parent + its children (must be inside ReactFlow). */
function FitToSubtreeListener() {
  const reactFlow = useReactFlow();
  const { nodes: storeNodes } = useOntologyFlowContext();
  const storeNodesRef = useRef(storeNodes);
  storeNodesRef.current = storeNodes;

  useEffect(() => {
    const handleEvent = (event: NodeLayoutEvent) => {
      if (event.type !== "canvas:fitToSubtree") return;
      const { parentId } = event;
      const nodes = storeNodesRef.current;
      const visibleIds = getVisibleNodeIds(nodes);
      if (!nodes[parentId] || !visibleIds.has(parentId)) return;
      const nodeIdsToFit = [parentId];
      Object.values(nodes).forEach((node) => {
        if (node.parentId === parentId && visibleIds.has(node.id)) {
          nodeIdsToFit.push(node.id);
        }
      });
      const idsToFit = nodeIdsToFit;
      setTimeout(() => {
        const latest = storeNodesRef.current;
        if (!latest[parentId] || !getVisibleNodeIds(latest).has(parentId)) return;
        reactFlow.fitView({
          nodes: idsToFit.map((id) => ({ id })),
          padding: 0.3,
          duration: 300,
          maxZoom: 1.2,
          minZoom: 0.15,
        });
      }, 280);
    };
    return nodeLayoutEvents.on(handleEvent);
  }, [reactFlow]);

  return null;
}

/** Listens for canvas:scopeToSubtree and pans/zooms so the expanded node is at top-left with subtree in view. */
function ScopeToSubtreeListener() {
  const reactFlow = useReactFlow();
  const { nodes: storeNodes } = useOntologyFlowContext();
  const storeNodesRef = useRef(storeNodes);
  storeNodesRef.current = storeNodes;
  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);

  useEffect(() => {
    const handleEvent = (event: NodeLayoutEvent) => {
      if (event.type !== "canvas:scopeToSubtree") return;
      const { nodeId } = event;
      const nodes = storeNodesRef.current;
      const subtreeIds = getVisibleSubtreeNodeIds(nodes, nodeId);
      if (subtreeIds.length === 0) return;

      const run = () => {
        const flowNodes = reactFlow.getNodes();
        const present = subtreeIds.filter((id) => flowNodes.some((n) => n.id === id));
        if (present.length === 0) return;
        let bounds;
        try {
          bounds = reactFlow.getNodesBounds(present);
        } catch {
          return;
        }
        const vw = width > 0 ? width : 800;
        const vh = height > 0 ? height : 600;
        const viewport = getViewportForBoundsWithOrigin(
          { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
          vw,
          vh,
          { padding: 48, minZoom: 0.15, maxZoom: 1.2 }
        );
        reactFlow.setViewport(
          { x: viewport.x, y: viewport.y, zoom: viewport.zoom },
          { duration: 300 }
        );
      };

      setTimeout(run, 0);
    };
    return nodeLayoutEvents.on(handleEvent);
  }, [reactFlow, width, height]);

  return null;
}

export interface OntologyFlowCanvasProps {
  ontologyId: string;
  nodes: Record<string, import("../utils/types").OntologyNode>;
  nodeTypes: Record<string, import("../utils/types").NodeType>;
  editingNodeId: string | null;
  selectedNodeId?: string | null;
  selectedNodePayload?: SelectedNodePayload | null;
  setSelectedNode?: (payload: SelectedNodePayload | null) => void;
  onUpdateNode: (nodeId: string, updates: Partial<import("../utils/types").OntologyNode>) => void;
  onDeleteNode: (nodeId: string) => void;
  onCreateNode: (type: string, parentId: string | null, position?: { x: number; y: number }) => void;
  onOpenEditor: (nodeId: string | null) => void;
  onUpdateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  onMoveNodeUp?: (nodeId: string) => void;
  onMoveNodeDown?: (nodeId: string) => void;
  onIndent?: (nodeId: string) => void;
}

export function OntologyFlowCanvasView() {
  const ctx = useOntologyFlowContext();
  const { nodes: storeNodes } = ctx;

  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    (params) => {
      const selected = params.nodes[0];
      if (!selected) {
        ctx.setSelectedNode(null);
        return;
      }
      const nodeId = selected.id;
      const node = ctx.nodes[nodeId];
      if (!node) return;
      const allowed = getAllowedChildren(node.type, ctx.nodeTypes);
      ctx.setSelectedNode(
        getSelectedNodePayload(ctx.nodes, nodeId, allowed)
      );
      // If document pane is open, switch it to this node's document
      if (ctx.editingNodeId != null) {
        ctx.onOpenEditor(nodeId);
      }
    },
    [ctx]
  );

  function buildFlowNodesAndEdges(
    nodes: Record<string, import("../utils/types").OntologyNode>,
    nodeTypes: Record<string, import("../utils/types").NodeType>
  ) {
    const visibleIds = getVisibleNodeIds(nodes);
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    const nodeList = Object.values(nodes);

    nodeList.forEach((node) => {
      if (!visibleIds.has(node.id)) return;
      const childCount = nodeList.filter((n) => n.parentId === node.id).length;
      flowNodes.push({
        id: node.id,
        type: "ontologyNode",
        position: node.position,
        data: {
          nodeId: node.id,
          type: node.type,
          title: node.title,
          lifecycleState: node.lifecycleState,
          isExpanded: node.isExpanded,
          childCount,
        },
      });

      if (node.parentId && visibleIds.has(node.parentId) && nodes[node.parentId]) {
        flowEdges.push({
          id: `e-${node.parentId}-${node.id}`,
          source: node.parentId,
          sourceHandle: "source",
          target: node.id,
          targetHandle: "target",
          type: "ontologyEdge",
          data: {
            sourceType: nodes[node.parentId]?.type ?? "thought",
            nodeTypes,
          },
        });
      }
    });

    return { flowNodes, flowEdges };
  }

  const { flowNodes: initialNodes, flowEdges: initialEdges } = useMemo(
    () => buildFlowNodesAndEdges(storeNodes, ctx.nodeTypes),
    [storeNodes, ctx.nodeTypes]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { flowNodes, flowEdges } = buildFlowNodesAndEdges(storeNodes, ctx.nodeTypes);
    setNodes(flowNodes);
    setEdges(flowEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend only on source of truth; omit setNodes/setEdges to avoid max update depth
  }, [storeNodes, ctx.nodeTypes]);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node, _nodes: Node[]) => {
      ctx.onUpdateNodePosition(node.id, node.position);
    },
    [ctx]
  );

  return (
    <div className="w-full h-full bg-canvas">
      <NodePositionObserver />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes as import("@xyflow/react").NodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        className="bg-canvas"
        proOptions={{ hideAttribution: true }}
        snapToGrid
        snapGrid={[16, 16]}
        connectionLineStyle={{
          stroke: "hsl(var(--foreground) / 0.2)",
          strokeWidth: 1.5,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={40}
          size={0.8}
          color="hsl(var(--foreground) / 0.04)"
        />
        <Controls
          className="!bg-card/80 !backdrop-blur-md !border-border/40 !shadow-md !rounded-xl !opacity-0 hover:!opacity-100 !transition-opacity !duration-500 [&>button]:!bg-transparent [&>button]:!border-0 [&>button]:hover:!bg-muted/60 [&>button]:!text-muted-foreground [&>button]:hover:!text-foreground [&>button]:!rounded-lg"
        />
        <FitToSubtreeListener />
        <ScopeToSubtreeListener />
      </ReactFlow>
    </div>
  );
}

function OntologyFlowCanvasInner() {
  return <OntologyFlowCanvasView />;
}

export function OntologyFlowCanvas(props: OntologyFlowCanvasProps) {
  const value = useMemo(
    () => ({
      nodes: props.nodes,
      nodeTypes: props.nodeTypes,
      editingNodeId: props.editingNodeId,
      ontologyId: props.ontologyId,
      selectedNodeId: props.selectedNodeId ?? null,
      selectedNodePayload: props.selectedNodePayload ?? null,
      setSelectedNode: props.setSelectedNode ?? (() => {}),
      onUpdateNode: props.onUpdateNode,
      onDeleteNode: props.onDeleteNode,
      onCreateNode: props.onCreateNode,
      onOpenEditor: props.onOpenEditor,
      onUpdateNodePosition: props.onUpdateNodePosition,
      onMoveNodeUp: props.onMoveNodeUp ?? (() => {}),
      onMoveNodeDown: props.onMoveNodeDown ?? (() => {}),
      onIndent: props.onIndent ?? (() => {}),
    }),
    [props]
  );

  return (
    <ReactFlowProvider>
      <OntologyFlowProvider value={value}>
        <OntologyFlowCanvasInner />
      </OntologyFlowProvider>
    </ReactFlowProvider>
  );
}
