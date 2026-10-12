import { Link } from "react-router-dom";
import { formatDateTime } from "@/domain/spydr/features/shared/components/time";
import type { TaskNode } from "@/domain/spydr/utils/types";

interface TaskStatusContextLineProps {
  task: Pick<TaskNode, "status" | "blockedBy" | "details">;
  variant?: "compact" | "detail";
  onEdit?(): void;
}

export function TaskStatusContextLine({
  task,
  variant = "compact",
  onEdit,
}: TaskStatusContextLineProps) {
  const blockedById = task.blockedBy?.id ?? task.details?.blockedByNodeId ?? null;
  const blockedByTitle = task.blockedBy?.title ?? null;
  const followUpAt = task.details?.followUpAt ?? null;
  const waitingNote = task.details?.waitingNote ?? null;
  const showBlocked = task.status === "blocked" && (variant === "detail" || Boolean(blockedById));
  const showWaiting =
    task.status === "waiting" && (variant === "detail" || Boolean(followUpAt || waitingNote));

  if (!showBlocked && !showWaiting) return null;

  return (
    <p className="min-w-0 truncate text-[11px] text-muted-foreground">
      {showBlocked ? (
        <>
          Blocked by{" "}
          {blockedById ? (
            <Link to={`/tasks/${blockedById}`} className="text-foreground/80 hover:text-highlight">
              {blockedByTitle ?? "task"}
            </Link>
          ) : (
            <span>not set</span>
          )}
        </>
      ) : (
        <>
          {followUpAt ? `Follow up ${formatDateTime(followUpAt)}` : "Waiting"}
          {waitingNote ? ` — ${waitingNote}` : null}
        </>
      )}
      {onEdit ? (
        <>
          {" "}
          <button
            type="button"
            className="text-foreground/80 underline-offset-2 hover:text-highlight hover:underline"
            onClick={onEdit}
          >
            Edit
          </button>
        </>
      ) : null}
    </p>
  );
}
