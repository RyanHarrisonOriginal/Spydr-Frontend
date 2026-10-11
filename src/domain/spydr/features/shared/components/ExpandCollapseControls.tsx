import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className="h-8 gap-1.5 px-2.5 font-mono text-micro uppercase tracking-wider"
      aria-pressed={expanded}
      aria-label={expanded ? "Collapse all" : "Expand all"}
      onClick={() => (expanded ? onCollapseAll() : onExpandAll())}
    >
      {expanded ? (
        <ChevronsDownUp className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
      )}
      <span>{expanded ? "Collapse" : "Expand"}</span>
    </Button>
  );
}
