import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { NoteList } from "../components/NoteList";
import { useNotesPage } from "../hooks/useNotesPage";

export function NotesPage() {
  const { notes, totalCount, isLoading, isError, errorMessage } = useNotesPage();

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Notes"
        meta={<span>{totalCount} documents</span>}
      />
      {isLoading && <LoadingState title="Loading notes" />}
      {isError && <ErrorState title="Notes unavailable" description={errorMessage} />}
      {!isLoading && !isError && notes.length === 0 && (
        <EmptyState
          title="No notes yet"
          description="Note nodes will appear here once they are available from the API."
        />
      )}
      {!isLoading && !isError && notes.length > 0 && <NoteList notes={notes} />}
    </div>
  );
}
