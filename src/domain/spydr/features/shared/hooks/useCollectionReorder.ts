import {
  COLLECTION_ORDER_SORT_ID,
  canManuallyReorderCollection,
} from "@/domain/spydr/utils/collections/shared";
import type { SortDirection } from "@/domain/spydr/utils/collectionView";
import type { CollectionView } from "./useCollectionView";
import {
  useReorderCollectionMutation,
  type ReorderableNodeType,
} from "./useReorderCollectionMutation";

export function useCollectionReorder<T>(
  nodeType: ReorderableNodeType,
  view: Pick<CollectionView<T>, "hasActiveFilters" | "setSort" | "state">
) {
  const reorder = useReorderCollectionMutation();
  const canReorder = canManuallyReorderCollection(view.hasActiveFilters);

  return {
    canReorder,
    isReordering: reorder.isPending,
    onReorder: (orderedIds: string[]) => {
      if (!canReorder) return;
      reorder.mutate({ nodeType, orderedIds });
      if (view.state.sort.columnId !== COLLECTION_ORDER_SORT_ID) {
        view.setSort(COLLECTION_ORDER_SORT_ID, "asc" satisfies SortDirection);
      }
    },
  };
}
