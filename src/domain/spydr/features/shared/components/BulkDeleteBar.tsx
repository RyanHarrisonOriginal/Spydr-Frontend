import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkDeleteBarProps {
  count: number;
  noun: string;
  isDeleting?: boolean;
  disabled?: boolean;
  className?: string;
  onDelete(): void;
  onClear(): void;
}

export function BulkDeleteBar({
  count,
  noun,
  isDeleting = false,
  disabled = false,
  className,
  onDelete,
  onClear,
}: BulkDeleteBarProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isConfirming) return;
    const timer = window.setTimeout(() => setIsConfirming(false), 5000);
    return () => window.clearTimeout(timer);
  }, [isConfirming]);

  useEffect(() => {
    setIsConfirming(false);
  }, [count]);

  if (count === 0) return null;

  const pluralNoun = count === 1 ? noun : `${noun}s`;

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 font-mono text-[10px]",
        className
      )}
    >
      <span className="tabular-nums text-foreground/80">
        {count} selected
      </span>
      {isConfirming ? (
        <>
          <button
            type="button"
            disabled={isDeleting || disabled}
            onClick={onDelete}
            className="rounded px-1.5 py-0.5 font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : `Delete ${count} ${pluralNoun}`}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => setIsConfirming(false)}
            aria-label="Cancel bulk delete"
            className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            disabled={isDeleting || disabled}
            onClick={() => setIsConfirming(true)}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" />
            Delete selected
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClear}
            className="rounded px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}
