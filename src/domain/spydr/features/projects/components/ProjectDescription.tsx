import { useEffect, useId, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const DESCRIPTION_PLACEHOLDER =
  "Add context, intent, and what done looks like.";

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
    <div className="project-detail-brief project-detail-panel" ref={editorRef}>
      <div className="project-detail-panel-heading">
        <span id={labelId}>Brief</span>
        {editing ? (
          <button
            type="button"
            className="project-detail-panel-heading-action"
            onClick={() => leaveEdit(true)}
          >
            Done
          </button>
        ) : (
          <button
            type="button"
            className="project-detail-panel-heading-action"
            aria-label="Edit brief"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <textarea
          ref={textareaRef}
          value={value}
          aria-labelledby={labelId}
          placeholder={DESCRIPTION_PLACEHOLDER}
          rows={6}
          className="min-h-[6rem] w-full resize-y border-0 bg-transparent text-[14px] leading-[1.6] text-[var(--fg)] outline-none ring-0 placeholder:text-[var(--muted-2)]"
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
            "flex w-full flex-col items-start text-left text-[14px] leading-[1.6] transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring)/0.3)]",
            value.trim()
              ? "whitespace-pre-wrap break-words text-[var(--fg)]"
              : "text-[var(--muted-2)]"
          )}
          onClick={() => setEditing(true)}
        >
          {value.trim() ? value : DESCRIPTION_PLACEHOLDER}
        </button>
      )}
    </div>
  );
}
