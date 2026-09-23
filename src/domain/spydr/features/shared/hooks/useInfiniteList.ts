import { useCallback, useMemo, useState } from "react";

export const INFINITE_LIST_BATCH_SIZE = 20;

export function nextVisibleCount(
  current: number,
  total: number,
  batchSize: number
): number {
  if (current >= total) return current;
  return Math.min(total, current + batchSize);
}

/** Keep the unloaded tail in place when the visible prefix is reordered. */
export function mergeVisibleReorder(
  fullIds: readonly string[],
  visibleCount: number,
  visibleOrderedIds: readonly string[]
): string[] {
  return [...visibleOrderedIds, ...fullIds.slice(visibleCount)];
}

export interface InfiniteList<T> {
  visibleItems: T[];
  totalItems: number;
  hasMore: boolean;
  loadMore(): void;
  mergeVisibleReorder(visibleOrderedIds: string[]): string[];
}

/**
 * Reveals an already filtered/sorted list in batches.
 * `resetKey` returns the window to the first batch (filters, sort, scope).
 */
export function useInfiniteList<T extends { id: string }>(
  items: readonly T[],
  options?: {
    batchSize?: number;
    resetKey?: string | number;
  }
): InfiniteList<T> {
  const batchSize = options?.batchSize ?? INFINITE_LIST_BATCH_SIZE;
  const resetKey = options?.resetKey;
  const [windowState, setWindowState] = useState({
    resetKey,
    batchSize,
    count: batchSize,
  });

  const visibleCount =
    windowState.resetKey === resetKey && windowState.batchSize === batchSize
      ? windowState.count
      : batchSize;

  const loadMore = useCallback(() => {
    setWindowState((current) => {
      const count =
        current.resetKey === resetKey && current.batchSize === batchSize
          ? current.count
          : batchSize;
      return {
        resetKey,
        batchSize,
        count: nextVisibleCount(count, items.length, batchSize),
      };
    });
  }, [resetKey, items.length, batchSize]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  return {
    visibleItems,
    totalItems: items.length,
    hasMore: visibleItems.length < items.length,
    loadMore,
    mergeVisibleReorder: (visibleOrderedIds) =>
      mergeVisibleReorder(
        items.map((item) => item.id),
        visibleItems.length,
        visibleOrderedIds
      ),
  };
}
