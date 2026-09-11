import { ChevronDown, ChevronUp } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { CollectionDragHandle } from "./CollectionDragHandle";

interface CollectionReorderControlsProps {
  dragHandleProps?: Record<string, unknown>;
  /** When false, only up/down arrows are shown (e.g. phone where drag is off). */
  showDragHandle?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp(): void;
  onMoveDown(): void;
  className?: string;
}

export function CollectionReorderControls({
  dragHandleProps,
  showDragHandle = true,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  className,
}: CollectionReorderControlsProps) {
  return (
    <div className={cn("flex shrink-0 items-center gap-0.5", className)}>
      {showDragHandle && dragHandleProps ? (
        <CollectionDragHandle {...(dragHandleProps as HTMLAttributes<HTMLButtonElement>)} />
      ) : null}
      <div
        className="flex flex-col gap-px"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Move up"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          className={cn(
            "inline-flex h-3.5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors",
            "hover:bg-primary/10 hover:text-primary",
            "disabled:pointer-events-none disabled:opacity-30"
          )}
        >
          <ChevronUp className="h-3 w-3" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Move down"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          className={cn(
            "inline-flex h-3.5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors",
            "hover:bg-primary/10 hover:text-primary",
            "disabled:pointer-events-none disabled:opacity-30"
          )}
        >
          <ChevronDown className="h-3 w-3" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** Grid/list column width when drag handle + rank arrows are shown. */
export const COLLECTION_REORDER_COLUMN = "52px";
