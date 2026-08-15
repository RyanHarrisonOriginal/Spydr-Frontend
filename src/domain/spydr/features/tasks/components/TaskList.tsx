import { useMemo } from "react";
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
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { SelectionCheckbox } from "@/domain/spydr/features/shared/components/SelectionCheckbox";
import { BulkDeleteBar } from "@/domain/spydr/features/shared/components/BulkDeleteBar";
import { useItemSelection } from "@/domain/spydr/features/shared/hooks/useItemSelection";

const ROW_BASE =
  "grid grid-cols-[28px_36px_132px_minmax(0,1fr)_minmax(0,10rem)_minmax(0,10rem)_96px_132px_104px_72px] items-center gap-3";
const ROW_WITH_HANDLE =
  "grid grid-cols-[24px_28px_36px_132px_minmax(0,1fr)_minmax(0,10rem)_minmax(0,10rem)_96px_132px_104px_72px] items-center gap-3";
const ROW_MIN_WIDTH = 1096;
const ROW_MIN_WIDTH_WITH_HANDLE = 1120;

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
  onDelete?(taskId: string): void;
  onDeleteSelected?(taskIds: string[]): void;
  deletingTaskIds?: string[];
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
  onDelete,
  deletingTaskIds = [],
  selected = false,
  onToggleSelected,
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
  onDelete?: (taskId: string) => void;
  deletingTaskIds?: string[];
  selected?: boolean;
  onToggleSelected?(id: string): void;
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
      {onToggleSelected ? (
        <SelectionCheckbox
          checked={selected}
          disabled={deletingTaskIds.length > 0}
          label={`Select ${task.title}`}
          onChange={() => onToggleSelected(task.id)}
        />
      ) : (
        <span aria-hidden />
      )}
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
        <div className="flex min-w-0 items-center gap-1.5">
          <Link
            to={`/tasks/${task.id}`}
            className="min-w-0 truncate text-[13px] text-foreground/90 transition-colors hover:text-highlight"
          >
            {task.title}
          </Link>
          {task.project ? (
            <Link
              to={`/projects/${task.project.id}`}
              className="inline-flex max-w-[9rem] shrink-0 items-center rounded border border-border/60 bg-muted/30 px-1.5 py-px text-[10px] text-muted-foreground transition-colors hover:border-highlight/30 hover:bg-highlight/8 hover:text-highlight"
              title={task.project.title}
            >
              <span className="truncate">{task.project.title}</span>
            </Link>
          ) : null}
        </div>
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
      {onDelete ? (
        <InlineDeleteButton
          label={task.title}
          isDeleting={deletingTaskIds.includes(task.id)}
          disabled={deletingTaskIds.length > 0 && !deletingTaskIds.includes(task.id)}
          onDelete={() => onDelete(task.id)}
        />
      ) : null}
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
  onDelete,
  onDeleteSelected,
  deletingTaskIds = [],
}: TaskListProps) {
  const headerClass = reorderEnabled ? ROW_WITH_HANDLE : ROW_BASE;
  const minWidth = reorderEnabled ? ROW_MIN_WIDTH_WITH_HANDLE : ROW_MIN_WIDTH;
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const selection = useItemSelection(taskIds);
  const canSelect = Boolean(onDeleteSelected);

  return (
    <div className="overflow-x-auto">
      {canSelect && selection.selectedCount > 0 ? (
        <div
          className="flex items-center gap-3 border-b border-border bg-destructive/5 px-6 py-1.5"
          style={{ minWidth }}
        >
          <SelectionCheckbox
            checked={selection.allSelected}
            indeterminate={selection.someSelected}
            disabled={deletingTaskIds.length > 0}
            label="Select all tasks"
            onChange={selection.setAll}
          />
          <BulkDeleteBar
            count={selection.selectedCount}
            noun="task"
            isDeleting={
              deletingTaskIds.length > 0 &&
              selection.selectedIds.some((id) => deletingTaskIds.includes(id))
            }
            disabled={deletingTaskIds.length > 0}
            onDelete={() => onDeleteSelected?.(selection.selectedIds)}
            onClear={selection.clear}
          />
        </div>
      ) : null}
      <div
        className={cn(
          headerClass,
          "border-b border-border bg-muted/20 px-6 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        )}
        style={{ minWidth }}
      >
        {reorderEnabled ? <span aria-hidden /> : null}
        {canSelect ? (
          <SelectionCheckbox
            checked={selection.allSelected}
            indeterminate={selection.someSelected}
            disabled={deletingTaskIds.length > 0 || tasks.length === 0}
            label="Select all tasks"
            onChange={selection.setAll}
          />
        ) : (
          <span aria-hidden />
        )}
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
        <span />
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
            onDelete={onDelete}
            deletingTaskIds={deletingTaskIds}
            selected={selection.isSelected(task.id)}
            onToggleSelected={canSelect ? selection.toggle : undefined}
          />
        )}
      />
    </div>
  );
}
