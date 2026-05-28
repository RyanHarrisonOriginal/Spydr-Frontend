import type { TaskGroup } from "../hooks/useTasksPage";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { formatShortDate } from "@/domain/spydr/features/shared/components/time";

interface TaskGroupsProps {
  groups: TaskGroup[];
}

export function TaskGroups({ groups }: TaskGroupsProps) {
  return (
    <div>
      {groups.map((group) => (
        <section key={group.status}>
          <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-6 py-2">
            <StatusDot status={group.status} />
            <span className="text-[12px] font-semibold capitalize">{group.label}</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {group.tasks.length}
            </span>
          </div>
          <ul className="divide-y divide-border">
            {group.tasks.map((task) => (
              <li
                key={task.id}
                className="grid grid-cols-[20px_1fr_auto_auto_auto] items-center gap-4 px-6 py-2.5 row-hover"
              >
                <input
                  readOnly
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-primary"
                  checked={task.status === "completed"}
                  aria-label={`${task.title} completed`}
                />
                <div className="min-w-0">
                  <p className="truncate text-[13px]">{task.title}</p>
                  {task.body && (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {task.body}
                    </p>
                  )}
                </div>
                <span className="hidden rounded bg-muted/60 px-1.5 py-px font-mono text-[10px] uppercase text-muted-foreground sm:inline">
                  {task.priority}
                </span>
                <span>
                  {task.details?.isBlocked && (
                    <span className="rounded border border-[hsl(var(--status-blocked)/0.35)] bg-[hsl(var(--status-blocked)/0.08)] px-1.5 py-px font-mono text-[10px] uppercase text-[hsl(var(--status-blocked))]">
                      blocked
                    </span>
                  )}
                </span>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {formatShortDate(task.details?.dueDate)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
