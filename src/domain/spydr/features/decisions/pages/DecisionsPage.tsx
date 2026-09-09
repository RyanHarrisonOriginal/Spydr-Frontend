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
import { DecisionList } from "../components/DecisionList";
import { useDecisionsPage } from "../hooks/useDecisionsPage";

export function DecisionsPage() {
  const {
    view,
    reorder,
    getPriorityRank,
    deleteDecision,
    deletingDecisionId,
    deleteError,
    totalCount,
    isLoading,
    isFetching,
    isError,
    errorMessage,
    refetch,
  } = useDecisionsPage();
  const showInitialLoading = isLoading && totalCount === 0;
  const showEmpty = !showInitialLoading && !isError && totalCount === 0;
  usePageBreadcrumb("Decisions");

  return (
    <div>
      <PageHeader
        title="Decisions"
        meta={
          <span>
            {totalCount} captured
            {isFetching && totalCount > 0 ? " · refreshing…" : ""}
            {" · add decisions from a project’s Thinking panel"}
          </span>
        }
      />
      {showInitialLoading && <LoadingState title="Loading decisions" />}
      {isError && (
        <ErrorState title="Decisions unavailable" description={errorMessage}>
          <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </ErrorState>
      )}
      {showEmpty && (
        <EmptyState
          title="No decisions yet"
          description="Record decisions on a project page. They'll show up here across your workspace."
        />
      )}
      {totalCount > 0 && (
        <>
          <CollectionToolbar view={view} />
          {deleteError ? (
            <p className="px-4 pb-2 text-sm text-destructive md:px-6">{deleteError}</p>
          ) : null}
          {view.items.length > 0 ? (
            <DecisionList
              decisions={view.items}
              getPriorityRank={getPriorityRank}
              reorderEnabled={reorder.canReorder}
              onReorder={reorder.onReorder}
              onDelete={deleteDecision}
              deletingDecisionId={deletingDecisionId}
            />
          ) : (
            <CollectionNoResults noun={view.noun} onClearFilters={view.clearFilters} />
          )}
        </>
      )}
    </div>
  );
}
