import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spydrOrganizationsKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";
import type { CreateOrganizationInput } from "@/domain/spydr/utils/types";

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => spydrApi.organizations.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spydrOrganizationsKey() });
    },
  });
}
