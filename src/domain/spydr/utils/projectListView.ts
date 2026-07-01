import type { ProjectAreaNode, PersonNode, ProjectNode } from "@/domain/spydr/utils/types";
import { projectPriorities } from "@/domain/spydr/utils/projectPriority";
import { projectStatuses } from "@/domain/spydr/utils/projectStatus";
import { personDisplayName } from "@/domain/spydr/utils/projectPersonas";
import {
  countActiveProjectListFilters,
  defaultProjectListFilters,
  filterProjects as filterProjectsByFacets,
  hasActiveProjectListFilters,
  toggleFilterValue,
  type ProjectListFilterContext,
  type ProjectListFilters,
} from "@/domain/spydr/utils/projectListFilterModel";

export {
  UNASSIGNED_AREA_FILTER,
  UNASSIGNED_ASSIGNEE_FILTER,
  defaultProjectListFilters,
  hasActiveProjectListFilters,
  countActiveProjectListFilters,
  toggleFilterValue,
  type ProjectListFilters,
  type ProjectListFilterFacetId,
  type ProjectListFilterContext,
} from "@/domain/spydr/utils/projectListFilterModel";

export const projectSortColumns = [
  "order",
  "name",
  "area",
  "assignee",
  "priority",
  "status",
  "target",
  "updated",
] as const;

export type ProjectSortColumn = (typeof projectSortColumns)[number];
export type SortDirection = "asc" | "desc";

export interface ProjectListSort {
  column: ProjectSortColumn;
  direction: SortDirection;
}

export const defaultProjectListSort: ProjectListSort = {
  column: "order",
  direction: "asc",
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
      case "order":
        result = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
        break;
      case "name":
        result = compareStrings(left.title, right.title);
        break;
      case "area":
        result = compareStrings(left.area ?? "", right.area ?? "");
        break;
      case "assignee":
        result = compareStrings(
          personDisplayName(left.personas?.assignee ?? null),
          personDisplayName(right.personas?.assignee ?? null)
        );
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
  people: PersonNode[],
  filters: ProjectListFilters,
  sort: ProjectListSort
): ProjectNode[] {
  const context: ProjectListFilterContext = { areas, people };
  return sortProjects(filterProjectsByFacets(projects, filters, context), areas, sort);
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
    direction:
      column === "updated" || column === "target"
        ? "desc"
        : column === "order"
          ? "asc"
          : "asc",
  };
}
