import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { IdeaList } from "../components/IdeaList";
import { useIdeasPage } from "../hooks/useIdeasPage";

export function IdeasPage() {
  const { ideas, totalCount, isLoading, isFetching, isError, errorMessage, refetch } =
    useIdeasPage();
  const showInitialLoading = isLoading && ideas.length === 0;
  const showEmpty = !showInitialLoading && !isError && ideas.length === 0;

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Ideas"
        meta={
          <span>
            {totalCount} captured
            {isFetching && ideas.length > 0 ? " · refreshing…" : ""}
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
      {ideas.length > 0 && <IdeaList ideas={ideas} />}
    </div>
  );
}
