import { Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface InlineDeleteButtonProps {
  label: string;
  isDeleting?: boolean;
  disabled?: boolean;
  onDelete(): void;
}

export function InlineDeleteButton({
  label,
  isDeleting = false,
  disabled = false,
  onDelete,
}: InlineDeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isConfirming) return;
    const timer = window.setTimeout(() => setIsConfirming(false), 5000);
    return () => window.clearTimeout(timer);
  }, [isConfirming]);

  if (isConfirming) {
    return (
      <div className="flex items-center justify-end gap-0.5">
        <button
          type="button"
          disabled={isDeleting}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onDelete();
          }}
          className="rounded px-1.5 py-1 text-[10px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          {isDeleting ? "…" : "Delete"}
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsConfirming(false);
          }}
          aria-label="Cancel delete"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsConfirming(true);
      }}
      aria-label={`Delete ${label}`}
      className="ml-auto rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
