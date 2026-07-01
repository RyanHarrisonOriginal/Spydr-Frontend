import { useMemo } from "react";
import { buildPriorityRankLookup } from "@/domain/spydr/utils/collections/shared";

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
