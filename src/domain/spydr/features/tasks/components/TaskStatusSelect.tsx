import { useState } from "react";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { ProjectListFieldSelect } from "@/domain/spydr/features/projects/components/ProjectListFieldSelect";
import {
  isTaskStatus,
  taskStatuses,
  taskStatusLabels,
  type TaskStatus,
  type TaskStatusChange,
} from "@/domain/spydr/utils/taskStatus";
import { cn } from "@/lib/utils";
import { TaskStatusContextDialog } from "./TaskStatusContextDialog";

const statusSurface: Record<string, string> = {
  active:
    "border-[hsl(var(--status-active)/0.12)] bg-[hsl(var(--status-active)/0.08)]",
  waiting:
    "border-[hsl(var(--status-doing)/0.12)] bg-[hsl(var(--status-doing)/0.08)]",
  blocked:
    "border-[hsl(var(--status-blocked)/0.12)] bg-[hsl(var(--status-blocked)/0.08)]",
  completed:
    "border-[hsl(var(--status-done)/0.12)] bg-[hsl(var(--status-done)/0.08)]",
};

const statusOptionSurface: Record<string, string> = {
  active:
    "focus:bg-[hsl(var(--status-active)/0.14)] data-[highlighted]:bg-[hsl(var(--status-active)/0.14)]",
  waiting:
    "focus:bg-[hsl(var(--status-doing)/0.14)] data-[highlighted]:bg-[hsl(var(--status-doing)/0.14)]",
  blocked:
    "focus:bg-[hsl(var(--status-blocked)/0.14)] data-[highlighted]:bg-[hsl(var(--status-blocked)/0.14)]",
  completed:
    "focus:bg-[hsl(var(--status-done)/0.14)] data-[highlighted]:bg-[hsl(var(--status-done)/0.14)]",
};

interface TaskStatusSelectProps {
  value: string;
  onChange(change: TaskStatusChange): void;
  disabled?: boolean;
  className?: string;
  appearance?: "field" | "icon";
  fitContent?: boolean;
  wrapLabel?: boolean;
  excludeTaskId?: string;
  /** When false, blocked and waiting commit immediately so the parent can collect context inline. */
  collectContext?: boolean;
}

export function TaskStatusSelect({
  value,
  onChange,
  disabled = false,
  className,
  appearance = "field",
  fitContent = false,
  wrapLabel = false,
  excludeTaskId,
  collectContext = true,
}: TaskStatusSelectProps) {
  const [pendingStatus, setPendingStatus] = useState<Extract<TaskStatus, "blocked" | "waiting"> | null>(
    null
  );
  const options = taskStatuses.map((status) => ({
    value: status,
    label: taskStatusLabels[status],
  }));

  const handleChange = (next: string) => {
    if (!isTaskStatus(next) || next === value) return;
    if (collectContext && (next === "blocked" || next === "waiting")) {
      setPendingStatus(next);
      return;
    }
    onChange({ status: next });
  };

  return (
    <>
      <ProjectListFieldSelect
        value={value}
        options={options}
        onChange={handleChange}
        disabled={disabled}
        ariaLabel="Task status"
        menuLabel="Status"
        appearance={appearance}
        fitContent={fitContent}
        wrapLabel={wrapLabel}
        leading={<StatusDot status={value} className="shrink-0" />}
        renderOptionLeading={(option) => (
          <StatusDot status={option.value} className="shrink-0" />
        )}
        triggerClassName={cn(statusSurface[value], className)}
        labelClassName="text-foreground/90"
        getOptionClassName={(option, selected) =>
          cn(statusOptionSurface[option.value], selected && statusSurface[option.value])
        }
      />
      {pendingStatus ? (
        <TaskStatusContextDialog
          open
          status={pendingStatus}
          excludeTaskId={excludeTaskId}
          onOpenChange={(open) => {
            if (!open) setPendingStatus(null);
          }}
          onConfirm={(change) => {
            setPendingStatus(null);
            onChange(change);
          }}
        />
      ) : null}
    </>
  );
}
