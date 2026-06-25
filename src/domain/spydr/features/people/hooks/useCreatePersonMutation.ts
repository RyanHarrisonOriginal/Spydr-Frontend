import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { PersonNode } from "@/domain/spydr/utils/types";

export function useCreatePersonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: spydrApi.people.create,
    onSuccess: (person) => {
      queryClient.setQueryData<PersonNode[]>(["spydr", "people"], (current) => {
        const next = current ? [...current, person] : [person];
        return next.sort((a, b) =>
          (a.details?.fullName ?? a.title).localeCompare(b.details?.fullName ?? b.title)
        );
      });
      queryClient.setQueryData(["spydr", "people", person.id], person);
    },
  });
}
