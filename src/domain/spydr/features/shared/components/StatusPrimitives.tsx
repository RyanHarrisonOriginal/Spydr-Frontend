import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  active: "bg-[hsl(var(--status-active))]",
  inactive: "bg-[hsl(var(--status-todo))]",
  waiting: "bg-[hsl(var(--status-doing))]",
  snoozed: "bg-[hsl(var(--status-doing))]",
  completed: "bg-[hsl(var(--status-done))]",
  archived: "bg-[hsl(var(--status-todo))]",
  blocked: "bg-[hsl(var(--status-blocked))]",
};

const priorityColors: Record<string, string> = {
  critical:
    "border-[hsl(var(--priority-critical)/0.35)] bg-[hsl(var(--priority-critical)/0.08)] text-[hsl(var(--priority-critical))]",
  high:
    "border-[hsl(var(--priority-high)/0.35)] bg-[hsl(var(--priority-high)/0.08)] text-[hsl(var(--priority-high))]",
  medium:
    "border-[hsl(var(--priority-medium)/0.35)] bg-[hsl(var(--priority-medium)/0.08)] text-[hsl(var(--priority-medium))]",
  low:
    "border-[hsl(var(--priority-low)/0.35)] bg-[hsl(var(--priority-low)/0.08)] text-[hsl(var(--priority-low))]",
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
      className={cn("dot", statusColors[status] ?? "bg-muted-foreground", className)}
    />
  );
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted/40 px-1.5 py-px text-[11px] capitalize text-foreground/80">
      <StatusDot status={status} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-px font-mono text-[10px] uppercase tracking-wider",
        priorityColors[priority] ?? "border-border text-muted-foreground"
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
