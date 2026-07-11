import {
  endOfMonth,
  endOfWeek,
  isBefore,
  startOfDay,
  subDays,
} from "date-fns";
import type { ProjectAreaNode, PersonNode, ProjectNode } from "@/domain/spydr/utils/types";
import { projectPriorities } from "@/domain/spydr/utils/projectPriority";
import { projectStatuses } from "@/domain/spydr/utils/projectStatus";
import { resolveProjectAreaId } from "@/domain/spydr/utils/projectAreas";
import { personDisplayName } from "@/domain/spydr/utils/projectPersonas";
import { parseCalendarDate } from "@/domain/spydr/utils/dateOnly";

export const UNASSIGNED_AREA_FILTER = "__unassigned__";
export const UNASSIGNED_ASSIGNEE_FILTER = "__unassigned_assignee__";

export const projectListFilterFacetIds = [
  "status",
  "priority",
  "area",
  "assignee",
  "target",
  "updated",
] as const;

export type ProjectListFilterFacetId = (typeof projectListFilterFacetIds)[number];

export const targetFilterBuckets = [
  { id: "no_date", label: "No date" },
  { id: "overdue", label: "Overdue" },
  { id: "this_week", label: "This week" },
  { id: "this_month", label: "This month" },
  { id: "later", label: "Later" },
] as const;

export type TargetFilterBucket = (typeof targetFilterBuckets)[number]["id"];

export const updatedFilterBuckets = [
  { id: "last_7d", label: "Last 7 days" },
  { id: "last_30d", label: "Last 30 days" },
  { id: "last_90d", label: "Last 90 days" },
  { id: "older", label: "Older than 90 days" },
] as const;

export type UpdatedFilterBucket = (typeof updatedFilterBuckets)[number]["id"];

export interface ProjectListFilterFacetDef {
  id: ProjectListFilterFacetId;
  label: string;
  columnId: ProjectListFilterFacetId;
}

export const projectListFilterFacets: ProjectListFilterFacetDef[] = [
  { id: "status", label: "Status", columnId: "status" },
  { id: "priority", label: "Priority", columnId: "priority" },
  { id: "area", label: "Area", columnId: "area" },
  { id: "assignee", label: "Assignee", columnId: "assignee" },
  { id: "target", label: "Target", columnId: "target" },
  { id: "updated", label: "Updated", columnId: "updated" },
];

export interface ProjectListFilters {
  search: string;
  selections: Partial<Record<ProjectListFilterFacetId, string[]>>;
}

export const defaultProjectListFilters: ProjectListFilters = {
  search: "",
  selections: {},
};

export interface ProjectListFilterContext {
  areas: ProjectAreaNode[];
  people: PersonNode[];
}

export interface ProjectListFilterOption {
  value: string;
  label: string;
  itemClassName?: string;
}

export interface ProjectListActiveFilterChip {
  facetId: ProjectListFilterFacetId;
  value: string;
  label: string;
}

function parseTimestamp(value: string | null | undefined): Date | null {
  if (!value) return null;
  const calendar = parseCalendarDate(value);
  if (calendar) return calendar;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getFacetSelections(
  filters: ProjectListFilters,
  facetId: ProjectListFilterFacetId
): string[] {
  return filters.selections[facetId] ?? [];
}

export function toggleFilterValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function toggleFacetSelection(
  filters: ProjectListFilters,
  facetId: ProjectListFilterFacetId,
  value: string
): ProjectListFilters {
  const current = getFacetSelections(filters, facetId);
  const next = toggleFilterValue(current, value);
  const selections = { ...filters.selections };

  if (next.length === 0) {
    delete selections[facetId];
  } else {
    selections[facetId] = next;
  }

  return { ...filters, selections };
}

export function clearFacetSelection(
  filters: ProjectListFilters,
  facetId: ProjectListFilterFacetId
): ProjectListFilters {
  if (!filters.selections[facetId]) return filters;
  const selections = { ...filters.selections };
  delete selections[facetId];
  return { ...filters, selections };
}

export function hasActiveProjectListFilters(filters: ProjectListFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    projectListFilterFacetIds.some((facetId) => getFacetSelections(filters, facetId).length > 0)
  );
}

export function countActiveProjectListFilters(filters: ProjectListFilters): number {
  let count = 0;
  if (filters.search.trim()) count += 1;
  for (const facetId of projectListFilterFacetIds) {
    if (getFacetSelections(filters, facetId).length > 0) count += 1;
  }
  return count;
}

export function getFacetOptions(
  facetId: ProjectListFilterFacetId,
  context: ProjectListFilterContext
): ProjectListFilterOption[] {
  switch (facetId) {
    case "status":
      return projectStatuses.map((status) => ({
        value: status,
        label: status.replace(/_/g, " "),
        itemClassName: "capitalize",
      }));
    case "priority":
      return projectPriorities.map((priority) => ({
        value: priority,
        label: priority,
        itemClassName: "font-mono uppercase text-[11px]",
      }));
    case "area":
      return [
        { value: UNASSIGNED_AREA_FILTER, label: "Unassigned" },
        ...context.areas.map((area) => ({
          value: area.id,
          label: area.title,
        })),
      ];
    case "assignee":
      return [
        { value: UNASSIGNED_ASSIGNEE_FILTER, label: "Unassigned" },
        ...context.people.map((person) => ({
          value: person.id,
          label: personDisplayName(person),
        })),
      ];
    case "target":
      return targetFilterBuckets.map((bucket) => ({
        value: bucket.id,
        label: bucket.label,
      }));
    case "updated":
      return updatedFilterBuckets.map((bucket) => ({
        value: bucket.id,
        label: bucket.label,
      }));
    default:
      return [];
  }
}

function resolveOptionLabel(
  facetId: ProjectListFilterFacetId,
  value: string,
  context: ProjectListFilterContext
): string {
  return (
    getFacetOptions(facetId, context).find((option) => option.value === value)?.label ??
    value
  );
}

export function getActiveFilterChips(
  filters: ProjectListFilters,
  context: ProjectListFilterContext
): ProjectListActiveFilterChip[] {
  const chips: ProjectListActiveFilterChip[] = [];

  for (const facetId of projectListFilterFacetIds) {
    for (const value of getFacetSelections(filters, facetId)) {
      chips.push({
        facetId,
        value,
        label: resolveOptionLabel(facetId, value, context),
      });
    }
  }

  return chips;
}

function resolveAssigneeId(project: ProjectNode): string | null {
  return project.personas?.assignee?.id ?? project.details?.assigneePersonNodeId ?? null;
}

function matchesTargetBucket(project: ProjectNode, bucket: string): boolean {
  const target = parseTimestamp(project.details?.targetDate);
  const today = startOfDay(new Date());

  switch (bucket as TargetFilterBucket) {
    case "no_date":
      return !target;
    case "overdue":
      return target !== null && isBefore(target, today);
    case "this_week": {
      if (!target || isBefore(target, today)) return false;
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      return !isBefore(weekEnd, target);
    }
    case "this_month": {
      if (!target || isBefore(target, today)) return false;
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      const monthEnd = endOfMonth(today);
      return isBefore(weekEnd, target) && !isBefore(monthEnd, target);
    }
    case "later": {
      if (!target) return false;
      const monthEnd = endOfMonth(today);
      return isBefore(monthEnd, target);
    }
    default:
      return false;
  }
}

function matchesUpdatedBucket(project: ProjectNode, bucket: string): boolean {
  const updated = parseTimestamp(project.updatedAt);
  if (!updated) return false;

  const now = new Date();
  switch (bucket as UpdatedFilterBucket) {
    case "last_7d":
      return !isBefore(updated, subDays(now, 7));
    case "last_30d":
      return !isBefore(updated, subDays(now, 30));
    case "last_90d":
      return !isBefore(updated, subDays(now, 90));
    case "older":
      return isBefore(updated, subDays(now, 90));
    default:
      return false;
  }
}

function projectMatchesFacet(
  project: ProjectNode,
  facetId: ProjectListFilterFacetId,
  values: string[],
  context: ProjectListFilterContext
): boolean {
  if (values.length === 0) return true;

  switch (facetId) {
    case "status":
      return values.includes(project.status);
    case "priority":
      return values.includes(project.priority);
    case "area": {
      const areaId = resolveProjectAreaId(project, context.areas);
      const matchesUnassigned =
        values.includes(UNASSIGNED_AREA_FILTER) && !areaId;
      const matchesArea = areaId ? values.includes(areaId) : false;
      return matchesUnassigned || matchesArea;
    }
    case "assignee": {
      const assigneeId = resolveAssigneeId(project);
      const matchesUnassigned =
        values.includes(UNASSIGNED_ASSIGNEE_FILTER) && !assigneeId;
      const matchesAssignee = assigneeId ? values.includes(assigneeId) : false;
      return matchesUnassigned || matchesAssignee;
    }
    case "target":
      return values.some((bucket) => matchesTargetBucket(project, bucket));
    case "updated":
      return values.some((bucket) => matchesUpdatedBucket(project, bucket));
    default:
      return true;
  }
}

export function filterProjects(
  projects: ProjectNode[],
  filters: ProjectListFilters,
  context: ProjectListFilterContext
): ProjectNode[] {
  const search = filters.search.trim().toLowerCase();
  const hasFacetFilters = projectListFilterFacetIds.some(
    (facetId) => getFacetSelections(filters, facetId).length > 0
  );

  if (!search && !hasFacetFilters) {
    return projects;
  }

  return projects.filter((project) => {
    for (const facetId of projectListFilterFacetIds) {
      const values = getFacetSelections(filters, facetId);
      if (!projectMatchesFacet(project, facetId, values, context)) {
        return false;
      }
    }

    if (!search) return true;

    const haystack = [
      project.title,
      project.body,
      project.area ?? "",
      personDisplayName(project.personas?.assignee ?? null),
      ...project.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}
