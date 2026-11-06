import { format } from "date-fns";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Plus,
} from "lucide-react";
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  HeaderMenu,
  WillowDark,
  type IApi,
  type ICellProps,
  type IColumnConfig,
  type IRow,
} from "@svar-ui/react-grid";
import "@svar-ui/react-grid/all.css";
import { EmojiPicker } from "@/domain/spydr/features/shared/components/EmojiPicker";
import { InlineDeleteButton } from "@/domain/spydr/features/shared/components/InlineDeleteButton";
import { TruncatedText } from "@/domain/spydr/features/shared/components/TruncatedText";
import { ProjectAreaSelect } from "@/domain/spydr/features/projects/components/ProjectAreaSelect";
import { ProjectPrioritySelect } from "@/domain/spydr/features/projects/components/ProjectPrioritySelect";
import { ProjectStatusSelect } from "@/domain/spydr/features/projects/components/ProjectStatusSelect";
import { AddToTodoButton } from "@/domain/spydr/features/todos/components/AddToTodoButton";
import { TaskStatusSelect } from "@/domain/spydr/features/tasks/components/TaskStatusSelect";
import { useEnsureTaskDueWithinProject } from "@/domain/spydr/features/tasks/hooks/useEnsureTaskDueWithinProject";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import { parseCalendarDate } from "@/domain/spydr/utils/dateOnly";
import { formatPerson } from "@/domain/spydr/utils/projectPersonas";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import type { TaskStatusChange } from "@/domain/spydr/utils/taskStatus";
import type {
  PersonNode,
  ProjectAreaNode,
  ProjectNode,
  TaskNode,
} from "@/domain/spydr/utils/types";
import type { RankMoveDirection } from "@/domain/spydr/utils/collectionReorder";
import { cn } from "@/lib/utils";
import {
  buildFlatTaskRows,
  buildHierarchyRows,
  formatRelativeDue,
  indexCommitted,
  parseGridDate,
  WORK_GRID_UNSET,
  type CommittedWorkRow,
  type WorkGridKind,
  type WorkGridRow,
} from "../utils/workGridRows";
import { WorkDueDisplay } from "./WorkDueDisplay";
import "./work-grid.css";

export interface WorkGridProps {
  mode: "hierarchy" | "tasks";
  projects: ProjectNode[];
  tasks: TaskNode[];
  tasksByProjectId: Map<string, TaskNode[]>;
  areas: ProjectAreaNode[];
  people: PersonNode[];
  expandedIds: Set<string>;
  showCompletedTasks: boolean;
  reorderEnabled: boolean;
  resetSignal?: string;
  todoTaskIds: Set<string>;
  togglingTodoTaskId: string | null;
  busyId: string | null;
  deletingIds: Set<string>;
  onExpandedIdsChange(next: Set<string>): void;
  onTitle(id: string, kind: WorkGridKind, title: string): void;
  onEmoji(id: string, kind: WorkGridKind, emoji: string | null): void;
  onProjectStatus(id: string, status: string): void;
  onTaskStatus(id: string, change: TaskStatusChange): void;
  onPriority(id: string, kind: WorkGridKind, priority: string): void;
  onAssignee(id: string, kind: WorkGridKind, personId: string | null): void;
  onRequester(id: string, personId: string | null): void;
  onArea(id: string, areaId: string | null): void;
  onDate(id: string, kind: WorkGridKind, date: string | null): void;
  onProject(id: string, projectId: string): void;
  onDelete(id: string, kind: WorkGridKind): void;
  onToggleTodo(taskId: string, onTodo: boolean): void;
  onAddTask(projectId: string): void;
  onMoveProject(id: string, direction: RankMoveDirection): void;
  onReorder(orderedIds: string[]): void;
}

interface WorkGridHandlers extends WorkGridProps {
  api: IApi | null;
  revert(id: string, row: Partial<WorkGridRow>): void;
}

const HandlersContext = createContext<RefObject<WorkGridHandlers> | null>(null);

function useHandlers() {
  const handlers = useContext(HandlersContext);
  if (!handlers?.current) {
    throw new Error("Work grid cell rendered outside WorkGrid");
  }
  return handlers.current;
}

function stopGridPointer(event: { stopPropagation(): void }) {
  event.stopPropagation();
}

function asWorkRow(row: IRow | undefined): WorkGridRow {
  return (row ?? {}) as unknown as WorkGridRow;
}

function treeMeta(row: IRow | undefined) {
  const source = row as
    | (IRow & { $level?: number; $count?: number; open?: boolean })
    | undefined;
  return {
    level: source?.$level ?? 0,
    hasChildren: (source?.$count ?? 0) > 0,
    open: source?.open !== false,
  };
}

function formatCompactUpdated(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 60) return `${Math.max(1, minutes)}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d`;
  return format(date, "MMM d").toLowerCase();
}

function BlockerContext({ row }: { row: WorkGridRow }) {
  if (row.kind === "task" && row.status === "blocked") {
    if (row.blockedById) {
      return (
        <span className="work-grid-blocker work-grid-blocker-task">
          blocked by{" "}
          <Link
            to={`/tasks/${row.blockedById}`}
            className="work-grid-blocker-link"
            onMouseDown={stopGridPointer}
          >
            {row.blockedByTitle?.trim() || "task"}
          </Link>
        </span>
      );
    }
    // No free-text blocked reason exists in the data model — omit.
    return null;
  }

  if (row.kind === "task" && row.status === "waiting" && row.waitingNote?.trim()) {
    return (
      <span className="work-grid-blocker work-grid-blocker-task">
        waiting on {row.waitingNote.trim()}
      </span>
    );
  }

  if (row.kind === "project" && row.blockedOpenCount > 0) {
    const first = row.blockedFirstBlocker;
    return (
      <span className="work-grid-blocker work-grid-blocker-project">
        {row.blockedOpenCount} blocked
        {first ? (
          <>
            {" "}
            by{" "}
            <Link
              to={`/tasks/${first.id}`}
              className="work-grid-blocker-link"
              onMouseDown={stopGridPointer}
            >
              {first.title}
            </Link>
            {row.blockedExtraBlockers > 0
              ? ` +${row.blockedExtraBlockers}`
              : null}
          </>
        ) : null}
      </span>
    );
  }

  return null;
}

function TitleCell({ row }: ICellProps) {
  const handlers = useHandlers();
  const workRow = asWorkRow(row);
  const tree = treeMeta(row);
  const busy = handlers.busyId === workRow.id;
  const onTodo = handlers.todoTaskIds.has(workRow.id);
  const deleting = handlers.deletingIds.has(workRow.id);
  const href =
    workRow.kind === "project" ? `/projects/${workRow.id}` : `/tasks/${workRow.id}`;
  const hierarchy = handlers.mode === "hierarchy";

  const toggleOpen = () => {
    if (!tree.hasChildren || !handlers.api) return;
    void handlers.api.exec(tree.open ? "close-row" : "open-row", {
      id: workRow.id,
    });
  };

  return (
    <div className="work-grid-fill work-grid-title-cell">
      {hierarchy ? (
        <button
          type="button"
          className={cn(
            "work-grid-tree-btn",
            !tree.hasChildren && "invisible pointer-events-none"
          )}
          tabIndex={tree.hasChildren ? 0 : -1}
          aria-hidden={!tree.hasChildren}
          aria-label={
            tree.open ? `Collapse ${workRow.title}` : `Expand ${workRow.title}`
          }
          onMouseDown={stopGridPointer}
          onClick={toggleOpen}
        >
          {tree.open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      ) : null}

      <span className="work-grid-emoji" onMouseDown={stopGridPointer}>
        <EmojiPicker
          value={workRow.emoji}
          disabled={busy}
          placeholder="none"
          ariaLabel={workRow.kind === "project" ? "Project emoji" : "Task emoji"}
          onChange={(emoji) => handlers.onEmoji(workRow.id, workRow.kind, emoji)}
        />
      </span>

      <Link
        to={href}
        className="work-grid-title block min-w-0"
        onMouseDown={stopGridPointer}
      >
        <TruncatedText text={workRow.title} />
      </Link>

      <BlockerContext row={workRow} />

      <div className="work-grid-row-actions" onMouseDown={stopGridPointer}>
        {workRow.kind === "project" && handlers.reorderEnabled ? (
          <>
            <button
              type="button"
              className="work-grid-icon"
              aria-label={`Move ${workRow.title} up`}
              onClick={() => handlers.onMoveProject(workRow.id, "up")}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="work-grid-icon"
              aria-label={`Move ${workRow.title} down`}
              onClick={() => handlers.onMoveProject(workRow.id, "down")}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </>
        ) : null}
        {workRow.kind === "project" && hierarchy ? (
          <button
            type="button"
            className="work-grid-icon"
            aria-label={`Add task to ${workRow.title}`}
            onClick={() => handlers.onAddTask(workRow.id)}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {workRow.kind === "task" ? (
          <AddToTodoButton
            className="work-grid-icon h-7 w-7"
            onTodo={onTodo}
            busy={handlers.togglingTodoTaskId === workRow.id}
            onToggle={() => handlers.onToggleTodo(workRow.id, onTodo)}
          />
        ) : null}
        <InlineDeleteButton
          className="work-grid-icon ml-0"
          label={workRow.kind === "project" ? "Delete project" : "Delete task"}
          isDeleting={deleting}
          disabled={handlers.deletingIds.size > 0 && !deleting}
          onDelete={() => handlers.onDelete(workRow.id, workRow.kind)}
        />
      </div>
    </div>
  );
}

function ProgressCell({ row }: ICellProps) {
  const workRow = asWorkRow(row);
  if (workRow.kind !== "project") return null;

  if (workRow.progressTotal === 0) {
    return <span className="work-grid-progress-empty">—</span>;
  }

  const ratio = workRow.progressDone / workRow.progressTotal;

  return (
    <div
      className="work-grid-progress"
      title={`${workRow.progressDone} of ${workRow.progressTotal} done`}
    >
      <span className="work-grid-progress-count">
        {workRow.progressDone}/{workRow.progressTotal}
      </span>
      <span className="work-grid-progress-track" aria-hidden>
        <span
          className="work-grid-progress-fill"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </span>
    </div>
  );
}

function StatusCell({ row }: ICellProps) {
  const handlers = useHandlers();
  const workRow = asWorkRow(row);
  const busy = handlers.busyId === workRow.id;

  return (
    <div className="work-grid-fill work-grid-field" onMouseDown={stopGridPointer}>
      {workRow.kind === "project" ? (
        <ProjectStatusSelect
          value={workRow.status}
          disabled={busy}
          fitContent
          quiet
          onChange={(status) => handlers.onProjectStatus(workRow.id, status)}
        />
      ) : (
        <TaskStatusSelect
          value={workRow.status}
          disabled={busy}
          fitContent
          quiet
          excludeTaskId={workRow.id}
          onChange={(change) => handlers.onTaskStatus(workRow.id, change)}
        />
      )}
    </div>
  );
}

function AreaCell({ row }: ICellProps) {
  const handlers = useHandlers();
  const workRow = asWorkRow(row);
  if (workRow.kind !== "project") return null;
  const busy = handlers.busyId === workRow.id;

  return (
    <div className="work-grid-fill work-grid-field" onMouseDown={stopGridPointer}>
      <ProjectAreaSelect
        areas={handlers.areas}
        value={workRow.areaId}
        fitContent
        quiet
        disabled={busy}
        onChange={(areaId) => handlers.onArea(workRow.id, areaId)}
      />
    </div>
  );
}

function AssigneeCell({ row, column }: ICellProps) {
  const handlers = useHandlers();
  const { currentUserPersonId } = useCurrentUserPerson();
  const workRow = asWorkRow(row);
  const personId = workRow.assigneeId;
  const person =
    personId && personId !== WORK_GRID_UNSET
      ? handlers.people.find((item) => item.id === personId) ?? null
      : null;
  const formatted = formatPerson(person, currentUserPersonId);

  return (
    <button
      type="button"
      className="work-grid-fill work-grid-editable justify-center"
      title={person ? formatted.label : undefined}
      aria-label={person ? `Owner ${formatted.label}` : "Set owner"}
      onMouseDown={stopGridPointer}
      onClick={() => {
        void handlers.api?.exec("open-editor", {
          id: workRow.id,
          column: column?.id ?? "assigneeId",
        });
      }}
    >
      {formatted.initials ? (
        <span className="work-grid-avatar" aria-hidden>
          {formatted.initials}
        </span>
      ) : null}
    </button>
  );
}

function PriorityCell({ row }: ICellProps) {
  const handlers = useHandlers();
  const workRow = asWorkRow(row);
  const busy = handlers.busyId === workRow.id;
  const priority = workRow.priority || "medium";

  return (
    <div className="work-grid-fill work-grid-field" onMouseDown={stopGridPointer}>
      <ProjectPrioritySelect
        value={priority}
        disabled={busy}
        fitContent
        quiet
        ariaLabel={`Priority ${priority}`}
        onChange={(next) => {
          if (next === priority) return;
          handlers.onPriority(workRow.id, workRow.kind, next);
        }}
      />
    </div>
  );
}

function DateCell({ row, column }: ICellProps) {
  const handlers = useHandlers();
  const workRow = asWorkRow(row);
  const due = formatRelativeDue(workRow.date);

  return (
    <button
      type="button"
      className="work-grid-fill work-grid-editable justify-end"
      title={due.title || undefined}
      aria-label={due.empty ? "Set date" : `Date ${due.title}`}
      onMouseDown={stopGridPointer}
      onClick={() => {
        void handlers.api?.exec("open-editor", {
          id: workRow.id,
          column: column?.id ?? "date",
        });
      }}
    >
      <WorkDueDisplay value={workRow.date} />
    </button>
  );
}

function UpdatedCell({ row }: ICellProps) {
  const workRow = asWorkRow(row);
  return (
    <span className="work-grid-fill work-grid-updated justify-end tabular-nums">
      {formatCompactUpdated(workRow.updatedAt)}
    </span>
  );
}

function ProjectCell({ row, column }: ICellProps) {
  const handlers = useHandlers();
  const workRow = asWorkRow(row);
  const project =
    handlers.projects.find((item) => item.id === workRow.projectId) ?? null;

  return (
    <button
      type="button"
      className="work-grid-fill work-grid-editable min-w-0"
      title={project?.title}
      aria-label={project ? `Project ${project.title}` : "Set project"}
      onMouseDown={stopGridPointer}
      onClick={() => {
        void handlers.api?.exec("open-editor", {
          id: workRow.id,
          column: column?.id ?? "projectId",
        });
      }}
    >
      <span className="min-w-0">
        <TruncatedText text={project?.title ?? ""} />
      </span>
    </button>
  );
}

const gridSizes = { rowHeight: 46, headerHeight: 38 };

export function WorkGrid(props: WorkGridProps) {
  const {
    mode,
    projects,
    tasks,
    tasksByProjectId,
    areas,
    people,
    expandedIds,
    showCompletedTasks,
    reorderEnabled,
    resetSignal = "",
  } = props;
  const { currentUserPersonId } = useCurrentUserPerson();
  const dueGuard = useEnsureTaskDueWithinProject();
  const [api, setApi] = useState<IApi | null>(null);
  const apiRef = useRef<IApi | null>(null);
  const handlersRef = useRef<WorkGridHandlers>(null as unknown as WorkGridHandlers);
  const committedRef = useRef<Map<string, CommittedWorkRow>>(new Map());

  const model = useMemo(() => {
    const rows =
      mode === "hierarchy"
        ? buildHierarchyRows(
            projects,
            tasksByProjectId,
            areas,
            expandedIds,
            showCompletedTasks
          )
        : buildFlatTaskRows(tasks);
    return { rows, committed: indexCommitted(rows) };
  }, [
    areas,
    expandedIds,
    mode,
    projects,
    resetSignal,
    showCompletedTasks,
    tasks,
    tasksByProjectId,
  ]);

  committedRef.current = model.committed;

  const columns = useMemo(() => {
    const personOptions = [
      { id: WORK_GRID_UNSET, label: "—" },
      ...[...people]
        .sort((left, right) =>
          formatPerson(left, currentUserPersonId).label.localeCompare(
            formatPerson(right, currentUserPersonId).label
          )
        )
        .map((person) => ({
          id: person.id,
          label: formatPerson(person, currentUserPersonId).label || "Unnamed",
        })),
    ];
    const projectOptions = projects.map((project) => ({
      id: project.id,
      label: project.title,
    }));
    const hierarchy = mode === "hierarchy";
    const taskReorder = mode === "tasks" && reorderEnabled;

    const cols: IColumnConfig[] = [
      {
        id: "title",
        header: hierarchy ? "Work" : "Task",
        width: hierarchy ? 420 : 360,
        flexgrow: 1,
        resize: true,
        sort: true,
        editor: "text",
        treetoggle: hierarchy,
        draggable: taskReorder,
        cell: TitleCell,
      },
    ];

    if (hierarchy) {
      cols.push({
        id: "progress",
        header: "Progress",
        width: 132,
        resize: true,
        cell: ProgressCell,
      });
    }

    if (!hierarchy) {
      cols.push({
        id: "projectId",
        header: "Project",
        width: 180,
        resize: true,
        sort: true,
        options: projectOptions,
        editor: "richselect",
        cell: ProjectCell,
      });
    }

    cols.push({
      id: "status",
      header: "Status",
      width: 124,
      resize: true,
      sort: true,
      cell: StatusCell,
    });

    if (hierarchy) {
      cols.push({
        id: "areaId",
        header: "Area",
        width: 140,
        resize: true,
        sort: true,
        cell: AreaCell,
      });
    }

    cols.push(
      {
        id: "assigneeId",
        header: { text: "Owner", css: "work-grid-align-center" },
        width: 60,
        resize: true,
        sort: true,
        css: "work-grid-align-center",
        options: personOptions,
        editor: "richselect",
        cell: AssigneeCell,
      },
      {
        id: "priority",
        header: "Priority",
        width: 104,
        resize: true,
        sort: true,
        cell: PriorityCell,
      },
      {
        id: "date",
        header: { text: "Due", css: "work-grid-align-end" },
        width: 136,
        resize: true,
        sort: true,
        css: "work-grid-align-end",
        editor: { type: "datepicker", config: { buttons: ["clear", "today"] } },
        cell: DateCell,
      }
    );

    if (hierarchy) {
      cols.push({
        id: "requesterId",
        header: "Requester",
        width: 140,
        resize: true,
        sort: true,
        hidden: true,
        options: personOptions,
        editor: (row) =>
          asWorkRow(row).kind === "project" ? "richselect" : null,
        template: (value, row) => {
          if (asWorkRow(row).kind !== "project") return "";
          const match = personOptions.find((option) => option.id === value);
          return match?.id ? match.label : "";
        },
      });
    }

    cols.push({
      id: "updatedAt",
      header: { text: "Updated", css: "work-grid-align-end" },
      width: 64,
      resize: true,
      sort: true,
      css: "work-grid-align-end",
      cell: UpdatedCell,
    });

    return cols;
  }, [currentUserPersonId, mode, people, projects, reorderEnabled]);

  const revert = (id: string, row: Partial<WorkGridRow>) => {
    void apiRef.current?.exec("update-row", { id, row });
  };

  handlersRef.current = { ...props, api, revert };

  const applyCell = (ev: {
    id: string | number;
    column: string | number;
    value: unknown;
  }) => {
    const id = String(ev.id);
    const column = String(ev.column);
    const committed = committedRef.current.get(id);
    if (!committed) return;
    const handlers = handlersRef.current;

    if (column === "title") {
      const next = String(ev.value ?? "").trim();
      if (!next || next === committed.title) {
        if (!next) revert(id, { title: committed.title });
        return;
      }
      handlers.onTitle(id, committed.kind, next);
      return;
    }

    if (column === "priority") {
      const next = String(ev.value ?? "");
      if (next === committed.priority) return;
      handlers.onPriority(id, committed.kind, next);
      return;
    }

    if (column === "assigneeId") {
      const next = String(ev.value ?? WORK_GRID_UNSET);
      if (next === committed.assigneeId) return;
      handlers.onAssignee(id, committed.kind, next || null);
      return;
    }

    if (column === "requesterId") {
      if (committed.kind !== "project") {
        revert(id, { requesterId: WORK_GRID_UNSET });
        return;
      }
      const next = String(ev.value ?? WORK_GRID_UNSET);
      if (next === committed.requesterId) return;
      handlers.onRequester(id, next || null);
      return;
    }

    if (column === "projectId") {
      const next = String(ev.value ?? "");
      if (!next || next === committed.projectId) {
        if (!next) revert(id, { projectId: committed.projectId });
        return;
      }
      const project = handlers.projects.find((item) => item.id === next) ?? null;
      dueGuard.ensure({
        project,
        dueDate: committed.date,
        onAllowed: () => handlers.onProject(id, next),
        onDismiss: () => revert(id, { projectId: committed.projectId }),
      });
      return;
    }

    if (column === "date") {
      const next = parseGridDate(ev.value);
      if (next === committed.date) return;
      if (committed.kind === "project") {
        handlers.onDate(id, "project", next);
        return;
      }
      const project =
        handlers.projects.find((item) => item.id === committed.projectId) ?? null;
      dueGuard.ensure({
        project,
        dueDate: next,
        onAllowed: () => handlers.onDate(id, "task", next),
        onDismiss: () =>
          revert(id, { date: parseCalendarDate(committed.date) }),
      });
    }
  };

  return (
    <HandlersContext.Provider value={handlersRef}>
      <div className={cn("work-grid", mode === "hierarchy" && "work-grid-tree")}>
        <WillowDark fonts>
          <HeaderMenu api={api ?? undefined}>
            <Grid
              tree={mode === "hierarchy"}
              data={model.rows}
              columns={columns}
              sizes={gridSizes}
              reorder={mode === "tasks" && reorderEnabled}
              split={{ left: 1 }}
              init={(next) => {
                apiRef.current = next;
                setApi(next);
              }}
              rowStyle={(row) => {
                const workRow = asWorkRow(row);
                const classes = [
                  workRow.kind === "project"
                    ? "work-grid-project"
                    : "work-grid-task",
                ];
                if (isClosedCollectionStatus(workRow.status)) {
                  classes.push("work-grid-closed");
                }
                return classes.join(" ");
              }}
              onUpdateCell={applyCell}
              onMoveItem={(ev) => {
                if (ev.inProgress) return;
                if (mode !== "tasks" || !reorderEnabled) return;
                const ids = (apiRef.current?.getState().data ?? []).map((row) =>
                  String(row.id)
                );
                if (ids.length > 0) handlersRef.current.onReorder(ids);
              }}
              onOpenRow={(ev) => {
                const id = String(ev.id ?? "");
                if (!id || id === "0") return;
                const next = new Set(handlersRef.current.expandedIds);
                next.add(id);
                handlersRef.current.onExpandedIdsChange(next);
              }}
              onCloseRow={(ev) => {
                const id = String(ev.id ?? "");
                if (!id || id === "0") return;
                const next = new Set(handlersRef.current.expandedIds);
                next.delete(id);
                handlersRef.current.onExpandedIdsChange(next);
              }}
            />
          </HeaderMenu>
        </WillowDark>
        {dueGuard.dialog}
      </div>
    </HandlersContext.Provider>
  );
}
