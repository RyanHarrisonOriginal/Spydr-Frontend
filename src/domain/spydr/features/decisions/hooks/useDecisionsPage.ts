import { useDecisionsQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useCollectionView } from "@/domain/spydr/features/shared/hooks/useCollectionView";
import { useCollectionReorder } from "@/domain/spydr/features/shared/hooks/useCollectionReorder";
import { useGetPriorityRank } from "@/domain/spydr/features/shared/hooks/usePriorityRankLookup";
import { decisionsCollection } from "@/domain/spydr/utils/collections/decisionsCollection";

export function useDecisionsPage() {
  const query = useDecisionsQuery();
  const decisions = query.data ?? [];
  const view = useCollectionView(decisionsCollection, decisions);
  const reorder = useCollectionReorder("decision", view);
  const getPriorityRank = useGetPriorityRank(decisions);

  return {
    view,
    reorder,
    getPriorityRank,
    totalCount: decisions.length,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load decisions",
  };
}
