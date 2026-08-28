import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandCollapseControlsProps {
  onExpandAll(): void;
  onCollapseAll(): void;
  disabled?: boolean;
}

export function ExpandCollapseControls({
  onExpandAll,
  onCollapseAll,
  disabled = false,
}: ExpandCollapseControlsProps) {
  return (
    <div
      role="group"
      aria-label="Project rows"
      className="inline-flex h-7 items-center rounded-sm border border-border bg-muted/25 p-0.5"
    >
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "inline-flex h-6 items-center gap-1 rounded-sm px-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        )}
        onClick={onExpandAll}
      >
        <ChevronsUpDown className="h-3 w-3" />
        Expand
      </button>
      <button
        type="button"
        disabled={disabled}
        className="inline-flex h-6 items-center gap-1 rounded-sm px-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        onClick={onCollapseAll}
      >
        <ChevronsDownUp className="h-3 w-3" />
        Collapse
      </button>
    </div>
  );
}
