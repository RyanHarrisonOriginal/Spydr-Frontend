import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { NoteNode } from "@/domain/spydr/utils/types";

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: async (noteIdOrIds: string | string[]) => {
      const ids = Array.isArray(noteIdOrIds) ? noteIdOrIds : [noteIdOrIds];
      for (const noteId of ids) {
        await spydrApi.notes.delete(noteId);
      }
      return ids;
    },
    onSuccess: (ids) => {
      if (!activeOrgId) return;
      const removed = new Set(ids);
      queryClient.setQueryData<NoteNode[]>(spydrOrgKey(activeOrgId, "notes"), (current) =>
        current?.filter((note) => !removed.has(note.id))
      );
      for (const noteId of ids) {
        queryClient.removeQueries({
          queryKey: spydrOrgKey(activeOrgId, "notes", noteId),
        });
      }
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "dashboard") });
    },
  });
}
