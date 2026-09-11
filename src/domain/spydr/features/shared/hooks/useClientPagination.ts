import { useEffect, useMemo, useState } from "react";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { usePersistentState } from "./usePersistentState";

export const LIST_PAGE_SIZE_OPTIONS = [10, 20, 30] as const;
export type ListPageSize = (typeof LIST_PAGE_SIZE_OPTIONS)[number];

function isListPageSize(value: unknown): value is ListPageSize {
  return (
    typeof value === "number" &&
    (LIST_PAGE_SIZE_OPTIONS as readonly number[]).includes(value)
  );
}

export interface ClientPaginationControls {
  pageIndex: number;
  pageSize: ListPageSize;
  pageCount: number;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  setPageIndex(pageIndex: number): void;
  setPageSize(pageSize: ListPageSize): void;
  previousPage(): void;
  nextPage(): void;
}

export interface ClientPagination<T> extends ClientPaginationControls {
  pageItems: T[];
  /** Merge a reordered page of ids back into the full filtered list order. */
  mergePageReorder(pageOrderedIds: string[]): string[];
}

export function useListPageSize(
  storageKeySuffix = "work-list",
  defaultPageSize: ListPageSize = 10
): [ListPageSize, (pageSize: ListPageSize) => void] {
  const { activeOrgId } = useOrganizationContext();
  const storageKey = activeOrgId
    ? `list-page-size:${storageKeySuffix}:${activeOrgId}`
    : `list-page-size:${storageKeySuffix}:pending`;

  return usePersistentState<ListPageSize>(
    storageKey,
    () => defaultPageSize,
    (raw, fallback) => (isListPageSize(raw) ? raw : fallback)
  );
}

/**
 * Client-side pagination over an already filtered/sorted list.
 * Resets to page 0 when `resetKey` or page size changes; clamps when the
 * item count shrinks.
 */
export function useClientPagination<T extends { id: string }>(
  items: readonly T[],
  options: {
    pageSize: ListPageSize;
    setPageSize(pageSize: ListPageSize): void;
    /** Change this when filters/search/scope change so the user returns to page 1. */
    resetKey?: string | number;
  }
): ClientPagination<T> {
  const { pageSize, setPageSize } = options;
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [options.resetKey, pageSize]);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize) || 1);

  useEffect(() => {
    setPageIndex((current) => Math.min(current, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const pageItems = useMemo(() => {
    const start = safePageIndex * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePageIndex, pageSize]);

  const totalItems = items.length;
  const rangeStart = totalItems === 0 ? 0 : safePageIndex * pageSize + 1;
  const rangeEnd = Math.min((safePageIndex + 1) * pageSize, totalItems);

  return {
    pageItems,
    pageIndex: safePageIndex,
    pageSize,
    pageCount,
    totalItems,
    rangeStart,
    rangeEnd,
    canPreviousPage: safePageIndex > 0,
    canNextPage: safePageIndex < pageCount - 1 && totalItems > 0,
    setPageIndex: (next) => {
      setPageIndex(Math.max(0, Math.min(next, pageCount - 1)));
    },
    setPageSize,
    previousPage: () => setPageIndex((current) => Math.max(0, current - 1)),
    nextPage: () =>
      setPageIndex((current) => Math.min(pageCount - 1, current + 1)),
    mergePageReorder: (pageOrderedIds) => {
      const fullIds = items.map((item) => item.id);
      const start = safePageIndex * pageSize;
      const end = start + pageItems.length;
      return [
        ...fullIds.slice(0, start),
        ...pageOrderedIds,
        ...fullIds.slice(end),
      ];
    },
  };
}
