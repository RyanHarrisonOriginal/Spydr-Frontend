import { usePersistentState } from "@/domain/spydr/features/shared/hooks/usePersistentState";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import type { LogSortMode } from "../types";

export function useLogSortMode(storageKey: string) {
  const { activeOrgId } = useOrganizationContext();
  return usePersistentState<LogSortMode>(
    activeOrgId
      ? `log-sort:${activeOrgId}:${storageKey}`
      : `log-sort:pending:${storageKey}`,
    () => "recent",
    (raw, fallback) => (raw === "recent" || raw === "ranked" ? raw : fallback)
  );
}
