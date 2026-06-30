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
  const { view, totalCount, isLoading, isError, errorMessage } = useDecisionsPage();

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Decisions"
        meta={<span>{totalCount} recorded</span>}
      />
      {isLoading && <LoadingState title="Loading decisions" />}
      {isError && (
        <ErrorState title="Decisions unavailable" description={errorMessage} />
      )}
      {!isLoading && !isError && totalCount === 0 && (
        <EmptyState
          title="No decisions yet"
          description="Decision nodes will appear here once they are available from the API."
        />
      )}
      {!isLoading && !isError && totalCount > 0 && (
        <>
          <CollectionToolbar view={view} />
          {view.items.length > 0 ? (
            <DecisionTimeline decisions={view.items} />
          ) : (
            <CollectionNoResults noun={view.noun} onClearFilters={view.clearFilters} />
          )}
        </>
      )}
    </div>
  );
}
