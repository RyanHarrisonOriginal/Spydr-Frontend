import { cn } from "@/lib/utils";

/** Final status palette: active teal, blocked danger, waiting warn, done gray, else neutral. */
const statusColors: Record<string, string> = {
  active: "bg-[var(--active)]",
  waiting: "bg-[var(--warn)]",
  blocked: "bg-[var(--danger)]",
  completed: "bg-[#4A5058]",
  inactive: "bg-[#5C626B]",
  snoozed: "bg-[#5C626B]",
  archived: "bg-[#5C626B]",
};

const priorityColors: Record<string, string> = {
  critical:
    "border-[hsl(var(--priority-critical)/0.12)] bg-[hsl(var(--priority-critical)/0.08)] text-[hsl(var(--priority-critical))]",
  high:
    "border-[hsl(var(--priority-high)/0.12)] bg-[hsl(var(--priority-high)/0.08)] text-[hsl(var(--priority-high))]",
  medium:
    "border-[hsl(var(--priority-medium)/0.12)] bg-[hsl(var(--priority-medium)/0.08)] text-[hsl(var(--priority-medium))]",
  low:
    "border-[hsl(var(--priority-low)/0.12)] bg-[hsl(var(--priority-low)/0.08)] text-[hsl(var(--priority-low))]",
};

export function StatusDot({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      data-status={status}
      className={cn("dot", statusColors[status] ?? "bg-[#5C626B]", className)}
    />
  );
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-border/20 bg-muted/20 px-1.5 py-px text-[11px] capitalize text-muted-foreground">
      <StatusDot status={status} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-px font-mono text-[10px] uppercase tracking-wider",
        priorityColors[priority] ?? "border-border/20 text-muted-foreground",
        className
      )}
    >
      {priority}
    </span>
  );
}

export function EntityTag({ tag }: { tag: string }) {
  return (
    <span className="rounded bg-muted/60 px-1.5 py-px font-mono text-[10px] uppercase">
      {tag}
    </span>
  );
}
