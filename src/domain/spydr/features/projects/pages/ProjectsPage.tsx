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
import { ProjectListToolbar } from "../components/ProjectListToolbar";
import { useCreateProjectForm } from "../hooks/useCreateProjectForm";
import { useProjectListColumns } from "../hooks/useProjectListColumns";
import { useProjectsPage } from "../hooks/useProjectsPage";

export function ProjectsPage() {
  const {
    projects,
    allProjects,
    areas,
    totalCount,
    filteredCount,
    activeCount,
    updatingProjectId,
    updateStatus,
    updateArea,
    updatePriority,
    updateTargetDate,
    listView,
    statusError,
    areaError,
    priorityError,
    targetError,
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
      {!isLoading && !isError && allProjects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Projects will appear here once the backend has project nodes for this account."
        />
      )}
      {!isLoading && !isError && allProjects.length > 0 && (
        <>
          <ProjectListToolbar
            filters={listView.filters}
            areas={areas}
            filteredCount={filteredCount}
            totalCount={totalCount}
            hasActiveFilters={listView.hasActiveFilters}
            activeFilterCount={listView.activeFilterCount}
            onSearchChange={listView.setSearch}
            onToggleStatus={listView.toggleStatusFilter}
            onTogglePriority={listView.togglePriorityFilter}
            onToggleArea={listView.toggleAreaFilter}
            onClearFilters={listView.clearFilters}
          />
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
          {targetError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {targetError}
            </p>
          )}
          {priorityError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {priorityError}
            </p>
          )}
          <ProjectList
            projects={projects}
            areas={areas}
            visibleColumns={projectColumns.visibleColumns}
            sort={listView.sort}
            hasActiveFilters={listView.hasActiveFilters}
            updatingProjectId={updatingProjectId}
            onSortColumn={listView.toggleSortColumn}
            onClearFilters={listView.clearFilters}
            onStatusChange={updateStatus}
            onAreaChange={updateArea}
            onPriorityChange={updatePriority}
            onTargetDateChange={updateTargetDate}
          />
        </>
      )}
    </div>
  );
}
