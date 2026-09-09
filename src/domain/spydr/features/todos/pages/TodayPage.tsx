import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/domain/spydr/features/shared/components/ListState";
import { usePageBreadcrumb } from "@/domain/spydr/features/shell/context/NavigationBreadcrumbContext";
import { useTodoItemsQuery } from "@/domain/spydr/features/shared/hooks/queries";
import {
  useAddTodoItemMutation,
  useRemoveTodoItemMutation,
} from "@/domain/spydr/features/todos/hooks/useTodoItemMutations";
import { TodayTodoRow } from "@/domain/spydr/features/todos/components/TodayTodoRow";

export function TodayPage() {
  usePageBreadcrumb("Today");
  const query = useTodoItemsQuery();
  const addTodo = useAddTodoItemMutation();
  const removeTodo = useRemoveTodoItemMutation();
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const items = query.data ?? [];
  const staleCount = useMemo(
    () => items.filter((item) => item.isStale).length,
    [items]
  );
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.isStale !== b.isStale) return a.isStale ? -1 : 1;
      return b.ageHours - a.ageHours;
    });
  }, [items]);

  const toggleTodo = (taskId: string, onTodo: boolean) => {
    setTogglingTaskId(taskId);
    const mutation = onTodo
      ? removeTodo.mutateAsync({ taskId })
      : addTodo.mutateAsync({ taskId, source: "user" });
    void mutation.finally(() => setTogglingTaskId(null));
  };

  return (
    <div className="pb-6">
      <PageHeader
        dense
        title="Today"
        meta={
          <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
            {items.length} action{items.length === 1 ? "" : "s"}
            {staleCount > 0 ? (
              <>
                {" · "}
                <span className="text-destructive/85">{staleCount} stale</span>
              </>
            ) : null}
          </span>
        }
        actions={
          <Link
            to="/work"
            className="text-[11px] text-muted-foreground transition-colors hover:text-highlight"
          >
            Add from Work
          </Link>
        }
      />

      {query.isLoading ? <LoadingState title="Loading today" /> : null}
      {query.isError ? (
        <ErrorState
          title="Today unavailable"
          description={
            query.error instanceof Error
              ? query.error.message
              : "Failed to load todo items"
          }
        />
      ) : null}

      {!query.isLoading && !query.isError && items.length === 0 ? (
        <EmptyState
          title="Nothing on Today"
          description="From Work, use the list button next to a task to pin today's action items."
        />
      ) : null}

      {!query.isLoading && !query.isError && sortedItems.length > 0 ? (
        <ul className="border-t border-border/40">
          {sortedItems.map((item) => (
            <TodayTodoRow
              key={item.id}
              item={item}
              toggling={togglingTaskId === item.taskId}
              onRemove={() => toggleTodo(item.taskId, true)}
              onNoteLogged={() => {
                void query.refetch();
              }}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
