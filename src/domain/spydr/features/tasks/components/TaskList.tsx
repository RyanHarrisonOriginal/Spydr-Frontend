import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { PersonNode, ProjectAreaNode, ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { PriorityBadge } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { CollectionSortableHeader } from "@/domain/spydr/features/shared/components/CollectionSortableHeader";
import { ResizableHeaderCell } from "@/domain/spydr/features/shared/components/ColumnResizeHandle";
import { CollectionReorderControls } from "@/domain/spydr/features/shared/components/CollectionReorderControls";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import {
  CollectionSortableList,
} from "@/domain/spydr/features/shared/components/CollectionSortableList";
import type { CollectionSortState } from "@/domain/spydr/utils/collectionView";
import {
  moveIdInOrder,
  moveIdToRank,
  type RankMoveDirection,
} from "@/domain/spydr/utils/collectionReorder";
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
import { useEnsureTaskDueWithinProject } from "../hooks/useEnsureTaskDueWithinProject";
import { TaskTitleInput } from "./TaskTitleInput";
import { EmojiPicker } from "@/domain/spydr/features/shared/components/EmojiPicker";
import {
  TaskCompletedAt,
  formatTaskListTimestamp,
} from "./TaskCompletedAt";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { SelectionCheckbox } from "@/domain/spydr/features/shared/components/SelectionCheckbox";
import { BulkDeleteBar } from "@/domain/spydr/features/shared/components/BulkDeleteBar";
import { useItemSelection } from "@/domain/spydr/features/shared/hooks/useItemSelection";
import { AddToTodoButton } from "@/domain/spydr/features/todos/components/AddToTodoButton";
import { useFittedColumns } from "@/domain/spydr/features/shared/hooks/useFittedColumns";
import { useResizableColumns } from "@/domain/spydr/features/shared/hooks/useResizableColumns";
import type { FittedTrack } from "@/domain/spydr/features/shared/utils/fitGridTracks";

type TaskListWidthColumn =
  | "status"
  | "title"
  | "project"
  | "assignee"
  | "priority"
  | "due"
  | "updated";

const TASK_LIST_COLUMN_DEFAULTS: Record<TaskListWidthColumn, number> = {
  status: 148,
  title: 360,
  project: 160,
  assignee: 180,
  priority: 128,
  due: 132,
  updated: 148,
};

const TASK_LIST_COLUMN_MIN: Partial<Record<TaskListWidthColumn, number>> = {
  status: 120,
  title: 180,
  project: 120,
  assignee: 128,
  priority: 96,
  due: 104,
  updated: 96,
};

const TASK_LIST_PADDING_X = 32;
const TASK_CHECKBOX_WIDTH = 28;
const TASK_RANK_WIDTH = 36;
const TASK_REORDER_WIDTH = 52;
const TASK_TODAY_WIDTH = 40;
const TASK_ACTIONS_WIDTH = 72;

const ROW_LAYOUT = "grid items-center [&>*]:min-w-0";

function buildTaskTracks(
  widths: Record<TaskListWidthColumn, number>,
  reorderEnabled: boolean
): Array<FittedTrack & { id: string }> {
  const minOf = (column: TaskListWidthColumn) => TASK_LIST_COLUMN_MIN[column] ?? 80;
  return [
    ...(reorderEnabled
      ? [{ id: "reorder", preferred: TASK_REORDER_WIDTH, min: TASK_REORDER_WIDTH }]
      : []),
    { id: "select", preferred: TASK_CHECKBOX_WIDTH, min: TASK_CHECKBOX_WIDTH },
    { id: "rank", preferred: TASK_RANK_WIDTH, min: TASK_RANK_WIDTH },
    { id: "status", preferred: widths.status, min: minOf("status") },
    { id: "title", preferred: widths.title, min: minOf("title"), flexible: true },
    { id: "project", preferred: widths.project, min: minOf("project") },
    { id: "assignee", preferred: widths.assignee, min: minOf("assignee") },
    { id: "priority", preferred: widths.priority, min: minOf("priority") },
    { id: "due", preferred: widths.due, min: minOf("due") },
    { id: "updated", preferred: widths.updated, min: minOf("updated") },
    { id: "today", preferred: TASK_TODAY_WIDTH, min: TASK_TODAY_WIDTH },
    { id: "actions", preferred: TASK_ACTIONS_WIDTH, min: TASK_ACTIONS_WIDTH },
  ];
}

interface TaskHeaderApi {
  visualWidth(column: TaskListWidthColumn): number;
  fitMax(column: TaskListWidthColumn): number;
  resizeColumn(column: TaskListWidthColumn, width: number): void;
}

function TaskResizableHeader({
  label,
  column,
  sizing,
  api,
  children,
}: {
  label: string;
  column: TaskListWidthColumn;
  sizing: ReturnType<typeof useResizableColumns<TaskListWidthColumn>>;
  api: TaskHeaderApi;
  children: ReactNode;
}) {
  return (
    <ResizableHeaderCell
      label={label}
      width={api.visualWidth(column)}
      minWidth={sizing.minWidthOf(column)}
      maxWidth={api.fitMax(column)}
      onWidthChange={(width) => api.resizeColumn(column, width)}
      onReset={() => sizing.resetColumnWidth(column)}
    >
      {children}
    </ResizableHeaderCell>
  );
}

interface TaskListProps {
  tasks: TaskNode[];
  projects: ProjectNode[];
  people: PersonNode[];
  areas?: ProjectAreaNode[];
  sort: CollectionSortState;
  reorderEnabled?: boolean;
  /** Full filtered order when `tasks` is a page slice. */
  rankOrderIds?: string[];
  getPriorityRank(id: string): number | undefined;
  updatingTaskId?: string | null;
  onSortColumn(column: string): void;
  onReorder?(orderedIds: string[]): void;
  onMoveRank?(id: string, direction: RankMoveDirection): void;
  onSetRank?(id: string, rank: number): void;
  onStatusChange(taskId: string, status: string): void;
  onProjectChange(taskId: string, projectNodeId: string | null): void;
  onAssigneeChange(taskId: string, assigneePersonNodeId: string | null): void;
  onDueDateChange(taskId: string, dueDate: string | null): void;
  onTitleChange?(taskId: string, title: string): void;
  onEmojiChange?(taskId: string, emoji: string | null): void;
  onDelete?(taskId: string): void;
  onDeleteSelected?(taskIds: string[]): void;
  deletingTaskIds?: string[];
  todoTaskIds?: Set<string>;
  togglingTodoTaskId?: string | null;
  onToggleTodo?(taskId: string, onTodo: boolean): void;
  footer?: ReactNode;
  scrollRef?: { current: HTMLDivElement | null };
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
  rankControls,
  maxRank,
  onRankChange,
  isUpdating,
  onStatusChange,
  onProjectChange,
  onAssigneeChange,
  onDueDateChange,
  onTitleChange,
  onEmojiChange,
  onDelete,
  deletingTaskIds = [],
  selected = false,
  onToggleSelected,
  compact = false,
  areas = [],
  onTodo = false,
  togglingTodo = false,
  onToggleTodo,
  gridTemplateColumns,
  minWidth,
  gapPx,
}: {
  task: TaskNode;
  projects: ProjectNode[];
  people: PersonNode[];
  reorderEnabled: boolean;
  getPriorityRank(id: string): number | undefined;
  rankControls?: ReactNode;
  maxRank?: number;
  onRankChange?(rank: number): void;
  isUpdating: boolean;
  onStatusChange(taskId: string, status: string): void;
  onProjectChange(taskId: string, projectNodeId: string | null): void;
  onAssigneeChange(taskId: string, assigneePersonNodeId: string | null): void;
  onDueDateChange(taskId: string, dueDate: string | null): void;
  onTitleChange?(taskId: string, title: string): void;
  onEmojiChange?(taskId: string, emoji: string | null): void;
  onDelete?: (taskId: string) => void;
  deletingTaskIds?: string[];
  selected?: boolean;
  onToggleSelected?(id: string): void;
  compact?: boolean;
  areas?: ProjectAreaNode[];
  onTodo?: boolean;
  togglingTodo?: boolean;
  onToggleTodo?(taskId: string, onTodo: boolean): void;
  gridTemplateColumns: string;
  minWidth?: number;
  gapPx: number;
}) {
  const projectId = task.project?.id ?? "";
  const assigneeId = resolveAssigneeId(task);
  const areaId = findAreaIdByTitle(task.area, areas);
  const area = areas.find((entry) => entry.id === areaId);
  const areaColor = area ? resolveAreaColor(area) : null;
  const timestamp = formatTaskListTimestamp(task);
  const project = projects.find((entry) => entry.id === (task.project?.id ?? "")) ?? null;
  const dueGuard = useEnsureTaskDueWithinProject();

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
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 py-0.5 pl-1 pr-1">
          {reorderEnabled ? rankControls : null}
          <CollectionPriorityRank
            rank={getPriorityRank(task.id)}
            maxRank={maxRank}
            onRankChange={onRankChange}
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
            aria-label={`Open ${task.title}`}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-highlight/25 bg-highlight/10 text-highlight hover:border-highlight/50 hover:bg-highlight/18"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <EmojiPicker
            value={task.details?.emoji}
            disabled={isUpdating || !onEmojiChange}
            ariaLabel={`Emoji for ${task.title}`}
            onChange={(emoji) => onEmojiChange?.(task.id, emoji)}
          />
          <TaskTitleInput
            taskId={task.id}
            title={task.title}
            disabled={isUpdating}
            onTitleChange={onTitleChange}
          />
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
            className="h-7 w-[4.5rem] max-w-full"
            project={project}
            onChange={(dueDate) => onDueDateChange(task.id, dueDate)}
          />
          {onToggleTodo ? (
            <AddToTodoButton
              onTodo={onTodo}
              busy={togglingTodo}
              onToggle={() => onToggleTodo(task.id, onTodo)}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(ROW_LAYOUT, "px-4 py-2.5 row-hover")}
      style={{ gridTemplateColumns, minWidth, gap: gapPx, justifyContent: "start" }}
    >
      {reorderEnabled ? rankControls : null}
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
      <CollectionPriorityRank
        rank={getPriorityRank(task.id)}
        maxRank={maxRank}
        onRankChange={onRankChange}
      />
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
            aria-label={`Open ${task.title}`}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-highlight/25 bg-highlight/10 text-highlight hover:border-highlight/50 hover:bg-highlight/18"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <EmojiPicker
            value={task.details?.emoji}
            disabled={isUpdating || !onEmojiChange}
            ariaLabel={`Emoji for ${task.title}`}
            onChange={(emoji) => onEmojiChange?.(task.id, emoji)}
          />
          <TaskTitleInput
            taskId={task.id}
            title={task.title}
            disabled={isUpdating}
            onTitleChange={onTitleChange}
          />
          {task.project ? (
            <Link
              to={`/projects/${task.project.id}`}
              className="inline-flex min-w-0 max-w-[40%] shrink items-center overflow-hidden rounded border border-border/20 bg-muted/15 px-1.5 py-px text-[10px] text-muted-foreground transition-colors hover:border-highlight/25 hover:bg-highlight/8 hover:text-highlight"
              title={task.project.title}
            >
              <span className="truncate">{task.project.title}</span>
            </Link>
          ) : null}
        </div>
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
          if (nextProjectId === currentProjectId) return;
          const nextProject =
            projects.find((entry) => entry.id === (nextProjectId ?? "")) ?? null;
          dueGuard.ensure({
            project: nextProject,
            dueDate: task.details?.dueDate ?? null,
            onAllowed: () => onProjectChange(task.id, nextProjectId),
          });
        }}
      />
      <div className="flex min-w-0 items-center gap-2">
        <TaskCompletedAt
          status={task.status}
          completedAt={task.details?.completedAt}
        />
        <PersonSelect
          people={people}
          value={assigneeId}
          compact
          disabled={isUpdating}
          className="min-w-0 flex-1"
          ariaLabel="Task assignee"
          onChange={(nextAssigneeId) => {
            if (nextAssigneeId !== assigneeId) {
              onAssigneeChange(task.id, nextAssigneeId);
            }
          }}
        />
      </div>
      <span className="min-w-0">
        <PriorityBadge priority={task.priority} />
      </span>
      <span className="block min-w-0">
        <TaskDueDateSelect
          value={task.details?.dueDate}
          disabled={isUpdating}
          project={project}
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
      {dueGuard.dialog}
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
  rankOrderIds,
  getPriorityRank,
  updatingTaskId = null,
  onSortColumn,
  onReorder,
  onMoveRank,
  onSetRank,
  onStatusChange,
  onProjectChange,
  onAssigneeChange,
  onDueDateChange,
  onTitleChange,
  onEmojiChange,
  onDelete,
  onDeleteSelected,
  deletingTaskIds = [],
  todoTaskIds,
  togglingTodoTaskId = null,
  onToggleTodo,
  footer,
  scrollRef,
}: TaskListProps) {
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const orderIds = useMemo(
    () => rankOrderIds ?? taskIds,
    [rankOrderIds, taskIds]
  );
  const selection = useItemSelection(taskIds);
  const canSelect = Boolean(onDeleteSelected);
  const isPhone = useIsPhone();
  const columnSizing = useResizableColumns(
    "tasks",
    TASK_LIST_COLUMN_DEFAULTS,
    { minWidths: TASK_LIST_COLUMN_MIN }
  );
  const tracks = buildTaskTracks(columnSizing.widths, reorderEnabled);
  const fitted = useFittedColumns(
    tracks,
    columnSizing.widths,
    columnSizing.replaceWidths,
    TASK_LIST_PADDING_X,
    columnSizing.maxWidth
  );
  const { layout, gridStyle } = fitted;
  const headerApi: TaskHeaderApi = {
    visualWidth: fitted.visualWidth,
    fitMax: fitted.fitMax,
    resizeColumn: fitted.resizeColumn,
  };

  const moveRank = (id: string, direction: RankMoveDirection) => {
    if (onMoveRank) {
      onMoveRank(id, direction);
      return;
    }
    const next = moveIdInOrder(orderIds, id, direction);
    if (next) onReorder?.(next);
  };

  const setRank = (id: string, rank: number) => {
    if (onSetRank) {
      onSetRank(id, rank);
      return;
    }
    const next = moveIdToRank(orderIds, id, rank);
    if (next) onReorder?.(next);
  };

  const canEditRank = reorderEnabled && Boolean(onSetRank || onReorder);

  const rankControlsFor = (
    taskId: string,
    dragHandleProps?: Record<string, unknown>
  ) => {
    const rankIndex = orderIds.indexOf(taskId);
    return (
      <CollectionReorderControls
        dragHandleProps={dragHandleProps}
        showDragHandle={!isPhone}
        canMoveUp={rankIndex > 0}
        canMoveDown={rankIndex >= 0 && rankIndex < orderIds.length - 1}
        onMoveUp={() => moveRank(taskId, "up")}
        onMoveDown={() => moveRank(taskId, "down")}
      />
    );
  };

  return (
    <div
      ref={(node) => {
        layout.ref.current = node;
        if (scrollRef) scrollRef.current = node;
      }}
      className={isPhone ? "min-w-0 w-full" : "h-full min-h-0 min-w-0 w-full overflow-auto"}
    >
      {canSelect && !isPhone && selection.selectedCount > 0 ? (
        <div
          className="flex min-w-0 flex-wrap items-center gap-3 border-b border-border bg-destructive/5 px-4 py-1.5"
          style={{ minWidth: layout.scrollMinWidth }}
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
          ROW_LAYOUT,
          "sticky top-0 z-20 border-b border-border bg-background px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        )}
        style={gridStyle}
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
        <TaskResizableHeader label="Status" column="status" sizing={columnSizing} api={headerApi}>
          <CollectionSortableHeader
            label="Status"
            column="status"
            sort={sort}
            onSort={onSortColumn}
          />
        </TaskResizableHeader>
        <TaskResizableHeader label="Task" column="title" sizing={columnSizing} api={headerApi}>
          <CollectionSortableHeader
            label="Task"
            column="title"
            sort={sort}
            onSort={onSortColumn}
          />
        </TaskResizableHeader>
        <TaskResizableHeader label="Project" column="project" sizing={columnSizing} api={headerApi}>
          <CollectionSortableHeader
            label="Project"
            column="project"
            sort={sort}
            onSort={onSortColumn}
          />
        </TaskResizableHeader>
        <TaskResizableHeader label="Assignee" column="assignee" sizing={columnSizing} api={headerApi}>
          <CollectionSortableHeader
            label="Assignee"
            column="assignee"
            sort={sort}
            onSort={onSortColumn}
          />
        </TaskResizableHeader>
        <TaskResizableHeader label="Priority" column="priority" sizing={columnSizing} api={headerApi}>
          <CollectionSortableHeader
            label="Priority"
            column="priority"
            sort={sort}
            onSort={onSortColumn}
          />
        </TaskResizableHeader>
        <TaskResizableHeader label="Due" column="due" sizing={columnSizing} api={headerApi}>
          <CollectionSortableHeader
            label="Due"
            column="due"
            sort={sort}
            align="end"
            onSort={onSortColumn}
          />
        </TaskResizableHeader>
        <TaskResizableHeader label="Updated" column="updated" sizing={columnSizing} api={headerApi}>
          <CollectionSortableHeader
            label="Updated"
            column="updated"
            sort={sort}
            align="end"
            onSort={onSortColumn}
          />
        </TaskResizableHeader>
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
            rankControls={rankControlsFor(task.id, sortable.dragHandleProps)}
            maxRank={orderIds.length}
            onRankChange={canEditRank ? (rank) => setRank(task.id, rank) : undefined}
            isUpdating={updatingTaskId === task.id}
            onStatusChange={onStatusChange}
            onProjectChange={onProjectChange}
            onAssigneeChange={onAssigneeChange}
            onDueDateChange={onDueDateChange}
            onTitleChange={onTitleChange}
            onEmojiChange={onEmojiChange}
            onDelete={onDelete}
            deletingTaskIds={deletingTaskIds}
            selected={selection.isSelected(task.id)}
            onToggleSelected={!isPhone && canSelect ? selection.toggle : undefined}
            compact={isPhone}
            areas={areas}
            onTodo={todoTaskIds?.has(task.id) ?? false}
            togglingTodo={togglingTodoTaskId === task.id}
            onToggleTodo={onToggleTodo}
            gridTemplateColumns={layout.template}
            minWidth={layout.scrollMinWidth}
            gapPx={layout.gapPx}
          />
        )}
      />
      {footer}
    </div>
  );
}
