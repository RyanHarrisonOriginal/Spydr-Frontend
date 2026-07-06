import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { NoteNode, UpdateNoteInput } from "@/domain/spydr/utils/types";

export function useUpdateNoteMutation(noteId?: string) {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateNoteInput;
    }) => spydrApi.notes.update(id, input),
    onSuccess: (updatedNote) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<NoteNode>(
        spydrOrgKey(activeOrgId, "notes", updatedNote.id),
        updatedNote
      );
      queryClient.setQueryData<NoteNode[]>(spydrOrgKey(activeOrgId, "notes"), (current) => {
        if (!current) return current;
        return current.map((note) =>
          note.id === updatedNote.id ? updatedNote : note
        );
      });
      if (noteId && noteId !== updatedNote.id) {
        queryClient.invalidateQueries({
          queryKey: spydrOrgKey(activeOrgId, "notes", noteId),
        });
      }
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
    },
  });
}
