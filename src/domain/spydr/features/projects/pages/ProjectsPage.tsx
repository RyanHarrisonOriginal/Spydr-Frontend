import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { ProjectColumnSelector } from "../components/ProjectColumnSelector";
import { CreateProjectDialog } from "../components/CreateProjectDialog";
import { ProjectList } from "../components/ProjectList";
import { useCreateProjectForm } from "../hooks/useCreateProjectForm";
import { useProjectListColumns } from "../hooks/useProjectListColumns";
import { useProjectsPage } from "../hooks/useProjectsPage";

export function ProjectsPage() {
  const { projects, totalCount, activeCount, isLoading, isError, errorMessage } =
    useProjectsPage();
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
      {isLoading && <LoadingState title="Loading projects" />}
      {isError && <ErrorState title="Projects unavailable" description={errorMessage} />}
      {!isLoading && !isError && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Projects will appear here once the backend has project nodes for this account."
        />
      )}
      {!isLoading && !isError && projects.length > 0 && (
        <ProjectList
          projects={projects}
          visibleColumns={projectColumns.visibleColumns}
        />
      )}
    </div>
  );
}
