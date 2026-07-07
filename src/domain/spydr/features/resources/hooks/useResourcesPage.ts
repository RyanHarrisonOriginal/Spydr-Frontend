import { useMemo } from "react";
import { useResourcesQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useCollectionView } from "@/domain/spydr/features/shared/hooks/useCollectionView";
import { useCollectionReorder } from "@/domain/spydr/features/shared/hooks/useCollectionReorder";
import { resourcesCollection } from "@/domain/spydr/utils/collections/resourcesCollection";

export function useResourcesPage() {
  const query = useResourcesQuery();
  const resources = query.data ?? [];
  const view = useCollectionView(resourcesCollection, resources);
  const reorder = useCollectionReorder("resource", view);

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
    view,
    reorder,
    getPriorityRank: view.getPriorityRank,
    groupedResourceTypes,
    totalCount: resources.length,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage:
      query.error instanceof Error ? query.error.message : "Failed to load resources",
  };
}
