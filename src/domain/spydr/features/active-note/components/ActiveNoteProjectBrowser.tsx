import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { isClosedCollectionStatus } from "@/domain/spydr/utils/collectionVisibility";
import { isOpenTask } from "@/domain/spydr/utils/personWork";
import type { ProjectNode, TaskNode } from "@/domain/spydr/utils/types";
import { cn } from "@/lib/utils";

interface ActiveNoteProjectBrowserProps {
  projects: ProjectNode[];
  tasks: TaskNode[];
  selectedProjectId: string | null;
  loading?: boolean;
  disabled?: boolean;
  onSelectProject(projectId: string | null): void;
}

function groupOpenTasksByProjectId(tasks: TaskNode[]) {
  const map = new Map<string, TaskNode[]>();
  for (const task of tasks) {
    const projectId = task.project?.id;
    if (!projectId || !isOpenTask(task)) continue;
    const list = map.get(projectId) ?? [];
    list.push(task);
    map.set(projectId, list);
  }
  for (const list of map.values()) {
    list.sort(
      (left, right) =>
        (left.sortOrder ?? 0) - (right.sortOrder ?? 0) ||
        left.title.localeCompare(right.title)
    );
  }
  return map;
}

export function ActiveNoteProjectBrowser({
  projects,
  tasks,
  selectedProjectId,
  loading = false,
  disabled = false,
  onSelectProject,
}: ActiveNoteProjectBrowserProps) {
  const [panelOpen, setPanelOpen] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const activeProjects = useMemo(
    () =>
      projects
        .filter((project) => !isClosedCollectionStatus(project.status))
        .slice()
        .sort((left, right) => left.title.localeCompare(right.title)),
    [projects]
  );

  const openTasksByProjectId = useMemo(
    () => groupOpenTasksByProjectId(tasks),
    [tasks]
  );

  const selectedProject = activeProjects.find(
    (project) => project.id === selectedProjectId
  );

  function toggleExpanded(projectId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }

  function handleSelectProject(projectId: string) {
    if (disabled) return;
    onSelectProject(selectedProjectId === projectId ? null : projectId);
  }

  if (!panelOpen) {
    return (
      <aside className="flex w-11 shrink-0 flex-col items-center border-r border-border/70 bg-muted/10 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => setPanelOpen(true)}
          aria-label="Show projects"
          title="Show projects"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
        {selectedProject ? (
          <span
            className="mt-3 max-h-40 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-highlight"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            title={selectedProject.title}
          >
            {selectedProject.title}
          </span>
        ) : (
          <span
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Projects
          </span>
        )}
      </aside>
    );
  }

  return (
    <aside className="flex w-[17.5rem] shrink-0 flex-col border-r border-border/70 bg-muted/[0.07]">
      <div className="flex items-start justify-between gap-2 border-b border-border/60 px-3 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Projects
          </p>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
            Active work while you write. Select one to link this note.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground"
          onClick={() => setPanelOpen(false)}
          aria-label="Hide projects"
          title="Hide projects"
        >
          <PanelLeftClose className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="border-b border-border/50 px-3 py-2">
        <button
          type="button"
          onClick={() => onSelectProject(null)}
          disabled={disabled}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors",
            selectedProjectId == null
              ? "bg-highlight/10 text-foreground"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            disabled && "pointer-events-none opacity-60"
          )}
        >
          <span
            className={cn(
              "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
              selectedProjectId == null
                ? "border-highlight bg-highlight"
                : "border-border"
            )}
            aria-hidden
          >
            {selectedProjectId == null ? (
              <span className="h-1 w-1 rounded-full bg-background" />
            ) : null}
          </span>
          No project
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <p className="px-2 py-3 text-[12px] text-muted-foreground">
            Loading projects…
          </p>
        ) : activeProjects.length === 0 ? (
          <p className="px-2 py-3 text-[12px] text-muted-foreground">
            No active projects yet.
          </p>
        ) : (
          <ul className="space-y-0.5" role="listbox" aria-label="Active projects">
            {activeProjects.map((project) => {
              const openTasks = openTasksByProjectId.get(project.id) ?? [];
              const selected = selectedProjectId === project.id;
              const expanded = expandedIds.has(project.id);
              const canExpand = openTasks.length > 0;

              return (
                <li key={project.id}>
                  <div
                    className={cn(
                      "rounded-md transition-colors",
                      selected && "bg-highlight/[0.07] ring-1 ring-highlight/30"
                    )}
                  >
                    <div className="flex items-stretch gap-0.5">
                      <button
                        type="button"
                        className={cn(
                          "flex w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
                          canExpand
                            ? "hover:bg-muted/50 hover:text-foreground"
                            : "opacity-30"
                        )}
                        onClick={() => {
                          if (canExpand) toggleExpanded(project.id);
                        }}
                        disabled={!canExpand}
                        aria-label={
                          expanded
                            ? `Collapse tasks for ${project.title}`
                            : `Expand tasks for ${project.title}`
                        }
                        aria-expanded={expanded}
                      >
                        {expanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={disabled}
                        onClick={() => handleSelectProject(project.id)}
                        className={cn(
                          "flex min-w-0 flex-1 items-start gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors",
                          !selected && "hover:bg-muted/35",
                          disabled && "pointer-events-none opacity-60"
                        )}
                      >
                        <StatusDot
                          status={project.status}
                          className="mt-1.5 shrink-0"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium leading-snug text-foreground">
                            {project.title}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            {project.area ? (
                              <span className="truncate">{project.area}</span>
                            ) : (
                              <span>Project</span>
                            )}
                            <span aria-hidden>·</span>
                            <span className="tabular-nums">
                              {openTasks.length} open
                            </span>
                          </span>
                        </span>
                      </button>
                    </div>

                    {expanded && canExpand ? (
                      <ul className="mb-1.5 ml-7 space-y-0.5 border-l border-border/60 pl-2.5 pr-1">
                        {openTasks.map((task) => (
                          <li key={task.id}>
                            <Link
                              to={`/tasks/${task.id}`}
                              className="block truncate rounded px-1.5 py-1 text-[12px] text-foreground/80 transition-colors hover:bg-muted/40 hover:text-highlight"
                              title={task.title}
                            >
                              {task.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedProject ? (
        <div className="border-t border-border/60 px-3 py-2.5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Linked to
          </p>
          <p className="mt-0.5 truncate text-[12.5px] font-medium text-foreground">
            {selectedProject.title}
          </p>
        </div>
      ) : null}
    </aside>
  );
}
