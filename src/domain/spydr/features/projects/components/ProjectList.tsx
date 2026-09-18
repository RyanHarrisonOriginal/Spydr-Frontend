import { ArrowDown, ArrowUp, ArrowUpDown, ArrowUpRight, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { ProjectAreaNode, ProjectNode, PersonNode, TaskNode } from "@/domain/spydr/utils/types";
import {
  EntityTag,
  PriorityBadge,
  StatusDot,
} from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import { resolveProjectAreaId } from "@/domain/spydr/utils/projectAreas";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import type { ProjectListSort, ProjectSortColumn } from "@/domain/spydr/utils/projectListView";
import type { CollectionSortState } from "@/domain/spydr/utils/collectionView";
import { CollectionReorderControls } from "@/domain/spydr/features/shared/components/CollectionReorderControls";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import { RowExpandToggle } from "@/domain/spydr/features/shared/components/RowExpandToggle";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import { ShowCompletedToggle } from "@/domain/spydr/features/shared/components/ShowCompletedToggle";
import { TaskStatusSelect } from "@/domain/spydr/features/tasks/components/TaskStatusSelect";
import { TaskDueDateSelect } from "@/domain/spydr/features/tasks/components/TaskDueDateSelect";
import { TaskCompletedAt } from "@/domain/spydr/features/tasks/components/TaskCompletedAt";
import { TaskTitleInput } from "@/domain/spydr/features/tasks/components/TaskTitleInput";
import { EmojiPicker } from "@/domain/spydr/features/shared/components/EmojiPicker";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { AddToTodoButton } from "@/domain/spydr/features/todos/components/AddToTodoButton";
import { cn } from "@/lib/utils";
import { useIsPhone } from "@/hooks/useIsPhone";
import {
  moveIdInOrder,
  moveIdToRank,
  type RankMoveDirection,
} from "@/domain/spydr/utils/collectionReorder";
import type { ProjectColumnId } from "../hooks/useProjectListColumns";
import { ProjectAreaSelect } from "./ProjectAreaSelect";
import { ProjectPrioritySelect } from "./ProjectPrioritySelect";
import { ProjectStatusSelect } from "./ProjectStatusSelect";
import { ProjectTargetDateSelect } from "./ProjectTargetDateSelect";
import { PersonSelect } from "./PersonSelect";
import { CollectionSortableHeader } from "@/domain/spydr/features/shared/components/CollectionSortableHeader";
import { ResizableHeaderCell } from "@/domain/spydr/features/shared/components/ColumnResizeHandle";
import { CollectionSortMenu } from "@/domain/spydr/features/shared/components/CollectionSortMenu";
import {
  gridMinWidth,
  gridTemplateFromTracks,
  useResizableColumns,
} from "@/domain/spydr/features/shared/hooks/useResizableColumns";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNestedTaskSort } from "../hooks/useNestedTaskSort";
import { sortNestedTasks } from "@/domain/spydr/utils/nestedTaskSort";

interface ProjectListProps {
  projects: ProjectNode[];
  areas: ProjectAreaNode[];
  people: PersonNode[];
  tasksByProjectId: Map<string, TaskNode[]>;
  visibleColumns: ProjectColumnId[];
  sort: ProjectListSort;
  reorderEnabled?: boolean;
  /** Full filtered order when `projects` is a page slice. */
  rankOrderIds?: string[];
  getPriorityRank(id: string): number | undefined;
  onReorder?(orderedIds: string[]): void;
  onMoveRank?(id: string, direction: RankMoveDirection): void;
  onSetRank?(id: string, rank: number): void;
  updatingProjectId?: string | null;
  updatingTaskId?: string | null;
  creatingTaskProjectId?: string | null;
  hasActiveFilters?: boolean;
  onSortColumn?(column: ProjectSortColumn): void;
  onClearFilters?(): void;
  onTitleChange?(projectId: string, title: string): void;
  onEmojiChange?(projectId: string, emoji: string | null): void;
  onStatusChange?(projectId: string, status: string): void;
  onAreaChange?(projectId: string, areaNodeId: string | null): void;
  onPriorityChange?(projectId: string, priority: string): void;
  onTargetDateChange?(projectId: string, targetDate: string | null): void;
  onAssigneeChange?(projectId: string, assigneePersonNodeId: string | null): void;
  onTaskStatusChange?(taskId: string, status: string): void;
  onTaskDueDateChange?(taskId: string, dueDate: string | null): void;
  onTaskAssigneeChange?(taskId: string, assigneePersonNodeId: string | null): void;
  onTaskTitleChange?(taskId: string, title: string): void;
  onTaskEmojiChange?(taskId: string, emoji: string | null): void;
  onCreateTask?(projectId: string, title: string, onSuccess?: () => void): void;
  onDeleteTask?(taskId: string): void;
  onDelete?(projectId: string): void;
  deletingTaskIds?: string[];
  deletingProjectId?: string | null;
  expandedIds?: Set<string>;
  onExpandedIdsChange?(next: Set<string>): void;
  showCompletedTasks?: boolean;
  onShowCompletedTasksChange?(show: boolean): void;
  todoTaskIds?: Set<string>;
  togglingTodoTaskId?: string | null;
  onToggleTodo?(taskId: string, onTodo: boolean): void;
}

function toggleExpandedId(current: Set<string>, projectId: string): Set<string> {
  const next = new Set(current);
  if (next.has(projectId)) next.delete(projectId);
  else next.add(projectId);
  return next;
}

function addExpandedId(current: Set<string>, projectId: string): Set<string> {
  const next = new Set(current);
  next.add(projectId);
  return next;
}

type ProjectListWidthColumn = "name" | ProjectColumnId;

const PROJECT_LIST_COLUMN_DEFAULTS: Record<ProjectListWidthColumn, number> = {
  name: 320,
  area: 148,
  assignee: 180,
  priority: 132,
  status: 160,
  target: 112,
  updated: 128,
};

const PROJECT_LIST_COLUMN_MIN: Partial<Record<ProjectListWidthColumn, number>> = {
  name: 160,
  area: 108,
  assignee: 128,
  priority: 104,
  status: 120,
  target: 96,
  updated: 96,
};

const actionsColumnWidth = 48;
const actionsColumnWidthWithCreate = 76;
const rankColumnWidth = 36;
const expandColumnWidth = 32;
const reorderColumnWidth = 52;
const PROJECT_LIST_GAP_PX = 16;
const PROJECT_LIST_PADDING_X = 48;

function getProjectListTracks(
  visibleColumns: ProjectColumnId[],
  widths: Record<ProjectListWidthColumn, number>,
  reorderEnabled = false,
  showCreateTask = false
): number[] {
  const actionWidth = showCreateTask ? actionsColumnWidthWithCreate : actionsColumnWidth;
  return [
    ...(reorderEnabled ? [reorderColumnWidth] : []),
    expandColumnWidth,
    rankColumnWidth,
    widths.name,
    ...visibleColumns.map((id) => widths[id]),
    actionWidth,
  ];
}

function getProjectListGrid(
  visibleColumns: ProjectColumnId[],
  widths: Record<ProjectListWidthColumn, number>,
  reorderEnabled = false,
  showCreateTask = false
) {
  const actionWidth = showCreateTask ? actionsColumnWidthWithCreate : actionsColumnWidth;
  return gridTemplateFromTracks([
    ...(reorderEnabled ? [reorderColumnWidth] : []),
    expandColumnWidth,
    rankColumnWidth,
    widths.name === PROJECT_LIST_COLUMN_DEFAULTS.name
      ? `minmax(${widths.name}px, 1fr)`
      : widths.name,
    ...visibleColumns.map((id) => widths[id]),
    actionWidth,
  ]);
}

function ProjectResizableHeader({
  label,
  column,
  sizing,
  children,
}: {
  label: string;
  column: ProjectListWidthColumn;
  sizing: ReturnType<typeof useResizableColumns<ProjectListWidthColumn>>;
  children: ReactNode;
}) {
  return (
    <ResizableHeaderCell
      label={label}
      width={sizing.widths[column]}
      minWidth={sizing.minWidthOf(column)}
      maxWidth={sizing.maxWidth}
      onWidthChange={(width) => sizing.setColumnWidth(column, width)}
      onReset={() => sizing.resetColumnWidth(column)}
    >
      {children}
    </ResizableHeaderCell>
  );
}

function SortableHeader({
  label,
  column,
  sort,
  align = "start",
  onSort,
}: {
  label: string;
  column: ProjectSortColumn;
  sort: ProjectListSort;
  align?: "start" | "end";
  onSort?(column: ProjectSortColumn): void;
}) {
  const isActive = sort.column === column;
  const Icon = !isActive ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;

  if (!onSort) {
    return (
      <span className={align === "end" ? "text-right" : "text-left"}>{label}</span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={cn(
        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
        align === "end" && "ml-auto",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span>{label}</span>
      <Icon className={cn("h-3 w-3", isActive && "text-primary")} aria-hidden />
    </button>
  );
}

function ProjectListDeleteButton({
  projectTitle,
  isConfirming,
  isDeleting,
  disabled,
  onRequestDelete,
  onConfirmDelete,
  onCancel,
}: {
  projectTitle: string;
  isConfirming: boolean;
  isDeleting: boolean;
  disabled?: boolean;
  onRequestDelete(): void;
  onConfirmDelete(): void;
  onCancel(): void;
}) {
  if (isConfirming) {
    return (
      <div className="flex items-center justify-end gap-0.5">
        <button
          type="button"
          disabled={isDeleting}
          onClick={(event) => {
            event.stopPropagation();
            onConfirmDelete();
          }}
          className="rounded px-1.5 py-1 text-[10px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          {isDeleting ? "…" : "Delete"}
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={(event) => {
            event.stopPropagation();
            onCancel();
          }}
          aria-label="Cancel delete"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onRequestDelete();
      }}
      aria-label={`Delete ${projectTitle}`}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function OpenTaskCount({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] tabular-nums",
        count > 0 ? "text-highlight" : "text-muted-foreground/70"
      )}
    >
      {count} open
    </span>
  );
}

function ProjectOpenDetailButton({
  projectId,
  projectTitle,
}: {
  projectId: string;
  projectTitle: string;
}) {
  return (
    <Link
      to={`/projects/${projectId}`}
      onClick={(event) => event.stopPropagation()}
      aria-label={`Open ${projectTitle}`}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-highlight/25 bg-highlight/10 text-highlight hover:border-highlight/50 hover:bg-highlight/18"
    >
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function ProjectAddTaskButton({
  projectTitle,
  composing,
  disabled,
  onToggle,
}: {
  projectTitle: string;
  composing: boolean;
  disabled: boolean;
  onToggle(): void;
}) {
  return (
    <button
      type="button"
      aria-label={`Add task to ${projectTitle}`}
      aria-pressed={composing}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className={cn(
        "grid h-7 w-7 shrink-0 place-items-center rounded-sm transition-colors disabled:opacity-50",
        composing
          ? "bg-highlight/15 text-highlight"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <Plus className="h-3.5 w-3.5" />
    </button>
  );
}

function ProjectListTitleInput({
  projectId,
  title,
  disabled,
  onTitleChange,
  className,
}: {
  projectId: string;
  title: string;
  disabled?: boolean;
  onTitleChange?(projectId: string, title: string): void;
  className?: string;
}) {
  const [draft, setDraft] = useState(title);

  useEffect(() => {
    setDraft(title);
  }, [title]);

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === title) {
      setDraft(title);
      return;
    }
    onTitleChange?.(projectId, trimmed);
  };

  if (!onTitleChange) {
    return (
      <Link
        to={`/projects/${projectId}`}
        className={cn(
          "min-w-0 truncate text-[13px] font-medium hover:text-highlight",
          className
        )}
      >
        {title}
      </Link>
    );
  }

  return (
    <input
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          setDraft(title);
          event.currentTarget.blur();
        }
      }}
      onClick={(event) => event.stopPropagation()}
      disabled={disabled}
      aria-label="Project name"
      className={cn(
        "min-w-0 flex-1 truncate bg-transparent text-[13px] font-medium outline-none ring-focus placeholder:text-muted-foreground disabled:opacity-60",
        className
      )}
    />
  );
}

function resolveTaskAssigneeId(task: TaskNode): string | null {
  return task.assignee?.id ?? task.details?.assigneePersonNodeId ?? null;
}

const nestedTaskGrid =
  "grid grid-cols-[minmax(148px,0.55fr)_28px_minmax(10rem,8fr)_minmax(9.5rem,0.35fr)_minmax(11rem,0.8fr)_minmax(108px,0.25fr)_28px_28px] items-center gap-2";
const nestedTaskGridCompact =
  "grid grid-cols-[28px_28px_minmax(0,8fr)_minmax(7.5rem,0.35fr)_minmax(9.5rem,0.8fr)_minmax(4.5rem,0.25fr)_28px_28px] items-center gap-1";

function NestedTaskSortHeader({
  sort,
  onSort,
  compact = false,
}: {
  sort: CollectionSortState;
  onSort(column: string): void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className={cn(nestedTaskGridCompact, "px-1 pb-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground")}>
        <span aria-hidden />
        <span aria-hidden />
        <CollectionSortableHeader
          label="Task"
          column="title"
          sort={sort}
          onSort={onSort}
        />
        <span>Done</span>
        <CollectionSortableHeader
          label="Assignee"
          column="assignee"
          sort={sort}
          onSort={onSort}
        />
        <CollectionSortableHeader
          label="Due"
          column="due"
          sort={sort}
          align="end"
          onSort={onSort}
        />
        <span aria-hidden />
        <span aria-hidden />
      </div>
    );
  }

  return (
    <div className={cn(nestedTaskGrid, "px-2.5 pb-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground")}>
      <CollectionSortableHeader
        label="Status"
        column="status"
        sort={sort}
        onSort={onSort}
      />
      <span aria-hidden />
      <CollectionSortableHeader
        label="Task"
        column="title"
        sort={sort}
        onSort={onSort}
      />
      <span>Done</span>
      <CollectionSortableHeader
        label="Assignee"
        column="assignee"
        sort={sort}
        onSort={onSort}
      />
      <CollectionSortableHeader
        label="Due"
        column="due"
        sort={sort}
        align="end"
        onSort={onSort}
      />
      <span aria-hidden />
      <span aria-hidden />
    </div>
  );
}

function NestedTaskRow({
  task,
  project,
  people,
  busy,
  compact = false,
  isDeleting = false,
  deleteDisabled = false,
  onStatusChange,
  onDueDateChange,
  onAssigneeChange,
  onTitleChange,
  onEmojiChange,
  onDelete,
  onTodo = false,
  togglingTodo = false,
  onToggleTodo,
}: {
  task: TaskNode;
  project: ProjectNode;
  people: PersonNode[];
  busy: boolean;
  compact?: boolean;
  isDeleting?: boolean;
  deleteDisabled?: boolean;
  onStatusChange?(taskId: string, status: string): void;
  onDueDateChange?(taskId: string, dueDate: string | null): void;
  onAssigneeChange?(taskId: string, assigneePersonNodeId: string | null): void;
  onTitleChange?(taskId: string, title: string): void;
  onEmojiChange?(taskId: string, emoji: string | null): void;
  onDelete?(taskId: string): void;
  onTodo?: boolean;
  togglingTodo?: boolean;
  onToggleTodo?(taskId: string, onTodo: boolean): void;
}) {
  const assigneeId = resolveTaskAssigneeId(task);
  const deleteControl = onDelete ? (
    <InlineDeleteButton
      label={task.title}
      isDeleting={isDeleting}
      disabled={deleteDisabled}
      onDelete={() => onDelete(task.id)}
    />
  ) : null;
  const todoControl = onToggleTodo ? (
    <AddToTodoButton
      onTodo={onTodo}
      busy={togglingTodo}
      onToggle={() => onToggleTodo(task.id, onTodo)}
    />
  ) : null;
  const assigneeControl = onAssigneeChange ? (
    <PersonSelect
      people={people}
      value={assigneeId}
      compact
      disabled={busy}
      className="w-full min-w-0"
      ariaLabel="Task assignee"
      onChange={(nextAssigneeId) => {
        if (nextAssigneeId !== assigneeId) {
          onAssigneeChange(task.id, nextAssigneeId);
        }
      }}
    />
  ) : task.assignee ? (
    <span className="block min-w-0 truncate text-[11px] text-muted-foreground">
      {task.assignee.details?.fullName ?? task.assignee.title}
    </span>
  ) : (
    <span aria-hidden />
  );
  const titleControl = (
    <div className="flex min-w-0 flex-1 items-center gap-0.5">
      <EmojiPicker
        value={task.details?.emoji}
        disabled={busy || !onEmojiChange}
        ariaLabel={`Emoji for ${task.title}`}
        onChange={(emoji) => onEmojiChange?.(task.id, emoji)}
      />
      <TaskTitleInput
        taskId={task.id}
        title={task.title}
        disabled={busy}
        onTitleChange={onTitleChange}
      />
    </div>
  );
  const openControl = (
    <Link
      to={`/tasks/${task.id}`}
      aria-label={`Open ${task.title}`}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-highlight/25 bg-highlight/10 text-highlight hover:border-highlight/50 hover:bg-highlight/18"
    >
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
  const completedControl = (
    <span className="min-w-0">
      <TaskCompletedAt
        status={task.status}
        completedAt={task.details?.completedAt}
        className="truncate"
      />
    </span>
  );

  if (compact) {
    return (
      <div className={cn(nestedTaskGridCompact, "rounded-sm border border-border/20 border-l-2 border-l-highlight/18 bg-canvas px-1 py-0.5")}>
        <TaskStatusSelect
          value={task.status}
          disabled={!onStatusChange || busy}
          appearance="icon"
          className="h-7 w-7"
          onChange={(status) => onStatusChange?.(task.id, status)}
        />
        {openControl}
        {titleControl}
        {completedControl}
        {assigneeControl}
        <TaskDueDateSelect
          value={task.details?.dueDate}
          disabled={!onDueDateChange || busy}
          placeholder="Due"
          showChevron={false}
          showIcon={false}
          className="h-7 w-full"
          project={project}
          onChange={(dueDate) => onDueDateChange?.(task.id, dueDate)}
        />
        {todoControl ?? <span aria-hidden />}
        {deleteControl ?? <span aria-hidden />}
      </div>
    );
  }

  return (
    <div className={cn(nestedTaskGrid, "rounded-sm border border-border/20 border-l-2 border-l-highlight/18 bg-canvas px-2.5 py-1.5")}>
      <TaskStatusSelect
        value={task.status}
        disabled={!onStatusChange || busy}
        className="w-full min-w-0"
        onChange={(status) => onStatusChange?.(task.id, status)}
      />
      {openControl}
      {titleControl}
      {completedControl}
      {assigneeControl}
      <TaskDueDateSelect
        value={task.details?.dueDate}
        disabled={!onDueDateChange || busy}
        placeholder="Due"
        className="w-full"
        project={project}
        onChange={(dueDate) => onDueDateChange?.(task.id, dueDate)}
      />
      {todoControl ?? <span aria-hidden />}
      {deleteControl ?? <span aria-hidden />}
    </div>
  );
}

function ProjectTaskComposer({
  projectTitle,
  draft,
  busy,
  onCancel,
  onDraftChange,
  onSubmit,
}: {
  projectTitle: string;
  draft: string;
  busy: boolean;
  onCancel(): void;
  onDraftChange(value: string): void;
  onSubmit(): void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form
      className="flex items-center gap-2 rounded-sm border border-highlight/25 bg-background px-2 py-1"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Plus className="h-3.5 w-3.5 shrink-0 text-highlight/80" aria-hidden />
      <input
        ref={inputRef}
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
        placeholder={`New task on ${projectTitle}…`}
        disabled={busy}
        aria-label={`New task for ${projectTitle}`}
        className="h-10 min-w-0 flex-1 bg-transparent px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={busy || draft.trim().length === 0}
        className="h-7 shrink-0 rounded-sm bg-primary px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-primary-foreground transition-opacity disabled:opacity-40"
      >
        {busy ? "…" : "Add"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onCancel}
        aria-label="Cancel"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}

export function ProjectList({
  projects,
  areas,
  people,
  tasksByProjectId,
  visibleColumns,
  sort,
  reorderEnabled = false,
  rankOrderIds,
  getPriorityRank,
  onReorder,
  onMoveRank,
  onSetRank,
  updatingProjectId = null,
  updatingTaskId = null,
  creatingTaskProjectId = null,
  hasActiveFilters = false,
  onSortColumn,
  onClearFilters,
  onTitleChange,
  onEmojiChange,
  onStatusChange,
  onAreaChange,
  onPriorityChange,
  onTargetDateChange,
  onAssigneeChange,
  onTaskStatusChange,
  onTaskDueDateChange,
  onTaskAssigneeChange,
  onTaskTitleChange,
  onTaskEmojiChange,
  onCreateTask,
  onDeleteTask,
  onDelete,
  deletingTaskIds = [],
  deletingProjectId = null,
  expandedIds: controlledExpandedIds,
  onExpandedIdsChange,
  showCompletedTasks: controlledShowCompletedTasks,
  onShowCompletedTasksChange,
  todoTaskIds,
  togglingTodoTaskId = null,
  onToggleTodo,
}: ProjectListProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [uncontrolledShowCompletedTasks, setUncontrolledShowCompletedTasks] =
    useState(false);
  const showCompletedTasks =
    controlledShowCompletedTasks ?? uncontrolledShowCompletedTasks;
  const setShowCompletedTasks =
    onShowCompletedTasksChange ?? setUncontrolledShowCompletedTasks;
  const showInlineCompletedToggle = !onShowCompletedTasksChange;
  const [uncontrolledExpandedIds, setUncontrolledExpandedIds] = useState<Set<string>>(
    new Set()
  );
  const expandedIds = controlledExpandedIds ?? uncontrolledExpandedIds;
  const setExpandedIds = onExpandedIdsChange ?? setUncontrolledExpandedIds;
  const [composingProjectId, setComposingProjectId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const isPhone = useIsPhone();
  const nestedTaskSort = useNestedTaskSort();
  const columnSizing = useResizableColumns(
    "projects",
    PROJECT_LIST_COLUMN_DEFAULTS,
    { minWidths: PROJECT_LIST_COLUMN_MIN }
  );
  const gridTracks = getProjectListTracks(
    visibleColumns,
    columnSizing.widths,
    reorderEnabled,
    Boolean(onCreateTask)
  );
  const gridTemplateColumns = getProjectListGrid(
    visibleColumns,
    columnSizing.widths,
    reorderEnabled,
    Boolean(onCreateTask)
  );
  const minWidth = gridMinWidth(
    gridTracks,
    PROJECT_LIST_GAP_PX,
    PROJECT_LIST_PADDING_X
  );
  const hasColumn = (columnId: ProjectColumnId) => visibleColumns.includes(columnId);
  const orderIds = useMemo(
    () => rankOrderIds ?? projects.map((project) => project.id),
    [rankOrderIds, projects]
  );

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

  const rankControls = (projectId: string, dragHandleProps?: Record<string, unknown>) => {
    const rankIndex = orderIds.indexOf(projectId);
    return (
      <CollectionReorderControls
        dragHandleProps={dragHandleProps}
        showDragHandle={!isPhone}
        canMoveUp={rankIndex > 0}
        canMoveDown={rankIndex >= 0 && rankIndex < orderIds.length - 1}
        onMoveUp={() => moveRank(projectId, "up")}
        onMoveDown={() => moveRank(projectId, "down")}
      />
    );
  };

  const completedTaskCount = useMemo(() => {
    let count = 0;
    for (const project of projects) {
      const tasks = tasksByProjectId.get(project.id) ?? [];
      count += tasks.filter((task) => isClosedCollectionStatus(task.status)).length;
    }
    return count;
  }, [projects, tasksByProjectId]);

  useEffect(() => {
    if (!pendingDeleteId) return;
    const timeout = window.setTimeout(() => setPendingDeleteId(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [pendingDeleteId]);

  const toggleExpanded = (projectId: string) => {
    setExpandedIds(toggleExpandedId(expandedIds, projectId));
  };

  const startCompose = (projectId: string) => {
    setComposingProjectId(projectId);
    setDraftTitle("");
    setExpandedIds(addExpandedId(expandedIds, projectId));
  };

  const cancelCompose = () => {
    setComposingProjectId(null);
    setDraftTitle("");
  };

  const submitCompose = (projectId: string) => {
    if (!onCreateTask || draftTitle.trim().length === 0) return;
    onCreateTask(projectId, draftTitle, () => {
      setDraftTitle("");
      setExpandedIds(addExpandedId(expandedIds, projectId));
    });
  };

  const visibleTasksFor = (projectId: string) => {
    const tasks = tasksByProjectId.get(projectId) ?? [];
    const visible = showCompletedTasks
      ? tasks
      : tasks.filter((task) => !isClosedCollectionStatus(task.status));
    return sortNestedTasks(visible, nestedTaskSort.sort);
  };

  return (
    <div className={isPhone ? "" : "touch-scroll-x"}>
      {isPhone ? (
        <div className="flex items-center justify-end border-b border-border/70 px-2 py-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]">
                <ArrowUpDown className="h-3.5 w-3.5" />
                {nestedTaskSort.sorts.find(
                  (entry) => entry.id === nestedTaskSort.sort.columnId
                )?.label ?? "Sort tasks"}
              </Button>
            </DropdownMenuTrigger>
            <CollectionSortMenu
              sorts={nestedTaskSort.sorts}
              sort={nestedTaskSort.sort}
              onToggleSort={nestedTaskSort.toggleSort}
            />
          </DropdownMenu>
        </div>
      ) : null}
      {showInlineCompletedToggle && completedTaskCount > 0 ? (
        <div className="flex items-center justify-end gap-2 border-b border-border/70 px-4 py-1.5 md:px-6">
          <ShowCompletedToggle
            showCompleted={showCompletedTasks}
            completedCount={completedTaskCount}
            onChange={setShowCompletedTasks}
          />
        </div>
      ) : null}
      {isPhone ? null : (
      <div
        className="grid items-center gap-4 border-b border-border bg-muted/20 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground [&>*]:min-w-0 md:px-6"
        style={{ gridTemplateColumns, minWidth }}
      >
        {reorderEnabled ? <span aria-hidden /> : null}
        <span aria-hidden />
        <SortableHeader label="Rank" column="order" sort={sort} onSort={onSortColumn} />
        <ProjectResizableHeader label="Name" column="name" sizing={columnSizing}>
          <SortableHeader label="Name" column="name" sort={sort} onSort={onSortColumn} />
        </ProjectResizableHeader>
        {hasColumn("area") && (
          <ProjectResizableHeader label="Area" column="area" sizing={columnSizing}>
            <SortableHeader
              label="Area"
              column="area"
              sort={sort}
              onSort={onSortColumn}
            />
          </ProjectResizableHeader>
        )}
        {hasColumn("assignee") && (
          <ProjectResizableHeader label="Assignee" column="assignee" sizing={columnSizing}>
            <SortableHeader
              label="Assignee"
              column="assignee"
              sort={sort}
              onSort={onSortColumn}
            />
          </ProjectResizableHeader>
        )}
        {hasColumn("priority") && (
          <ProjectResizableHeader label="Priority" column="priority" sizing={columnSizing}>
            <SortableHeader
              label="Priority"
              column="priority"
              sort={sort}
              onSort={onSortColumn}
            />
          </ProjectResizableHeader>
        )}
        {hasColumn("status") && (
          <ProjectResizableHeader label="Status" column="status" sizing={columnSizing}>
            <SortableHeader
              label="Status"
              column="status"
              sort={sort}
              onSort={onSortColumn}
            />
          </ProjectResizableHeader>
        )}
        {hasColumn("target") && (
          <ProjectResizableHeader label="Target" column="target" sizing={columnSizing}>
            <SortableHeader
              label="Target"
              column="target"
              sort={sort}
              align="end"
              onSort={onSortColumn}
            />
          </ProjectResizableHeader>
        )}
        {hasColumn("updated") && (
          <ProjectResizableHeader label="Updated" column="updated" sizing={columnSizing}>
            <SortableHeader
              label="Updated"
              column="updated"
              sort={sort}
              align="end"
              onSort={onSortColumn}
            />
          </ProjectResizableHeader>
        )}
        <span />
      </div>
      )}
      {projects.length === 0 ? (
        <div className="px-4 py-10 text-center md:px-6">
          <p className="text-[13px] font-medium text-foreground/90">
            No projects match your filters
          </p>
          {hasActiveFilters && onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-2 text-[12px] text-primary hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <CollectionSortableList
          items={projects}
          enabled={reorderEnabled && !isPhone}
          className={
            isPhone ? "space-y-1.5 px-2 py-2" : "space-y-1.5 px-3 py-2 md:px-4"
          }
          onReorder={(orderedIds) => onReorder?.(orderedIds)}
          renderItem={(project, sortable) => {
            const allProjectTasks = tasksByProjectId.get(project.id) ?? [];
            const visibleTasks = visibleTasksFor(project.id);
            const openCount = allProjectTasks.filter(
              (task) => !isClosedCollectionStatus(task.status)
            ).length;
            const composing = composingProjectId === project.id;
            const canExpand = visibleTasks.length > 0 || composing;
            const expanded = expandedIds.has(project.id) && visibleTasks.length > 0;
            const showChildren = expanded || composing;

            if (isPhone) {
              return (
                <div
                  className={cn(
                    "overflow-hidden rounded-md border",
                    showChildren
                      ? "border-border bg-muted/15 ring-1 ring-border/50"
                      : "border-border/70 bg-background"
                  )}
                >
                  <div className="flex min-w-0 items-stretch">
                    {onAreaChange ? (
                      <ProjectAreaSelect
                        appearance="rail"
                        areas={areas}
                        value={resolveProjectAreaId(project, areas)}
                        onChange={(areaNodeId) => onAreaChange(project.id, areaNodeId)}
                        disabled={updatingProjectId === project.id}
                      />
                    ) : (
                      <span
                        className="w-1.5 shrink-0 self-stretch rounded-sm bg-muted/60"
                        aria-hidden
                      />
                    )}
                    <div className="flex min-w-0 flex-1 items-center gap-1 py-0.5 pl-1 pr-1">
                        {reorderEnabled ? rankControls(project.id, sortable.dragHandleProps) : null}
                        {visibleTasks.length > 0 ? (
                          <RowExpandToggle
                            expanded={expanded}
                            onToggle={() => toggleExpanded(project.id)}
                          />
                        ) : null}
                        <CollectionPriorityRank
                          rank={getPriorityRank(project.id)}
                          maxRank={orderIds.length}
                          onRankChange={
                            canEditRank
                              ? (rank) => setRank(project.id, rank)
                              : undefined
                          }
                          className="min-w-[1.15rem] px-0.5"
                        />
                        <EmojiPicker
                          value={project.details?.emoji}
                          disabled={
                            updatingProjectId === project.id || !onEmojiChange
                          }
                          ariaLabel={`Emoji for ${project.title}`}
                          onChange={(emoji) => onEmojiChange?.(project.id, emoji)}
                        />
                        <ProjectListTitleInput
                          projectId={project.id}
                          title={project.title}
                          disabled={updatingProjectId === project.id}
                          onTitleChange={onTitleChange}
                          className="text-[12px]"
                        />
                        <ProjectTargetDateSelect
                          value={project.details?.targetDate}
                          placeholder="Due"
                          showChevron={false}
                          showIcon={false}
                          className="h-7 w-[4.5rem] shrink-0"
                          onChange={(targetDate) => {
                            const current =
                              project.details?.targetDate?.slice(0, 10) ?? null;
                            const next = targetDate?.slice(0, 10) ?? null;
                            if (next !== current) {
                              onTargetDateChange?.(project.id, targetDate);
                            }
                          }}
                          disabled={
                            !onTargetDateChange || updatingProjectId === project.id
                          }
                        />
                        {onCreateTask ? (
                          <ProjectAddTaskButton
                            projectTitle={project.title}
                            composing={composing}
                            disabled={creatingTaskProjectId === project.id}
                            onToggle={() => {
                              if (composing) cancelCompose();
                              else startCompose(project.id);
                            }}
                          />
                        ) : null}
                        <ProjectOpenDetailButton
                          projectId={project.id}
                          projectTitle={project.title}
                        />
                    </div>
                  </div>
                  {showChildren ? (
                    <div className="space-y-1 border-t border-border/50 bg-canvas/80 px-2 py-1.5">
                      {expanded ? (
                        <>
                          {visibleTasks.length > 0 ? (
                            <NestedTaskSortHeader
                              compact
                              sort={nestedTaskSort.sort}
                              onSort={nestedTaskSort.toggleSort}
                            />
                          ) : null}
                          {visibleTasks.map((task) => (
                            <NestedTaskRow
                              key={task.id}
                              task={task}
                              project={project}
                              people={people}
                              compact
                              busy={
                                updatingTaskId === task.id ||
                                deletingTaskIds.includes(task.id)
                              }
                              isDeleting={deletingTaskIds.includes(task.id)}
                              deleteDisabled={
                                deletingTaskIds.length > 0 &&
                                !deletingTaskIds.includes(task.id)
                              }
                              onStatusChange={onTaskStatusChange}
                              onDueDateChange={onTaskDueDateChange}
                              onAssigneeChange={onTaskAssigneeChange}
                              onTitleChange={onTaskTitleChange}
                              onEmojiChange={onTaskEmojiChange}
                              onDelete={onDeleteTask}
                              onTodo={todoTaskIds?.has(task.id) ?? false}
                              togglingTodo={togglingTodoTaskId === task.id}
                              onToggleTodo={onToggleTodo}
                            />
                          ))}
                        </>
                      ) : null}
                      {composing && onCreateTask ? (
                        <ProjectTaskComposer
                          projectTitle={project.title}
                          draft={draftTitle}
                          busy={creatingTaskProjectId === project.id}
                          onCancel={cancelCompose}
                          onDraftChange={setDraftTitle}
                          onSubmit={() => submitCompose(project.id)}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <div
                className={cn(
                  "overflow-hidden rounded-sm border",
                  showChildren
                    ? "border-border bg-muted/15 ring-1 ring-border/60"
                    : "border-border/70 bg-background"
                )}
              >
                <div
                  className={cn(
                    "grid items-center gap-4 px-3 py-2.5 [&>*]:min-w-0",
                    showChildren && "border-b border-border/50 bg-muted/45",
                    !showChildren && "row-hover"
                  )}
                  style={{ gridTemplateColumns, minWidth: `calc(${minWidth}px - 1.5rem)` }}
                >
                  {reorderEnabled ? rankControls(project.id, sortable.dragHandleProps) : null}
                  {canExpand ? (
                    <RowExpandToggle
                      expanded={expanded}
                      onToggle={() => toggleExpanded(project.id)}
                    />
                  ) : (
                    <span aria-hidden className="h-7 w-7" />
                  )}
                  <CollectionPriorityRank
                    rank={getPriorityRank(project.id)}
                    maxRank={orderIds.length}
                    onRankChange={
                      canEditRank ? (rank) => setRank(project.id, rank) : undefined
                    }
                  />
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      {!hasColumn("status") && onStatusChange ? (
                        <span onClick={(event) => event.stopPropagation()}>
                          <ProjectStatusSelect
                            value={project.status}
                            onChange={(status) => onStatusChange(project.id, status)}
                            disabled={updatingProjectId === project.id}
                            className="w-[148px] shrink-0"
                          />
                        </span>
                      ) : (
                        <StatusDot status={project.status} />
                      )}
                      <div className="flex min-w-0 flex-1 items-center gap-1.5">
                        <ProjectOpenDetailButton
                          projectId={project.id}
                          projectTitle={project.title}
                        />
                        <EmojiPicker
                          value={project.details?.emoji}
                          disabled={
                            updatingProjectId === project.id || !onEmojiChange
                          }
                          ariaLabel={`Emoji for ${project.title}`}
                          onChange={(emoji) => onEmojiChange?.(project.id, emoji)}
                        />
                        <ProjectListTitleInput
                          projectId={project.id}
                          title={project.title}
                          disabled={updatingProjectId === project.id}
                          onTitleChange={onTitleChange}
                        />
                      </div>
                      <OpenTaskCount count={openCount} />
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      {project.tags.slice(0, 3).map((tag) => (
                        <EntityTag key={tag} tag={tag} />
                      ))}
                      {project.details?.riskLevel && (
                        <span className="font-mono text-[10px] uppercase text-muted-foreground">
                          delivery risk {project.details.riskLevel}
                        </span>
                      )}
                    </div>
                  </div>
                  {hasColumn("area") && (
                    <span
                      className="block min-w-0 w-full"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {onAreaChange ? (
                        <ProjectAreaSelect
                          areas={areas}
                          value={resolveProjectAreaId(project, areas)}
                          onChange={(areaNodeId) => onAreaChange(project.id, areaNodeId)}
                          disabled={updatingProjectId === project.id}
                        />
                      ) : project.area ? (
                        <span className="rounded border border-border/20 bg-muted/20 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/80">
                          {project.area}
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          No area
                        </span>
                      )}
                    </span>
                  )}
                  {hasColumn("assignee") && (
                    <span
                      className="block min-w-0 w-full"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {onAssigneeChange ? (
                        <PersonSelect
                          people={people}
                          compact
                          value={
                            project.personas?.assignee?.id ??
                            project.details?.assigneePersonNodeId ??
                            null
                          }
                          onChange={(assigneePersonNodeId) =>
                            onAssigneeChange(project.id, assigneePersonNodeId)
                          }
                          disabled={updatingProjectId === project.id}
                          ariaLabel="Project assignee"
                        />
                      ) : (
                        <span className="truncate text-[12px] text-muted-foreground">
                          {project.personas?.assignee?.details?.fullName ??
                            project.personas?.assignee?.title ??
                            "—"}
                        </span>
                      )}
                    </span>
                  )}
                  {hasColumn("priority") && (
                    <span
                      className="block min-w-0 w-full"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {onPriorityChange ? (
                        <ProjectPrioritySelect
                          value={project.priority}
                          onChange={(priority) => onPriorityChange(project.id, priority)}
                          disabled={updatingProjectId === project.id}
                        />
                      ) : (
                        <PriorityBadge priority={project.priority} />
                      )}
                    </span>
                  )}
                  {hasColumn("status") && (
                    <span
                      className="block min-w-0 w-full"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {onStatusChange ? (
                        <ProjectStatusSelect
                          value={project.status}
                          onChange={(status) => onStatusChange(project.id, status)}
                          disabled={updatingProjectId === project.id}
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded border border-border/20 bg-muted/20 px-1.5 py-px text-[11px] capitalize text-foreground/80">
                          <StatusDot status={project.status} />
                          {project.status.replace(/_/g, " ")}
                        </span>
                      )}
                    </span>
                  )}
                  {hasColumn("target") && (
                    <span
                      className="block min-w-0 w-full"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ProjectTargetDateSelect
                        value={project.details?.targetDate}
                        onChange={(targetDate) => {
                          const current =
                            project.details?.targetDate?.slice(0, 10) ?? null;
                          const next = targetDate?.slice(0, 10) ?? null;
                          if (next !== current) {
                            onTargetDateChange?.(project.id, targetDate);
                          }
                        }}
                        disabled={
                          !onTargetDateChange || updatingProjectId === project.id
                        }
                      />
                    </span>
                  )}
                  {hasColumn("updated") && (
                    <span className="justify-self-end text-right font-mono text-[11px] text-muted-foreground">
                      {formatRelativeTime(project.updatedAt)}
                    </span>
                  )}
                  <div className="flex shrink-0 items-center justify-end gap-1.5">
                    {onCreateTask ? (
                      <ProjectAddTaskButton
                        projectTitle={project.title}
                        composing={composing}
                        disabled={creatingTaskProjectId === project.id}
                        onToggle={() => {
                          if (composing) cancelCompose();
                          else startCompose(project.id);
                        }}
                      />
                    ) : null}
                    {onDelete ? (
                      <ProjectListDeleteButton
                        projectTitle={project.title}
                        isConfirming={pendingDeleteId === project.id}
                        isDeleting={deletingProjectId === project.id}
                        disabled={
                          deletingProjectId !== null &&
                          deletingProjectId !== project.id
                        }
                        onRequestDelete={() => setPendingDeleteId(project.id)}
                        onConfirmDelete={() => {
                          setPendingDeleteId(null);
                          onDelete(project.id);
                        }}
                        onCancel={() => setPendingDeleteId(null)}
                      />
                    ) : null}
                  </div>
                </div>

                {showChildren ? (
                  <div className="relative space-y-1.5 bg-canvas/80 py-1.5 pl-20 pr-3">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute bottom-2 left-9 top-2 w-px bg-[hsl(var(--connector-line))]"
                    />
                    {expanded ? (
                      <>
                        {visibleTasks.length > 0 ? (
                          <NestedTaskSortHeader
                            sort={nestedTaskSort.sort}
                            onSort={nestedTaskSort.toggleSort}
                          />
                        ) : null}
                        {visibleTasks.map((task) => (
                          <NestedTaskRow
                            key={task.id}
                            task={task}
                            project={project}
                            people={people}
                            busy={
                              updatingTaskId === task.id ||
                              deletingTaskIds.includes(task.id)
                            }
                            isDeleting={deletingTaskIds.includes(task.id)}
                            deleteDisabled={
                              deletingTaskIds.length > 0 &&
                              !deletingTaskIds.includes(task.id)
                            }
                            onStatusChange={onTaskStatusChange}
                            onDueDateChange={onTaskDueDateChange}
                            onAssigneeChange={onTaskAssigneeChange}
                            onTitleChange={onTaskTitleChange}
                            onEmojiChange={onTaskEmojiChange}
                            onDelete={onDeleteTask}
                            onTodo={todoTaskIds?.has(task.id) ?? false}
                            togglingTodo={togglingTodoTaskId === task.id}
                            onToggleTodo={onToggleTodo}
                          />
                        ))}
                      </>
                    ) : null}
                    {composing && onCreateTask ? (
                      <ProjectTaskComposer
                        projectTitle={project.title}
                        draft={draftTitle}
                        busy={creatingTaskProjectId === project.id}
                        onCancel={cancelCompose}
                        onDraftChange={setDraftTitle}
                        onSubmit={() => submitCompose(project.id)}
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
