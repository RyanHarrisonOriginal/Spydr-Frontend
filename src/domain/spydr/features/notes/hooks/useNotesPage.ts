import { useNotesQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useCollectionView } from "@/domain/spydr/features/shared/hooks/useCollectionView";
import { useCollectionReorder } from "@/domain/spydr/features/shared/hooks/useCollectionReorder";
import { useGetPriorityRank } from "@/domain/spydr/features/shared/hooks/usePriorityRankLookup";
import { notesCollection } from "@/domain/spydr/utils/collections/notesCollection";

export function useNotesPage() {
  const query = useNotesQuery();
  const notes = query.data ?? [];
  const view = useCollectionView(notesCollection, notes);
  const reorder = useCollectionReorder("note", view);
  const getPriorityRank = useGetPriorityRank(notes);

  return {
    view,
    reorder,
    getPriorityRank,
    totalCount: notes.length,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load notes",
  };
}
