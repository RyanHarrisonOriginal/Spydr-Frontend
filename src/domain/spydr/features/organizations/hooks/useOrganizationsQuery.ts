import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { spydrOrganizationsKey } from "@/domain/spydr/features/shared/hooks/spydrQueryKeys";
import { spydrApi } from "@/domain/spydr/utils/api";

export function useOrganizationsQuery() {
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: spydrOrganizationsKey(),
    queryFn: spydrApi.organizations.list,
    enabled: isLoaded && isSignedIn,
    refetchOnMount: "always",
  });
}
