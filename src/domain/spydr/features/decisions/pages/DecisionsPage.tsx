import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { CollectionToolbar } from "@/domain/spydr/features/shared/components/CollectionToolbar";
import { CollectionNoResults } from "@/domain/spydr/features/shared/components/CollectionNoResults";
import { DecisionTimeline } from "../components/DecisionTimeline";
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
    isError,
    errorMessage,
  } = useDecisionsPage();

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Decisions"
        meta={
          <span>
            {totalCount} recorded · chronological decision log across your workspace
          </span>
        }
      />
      {isLoading && <LoadingState title="Loading decisions" />}
      {isError && (
        <ErrorState title="Decisions unavailable" description={errorMessage} />
      )}
      {!isLoading && !isError && totalCount === 0 && (
        <EmptyState
          title="No decisions yet"
          description="Record decisions on a project page — they appear here as a workspace-wide log."
        />
      )}
      {!isLoading && !isError && totalCount > 0 && (
        <>
          <CollectionToolbar view={view} />
          {deleteError ? (
            <p className="px-6 pb-2 text-sm text-destructive">{deleteError}</p>
          ) : null}
          {view.items.length > 0 ? (
            <DecisionTimeline
              decisions={view.items}
              sort={view.state.sort}
              getPriorityRank={getPriorityRank}
              reorderEnabled={reorder.canReorder}
              onSortColumn={view.toggleSort}
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
