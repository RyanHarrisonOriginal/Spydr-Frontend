import { useMemo } from "react";
import { useResourcesQuery } from "@/domain/spydr/features/shared/hooks/queries";

export function useResourcesPage() {
  const query = useResourcesQuery();
  const resources = query.data ?? [];

  const groupedResourceTypes = useMemo(
    () =>
      resources.reduce<Record<string, number>>((acc, resource) => {
        const type = resource.details?.resourceType ?? "uncategorized";
        acc[type] = (acc[type] ?? 0) + 1;
        return acc;
      }, {}),
    [resources]
  );

  return {
    resources,
    groupedResourceTypes,
    totalCount: resources.length,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load resources",
  };
}
