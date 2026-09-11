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

  return (
    <section className="mx-4 mt-3 overflow-hidden rounded-md border border-border/60 bg-muted/10 md:mx-6">
      <div className="flex items-center gap-2 border-b border-border/50 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-sm px-1 py-1 text-left transition-colors hover:bg-muted/40"
        >
          {expanded ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <Sun className="h-3.5 w-3.5 shrink-0 text-highlight" aria-hidden />
          <h2 className="text-[12px] font-semibold tracking-tight">Today</h2>
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {countLabel}
          </span>
        </button>
        <Link
          to="/today"
          className="inline-flex shrink-0 items-center gap-1 rounded-sm px-2 py-1 text-[11px] text-highlight transition-colors hover:bg-muted/40 hover:underline"
        >
          Open Today
          <ListChecks className="h-3 w-3" aria-hidden />
        </Link>
      </div>

      {expanded ? (
        <>
          {items.length === 0 && !isLoading ? (
            <p className="px-3 py-3 text-[12px] text-muted-foreground">
              Pin tasks with the list button — they show up here as today&apos;s
              action items.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {items.slice(0, 6).map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5",
                    item.isStale && "bg-destructive/[0.04]"
                  )}
                >
                  <Link
                    to={`/tasks/${item.taskId}`}
                    className="min-w-0 flex-1 truncate text-[13px] text-foreground/90 hover:text-highlight"
                  >
                    {item.task.title}
                  </Link>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-[10px] text-muted-foreground",
                      item.isStale && "text-destructive/80"
                    )}
                  >
                    {item.isStale ? "stale " : ""}
                    {formatTodoAgeHours(item.ageHours)}
                  </span>
                  <AddToTodoButton
                    onTodo
                    busy={togglingTaskId === item.taskId}
                    onToggle={() => onToggleTask(item.taskId, true)}
                  />
                </li>
              ))}
            </ul>
          )}
          {items.length > 6 ? (
            <p className="border-t border-border/40 px-3 py-1.5 text-[11px] text-muted-foreground">
              +{items.length - 6} more on{" "}
              <Link to="/today" className="text-highlight hover:underline">
                Today
              </Link>
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
