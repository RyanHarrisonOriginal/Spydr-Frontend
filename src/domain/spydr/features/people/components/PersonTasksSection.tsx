import { Link } from "react-router-dom";
import type { TaskNode } from "@/domain/spydr/utils/types";
import { formatShortDate } from "@/domain/spydr/features/shared/components/time";
import {
  ProjectDetailSection,
  ProjectDetailSectionBody,
  ProjectDetailSectionHeader,
} from "@/domain/spydr/features/projects/components/ProjectDetailSection";
import { TaskStatusSelect } from "@/domain/spydr/features/tasks/components/TaskStatusSelect";
import { isOpenTask } from "@/domain/spydr/utils/personWork";

interface PersonTasksSectionProps {
  tasks: TaskNode[];
}

export function PersonTasksSection({ tasks }: PersonTasksSectionProps) {
  const openTasks = tasks.filter(isOpenTask);
  const closedTasks = tasks.filter((task) => !isOpenTask(task));

  return (
    <ProjectDetailSection>
      <ProjectDetailSectionHeader
        label="Tasks"
        hint={
          tasks.length > 0
            ? `${openTasks.length} open · ${tasks.length} total`
            : "No assigned tasks"
        }
      />
      <ProjectDetailSectionBody>
        {tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/80 px-4 py-8 text-center text-[13px] text-muted-foreground">
            No tasks are assigned to this person yet.
          </div>
        ) : (
          <div className="space-y-4">
            {openTasks.length > 0 ? (
              <TaskGroup label="Open" tasks={openTasks} />
            ) : null}
            {closedTasks.length > 0 ? (
              <TaskGroup label="Closed" tasks={closedTasks} muted />
            ) : null}
          </div>
        )}
      </ProjectDetailSectionBody>
    </ProjectDetailSection>
  );
}

function TaskGroup({
  label,
  tasks,
  muted = false,
}: {
  label: string;
  tasks: TaskNode[];
  muted?: boolean;
}) {
  return (
    <div className={muted ? "opacity-80" : undefined}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 shadow-sm"
          >
            <TaskStatusSelect
              value={task.status}
              disabled
              className="w-[108px] shrink-0 opacity-90"
              onChange={() => undefined}
            />
            <div className="min-w-0 flex-1">
              <Link
                to={`/tasks/${task.id}`}
                className="block truncate text-[13px] hover:text-primary"
              >
                {task.title}
              </Link>
              {task.project ? (
                <Link
                  to={`/projects/${task.project.id}`}
                  className="mt-0.5 block truncate text-[11px] text-muted-foreground hover:text-foreground"
                >
                  {task.project.title}
                </Link>
              ) : null}
            </div>
            <span className="w-20 shrink-0 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
              {formatShortDate(task.details?.dueDate)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
