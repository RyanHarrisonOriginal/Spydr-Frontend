import { useMemo } from "react";
import type { ProjectAreaNode, PersonNode, ProjectNode } from "@/domain/spydr/utils/types";
import {
  applyProjectListView,
  countActiveProjectListFilters,
  defaultProjectListFilters,
  defaultProjectListSort,
  hasActiveProjectListFilters,
  projectSortColumns,
  toggleSort,
  type ProjectListFilterFacetId,
  type ProjectListFilters,
  type ProjectListSort,
  type ProjectSortColumn,
} from "@/domain/spydr/utils/projectListView";
import {
  clearFacetSelection,
  getFacetSelections,
  projectListFilterFacetIds,
  toggleFacetSelection,
} from "@/domain/spydr/utils/projectListFilterModel";
import { usePersistentState } from "@/domain/spydr/features/shared/hooks/usePersistentState";

interface PersistedProjectListView {
  filters: ProjectListFilters;
  sort: ProjectListSort;
}

const defaultProjectListView: PersistedProjectListView = {
  filters: defaultProjectListFilters,
  sort: defaultProjectListSort,
};

function sanitizeProjectListView(
  raw: unknown,
  fallback: PersistedProjectListView
): PersistedProjectListView {
  if (!raw || typeof raw !== "object") return fallback;
  const value = raw as Partial<PersistedProjectListView>;

  const facetIds = new Set<string>(projectListFilterFacetIds);
  const selections: ProjectListFilters["selections"] = {};
  for (const [facetId, values] of Object.entries(value.filters?.selections ?? {})) {
    if (!facetIds.has(facetId) || !Array.isArray(values)) continue;
    const cleaned = values.filter((entry): entry is string => typeof entry === "string");
    if (cleaned.length > 0) {
      selections[facetId as ProjectListFilterFacetId] = cleaned;
    }
  }

  const column = (projectSortColumns as readonly string[]).includes(
    value.sort?.column ?? ""
  )
    ? (value.sort?.column as ProjectSortColumn)
    : defaultProjectListSort.column;
  const direction =
    value.sort?.direction === "asc" || value.sort?.direction === "desc"
      ? value.sort.direction
      : defaultProjectListSort.direction;

  return {
    filters: {
      search: typeof value.filters?.search === "string" ? value.filters.search : "",
      selections,
    },
    sort: { column, direction },
  };
}

export function useProjectListView(
  projects: ProjectNode[],
  areas: ProjectAreaNode[],
  people: PersonNode[]
) {
  const [view, setView] = usePersistentState<PersistedProjectListView>(
    "collection-view:projects",
    () => defaultProjectListView,
    sanitizeProjectListView
  );
  const { filters, sort } = view;

  const setFilters = (
    updater: ProjectListFilters | ((current: ProjectListFilters) => ProjectListFilters)
  ) => {
    setView((current) => ({
      ...current,
      filters:
        typeof updater === "function" ? updater(current.filters) : updater,
    }));
  };

  const setSort = (
    updater: ProjectListSort | ((current: ProjectListSort) => ProjectListSort)
  ) => {
    setView((current) => ({
      ...current,
      sort: typeof updater === "function" ? updater(current.sort) : updater,
    }));
  };

  const visibleProjects = useMemo(
    () => applyProjectListView(projects, areas, people, filters, sort),
    [projects, areas, people, filters, sort]
  );

  const setSearch = (search: string) => {
    setFilters((current) => ({ ...current, search }));
  };

  const toggleFacetFilter = (facetId: ProjectListFilterFacetId, value: string) => {
    setFilters((current) => toggleFacetSelection(current, facetId, value));
  };

  const removeFacetFilter = (facetId: ProjectListFilterFacetId, value: string) => {
    setFilters((current) => {
      if (!getFacetSelections(current, facetId).includes(value)) {
        return current;
      }
      return toggleFacetSelection(current, facetId, value);
    });
  };

  const clearFilters = () => {
    setFilters(defaultProjectListFilters);
  };

  const clearFacetFilters = (facetId: ProjectListFilterFacetId) => {
    setFilters((current) => clearFacetSelection(current, facetId));
  };

  const toggleSortColumn = (column: ProjectSortColumn) => {
    setSort((current) => toggleSort(current, column));
  };

  return {
    filters,
    sort,
    visibleProjects,
    filteredCount: visibleProjects.length,
    hasActiveFilters: hasActiveProjectListFilters(filters),
    activeFilterCount: countActiveProjectListFilters(filters),
    setSearch,
    toggleFacetFilter,
    removeFacetFilter,
    clearFilters,
    clearFacetFilters,
    toggleSortColumn,
  };
}
