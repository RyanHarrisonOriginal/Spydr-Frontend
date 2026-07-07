import { useCallback, useMemo } from "react";
import type { SortDirection } from "@/domain/spydr/utils/collectionView";
import {
  buildPriorityRankLookup,
  resolveCollectionPriorityRank,
} from "@/domain/spydr/utils/collections/shared";

export function usePriorityRankLookup<T extends { id: string; sortOrder?: number }>(
  items: readonly T[]
) {
  return useMemo(() => buildPriorityRankLookup(items), [items]);
}

export function useGetPriorityRank<T extends { id: string; sortOrder?: number }>(
  items: readonly T[]
) {
  const lookup = usePriorityRankLookup(items);
  return (id: string) => lookup.get(id);
}

/** Rank badges that stay aligned with the visible list when sorted by manual order. */
export function useCollectionDisplayPriorityRank<T extends { id: string; sortOrder?: number }>(
  allItems: readonly T[],
  visibleItems: readonly T[],
  sortColumnId: string,
  sortDirection: SortDirection
) {
  const manualLookup = usePriorityRankLookup(allItems);

  return useCallback(
    (id: string) =>
      resolveCollectionPriorityRank(
        id,
        allItems,
        visibleItems,
        sortColumnId,
        sortDirection,
        manualLookup
      ),
    [allItems, visibleItems, sortColumnId, sortDirection, manualLookup]
  );
}
