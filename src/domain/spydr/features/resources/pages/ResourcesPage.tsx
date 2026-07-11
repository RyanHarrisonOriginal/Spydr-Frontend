import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { CollectionToolbar } from "@/domain/spydr/features/shared/components/CollectionToolbar";
import { CollectionNoResults } from "@/domain/spydr/features/shared/components/CollectionNoResults";
import { ResourceList } from "../components/ResourceList";
import { useResourcesPage } from "../hooks/useResourcesPage";

export function ResourcesPage() {
  const { view, reorder, getPriorityRank, groupedResourceTypes, totalCount, isLoading, isError, errorMessage } =
    useResourcesPage();
  const typeCount = Object.keys(groupedResourceTypes).length;
  usePageBreadcrumb("Resources");

  return (
    <div>
      <PageHeader
        title="Resources"
        meta={
          <span>
            {totalCount} saved · {typeCount} {typeCount === 1 ? "type" : "types"}
          </span>
        }
      />
      {isLoading && <LoadingState title="Loading resources" />}
      {isError && (
        <ErrorState title="Resources unavailable" description={errorMessage} />
      )}
      {!isLoading && !isError && totalCount === 0 && (
        <EmptyState
          title="No resources yet"
          description="Resource nodes will appear here once they are available from the API."
        />
      )}
      {!isLoading && !isError && totalCount > 0 && (
        <>
          <CollectionToolbar view={view} />
          {view.items.length > 0 ? (
            <ResourceList
              resources={view.items}
              getPriorityRank={getPriorityRank}
              reorderEnabled={reorder.canReorder}
              onReorder={reorder.onReorder}
            />
          ) : (
            <CollectionNoResults noun={view.noun} onClearFilters={view.clearFilters} />
          )}
        </>
      )}
    </div>
  );
}
