import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { CollectionToolbar } from "@/domain/spydr/features/shared/components/CollectionToolbar";
import { CollectionNoResults } from "@/domain/spydr/features/shared/components/CollectionNoResults";
import { NoteList } from "../components/NoteList";
import { useNotesPage } from "../hooks/useNotesPage";

export function NotesPage() {
  const { view, totalCount, isLoading, isError, errorMessage } = useNotesPage();

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Notes"
        meta={<span>{totalCount} documents</span>}
      />
      {isLoading && <LoadingState title="Loading notes" />}
      {isError && <ErrorState title="Notes unavailable" description={errorMessage} />}
      {!isLoading && !isError && totalCount === 0 && (
        <EmptyState
          title="No notes yet"
          description="Note nodes will appear here once they are available from the API."
        />
      )}
      {!isLoading && !isError && totalCount > 0 && (
        <>
          <CollectionToolbar view={view} />
          {view.items.length > 0 ? (
            <NoteList notes={view.items} />
          ) : (
            <CollectionNoResults noun={view.noun} onClearFilters={view.clearFilters} />
          )}
        </>
      )}
    </div>
  );
}
