import { useMemo, useState } from "react";
import type { ProjectAreaNode, ProjectNode } from "@/domain/spydr/utils/types";
import {
  applyProjectListView,
  countActiveProjectListFilters,
  defaultProjectListFilters,
  defaultProjectListSort,
  hasActiveProjectListFilters,
  type ProjectListFilters,
  type ProjectListSort,
  type ProjectSortColumn,
  toggleFilterValue,
  toggleSort,
} from "@/domain/spydr/utils/projectListView";

export function useProjectListView(projects: ProjectNode[], areas: ProjectAreaNode[]) {
  const [filters, setFilters] = useState<ProjectListFilters>(defaultProjectListFilters);
  const [sort, setSort] = useState<ProjectListSort>(defaultProjectListSort);

  const visibleProjects = useMemo(
    () => applyProjectListView(projects, areas, filters, sort),
    [projects, areas, filters, sort]
  );

  const setSearch = (search: string) => {
    setFilters((current) => ({ ...current, search }));
  };

  const toggleStatusFilter = (status: string) => {
    setFilters((current) => ({
      ...current,
      statuses: toggleFilterValue(current.statuses, status),
    }));
  };

  const togglePriorityFilter = (priority: string) => {
    setFilters((current) => ({
      ...current,
      priorities: toggleFilterValue(current.priorities, priority),
    }));
  };

  const toggleAreaFilter = (areaId: string) => {
    setFilters((current) => ({
      ...current,
      areaIds: toggleFilterValue(current.areaIds, areaId),
    }));
  };

  const clearFilters = () => {
    setFilters(defaultProjectListFilters);
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
    toggleStatusFilter,
    togglePriorityFilter,
    toggleAreaFilter,
    clearFilters,
    toggleSortColumn,
  };
}
