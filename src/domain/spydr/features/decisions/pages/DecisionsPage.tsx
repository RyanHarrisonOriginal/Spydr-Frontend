import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { CollectionToolbar } from "@/domain/spydr/features/shared/components/CollectionToolbar";
import { CollectionNoResults } from "@/domain/spydr/features/shared/components/CollectionNoResults";
import { formatDecisionHeaderMeta } from "@/domain/spydr/utils/decisionInsights";
import { DecisionInsightsStrip } from "../components/DecisionInsightsStrip";
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
    insights,
    totalCount,
    isLoading,
    isError,
    errorMessage,
  } = useDecisionsPage();
  usePageBreadcrumb("Decisions");

  return (
    <div>
      <PageHeader
        title="Decisions"
        meta={
          totalCount > 0 ? (
            <span>
              {formatDecisionHeaderMeta(insights)}
              {" · workspace-wide audit trail of what was chosen and why"}
            </span>
          ) : (
            <span>
              Record decisions on project pages — they surface here as a durable workspace log
            </span>
          )
        }
      />
      {isLoading && <LoadingState title="Loading decisions" />}
      {isError && (
        <ErrorState title="Decisions unavailable" description={errorMessage} />
      )}
      {!isLoading && !isError && totalCount === 0 && (
        <EmptyState
          title="No decisions yet"
          description="Open a project and use the Decision log to record what was chosen and why. Each entry appears here so you can trace commitments across projects."
        />
      )}
      {!isLoading && !isError && totalCount > 0 && (
        <>
          <DecisionInsightsStrip insights={insights} />
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
