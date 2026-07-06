import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { PersonNode } from "@/domain/spydr/utils/types";

export function useCreatePersonMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: spydrApi.people.create,
    onSuccess: (person) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<PersonNode[]>(spydrOrgKey(activeOrgId, "people"), (current) => {
        const next = current ? [...current, person] : [person];
        return next.sort((a, b) =>
          (a.details?.fullName ?? a.title).localeCompare(b.details?.fullName ?? b.title)
        );
      });
      queryClient.setQueryData(spydrOrgKey(activeOrgId, "people", person.id), person);
    },
  });
}
