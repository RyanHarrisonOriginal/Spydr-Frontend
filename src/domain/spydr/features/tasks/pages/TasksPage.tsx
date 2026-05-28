import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { TaskGroups } from "../components/TaskGroups";
import { useTasksPage } from "../hooks/useTasksPage";

export function TasksPage() {
  const { tasks, groups, totalCount, openCount, isLoading, isError, errorMessage } =
    useTasksPage();

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
      />
      {isLoading && <LoadingState title="Loading tasks" />}
      {isError && <ErrorState title="Tasks unavailable" description={errorMessage} />}
      {!isLoading && !isError && tasks.length === 0 && (
        <EmptyState
          title="No tasks yet"
          description="Task nodes will appear here once they are available from the API."
        />
      )}
      {!isLoading && !isError && tasks.length > 0 && <TaskGroups groups={groups} />}
    </div>
  );
}
