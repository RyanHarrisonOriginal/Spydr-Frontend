import { ErrorState, LoadingState } from "@/domain/spydr/features/shared/components/ListState";
import { personDisplayName } from "@/domain/spydr/utils/projectPersonas";
import { PersonDetailView } from "../components/PersonDetailView";
import { usePersonDetailPage } from "../hooks/usePersonDetailPage";

export function PersonDetailPage() {
  const detail = usePersonDetailPage();

  if (detail.isLoading) {
    return <LoadingState title="Loading person" />;
  }

  if (detail.isError || !detail.person) {
    return (
      <ErrorState
        title="Person unavailable"
        description={detail.errorMessage ?? "Person not found"}
      />
    );
  }

  return (
    <PersonDetailView
      form={detail.form}
      saveState={detail.saveState}
      personId={detail.person.id}
      displayName={personDisplayName(detail.person)}
      updatedAt={detail.person.updatedAt}
      projectEntries={detail.projectEntries}
      assignedTasks={detail.assignedTasks}
      deleteError={detail.deleteError}
      isDeleting={detail.isDeleting}
      onFieldChange={detail.updateField}
      onDelete={detail.deleteCurrentPerson}
    />
  );
}
