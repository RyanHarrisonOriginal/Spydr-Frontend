import { cn } from "@/lib/utils";
import {
  formatRelativeDue,
  type RelativeDue,
} from "@/domain/spydr/features/work/utils/workGridRows";
import { parseCalendarDate } from "@/domain/spydr/utils/dateOnly";

interface WorkDueDisplayProps {
  value: string | Date | null | undefined;
  /** When true, hide the late relative label (e.g. completed tasks). */
  hideLate?: boolean;
  emptyLabel?: string;
  className?: string;
  now?: Date;
}

export function dueFromValue(
  value: string | Date | null | undefined,
  now = new Date()
): RelativeDue {
  if (value instanceof Date) return formatRelativeDue(value, now);
  if (!value) return formatRelativeDue(null, now);
  const parsed = parseCalendarDate(value) ?? new Date(value);
  if (Number.isNaN(parsed.getTime())) return formatRelativeDue(null, now);
  return formatRelativeDue(parsed, now);
}

/** Relative + absolute due/target cell matching the Work grid visual language. */
export function WorkDueDisplay({
  value,
  hideLate = false,
  emptyLabel = "no date",
  className,
  now,
}: WorkDueDisplayProps) {
  const due = dueFromValue(value, now);
  const showLate = due.overdue && !hideLate;

  if (due.empty) {
    return (
      <span className={cn("work-grid-due-empty", className)}>{emptyLabel}</span>
    );
  }

  return (
    <span className={cn("work-grid-due", className)} title={due.title || undefined}>
      {due.label && (showLate || !due.overdue) ? (
        <span
          className={cn(
            "work-grid-due-relative",
            showLate && "work-grid-due-relative-late"
          )}
        >
          {due.label}
        </span>
      ) : null}
      <span className="work-grid-due-date">{due.dateLabel}</span>
    </span>
  );
}
