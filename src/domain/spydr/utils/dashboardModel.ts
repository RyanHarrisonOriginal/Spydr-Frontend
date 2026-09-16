import type {
  WorkspaceDashboard,
  WorkspaceDashboardAreaSummary,
  WorkspaceDashboardSummary,
} from "./workspaceDashboard";
import { isClosedCollectionStatus } from "./collectionVisibility";

export const dashboardMetricIds = [
  "activeProjects",
  "openTasks",
  "blockedTasks",
  "overdueTasks",
] as const;

export type DashboardMetricId = (typeof dashboardMetricIds)[number];

export interface DashboardMetricDef {
  id: DashboardMetricId;
  label: string;
  getValue(summary: WorkspaceDashboardSummary): number;
  hint?(summary: WorkspaceDashboardSummary): string | null;
  tone?: "default" | "warn";
}

export const dashboardMetrics: DashboardMetricDef[] = [
  {
    id: "activeProjects",
    label: "Active projects",
    getValue: (summary) => summary.activeProjects,
    hint: (summary) =>
      summary.totalProjects > 0 ? `${summary.totalProjects} total` : null,
  },
  {
    id: "openTasks",
    label: "Open tasks",
    getValue: (summary) => summary.openTasks,
    hint: (summary) =>
      summary.totalTasks > 0 ? `${summary.totalTasks} total` : null,
  },
  {
    id: "blockedTasks",
    label: "Blocked tasks",
    getValue: (summary) => summary.blockedTasks,
    tone: "warn",
  },
  {
    id: "overdueTasks",
    label: "Overdue tasks",
    getValue: (summary) => summary.overdueTasks,
    tone: "warn",
    hint: (summary) =>
      summary.unlinkedTasks > 0 ? `${summary.unlinkedTasks} unlinked` : null,
  },
];

export const dashboardPersonRoleIds = [
  "assignee",
  "requester",
  "sponsor",
  "reviewer",
] as const;

export type DashboardPersonRoleId = (typeof dashboardPersonRoleIds)[number];

export const dashboardPersonRoleLabels: Record<DashboardPersonRoleId, string> = {
  assignee: "Assignee",
  requester: "Requester",
  sponsor: "Sponsor",
  reviewer: "Reviewer",
};

export const dashboardInsightSectionIds = [
  "personLoad",
  "taskDistribution",
] as const;

export type DashboardInsightSectionId =
  (typeof dashboardInsightSectionIds)[number];

export interface DashboardInsightSectionDef {
  id: DashboardInsightSectionId;
  label: string;
}

export const dashboardInsightSections: DashboardInsightSectionDef[] = [
  { id: "personLoad", label: "Load by person" },
  { id: "taskDistribution", label: "Task distribution" },
];

export function maxPersonOpenTasks(dashboard: WorkspaceDashboard): number {
  return dashboard.personLoads.reduce(
    (max, load) => Math.max(max, load.openTasks),
    0
  );
}

export function ratioPercent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

export function countTotal(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

export function countByStatus(
  items: Array<{ status: string }>
): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
    return counts;
  }, {});
}

export function withoutClosedStatusCounts(
  counts: Record<string, number>
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(counts).filter(
      ([status]) => !isClosedCollectionStatus(status)
    )
  );
}

export function inMotionProjectCount(counts: Record<string, number>): number {
  return (
    (counts.active ?? 0) + (counts.waiting ?? 0) + (counts.blocked ?? 0)
  );
}

export function statusFillClass(status: string): string {
  switch (status) {
    case "active":
      return "bg-[hsl(var(--status-active))]";
    case "waiting":
    case "snoozed":
      return "bg-[hsl(var(--status-doing))]";
    case "blocked":
      return "bg-[hsl(var(--status-blocked))]";
    case "completed":
      return "bg-[hsl(var(--status-done))]";
    default:
      return "bg-[hsl(var(--status-todo))]";
  }
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function rankedPersonLoads(dashboard: WorkspaceDashboard) {
  return dashboard.personLoads
    .filter(
      (load) =>
        load.projects > 0 ||
        load.tasks > 0 ||
        dashboardPersonRoleIds.some((role) => load.roleCounts[role] > 0)
    )
    .slice()
    .sort((left, right) => {
      if (right.openTasks !== left.openTasks) return right.openTasks - left.openTasks;
      if (right.blockedTasks !== left.blockedTasks) {
        return right.blockedTasks - left.blockedTasks;
      }
      return (left.person?.name ?? "Unassigned").localeCompare(
        right.person?.name ?? "Unassigned"
      );
    });
}

export function sortedStatusEntries(
  counts: WorkspaceDashboard["taskStatusCounts"]
): Array<{ status: string; count: number }> {
  return Object.entries(counts)
    .map(([status, count]) => ({ status, count }))
    .sort((left, right) => right.count - left.count);
}

export function sortedAreaSummaries(
  summaries: WorkspaceDashboard["areaSummaries"] | undefined
): WorkspaceDashboardAreaSummary[] {
  return [...(summaries ?? [])].sort((left, right) => {
    if (right.projects !== left.projects) return right.projects - left.projects;
    return left.name.localeCompare(right.name);
  });
}
