import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { PersonNode } from "@/domain/spydr/utils/types";

export function useDeletePersonMutation() {
  const queryClient = useQueryClient();
  const { activeOrgId } = useOrganizationContext();

  return useMutation({
    mutationFn: (personId: string) => spydrApi.people.delete(personId),
    onSuccess: (_data, personId) => {
      if (!activeOrgId) return;
      queryClient.setQueryData<PersonNode[]>(spydrOrgKey(activeOrgId, "people"), (current) =>
        current?.filter((person) => person.id !== personId)
      );
      queryClient.removeQueries({
        queryKey: spydrOrgKey(activeOrgId, "people", personId),
      });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "projects") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "tasks") });
      queryClient.invalidateQueries({ queryKey: spydrOrgKey(activeOrgId, "dashboard") });
    },
  });
}
