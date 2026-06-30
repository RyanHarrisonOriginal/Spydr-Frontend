import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Focus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GraphNodeData, GraphNodeFilters, GraphNodeKind } from "@/domain/spydr/utils/workspaceGraphModel";
import { graphKindLabels } from "@/domain/spydr/utils/workspaceGraphModel";
import { GraphNode } from "./GraphNode";

const nodeTypes = { graphNode: GraphNode };

interface GraphFilterBarProps {
  filters: GraphNodeFilters;
  onToggle: (kind: GraphNodeKind) => void;
  nodeCount: number;
  edgeCount: number;
  onFitView: () => void;
}

function GraphFilterBar({
  filters,
  onToggle,
  nodeCount,
  edgeCount,
  onFitView,
}: GraphFilterBarProps) {
  const kinds = Object.keys(graphKindLabels) as GraphNodeKind[];

  return (
    <div className="pointer-events-auto absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-background/90 px-2.5 py-2 shadow-sm backdrop-blur-sm">
      {kinds.map((kind) => (
        <button
          key={kind}
          type="button"
          onClick={() => onToggle(kind)}
          className={cn(
            "rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors ring-focus",
            filters[kind]
              ? "border-highlight/40 bg-highlight/10 text-foreground"
              : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
          )}
        >
          {graphKindLabels[kind]}
        </button>
      ))}
      <span className="ml-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {nodeCount} nodes · {edgeCount} edges
      </span>
      <button
        type="button"
        onClick={onFitView}
        className="ml-1 inline-flex items-center gap-1 rounded border border-border bg-muted/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-highlight/40 hover:text-foreground ring-focus"
      >
        <Focus className="h-3 w-3" />
        Fit
      </button>
    </div>
  );
}

interface FitViewOnLoadProps {
  layoutKey: string;
}

function FitViewOnLoad({ layoutKey }: FitViewOnLoadProps) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (!layoutKey) return;

    const fit = () => {
      fitView({ padding: 0.18, duration: 360, maxZoom: 1.05 });
    };

    fit();
    const timer = window.setTimeout(fit, 160);
    return () => window.clearTimeout(timer);
  }, [fitView, layoutKey]);

  return null;
}

interface WorkspaceGraphCanvasProps {
  nodes: Node<GraphNodeData>[];
  edges: Edge[];
  filters: GraphNodeFilters;
  layoutKey: string;
  onToggleFilter: (kind: GraphNodeKind) => void;
}

function WorkspaceGraphCanvasInner({
  nodes,
  edges,
  filters,
  layoutKey,
  onToggleFilter,
}: WorkspaceGraphCanvasProps) {
  const navigate = useNavigate();
  const { fitView } = useReactFlow();

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.18, duration: 360, maxZoom: 1.05 });
  }, [fitView]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<GraphNodeData>) => {
      const href = node.data.href;
      if (href) navigate(href);
    },
    [navigate]
  );

  const miniMapNodeColor = useCallback((node: Node<GraphNodeData>) => {
    switch (node.data.kind) {
      case "project":
        return "hsl(var(--highlight) / 0.75)";
      case "person":
        return "hsl(var(--highlight-secondary) / 0.75)";
      case "task":
        return "hsl(var(--muted-foreground) / 0.55)";
      default:
        return "hsl(var(--border))";
    }
  }, []);

  return (
    <div className="workspace-graph absolute inset-0">
      <GraphFilterBar
        filters={filters}
        onToggle={onToggleFilter}
        nodeCount={nodes.length}
        edgeCount={edges.length}
        onFitView={handleFitView}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        minZoom={0.08}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        zoomOnScroll
        style={{ width: "100%", height: "100%" }}
        className="bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="hsl(var(--foreground) / 0.06)"
        />
        <Controls
          showInteractive={false}
          className="!border-border !bg-background/90 !shadow-sm [&>button]:!border-border [&>button]:!bg-card [&>button]:!text-foreground [&>button:hover]:!bg-muted"
        />
        <MiniMap
          nodeColor={miniMapNodeColor}
          maskColor="hsl(var(--background) / 0.75)"
          className="!border-border !bg-background/90"
          pannable
          zoomable
        />
        <FitViewOnLoad layoutKey={layoutKey} />
      </ReactFlow>
    </div>
  );
}

export function WorkspaceGraphCanvas(props: WorkspaceGraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkspaceGraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
