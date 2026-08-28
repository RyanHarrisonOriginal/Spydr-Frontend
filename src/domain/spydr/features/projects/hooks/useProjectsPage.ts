import { useMemo, useState } from "react";
import {
  useDeletedProjectsQuery,
  usePeopleQuery,
  useProjectAreasQuery,
  useProjectsQuery,
  useTasksQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { isProjectPriority } from "@/domain/spydr/utils/projectPriority";
import { isProjectStatus } from "@/domain/spydr/utils/projectStatus";
import { resolveProjectAreaId } from "@/domain/spydr/utils/projectAreas";
import { isTaskStatus } from "@/domain/spydr/utils/taskStatus";
import type { TaskNode, UpdateProjectInput } from "@/domain/spydr/utils/types";
import {
  filterProjectsForPerson,
  filterTasksForPerson,
} from "@/domain/spydr/utils/personWork";
import { useProjectListView } from "./useProjectListView";
import { useDeleteProjectMutation } from "./useDeleteProjectMutation";
import { useRestoreProjectMutation } from "./useRestoreProjectMutation";
import { useUpdateProjectMutation } from "./useUpdateProjectMutation";
import { useUpdateTaskMutation } from "@/domain/spydr/features/tasks/hooks/useUpdateTaskMutation";
import { useCreateTaskMutation } from "@/domain/spydr/features/tasks/hooks/useCreateTaskMutation";
import { canManuallyReorderCollection } from "@/domain/spydr/utils/collections/shared";
import { useReorderCollectionMutation } from "@/domain/spydr/features/shared/hooks/useReorderCollectionMutation";
import { useCollectionDisplayPriorityRank } from "@/domain/spydr/features/shared/hooks/usePriorityRankLookup";
import { COLLECTION_ORDER_SORT_ID } from "@/domain/spydr/utils/collections/shared";

function groupTasksByProjectId(tasks: TaskNode[]) {
  const map = new Map<string, TaskNode[]>();
  for (const task of tasks) {
    const projectId = task.project?.id;
    if (!projectId) continue;
    const list = map.get(projectId) ?? [];
    list.push(task);
    map.set(projectId, list);
  }
  for (const list of map.values()) {
    list.sort(
      (left, right) =>
        (left.sortOrder ?? 0) - (right.sortOrder ?? 0) ||
        left.title.localeCompare(right.title)
    );
  }
  return map;
}

export function useProjectsPage(options?: { personId?: string | null }) {
  const personId = options?.personId ?? null;
  const query = useProjectsQuery();
  const tasksQuery = useTasksQuery();
  const trashQuery = useDeletedProjectsQuery();
  const areasQuery = useProjectAreasQuery();
  const peopleQuery = usePeopleQuery();
  const projects = query.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const deletedProjects = trashQuery.data ?? [];
  const areas = areasQuery.data ?? [];
  const people = peopleQuery.data ?? [];
  const scopedProjects = useMemo(
    () => filterProjectsForPerson(projects, tasks, personId),
    [personId, projects, tasks]
  );
  const scopedTasks = useMemo(
    () => filterTasksForPerson(tasks, personId),
    [personId, tasks]
  );
  const listView = useProjectListView(scopedProjects, areas, people);
  const reorderMutation = useReorderCollectionMutation();
  const canReorder = canManuallyReorderCollection(listView.hasActiveFilters);
  const getPriorityRank = useCollectionDisplayPriorityRank(
    scopedProjects,
    listView.visibleProjects,
    listView.sort.column,
    listView.sort.direction
  );
  const updateProject = useUpdateProjectMutation();
  const updateTask = useUpdateTaskMutation();
  const createTask = useCreateTaskMutation();
  const deleteProject = useDeleteProjectMutation();
  const restoreProject = useRestoreProjectMutation();
  const activeCount = useMemo(
    () => scopedProjects.filter((project) => project.status === "active").length,
    [scopedProjects]
  );
  const tasksByProjectId = useMemo(
    () => groupTasksByProjectId(scopedTasks),
    [scopedTasks]
  );

  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [creatingTaskProjectId, setCreatingTaskProjectId] = useState<string | null>(
    null
  );
  const [titleError, setTitleError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [areaError, setAreaError] = useState<string | null>(null);
  const [priorityError, setPriorityError] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [restoringProjectId, setRestoringProjectId] = useState<string | null>(null);
  const [trashExpanded, setTrashExpanded] = useState(false);

  const runUpdate = (
    projectId: string,
    input: UpdateProjectInput,
    setError: (message: string | null) => void
  ) => {
    setError(null);
    setUpdatingProjectId(projectId);
    updateProject.mutate(
      { projectId, input },
      {
        onError: (error) => {
          setError(error instanceof Error ? error.message : "Failed to update project");
        },
        onSettled: () => setUpdatingProjectId(null),
      }
    );
  };

  const updateStatus = (projectId: string, status: string) => {
    if (!isProjectStatus(status)) return;
    runUpdate(projectId, { status }, setStatusError);
  };

  const updateTitle = (projectId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    runUpdate(projectId, { title: trimmed }, setTitleError);
  };

  const updateArea = (projectId: string, areaNodeId: string | null) => {
    runUpdate(projectId, { areaNodeId }, setAreaError);
  };

  const updatePriority = (projectId: string, priority: string) => {
    if (!isProjectPriority(priority)) return;
    runUpdate(projectId, { priority }, setPriorityError);
  };

  const updateTargetDate = (projectId: string, targetDate: string | null) => {
    runUpdate(projectId, { targetDate }, setTargetError);
  };

  const updateAssignee = (projectId: string, assigneePersonNodeId: string | null) => {
    runUpdate(projectId, { assigneePersonNodeId }, setAssigneeError);
  };

  const updateTaskStatus = (taskId: string, status: string) => {
    if (!isTaskStatus(status)) return;
    setTaskError(null);
    setUpdatingTaskId(taskId);
    updateTask.mutate(
      { taskId, input: { status } },
      {
        onError: (error) => {
          setTaskError(
            error instanceof Error ? error.message : "Failed to update task"
          );
        },
        onSettled: () => setUpdatingTaskId(null),
      }
    );
  };

  const updateTaskDueDate = (taskId: string, dueDate: string | null) => {
    setTaskError(null);
    setUpdatingTaskId(taskId);
    updateTask.mutate(
      { taskId, input: { dueDate } },
      {
        onError: (error) => {
          setTaskError(
            error instanceof Error ? error.message : "Failed to update task"
          );
        },
        onSettled: () => setUpdatingTaskId(null),
      }
    );
  };

  const createProjectTask = (
    projectId: string,
    title: string,
    onSuccess?: () => void
  ) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTaskError(null);
    setCreatingTaskProjectId(projectId);
    createTask.mutate(
      {
        projectId,
        input: {
          title: trimmed,
          status: "active",
          priority: "medium",
        },
      },
      {
        onSuccess: () => onSuccess?.(),
        onError: (error) => {
          setTaskError(
            error instanceof Error ? error.message : "Failed to create task"
          );
        },
        onSettled: () => setCreatingTaskProjectId(null),
      }
    );
  };

  const deleteProjectById = (projectId: string) => {
    setDeleteError(null);
    setDeletingProjectId(projectId);
    deleteProject.mutate(projectId, {
      onError: (error) => {
        setDeleteError(
          error instanceof Error ? error.message : "Failed to delete project"
        );
      },
      onSettled: () => setDeletingProjectId(null),
    });
  };

  const restoreProjectById = (projectId: string) => {
    setRestoreError(null);
    setRestoringProjectId(projectId);
    restoreProject.mutate(projectId, {
      onError: (error) => {
        setRestoreError(
          error instanceof Error ? error.message : "Failed to restore project"
        );
      },
      onSettled: () => setRestoringProjectId(null),
    });
  };

  const openTrash = () => {
    setTrashExpanded(true);
    window.setTimeout(() => {
      document
        .getElementById("projects-trash")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 0);
  };

  return {
    projects: listView.visibleProjects,
    allProjects: scopedProjects,
    orgProjectCount: projects.length,
    tasksByProjectId,
    deletedProjects,
    deletedCount: deletedProjects.length,
    areas,
    people,
    totalCount: scopedProjects.length,
    filteredCount: listView.filteredCount,
    activeCount,
    updatingProjectId,
    updatingTaskId,
    creatingTaskProjectId,
    updateStatus,
    updateTitle,
    updateArea,
    updatePriority,
    updateTargetDate,
    updateAssignee,
    updateTaskStatus,
    updateTaskDueDate,
    createProjectTask,
    deleteProject: deleteProjectById,
    restoreProject: restoreProjectById,
    deletingProjectId,
    restoringProjectId,
    trashExpanded,
    setTrashExpanded,
    openTrash,
    listView,
    getPriorityRank,
    reorder: {
      canReorder,
      onReorder: (orderedIds: string[]) => {
        if (!canReorder) return;
        reorderMutation.mutate({ nodeType: "project", orderedIds });
        if (listView.sort.column !== COLLECTION_ORDER_SORT_ID) {
          listView.setSortColumn(COLLECTION_ORDER_SORT_ID, "asc");
        }
      },
      isReordering: reorderMutation.isPending,
    },
    resolveAreaId: (projectId: string) => {
      const project = projects.find((item) => item.id === projectId);
      return project ? resolveProjectAreaId(project, areas) : "";
    },
    statusError,
    titleError,
    areaError,
    priorityError,
    targetError,
    assigneeError,
    taskError,
    deleteError,
    restoreError,
    isLoading: query.isLoading || tasksQuery.isLoading,
    isTrashLoading: trashQuery.isLoading,
    isAreasLoading: areasQuery.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load projects",
  };
}
