import { ErrorState, LoadingState } from "@/domain/spydr/features/shared/components/ListState";
import { TaskDetailView } from "../components/TaskDetailView";
import { useTaskDetailPage } from "../hooks/useTaskDetailPage";

export function TaskDetailPage() {
  const detail = useTaskDetailPage();

  if (detail.isLoading) {
    return <LoadingState title="Loading task" />;
  }

  if (detail.isError || !detail.task) {
    return (
      <ErrorState
        title="Task unavailable"
        description={detail.errorMessage ?? "Task not found"}
      />
    );
  }

  return (
    <TaskDetailView
      task={detail.task}
      projects={detail.projects}
      people={detail.people}
      form={detail.form}
      saveState={detail.saveState}
      noteDraft={detail.noteDraft}
      isLoggingNote={detail.isLoggingNote}
      onFieldChange={detail.updateField}
      onNoteDraftChange={detail.setNoteDraft}
      onLogNote={detail.logNote}
    />
  );
}
