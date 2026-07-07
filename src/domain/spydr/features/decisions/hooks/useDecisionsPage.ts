import { useState } from "react";
import { useDecisionsQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useCollectionView } from "@/domain/spydr/features/shared/hooks/useCollectionView";
import { useCollectionReorder } from "@/domain/spydr/features/shared/hooks/useCollectionReorder";
import { decisionsCollection } from "@/domain/spydr/utils/collections/decisionsCollection";
import { useDeleteDecisionMutation } from "./useDeleteDecisionMutation";

export function useDecisionsPage() {
  const query = useDecisionsQuery();
  const decisions = query.data ?? [];
  const view = useCollectionView(decisionsCollection, decisions);
  const reorder = useCollectionReorder("decision", view);
  const deleteDecision = useDeleteDecisionMutation();
  const [deletingDecisionId, setDeletingDecisionId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteDecisionById = (decisionId: string) => {
    setDeleteError(null);
    setDeletingDecisionId(decisionId);
    deleteDecision.mutate(decisionId, {
      onError: (error) => {
        setDeleteError(
          error instanceof Error ? error.message : "Failed to delete decision"
        );
      },
      onSettled: () => setDeletingDecisionId(null),
    });
  };

  return {
    view,
    reorder,
    getPriorityRank: view.getPriorityRank,
    deleteDecision: deleteDecisionById,
    deletingDecisionId,
    deleteError,
    totalCount: decisions.length,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load decisions",
  };
}
