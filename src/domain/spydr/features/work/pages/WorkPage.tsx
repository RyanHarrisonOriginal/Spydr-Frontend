import { useEffect, useMemo } from "react";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { CollectionToolbar } from "@/domain/spydr/features/shared/components/CollectionToolbar";
import { CollectionNoResults } from "@/domain/spydr/features/shared/components/CollectionNoResults";
import { ExpandCollapseControls } from "@/domain/spydr/features/shared/components/ExpandCollapseControls";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import { personDisplayName } from "@/domain/spydr/utils/projectPersonas";
import { ProjectAreasPanel } from "@/domain/spydr/features/projects/components/ProjectAreasPanel";
import { ProjectColumnSelector } from "@/domain/spydr/features/projects/components/ProjectColumnSelector";
import { CreateProjectDialog } from "@/domain/spydr/features/projects/components/CreateProjectDialog";
import { ProjectList } from "@/domain/spydr/features/projects/components/ProjectList";
import { ProjectListToolbar } from "@/domain/spydr/features/projects/components/ProjectListToolbar";
import {
  ProjectTrashPanel,
  ProjectsTrashButton,
} from "@/domain/spydr/features/projects/components/ProjectTrashPanel";
import { useCreateProjectForm } from "@/domain/spydr/features/projects/hooks/useCreateProjectForm";
import { useProjectListColumns } from "@/domain/spydr/features/projects/hooks/useProjectListColumns";
import { useProjectsPage } from "@/domain/spydr/features/projects/hooks/useProjectsPage";
import { CreateTaskDialog } from "@/domain/spydr/features/tasks/components/CreateTaskDialog";
import { TaskList } from "@/domain/spydr/features/tasks/components/TaskList";
import { useCreateTaskForm } from "@/domain/spydr/features/tasks/hooks/useCreateTaskForm";
import { useTasksPage } from "@/domain/spydr/features/tasks/hooks/useTasksPage";
import { CreatePersonDialog } from "@/domain/spydr/features/people/components/CreatePersonDialog";
import { usePeoplePage } from "@/domain/spydr/features/people/hooks/usePeoplePage";
import { WorkPersonFilter } from "../components/WorkPersonFilter";
import { WorkViewToggle } from "../components/WorkViewToggle";
import { WorkCreateMenu } from "../components/WorkCreateMenu";
import { useWorkScope } from "../hooks/useWorkScope";

export function WorkPage() {
  const {
    view,
    personId,
    isPersonScopePending,
    expandedIds,
    expandSeeded,
    setExpandedIds,
    setView,
    setPersonId,
  } = useWorkScope();
  const projectsPage = useProjectsPage({ personId });
  const tasksPage = useTasksPage({ personId });
  const peoplePage = usePeoplePage();
  const selectedPerson =
    peoplePage.people.find((person) => person.id === personId) ?? null;
  const createProject = useCreateProjectForm({
    linkPersonAsAssignee: selectedPerson?.id,
  });
  const createTask = useCreateTaskForm({
    assigneePersonNodeId: selectedPerson?.id,
  });
  const projectColumns = useProjectListColumns();

  usePageBreadcrumb("Work");

  useEffect(() => {
    if (expandSeeded || isPersonScopePending || projectsPage.isLoading) return;

    const initial = new Set<string>();
    for (const project of projectsPage.projects) {
      const nested = projectsPage.tasksByProjectId.get(project.id) ?? [];
      if (nested.some((task) => !isClosedCollectionStatus(task.status))) {
        initial.add(project.id);
      }
    }
    setExpandedIds(initial);
  }, [
    expandSeeded,
    isPersonScopePending,
    projectsPage.isLoading,
    projectsPage.projects,
    projectsPage.tasksByProjectId,
    setExpandedIds,
  ]);

  const expandableProjectIds = useMemo(
    () =>
      projectsPage.projects
        .filter(
          (project) => (projectsPage.tasksByProjectId.get(project.id)?.length ?? 0) > 0
        )
        .map((project) => project.id),
    [projectsPage.projects, projectsPage.tasksByProjectId]
  );

  const isHierarchy = view === "hierarchy";
  const isLoading =
    isPersonScopePending ||
    (isHierarchy ? projectsPage.isLoading : tasksPage.isLoading);
  const isError = isHierarchy ? projectsPage.isError : tasksPage.isError;
  const errorMessage = isHierarchy
    ? projectsPage.errorMessage
    : tasksPage.errorMessage;

  const metaLabel = selectedPerson
    ? personDisplayName(selectedPerson)
    : isPersonScopePending
      ? "Your work"
      : "Everyone";

  return (
    <div>
      <PageHeader
        dense
        title="Work"
        meta={
          <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
            {metaLabel}
            {" · "}
            {isHierarchy
              ? `${projectsPage.totalCount} projects · ${projectsPage.activeCount} active`
              : `${tasksPage.totalCount} tasks · ${tasksPage.openCount} open`}
          </span>
        }
        actions={
          <>
            <WorkViewToggle value={view} onChange={setView} />
            <WorkCreateMenu
              view={view}
              onCreateProject={() => createProject.setIsOpen(true)}
              onCreateTask={() => createTask.setIsOpen(true)}
              onCreatePerson={() => peoplePage.setIsCreateOpen(true)}
            />
            <CreatePersonDialog
              hideTrigger
              open={peoplePage.isCreateOpen}
              isSubmitting={peoplePage.isCreating}
              errorMessage={peoplePage.createError}
              onOpenChange={peoplePage.setIsCreateOpen}
              onSubmit={peoplePage.submitCreate}
            />
            <CreateProjectDialog
              hideTrigger
              areas={projectsPage.areas}
              open={createProject.isOpen}
              values={createProject.values}
              canSubmit={createProject.canSubmit}
              isSubmitting={createProject.isSubmitting}
              errorMessage={createProject.errorMessage}
              linkPersonName={
                selectedPerson ? personDisplayName(selectedPerson) : undefined
              }
              onOpenChange={createProject.setIsOpen}
              onFieldChange={createProject.updateField}
              onSubmit={createProject.submit}
            />
            <CreateTaskDialog
              hideTrigger
              projects={tasksPage.projects}
              open={createTask.isOpen}
              values={createTask.values}
              canSubmit={createTask.canSubmit}
              isSubmitting={createTask.isSubmitting}
              errorMessage={createTask.errorMessage}
              assigneeName={
                selectedPerson ? personDisplayName(selectedPerson) : undefined
              }
              onOpenChange={createTask.setIsOpen}
              onFieldChange={createTask.updateField}
              onSubmit={createTask.submit}
            />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 border-b border-border/80 px-6 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/80">
            Who
          </span>
          <WorkPersonFilter
            people={peoplePage.people}
            selectedPersonId={personId}
            pending={isPersonScopePending}
            onSelect={setPersonId}
          />
        </div>
        {isHierarchy ? (
          <div className="flex shrink-0 items-center gap-1">
            <ExpandCollapseControls
              disabled={expandableProjectIds.length === 0}
              onExpandAll={() => setExpandedIds(new Set(expandableProjectIds))}
              onCollapseAll={() => setExpandedIds(new Set())}
            />
            <ProjectColumnSelector
              compact
              columns={projectColumns.columns}
              visibleColumnSet={projectColumns.visibleColumnSet}
              onToggleColumn={projectColumns.toggleColumn}
            />
            <ProjectsTrashButton
              count={projectsPage.deletedCount}
              onClick={projectsPage.openTrash}
            />
          </div>
        ) : null}
      </div>

      {peoplePage.deleteError ? (
        <p className="px-6 pt-3 text-sm text-destructive">{peoplePage.deleteError}</p>
      ) : null}

      {isHierarchy ? (
        <>
          <ProjectAreasPanel
            areas={projectsPage.areas}
            isLoading={projectsPage.isAreasLoading}
          />
          {(projectsPage.isTrashLoading || projectsPage.deletedCount > 0) && (
            <ProjectTrashPanel
              projects={projectsPage.deletedProjects}
              isLoading={projectsPage.isTrashLoading}
              expanded={projectsPage.trashExpanded}
              onExpandedChange={projectsPage.setTrashExpanded}
              onRestore={projectsPage.restoreProject}
              isRestoring={projectsPage.restoringProjectId !== null}
              restoringId={projectsPage.restoringProjectId}
              error={projectsPage.restoreError}
            />
          )}
        </>
      ) : null}

      {isLoading && (
        <LoadingState title={isHierarchy ? "Loading work" : "Loading tasks"} />
      )}
      {isError && (
        <ErrorState
          title={isHierarchy ? "Work unavailable" : "Tasks unavailable"}
          description={errorMessage}
        />
      )}

      {!isLoading && !isError && isHierarchy && projectsPage.orgProjectCount === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create a project to start a hierarchy, or switch to Tasks for a flat list."
        />
      )}

      {!isLoading && !isError && isHierarchy && projectsPage.orgProjectCount > 0 && (
        <>
          <ProjectListToolbar
            filters={projectsPage.listView.filters}
            areas={projectsPage.areas}
            people={projectsPage.people}
            filteredCount={projectsPage.filteredCount}
            totalCount={projectsPage.totalCount}
            activeFilterCount={projectsPage.listView.activeFilterCount}
            onSearchChange={projectsPage.listView.setSearch}
            onToggleFacet={projectsPage.listView.toggleFacetFilter}
            onRemoveFacetValue={projectsPage.listView.removeFacetFilter}
            onClearFilters={projectsPage.listView.clearFilters}
          />
          {projectsPage.statusError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {projectsPage.statusError}
            </p>
          )}
          {projectsPage.titleError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {projectsPage.titleError}
            </p>
          )}
          {projectsPage.areaError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {projectsPage.areaError}
            </p>
          )}
          {projectsPage.targetError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {projectsPage.targetError}
            </p>
          )}
          {projectsPage.priorityError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {projectsPage.priorityError}
            </p>
          )}
          {projectsPage.deleteError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {projectsPage.deleteError}
            </p>
          )}
          {projectsPage.assigneeError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {projectsPage.assigneeError}
            </p>
          )}
          {projectsPage.taskError && (
            <p className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {projectsPage.taskError}
            </p>
          )}
          {projectsPage.allProjects.length === 0 ? (
            <EmptyState
              title={
                selectedPerson
                  ? `No work for ${personDisplayName(selectedPerson)}`
                  : "No projects match your filters"
              }
              description={
                selectedPerson
                  ? "Assign them to a project or a task, then they will show up here."
                  : undefined
              }
            />
          ) : (
            <ProjectList
              projects={projectsPage.projects}
              areas={projectsPage.areas}
              people={projectsPage.people}
              tasksByProjectId={projectsPage.tasksByProjectId}
              visibleColumns={projectColumns.visibleColumns}
              sort={projectsPage.listView.sort}
              reorderEnabled={projectsPage.reorder.canReorder}
              getPriorityRank={projectsPage.getPriorityRank}
              onReorder={projectsPage.reorder.onReorder}
              hasActiveFilters={projectsPage.listView.hasActiveFilters}
              updatingProjectId={projectsPage.updatingProjectId}
              updatingTaskId={projectsPage.updatingTaskId}
              creatingTaskProjectId={projectsPage.creatingTaskProjectId}
              onSortColumn={projectsPage.listView.toggleSortColumn}
              onClearFilters={projectsPage.listView.clearFilters}
              onTitleChange={projectsPage.updateTitle}
              onStatusChange={projectsPage.updateStatus}
              onAreaChange={projectsPage.updateArea}
              onPriorityChange={projectsPage.updatePriority}
              onTargetDateChange={projectsPage.updateTargetDate}
              onAssigneeChange={projectsPage.updateAssignee}
              onTaskStatusChange={projectsPage.updateTaskStatus}
              onTaskDueDateChange={projectsPage.updateTaskDueDate}
              onCreateTask={projectsPage.createProjectTask}
              onDelete={projectsPage.deleteProject}
              deletingProjectId={projectsPage.deletingProjectId}
              expandedIds={expandedIds}
              onExpandedIdsChange={setExpandedIds}
            />
          )}
        </>
      )}

      {!isLoading && !isError && !isHierarchy && tasksPage.orgTaskCount === 0 && (
        <EmptyState
          title="No tasks yet"
          description="Create a task and assign it to a project to get started."
        />
      )}

      {!isLoading && !isError && !isHierarchy && tasksPage.orgTaskCount > 0 && (
        <>
          <CollectionToolbar view={tasksPage.view} />
          {tasksPage.statusError ? (
            <p className="mx-6 mb-3 mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {tasksPage.statusError}
            </p>
          ) : null}
          {tasksPage.projectError ? (
            <p className="mx-6 mb-3 mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {tasksPage.projectError}
            </p>
          ) : null}
          {tasksPage.assigneeError ? (
            <p className="mx-6 mb-3 mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {tasksPage.assigneeError}
            </p>
          ) : null}
          {tasksPage.dueDateError ? (
            <p className="mx-6 mb-3 mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {tasksPage.dueDateError}
            </p>
          ) : null}
          {tasksPage.deleteError ? (
            <p className="mx-6 mb-3 mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {tasksPage.deleteError}
            </p>
          ) : null}
          {tasksPage.view.items.length > 0 ? (
            <TaskList
              tasks={tasksPage.view.items}
              projects={tasksPage.projects}
              people={tasksPage.people}
              sort={tasksPage.view.state.sort}
              reorderEnabled={tasksPage.reorder.canReorder}
              getPriorityRank={tasksPage.getPriorityRank}
              updatingTaskId={tasksPage.updatingTaskId}
              onSortColumn={tasksPage.view.toggleSort}
              onReorder={tasksPage.reorder.onReorder}
              onStatusChange={tasksPage.updateStatus}
              onProjectChange={tasksPage.updateProject}
              onAssigneeChange={tasksPage.updateAssignee}
              onDueDateChange={tasksPage.updateDueDate}
              onDelete={tasksPage.deleteTask}
              onDeleteSelected={tasksPage.deleteSelectedTasks}
              deletingTaskIds={tasksPage.deletingTaskIds}
            />
          ) : (
            <CollectionNoResults
              noun={tasksPage.view.noun}
              onClearFilters={tasksPage.view.clearFilters}
            />
          )}
        </>
      )}
    </div>
  );
}
