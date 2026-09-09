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
import { NoteList } from "../components/NoteList";
import { useNotesPage } from "../hooks/useNotesPage";

export function NotesPage() {
  const {
    view,
    reorder,
    getPriorityRank,
    deleteNote,
    deletingNoteId,
    deleteError,
    totalCount,
    isLoading,
    isFetching,
    isError,
    errorMessage,
    refetch,
  } = useNotesPage();
  const showInitialLoading = isLoading && totalCount === 0;
  const showEmpty = !showInitialLoading && !isError && totalCount === 0;
  usePageBreadcrumb("Notes");

  return (
    <div>
      <PageHeader
        title="Notes"
        meta={
          <span>
            {totalCount} captured
            {isFetching && totalCount > 0 ? " · refreshing…" : ""}
            {" · add notes from a project’s Thinking panel"}
          </span>
        }
      />
      {showInitialLoading && <LoadingState title="Loading notes" />}
      {isError && (
        <ErrorState title="Notes unavailable" description={errorMessage}>
          <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </ErrorState>
      )}
      {showEmpty && (
        <EmptyState
          title="No notes yet"
          description="Capture notes on a project page. They'll show up here across your workspace."
        />
      )}
      {totalCount > 0 && (
        <>
          <CollectionToolbar view={view} />
          {deleteError ? (
            <p className="px-4 pb-2 text-sm text-destructive md:px-6">{deleteError}</p>
          ) : null}
          {view.items.length > 0 ? (
            <NoteList
              notes={view.items}
              getPriorityRank={getPriorityRank}
              reorderEnabled={reorder.canReorder}
              onReorder={reorder.onReorder}
              onDelete={deleteNote}
              deletingNoteId={deletingNoteId}
            />
          ) : (
            <CollectionNoResults noun={view.noun} onClearFilters={view.clearFilters} />
          )}
        </>
      )}
    </div>
  );
}
