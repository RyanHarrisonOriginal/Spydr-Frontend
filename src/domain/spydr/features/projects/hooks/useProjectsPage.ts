import { useMemo, useState } from "react";
import {
  useProjectAreasQuery,
  useProjectsQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { isProjectStatus } from "@/domain/spydr/utils/projectStatus";
import { resolveProjectAreaId } from "@/domain/spydr/utils/projectAreas";
import { useUpdateProjectMutation } from "./useUpdateProjectMutation";

export function useProjectsPage() {
  const query = useProjectsQuery();
  const areasQuery = useProjectAreasQuery();
  const projects = query.data ?? [];
  const areas = areasQuery.data ?? [];
  const updateProject = useUpdateProjectMutation();
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [areaError, setAreaError] = useState<string | null>(null);

  const activeCount = useMemo(
    () => projects.filter((project) => project.status === "active").length,
    [projects]
  );

  const updateStatus = (projectId: string, status: string) => {
    if (!isProjectStatus(status)) return;

    setStatusError(null);
    setUpdatingProjectId(projectId);
    updateProject.mutate(
      { projectId, input: { status } },
      {
        onError: (error) => {
          setStatusError(
            error instanceof Error ? error.message : "Failed to update project status"
          );
        },
        onSettled: () => setUpdatingProjectId(null),
      }
    );
  };

  const updateArea = (projectId: string, areaNodeId: string | null) => {
    setAreaError(null);
    setUpdatingProjectId(projectId);
    updateProject.mutate(
      { projectId, input: { areaNodeId } },
      {
        onError: (error) => {
          setAreaError(
            error instanceof Error ? error.message : "Failed to update project area"
          );
        },
        onSettled: () => setUpdatingProjectId(null),
      }
    );
  };

  return {
    projects,
    areas,
    totalCount: projects.length,
    activeCount,
    updatingProjectId,
    updateStatus,
    updateArea,
    resolveAreaId: (projectId: string) => {
      const project = projects.find((item) => item.id === projectId);
      return project ? resolveProjectAreaId(project, areas) : "";
    },
    statusError,
    areaError,
    isLoading: query.isLoading,
    isAreasLoading: areasQuery.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load projects",
  };
}
