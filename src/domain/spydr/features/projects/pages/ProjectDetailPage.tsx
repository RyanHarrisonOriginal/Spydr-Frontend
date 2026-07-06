import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { ProjectDetailView } from "../components/ProjectDetailView";
import { useProjectDetailPage } from "../hooks/useProjectDetailPage";

export function ProjectDetailPage() {
  const detailPage = useProjectDetailPage();
  const { project, isLoading, isError, isNotFound, errorMessage, stats } =
    detailPage;

  if (isLoading) {
    return <LoadingState title="Loading project" />;
  }

  if (isNotFound) {
    return (
      <EmptyState
        title="Project not found"
        description="This project does not exist or is not available to your account."
      >
        <Button asChild variant="outline" size="sm">
          <Link to="/projects">Back to projects</Link>
        </Button>
      </EmptyState>
    );
  }

  if (isError || !project) {
    return <ErrorState title="Project unavailable" description={errorMessage} />;
  }

  return (
    <ProjectDetailView
      project={project}
      people={detailPage.people}
      deleted={detailPage.deleted}
      stats={stats}
      detailForm={detailPage.detailForm}
      detailSaveState={detailPage.detailSaveState}
      taskForm={detailPage.taskForm}
      noteForm={detailPage.noteForm}
      noteFormResetKey={detailPage.noteFormResetKey}
      decisionForm={detailPage.decisionForm}
      ideaForm={detailPage.ideaForm}
      canAddTask={detailPage.canAddTask}
      canAddNote={detailPage.canAddNote}
      canAddDecision={detailPage.canAddDecision}
      canAddIdea={detailPage.canAddIdea}
      isAddingTask={detailPage.isAddingTask}
      isAddingNote={detailPage.isAddingNote}
      isAddingDecision={detailPage.isAddingDecision}
      isAddingIdea={detailPage.isAddingIdea}
      detailError={detailPage.detailError}
      personaError={detailPage.personaError}
      taskError={detailPage.taskError}
      noteError={detailPage.noteError}
      decisionError={detailPage.decisionError}
      ideaError={detailPage.ideaError}
      onDetailFieldChange={detailPage.updateDetailField}
      onTaskFieldChange={detailPage.updateTaskField}
      onNoteFieldChange={detailPage.updateNoteField}
      onDecisionFieldChange={detailPage.updateDecisionField}
      onIdeaFieldChange={detailPage.updateIdeaField}
      onAddTask={detailPage.addTask}
      onAddNote={detailPage.addNote}
      onAddDecision={detailPage.addDecision}
      onAddIdea={detailPage.addIdea}
      onUpdateChild={detailPage.updateChild}
      onPersonaChange={detailPage.updatePersona}
      isUpdatingPersona={detailPage.isUpdatingPersona}
      onDeleteChild={detailPage.deleteChild}
      onRestoreChild={detailPage.restoreChild}
      isUpdatingChild={detailPage.isUpdatingChild}
      isDeletingChild={detailPage.isDeletingChild}
      isRestoringChild={detailPage.isRestoringChild}
      restoringId={detailPage.restoringId}
      childMutationError={detailPage.childMutationError}
    />
  );
}
