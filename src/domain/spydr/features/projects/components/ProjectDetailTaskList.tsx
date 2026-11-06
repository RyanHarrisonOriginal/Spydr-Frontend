import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowUpRight, Check, MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PersonAvatar } from "@/domain/spydr/features/people/components/PersonIdentity";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { WorkDueDisplay } from "@/domain/spydr/features/work/components/WorkDueDisplay";
import { TaskDueDateSelect } from "@/domain/spydr/features/tasks/components/TaskDueDateSelect";
import { TaskStatusContextDialog } from "@/domain/spydr/features/tasks/components/TaskStatusContextDialog";
import { TaskStatusContextLine } from "@/domain/spydr/features/tasks/components/TaskStatusContextLine";
import { useEnsureTaskDueWithinProject } from "@/domain/spydr/features/tasks/hooks/useEnsureTaskDueWithinProject";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import { parseCalendarDate } from "@/domain/spydr/utils/dateOnly";
import { cleanDisplayName, formatPerson } from "@/domain/spydr/utils/projectPersonas";
import {
  isTaskStatus,
  taskStatusLabels,
  toTaskStatusPatch,
  type TaskStatus,
  type TaskStatusChange,
} from "@/domain/spydr/utils/taskStatus";
import type {
  PersonNode,
  ProjectDetailNode,
  TaskNode,
  UpdateProjectChildInput,
} from "@/domain/spydr/utils/types";
import type { ProjectTaskFormValues } from "../hooks/useProjectDetailPage";
import { ProjectDetailInlineError } from "./ProjectDetailSection";
import { cn } from "@/lib/utils";

interface ProjectDetailTaskListProps {
  project: ProjectDetailNode;
  people: PersonNode[];
  taskForm: ProjectTaskFormValues;
  canAddTask: boolean;
  isAddingTask: boolean;
  taskError: string | null;
  isUpdatingChild: boolean;
  deletingChildIds: string[];
  onTaskFieldChange<TField extends keyof ProjectTaskFormValues>(
    field: TField,
    value: ProjectTaskFormValues[TField]
  ): void;
  onAddTask(): void;
  onUpdateChild(childId: string, input: UpdateProjectChildInput): void;
  onDeleteChild(childId: string): void;
}

type ContextDialogState = {
  task: TaskNode;
  status: Extract<TaskStatus, "blocked" | "waiting">;
};

function doneLabel(task: TaskNode): string | null {
  if (!isClosedCollectionStatus(task.status)) return null;
  const raw = task.details?.completedAt;
  if (!raw) return "done";
  const date = parseCalendarDate(raw) ?? new Date(raw);
  if (Number.isNaN(date.getTime())) return "done";
  return `done ${format(date, "MMM d").toLowerCase()}`;
}

function sortTasks(tasks: TaskNode[]): TaskNode[] {
  return [...tasks].sort((left, right) => {
    const leftDone = isClosedCollectionStatus(left.status) ? 1 : 0;
    const rightDone = isClosedCollectionStatus(right.status) ? 1 : 0;
    return leftDone - rightDone;
  });
}

export function ProjectDetailTaskList({
  project,
  people,
  taskForm,
  canAddTask,
  isAddingTask,
  taskError,
  isUpdatingChild,
  deletingChildIds,
  onTaskFieldChange,
  onAddTask,
  onUpdateChild,
  onDeleteChild,
}: ProjectDetailTaskListProps) {
  const dueGuard = useEnsureTaskDueWithinProject();
  const { currentUserPersonId } = useCurrentUserPerson();
  const [contextDialog, setContextDialog] = useState<ContextDialogState | null>(
    null
  );
  const ordered = useMemo(() => sortTasks(project.tasks), [project.tasks]);

  const applyStatus = (task: TaskNode, change: TaskStatusChange) => {
    if (!isTaskStatus(change.status)) return;
    onUpdateChild(task.id, toTaskStatusPatch(change));
  };

  const requestStatus = (task: TaskNode, status: TaskStatus) => {
    if (status === "blocked" || status === "waiting") {
      setContextDialog({ task, status });
      return;
    }
    applyStatus(task, { status });
  };

  const toggleDone = (task: TaskNode) => {
    const done = isClosedCollectionStatus(task.status);
    applyStatus(task, { status: done ? "active" : "completed" });
  };

  return (
    <div>
      <form
        className="project-detail-add-row"
        onSubmit={(event) => {
          event.preventDefault();
          dueGuard.ensure({
            project,
            dueDate: taskForm.dueDate || null,
            onAllowed: onAddTask,
          });
        }}
      >
        <Plus className="h-4 w-4 text-[var(--muted-2)]" aria-hidden />
        <input
          value={taskForm.title}
          onChange={(event) => onTaskFieldChange("title", event.target.value)}
          placeholder="Add a task"
          className="project-detail-add-input"
          aria-label="New task title"
        />
        <TaskDueDateSelect
          value={taskForm.dueDate || null}
          onChange={(dueDate) => onTaskFieldChange("dueDate", dueDate ?? "")}
          variant="compact"
          placeholder="Due date"
          showIcon={false}
          showChevron={false}
          project={project}
          className="project-detail-add-due"
        />
        <button
          type="submit"
          className="project-detail-add-submit"
          disabled={!canAddTask}
        >
          {isAddingTask ? "Adding…" : "Add"}
        </button>
      </form>
      {taskError ? (
        <div className="px-5 pt-3">
          <ProjectDetailInlineError>{taskError}</ProjectDetailInlineError>
        </div>
      ) : null}

      {ordered.length === 0 ? (
        <p className="px-5 py-8 text-center text-[13px] text-[var(--muted-2)]">
          No tasks yet.
        </p>
      ) : (
        <ul className="m-0 list-none p-0">
          {ordered.map((task) => {
            const done = isClosedCollectionStatus(task.status);
            const assignee =
              people.find(
                (person) =>
                  person.id ===
                  (task.assignee?.id ?? task.details?.assigneePersonNodeId)
              ) ??
              task.assignee ??
              null;
            const ownerLabel = formatPerson(assignee, currentUserPersonId).label;
            const completedLine = doneLabel(task);
            const statusKey = isTaskStatus(task.status) ? task.status : "active";

            return (
              <li
                key={task.id}
                className={cn(
                  "project-detail-task-row",
                  done && "project-detail-task-row-done"
                )}
              >
                <button
                  type="button"
                  className="project-detail-task-check"
                  data-checked={done ? "true" : "false"}
                  aria-label={
                    done ? `Mark ${task.title} active` : `Complete ${task.title}`
                  }
                  disabled={isUpdatingChild}
                  onClick={() => toggleDone(task)}
                >
                  {done ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
                </button>

                <div className="project-detail-task-title">
                  <Link to={`/tasks/${task.id}`}>
                    {cleanDisplayName(task.title) || task.title}
                  </Link>
                  {done && completedLine ? (
                    <p className="project-detail-task-reason">{completedLine}</p>
                  ) : (
                    <TaskStatusContextLine
                      task={task}
                      className="project-detail-task-reason"
                      onReschedule={
                        task.status === "waiting"
                          ? () =>
                              setContextDialog({ task, status: "waiting" })
                          : undefined
                      }
                    />
                  )}
                </div>

                <span className="project-detail-task-status">
                  <StatusDot
                    status={done ? "completed" : statusKey}
                    className="shrink-0"
                  />
                  {taskStatusLabels[statusKey as TaskStatus] ?? statusKey}
                </span>

                <span
                  className="project-detail-task-avatar justify-self-center"
                  title={ownerLabel}
                >
                  <PersonAvatar
                    person={assignee}
                    size="sm"
                    className="h-5 w-5 text-[8px]"
                  />
                </span>

                <div className="min-w-0 justify-self-end">
                  <WorkDueDisplay value={task.details?.dueDate} hideLate={done} />
                </div>

                <div className="project-detail-task-actions">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="project-detail-task-action"
                    aria-label={`Open ${task.title}`}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="project-detail-task-action"
                        aria-label={`Actions for ${task.title}`}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {!done ? (
                        <DropdownMenuItem
                          className="text-[12px]"
                          onSelect={() =>
                            applyStatus(task, { status: "completed" })
                          }
                        >
                          Complete
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-[12px]"
                          onSelect={() => applyStatus(task, { status: "active" })}
                        >
                          Reopen
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {(
                        ["active", "waiting", "blocked", "completed"] as const
                      ).map((status) => (
                        <DropdownMenuItem
                          key={status}
                          className="text-[12px]"
                          disabled={task.status === status}
                          onSelect={() => requestStatus(task, status)}
                        >
                          {taskStatusLabels[status]}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-[12px] text-destructive focus:text-destructive"
                        disabled={deletingChildIds.includes(task.id)}
                        onSelect={() => onDeleteChild(task.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {contextDialog ? (
        <TaskStatusContextDialog
          open
          status={contextDialog.status}
          excludeTaskId={contextDialog.task.id}
          initialBlockedByTaskId={
            contextDialog.task.blockedBy?.id ??
            contextDialog.task.details?.blockedByNodeId
          }
          initialFollowUpAt={contextDialog.task.details?.followUpAt}
          initialWaitingNote={contextDialog.task.details?.waitingNote}
          onOpenChange={(open) => {
            if (!open) setContextDialog(null);
          }}
          onConfirm={(change) => {
            applyStatus(contextDialog.task, change);
            setContextDialog(null);
          }}
        />
      ) : null}

      {dueGuard.dialog}
    </div>
  );
}
