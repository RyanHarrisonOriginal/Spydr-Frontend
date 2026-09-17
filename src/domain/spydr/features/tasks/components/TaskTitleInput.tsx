import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    setDraft(title);
  }, [title]);

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
          "min-w-0 truncate text-[13px] font-medium text-foreground/90 transition-colors hover:text-highlight",
          className
        )}
      >
        {title}
      </Link>
    );
  }

  return (
    <input
      value={draft}
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
        "min-w-0 flex-1 truncate bg-transparent text-[13px] font-medium text-foreground/90 outline-none ring-focus placeholder:text-muted-foreground disabled:opacity-60",
        className
      )}
    />
  );
}
