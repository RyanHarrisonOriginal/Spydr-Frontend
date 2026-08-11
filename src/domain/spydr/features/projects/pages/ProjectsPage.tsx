import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
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
import {
  ProjectTrashPanel,
  ProjectsTrashButton,
} from "../components/ProjectTrashPanel";
import { useCreateProjectForm } from "../hooks/useCreateProjectForm";
import { useProjectListColumns } from "../hooks/useProjectListColumns";
import { useProjectsPage } from "../hooks/useProjectsPage";

export function ProjectsPage() {
  const {
    projects,
    allProjects,
    tasksByProjectId,
    areas,
    people,
    totalCount,
    filteredCount,
    activeCount,
    updatingProjectId,
    updatingTaskId,
    creatingTaskProjectId,
    updateStatus,
    updateTitle,
    updateArea,
    updatePriority,
    updateTargetDate,
    updateAssignee,
    updateTaskStatus,
    updateTaskDueDate,
    createProjectTask,
    deleteProject,
    restoreProject,
    deletingProjectId,
    restoringProjectId,
    deletedProjects,
    deletedCount,
    trashExpanded,
    setTrashExpanded,
    openTrash,
    listView,
    reorder,
    getPriorityRank,
    statusError,
    titleError,
    areaError,
    priorityError,
    targetError,
    assigneeError,
    taskError,
    deleteError,
    restoreError,
    isLoading,
    isTrashLoading,
    isAreasLoading,
    isError,
    errorMessage,
  } = useProjectsPage();
  const createProject = useCreateProjectForm();
  const projectColumns = useProjectListColumns();
  usePageBreadcrumb("Projects");

  return (
    <div>
      <PageHeader
        title="Projects"
        meta={
          <span>
            {totalCount} total · {activeCount} active
          </span>
        }
        actions={
          <>
            <ProjectsTrashButton count={deletedCount} onClick={openTrash} />
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
      {(isTrashLoading || deletedCount > 0) && (
        <ProjectTrashPanel
          projects={deletedProjects}
          isLoading={isTrashLoading}
          expanded={trashExpanded}
          onExpandedChange={setTrashExpanded}
          onRestore={restoreProject}
          isRestoring={restoringProjectId !== null}
          restoringId={restoringProjectId}
          error={restoreError}
        />
      )}
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
            people={people}
            filteredCount={filteredCount}
            totalCount={totalCount}
            activeFilterCount={listView.activeFilterCount}
            onSearchChange={listView.setSearch}
            onToggleFacet={listView.toggleFacetFilter}
            onRemoveFacetValue={listView.removeFacetFilter}
            onClearFilters={listView.clearFilters}
          />
          {statusError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {statusError}
            </p>
          )}
          {titleError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {titleError}
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
          {deleteError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {deleteError}
            </p>
          )}
          {assigneeError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {assigneeError}
            </p>
          )}
          {taskError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {taskError}
            </p>
          )}
          <ProjectList
            projects={projects}
            areas={areas}
            people={people}
            tasksByProjectId={tasksByProjectId}
            visibleColumns={projectColumns.visibleColumns}
            sort={listView.sort}
            reorderEnabled={reorder.canReorder}
            getPriorityRank={getPriorityRank}
            onReorder={reorder.onReorder}
            hasActiveFilters={listView.hasActiveFilters}
            updatingProjectId={updatingProjectId}
            updatingTaskId={updatingTaskId}
            creatingTaskProjectId={creatingTaskProjectId}
            onSortColumn={listView.toggleSortColumn}
            onClearFilters={listView.clearFilters}
            onTitleChange={updateTitle}
            onStatusChange={updateStatus}
            onAreaChange={updateArea}
            onPriorityChange={updatePriority}
            onTargetDateChange={updateTargetDate}
            onAssigneeChange={updateAssignee}
            onTaskStatusChange={updateTaskStatus}
            onTaskDueDateChange={updateTaskDueDate}
            onCreateTask={createProjectTask}
            onDelete={deleteProject}
            deletingProjectId={deletingProjectId}
          />
        </>
      )}
    </div>
  );
}
