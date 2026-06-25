import { useMemo, useState } from "react";
import {
  useProjectAreasQuery,
  useProjectsQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { isProjectPriority } from "@/domain/spydr/utils/projectPriority";
import { isProjectStatus } from "@/domain/spydr/utils/projectStatus";
import { resolveProjectAreaId } from "@/domain/spydr/utils/projectAreas";
import type { UpdateProjectInput } from "@/domain/spydr/utils/types";
import { useProjectListView } from "./useProjectListView";
import { useUpdateProjectMutation } from "./useUpdateProjectMutation";

export function useProjectsPage() {
  const query = useProjectsQuery();
  const areasQuery = useProjectAreasQuery();
  const projects = query.data ?? [];
  const areas = areasQuery.data ?? [];
  const listView = useProjectListView(projects, areas);
  const updateProject = useUpdateProjectMutation();
  const activeCount = useMemo(
    () => projects.filter((project) => project.status === "active").length,
    [projects]
  );

  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [areaError, setAreaError] = useState<string | null>(null);
  const [priorityError, setPriorityError] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);

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

  return {
    projects: listView.visibleProjects,
    allProjects: projects,
    areas,
    totalCount: projects.length,
    filteredCount: listView.filteredCount,
    activeCount,
    updatingProjectId,
    updateStatus,
    updateArea,
    updatePriority,
    updateTargetDate,
    listView,
    resolveAreaId: (projectId: string) => {
      const project = projects.find((item) => item.id === projectId);
      return project ? resolveProjectAreaId(project, areas) : "";
    },
    statusError,
    areaError,
    priorityError,
    targetError,
    isLoading: query.isLoading,
    isAreasLoading: areasQuery.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load projects",
  };
}
