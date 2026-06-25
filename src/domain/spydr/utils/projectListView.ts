import type { ProjectAreaNode, ProjectNode } from "@/domain/spydr/utils/types";
import { projectPriorities } from "@/domain/spydr/utils/projectPriority";
import { projectStatuses } from "@/domain/spydr/utils/projectStatus";
import { resolveProjectAreaId } from "@/domain/spydr/utils/projectAreas";

export const UNASSIGNED_AREA_FILTER = "__unassigned__";

export const projectSortColumns = [
  "name",
  "area",
  "priority",
  "status",
  "target",
  "updated",
] as const;

export type ProjectSortColumn = (typeof projectSortColumns)[number];
export type SortDirection = "asc" | "desc";

export interface ProjectListFilters {
  search: string;
  statuses: string[];
  priorities: string[];
  areaIds: string[];
}

export interface ProjectListSort {
  column: ProjectSortColumn;
  direction: SortDirection;
}

export const defaultProjectListFilters: ProjectListFilters = {
  search: "",
  statuses: [],
  priorities: [],
  areaIds: [],
};

export const defaultProjectListSort: ProjectListSort = {
  column: "updated",
  direction: "desc",
};

const priorityOrder = Object.fromEntries(
  projectPriorities.map((priority, index) => [priority, index])
) as Record<string, number>;

const statusOrder = Object.fromEntries(
  projectStatuses.map((status, index) => [status, index])
) as Record<string, number>;

function parseTimestamp(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function compareStrings(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function compareNullableNumbers(
  a: number | null,
  b: number | null,
  direction: SortDirection
): number {
  if (a === null && b === null) return 0;
  if (a === null) return direction === "asc" ? 1 : -1;
  if (b === null) return direction === "asc" ? -1 : 1;
  return a - b;
}

export function hasActiveProjectListFilters(filters: ProjectListFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.areaIds.length > 0
  );
}

export function countActiveProjectListFilters(filters: ProjectListFilters): number {
  let count = 0;
  if (filters.search.trim()) count += 1;
  if (filters.statuses.length > 0) count += 1;
  if (filters.priorities.length > 0) count += 1;
  if (filters.areaIds.length > 0) count += 1;
  return count;
}

export function filterProjects(
  projects: ProjectNode[],
  areas: ProjectAreaNode[],
  filters: ProjectListFilters
): ProjectNode[] {
  const search = filters.search.trim().toLowerCase();
  if (
    !search &&
    filters.statuses.length === 0 &&
    filters.priorities.length === 0 &&
    filters.areaIds.length === 0
  ) {
    return projects;
  }

  return projects.filter((project) => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(project.status)) {
      return false;
    }

    if (filters.priorities.length > 0 && !filters.priorities.includes(project.priority)) {
      return false;
    }

    if (filters.areaIds.length > 0) {
      const areaId = resolveProjectAreaId(project, areas);
      const matchesUnassigned =
        filters.areaIds.includes(UNASSIGNED_AREA_FILTER) && !areaId;
      const matchesArea = areaId ? filters.areaIds.includes(areaId) : false;
      if (!matchesUnassigned && !matchesArea) {
        return false;
      }
    }

    if (!search) return true;

    const haystack = [
      project.title,
      project.body,
      project.area ?? "",
      ...project.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function sortProjects(
  projects: ProjectNode[],
  areas: ProjectAreaNode[],
  sort: ProjectListSort
): ProjectNode[] {
  const sorted = [...projects];
  const directionMultiplier = sort.direction === "asc" ? 1 : -1;

  sorted.sort((left, right) => {
    let result = 0;

    switch (sort.column) {
      case "name":
        result = compareStrings(left.title, right.title);
        break;
      case "area":
        result = compareStrings(left.area ?? "", right.area ?? "");
        break;
      case "priority":
        result =
          (priorityOrder[left.priority] ?? 99) - (priorityOrder[right.priority] ?? 99);
        break;
      case "status":
        result = (statusOrder[left.status] ?? 99) - (statusOrder[right.status] ?? 99);
        break;
      case "target":
        result = compareNullableNumbers(
          parseTimestamp(left.details?.targetDate),
          parseTimestamp(right.details?.targetDate),
          sort.direction
        );
        return result;
      case "updated":
        result = compareNullableNumbers(
          parseTimestamp(left.updatedAt),
          parseTimestamp(right.updatedAt),
          sort.direction
        );
        return result;
      default:
        result = 0;
    }

    return result * directionMultiplier;
  });

  return sorted;
}

export function applyProjectListView(
  projects: ProjectNode[],
  areas: ProjectAreaNode[],
  filters: ProjectListFilters,
  sort: ProjectListSort
): ProjectNode[] {
  return sortProjects(filterProjects(projects, areas, filters), areas, sort);
}

export function toggleSort(
  current: ProjectListSort,
  column: ProjectSortColumn
): ProjectListSort {
  if (current.column === column) {
    return {
      column,
      direction: current.direction === "asc" ? "desc" : "asc",
    };
  }

  return {
    column,
    direction: column === "updated" || column === "target" ? "desc" : "asc",
  };
}

export function toggleFilterValue<T extends string>(
  values: T[],
  value: T
): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}
