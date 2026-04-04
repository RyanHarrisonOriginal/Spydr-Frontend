import {
  memo,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Plus, Trash2, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { useOntologyFlowContext } from "../context/OntologyFlowContext";
import {
  getTypeColor,
  getTypeLabel,
  getFieldSchema,
  getAllowedChildren,
  getAllowedTypesForParent,
} from "../utils/nodeSchemas";
import { getLifecycleStateIds } from "../utils/lifecycle";
import { NodeLifecyclePicker } from "./lifecycle/NodeLifecyclePicker";
import { getNodeHeight, getLineCount, NODE_LAYOUT } from "../utils/nodePositioning";
import { nodeLayoutEvents } from "../utils/nodeLayoutEvents";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NodeData = {
  nodeId: string;
  type: string;
  title: string;
  lifecycleState: string | null;
  isExpanded: boolean;
  childCount: number;
};

type OntologyFlowNode = Node<NodeData, "ontologyNode">;

function OntologyNodeComponent({ data, selected }: NodeProps<OntologyFlowNode>) {
  const {
    nodes,
    nodeTypes,
    editingNodeId,
    onDeleteNode,
    onCreateNode,
    onOpenEditor,
    onUpdateNode,
  } = useOntologyFlowContext();

  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(data.title ?? "");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measuredHeightRef = useRef<number>(0);

  const nodeId = data.nodeId;
  const typeColor = getTypeColor(data.type, nodeTypes);
  const typeColorRaw = typeColor.replace(/^hsl\(|\)$/g, "");
  const typeLabel = getTypeLabel(data.type, nodeTypes);
  const isBeingEdited = editingNodeId === nodeId;
  const childCount = data.childCount;
  const hasChildren = childCount > 0;
  const isNodeExpanded = data.isExpanded;
  const title = data.title ?? "";

  const nodeHeight = useMemo(
    () => getNodeHeight(localTitle.length),
    [localTitle.length]
  );
  const lineCount = useMemo(
    () => getLineCount(localTitle.length),
    [localTitle.length]
  );
  const singleLine = lineCount === 1;

  const fieldSchema = useMemo(
    () => getFieldSchema(data.type, nodeTypes),
    [data.type, nodeTypes]
  );

  const node = nodes[nodeId];
  const fieldsWithValues = useMemo(() => {
    const raw = node?.fields ?? {};
    return fieldSchema.filter((f) => (raw[f.key] ?? "").trim() !== "");
  }, [fieldSchema, node?.fields]);

  const formatFieldDisplay = useCallback((f: { type: string }, value: string) => {
    const v = value.trim();
    if (f.type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
      try {
        const d = new Date(v + "T12:00:00");
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      } catch {
        return v;
      }
    }
    return v.length > 12 ? v.slice(0, 11) + "…" : v;
  }, []);

  // Sync computedHeight and emit for layout observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const measureAndSync = () => {
      const nextHeight = Math.ceil(el.getBoundingClientRect().height);
      if (!nextHeight || nextHeight === measuredHeightRef.current) return;
      measuredHeightRef.current = nextHeight;
      const node = nodes[nodeId];
      if (node && node.computedHeight !== nextHeight) {
        onUpdateNode(nodeId, { computedHeight: nextHeight });
        nodeLayoutEvents.emitNodeHeightChanged(
          nodeId,
          node.parentId ?? null
        );
      }
    };
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measureAndSync);
    });
    ro.observe(el);
    measureAndSync();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [nodeId, nodes, onUpdateNode]);

  useEffect(() => {
    if (!isEditing) setLocalTitle(title);
  }, [title, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [localTitle, isEditing]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalTitle(e.target.value.slice(0, NODE_LAYOUT.MAX_CHARS));
    },
    []
  );

  const commitTitle = useCallback(() => {
    if (localTitle !== title) onUpdateNode(nodeId, { title: localTitle });
    setIsEditing(false);
  }, [localTitle, title, nodeId, onUpdateNode]);

  const handleTitleBlur = useCallback(() => commitTitle(), [commitTitle]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commitTitle();
      }
      if (e.key === "Escape") {
        setLocalTitle(title);
        setIsEditing(false);
      }
    },
    [commitTitle, title]
  );

  const handleAddChild = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (localTitle !== title) onUpdateNode(nodeId, { title: localTitle });
      const allowed = getAllowedChildren(data.type, nodeTypes);
      const childType = allowed[0] ?? "thought";
      onCreateNode(childType, nodeId);
    },
    [nodeId, data.type, nodeTypes, localTitle, title, onUpdateNode, onCreateNode]
  );

  const handleToggleExpanded = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onUpdateNode(nodeId, { isExpanded: !isNodeExpanded });
    },
    [nodeId, isNodeExpanded, onUpdateNode]
  );

  const handleChangeType = useCallback(
    (newType: string) => {
      onUpdateNode(nodeId, { type: newType });
    },
    [nodeId, onUpdateNode]
  );

  const handleOpenDocument = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpenEditor(nodeId);
    },
    [nodeId, onOpenEditor]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteNode(nodeId);
    },
    [nodeId, onDeleteNode]
  );

  const canHaveChildren = getAllowedChildren(data.type, nodeTypes).length > 0;
  const lifecycleOptions = getLifecycleStateIds(data.type, nodeTypes);

  const availableTypes = useMemo(() => {
    const parentType = nodes[nodeId]?.parentId
      ? nodes[nodes[nodeId].parentId!]?.type ?? null
      : null;
    const allowedIds = new Set(getAllowedTypesForParent(parentType, nodeTypes));
    const currentType = data.type;
    if (currentType && !allowedIds.has(currentType)) allowedIds.add(currentType);
    return allowedIds.size === 0
      ? []
      : Array.from(allowedIds).map((id) => ({
          id,
          label: getTypeLabel(id, nodeTypes),
          color: getTypeColor(id, nodeTypes),
        }));
  }, [nodes, nodeId, data.type, nodeTypes]);

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="!w-1.5 !h-1.5 !bg-transparent !border-0 !opacity-0"
      />

      <div
        ref={containerRef}
        className={cn(
          "w-[400px] max-w-[min(400px,90vw)] relative transition-all duration-300",
          singleLine ? "rounded-full" : "rounded-3xl",
          selected && "ring-1 ring-foreground/8",
          isBeingEdited && "ring-1 ring-primary/20"
        )}
        style={{
          minHeight: `${nodeHeight}px`,
          backgroundColor: `hsl(${typeColorRaw} / var(--node-fill-opacity, 0.1))`,
          borderLeft: `3px solid hsl(${typeColorRaw} / ${selected ? 0.6 : 0.38})`,
          boxShadow: selected
            ? "0 12px 40px -8px hsl(var(--foreground) / 0.18), 0 4px 12px -2px hsl(var(--foreground) / 0.10), 0 0 0 1.5px hsl(var(--foreground) / 0.08)"
            : isHovered
              ? "0 8px 28px -6px hsl(var(--foreground) / 0.14), 0 2px 8px -1px hsl(var(--foreground) / 0.08), 0 0 0 1px hsl(var(--foreground) / 0.06)"
              : "0 2px 12px -2px hsl(var(--foreground) / 0.12), 0 0 0 1px hsl(var(--foreground) / 0.05)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Type badge + field values (single line, never overlaps title) */}
        <div
          className={cn(
            "absolute bottom-2.5 left-4 right-12 flex items-center gap-1.5 z-10 min-w-0 overflow-hidden",
            lifecycleOptions.length > 0 ? "max-h-5" : "max-h-4"
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md cursor-pointer focus:outline-none transition-all duration-200 hover:opacity-80"
                style={{ color: typeColor }}
                title="Change type"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[9px] font-bold uppercase tracking-[0.08em] leading-none opacity-70">
                  {typeLabel}
                </span>
              </button>
            </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-auto p-1.5 bg-card/95 backdrop-blur-md border-border/30 shadow-lg rounded-xl min-w-[140px]"
            align="start"
            side="bottom"
            sideOffset={6}
            onClick={(e) => e.stopPropagation()}
          >
            {availableTypes.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangeType(t.id);
                }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] cursor-pointer",
                  t.id === data.type
                    ? "bg-muted/60 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <span
                  className="w-[6px] h-[6px] rounded-full shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                {t.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
          {lifecycleOptions.length > 0 ? (
            <NodeLifecyclePicker
              layout="inline"
              nodeTypeId={data.type}
              nodeTypes={nodeTypes}
              value={data.lifecycleState}
              onChange={(lifecycleState) => onUpdateNode(nodeId, { lifecycleState })}
            />
          ) : null}
          {fieldsWithValues.length > 0 && node && (
            <span
              className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden shrink"
              aria-label="Field values"
            >
              {fieldsWithValues.map((f) => {
                const value = (node.fields?.[f.key] ?? "").trim();
                const display = formatFieldDisplay(f, value);
                const icon = f.icon?.trim();
                return (
                  <span
                    key={f.key}
                    className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/90 min-w-0 max-w-[90px] shrink overflow-hidden"
                    title={`${f.label}: ${value}`}
                  >
                    {icon ? <span className="shrink-0" aria-hidden>{icon}</span> : null}
                    <span className="truncate">{display}</span>
                  </span>
                );
              })}
            </span>
          )}
        </div>

        {/* Controls: absolutely centered vertically in the node */}
        <div
          className={cn(
            "absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-0 transition-opacity duration-300 z-10",
            isHovered || (hasChildren && !isNodeExpanded)
              ? "opacity-60 hover:opacity-100"
              : "opacity-0"
          )}
        >
          {hasChildren && (
              <button
                type="button"
                onClick={handleToggleExpanded}
                className="p-1 rounded-full text-muted-foreground/60 hover:text-foreground transition-colors duration-150 flex items-center gap-0.5"
                title={isNodeExpanded ? "Collapse" : `Expand (${childCount})`}
              >
                {isNodeExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-[9px] font-medium">{childCount}</span>
                  </>
                )}
              </button>
            )}
            {canHaveChildren && (
              <button
                type="button"
                onClick={handleAddChild}
                className="p-1 rounded-full text-muted-foreground/60 hover:text-foreground transition-colors duration-150"
                title="Add child"
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenDocument}
              className="p-1 rounded-full text-muted-foreground/60 hover:text-foreground transition-colors duration-150"
              title="Open document"
            >
              <FileText className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-1 rounded-full text-muted-foreground/40 hover:text-destructive transition-colors duration-150"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
        </div>

        <div
          className={cn(
            "flex pl-5 pr-12 pt-4 pb-7 min-w-0",
            singleLine ? "items-center" : "items-start"
          )}
        >
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <textarea
                ref={inputRef}
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="w-full bg-transparent text-[14px] leading-[1.6] text-foreground resize-none focus:outline-none placeholder:text-muted-foreground/30 tracking-[-0.01em] overflow-hidden p-0"
                rows={1}
                placeholder="What are you thinking?"
                style={{ minHeight: "22px" }}
              />
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsEditing(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setIsEditing(true);
                }}
                className={cn(
                  "text-[14px] leading-[1.6] cursor-text tracking-[-0.01em] break-words",
                  localTitle ? "text-foreground/85" : "text-muted-foreground/30"
                )}
              >
                {localTitle || "Untitled"}
              </div>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="source"
        className="!w-1.5 !h-1.5 !bg-transparent !border-0 !opacity-0"
      />
    </>
  );
}

export const OntologyNode = memo(OntologyNodeComponent);
