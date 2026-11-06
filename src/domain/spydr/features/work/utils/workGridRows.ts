import {
  differenceInCalendarDays,
  format,
  startOfDay,
} from "date-fns";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import { parseCalendarDate, toDateOnlyString } from "@/domain/spydr/utils/dateOnly";
import { resolveProjectAreaId } from "@/domain/spydr/utils/projectAreas";
import type {
  ProjectAreaNode,
  ProjectNode,
  TaskNode,
} from "@/domain/spydr/utils/types";

/** Sentinel stored in the grid for an empty person, area, or project. */
export const WORK_GRID_UNSET = "";

export type WorkGridKind = "project" | "task";

export interface WorkGridBlockerRef {
  id: string;
  title: string;
}

export interface WorkGridRow {
  id: string;
  kind: WorkGridKind;
  title: string;
  emoji: string | null;
  status: string;
  assigneeId: string;
  requesterId: string;
  priority: string;
  areaId: string;
  projectId: string;
  /** Due (task) or target (project). */
  date: Date | null;
  updatedAt: string;
  progressDone: number;
  progressTotal: number;
  /** Task: blocking task id when status is blocked. */
  blockedById: string | null;
  blockedByTitle: string | null;
  /** Task: free-text waiting note. */
  waitingNote: string | null;
  /** Project: count of open blocked tasks. */
  blockedOpenCount: number;
  /** Project: first distinct blocker among open blocked tasks. */
  blockedFirstBlocker: WorkGridBlockerRef | null;
  /** Project: additional distinct blockers beyond the first. */
  blockedExtraBlockers: number;
  open?: boolean;
  data?: WorkGridRow[];
}

export interface CommittedWorkRow {
  title: string;
  emoji: string | null;
  status: string;
  assigneeId: string;
  requesterId: string;
  priority: string;
  areaId: string;
  projectId: string;
  date: string | null;
  kind: WorkGridKind;
}

export interface RelativeDue {
  /** Relative phrase: "today", "in 3d", "5w late", or "". */
  label: string;
  /** Absolute date for the date slot, e.g. "Apr 10". */
  dateLabel: string;
  overdue: boolean;
  title: string;
  empty: boolean;
}

export function dateKey(value: Date | null | undefined): string | null {
  if (!value) return null;
  return toDateOnlyString(value);
}

export function parseGridDate(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return toDateOnlyString(value);
  }
  if (typeof value === "string") {
    const parsed = parseCalendarDate(value);
    return parsed ? toDateOnlyString(parsed) : null;
  }
  return null;
}

/** Relative + absolute due/target labels for the Work grid Due cell. */
export function formatRelativeDue(
  value: Date | null | undefined,
  now = new Date()
): RelativeDue {
  if (!value || Number.isNaN(value.getTime())) {
    return {
      label: "",
      dateLabel: "",
      overdue: false,
      title: "",
      empty: true,
    };
  }
  const title = format(value, "MMM d, yyyy");
  const dateLabel = format(value, "MMM d");
  const today = startOfDay(now);
  const due = startOfDay(value);
  const diffDays = differenceInCalendarDays(due, today);

  if (diffDays < 0) {
    const late = Math.abs(diffDays);
    if (late < 7) {
      return {
        label: `${late}d late`,
        dateLabel,
        overdue: true,
        title,
        empty: false,
      };
    }
    return {
      label: `${Math.floor(late / 7)}w late`,
      dateLabel,
      overdue: true,
      title,
      empty: false,
    };
  }
  if (diffDays === 0) {
    return { label: "today", dateLabel, overdue: false, title, empty: false };
  }
  if (diffDays === 1) {
    return {
      label: "tomorrow",
      dateLabel,
      overdue: false,
      title,
      empty: false,
    };
  }
  if (diffDays < 14) {
    return {
      label: `in ${diffDays}d`,
      dateLabel,
      overdue: false,
      title,
      empty: false,
    };
  }
  if (diffDays < 56) {
    const weeks = Math.max(2, Math.round(diffDays / 7));
    return {
      label: `in ${weeks}w`,
      dateLabel,
      overdue: false,
      title,
      empty: false,
    };
  }
  return { label: "", dateLabel, overdue: false, title, empty: false };
}

export function buildHierarchyRows(
  projects: ProjectNode[],
  tasksByProjectId: Map<string, TaskNode[]>,
  areas: ProjectAreaNode[],
  expandedIds: Set<string>,
  showCompleted: boolean
): WorkGridRow[] {
  return projects
    .filter(
      (project) => showCompleted || !isClosedCollectionStatus(project.status)
    )
    .map((project) => {
      const allTasks = tasksByProjectId.get(project.id) ?? [];
      const visibleTasks = allTasks.filter(
        (task) => showCompleted || !isClosedCollectionStatus(task.status)
      );
      const children = visibleTasks.map(taskRow);
      const row = projectRow(project, areas, allTasks);
      if (children.length === 0) return row;
      return {
        ...row,
        open: expandedIds.has(project.id),
        data: children,
      };
    });
}

export function buildFlatTaskRows(
  tasks: TaskNode[],
  showCompleted = true
): WorkGridRow[] {
  return tasks
    .filter(
      (task) => showCompleted || !isClosedCollectionStatus(task.status)
    )
    .map(taskRow);
}

export function indexCommitted(rows: WorkGridRow[]): Map<string, CommittedWorkRow> {
  const committed = new Map<string, CommittedWorkRow>();
  const visit = (row: WorkGridRow) => {
    committed.set(row.id, {
      title: row.title,
      emoji: row.emoji,
      status: row.status,
      assigneeId: row.assigneeId,
      requesterId: row.requesterId,
      priority: row.priority,
      areaId: row.areaId,
      projectId: row.projectId,
      date: dateKey(row.date),
      kind: row.kind,
    });
    row.data?.forEach(visit);
  };
  rows.forEach(visit);
  return committed;
}

function projectProgress(tasks: TaskNode[]) {
  const progressTotal = tasks.length;
  const progressDone = tasks.filter((task) =>
    isClosedCollectionStatus(task.status)
  ).length;
  return { progressDone, progressTotal };
}

function projectBlockedSummary(tasks: TaskNode[]) {
  const blocked = tasks.filter(
    (task) => task.status === "blocked" && !isClosedCollectionStatus(task.status)
  );
  const blockers = new Map<string, string>();
  for (const task of blocked) {
    const id = task.blockedBy?.id ?? task.details?.blockedByNodeId ?? null;
    if (!id) continue;
    const title = task.blockedBy?.title?.trim() || "task";
    if (!blockers.has(id)) blockers.set(id, title);
  }
  const entries = [...blockers.entries()];
  const first = entries[0];
  return {
    blockedOpenCount: blocked.length,
    blockedFirstBlocker: first
      ? { id: first[0], title: first[1] }
      : null,
    blockedExtraBlockers: Math.max(0, entries.length - 1),
  };
}

function projectRow(
  project: ProjectNode,
  areas: ProjectAreaNode[],
  tasks: TaskNode[]
): WorkGridRow {
  const areaId = resolveProjectAreaId(project, areas) || WORK_GRID_UNSET;
  const progress = projectProgress(tasks);
  const blocked = projectBlockedSummary(tasks);
  return {
    id: project.id,
    kind: "project",
    title: project.title,
    emoji: project.details?.emoji ?? null,
    status: project.status,
    assigneeId: project.details?.assigneePersonNodeId ?? WORK_GRID_UNSET,
    requesterId: project.details?.requesterPersonNodeId ?? WORK_GRID_UNSET,
    priority: project.priority,
    areaId,
    projectId: project.id,
    date: parseCalendarDate(project.details?.targetDate),
    updatedAt: project.updatedAt,
    blockedById: null,
    blockedByTitle: null,
    waitingNote: null,
    ...progress,
    ...blocked,
  };
}

function taskRow(task: TaskNode): WorkGridRow {
  const blockedById =
    task.blockedBy?.id ?? task.details?.blockedByNodeId ?? null;
  return {
    id: task.id,
    kind: "task",
    title: task.title,
    emoji: task.details?.emoji ?? null,
    status: task.status,
    assigneeId: task.details?.assigneePersonNodeId ?? WORK_GRID_UNSET,
    requesterId: WORK_GRID_UNSET,
    priority: task.priority,
    areaId: WORK_GRID_UNSET,
    projectId: task.project?.id ?? WORK_GRID_UNSET,
    date: parseCalendarDate(task.details?.dueDate),
    updatedAt: task.updatedAt,
    progressDone: 0,
    progressTotal: 0,
    blockedById: task.status === "blocked" ? blockedById : null,
    blockedByTitle:
      task.status === "blocked" ? task.blockedBy?.title ?? null : null,
    waitingNote:
      task.status === "waiting" ? task.details?.waitingNote ?? null : null,
    blockedOpenCount: 0,
    blockedFirstBlocker: null,
    blockedExtraBlockers: 0,
  };
}
