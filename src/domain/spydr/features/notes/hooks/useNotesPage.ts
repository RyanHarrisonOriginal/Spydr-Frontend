import { useMemo } from "react";
import { useNotesQuery } from "@/domain/spydr/features/shared/hooks/queries";

export function useNotesPage() {
  const query = useNotesQuery();
  const notes = query.data ?? [];

  const sortedNotes = useMemo(
    () =>
      [...notes].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [notes]
  );

  return {
    notes: sortedNotes,
    totalCount: notes.length,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load notes",
  };
}
