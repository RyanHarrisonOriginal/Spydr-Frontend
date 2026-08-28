import { useMemo, useState } from "react";
import {
  usePeopleQuery,
  useProjectsQuery,
  useTasksQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { useCollectionView } from "@/domain/spydr/features/shared/hooks/useCollectionView";
import { tasksCollection } from "@/domain/spydr/utils/collections/tasksCollection";
import { filterTasksForPerson } from "@/domain/spydr/utils/personWork";
import {
  getTaskStatusBucket,
  isTaskStatus,
} from "@/domain/spydr/utils/taskStatus";
import { useUpdateTaskMutation } from "./useUpdateTaskMutation";
import { useDeleteTaskMutation } from "./useDeleteTaskMutation";
import { useCollectionReorder } from "@/domain/spydr/features/shared/hooks/useCollectionReorder";

export function useTasksPage(options?: { personId?: string | null }) {
  const personId = options?.personId ?? null;
  const query = useTasksQuery();
  const projectsQuery = useProjectsQuery();
  const peopleQuery = usePeopleQuery();
  const tasks = query.data ?? [];
  const projects = projectsQuery.data ?? [];
  const people = peopleQuery.data ?? [];
  const scopedTasks = useMemo(
    () => filterTasksForPerson(tasks, personId),
    [personId, tasks]
  );
  const view = useCollectionView(tasksCollection, scopedTasks);
  const reorder = useCollectionReorder("task", view);
  const updateTask = useUpdateTaskMutation();
  const deleteTask = useDeleteTaskMutation();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [deletingTaskIds, setDeletingTaskIds] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  const openCount = useMemo(
    () =>
      scopedTasks.filter((task) => getTaskStatusBucket(task.status) === "open")
        .length,
    [scopedTasks]
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

  const updateDueDate = (taskId: string, dueDate: string | null) => {
    setDueDateError(null);
    setUpdatingTaskId(taskId);
    updateTask.mutate(
      { taskId, input: { dueDate } },
      {
        onError: (error) => {
          setDueDateError(
            error instanceof Error ? error.message : "Failed to update task due date"
          );
        },
        onSettled: () => setUpdatingTaskId(null),
      }
    );
  };

  const updateAssignee = (taskId: string, assigneePersonNodeId: string | null) => {
    setAssigneeError(null);
    setUpdatingTaskId(taskId);
    updateTask.mutate(
      { taskId, input: { assigneePersonNodeId } },
      {
        onError: (error) => {
          setAssigneeError(
            error instanceof Error ? error.message : "Failed to update task assignee"
          );
        },
        onSettled: () => setUpdatingTaskId(null),
      }
    );
  };

  const deleteTaskById = (taskId: string) => {
    setDeleteError(null);
    setDeletingTaskIds([taskId]);
    deleteTask.mutate(taskId, {
      onError: (error) => {
        setDeleteError(
          error instanceof Error ? error.message : "Failed to delete task"
        );
      },
      onSettled: () => setDeletingTaskIds([]),
    });
  };

  const deleteSelectedTasks = (taskIds: string[]) => {
    if (taskIds.length === 0) return;
    setDeleteError(null);
    setDeletingTaskIds(taskIds);
    deleteTask.mutate(taskIds, {
      onError: (error) => {
        setDeleteError(
          error instanceof Error ? error.message : "Failed to delete selected tasks"
        );
      },
      onSettled: () => setDeletingTaskIds([]),
    });
  };

  return {
    tasks: scopedTasks,
    orgTaskCount: tasks.length,
    projects,
    people,
    view,
    reorder,
    getPriorityRank: view.getPriorityRank,
    totalCount: scopedTasks.length,
    openCount,
    updateStatus,
    updateProject,
    updateAssignee,
    updateDueDate,
    updatingTaskId,
    statusError,
    projectError,
    assigneeError,
    dueDateError,
    deleteError,
    deleteTask: deleteTaskById,
    deleteSelectedTasks,
    deletingTaskIds,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load tasks",
  };
}
