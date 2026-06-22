import { useMemo } from "react";
import { useTasksQuery } from "@/domain/spydr/features/shared/hooks/queries";
import type { TaskNode } from "@/domain/spydr/utils/types";

import { taskStatuses, getTaskStatusBucket } from "@/domain/spydr/utils/taskStatus";

const statusOrder = [...taskStatuses, "inactive", "archived", "snoozed"];

export interface TaskGroup {
  status: string;
  label: string;
  tasks: TaskNode[];
}

function labelForStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function useTasksPage() {
  const query = useTasksQuery();
  const tasks = query.data ?? [];

  const groups = useMemo<TaskGroup[]>(() => {
    const statuses = Array.from(new Set(tasks.map((task) => task.status)));
    const ordered = [
      ...statusOrder.filter((status) => statuses.includes(status)),
      ...statuses.filter((status) => !statusOrder.includes(status)).sort(),
    ];

    return ordered.map((status) => ({
      status,
      label: labelForStatus(status),
      tasks: tasks.filter((task) => task.status === status),
    }));
  }, [tasks]);

  const openCount = useMemo(
    () => tasks.filter((task) => getTaskStatusBucket(task.status) === "open").length,
    [tasks]
  );

  return {
    tasks,
    groups,
    totalCount: tasks.length,
    openCount,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load tasks",
  };
}
