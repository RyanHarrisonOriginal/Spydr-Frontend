import { useCallback, useMemo } from "react";
import { useReactFlow } from "@xyflow/react";
import { ChevronRight, Scan } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOntologyFlowContext } from "../context/OntologyFlowContext";
import { getRootNodes, getChildren } from "../utils/treeUtils";
import { getTypeColor } from "../utils/nodeSchemas";

type TreeItem = {
  id: string;
  title: string;
  type: string;
  isExpanded: boolean;
  children: TreeItem[];
};

function NavigatorItem({
  item,
  depth,
  onNavigate,
  onToggleExpand,
  nodeTypes,
  selectedNodeId,
}: {
  item: TreeItem;
  depth: number;
  onNavigate: (id: string) => void;
  onToggleExpand: (nodeId: string) => void;
  nodeTypes: Record<string, { color: string }>;
  selectedNodeId: string | null;
}) {
  const hasChildren = item.children.length > 0;
  const color = getTypeColor(item.type, nodeTypes);
  const isSelected = selectedNodeId === item.id;
  const isUntitled = item.title === "Untitled";

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "flex items-start gap-2 rounded-lg transition-colors duration-150 cursor-pointer group py-1.5 pr-2",
          isSelected
            ? "bg-primary/10 dark:bg-primary/15 border border-primary/20"
            : "hover:bg-muted/40 dark:hover:bg-muted/50 border border-transparent"
        )}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        onClick={() => onNavigate(item.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onNavigate(item.id);
          }
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(item.id);
            }}
            className="mt-0.5 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                item.isExpanded && "rotate-90"
              )}
            />
          </button>
        ) : (
          <span className="w-[22px] shrink-0" />
        )}
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 mt-1.5",
            isSelected ? "opacity-100" : "opacity-70"
          )}
          style={{ backgroundColor: color }}
        />
        <span
          className={cn(
            "text-[13px] leading-snug break-words min-w-0 flex-1 py-0.5",
            isSelected
              ? "text-foreground font-semibold"
              : isUntitled
                ? "text-muted-foreground italic"
                : "text-foreground/85 dark:text-foreground/90 group-hover:text-foreground"
          )}
        >
          {item.title}
        </span>
      </div>
      {hasChildren && item.isExpanded && (
        <div>
          {item.children.map((child) => (
            <NavigatorItem
              key={child.id}
              item={child}
              depth={depth + 1}
              onNavigate={onNavigate}
              onToggleExpand={onToggleExpand}
              nodeTypes={nodeTypes}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CanvasNavigator() {
  const { nodes, selectedNodeId, nodeTypes, onUpdateNode } =
    useOntologyFlowContext();
  const reactFlow = useReactFlow();

  const tree = useMemo(() => {
    const buildTree = (parentId: string | null): TreeItem[] => {
      const children =
        parentId === null
          ? getRootNodes(nodes)
          : getChildren(nodes, parentId);
      return children.map((node) => ({
        id: node.id,
        title: node.title || "Untitled",
        type: node.type,
        isExpanded: node.isExpanded ?? true,
        children: buildTree(node.id),
      }));
    };
    return buildTree(null);
  }, [nodes]);

  const handleToggleExpand = useCallback(
    (nodeId: string) => {
      const node = nodes[nodeId];
      if (node) onUpdateNode(nodeId, { isExpanded: !node.isExpanded });
    },
    [nodes, onUpdateNode]
  );

  const handleNavigate = useCallback(
    (nodeId: string) => {
      reactFlow.fitView({
        nodes: [{ id: nodeId }],
        padding: 0.5,
        duration: 400,
      });
    },
    [reactFlow]
  );

  const handleFitAll = useCallback(() => {
    reactFlow.fitView({ padding: 0.3, duration: 400 });
  }, [reactFlow]);

  const totalNodes = Object.keys(nodes).length;
  if (totalNodes === 0) return null;

  return (
    <div className="w-full min-w-0 max-h-[calc(100vh-120px)] flex flex-col overflow-hidden bg-card border border-border rounded-xl shadow-sm dark:bg-card/95 dark:border-border/80">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-muted/30 dark:bg-muted/20">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80 dark:text-foreground/90">
          {totalNodes} {totalNodes === 1 ? "thought" : "thoughts"}
        </span>
        <button
          type="button"
          onClick={handleFitAll}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
          title="Fit all"
        >
          <Scan className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto px-2 py-2">
        {tree.map((item) => (
          <NavigatorItem
            key={item.id}
            item={item}
            depth={0}
            onNavigate={handleNavigate}
            onToggleExpand={handleToggleExpand}
            nodeTypes={nodeTypes}
            selectedNodeId={selectedNodeId}
          />
        ))}
      </div>
    </div>
  );
}
