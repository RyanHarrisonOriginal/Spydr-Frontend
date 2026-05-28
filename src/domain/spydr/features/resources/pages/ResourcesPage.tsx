import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { ResourceList } from "../components/ResourceList";
import { useResourcesPage } from "../hooks/useResourcesPage";

export function ResourcesPage() {
  const { resources, groupedResourceTypes, totalCount, isLoading, isError, errorMessage } =
    useResourcesPage();
  const typeCount = Object.keys(groupedResourceTypes).length;

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
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
      {!isLoading && !isError && resources.length === 0 && (
        <EmptyState
          title="No resources yet"
          description="Resource nodes will appear here once they are available from the API."
        />
      )}
      {!isLoading && !isError && resources.length > 0 && (
        <ResourceList resources={resources} />
      )}
    </div>
  );
}
