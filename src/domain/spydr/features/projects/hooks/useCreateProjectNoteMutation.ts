import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateProjectNoteInput } from "@/domain/spydr/utils/types";

export function useCreateProjectNoteMutation(projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectNoteInput) =>
      spydrApi.projects.createNote(projectId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spydr", "projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["spydr", "notes"] });
    },
  });
}
