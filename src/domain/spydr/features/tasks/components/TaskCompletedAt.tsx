import {
  formatDateTime,
  formatRelativeTime,
} from "@/domain/spydr/features/shared/components/time";
import { cn } from "@/lib/utils";

interface TaskCompletedAtProps {
  status: string;
  completedAt?: string | null;
  className?: string;
}

/** Completed date/time — only renders when the task is completed. */
export function TaskCompletedAt({
  status,
  completedAt,
  className,
}: TaskCompletedAtProps) {
  if (status !== "completed" || !completedAt) return null;

  const label = formatDateTime(completedAt);

  return (
    <span
      className={cn(
        "shrink-0 font-mono text-[10px] text-muted-foreground",
        className
      )}
      title={`Completed ${formatRelativeTime(completedAt)}`}
    >
      {label}
    </span>
  );
}

export function formatTaskListTimestamp(task: {
  status: string;
  updatedAt: string;
  details?: { completedAt?: string | null } | null;
}): { label: string; value: string } {
  if (task.status === "completed" && task.details?.completedAt) {
    return {
      label: "Completed",
      value: formatDateTime(task.details.completedAt),
    };
  }

  return {
    label: "Updated",
    value: formatRelativeTime(task.updatedAt),
  };
}
