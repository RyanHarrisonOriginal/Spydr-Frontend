import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { DecisionTimeline } from "../components/DecisionTimeline";
import { useDecisionsPage } from "../hooks/useDecisionsPage";

export function DecisionsPage() {
  const { decisions, totalCount, isLoading, isError, errorMessage } =
    useDecisionsPage();

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
      {!isLoading && !isError && decisions.length === 0 && (
        <EmptyState
          title="No decisions yet"
          description="Decision nodes will appear here once they are available from the API."
        />
      )}
      {!isLoading && !isError && decisions.length > 0 && (
        <DecisionTimeline decisions={decisions} />
      )}
    </div>
  );
}
