import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { X, Bold, Italic, List, ListOrdered, Heading1, Heading2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useOntologyFlowContext } from "../context/OntologyFlowContext";
import { getFieldSchema } from "../utils/nodeSchemas";
import type { OntologyNode } from "../utils/types";
import { NodeLifecyclePicker } from "./lifecycle/NodeLifecyclePicker";
import { getLifecycleStateIds } from "../utils/lifecycle";

interface NodeDocumentEditorProps {
  node: OntologyNode | null;
  onClose: () => void;
  onSaveNotes: (nodeId: string, notes: string) => void;
}

export function NodeDocumentEditor({ node, onClose, onSaveNotes }: NodeDocumentEditorProps) {
  const { nodeTypes, onUpdateNode } = useOntologyFlowContext();
  const fieldSchema = node ? getFieldSchema(node.type, nodeTypes) : [];
  const lifecycleOptions = node
    ? getLifecycleStateIds(node.type, nodeTypes)
    : [];
  const editor = useEditor({
    extensions: [StarterKit],
    content: node?.notes ?? "",
    onUpdate: ({ editor }) => {
      if (node) onSaveNotes(node.id, editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[180px] px-4 py-4 text-foreground leading-relaxed [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold",
      },
    },
  }, [node?.id]);

  useEffect(() => {
    if (node && editor) {
      editor.commands.setContent(node.notes ?? "", { emitUpdate: false });
    }
  }, [node?.id, node?.notes, editor]);

  if (!node) {
    return (
      <div className="h-full flex items-center justify-center bg-card/50">
        <p className="text-sm text-muted-foreground">
          Select a node to edit its document
        </p>
      </div>
    );
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="h-full w-full min-w-0 flex flex-col panel overflow-hidden bg-card">
      {/* Header: compact, title prominent */}
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border min-w-0 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="label-caps shrink-0">Document</span>
          <span className="text-sm font-semibold text-foreground min-w-0 break-words">
            {node.title || "Untitled"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
          onClick={onClose}
          title="Close editor"
        >
          <X className="h-4 w-4" />
        </Button>
      </header>

      {lifecycleOptions.length > 0 ? (
        <section className="px-4 py-3 border-b border-border bg-muted/20 min-w-0 shrink-0">
          <NodeLifecyclePicker
            layout="panel"
            nodeTypeId={node.type}
            nodeTypes={nodeTypes}
            value={node.lifecycleState}
            onChange={(lifecycleState) => onUpdateNode(node.id, { lifecycleState })}
          />
        </section>
      ) : null}

      {/* Fields: single column so date picker and inputs stay legible in narrow panel */}
      {fieldSchema.length > 0 && (
        <section className="px-4 py-3 border-b border-border bg-muted/30 min-w-0 shrink-0 overflow-x-auto overflow-y-visible">
          <span className="label-caps block mb-2">Fields</span>
          <div className="flex flex-col gap-2.5 min-w-0">
            {fieldSchema.map((f) => (
              <div key={f.key} className="space-y-1 min-w-0 w-full">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  {f.icon?.trim() ? (
                    <span className="text-sm leading-none shrink-0" aria-hidden>{f.icon.trim()}</span>
                  ) : null}
                  <span className="truncate">{f.label}</span>
                </Label>
                {f.type === "date" ? (
                  <Input
                    type="date"
                    value={node?.fields?.[f.key] ?? ""}
                    onChange={(e) =>
                      node &&
                      onUpdateNode(node.id, {
                        fields: { ...node.fields, [f.key]: e.target.value },
                      })
                    }
                    className="h-8 text-sm bg-background border-border w-full min-w-[160px] max-w-full"
                  />
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : "text"}
                    value={node?.fields?.[f.key] ?? ""}
                    onChange={(e) =>
                      node &&
                      onUpdateNode(node.id, {
                        fields: { ...node.fields, [f.key]: e.target.value },
                      })
                    }
                    placeholder={f.label}
                    className="h-8 text-sm bg-background border-border w-full min-w-0"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formatting toolbar: grouped, compact */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/20 min-w-0 shrink-0">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-4 bg-border mx-1.5" aria-hidden />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor?.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor?.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-4 bg-border mx-1.5" aria-hidden />
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          isActive={editor?.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor: fills space, readable content area */}
      <div className="flex-1 min-w-0 min-h-0 overflow-auto">
        <div className="h-full min-w-0 w-full [&_.ProseMirror]:min-w-0 [&_.ProseMirror]:max-w-full">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
    </div>
  );
}
