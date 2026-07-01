import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { CollectionToolbar } from "@/domain/spydr/features/shared/components/CollectionToolbar";
import { CollectionNoResults } from "@/domain/spydr/features/shared/components/CollectionNoResults";
import { CreateTaskDialog } from "../components/CreateTaskDialog";
import { TaskList } from "../components/TaskList";
import { useCreateTaskForm } from "../hooks/useCreateTaskForm";
import { useTasksPage } from "../hooks/useTasksPage";

export function TasksPage() {
  const {
    tasks,
    projects,
    people,
    view,
    reorder,
    getPriorityRank,
    totalCount,
    openCount,
    updateStatus,
    updateProject,
    updateAssignee,
    updateDueDate,
    updatingTaskId,
    statusError,
    projectError,
    assigneeError,
    dueDateError,
    isLoading,
    isError,
    errorMessage,
  } = useTasksPage();
  const createTask = useCreateTaskForm();

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Tasks"
        meta={
          <span>
            {totalCount} total · {openCount} open
          </span>
        }
        actions={
          <CreateTaskDialog
            projects={projects}
            open={createTask.isOpen}
            values={createTask.values}
            canSubmit={createTask.canSubmit}
            isSubmitting={createTask.isSubmitting}
            errorMessage={createTask.errorMessage}
            onOpenChange={createTask.setIsOpen}
            onFieldChange={createTask.updateField}
            onSubmit={createTask.submit}
          />
        }
      />
      {isLoading && <LoadingState title="Loading tasks" />}
      {isError && <ErrorState title="Tasks unavailable" description={errorMessage} />}
      {!isLoading && !isError && tasks.length === 0 && (
        <EmptyState
          title="No tasks yet"
          description="Create a task and assign it to a project to get started."
        />
      )}
      {!isLoading && !isError && tasks.length > 0 && (
        <>
          <CollectionToolbar view={view} />
          {statusError ? (
            <p className="mx-6 mb-3 mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {statusError}
            </p>
          ) : null}
          {projectError ? (
            <p className="mx-6 mb-3 mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {projectError}
            </p>
          ) : null}
          {assigneeError ? (
            <p className="mx-6 mb-3 mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {assigneeError}
            </p>
          ) : null}
          {dueDateError ? (
            <p className="mx-6 mb-3 mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {dueDateError}
            </p>
          ) : null}
          {view.items.length > 0 ? (
            <TaskList
              tasks={view.items}
              projects={projects}
              people={people}
              sort={view.state.sort}
              reorderEnabled={reorder.canReorder}
              getPriorityRank={getPriorityRank}
              updatingTaskId={updatingTaskId}
              onSortColumn={view.toggleSort}
              onReorder={reorder.onReorder}
              onStatusChange={updateStatus}
              onProjectChange={updateProject}
              onAssigneeChange={updateAssignee}
              onDueDateChange={updateDueDate}
            />
          ) : (
            <CollectionNoResults noun={view.noun} onClearFilters={view.clearFilters} />
          )}
        </>
      )}
    </div>
  );
}
