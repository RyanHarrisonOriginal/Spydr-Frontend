import { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import { useActiveNoteMentionCatalog } from "../hooks/useActiveNoteMentionCatalog";
import {
  ActiveNoteMention,
  createActiveNoteMentionSuggestion,
} from "../utils/activeNoteMentionSuggestion";
import { activeNotePlainTextToHtml } from "../utils/activeNoteMentions";

interface ActiveNoteEditorProps {
  value: string;
  onValueChange(value: string): void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
}

function isEditorReady(editor: Editor | null): editor is Editor {
  return Boolean(editor && !editor.isDestroyed && editor.schema);
}

function serializeEditorText(editor: Editor): string {
  if (!isEditorReady(editor)) return "";
  return editor.getText({ blockSeparator: "\n" });
}

export function ActiveNoteEditor({
  value,
  onValueChange,
  placeholder = "Write what happened…",
  className,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: ActiveNoteEditorProps) {
  const { items: catalog, isLoading } = useActiveNoteMentionCatalog();
  const catalogRef = useRef(catalog);
  const loadingRef = useRef(isLoading);
  const onValueChangeRef = useRef(onValueChange);
  catalogRef.current = catalog;
  loadingRef.current = isLoading;
  onValueChangeRef.current = onValueChange;

  const suggestion = useMemo(
    () =>
      createActiveNoteMentionSuggestion({
        getItems: () => catalogRef.current,
        getIsLoading: () => loadingRef.current,
      }),
    []
  );

  const editable = !disabled && !readOnly;

  const editor = useEditor(
    {
      // Avoid creating the editor during the first render pass (Strict Mode /
      // remounts can otherwise call getText while schema is already null).
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: false,
          bulletList: false,
          orderedList: false,
          blockquote: false,
          codeBlock: false,
          horizontalRule: false,
          listItem: false,
          code: false,
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: "is-editor-empty",
        }),
        ActiveNoteMention.configure({
          suggestion,
        }),
      ],
      content: activeNotePlainTextToHtml(value),
      editable,
      autofocus: autoFocus ? "end" : false,
      onUpdate: ({ editor: current }) => {
        onValueChangeRef.current(serializeEditorText(current));
      },
      editorProps: {
        attributes: {
          role: "textbox",
          "aria-multiline": "true",
          ...(id ? { id } : {}),
          ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
          ...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {}),
          ...(ariaInvalid != null
            ? { "aria-invalid": String(ariaInvalid) }
            : {}),
          ...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {}),
          class: cn(
            "active-note-editor focus:outline-none min-h-[inherit] px-3 py-2.5 text-[15px] leading-relaxed",
            "[&_p]:my-0 [&_p+p]:mt-2"
          ),
        },
      },
    },
    []
  );

  useEffect(() => {
    if (!isEditorReady(editor)) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!isEditorReady(editor)) return;
    const current = serializeEditorText(editor);
    if (current === value) return;
    editor.commands.setContent(activeNotePlainTextToHtml(value), {
      emitUpdate: false,
    });
  }, [editor, value]);

  if (!isEditorReady(editor)) {
    return (
      <div
        className={cn(
          "rounded-md border border-input bg-background",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-input bg-background ring-focus focus-within:border-highlight/40",
        (disabled || readOnly) && "opacity-80",
        className
      )}
    >
      <EditorContent editor={editor} className="h-full min-h-[inherit]" />
    </div>
  );
}
