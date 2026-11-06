import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { CollectionToolbar } from "@/domain/spydr/features/shared/components/CollectionToolbar";
import { CollectionNoResults } from "@/domain/spydr/features/shared/components/CollectionNoResults";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import { personDisplayName } from "@/domain/spydr/utils/projectPersonas";
import { CreateProjectDialog } from "@/domain/spydr/features/projects/components/CreateProjectDialog";
import { ProjectListToolbar } from "@/domain/spydr/features/projects/components/ProjectListToolbar";
import { ProjectTrashPanel } from "@/domain/spydr/features/projects/components/ProjectTrashPanel";
import { useCreateProjectForm } from "@/domain/spydr/features/projects/hooks/useCreateProjectForm";
import { useProjectsPage } from "@/domain/spydr/features/projects/hooks/useProjectsPage";
import { CreateTaskDialog } from "@/domain/spydr/features/tasks/components/CreateTaskDialog";
import { useCreateTaskForm } from "@/domain/spydr/features/tasks/hooks/useCreateTaskForm";
import { useTasksPage } from "@/domain/spydr/features/tasks/hooks/useTasksPage";
import { CreatePersonDialog } from "@/domain/spydr/features/people/components/CreatePersonDialog";
import { usePeoplePage } from "@/domain/spydr/features/people/hooks/usePeoplePage";
import { useTodoItemsQuery } from "@/domain/spydr/features/shared/hooks/queries";
import {
  useAddTodoItemMutation,
  useRemoveTodoItemMutation,
} from "@/domain/spydr/features/todos/hooks/useTodoItemMutations";
import { WorkTodoPanel } from "@/domain/spydr/features/todos/components/WorkTodoPanel";
import { WorkPersonPicker } from "../components/WorkPersonPicker";
import { WorkViewToggle } from "../components/WorkViewToggle";
import { WorkCreateMenu } from "../components/WorkCreateMenu";
import { WorkGrid } from "../components/WorkGrid";
import { WorkMoreMenu } from "../components/WorkMoreMenu";
import { WorkPulse, type WorkPulseKind } from "../components/WorkPulse";
import { moveIdInOrder } from "@/domain/spydr/utils/collectionReorder";
import type { WorkGridKind } from "../utils/workGridRows";
import { countVisiblePulse } from "../utils/workPulse";
import { useWorkScope } from "../hooks/useWorkScope";
import "./work-page.css";

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
  const navigate = useNavigate();
  const todosQuery = useTodoItemsQuery();
  const addTodo = useAddTodoItemMutation();
  const removeTodo = useRemoveTodoItemMutation();
  const [togglingTodoTaskId, setTogglingTodoTaskId] = useState<string | null>(null);
  const selectedPerson =
    peoplePage.people.find((person) => person.id === personId) ?? null;
  const createProject = useCreateProjectForm({
    linkPersonAsAssignee: personId ?? undefined,
  });
  const createTask = useCreateTaskForm({
    assigneePersonNodeId: personId ?? undefined,
  });
  const [showCompleted, setShowCompleted] = useState(false);

  usePageBreadcrumb("Work");

  const todoTaskIds = useMemo(
    () => new Set((todosQuery.data ?? []).map((item) => item.taskId)),
    [todosQuery.data]
  );

  const toggleTodo = (taskId: string, onTodo: boolean) => {
    setTogglingTodoTaskId(taskId);
    const mutation = onTodo
      ? removeTodo.mutateAsync({ taskId })
      : addTodo.mutateAsync({ taskId, source: "user" });
    void mutation.finally(() => setTogglingTodoTaskId(null));
  };

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

  const visibleProjects = useMemo(
    () =>
      showCompleted
        ? projectsPage.projects
        : projectsPage.projects.filter(
            (project) => !isClosedCollectionStatus(project.status)
          ),
    [projectsPage.projects, showCompleted]
  );

  const expandableProjectIds = useMemo(
    () =>
      visibleProjects
        .filter((project) => {
          const tasks = projectsPage.tasksByProjectId.get(project.id) ?? [];
          return tasks.some(
            (task) => showCompleted || !isClosedCollectionStatus(task.status)
          );
        })
        .map((project) => project.id),
    [projectsPage.tasksByProjectId, showCompleted, visibleProjects]
  );

  const isHierarchy = view === "hierarchy";
  const isLoading =
    isPersonScopePending ||
    (isHierarchy ? projectsPage.isLoading : tasksPage.isLoading);
  const isError = isHierarchy ? projectsPage.isError : tasksPage.isError;
  const errorMessage = isHierarchy
    ? projectsPage.errorMessage
    : tasksPage.errorMessage;

  const completedCount = useMemo(() => {
    if (isHierarchy) {
      let count = 0;
      for (const project of projectsPage.projects) {
        if (isClosedCollectionStatus(project.status)) count += 1;
        const tasks = projectsPage.tasksByProjectId.get(project.id) ?? [];
        count += tasks.filter((task) =>
          isClosedCollectionStatus(task.status)
        ).length;
      }
      return count;
    }
    return tasksPage.view.items.filter((task) =>
      isClosedCollectionStatus(task.status)
    ).length;
  }, [
    isHierarchy,
    projectsPage.projects,
    projectsPage.tasksByProjectId,
    tasksPage.view.items,
  ]);

  const hierarchyExpanded =
    expandableProjectIds.length > 0 &&
    expandableProjectIds.every((id) => expandedIds.has(id));

  const listTools = (
    <>
      <WorkCreateMenu
        onCreateProject={() => createProject.setIsOpen(true)}
        onCreateTask={() => createTask.setIsOpen(true)}
        onCreateTemplate={() => navigate("/project-templates/new")}
        onCreatePerson={() => peoplePage.setIsCreateOpen(true)}
      />
      <WorkMoreMenu
        trashCount={projectsPage.deletedCount}
        onOpenTrash={projectsPage.openTrash}
        showCompleted={showCompleted}
        completedCount={completedCount}
        onToggleCompleted={setShowCompleted}
        hierarchyExpanded={isHierarchy ? hierarchyExpanded : undefined}
        expandDisabled={expandableProjectIds.length === 0}
        onExpandAll={
          isHierarchy
            ? () => setExpandedIds(new Set(expandableProjectIds))
            : undefined
        }
        onCollapseAll={
          isHierarchy ? () => setExpandedIds(new Set()) : undefined
        }
      />
    </>
  );

  const pageControls = (
    <>
      <WorkPersonPicker
        people={peoplePage.people}
        selectedPersonId={personId}
        pending={isPersonScopePending}
        onSelect={setPersonId}
        onAddPerson={() => peoplePage.setIsCreateOpen(true)}
      />
      <WorkViewToggle value={view} onChange={setView} />
    </>
  );

  const createDialogs = (
    <>
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
        templates={createProject.templates}
        hasAnyTemplates={createProject.hasAnyTemplates}
        templateId={createProject.templateId}
        selectedTemplate={createProject.selectedTemplate}
        templateLoading={createProject.templateLoading}
        paramValues={createProject.paramValues}
        onOpenChange={createProject.setIsOpen}
        onFieldChange={createProject.updateField}
        onTemplateChange={createProject.setTemplateId}
        onParamChange={createProject.updateParam}
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
  );

  const resetSignal = [
    projectsPage.statusError,
    projectsPage.titleError,
    projectsPage.areaError,
    projectsPage.targetError,
    projectsPage.priorityError,
    projectsPage.assigneeError,
    projectsPage.requesterError,
    projectsPage.taskError,
    projectsPage.deleteError,
    tasksPage.statusError,
    tasksPage.projectError,
    tasksPage.assigneeError,
    tasksPage.dueDateError,
    tasksPage.titleError,
    tasksPage.deleteError,
  ]
    .filter(Boolean)
    .join("|");

  const editTitle = (id: string, kind: WorkGridKind, title: string) => {
    if (kind === "project") projectsPage.updateTitle(id, title);
    else if (isHierarchy) projectsPage.updateTaskTitle(id, title);
    else tasksPage.updateTitle(id, title);
  };

  const editEmoji = (id: string, kind: WorkGridKind, emoji: string | null) => {
    if (kind === "project") projectsPage.updateEmoji(id, emoji);
    else if (isHierarchy) projectsPage.updateTaskEmoji(id, emoji);
    else tasksPage.updateEmoji(id, emoji);
  };

  const editPriority = (id: string, kind: WorkGridKind, priority: string) => {
    if (kind === "project") projectsPage.updatePriority(id, priority);
    else if (isHierarchy) projectsPage.updateTaskPriority(id, priority);
    else tasksPage.updatePriority(id, priority);
  };

  const editAssignee = (id: string, kind: WorkGridKind, personId: string | null) => {
    if (kind === "project") projectsPage.updateAssignee(id, personId);
    else if (isHierarchy) projectsPage.updateTaskAssignee(id, personId);
    else tasksPage.updateAssignee(id, personId);
  };

  const editDate = (id: string, kind: WorkGridKind, date: string | null) => {
    if (kind === "project") projectsPage.updateTargetDate(id, date);
    else if (isHierarchy) projectsPage.updateTaskDueDate(id, date);
    else tasksPage.updateDueDate(id, date);
  };

  const editDelete = (id: string, kind: WorkGridKind) => {
    if (kind === "project") projectsPage.deleteProject(id);
    else if (isHierarchy) projectsPage.deleteTask(id);
    else tasksPage.deleteTask(id);
  };

  const moveProject = (id: string, direction: "up" | "down") => {
    const next = moveIdInOrder(
      projectsPage.projects.map((project) => project.id),
      id,
      direction
    );
    if (next) projectsPage.reorder.onReorder(next);
  };

  const gridErrors = (isHierarchy
    ? [
        projectsPage.statusError,
        projectsPage.titleError,
        projectsPage.areaError,
        projectsPage.targetError,
        projectsPage.priorityError,
        projectsPage.deleteError,
        projectsPage.assigneeError,
        projectsPage.requesterError,
        projectsPage.taskError,
      ]
    : [
        tasksPage.statusError,
        tasksPage.projectError,
        tasksPage.assigneeError,
        tasksPage.dueDateError,
        tasksPage.titleError,
        tasksPage.deleteError,
      ]
  ).filter((message): message is string => Boolean(message));

  const visibleTasks = useMemo(
    () =>
      showCompleted
        ? tasksPage.view.items
        : tasksPage.view.items.filter(
            (task) => !isClosedCollectionStatus(task.status)
          ),
    [showCompleted, tasksPage.view.items]
  );

  const showHierarchyGrid =
    !isLoading && !isError && isHierarchy && visibleProjects.length > 0;
  const showTaskGrid =
    !isLoading && !isError && !isHierarchy && visibleTasks.length > 0;

  const pulseCounts = useMemo(() => {
    if (isHierarchy) {
      const tasks: typeof tasksPage.view.items = [];
      for (const project of visibleProjects) {
        const nested = projectsPage.tasksByProjectId.get(project.id) ?? [];
        for (const task of nested) {
          if (showCompleted || !isClosedCollectionStatus(task.status)) {
            tasks.push(task);
          }
        }
      }
      return countVisiblePulse(visibleProjects, tasks);
    }
    return countVisiblePulse([], visibleTasks);
  }, [
    isHierarchy,
    projectsPage.tasksByProjectId,
    showCompleted,
    visibleProjects,
    visibleTasks,
  ]);

  const applyPulseFilter = (kind: WorkPulseKind) => {
    if (isHierarchy) {
      projectsPage.listView.clearFilters();
      if (kind === "overdue") {
        projectsPage.listView.toggleFacetFilter("target", "overdue");
      } else if (kind === "blocked") {
        projectsPage.listView.toggleFacetFilter("status", "blocked");
      } else {
        projectsPage.listView.toggleFacetFilter("target", "this_week");
      }
      return;
    }

    if (kind === "overdue") {
      tasksPage.view.replaceFilters({ due: ["overdue"] });
    } else if (kind === "blocked") {
      tasksPage.view.replaceFilters({ status: ["blocked"] });
    } else {
      tasksPage.view.replaceFilters({ due: ["this_week"] });
    }
  };

  return (
    <div className="work-page flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <div className="shrink-0">
        <PageHeader
          dense
          atmosphere={false}
          showBreadcrumbs={false}
          inlineMeta
          className="work-page-header"
          titleClassName="text-[24px] font-semibold tracking-[-0.03em] text-[var(--fg)]"
          title="Work"
          meta={<WorkPulse counts={pulseCounts} onSelect={applyPulseFilter} />}
        />
        {createDialogs}

        <WorkTodoPanel
          items={todosQuery.data ?? []}
          isLoading={todosQuery.isLoading}
          togglingTaskId={togglingTodoTaskId}
          onToggleTask={toggleTodo}
        />

        {peoplePage.deleteError ? (
          <p className="border-b border-destructive/30 bg-destructive/5 px-page-x py-2 text-sm text-destructive">
            {peoplePage.deleteError}
          </p>
        ) : null}

        {isHierarchy && projectsPage.trashExpanded ? (
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
        ) : null}

        {!isError && isHierarchy ? (
          <div className="work-page-toolbar">
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
              startActions={pageControls}
              endActions={listTools}
              showCount={false}
            />
          </div>
        ) : null}

        {!isError && !isHierarchy ? (
          <div className="work-page-toolbar">
            <CollectionToolbar
              view={tasksPage.view}
              startActions={pageControls}
              endActions={listTools}
              showSort={false}
              showCount={false}
              wrap
            />
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {isLoading && (
          <LoadingState title={isHierarchy ? "Loading work" : "Loading tasks"} />
        )}
        {isError && (
          <ErrorState
            title={isHierarchy ? "Work unavailable" : "Tasks unavailable"}
            description={errorMessage}
          />
        )}

        {!isLoading &&
          !isError &&
          isHierarchy &&
          projectsPage.orgProjectCount === 0 && (
            <EmptyState
              title="No projects yet"
              description="Create a project to start a hierarchy, or switch to Tasks for a flat list."
            />
          )}

        {!isLoading &&
          !isError &&
          isHierarchy &&
          projectsPage.orgProjectCount > 0 &&
          projectsPage.allProjects.length > 0 &&
          projectsPage.projects.length === 0 && (
            <EmptyState title="No projects match your filters" />
          )}

        {!isLoading &&
          !isError &&
          isHierarchy &&
          projectsPage.projects.length > 0 &&
          visibleProjects.length === 0 && (
            <EmptyState
              title="No open projects"
              description="Turn on Show completed in the list menu to see finished work."
            />
          )}

        {!isLoading &&
          !isError &&
          isHierarchy &&
          projectsPage.orgProjectCount > 0 &&
          projectsPage.allProjects.length === 0 && (
            <EmptyState
              title={
                selectedPerson
                  ? `No work for ${personDisplayName(selectedPerson)}`
                  : "No projects match your filters"
              }
              description={
                selectedPerson
                  ? "Owned projects and projects with an open task assigned to them show up here."
                  : undefined
              }
            />
          )}

        {(showHierarchyGrid || showTaskGrid) && (
          <>
            {gridErrors.map((message) => (
              <p
                key={message}
                className="border-b border-destructive/30 bg-destructive/5 px-page-x py-2 text-sm text-destructive"
              >
                {message}
              </p>
            ))}
            <div className="work-page-panel">
              <WorkGrid
                mode={isHierarchy ? "hierarchy" : "tasks"}
                projects={
                  isHierarchy ? projectsPage.projects : tasksPage.projects
                }
                tasks={tasksPage.view.items}
                tasksByProjectId={projectsPage.tasksByProjectId}
                areas={projectsPage.areas}
                people={isHierarchy ? projectsPage.people : tasksPage.people}
                expandedIds={expandedIds}
                showCompleted={showCompleted}
                reorderEnabled={
                  isHierarchy
                    ? projectsPage.reorder.canReorder
                    : tasksPage.reorder.canReorder
                }
                resetSignal={resetSignal}
                todoTaskIds={todoTaskIds}
                togglingTodoTaskId={togglingTodoTaskId}
                busyId={
                  projectsPage.updatingProjectId ??
                  projectsPage.updatingTaskId ??
                  tasksPage.updatingTaskId
                }
                deletingIds={
                  new Set(
                    [
                      projectsPage.deletingProjectId,
                      ...projectsPage.deletingTaskIds,
                      ...tasksPage.deletingTaskIds,
                    ].filter((id): id is string => Boolean(id))
                  )
                }
                onExpandedIdsChange={setExpandedIds}
                onTitle={editTitle}
                onEmoji={editEmoji}
                onProjectStatus={projectsPage.updateStatus}
                onTaskStatus={
                  isHierarchy
                    ? projectsPage.updateTaskStatus
                    : tasksPage.updateStatus
                }
                onPriority={editPriority}
                onAssignee={editAssignee}
                onRequester={projectsPage.updateRequester}
                onArea={projectsPage.updateArea}
                onDate={editDate}
                onProject={tasksPage.updateProject}
                onDelete={editDelete}
                onToggleTodo={toggleTodo}
                onAddTask={(projectId) => {
                  createTask.updateField("projectId", projectId);
                  createTask.setIsOpen(true);
                }}
                onMoveProject={moveProject}
                onReorder={tasksPage.reorder.onReorder}
              />
            </div>
          </>
        )}

        {!isLoading && !isError && !isHierarchy && tasksPage.orgTaskCount === 0 && (
          <EmptyState
            title="No tasks yet"
            description="Create a task and assign it to a project to get started."
          />
        )}

        {!isLoading &&
          !isError &&
          !isHierarchy &&
          tasksPage.orgTaskCount > 0 &&
          tasksPage.view.items.length === 0 && (
            <CollectionNoResults
              noun={tasksPage.view.noun}
              onClearFilters={tasksPage.view.clearFilters}
            />
          )}

        {!isLoading &&
          !isError &&
          !isHierarchy &&
          tasksPage.view.items.length > 0 &&
          visibleTasks.length === 0 && (
            <EmptyState
              title="No open tasks"
              description="Turn on Show completed in the list menu to see finished work."
            />
          )}
      </div>
    </div>
  );
}
