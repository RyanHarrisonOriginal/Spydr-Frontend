import { useState } from "react";
import { format } from "date-fns";
import { PersonSelect } from "@/domain/spydr/features/projects/components/PersonSelect";
import { ProjectPrioritySelect } from "@/domain/spydr/features/projects/components/ProjectPrioritySelect";
import { ProjectSelect } from "@/domain/spydr/features/projects/components/ProjectSelect";
import { dueFromValue } from "@/domain/spydr/features/work/components/WorkDueDisplay";
import { parseCalendarDate } from "@/domain/spydr/utils/dateOnly";
import type {
  PersonNode,
  ProjectNode,
  SpydrPriority,
} from "@/domain/spydr/utils/types";
import {
  isTaskStatus,
  type TaskStatusChange,
} from "@/domain/spydr/utils/taskStatus";
import { cn } from "@/lib/utils";
import type { TaskDetailFormValues } from "../hooks/useTaskDetailPage";
import { TaskDueDateSelect } from "./TaskDueDateSelect";
import { TaskStatusSelect } from "./TaskStatusSelect";

const propTriggerClass =
  "project-detail-prop-trigger h-auto min-h-0 w-full justify-start border-0 bg-transparent px-0 shadow-none hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:ring-0";

interface TaskDetailPropertiesProps {
  form: TaskDetailFormValues;
  projects: ProjectNode[];
  people: PersonNode[];
  createdAt: string;
  updatedAt: string;
  excludeTaskId: string;
  onFieldChange<TField extends keyof TaskDetailFormValues>(
    field: TField,
    value: TaskDetailFormValues[TField]
  ): void;
  onStatusChange(change: TaskStatusChange): void;
  onProjectChange(projectId: string | null): void;
}

function PropRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="project-detail-prop-row">
      <span className="project-detail-prop-label">{label}</span>
      <div className="project-detail-prop-value">{children}</div>
    </div>
  );
}

function formatEstimateMinutes(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const minutes = Number(trimmed);
  if (!Number.isFinite(minutes) || minutes < 0) return null;
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const rem = Math.round(minutes % 60);
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}

function formatStamp(value: string | null | undefined, prefix: string): string {
  if (!value) return "";
  const date = parseCalendarDate(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${prefix} ${format(date, "MMM d").toLowerCase()}`;
}

function formatUpdatedLabel(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 60) return `Updated ${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `Updated ${days}d ago`;
  return `Updated ${format(date, "MMM d").toLowerCase()}`;
}

export function TaskDetailProperties({
  form,
  projects,
  people,
  createdAt,
  updatedAt,
  excludeTaskId,
  onFieldChange,
  onStatusChange,
  onProjectChange,
}: TaskDetailPropertiesProps) {
  const [editingEstimate, setEditingEstimate] = useState(false);
  const selectedProject =
    projects.find((project) => project.id === form.projectNodeId) ?? null;
  const due = dueFromValue(form.dueDate || null);
  const priorityIsDefault = form.priority === "medium";
  const estimateLabel = formatEstimateMinutes(form.estimatedMinutes);
  const statusValue = isTaskStatus(form.status) ? form.status : "active";

  return (
    <aside className="project-detail-props project-detail-panel task-detail-props">
      <h2 className="project-detail-props-heading">Properties</h2>

      <div className="project-detail-props-group">
        <PropRow label="Status">
          <TaskStatusSelect
            value={statusValue}
            excludeTaskId={excludeTaskId}
            onChange={onStatusChange}
            quiet
            fitContent
            className={propTriggerClass}
          />
        </PropRow>
        <PropRow label="Priority">
          <ProjectPrioritySelect
            value={form.priority}
            onChange={(priority) =>
              onFieldChange("priority", priority as SpydrPriority)
            }
            quiet
            fitContent
            ariaLabel="Task priority"
            className={cn(
              propTriggerClass,
              priorityIsDefault && "project-detail-prop-muted"
            )}
          />
        </PropRow>
        <PropRow label="Project">
          <ProjectSelect
            projects={projects}
            value={form.projectNodeId}
            allowUnassigned
            fitContent
            compact
            onChange={onProjectChange}
            className={cn(
              propTriggerClass,
              !form.projectNodeId && "project-detail-prop-empty"
            )}
          />
        </PropRow>
      </div>

      <hr className="project-detail-props-divider" />

      <div className="project-detail-props-group">
        <PropRow label="Due">
          <div className="flex min-w-0 flex-wrap items-baseline gap-2">
            <TaskDueDateSelect
              value={form.dueDate || null}
              onChange={(dueDate) => onFieldChange("dueDate", dueDate ?? "")}
              variant="compact"
              showChevron={false}
              showIcon={false}
              placeholder="Set date"
              project={selectedProject}
              fitContent
              className={cn(
                propTriggerClass,
                "project-detail-prop-mono",
                !form.dueDate && "project-detail-prop-empty"
              )}
            />
            {form.dueDate && due.overdue ? (
              <span className="project-detail-meta-late font-mono text-[12px]">
                {due.label}
              </span>
            ) : null}
          </div>
        </PropRow>
        <PropRow label="Estimate">
          {editingEstimate ? (
            <input
              type="number"
              min={0}
              autoFocus
              value={form.estimatedMinutes}
              onChange={(event) =>
                onFieldChange("estimatedMinutes", event.target.value)
              }
              onBlur={() => setEditingEstimate(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "Escape") {
                  event.preventDefault();
                  setEditingEstimate(false);
                }
              }}
              placeholder="minutes"
              aria-label="Estimate in minutes"
              className="w-full border-0 bg-transparent font-mono text-[12px] text-[var(--fg)] outline-none"
            />
          ) : (
            <button
              type="button"
              className={cn(
                propTriggerClass,
                "text-left",
                estimateLabel
                  ? "project-detail-prop-mono"
                  : "project-detail-prop-empty"
              )}
              onClick={() => setEditingEstimate(true)}
            >
              {estimateLabel ?? "Set estimate"}
            </button>
          )}
        </PropRow>
      </div>

      <hr className="project-detail-props-divider" />

      <div className="project-detail-props-group">
        <PropRow label="Assignee">
          <PersonSelect
            people={people}
            value={form.assigneePersonNodeId || null}
            compact
            fitContent
            ariaLabel="Task assignee"
            className="w-full"
            triggerClassName={cn(
              propTriggerClass,
              !form.assigneePersonNodeId && "project-detail-prop-empty"
            )}
            onChange={(personNodeId) =>
              onFieldChange("assigneePersonNodeId", personNodeId ?? "")
            }
          />
        </PropRow>
      </div>

      <div className="task-detail-props-footer">
        <span>{formatStamp(createdAt, "Created")}</span>
        <span>{formatUpdatedLabel(updatedAt)}</span>
      </div>
    </aside>
  );
}
