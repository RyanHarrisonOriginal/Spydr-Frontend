import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RowExpandToggleProps {
  expanded: boolean;
  onToggle(): void;
  expandLabel?: string;
  collapseLabel?: string;
  className?: string;
}

export function RowExpandToggle({
  expanded,
  onToggle,
  expandLabel = "Expand tasks",
  collapseLabel = "Collapse tasks",
  className,
}: RowExpandToggleProps) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-label={expanded ? collapseLabel : expandLabel}
      className={cn(
        "grid h-7 w-7 shrink-0 place-items-center rounded-sm border transition-colors",
        expanded
          ? "border-highlight/50 bg-highlight/15 text-highlight"
          : "border-border bg-muted/40 text-foreground/85 hover:border-highlight/40 hover:bg-highlight/10 hover:text-highlight",
        className
      )}
      onClick={onToggle}
    >
      <ChevronRight
        className={cn(
          "h-3.5 w-3.5 transition-transform duration-200",
          expanded && "rotate-90"
        )}
        strokeWidth={2.5}
        aria-hidden
      />
    </button>
  );
}
