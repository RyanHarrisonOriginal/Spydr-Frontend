import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

function autosizeTextarea(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "0px";
  el.style.height = `${el.scrollHeight}px`;
}

export function TaskTitleInput({
  taskId,
  title,
  disabled,
  onTitleChange,
  className,
}: {
  taskId: string;
  title: string;
  disabled?: boolean;
  onTitleChange?(taskId: string, title: string): void;
  className?: string;
}) {
  const [draft, setDraft] = useState(title);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(title);
  }, [title]);

  useLayoutEffect(() => {
    autosizeTextarea(textareaRef.current);
  }, [draft]);

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === title) {
      setDraft(title);
      return;
    }
    onTitleChange?.(taskId, trimmed);
  };

  if (!onTitleChange) {
    return (
      <Link
        to={`/tasks/${taskId}`}
        className={cn(
          "min-w-0 w-full flex-1 whitespace-normal break-words text-[13px] font-medium leading-snug text-foreground/90 transition-colors hover:text-highlight",
          className
        )}
      >
        {title}
      </Link>
    );
  }

  return (
    <textarea
      ref={textareaRef}
      value={draft}
      rows={1}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          setDraft(title);
          event.currentTarget.blur();
        }
      }}
      onClick={(event) => event.stopPropagation()}
      disabled={disabled}
      aria-label="Task name"
      className={cn(
        "min-w-0 w-full flex-1 resize-none overflow-hidden bg-transparent text-[13px] font-medium leading-snug text-foreground/90 outline-none ring-focus placeholder:text-muted-foreground disabled:opacity-60",
        className
      )}
    />
  );
}
