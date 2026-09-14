import type { TaskNode } from "@/domain/spydr/utils/types";
import {
  sortItems,
  type CollectionSortState,
} from "@/domain/spydr/utils/collectionView";
import { tasksCollection } from "@/domain/spydr/utils/collections/tasksCollection";

export const nestedTaskSortIds = [
  "order",
  "status",
  "title",
  "assignee",
  "due",
] as const;

export type NestedTaskSortId = (typeof nestedTaskSortIds)[number];

export const defaultNestedTaskSort: CollectionSortState = {
  columnId: "order",
  direction: "asc",
};

export const nestedTaskSortDefs = tasksCollection.sorts.filter((sort) =>
  (nestedTaskSortIds as readonly string[]).includes(sort.id)
);

export function isNestedTaskSortId(value: string): value is NestedTaskSortId {
  return (nestedTaskSortIds as readonly string[]).includes(value);
}

export function sanitizeNestedTaskSort(
  raw: unknown,
  fallback: CollectionSortState
): CollectionSortState {
  if (!raw || typeof raw !== "object") return fallback;
  const columnId = "columnId" in raw ? raw.columnId : null;
  const direction = "direction" in raw ? raw.direction : null;
  if (typeof columnId !== "string" || !isNestedTaskSortId(columnId)) {
    return fallback;
  }
  if (direction !== "asc" && direction !== "desc") return fallback;
  return { columnId, direction };
}

export function sortNestedTasks(
  tasks: TaskNode[],
  sort: CollectionSortState
): TaskNode[] {
  const sortDef =
    nestedTaskSortDefs.find((entry) => entry.id === sort.columnId) ??
    nestedTaskSortDefs.find((entry) => entry.id === "order");
  return sortItems(tasks, sortDef, sort.direction);
}
