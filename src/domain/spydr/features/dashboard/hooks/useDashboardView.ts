import { useMemo } from "react";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import {
  usePeopleQuery,
  useProjectAreasQuery,
  useProjectsQuery,
  useTasksQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import { buildDashboardView } from "../utils/buildDashboardView";

/** Dashboard figures from the same projects/tasks queries the Work page uses. */
export function useDashboardView() {
  const projectsQuery = useProjectsQuery();
  const tasksQuery = useTasksQuery();
  const areasQuery = useProjectAreasQuery();
  const peopleQuery = usePeopleQuery();
  const { currentUserPersonId } = useCurrentUserPerson();

  const isLoading =
    projectsQuery.isLoading ||
    tasksQuery.isLoading ||
    areasQuery.isLoading ||
    peopleQuery.isLoading;

  const isError =
    projectsQuery.isError ||
    tasksQuery.isError ||
    areasQuery.isError ||
    peopleQuery.isError;

  const errorMessage =
    (projectsQuery.error instanceof Error && projectsQuery.error.message) ||
    (tasksQuery.error instanceof Error && tasksQuery.error.message) ||
    (areasQuery.error instanceof Error && areasQuery.error.message) ||
    (peopleQuery.error instanceof Error && peopleQuery.error.message) ||
    "Failed to load dashboard";

  const dataUpdatedAt = Math.max(
    projectsQuery.dataUpdatedAt ?? 0,
    tasksQuery.dataUpdatedAt ?? 0,
    areasQuery.dataUpdatedAt ?? 0,
    peopleQuery.dataUpdatedAt ?? 0
  );

  const view = useMemo(() => {
    if (isLoading || isError) return null;
    return buildDashboardView(
      projectsQuery.data ?? [],
      tasksQuery.data ?? [],
      areasQuery.data ?? [],
      peopleQuery.data ?? [],
      currentUserPersonId
    );
  }, [
    areasQuery.data,
    currentUserPersonId,
    isError,
    isLoading,
    peopleQuery.data,
    projectsQuery.data,
    tasksQuery.data,
  ]);

  return {
    view,
    isLoading,
    isError,
    errorMessage,
    dataUpdatedAt,
  };
}
