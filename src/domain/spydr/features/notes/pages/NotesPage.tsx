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
  const { view, reorder, getPriorityRank, deleteNote, deletingNoteId, deleteError, totalCount, isLoading, isError, errorMessage } = useNotesPage();

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
          {deleteError ? (
            <p className="px-6 pb-2 text-sm text-destructive">{deleteError}</p>
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
