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
      stats={stats}
      detailForm={detailPage.detailForm}
      taskForm={detailPage.taskForm}
      canSaveDetails={detailPage.canSaveDetails}
      canAddTask={detailPage.canAddTask}
      isSavingDetails={detailPage.isSavingDetails}
      isAddingTask={detailPage.isAddingTask}
      detailError={detailPage.detailError}
      taskError={detailPage.taskError}
      onDetailFieldChange={detailPage.updateDetailField}
      onTaskFieldChange={detailPage.updateTaskField}
      onSaveDetails={detailPage.saveDetails}
      onAddTask={detailPage.addTask}
    />
  );
}
