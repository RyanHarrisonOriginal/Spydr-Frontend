import { useIdeasQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useCollectionView } from "@/domain/spydr/features/shared/hooks/useCollectionView";
import { useCollectionReorder } from "@/domain/spydr/features/shared/hooks/useCollectionReorder";
import { useGetPriorityRank } from "@/domain/spydr/features/shared/hooks/usePriorityRankLookup";
import { ideasCollection } from "@/domain/spydr/utils/collections/ideasCollection";

export function useIdeasPage() {
  const query = useIdeasQuery();
  const ideas = query.data ?? [];
  const view = useCollectionView(ideasCollection, ideas);
  const reorder = useCollectionReorder("idea", view);
  const getPriorityRank = useGetPriorityRank(ideas);

  return {
    view,
    reorder,
    getPriorityRank,
    totalCount: ideas.length,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load ideas",
    refetch: query.refetch,
  };
}
