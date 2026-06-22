import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { IdeaList } from "../components/IdeaList";
import { useIdeasPage } from "../hooks/useIdeasPage";

export function IdeasPage() {
  const { ideas, totalCount, isLoading, isError, errorMessage } = useIdeasPage();

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Ideas"
        meta={
          <span>
            {totalCount} captured · add ideas from a project&apos;s Thinking panel
          </span>
        }
      />
      {isLoading && <LoadingState title="Loading ideas" />}
      {isError && <ErrorState title="Ideas unavailable" description={errorMessage} />}
      {!isLoading && !isError && ideas.length === 0 && (
        <EmptyState
          title="No ideas yet"
          description="Capture ideas on a project page. They'll show up here across your workspace."
        />
      )}
      {!isLoading && !isError && ideas.length > 0 && <IdeaList ideas={ideas} />}
    </div>
  );
}
