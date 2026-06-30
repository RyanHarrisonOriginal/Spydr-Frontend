import { useNotesQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useCollectionView } from "@/domain/spydr/features/shared/hooks/useCollectionView";
import { notesCollection } from "@/domain/spydr/utils/collections/notesCollection";

export function useNotesPage() {
  const query = useNotesQuery();
  const notes = query.data ?? [];
  const view = useCollectionView(notesCollection, notes);

  return {
    view,
    totalCount: notes.length,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load notes",
  };
}
