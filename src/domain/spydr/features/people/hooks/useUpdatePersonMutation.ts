import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { PersonNode } from "@/domain/spydr/utils/types";

export function useUpdatePersonMutation(personId?: string) {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof spydrApi.people.update>[1];
    }) => spydrApi.people.update(id, input),
    onSuccess: (person) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<PersonNode[]>(spydrOrgKey(activeOrgId, "people"), (current) =>
        current?.map((item) => (item.id === person.id ? person : item))
      );
      queryClient.setQueryData(spydrOrgKey(activeOrgId, "people", person.id), person);
      if (personId) {
        queryClient.invalidateQueries({
          queryKey: spydrOrgKey(activeOrgId, "projects", personId),
        });
      }
    },
  });
}
