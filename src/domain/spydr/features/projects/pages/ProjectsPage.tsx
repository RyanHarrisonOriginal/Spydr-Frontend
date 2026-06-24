import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { ProjectAreasPanel } from "../components/ProjectAreasPanel";
import { ProjectColumnSelector } from "../components/ProjectColumnSelector";
import { CreateProjectDialog } from "../components/CreateProjectDialog";
import { ProjectList } from "../components/ProjectList";
import { useCreateProjectForm } from "../hooks/useCreateProjectForm";
import { useProjectListColumns } from "../hooks/useProjectListColumns";
import { useProjectsPage } from "../hooks/useProjectsPage";

export function ProjectsPage() {
  const {
    projects,
    areas,
    totalCount,
    activeCount,
    updatingProjectId,
    updateStatus,
    updateArea,
    statusError,
    areaError,
    isLoading,
    isAreasLoading,
    isError,
    errorMessage,
  } = useProjectsPage();
  const createProject = useCreateProjectForm();
  const projectColumns = useProjectListColumns();

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        meta={
          <span>
            {totalCount} total · {activeCount} active
          </span>
        }
        actions={
          <>
            <ProjectColumnSelector
              columns={projectColumns.columns}
              visibleColumnSet={projectColumns.visibleColumnSet}
              onToggleColumn={projectColumns.toggleColumn}
            />
            <CreateProjectDialog
              areas={areas}
              open={createProject.isOpen}
              values={createProject.values}
              canSubmit={createProject.canSubmit}
              isSubmitting={createProject.isSubmitting}
              errorMessage={createProject.errorMessage}
              onOpenChange={createProject.setIsOpen}
              onFieldChange={createProject.updateField}
              onSubmit={createProject.submit}
            />
          </>
        }
      />
      <ProjectAreasPanel areas={areas} isLoading={isAreasLoading} />
      {isLoading && <LoadingState title="Loading projects" />}
      {isError && <ErrorState title="Projects unavailable" description={errorMessage} />}
      {!isLoading && !isError && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Projects will appear here once the backend has project nodes for this account."
        />
      )}
      {!isLoading && !isError && projects.length > 0 && (
        <>
          {statusError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {statusError}
            </p>
          )}
          {areaError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {areaError}
            </p>
          )}
          <ProjectList
            projects={projects}
            areas={areas}
            visibleColumns={projectColumns.visibleColumns}
            updatingProjectId={updatingProjectId}
            onStatusChange={updateStatus}
            onAreaChange={updateArea}
          />
        </>
      )}
    </div>
  );
}
