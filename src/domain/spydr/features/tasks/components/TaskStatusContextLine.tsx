import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cleanPersonName } from "@/domain/spydr/utils/projectPersonas";
import { parseCalendarDate } from "@/domain/spydr/utils/dateOnly";
import type { TaskNode } from "@/domain/spydr/utils/types";

interface TaskStatusContextLineProps {
  task: Pick<TaskNode, "status" | "blockedBy" | "details">;
  variant?: "compact" | "detail";
  onEdit?(): void;
  /** Waiting tasks: open follow-up reschedule flow. */
  onReschedule?(): void;
  className?: string;
}

function formatFollowUpLabel(value: string): string {
  const date = parseCalendarDate(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "MMM d").toLowerCase();
}

function isFollowUpPast(value: string, now = new Date()): boolean {
  const date = parseCalendarDate(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return day.getTime() < today.getTime();
}

export function TaskStatusContextLine({
  task,
  variant = "compact",
  onEdit,
  onReschedule,
  className,
}: TaskStatusContextLineProps) {
  const blockedById = task.blockedBy?.id ?? task.details?.blockedByNodeId ?? null;
  const blockedByTitle = task.blockedBy?.title
    ? cleanPersonName(task.blockedBy.title)
    : null;
  const followUpAt = task.details?.followUpAt ?? null;
  const waitingNote = task.details?.waitingNote ?? null;
  const showBlocked =
    task.status === "blocked" && (variant === "detail" || Boolean(blockedById));
  const showWaiting =
    task.status === "waiting" &&
    (variant === "detail" || Boolean(followUpAt || waitingNote));

  if (!showBlocked && !showWaiting) return null;

  return (
    <p className={className ?? "min-w-0 text-[12px] text-[var(--muted)]"}>
      {showBlocked ? (
        <>
          blocked by{" "}
          {blockedById ? (
            <Link
              to={`/tasks/${blockedById}`}
              className="text-[var(--fg-soft)] hover:text-[var(--fg)]"
            >
              {blockedByTitle || "task"}
            </Link>
          ) : (
            <span>not set</span>
          )}
        </>
      ) : followUpAt ? (
        isFollowUpPast(followUpAt) ? (
          <>
            follow-up was {formatFollowUpLabel(followUpAt)}
            {onReschedule ? (
              <>
                {" · "}
                <button
                  type="button"
                  className="text-[var(--fg-soft)] hover:text-[var(--fg)]"
                  onClick={onReschedule}
                >
                  reschedule
                </button>
              </>
            ) : null}
          </>
        ) : (
          <>follow-up {formatFollowUpLabel(followUpAt)}</>
        )
      ) : (
        <>Waiting{waitingNote ? ` — ${waitingNote}` : null}</>
      )}
      {onEdit && !onReschedule ? (
        <>
          {" "}
          <button
            type="button"
            className="text-[var(--fg-soft)] hover:text-[var(--fg)]"
            onClick={onEdit}
          >
            Edit
          </button>
        </>
      ) : null}
    </p>
  );
}
