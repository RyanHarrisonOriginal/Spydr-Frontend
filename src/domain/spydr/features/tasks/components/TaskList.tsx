import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { PersonNode, ProjectAreaNode, ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { PriorityBadge } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { CollectionSortableHeader } from "@/domain/spydr/features/shared/components/CollectionSortableHeader";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import {
  CollectionSortableList,
  type SortableItemRenderProps,
} from "@/domain/spydr/features/shared/components/CollectionSortableList";
import type { CollectionSortState } from "@/domain/spydr/utils/collectionView";
import { cn } from "@/lib/utils";
import { useIsPhone } from "@/hooks/useIsPhone";
import { findAreaIdByTitle } from "@/domain/spydr/utils/projectAreas";
import {
  hslColorCss,
  resolveAreaColor,
} from "@/domain/spydr/utils/projectAreaColors";
import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import { PersonSelect } from "@/domain/spydr/features/projects/components/PersonSelect";
import { TaskDueDateSelect } from "./TaskDueDateSelect";
import { TaskStatusSelect } from "./TaskStatusSelect";
import {
  TaskCompletedAt,
  formatTaskListTimestamp,
} from "./TaskCompletedAt";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { SelectionCheckbox } from "@/domain/spydr/features/shared/components/SelectionCheckbox";
import { BulkDeleteBar } from "@/domain/spydr/features/shared/components/BulkDeleteBar";
import { useItemSelection } from "@/domain/spydr/features/shared/hooks/useItemSelection";
import { AddToTodoButton } from "@/domain/spydr/features/todos/components/AddToTodoButton";

const ROW_BASE =
  "grid grid-cols-[28px_36px_132px_minmax(0,1fr)_minmax(0,10rem)_minmax(0,10rem)_96px_132px_148px_40px_72px] items-center gap-3";
const ROW_WITH_HANDLE =
  "grid grid-cols-[24px_28px_36px_132px_minmax(0,1fr)_minmax(0,10rem)_minmax(0,10rem)_96px_132px_148px_40px_72px] items-center gap-3";
const ROW_MIN_WIDTH = 1180;
const ROW_MIN_WIDTH_WITH_HANDLE = 1204;

interface TaskListProps {
  tasks: TaskNode[];
  projects: ProjectNode[];
  people: PersonNode[];
  areas?: ProjectAreaNode[];
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
  todoTaskIds?: Set<string>;
  togglingTodoTaskId?: string | null;
  onToggleTodo?(taskId: string, onTodo: boolean): void;
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
  compact = false,
  areas = [],
  onTodo = false,
  togglingTodo = false,
  onToggleTodo,
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
  compact?: boolean;
  areas?: ProjectAreaNode[];
  onTodo?: boolean;
  togglingTodo?: boolean;
  onToggleTodo?(taskId: string, onTodo: boolean): void;
}) {
  const rowClass = reorderEnabled ? ROW_WITH_HANDLE : ROW_BASE;
  const minWidth = reorderEnabled ? ROW_MIN_WIDTH_WITH_HANDLE : ROW_MIN_WIDTH;
  const projectId = task.project?.id ?? "";
  const assigneeId = resolveAssigneeId(task);
  const areaId = findAreaIdByTitle(task.area, areas);
  const area = areas.find((entry) => entry.id === areaId);
  const areaColor = area ? resolveAreaColor(area) : null;
  const timestamp = formatTaskListTimestamp(task);

  if (compact) {
    return (
      <div className="flex min-w-0 items-stretch overflow-hidden rounded-md border border-border/70 bg-background">
        <span
          className={cn(
            "w-1.5 shrink-0 self-stretch rounded-sm",
            !areaColor && "bg-muted/60"
          )}
          style={areaColor ? { backgroundColor: hslColorCss(areaColor) } : undefined}
          title={task.area ?? "No area"}
          aria-label={task.area ? `Area: ${task.area}` : "No area"}
        />
        <div className="flex min-w-0 flex-1 items-center gap-1 py-0.5 pl-1 pr-1">
          <CollectionPriorityRank
            rank={getPriorityRank(task.id)}
            className="min-w-[1.15rem] px-0.5"
          />
          <TaskStatusSelect
            value={task.status}
            disabled={isUpdating}
            appearance="icon"
            className="h-7 w-7"
            onChange={(status) => {
              if (status !== task.status) {
                onStatusChange(task.id, status);
              }
            }}
          />
          <Link
            to={`/tasks/${task.id}`}
            className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground/90"
          >
            {task.title}
          </Link>
          <TaskCompletedAt
            status={task.status}
            completedAt={task.details?.completedAt}
          />
          <TaskDueDateSelect
            value={task.details?.dueDate}
            disabled={isUpdating}
            placeholder="Due"
            showChevron={false}
            showIcon={false}
            className="h-7 w-[3.75rem] shrink-0"
            onChange={(dueDate) => onDueDateChange(task.id, dueDate)}
          />
          {onToggleTodo ? (
            <AddToTodoButton
              onTodo={onTodo}
              busy={togglingTodo}
              onToggle={() => onToggleTodo(task.id, onTodo)}
            />
          ) : null}
          <Link
            to={`/tasks/${task.id}`}
            aria-label={`Open ${task.title}`}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-highlight/12 bg-highlight/[0.05] text-highlight/90"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(rowClass, "px-4 py-2.5 row-hover md:px-6")} style={{ minWidth }}>
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
              className="inline-flex max-w-[9rem] shrink-0 items-center rounded border border-border/20 bg-muted/15 px-1.5 py-px text-[10px] text-muted-foreground transition-colors hover:border-highlight/25 hover:bg-highlight/8 hover:text-highlight"
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
      <span
        className="text-right font-mono text-[10px] text-muted-foreground"
        title={timestamp.label}
      >
        {timestamp.value}
      </span>
      {onToggleTodo ? (
        <AddToTodoButton
          onTodo={onTodo}
          busy={togglingTodo}
          onToggle={() => onToggleTodo(task.id, onTodo)}
        />
      ) : (
        <span aria-hidden />
      )}
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
  areas = [],
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
  todoTaskIds,
  togglingTodoTaskId = null,
  onToggleTodo,
}: TaskListProps) {
  const headerClass = reorderEnabled ? ROW_WITH_HANDLE : ROW_BASE;
  const minWidth = reorderEnabled ? ROW_MIN_WIDTH_WITH_HANDLE : ROW_MIN_WIDTH;
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const selection = useItemSelection(taskIds);
  const canSelect = Boolean(onDeleteSelected);
  const isPhone = useIsPhone();

  return (
    <div className={isPhone ? "" : "touch-scroll-x"}>
      {canSelect && !isPhone && selection.selectedCount > 0 ? (
        <div
          className="flex items-center gap-3 border-b border-border bg-destructive/5 px-4 py-1.5 md:px-6"
        style={isPhone ? undefined : { minWidth }}
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
      {isPhone ? null : (
      <div
        className={cn(
          headerClass,
          "border-b border-border bg-muted/20 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground md:px-6"
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
        <span className="text-center">Today</span>
        <span />
      </div>
      )}

      <CollectionSortableList
        items={tasks}
        enabled={reorderEnabled && !isPhone}
        className={isPhone ? "space-y-1.5 px-2 py-2" : "divide-y divide-border"}
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
            onToggleSelected={!isPhone && canSelect ? selection.toggle : undefined}
            compact={isPhone}
            areas={areas}
            onTodo={todoTaskIds?.has(task.id) ?? false}
            togglingTodo={togglingTodoTaskId === task.id}
            onToggleTodo={onToggleTodo}
          />
        )}
      />
    </div>
  );
}
