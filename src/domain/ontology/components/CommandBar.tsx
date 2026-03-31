import { useState, useMemo } from "react";
import {
  Plus,
  Settings,
  ChevronUp,
  ChevronDown,
  Trash2,
  FileText,
  CornerRightDown,
  IndentIncrease,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOntologyFlowContext } from "../context/OntologyFlowContext";
import {
  getTypeColor,
  getTypeLabel,
  getAllowedChildren,
} from "../utils/nodeSchemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NodeTypeModal } from "./NodeTypeModal";

function ActionButton({
  onClick,
  title,
  children,
  disabled = false,
  variant = "default",
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "default" | "add" | "move" | "delete" | "doc";
}) {
  const colorClasses = {
    default: "text-muted-foreground hover:text-foreground hover:bg-muted",
    add: "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10",
    move: "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10",
    delete: "text-destructive hover:bg-destructive/10",
    doc: "text-blue-600 dark:text-blue-400 hover:bg-blue-500/10",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-9 w-9 inline-flex items-center justify-center rounded-lg transition-all duration-150",
        disabled
          ? "text-muted-foreground/30 cursor-not-allowed"
          : colorClasses[variant]
      )}
      title={title}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border/60" />;
}

export function CommandBar() {
  const {
    nodes,
    nodeTypes,
    selectedNodePayload,
    onCreateNode,
    onDeleteNode,
    onOpenEditor,
    onMoveNodeUp,
    onMoveNodeDown,
    onIndent,
  } = useOntologyFlowContext();

  const [showTypeModal, setShowTypeModal] = useState(false);
  const totalNodes = Object.keys(nodes).length;

  // Root types: allowedParents includes null or "null" (API/DB may use string)
  const rootTypes = useMemo(
    () =>
      Object.values(nodeTypes).filter((nt) => {
        const parents = nt.allowedParents ?? [];
        return parents.includes(null) || parents.includes("null");
      }),
    [nodeTypes]
  );

  const handleCreateNode = (typeId: string) => {
    onCreateNode(typeId, null, {
      x: 200 + Math.random() * 300,
      y: 150 + Math.random() * 200,
    });
  };

  const handleAddChild = () => {
    if (!selectedNodePayload) return;
    const node = nodes[selectedNodePayload.nodeId];
    if (!node) return;
    const allowed = getAllowedChildren(node.type, nodeTypes);
    const childType = allowed[0] ?? "thought";
    onCreateNode(childType, node.id, {
      x: node.position.x,
      y: node.position.y + 120,
    });
  };

  const handleAddSibling = () => {
    if (!selectedNodePayload) return;
    const node = nodes[selectedNodePayload.nodeId];
    if (!node) return;
    onCreateNode(node.type, node.parentId, undefined);
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 bg-card/80 backdrop-blur-md border border-border/30 rounded-2xl shadow-md transition-opacity duration-500",
          selectedNodePayload ? "opacity-100" : "opacity-50 hover:opacity-100"
        )}
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Layers className="h-3.5 w-3.5" />
          <span>{totalNodes}</span>
        </div>
        <Divider />
        <ActionButton
          onClick={() => setShowTypeModal(true)}
          title="Manage types"
          variant="default"
        >
          <Settings className="h-4 w-4" />
        </ActionButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-9 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              title="Create new node"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-popover border-border min-w-[160px]"
            align="center"
          >
            {rootTypes.map((nt) => (
              <DropdownMenuItem
                key={nt.id}
                onClick={() => handleCreateNode(nt.id)}
                className="text-sm"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full mr-2 shrink-0"
                  style={{ backgroundColor: getTypeColor(nt.id, nodeTypes) }}
                />
                {getTypeLabel(nt.id, nodeTypes)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {selectedNodePayload && (
          <>
            <Divider />
            {selectedNodePayload.canHaveChildren && (
              <ActionButton
                onClick={handleAddChild}
                title="Add child"
                variant="add"
              >
                <CornerRightDown className="h-4 w-4" />
              </ActionButton>
            )}
            <ActionButton
              onClick={handleAddSibling}
              title="Add sibling"
              variant="add"
            >
              <Plus className="h-4 w-4" />
            </ActionButton>
            <Divider />
            <ActionButton
              onClick={() => onMoveNodeUp(selectedNodePayload.nodeId)}
              title="Move up"
              disabled={!selectedNodePayload.canMoveUp}
              variant="move"
            >
              <ChevronUp className="h-4 w-4" />
            </ActionButton>
            <ActionButton
              onClick={() => onMoveNodeDown(selectedNodePayload.nodeId)}
              title="Move down"
              disabled={!selectedNodePayload.canMoveDown}
              variant="move"
            >
              <ChevronDown className="h-4 w-4" />
            </ActionButton>
            <ActionButton
              onClick={() => onIndent(selectedNodePayload.nodeId)}
              title="Indent"
              disabled={!selectedNodePayload.canIndent}
              variant="move"
            >
              <IndentIncrease className="h-4 w-4" />
            </ActionButton>
            <Divider />
            <ActionButton
              onClick={() => onOpenEditor(selectedNodePayload.nodeId)}
              title="Open document"
              variant="doc"
            >
              <FileText className="h-4 w-4" />
            </ActionButton>
            <Divider />
            <ActionButton
              onClick={() => onDeleteNode(selectedNodePayload.nodeId)}
              title="Delete"
              variant="delete"
            >
              <Trash2 className="h-4 w-4" />
            </ActionButton>
          </>
        )}
      </div>

      <NodeTypeModal open={showTypeModal} onOpenChange={setShowTypeModal} />
    </>
  );
}
