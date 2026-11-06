import { differenceInCalendarDays, startOfDay } from "date-fns";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import { parseCalendarDate } from "@/domain/spydr/utils/dateOnly";
import { resolveProjectAreaId } from "@/domain/spydr/utils/projectAreas";
import {
  DEFAULT_AREA_COLOR,
  resolveAreaColor,
} from "@/domain/spydr/utils/projectAreaColors";
import { formatPerson } from "@/domain/spydr/utils/projectPersonas";
import type {
  PersonNode,
  ProjectAreaNode,
  ProjectNode,
  TaskNode,
} from "@/domain/spydr/utils/types";
import type { WorkPulseCounts } from "@/domain/spydr/features/work/components/WorkPulse";
import { countVisiblePulse } from "@/domain/spydr/features/work/utils/workPulse";
import { formatRelativeDue } from "@/domain/spydr/features/work/utils/workGridRows";

function isOpen(status: string): boolean {
  return !isClosedCollectionStatus(status);
}

function itemDueDate(
  kind: "project" | "task",
  project: ProjectNode | null,
  task: TaskNode | null
): Date | null {
  const raw =
    kind === "project"
      ? project?.details?.targetDate
      : task?.details?.dueDate;
  if (!raw) return null;
  const parsed = parseCalendarDate(raw) ?? new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysLate(due: Date | null, now: Date): number {
  if (!due) return 0;
  const diff = differenceInCalendarDays(startOfDay(now), startOfDay(due));
  return diff > 0 ? diff : 0;
}

export interface DashboardAttentionItem {
  id: string;
  kind: "project" | "task";
  title: string;
  status: string;
  href: string;
  reason: string;
  lateLabel: string;
  daysLate: number;
  blocksCount: number;
}

export interface DashboardTaskMix {
  active: number;
  blocked: number;
  waiting: number;
  done: number;
  total: number;
  pctDone: number;
}

export interface DashboardAreaRow {
  id: string | null;
  name: string;
  color: string | null;
  projects: number;
  openTasks: number;
}

export interface DashboardPersonLoadRow {
  person: PersonNode | null;
  label: string;
  initials: string;
  projects: number;
  late: number;
  openTasks: number;
  isYou: boolean;
  isUnassigned: boolean;
}

export interface DashboardTotals {
  activeProjects: number;
  totalProjects: number;
  openTasks: number;
  totalTasks: number;
  blocked: number;
  overdue: number;
  blockedPctOfOpen: number;
  overduePctOfOpen: number;
}

export interface DashboardViewModel {
  pulse: WorkPulseCounts;
  totals: DashboardTotals;
  attention: DashboardAttentionItem[];
  attentionTotal: number;
  attentionMore: number;
  taskMix: DashboardTaskMix;
  areas: DashboardAreaRow[];
  personLoads: DashboardPersonLoadRow[];
  openTaskTotal: number;
}

const ATTENTION_CAP = 8;

export function buildDashboardView(
  projects: ProjectNode[],
  tasks: TaskNode[],
  areas: ProjectAreaNode[],
  people: PersonNode[],
  currentUserId: string | null | undefined,
  now = new Date()
): DashboardViewModel {
  const pulse = countVisiblePulse(projects, tasks, now);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalTasks = tasks.length;
  const openTasksList = tasks.filter((t) => isOpen(t.status));
  const openTasks = openTasksList.length;

  // Totals strip overdue/blocked match the Work pulse (projects + tasks).
  const overdue = pulse.overdue;
  const blockedForTotals = pulse.blocked;

  const blockedPctOfOpen =
    openTasks > 0 ? Math.round((blockedForTotals / openTasks) * 100) : 0;
  const overduePctOfOpen =
    openTasks > 0 ? Math.round((overdue / openTasks) * 100) : 0;

  // How many open tasks each id blocks.
  const blocksCountById = new Map<string, number>();
  for (const task of openTasksList) {
    const blockerId =
      task.blockedBy?.id ?? task.details?.blockedByNodeId ?? null;
    if (!blockerId) continue;
    blocksCountById.set(blockerId, (blocksCountById.get(blockerId) ?? 0) + 1);
  }

  const attentionCandidates: DashboardAttentionItem[] = [];

  for (const project of projects) {
    if (!isOpen(project.status)) continue;
    const due = itemDueDate("project", project, null);
    const late = daysLate(due, now);
    const isBlocked = project.status === "blocked";
    const isWaiting = project.status === "waiting";
    if (late === 0 && !isBlocked && !isWaiting) continue;
    const blocksCount = blocksCountById.get(project.id) ?? 0;
    const relative = formatRelativeDue(due, now);
    attentionCandidates.push({
      id: project.id,
      kind: "project",
      title: project.title,
      status: project.status,
      href: `/projects/${project.id}`,
      reason: attentionReason({
        kind: "project",
        status: project.status,
        blocksCount,
      }),
      lateLabel: relative.overdue ? relative.label : "",
      daysLate: late,
      blocksCount,
    });
  }

  for (const task of openTasksList) {
    const due = itemDueDate("task", null, task);
    const late = daysLate(due, now);
    const isBlocked = task.status === "blocked";
    const isWaiting = task.status === "waiting";
    if (late === 0 && !isBlocked && !isWaiting) continue;
    const blocksCount = blocksCountById.get(task.id) ?? 0;
    const relative = formatRelativeDue(due, now);
    attentionCandidates.push({
      id: task.id,
      kind: "task",
      title: task.title,
      status: task.status,
      href: `/tasks/${task.id}`,
      reason: attentionReason({
        kind: "task",
        status: task.status,
        blocksCount,
      }),
      lateLabel: relative.overdue ? relative.label : "",
      daysLate: late,
      blocksCount,
    });
  }

  attentionCandidates.sort((left, right) => {
    if (right.daysLate !== left.daysLate) return right.daysLate - left.daysLate;
    if (right.blocksCount !== left.blocksCount) {
      return right.blocksCount - left.blocksCount;
    }
    return left.title.localeCompare(right.title);
  });

  const attentionTotal = attentionCandidates.length;
  const attention = attentionCandidates.slice(0, ATTENTION_CAP);
  const attentionMore = Math.max(0, attentionTotal - ATTENTION_CAP);

  let mixActive = 0;
  let mixBlocked = 0;
  let mixWaiting = 0;
  let mixDone = 0;
  for (const task of tasks) {
    if (task.status === "active") mixActive += 1;
    else if (task.status === "blocked") mixBlocked += 1;
    else if (task.status === "waiting") mixWaiting += 1;
    else if (task.status === "completed") mixDone += 1;
  }
  const mixTotal = mixActive + mixBlocked + mixWaiting + mixDone;
  const taskMix: DashboardTaskMix = {
    active: mixActive,
    blocked: mixBlocked,
    waiting: mixWaiting,
    done: mixDone,
    total: mixTotal,
    pctDone: mixTotal > 0 ? Math.round((mixDone / mixTotal) * 100) : 0,
  };

  const areaStats = new Map<
    string | null,
    { name: string; color: string | null; projects: number; openTasks: number }
  >();
  for (const area of areas) {
    areaStats.set(area.id, {
      name: area.title,
      color: resolveAreaColor(area),
      projects: 0,
      openTasks: 0,
    });
  }
  areaStats.set(null, {
    name: "No area",
    color: null,
    projects: 0,
    openTasks: 0,
  });

  const projectAreaId = new Map<string, string | null>();
  for (const project of projects) {
    const areaId = resolveProjectAreaId(project, areas) || null;
    projectAreaId.set(project.id, areaId);
    const bucket = areaStats.get(areaId);
    if (bucket) {
      bucket.projects += 1;
    } else {
      areaStats.set(areaId, {
        name: "Unknown",
        color: DEFAULT_AREA_COLOR,
        projects: 1,
        openTasks: 0,
      });
    }
  }

  for (const task of openTasksList) {
    const projectId = task.project?.id ?? null;
    const areaId = projectId ? projectAreaId.get(projectId) ?? null : null;
    const bucket = areaStats.get(areaId) ?? areaStats.get(null)!;
    bucket.openTasks += 1;
  }

  const areaRows: DashboardAreaRow[] = [...areaStats.entries()]
    .map(([id, row]) => ({
      id,
      name: row.name,
      color: row.color,
      projects: row.projects,
      openTasks: row.openTasks,
    }))
    .filter((row) => row.projects > 0 || row.openTasks > 0)
    .sort((left, right) => {
      if (left.id === null && right.id !== null) return 1;
      if (left.id !== null && right.id === null) return -1;
      if (right.openTasks !== left.openTasks) {
        return right.openTasks - left.openTasks;
      }
      return left.name.localeCompare(right.name);
    });

  // Person load: assignee-owned projects + assigned open tasks.
  const peopleById = new Map(people.map((person) => [person.id, person]));
  type Acc = {
    person: PersonNode | null;
    projectIds: Set<string>;
    late: number;
    openTasks: number;
  };
  const loadByPerson = new Map<string | null, Acc>();

  const ensure = (personId: string | null): Acc => {
    const existing = loadByPerson.get(personId);
    if (existing) return existing;
    const next: Acc = {
      person: personId ? peopleById.get(personId) ?? null : null,
      projectIds: new Set(),
      late: 0,
      openTasks: 0,
    };
    loadByPerson.set(personId, next);
    return next;
  };

  for (const project of projects) {
    if (!isOpen(project.status)) continue;
    const assigneeId = project.details?.assigneePersonNodeId ?? null;
    const acc = ensure(assigneeId);
    acc.projectIds.add(project.id);
    if (daysLate(itemDueDate("project", project, null), now) > 0) {
      acc.late += 1;
    }
  }

  for (const task of openTasksList) {
    const assigneeId =
      task.assignee?.id ?? task.details?.assigneePersonNodeId ?? null;
    const acc = ensure(assigneeId);
    acc.openTasks += 1;
    const projectId = task.project?.id;
    if (projectId) acc.projectIds.add(projectId);
    if (daysLate(itemDueDate("task", null, task), now) > 0) {
      acc.late += 1;
    }
  }

  const personLoads: DashboardPersonLoadRow[] = [...loadByPerson.entries()]
    .map(([personId, acc]) => {
      const formatted = formatPerson(acc.person, currentUserId);
      const isYou = Boolean(personId && personId === currentUserId);
      return {
        person: acc.person,
        label: formatted.label,
        initials: formatted.initials,
        projects: acc.projectIds.size,
        late: acc.late,
        openTasks: acc.openTasks,
        isYou,
        isUnassigned: personId === null,
      };
    })
    .filter((row) => row.projects > 0 || row.openTasks > 0 || row.late > 0)
    .sort((left, right) => {
      if (left.isYou && !right.isYou) return -1;
      if (!left.isYou && right.isYou) return 1;
      if (left.isUnassigned && !right.isUnassigned) return 1;
      if (!left.isUnassigned && right.isUnassigned) return -1;
      if (right.openTasks !== left.openTasks) {
        return right.openTasks - left.openTasks;
      }
      return left.label.localeCompare(right.label);
    });

  return {
    pulse,
    totals: {
      activeProjects,
      totalProjects,
      openTasks,
      totalTasks,
      blocked: blockedForTotals,
      overdue,
      blockedPctOfOpen,
      overduePctOfOpen,
    },
    attention,
    attentionTotal,
    attentionMore,
    taskMix,
    areas: areaRows,
    personLoads,
    openTaskTotal: openTasks,
  };
}

function attentionReason(input: {
  kind: "project" | "task";
  status: string;
  blocksCount: number;
}): string {
  if (input.blocksCount > 0) return `blocks ${input.blocksCount}`;
  if (input.status === "blocked") return "blocked";
  if (input.status === "waiting") return "waiting";
  if (input.kind === "project") return "project";
  return "";
}

export function ratioPercent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}
