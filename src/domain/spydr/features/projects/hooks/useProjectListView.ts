import { useMemo, useState } from "react";
import type { ProjectAreaNode, PersonNode, ProjectNode } from "@/domain/spydr/utils/types";
import {
  applyProjectListView,
  countActiveProjectListFilters,
  defaultProjectListFilters,
  defaultProjectListSort,
  hasActiveProjectListFilters,
  toggleSort,
  type ProjectListFilterFacetId,
  type ProjectListFilters,
  type ProjectListSort,
  type ProjectSortColumn,
} from "@/domain/spydr/utils/projectListView";
import {
  clearFacetSelection,
  getFacetSelections,
  toggleFacetSelection,
} from "@/domain/spydr/utils/projectListFilterModel";

export function useProjectListView(
  projects: ProjectNode[],
  areas: ProjectAreaNode[],
  people: PersonNode[]
) {
  const [filters, setFilters] = useState<ProjectListFilters>(defaultProjectListFilters);
  const [sort, setSort] = useState<ProjectListSort>(defaultProjectListSort);

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
