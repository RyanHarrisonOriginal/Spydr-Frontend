/** Canonical statuses assignable to project nodes — keep in sync with backend. */
export const projectStatuses = [
  "active",
  "inactive",
  "completed",
  "archived",
  "blocked",
  "waiting",
  "snoozed",
] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export function isProjectStatus(status: string): status is ProjectStatus {
  return (projectStatuses as readonly string[]).includes(status);
}
