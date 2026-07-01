import { GripVertical } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CollectionDragHandleProps extends HTMLAttributes<HTMLButtonElement> {
  enabled?: boolean;
}

export function CollectionDragHandle({
  enabled = true,
  className,
  ...props
}: CollectionDragHandleProps) {
  if (!enabled) return null;

  return (
    <button
      type="button"
      aria-label="Drag to reorder"
      className={cn(
        "inline-flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:cursor-grabbing",
        className
      )}
      {...props}
    >
      <GripVertical className="h-4 w-4" aria-hidden />
    </button>
  );
}
