import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { NodeType, NodeTypeId } from "../../utils/types";
import {
  formatLifecycleLabel,
  getLifecycleStateIds,
  lifecycleDotClass,
} from "../../utils/lifecycle";

export interface NodeLifecyclePickerProps {
  nodeTypeId: NodeTypeId;
  nodeTypes: Record<string, NodeType>;
  value: string | null;
  onChange: (next: string | null) => void;
  /** Document panel: labeled, full-width trigger. Canvas: compact chip in the node chrome. */
  layout: "panel" | "inline";
  disabled?: boolean;
}

export function NodeLifecyclePicker({
  nodeTypeId,
  nodeTypes,
  value,
  onChange,
  layout,
  disabled,
}: NodeLifecyclePickerProps) {
  const options = getLifecycleStateIds(nodeTypeId, nodeTypes);
  if (options.length === 0) return null;

  const isKnown = value != null && options.includes(value);
  const labelText =
    value == null
      ? "Set status"
      : isKnown
        ? formatLifecycleLabel(value)
        : formatLifecycleLabel(value);

  const triggerClass =
    layout === "panel"
      ? cn(
          "flex h-8 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 text-left text-sm",
          "hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
          "disabled:opacity-50",
          value == null && "text-muted-foreground"
        )
      : cn(
          "inline-flex max-w-[104px] items-center gap-0.5 rounded-md px-1 py-0.5",
          "text-[9px] font-semibold tracking-wide text-muted-foreground/90",
          "hover:bg-foreground/5 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "min-w-0 shrink-0"
        );

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        disabled={disabled}
        className={triggerClass}
        title="Change status"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {value ? (
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                lifecycleDotClass(value)
              )}
              aria-hidden
            />
          ) : null}
          <span className={cn("truncate", layout === "inline" && "max-w-[72px]")}>
            {labelText}
          </span>
        </span>
        {layout === "panel" ? (
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        ) : (
          <ChevronDown className="h-2.5 w-2.5 shrink-0 opacity-40" aria-hidden />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[10rem] z-[200]"
        onClick={(e) => e.stopPropagation()}
      >
        {options.map((id) => (
          <DropdownMenuItem
            key={id}
            className={cn("flex items-center gap-2", id === value && "bg-accent/60")}
            onClick={() => onChange(id)}
          >
            <span
              className={cn("h-1.5 w-1.5 shrink-0 rounded-full", lifecycleDotClass(id))}
              aria-hidden
            />
            {formatLifecycleLabel(id)}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground" onClick={() => onChange(null)}>
          No status
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (layout === "panel") {
    return (
      <div className="space-y-1.5 min-w-0" onClick={(e) => e.stopPropagation()}>
        <Label className="text-xs font-medium text-foreground">Status</Label>
        {menu}
      </div>
    );
  }

  return (
    <span className="inline-flex min-w-0 shrink-0" onClick={(e) => e.stopPropagation()}>
      {menu}
    </span>
  );
}
