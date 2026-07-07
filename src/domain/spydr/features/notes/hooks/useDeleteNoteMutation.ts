import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { NoteNode } from "@/domain/spydr/utils/types";

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (noteId: string) => spydrApi.notes.delete(noteId),
    onSuccess: (_data, noteId) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<NoteNode[]>(spydrOrgKey(activeOrgId, "notes"), (current) =>
        current?.filter((note) => note.id !== noteId)
      );
      queryClient.removeQueries({
        queryKey: spydrOrgKey(activeOrgId, "notes", noteId),
      });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "dashboard") });
    },
  });
}
