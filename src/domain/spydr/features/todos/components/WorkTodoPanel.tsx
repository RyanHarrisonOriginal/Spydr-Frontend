import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, ListChecks, Sun } from "lucide-react";
import type { TodoItem } from "@/domain/spydr/utils/types";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import { usePersistentState } from "@/domain/spydr/features/shared/hooks/usePersistentState";
import { cn } from "@/lib/utils";
import { AddToTodoButton } from "./AddToTodoButton";
import { formatTodoAgeHours } from "../utils/todoAge";

interface WorkTodoPanelProps {
  items: TodoItem[];
  isLoading?: boolean;
  togglingTaskId?: string | null;
  onToggleTask(taskId: string, onTodo: boolean): void;
}

export function WorkTodoPanel({
  items,
  isLoading = false,
  togglingTaskId = null,
  onToggleTask,
}: WorkTodoPanelProps) {
  const { activeOrgId } = useOrganizationContext();
  const [expanded, setExpanded] = usePersistentState<boolean>(
    activeOrgId
      ? `work-today-expanded:${activeOrgId}`
      : "work-today-expanded:pending",
    () => false,
    (raw, fallback) => (typeof raw === "boolean" ? raw : fallback)
  );
  const staleCount = items.filter((item) => item.isStale).length;
  const countLabel = isLoading
    ? "…"
    : `${items.length} action${items.length === 1 ? "" : "s"}${
        staleCount > 0 ? ` · ${staleCount} stale` : ""
      }`;

  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <section className="min-w-0 border-b border-border/60">
      <div className="flex h-12 min-w-0 items-center gap-2 px-page-x">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-1 text-left transition-colors hover:bg-accent"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <Sun className="h-4 w-4 shrink-0 text-highlight" aria-hidden />
          <h2 className="shrink-0 text-sm font-medium tracking-tight">Today</h2>
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {countLabel}
          </span>
        </button>
        <Link
          to="/today"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm text-highlight transition-colors hover:bg-accent"
        >
          Open Today
          <ListChecks className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      {expanded ? (
        <div className="border-t border-border/60">
          {items.length === 0 && !isLoading ? (
            <p className="px-page-x py-3 text-sm text-muted-foreground">
              Pin tasks with the list button — they show up here as today&apos;s
              action items.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {items.slice(0, 6).map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex min-h-12 items-center gap-3 px-page-x",
                    item.isStale && "bg-destructive/[0.04]"
                  )}
                >
                  <Link
                    to={`/tasks/${item.taskId}`}
                    className="min-w-0 flex-1 truncate text-[13px] text-foreground/90 hover:text-highlight"
                  >
                    {item.task.details?.emoji
                      ? `${item.task.details.emoji} ${item.task.title}`
                      : item.task.title}
                  </Link>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-xs text-muted-foreground",
                      item.isStale && "text-destructive/80"
                    )}
                  >
                    {item.isStale ? "stale " : ""}
                    {formatTodoAgeHours(item.ageHours)}
                  </span>
                  <AddToTodoButton
                    className="h-8 w-8"
                    onTodo
                    busy={togglingTaskId === item.taskId}
                    onToggle={() => onToggleTask(item.taskId, true)}
                  />
                </li>
              ))}
            </ul>
          )}
          {items.length > 6 ? (
            <p className="border-t border-border/40 px-page-x py-2 text-xs text-muted-foreground">
              +{items.length - 6} more on{" "}
              <Link to="/today" className="text-highlight hover:underline">
                Today
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
