import { useCallback, useMemo, useState } from "react";
import {
  usePeopleQuery,
  useProjectAreasQuery,
  useProjectsQuery,
  useTasksQuery,
} from "@/domain/spydr/features/shared/hooks/queries";
import {
  buildWorkspaceGraph,
  defaultGraphNodeFilters,
  type GraphNodeFilters,
  type GraphNodeKind,
} from "@/domain/spydr/utils/workspaceGraphModel";

export function useGraphPage() {
  const projectsQuery = useProjectsQuery();
  const tasksQuery = useTasksQuery();
  const peopleQuery = usePeopleQuery();
  const areasQuery = useProjectAreasQuery();

  const [filters, setFilters] = useState<GraphNodeFilters>(defaultGraphNodeFilters);

  const toggleFilter = useCallback((kind: GraphNodeKind) => {
    setFilters((current) => ({ ...current, [kind]: !current[kind] }));
  }, []);

  const projects = projectsQuery.data ?? [];
  const tasks = tasksQuery.isError ? [] : (tasksQuery.data ?? []);
  const people = peopleQuery.isError ? [] : (peopleQuery.data ?? []);
  const areas = areasQuery.isError ? [] : (areasQuery.data ?? []);

  const graph = useMemo(
    () =>
      buildWorkspaceGraph({
        projects,
        tasks,
        people,
        areas,
        filters,
      }),
    [areas, filters, people, projects, tasks]
  );

  const queries = [projectsQuery, tasksQuery, peopleQuery, areasQuery];

  const isLoading = queries.some((query) => query.isLoading);

  const isError =
    !isLoading &&
    graph.stats.nodeCount === 0 &&
    queries.some((query) => query.isError);

  const partialErrors = queries.filter((query) => query.isError);

  const errorMessage =
    (partialErrors[0]?.error instanceof Error && partialErrors[0].error.message) ||
    "Failed to load workspace graph";

  return {
    ...graph,
    filters,
    toggleFilter,
    isLoading,
    isError,
    errorMessage,
    partialErrors: partialErrors.length,
  };
}
