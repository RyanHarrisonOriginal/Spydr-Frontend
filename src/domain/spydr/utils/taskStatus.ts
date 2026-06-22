/** Canonical statuses assignable to task nodes — keep in sync with backend. */
export const taskStatuses = ["active", "waiting", "blocked", "completed"] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export const taskStatusBuckets = ["open", "closed", "blocked"] as const;

export type TaskStatusBucket = (typeof taskStatusBuckets)[number];

export const taskStatusLabels: Record<TaskStatus, string> = {
  active: "Active",
  waiting: "Waiting",
  blocked: "Blocked",
  completed: "Completed",
};

export const taskStatusBucketLabels: Record<TaskStatusBucket, string> = {
  open: "Open",
  closed: "Closed",
  blocked: "Blocked",
};

export function isTaskStatus(status: string): status is TaskStatus {
  return (taskStatuses as readonly string[]).includes(status);
}

export function getTaskStatusBucket(status: string): TaskStatusBucket {
  if (status === "blocked") return "blocked";
  if (status === "completed" || status === "archived") return "closed";
  return "open";
}

export function countTasksByBucket(
  tasks: { status: string }[]
): Record<TaskStatusBucket, number> {
  return tasks.reduce(
    (counts, task) => {
      counts[getTaskStatusBucket(task.status)] += 1;
      return counts;
    },
    { open: 0, closed: 0, blocked: 0 } satisfies Record<TaskStatusBucket, number>
  );
}
