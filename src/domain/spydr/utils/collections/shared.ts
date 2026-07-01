import type { SortDef } from "@/domain/spydr/utils/collectionView";
import { projectPriorities } from "@/domain/spydr/utils/projectPriority";

/** Class applied to status options/badges in filter menus. */
export const STATUS_ITEM_CLASS = "capitalize";

/** Class applied to priority options in filter menus. */
export const PRIORITY_ITEM_CLASS = "font-mono uppercase text-[11px]";

/** Sort column id for manual drag-and-drop priority ordering. */
export const COLLECTION_ORDER_SORT_ID = "order";

export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

/**
 * Rank used to sort by priority. Higher rank = higher priority, so a "desc"
 * sort surfaces critical first. Unknown priorities rank below "low".
 */
export function priorityRank(priority: string | null | undefined): number {
  const index = projectPriorities.indexOf((priority ?? "") as (typeof projectPriorities)[number]);
  return index === -1 ? -1 : index;
}

export function sortOrderAccessor(item: { sortOrder?: number }): number {
  return item.sortOrder ?? 0;
}

/** 1-based rank from stored sortOrder (lower sortOrder = rank 1). */
export function buildPriorityRankLookup<T extends { id: string; sortOrder?: number }>(
  items: readonly T[]
): ReadonlyMap<string, number> {
  const sorted = [...items].sort(
    (left, right) =>
      (left.sortOrder ?? 0) - (right.sortOrder ?? 0) ||
      left.id.localeCompare(right.id)
  );
  return new Map(sorted.map((item, index) => [item.id, index + 1]));
}

export function createOrderSortDef<T extends { sortOrder?: number }>(): SortDef<T> {
  return {
    id: COLLECTION_ORDER_SORT_ID,
    label: "Rank",
    accessor: sortOrderAccessor,
    type: "number",
    defaultDirection: "asc",
  };
}

export function canManuallyReorderCollection(hasActiveFilters: boolean): boolean {
  return !hasActiveFilters;
}
