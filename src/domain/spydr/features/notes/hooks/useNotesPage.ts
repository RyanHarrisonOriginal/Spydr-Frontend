import { useNotesQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useCollectionView } from "@/domain/spydr/features/shared/hooks/useCollectionView";
import { useCollectionReorder } from "@/domain/spydr/features/shared/hooks/useCollectionReorder";
import { notesCollection } from "@/domain/spydr/utils/collections/notesCollection";
import { useDeleteNoteMutation } from "./useDeleteNoteMutation";
import { useState } from "react";

export function useNotesPage() {
  const query = useNotesQuery();
  const notes = query.data ?? [];
  const view = useCollectionView(notesCollection, notes);
  const reorder = useCollectionReorder("note", view);
  const deleteNote = useDeleteNoteMutation();
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteNoteById = (noteId: string) => {
    setDeleteError(null);
    setDeletingNoteId(noteId);
    deleteNote.mutate(noteId, {
      onError: (error) => {
        setDeleteError(
          error instanceof Error ? error.message : "Failed to delete note"
        );
      },
      onSettled: () => setDeletingNoteId(null),
    });
  };

  return {
    view,
    reorder,
    getPriorityRank: view.getPriorityRank,
    deleteNote: deleteNoteById,
    deletingNoteId,
    deleteError,
    totalCount: notes.length,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load notes",
  };
}
