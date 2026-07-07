import type {
  WorkspaceDashboard,
  WorkspaceDashboardAreaSummary,
  WorkspaceDashboardSummary,
} from "./workspaceDashboard";

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
