import { Link } from "react-router-dom";
import type { PersonNode, ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { PriorityBadge } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { CollectionSortableHeader } from "@/domain/spydr/features/shared/components/CollectionSortableHeader";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import {
  CollectionSortableList,
  type SortableItemRenderProps,
} from "@/domain/spydr/features/shared/components/CollectionSortableList";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import type { CollectionSortState } from "@/domain/spydr/utils/collectionView";
import { cn } from "@/lib/utils";
import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import { PersonSelect } from "@/domain/spydr/features/projects/components/PersonSelect";
import { TaskDueDateSelect } from "./TaskDueDateSelect";
import { TaskStatusSelect } from "./TaskStatusSelect";

const ROW_BASE =
  "grid grid-cols-[36px_132px_minmax(0,1fr)_minmax(0,10rem)_minmax(0,10rem)_96px_132px_104px] items-center gap-3";
const ROW_WITH_HANDLE =
  "grid grid-cols-[24px_36px_132px_minmax(0,1fr)_minmax(0,10rem)_minmax(0,10rem)_96px_132px_104px] items-center gap-3";
const ROW_MIN_WIDTH = 996;
const ROW_MIN_WIDTH_WITH_HANDLE = 1020;

interface TaskListProps {
  tasks: TaskNode[];
  projects: ProjectNode[];
  people: PersonNode[];
  sort: CollectionSortState;
  reorderEnabled?: boolean;
  getPriorityRank(id: string): number | undefined;
  updatingTaskId?: string | null;
  onSortColumn(column: string): void;
  onReorder?(orderedIds: string[]): void;
  onStatusChange(taskId: string, status: string): void;
  onProjectChange(taskId: string, projectNodeId: string | null): void;
  onAssigneeChange(taskId: string, assigneePersonNodeId: string | null): void;
  onDueDateChange(taskId: string, dueDate: string | null): void;
}

function resolveAssigneeId(task: TaskNode): string | null {
  return task.assignee?.id ?? task.details?.assigneePersonNodeId ?? null;
}

function TaskRow({
  task,
  projects,
  people,
  reorderEnabled,
  getPriorityRank,
  sortable,
  isUpdating,
  onStatusChange,
  onProjectChange,
  onAssigneeChange,
  onDueDateChange,
}: {
  task: TaskNode;
  projects: ProjectNode[];
  people: PersonNode[];
  reorderEnabled: boolean;
  getPriorityRank(id: string): number | undefined;
  sortable: SortableItemRenderProps;
  isUpdating: boolean;
  onStatusChange(taskId: string, status: string): void;
  onProjectChange(taskId: string, projectNodeId: string | null): void;
  onAssigneeChange(taskId: string, assigneePersonNodeId: string | null): void;
  onDueDateChange(taskId: string, dueDate: string | null): void;
}) {
  const rowClass = reorderEnabled ? ROW_WITH_HANDLE : ROW_BASE;
  const minWidth = reorderEnabled ? ROW_MIN_WIDTH_WITH_HANDLE : ROW_MIN_WIDTH;
  const projectId = task.project?.id ?? "";
  const assigneeId = resolveAssigneeId(task);

  return (
    <div className={cn(rowClass, "px-6 py-2.5 row-hover")} style={{ minWidth }}>
      {reorderEnabled ? (
        <CollectionDragHandle {...sortable.dragHandleProps} />
      ) : null}
      <CollectionPriorityRank rank={getPriorityRank(task.id)} />
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
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{task.body}</p>
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
    </div>
  );
}

export function TaskList({
  tasks,
  projects,
  people,
  sort,
  reorderEnabled = false,
  getPriorityRank,
  updatingTaskId = null,
  onSortColumn,
  onReorder,
  onStatusChange,
  onProjectChange,
  onAssigneeChange,
  onDueDateChange,
}: TaskListProps) {
  const headerClass = reorderEnabled ? ROW_WITH_HANDLE : ROW_BASE;
  const minWidth = reorderEnabled ? ROW_MIN_WIDTH_WITH_HANDLE : ROW_MIN_WIDTH;

  return (
    <div className="overflow-x-auto">
      <div
        className={cn(
          headerClass,
          "border-b border-border bg-muted/20 px-6 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        )}
        style={{ minWidth }}
      >
        {reorderEnabled ? <span aria-hidden /> : null}
        <CollectionSortableHeader
          label="Rank"
          column="order"
          sort={sort}
          onSort={onSortColumn}
        />
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

      <CollectionSortableList
        items={tasks}
        enabled={reorderEnabled}
        className="divide-y divide-border"
        onReorder={(orderedIds) => onReorder?.(orderedIds)}
        renderItem={(task, sortable) => (
          <TaskRow
            task={task}
            projects={projects}
            people={people}
            reorderEnabled={reorderEnabled}
            getPriorityRank={getPriorityRank}
            sortable={sortable}
            isUpdating={updatingTaskId === task.id}
            onStatusChange={onStatusChange}
            onProjectChange={onProjectChange}
            onAssigneeChange={onAssigneeChange}
            onDueDateChange={onDueDateChange}
          />
        )}
      />
    </div>
  );
}
