import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExpandCollapseControlsProps {
  expanded: boolean;
  onExpandAll(): void;
  onCollapseAll(): void;
  disabled?: boolean;
}

export function ExpandCollapseControls({
  expanded,
  onExpandAll,
  onCollapseAll,
  disabled = false,
}: ExpandCollapseControlsProps) {
  return (
    <Button
      type="button"
      variant={expanded ? "secondary" : "outline"}
      size="sm"
      disabled={disabled}
      className="h-8 gap-1.5 px-2.5 font-mono text-[10px] uppercase tracking-wider"
      aria-pressed={expanded}
      aria-label={expanded ? "Collapse all" : "Expand all"}
      onClick={() => (expanded ? onCollapseAll() : onExpandAll())}
    >
      {expanded ? (
        <ChevronsDownUp className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
      )}
      <span className="grid justify-items-center">
        <span className={cn("col-start-1 row-start-1", !expanded && "invisible")}>
          Collapse
        </span>
        <span className={cn("col-start-1 row-start-1", expanded && "invisible")}>
          Expand
        </span>
      </span>
    </Button>
  );
}
