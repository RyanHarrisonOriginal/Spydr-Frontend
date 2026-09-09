import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskStatusSelect } from "@/domain/spydr/features/tasks/components/TaskStatusSelect";
import { useUpdateTaskMutation } from "@/domain/spydr/features/tasks/hooks/useUpdateTaskMutation";
import { AddToTodoButton } from "@/domain/spydr/features/todos/components/AddToTodoButton";
import {
  formatTodoAgeHours,
  formatTodoNoteTime,
} from "@/domain/spydr/features/todos/utils/todoAge";
import {
  parseTaskNoteEntries,
  prependTaskNoteEntry,
  type TaskNoteEntry,
} from "@/domain/spydr/utils/taskNotes";
import { isTaskStatus } from "@/domain/spydr/utils/taskStatus";
import type { TodoItem } from "@/domain/spydr/utils/types";
import { cn } from "@/lib/utils";

interface TodayTodoRowProps {
  item: TodoItem;
  toggling?: boolean;
  onRemove(): void;
  onNoteLogged(): void;
}

function latestNoteText(
  entries: TaskNoteEntry[],
  preamble: string
): { text: string; at: string | null } | null {
  if (entries.length > 0) {
    return { text: entries[0].text, at: entries[0].loggedAt };
  }
  if (preamble.trim()) {
    return { text: preamble.trim(), at: null };
  }
  return null;
}

export function TodayTodoRow({
  item,
  toggling = false,
  onRemove,
  onNoteLogged,
}: TodayTodoRowProps) {
  const updateTask = useUpdateTaskMutation(item.taskId);
  const [draft, setDraft] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const { entries, preamble } = parseTaskNoteEntries(item.task.body);
  const latest = latestNoteText(entries, preamble);
  const historyCount = entries.length + (preamble ? 1 : 0);

  const logNote = () => {
    const text = draft.trim();
    if (!text) return;
    updateTask.mutate(
      {
        taskId: item.taskId,
        input: { body: prependTaskNoteEntry(item.task.body, text) },
      },
      {
        onSuccess: () => {
          setDraft("");
          onNoteLogged();
        },
      }
    );
  };

  return (
    <li
      className={cn(
        "border-b border-border/50 px-4 py-2 md:px-6",
        item.isStale && "bg-destructive/[0.03]"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "h-7 w-0.5 shrink-0 rounded-full",
            item.isStale ? "bg-destructive/70" : "bg-highlight/40"
          )}
          aria-hidden
        />
        <TaskStatusSelect
          value={item.task.status}
          appearance="icon"
          className="h-7 w-7 shrink-0"
          disabled={updateTask.isPending}
          onChange={(status) => {
            if (status !== item.task.status && isTaskStatus(status)) {
              updateTask.mutate({
                taskId: item.taskId,
                input: { status },
              });
            }
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-2">
            <Link
              to={`/tasks/${item.taskId}`}
              className="min-w-0 truncate text-[13px] font-medium text-foreground/95 hover:text-highlight"
            >
              {item.task.title}
            </Link>
            {item.task.project ? (
              <Link
                to={`/projects/${item.task.project.id}`}
                className="hidden max-w-[10rem] shrink-0 truncate text-[11px] text-muted-foreground hover:text-highlight sm:inline"
                title={item.task.project.title}
              >
                {item.task.project.title}
              </Link>
            ) : null}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground",
            item.isStale && "text-destructive/85"
          )}
          title={formatTodoAgeHours(item.ageHours, "long")}
        >
          {item.isStale ? "stale " : ""}
          {formatTodoAgeHours(item.ageHours)}
        </span>
        <AddToTodoButton onTodo busy={toggling} onToggle={onRemove} />
      </div>

      <div className="mt-1.5 space-y-1.5 pl-[1.65rem]">
        {latest ? (
          <p className="truncate text-[12px] leading-snug text-foreground/80">
            {latest.at ? (
              <span className="mr-1.5 font-mono text-[10px] text-muted-foreground">
                {formatTodoNoteTime(latest.at)}
              </span>
            ) : null}
            {latest.text}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/80">No notes yet</p>
        )}

        <div className="flex items-center gap-1.5">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                logNote();
              }
            }}
            placeholder="Quick update…"
            disabled={updateTask.isPending}
            className="h-7 min-w-0 flex-1 rounded border border-border/50 bg-muted/15 px-2 text-[12px] outline-none ring-focus placeholder:text-muted-foreground/70"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-7 shrink-0 px-2.5 text-[11px]"
            disabled={!draft.trim() || updateTask.isPending}
            onClick={logNote}
          >
            {updateTask.isPending ? "…" : "Log"}
          </Button>
          {historyCount > 1 ? (
            <button
              type="button"
              className="inline-flex h-7 shrink-0 items-center gap-0.5 px-1 font-mono text-[10px] text-muted-foreground hover:text-foreground"
              onClick={() => setHistoryOpen((open) => !open)}
              aria-expanded={historyOpen}
            >
              {historyOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              {historyCount}
            </button>
          ) : null}
        </div>

        {historyOpen && historyCount > 1 ? (
          <ul className="max-h-40 space-y-1 overflow-y-auto border-l border-border/40 pl-2">
            {entries.slice(1).map((entry) => (
              <li
                key={`${entry.loggedAt}-${entry.text.slice(0, 24)}`}
                className="text-[11px] leading-snug text-foreground/75"
              >
                <span className="mr-1.5 font-mono text-[9px] text-muted-foreground">
                  {formatTodoNoteTime(entry.loggedAt)}
                </span>
                {entry.text}
              </li>
            ))}
            {preamble ? (
              <li className="whitespace-pre-wrap text-[11px] leading-snug text-muted-foreground">
                {preamble}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </li>
  );
}
