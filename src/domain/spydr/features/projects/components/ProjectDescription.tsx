import { useEffect, useId, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const DESCRIPTION_PLACEHOLDER =
  "Brief — context, intent, and what done looks like.";

interface ProjectDescriptionProps {
  value: string;
  onChange(value: string): void;
}

export function ProjectDescription({ value, onChange }: ProjectDescriptionProps) {
  const labelId = useId();
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayRef = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) return;
    const field = textareaRef.current;
    if (!field) return;
    field.focus();
    const end = field.value.length;
    field.setSelectionRange(end, end);
  }, [editing]);

  const leaveEdit = (restoreFocus: boolean) => {
    setEditing(false);
    if (restoreFocus) {
      requestAnimationFrame(() => displayRef.current?.focus());
    }
  };

  return (
    <div className="min-w-0" ref={editorRef}>
      <div className="mb-1.5 flex items-center gap-2 px-1">
        <span
          id={labelId}
          className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        >
          Description
        </span>
        {editing ? (
          <button
            type="button"
            className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => leaveEdit(true)}
          >
            Done
          </button>
        ) : (
          <button
            type="button"
            className="ml-auto rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Edit description"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>

      {editing ? (
        <textarea
          ref={textareaRef}
          value={value}
          aria-labelledby={labelId}
          placeholder={DESCRIPTION_PLACEHOLDER}
          rows={8}
          className="spydr-strand-field min-h-[10rem] w-full resize-y border-0 bg-transparent px-1 py-2 text-[14px] leading-relaxed outline-none ring-0 placeholder:text-muted-foreground"
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event) => {
            const next = event.relatedTarget;
            if (next instanceof Node && editorRef.current?.contains(next)) return;
            leaveEdit(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              leaveEdit(true);
            }
          }}
        />
      ) : (
        <button
          ref={displayRef}
          type="button"
          className={cn(
            "flex min-h-[4.75rem] w-full flex-col items-start rounded-sm px-1 py-2 text-left text-[14px] leading-relaxed transition-colors",
            "hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
            value.trim()
              ? "whitespace-pre-wrap break-words text-foreground/90"
              : "text-muted-foreground"
          )}
          onClick={() => setEditing(true)}
        >
          {value.trim() ? value : DESCRIPTION_PLACEHOLDER}
        </button>
      )}
    </div>
  );
}
