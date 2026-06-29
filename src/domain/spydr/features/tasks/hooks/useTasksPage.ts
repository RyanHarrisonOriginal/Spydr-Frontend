import { useMemo, useState } from "react";
import {
  useProjectsQuery,
  useTasksQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import type { TaskNode } from "@/domain/spydr/utils/types";
import {
  taskStatuses,
  getTaskStatusBucket,
  taskStatusLabels,
  isTaskStatus,
} from "@/domain/spydr/utils/taskStatus";
import { useUpdateTaskMutation } from "./useUpdateTaskMutation";

const statusOrder = [...taskStatuses, "inactive", "archived", "snoozed"];

export interface TaskGroup {
  status: string;
  label: string;
  tasks: TaskNode[];
}

function labelForStatus(status: string) {
  return isTaskStatus(status) ? taskStatusLabels[status] : status.replace(/_/g, " ");
}

export function useTasksPage() {
  const query = useTasksQuery();
  const projectsQuery = useProjectsQuery();
  const tasks = query.data ?? [];
  const projects = projectsQuery.data ?? [];
  const updateTask = useUpdateTaskMutation();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);

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

  const updateStatus = (taskId: string, status: string) => {
    if (!isTaskStatus(status)) return;

    setStatusError(null);
    setUpdatingTaskId(taskId);
    updateTask.mutate(
      { taskId, input: { status } },
      {
        onError: (error) => {
          setStatusError(
            error instanceof Error ? error.message : "Failed to update task status"
          );
        },
        onSettled: () => setUpdatingTaskId(null),
      }
    );
  };

  const updateProject = (taskId: string, projectNodeId: string | null) => {
    setProjectError(null);
    setUpdatingTaskId(taskId);
    updateTask.mutate(
      { taskId, input: { projectNodeId } },
      {
        onError: (error) => {
          setProjectError(
            error instanceof Error ? error.message : "Failed to update task project"
          );
        },
        onSettled: () => setUpdatingTaskId(null),
      }
    );
  };

  return {
    tasks,
    projects,
    groups,
    totalCount: tasks.length,
    openCount,
    updateStatus,
    updateProject,
    updatingTaskId,
    statusError,
    projectError,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load tasks",
  };
}
