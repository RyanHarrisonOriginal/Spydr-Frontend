import { Link } from "react-router-dom";
import type { TaskGroup } from "../hooks/useTasksPage";
import { TaskStatusSelect } from "./TaskStatusSelect";
import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import { formatShortDate } from "@/domain/spydr/features/shared/components/time";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import type { ProjectNode } from "@/domain/spydr/utils/types";
import { cn } from "@/lib/utils";

const rowGridClassName =
  "grid grid-cols-[112px_minmax(0,1fr)_minmax(0,11rem)_72px_80px] items-center gap-3";

interface TaskGroupsProps {
  groups: TaskGroup[];
  projects: ProjectNode[];
  updatingTaskId?: string | null;
  onStatusChange(taskId: string, status: string): void;
  onProjectChange(taskId: string, projectNodeId: string | null): void;
}

export function TaskGroups({
  groups,
  projects,
  updatingTaskId = null,
  onStatusChange,
  onProjectChange,
}: TaskGroupsProps) {
  return (
    <div>
      <div
        className={cn(
          rowGridClassName,
          "border-b border-border bg-muted/30 px-6 py-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
        )}
      >
        <span>Status</span>
        <span>Task</span>
        <span>Project</span>
        <span className="text-right">Priority</span>
        <span className="text-right">Due</span>
      </div>

      {groups.map((group) => (
        <section key={group.status}>
          <div className="flex items-center gap-2 border-b border-border/80 bg-muted/15 px-6 py-2">
            <StatusDot status={group.status} />
            <span className="text-[12px] font-semibold">{group.label}</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {group.tasks.length}
            </span>
          </div>
          <ul className="divide-y divide-border/80">
            {group.tasks.map((task) => {
              const isUpdating = updatingTaskId === task.id;
              const projectId = task.project?.id ?? "";

              return (
                <li
                  key={task.id}
                  className={cn(rowGridClassName, "px-6 py-2.5 row-hover")}
                >
                  <TaskStatusSelect
                    value={task.status}
                    disabled={isUpdating}
                    className="w-full"
                    onChange={(status) => {
                      if (status !== task.status) {
                        onStatusChange(task.id, status);
                      }
                    }}
                  />
                  <div className="min-w-0">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="block truncate text-[13px] hover:text-primary"
                    >
                      {task.title}
                    </Link>
                    {task.body ? (
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {task.body}
                      </p>
                    ) : null}
                  </div>
                  <ProjectSelect
                    projects={projects}
                    value={projectId}
                    allowUnassigned
                    compact
                    disabled={isUpdating}
                    className="w-full min-w-0"
                    onChange={(nextProjectId) => {
                      const currentProjectId = task.project?.id ?? null;
                      if (nextProjectId !== currentProjectId) {
                        onProjectChange(task.id, nextProjectId);
                      }
                    }}
                  />
                  <span className="text-right font-mono text-[10px] uppercase text-muted-foreground">
                    {task.priority}
                  </span>
                  <span className="text-right font-mono text-[10px] tabular-nums text-muted-foreground">
                    {formatShortDate(task.details?.dueDate)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
