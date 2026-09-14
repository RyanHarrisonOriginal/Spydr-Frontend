import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { spydrMyInvitesKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";

export function useMyInvitesQuery() {
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: spydrMyInvitesKey(),
    queryFn: spydrApi.invites.listMine,
    enabled: isLoaded && isSignedIn,
  });
}
