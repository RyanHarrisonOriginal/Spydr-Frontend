import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  spydrMyInvitesKey,
  spydrOrganizationsKey,
} from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";

export function useAcceptInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => spydrApi.invites.accept(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spydrOrganizationsKey() });
      queryClient.invalidateQueries({ queryKey: spydrMyInvitesKey() });
    },
  });
}
