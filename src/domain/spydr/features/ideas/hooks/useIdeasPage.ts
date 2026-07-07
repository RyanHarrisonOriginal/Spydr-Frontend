import { useIdeasQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useCollectionView } from "@/domain/spydr/features/shared/hooks/useCollectionView";
import { useCollectionReorder } from "@/domain/spydr/features/shared/hooks/useCollectionReorder";
import { ideasCollection } from "@/domain/spydr/utils/collections/ideasCollection";
import { useDeleteIdeaMutation } from "./useDeleteIdeaMutation";
import { useState } from "react";

export function useIdeasPage() {
  const query = useIdeasQuery();
  const ideas = query.data ?? [];
  const view = useCollectionView(ideasCollection, ideas);
  const reorder = useCollectionReorder("idea", view);
  const deleteIdea = useDeleteIdeaMutation();
  const [deletingIdeaId, setDeletingIdeaId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteIdeaById = (ideaId: string) => {
    setDeleteError(null);
    setDeletingIdeaId(ideaId);
    deleteIdea.mutate(ideaId, {
      onError: (error) => {
        setDeleteError(
          error instanceof Error ? error.message : "Failed to delete idea"
        );
      },
      onSettled: () => setDeletingIdeaId(null),
    });
  };

  return {
    view,
    reorder,
    getPriorityRank: view.getPriorityRank,
    deleteIdea: deleteIdeaById,
    deletingIdeaId,
    deleteError,
    totalCount: ideas.length,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load ideas",
    refetch: query.refetch,
  };
}
