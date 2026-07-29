import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import { ShowCompletedToggle } from "@/domain/spydr/features/shared/components/ShowCompletedToggle";
import { TaskStatusSelect } from "@/domain/spydr/features/tasks/components/TaskStatusSelect";
import { TaskDueDateSelect } from "@/domain/spydr/features/tasks/components/TaskDueDateSelect";
import { cn } from "@/lib/utils";
import type { ProjectColumnId } from "../hooks/useProjectListColumns";
import { ProjectAreaSelect } from "./ProjectAreaSelect";
import { ProjectPrioritySelect } from "./ProjectPrioritySelect";
import { ProjectStatusSelect } from "./ProjectStatusSelect";
import { ProjectTargetDateSelect } from "./ProjectTargetDateSelect";
import { PersonSelect } from "./PersonSelect";

interface ProjectListProps {
  projects: ProjectNode[];
  areas: ProjectAreaNode[];
  people: PersonNode[];
  tasksByProjectId: Map<string, TaskNode[]>;
  visibleColumns: ProjectColumnId[];
  sort: ProjectListSort;
  reorderEnabled?: boolean;
  getPriorityRank(id: string): number | undefined;
  onReorder?(orderedIds: string[]): void;
  updatingProjectId?: string | null;
  updatingTaskId?: string | null;
  creatingTaskProjectId?: string | null;
  hasActiveFilters?: boolean;
  onSortColumn?(column: ProjectSortColumn): void;
  onClearFilters?(): void;
  onStatusChange?(projectId: string, status: string): void;
  onAreaChange?(projectId: string, areaNodeId: string | null): void;
  onPriorityChange?(projectId: string, priority: string): void;
  onTargetDateChange?(projectId: string, targetDate: string | null): void;
  onAssigneeChange?(projectId: string, assigneePersonNodeId: string | null): void;
  onTaskStatusChange?(taskId: string, status: string): void;
  onTaskDueDateChange?(taskId: string, dueDate: string | null): void;
  onCreateTask?(projectId: string, title: string, onSuccess?: () => void): void;
  onDelete?(projectId: string): void;
  deletingProjectId?: string | null;
}

const columnWidths: Record<ProjectColumnId, string> = {
  area: "148px",
  assignee: "148px",
  priority: "104px",
  status: "128px",
  target: "112px",
  updated: "128px",
};

const actionsColumnWidth = "72px";
const rankColumnWidth = "36px";
const expandColumnWidth = "28px";

function getProjectListGrid(
  visibleColumns: ProjectColumnId[],
  reorderEnabled = false,
  showCreateTask = false
) {
  const actionWidth = showCreateTask ? "96px" : actionsColumnWidth;
  return [
    ...(reorderEnabled ? ["24px"] : []),
    expandColumnWidth,
    rankColumnWidth,
    "40px",
    "minmax(280px,1fr)",
    ...visibleColumns.map((id) => columnWidths[id]),
    actionWidth,
  ].join(" ");
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

function NestedTaskRow({
  task,
  busy,
  onStatusChange,
  onDueDateChange,
}: {
  task: TaskNode;
  busy: boolean;
  onStatusChange?(taskId: string, status: string): void;
  onDueDateChange?(taskId: string, dueDate: string | null): void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-border/50 border-l-2 border-l-highlight/35 bg-canvas px-2.5 py-1.5">
      <TaskStatusSelect
        value={task.status}
        disabled={!onStatusChange || busy}
        className="w-[100px] shrink-0"
        onChange={(status) => onStatusChange?.(task.id, status)}
      />
      <div className="min-w-0 flex-1">
        <Link
          to={`/tasks/${task.id}`}
          className="block truncate text-[13px] font-medium text-foreground/90 transition-colors hover:text-highlight"
        >
          {task.title}
        </Link>
        {task.assignee ? (
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
            {task.assignee.details?.fullName ?? task.assignee.title}
          </span>
        ) : null}
      </div>
      <span className="w-[108px] shrink-0">
        <TaskDueDateSelect
          value={task.details?.dueDate}
          disabled={!onDueDateChange || busy}
          className="w-full"
          onChange={(dueDate) => onDueDateChange?.(task.id, dueDate)}
        />
      </span>
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
        className="h-7 min-w-0 flex-1 bg-transparent px-1 text-[13px] text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
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
  getPriorityRank,
  onReorder,
  updatingProjectId = null,
  updatingTaskId = null,
  creatingTaskProjectId = null,
  hasActiveFilters = false,
  onSortColumn,
  onClearFilters,
  onStatusChange,
  onAreaChange,
  onPriorityChange,
  onTargetDateChange,
  onAssigneeChange,
  onTaskStatusChange,
  onTaskDueDateChange,
  onCreateTask,
  onDelete,
  deletingProjectId = null,
}: ProjectListProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [composingProjectId, setComposingProjectId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const gridTemplateColumns = getProjectListGrid(
    visibleColumns,
    reorderEnabled,
    Boolean(onCreateTask)
  );
  const minWidth =
    504 +
    visibleColumns.length * 112 +
    (onCreateTask ? 96 : 72) +
    (reorderEnabled ? 24 : 0);
  const hasColumn = (columnId: ProjectColumnId) => visibleColumns.includes(columnId);

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
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const startCompose = (projectId: string) => {
    setComposingProjectId(projectId);
    setDraftTitle("");
    setExpandedIds((current) => {
      const next = new Set(current);
      next.add(projectId);
      return next;
    });
  };

  const cancelCompose = () => {
    setComposingProjectId(null);
    setDraftTitle("");
  };

  const submitCompose = (projectId: string) => {
    if (!onCreateTask || draftTitle.trim().length === 0) return;
    onCreateTask(projectId, draftTitle, () => {
      setDraftTitle("");
      setExpandedIds((current) => {
        const next = new Set(current);
        next.add(projectId);
        return next;
      });
    });
  };

  const visibleTasksFor = (projectId: string) => {
    const tasks = tasksByProjectId.get(projectId) ?? [];
    return showCompletedTasks
      ? tasks
      : tasks.filter((task) => !isClosedCollectionStatus(task.status));
  };

  return (
    <div className="overflow-x-auto">
      {completedTaskCount > 0 ? (
        <div className="flex items-center justify-end gap-2 border-b border-border/70 px-6 py-1.5">
          <ShowCompletedToggle
            showCompleted={showCompletedTasks}
            completedCount={completedTaskCount}
            onChange={setShowCompletedTasks}
          />
        </div>
      ) : null}
      <div
        className="grid items-center gap-4 border-b border-border bg-muted/20 px-6 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        style={{ gridTemplateColumns, minWidth }}
      >
        {reorderEnabled ? <span aria-hidden /> : null}
        <span aria-hidden />
        <SortableHeader label="Rank" column="order" sort={sort} onSort={onSortColumn} />
        <span />
        <SortableHeader label="Name" column="name" sort={sort} onSort={onSortColumn} />
        {hasColumn("area") && (
          <SortableHeader
            label="Area"
            column="area"
            sort={sort}
            onSort={onSortColumn}
          />
        )}
        {hasColumn("assignee") && (
          <SortableHeader
            label="Assignee"
            column="assignee"
            sort={sort}
            onSort={onSortColumn}
          />
        )}
        {hasColumn("priority") && (
          <SortableHeader
            label="Priority"
            column="priority"
            sort={sort}
            onSort={onSortColumn}
          />
        )}
        {hasColumn("status") && (
          <SortableHeader
            label="Status"
            column="status"
            sort={sort}
            onSort={onSortColumn}
          />
        )}
        {hasColumn("target") && (
          <SortableHeader
            label="Target"
            column="target"
            sort={sort}
            align="end"
            onSort={onSortColumn}
          />
        )}
        {hasColumn("updated") && (
          <SortableHeader
            label="Updated"
            column="updated"
            sort={sort}
            align="end"
            onSort={onSortColumn}
          />
        )}
        <span />
      </div>
      {projects.length === 0 ? (
        <div className="px-6 py-10 text-center">
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
          enabled={reorderEnabled}
          className="space-y-1.5 px-3 py-2 md:px-4"
          onReorder={(orderedIds) => onReorder?.(orderedIds)}
          renderItem={(project, sortable) => {
            const allProjectTasks = tasksByProjectId.get(project.id) ?? [];
            const visibleTasks = visibleTasksFor(project.id);
            const openCount = allProjectTasks.filter(
              (task) => !isClosedCollectionStatus(task.status)
            ).length;
            const composing = composingProjectId === project.id;
            const canExpand = visibleTasks.length > 0 || composing;
            const expanded = expandedIds.has(project.id) && canExpand;
            const showChildren = expanded || composing;

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
                    "grid items-center gap-4 px-3 py-2.5",
                    showChildren && "border-b border-border/50 bg-muted/45",
                    !showChildren && "row-hover"
                  )}
                  style={{ gridTemplateColumns, minWidth: `calc(${minWidth}px - 1.5rem)` }}
                >
                  {reorderEnabled ? (
                    <CollectionDragHandle {...sortable.dragHandleProps} />
                  ) : null}
                  {canExpand ? (
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-label={expanded ? "Collapse tasks" : "Expand tasks"}
                      className="grid h-6 w-6 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                      onClick={() => toggleExpanded(project.id)}
                    >
                      {expanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  ) : (
                    <span aria-hidden className="h-6 w-6" />
                  )}
                  <CollectionPriorityRank rank={getPriorityRank(project.id)} />
                  <span className="grid h-7 w-7 place-items-center rounded border border-border bg-muted/40 font-mono text-[11px] text-muted-foreground">
                    {project.title.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <StatusDot status={project.status} />
                      <Link
                        to={`/projects/${project.id}`}
                        className="min-w-0 truncate text-[13px] font-medium hover:text-highlight"
                      >
                        {project.title}
                      </Link>
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
                        <span className="rounded border border-border bg-muted/40 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/80">
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
                        <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted/40 px-1.5 py-px text-[11px] capitalize text-foreground/80">
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
                  <div className="flex shrink-0 items-center justify-end gap-1">
                    {onCreateTask ? (
                      <button
                        type="button"
                        aria-label={`Add task to ${project.title}`}
                        aria-pressed={composing}
                        disabled={creatingTaskProjectId === project.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (composing) cancelCompose();
                          else startCompose(project.id);
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
                  <div className="space-y-1 bg-canvas/80 px-2 py-1.5 pl-10">
                    {expanded
                      ? visibleTasks.map((task) => (
                          <NestedTaskRow
                            key={task.id}
                            task={task}
                            busy={updatingTaskId === task.id}
                            onStatusChange={onTaskStatusChange}
                            onDueDateChange={onTaskDueDateChange}
                          />
                        ))
                      : null}
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
