import { ErrorState, LoadingState } from "@/domain/spydr/features/shared/components/ListState";
import { NoteDetailView } from "../components/NoteDetailView";
import { useNoteDetailPage } from "../hooks/useNoteDetailPage";

export function NoteDetailPage() {
  const detail = useNoteDetailPage();

  if (detail.isLoading) {
    return <LoadingState title="Loading note" />;
  }

  if (detail.isError || !detail.note) {
    return (
      <ErrorState
        title="Note unavailable"
        description={detail.errorMessage ?? "Note not found"}
      />
    );
  }

  return (
    <NoteDetailView
      note={detail.note}
      form={detail.form}
      saveState={detail.saveState}
      onFieldChange={detail.updateField}
    />
  );
}
