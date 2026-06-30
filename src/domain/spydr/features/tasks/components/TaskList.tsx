import { Link } from "react-router-dom";
import type { PersonNode, ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { PriorityBadge } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { CollectionSortableHeader } from "@/domain/spydr/features/shared/components/CollectionSortableHeader";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import type { CollectionSortState } from "@/domain/spydr/utils/collectionView";
import { cn } from "@/lib/utils";
import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import { PersonSelect } from "@/domain/spydr/features/projects/components/PersonSelect";
import { TaskDueDateSelect } from "./TaskDueDateSelect";
import { TaskStatusSelect } from "./TaskStatusSelect";

const ROW_GRID =
  "grid grid-cols-[132px_minmax(0,1fr)_minmax(0,10rem)_minmax(0,10rem)_96px_132px_104px] items-center gap-3";
const ROW_MIN_WIDTH = 960;

interface TaskListProps {
  tasks: TaskNode[];
  projects: ProjectNode[];
  people: PersonNode[];
  sort: CollectionSortState;
  updatingTaskId?: string | null;
  onSortColumn(column: string): void;
  onStatusChange(taskId: string, status: string): void;
  onProjectChange(taskId: string, projectNodeId: string | null): void;
  onAssigneeChange(taskId: string, assigneePersonNodeId: string | null): void;
  onDueDateChange(taskId: string, dueDate: string | null): void;
}

function resolveAssigneeId(task: TaskNode): string | null {
  return task.assignee?.id ?? task.details?.assigneePersonNodeId ?? null;
}

export function TaskList({
  tasks,
  projects,
  people,
  sort,
  updatingTaskId = null,
  onSortColumn,
  onStatusChange,
  onProjectChange,
  onAssigneeChange,
  onDueDateChange,
}: TaskListProps) {
  return (
    <div className="overflow-x-auto">
      <div
        className={cn(
          ROW_GRID,
          "border-b border-border bg-muted/20 px-6 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        )}
        style={{ minWidth: ROW_MIN_WIDTH }}
      >
        <CollectionSortableHeader
          label="Status"
          column="status"
          sort={sort}
          onSort={onSortColumn}
        />
        <CollectionSortableHeader
          label="Task"
          column="title"
          sort={sort}
          onSort={onSortColumn}
        />
        <CollectionSortableHeader
          label="Project"
          column="project"
          sort={sort}
          onSort={onSortColumn}
        />
        <CollectionSortableHeader
          label="Assignee"
          column="assignee"
          sort={sort}
          onSort={onSortColumn}
        />
        <CollectionSortableHeader
          label="Priority"
          column="priority"
          sort={sort}
          onSort={onSortColumn}
        />
        <CollectionSortableHeader
          label="Due"
          column="due"
          sort={sort}
          align="end"
          onSort={onSortColumn}
        />
        <CollectionSortableHeader
          label="Updated"
          column="updated"
          sort={sort}
          align="end"
          onSort={onSortColumn}
        />
      </div>

      <ul className="divide-y divide-border">
        {tasks.map((task) => {
          const isUpdating = updatingTaskId === task.id;
          const projectId = task.project?.id ?? "";
          const assigneeId = resolveAssigneeId(task);

          return (
            <li
              key={task.id}
              className={cn(ROW_GRID, "px-6 py-2.5 row-hover")}
              style={{ minWidth: ROW_MIN_WIDTH }}
            >
              <TaskStatusSelect
                value={task.status}
                disabled={isUpdating}
                className="w-full"
                onChange={(status) => {
                  if (status !== task.status) {
                    onStatusChange(task.id, status);
                  }
                }}
              />
              <div className="min-w-0">
                <Link
                  to={`/tasks/${task.id}`}
                  className="block truncate text-[13px] hover:text-primary"
                >
                  {task.title}
                </Link>
                {task.body ? (
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {task.body}
                  </p>
                ) : null}
              </div>
              <ProjectSelect
                projects={projects}
                value={projectId}
                allowUnassigned
                compact
                disabled={isUpdating}
                className="w-full min-w-0"
                onChange={(nextProjectId) => {
                  const currentProjectId = task.project?.id ?? null;
                  if (nextProjectId !== currentProjectId) {
                    onProjectChange(task.id, nextProjectId);
                  }
                }}
              />
              <PersonSelect
                people={people}
                value={assigneeId}
                compact
                disabled={isUpdating}
                className="w-full min-w-0"
                ariaLabel="Task assignee"
                onChange={(nextAssigneeId) => {
                  if (nextAssigneeId !== assigneeId) {
                    onAssigneeChange(task.id, nextAssigneeId);
                  }
                }}
              />
              <span className="min-w-0">
                <PriorityBadge priority={task.priority} />
              </span>
              <span className="block min-w-0">
                <TaskDueDateSelect
                  value={task.details?.dueDate}
                  disabled={isUpdating}
                  onChange={(dueDate) => onDueDateChange(task.id, dueDate)}
                />
              </span>
              <span className="text-right font-mono text-[10px] text-muted-foreground">
                {formatRelativeTime(task.updatedAt)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
