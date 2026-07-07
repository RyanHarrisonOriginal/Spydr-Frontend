import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
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
import {
  GRAPH_NODE_WIDTH,
  graphKindRank,
  graphRankLabels,
} from "@/domain/spydr/utils/workspaceGraphLayout";
import { GraphNode } from "./GraphNode";
import { LineageEdge } from "./LineageEdge";

const nodeTypes = { graphNode: GraphNode };
const edgeTypes = { lineageEdge: LineageEdge };

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
    <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-background/92 px-2.5 py-2 shadow-sm backdrop-blur-sm">
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
        {nodeCount} nodes · {edgeCount} deps
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

function LineageColumnHeaders({ filters }: { filters: GraphNodeFilters }) {
  const columns = useMemo(() => {
    const kinds = Object.keys(graphKindRank) as GraphNodeKind[];
    return kinds
      .filter((kind) => filters[kind])
      .sort((a, b) => graphKindRank[a] - graphKindRank[b])
      .map((kind) => ({
        kind,
        rank: graphKindRank[kind],
        label: graphRankLabels[graphKindRank[kind]],
      }));
  }, [filters]);

  if (columns.length === 0) return null;

  return (
    <div
      className="pointer-events-none flex items-stretch gap-[148px] pl-[52px] pt-2"
      aria-hidden
    >
      {columns.map((column) => (
        <div
          key={column.kind}
          className="flex w-[196px] flex-col items-center"
          style={{ width: GRAPH_NODE_WIDTH }}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/80">
            {column.label}
          </span>
          <span className="mt-1 h-px w-full bg-border/60" />
        </div>
      ))}
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
      fitView({ padding: { top: 72, right: 48, bottom: 48, left: 48 }, duration: 360, maxZoom: 1.1 });
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
    fitView({ padding: { top: 72, right: 48, bottom: 48, left: 48 }, duration: 360, maxZoom: 1.1 });
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
        return "hsl(var(--status-doing) / 0.65)";
      default:
        return "hsl(var(--border))";
    }
  }, []);

  return (
    <div className="workspace-graph workspace-lineage absolute inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        minZoom={0.06}
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
        <defs>
          <marker
            id="lineage-arrow"
            viewBox="0 0 10 10"
            refX={8}
            refY={5}
            markerWidth={7}
            markerHeight={7}
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 z"
              fill="hsl(var(--foreground) / 0.42)"
            />
          </marker>
        </defs>

        <Panel position="top-left" className="!m-3 !max-w-none">
          <GraphFilterBar
            filters={filters}
            onToggle={onToggleFilter}
            nodeCount={nodes.length}
            edgeCount={edges.length}
            onFitView={handleFitView}
          />
        </Panel>

        <Panel position="top-left" className="!m-0 !mt-[3.25rem] !max-w-none">
          <LineageColumnHeaders filters={filters} />
        </Panel>

        <Background
          variant={BackgroundVariant.Lines}
          gap={24}
          size={1}
          color="hsl(var(--foreground) / 0.05)"
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
