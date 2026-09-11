import { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import {
  TemplateParameterMention,
  createTemplateParameterSuggestion,
} from "./templateParameterSuggestion";
import {
  templatePlainTextToHtml,
  type TemplateParameterOption,
} from "../utils/templateParameters";

interface TemplateParameterizedFieldProps {
  value: string;
  onValueChange(value: string): void;
  parameters: readonly TemplateParameterOption[];
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
}

function isEditorReady(editor: Editor | null): editor is Editor {
  return Boolean(editor && !editor.isDestroyed && editor.schema);
}

function serializeEditorText(editor: Editor): string {
  if (!isEditorReady(editor)) return "";
  return editor.getText({ blockSeparator: "\n" });
}

export function TemplateParameterizedField({
  value,
  onValueChange,
  parameters,
  placeholder = "Type {{ to insert a parameter",
  multiline = false,
  className,
  disabled = false,
  id,
  "aria-label": ariaLabel,
}: TemplateParameterizedFieldProps) {
  const parametersRef = useRef(parameters);
  const onValueChangeRef = useRef(onValueChange);
  parametersRef.current = parameters;
  onValueChangeRef.current = onValueChange;

  const suggestion = useMemo(
    () =>
      createTemplateParameterSuggestion({
        getItems: () => parametersRef.current,
      }),
    []
  );

  const editor = useEditor(
    {
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
          // TipTap only accepts `false` (disable) or options — not `true`.
          hardBreak: multiline ? undefined : false,
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: "is-editor-empty",
        }),
        TemplateParameterMention.configure({
          suggestion,
        }),
      ],
      content: templatePlainTextToHtml(value),
      editable: !disabled,
      onUpdate: ({ editor: current }) => {
        onValueChangeRef.current(serializeEditorText(current));
      },
      editorProps: {
        attributes: {
          role: "textbox",
          "aria-multiline": multiline ? "true" : "false",
          ...(id ? { id } : {}),
          ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
          class: cn(
            "template-param-editor focus:outline-none w-full px-3 py-2 text-sm leading-snug",
            "[&_p]:my-0",
            multiline ? "min-h-[4.5rem] [&_p+p]:mt-1.5" : "min-h-9"
          ),
        },
        handleKeyDown: (_view, event) => {
          if (!multiline && event.key === "Enter") {
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },
    [multiline, suggestion]
  );

  useEffect(() => {
    if (!isEditorReady(editor)) return;
    const current = serializeEditorText(editor);
    if (current === value) return;
    editor.commands.setContent(templatePlainTextToHtml(value), {
      emitUpdate: false,
    });
  }, [editor, value]);

  useEffect(() => {
    if (!isEditorReady(editor)) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        disabled && "opacity-60",
        className
      )}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
