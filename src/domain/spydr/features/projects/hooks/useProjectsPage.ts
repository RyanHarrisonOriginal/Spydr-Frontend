import { useMemo, useState } from "react";
import {
  useDeletedProjectsQuery,
  usePeopleQuery,
  useProjectAreasQuery,
  useProjectsQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { isProjectPriority } from "@/domain/spydr/utils/projectPriority";
import { isProjectStatus } from "@/domain/spydr/utils/projectStatus";
import { resolveProjectAreaId } from "@/domain/spydr/utils/projectAreas";
import type { UpdateProjectInput } from "@/domain/spydr/utils/types";
import { useProjectListView } from "./useProjectListView";
import { useDeleteProjectMutation } from "./useDeleteProjectMutation";
import { useRestoreProjectMutation } from "./useRestoreProjectMutation";
import { useUpdateProjectMutation } from "./useUpdateProjectMutation";
import { canManuallyReorderCollection } from "@/domain/spydr/utils/collections/shared";
import { useReorderCollectionMutation } from "@/domain/spydr/features/shared/hooks/useReorderCollectionMutation";
import { useGetPriorityRank } from "@/domain/spydr/features/shared/hooks/usePriorityRankLookup";

export function useProjectsPage() {
  const query = useProjectsQuery();
  const trashQuery = useDeletedProjectsQuery();
  const areasQuery = useProjectAreasQuery();
  const peopleQuery = usePeopleQuery();
  const projects = query.data ?? [];
  const deletedProjects = trashQuery.data ?? [];
  const areas = areasQuery.data ?? [];
  const people = peopleQuery.data ?? [];
  const listView = useProjectListView(projects, areas, people);
  const reorderMutation = useReorderCollectionMutation();
  const canReorder = canManuallyReorderCollection(listView.hasActiveFilters);
  const getPriorityRank = useGetPriorityRank(projects);
  const updateProject = useUpdateProjectMutation();
  const deleteProject = useDeleteProjectMutation();
  const restoreProject = useRestoreProjectMutation();
  const activeCount = useMemo(
    () => projects.filter((project) => project.status === "active").length,
    [projects]
  );

  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [areaError, setAreaError] = useState<string | null>(null);
  const [priorityError, setPriorityError] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);
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

  const deleteProjectById = (projectId: string) => {
    setDeleteError(null);
    setDeletingProjectId(projectId);
    deleteProject.mutate(projectId, {
      onSuccess: () => setTrashExpanded(true),
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
    const section = document.getElementById("projects-trash");
    section?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return {
    projects: listView.visibleProjects,
    allProjects: projects,
    deletedProjects,
    deletedCount: deletedProjects.length,
    areas,
    people,
    totalCount: projects.length,
    filteredCount: listView.filteredCount,
    activeCount,
    updatingProjectId,
    updateStatus,
    updateArea,
    updatePriority,
    updateTargetDate,
    updateAssignee,
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
        if (listView.sort.column !== "order") {
          listView.setSortColumn("order", "asc");
        }
      },
      isReordering: reorderMutation.isPending,
    },
    resolveAreaId: (projectId: string) => {
      const project = projects.find((item) => item.id === projectId);
      return project ? resolveProjectAreaId(project, areas) : "";
    },
    statusError,
    areaError,
    priorityError,
    targetError,
    assigneeError,
    deleteError,
    restoreError,
    isLoading: query.isLoading,
    isTrashLoading: trashQuery.isLoading,
    isAreasLoading: areasQuery.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load projects",
  };
}
