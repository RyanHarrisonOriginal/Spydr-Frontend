import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { CollectionToolbar } from "@/domain/spydr/features/shared/components/CollectionToolbar";
import { CollectionNoResults } from "@/domain/spydr/features/shared/components/CollectionNoResults";
import { IdeaList } from "../components/IdeaList";
import { useIdeasPage } from "../hooks/useIdeasPage";

export function IdeasPage() {
  const { view, reorder, getPriorityRank, deleteIdea, deletingIdeaId, deleteError, totalCount, isLoading, isFetching, isError, errorMessage, refetch } =
    useIdeasPage();
  const showInitialLoading = isLoading && totalCount === 0;
  const showEmpty = !showInitialLoading && !isError && totalCount === 0;
  usePageBreadcrumb("Ideas");

  return (
    <div>
      <PageHeader
        title="Ideas"
        meta={
          <span>
            {totalCount} captured
            {isFetching && totalCount > 0 ? " · refreshing…" : ""}
            {" · add ideas from a project&apos;s Thinking panel"}
          </span>
        }
      />
      {showInitialLoading && <LoadingState title="Loading ideas" />}
      {isError && (
        <ErrorState title="Ideas unavailable" description={errorMessage}>
          <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </ErrorState>
      )}
      {showEmpty && (
        <EmptyState
          title="No ideas yet"
          description="Capture ideas on a project page. They'll show up here across your workspace."
        />
      )}
      {totalCount > 0 && (
        <>
          <CollectionToolbar view={view} />
          {deleteError ? (
            <p className="px-6 pb-2 text-sm text-destructive">{deleteError}</p>
          ) : null}
          {view.items.length > 0 ? (
            <IdeaList
              ideas={view.items}
              getPriorityRank={getPriorityRank}
              reorderEnabled={reorder.canReorder}
              onReorder={reorder.onReorder}
              onDelete={deleteIdea}
              deletingIdeaId={deletingIdeaId}
            />
          ) : (
            <CollectionNoResults noun={view.noun} onClearFilters={view.clearFilters} />
          )}
        </>
      )}
    </div>
  );
}
