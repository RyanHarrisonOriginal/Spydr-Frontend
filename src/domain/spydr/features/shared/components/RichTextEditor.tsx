import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import { isRichTextEmpty, toRenderableHtml } from "@/domain/spydr/utils/richText";

const editorContentClassName =
  "spydr-rich-text focus:outline-none min-h-[4.5rem] px-3 py-2.5 text-[13px] leading-relaxed [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold";

interface RichTextEditorProps {
  value: string;
  onChange(value: string): void;
  placeholder?: string;
  className?: string;
  editorKey?: string | number;
  minHeightClassName?: string;
  quiet?: boolean;
}

function ToolbarButton({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your note…",
  className,
  editorKey,
  minHeightClassName = "min-h-[4.5rem]",
  quiet = false,
}: RichTextEditorProps) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder,
          emptyEditorClass: "is-editor-empty",
        }),
      ],
      immediatelyRender: false,
      content: toRenderableHtml(value || ""),
      onUpdate: ({ editor: currentEditor }) => {
        onChange(currentEditor.getHTML());
      },
      editorProps: {
        attributes: {
          class: cn(
            editorContentClassName,
            minHeightClassName,
            quiet && "px-2.5 py-2"
          ),
        },
      },
    },
    [editorKey]
  );

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = toRenderableHtml(value || "");
    if (isRichTextEmpty(current) && isRichTextEmpty(next)) return;
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value, editorKey]);

  if (!editor) {
    return (
      <div
        className={cn(
        quiet
          ? cn("spydr-strand-field bg-muted/30", minHeightClassName)
          : "rounded-lg border border-input bg-background",
          !quiet && minHeightClassName,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        quiet
          ? "spydr-strand-field overflow-hidden rounded-sm bg-muted/30 focus-within:bg-muted/40"
          : "overflow-hidden rounded-lg border border-input bg-background ring-focus focus-within:border-highlight/40",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-0.5 py-1",
          quiet ? "px-2" : "border-b border-border/70 bg-muted/20 px-2"
        )}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        {quiet ? null : <div className="mx-1 h-4 w-px bg-border" aria-hidden />}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
