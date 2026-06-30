export interface WorkspaceDashboardPersonRef {
  id: string;
  name: string;
}

export interface WorkspaceDashboardPersonRoleCounts {
  assignee: number;
  requester: number;
  sponsor: number;
  reviewer: number;
}

export interface WorkspaceDashboardPersonLoad {
  person: WorkspaceDashboardPersonRef | null;
  projects: number;
  openProjects: number;
  tasks: number;
  openTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  roleCounts: WorkspaceDashboardPersonRoleCounts;
}

export type WorkspaceDashboardStatusCounts = Record<string, number>;

export interface WorkspaceDashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  openTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  unassignedProjects: number;
  unassignedProjectTasks: number;
  unlinkedTasks: number;
}

export interface WorkspaceDashboard {
  generatedAt: string;
  summary: WorkspaceDashboardSummary;
  projectStatusCounts: WorkspaceDashboardStatusCounts;
  taskStatusCounts: WorkspaceDashboardStatusCounts;
  personLoads: WorkspaceDashboardPersonLoad[];
}
