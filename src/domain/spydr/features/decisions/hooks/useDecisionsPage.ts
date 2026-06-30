import { useDecisionsQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useCollectionView } from "@/domain/spydr/features/shared/hooks/useCollectionView";
import { decisionsCollection } from "@/domain/spydr/utils/collections/decisionsCollection";

export function useDecisionsPage() {
  const query = useDecisionsQuery();
  const decisions = query.data ?? [];
  const view = useCollectionView(decisionsCollection, decisions);

  return {
    view,
    totalCount: decisions.length,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load decisions",
  };
}
