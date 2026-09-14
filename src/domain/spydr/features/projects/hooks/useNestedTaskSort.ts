import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { usePersistentState } from "@/domain/spydr/features/shared/hooks/usePersistentState";
import {
  defaultNestedTaskSort,
  nestedTaskSortDefs,
  sanitizeNestedTaskSort,
} from "@/domain/spydr/utils/nestedTaskSort";
import type { CollectionSortState } from "@/domain/spydr/utils/collectionView";

export function useNestedTaskSort() {
  const { activeOrgId } = useOrganizationContext();
  const [sort, setSort] = usePersistentState<CollectionSortState>(
    activeOrgId
      ? `collection-view:${activeOrgId}:work-nested-tasks`
      : "collection-view:pending:work-nested-tasks",
    () => defaultNestedTaskSort,
    sanitizeNestedTaskSort
  );

  const toggleSort = (columnId: string) => {
    setSort((current) => {
      if (current.columnId === columnId) {
        return {
          columnId,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      const def = nestedTaskSortDefs.find((entry) => entry.id === columnId);
      return {
        columnId,
        direction: def?.defaultDirection ?? "asc",
      };
    });
  };

  return { sort, toggleSort, sorts: nestedTaskSortDefs };
}
