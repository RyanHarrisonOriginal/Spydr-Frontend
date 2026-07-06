import { useCallback } from "react";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { spydrOrgKey, spydrOrgPrefix } from "./spydrQueryKeys";

export function useSpydrQueryKeys() {
  const { activeOrgId } = useOrganizationContext();

  const orgKey = useCallback(
    (...segments: string[]) => {
      if (!activeOrgId) {
        throw new Error("Active organization is required");
      }
      return spydrOrgKey(activeOrgId, ...segments);
    },
    [activeOrgId]
  );

  const orgPrefix = useCallback(() => {
    if (!activeOrgId) {
      throw new Error("Active organization is required");
    }
    return spydrOrgPrefix(activeOrgId);
  }, [activeOrgId]);

  return { activeOrgId, orgKey, orgPrefix };
}
