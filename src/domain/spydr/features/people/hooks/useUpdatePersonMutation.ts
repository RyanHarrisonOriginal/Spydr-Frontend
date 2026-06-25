import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { PersonNode } from "@/domain/spydr/utils/types";

export function useUpdatePersonMutation(personId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof spydrApi.people.update>[1];
    }) => spydrApi.people.update(id, input),
    onSuccess: (person) => {
      queryClient.setQueryData<PersonNode[]>(["spydr", "people"], (current) =>
        current?.map((item) => (item.id === person.id ? person : item))
      );
      queryClient.setQueryData(["spydr", "people", person.id], person);
      if (personId) {
        queryClient.invalidateQueries({ queryKey: ["spydr", "projects", personId] });
      }
    },
  });
}
