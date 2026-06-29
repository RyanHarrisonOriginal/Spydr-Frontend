import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { CreateTaskDialog } from "../components/CreateTaskDialog";
import { TaskGroups } from "../components/TaskGroups";
import { useCreateTaskForm } from "../hooks/useCreateTaskForm";
import { useTasksPage } from "../hooks/useTasksPage";

export function TasksPage() {
  const {
    tasks,
    projects,
    groups,
    totalCount,
    openCount,
    updateStatus,
    updateProject,
    updatingTaskId,
    statusError,
    projectError,
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
          {statusError ? (
            <p className="mx-6 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {statusError}
            </p>
          ) : null}
          {projectError ? (
            <p className="mx-6 mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {projectError}
            </p>
          ) : null}
          <TaskGroups
            groups={groups}
            projects={projects}
            updatingTaskId={updatingTaskId}
            onStatusChange={updateStatus}
            onProjectChange={updateProject}
          />
        </>
      )}
    </div>
  );
}
