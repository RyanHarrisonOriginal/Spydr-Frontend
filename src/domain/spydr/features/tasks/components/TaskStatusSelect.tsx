import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { ProjectListFieldSelect } from "@/domain/spydr/features/projects/components/ProjectListFieldSelect";
import { taskStatuses, taskStatusLabels } from "@/domain/spydr/utils/taskStatus";
import { cn } from "@/lib/utils";

const statusSurface: Record<string, string> = {
  active:
    "border-[hsl(var(--status-active)/0.35)] bg-[hsl(var(--status-active)/0.08)]",
  waiting:
    "border-[hsl(var(--status-doing)/0.35)] bg-[hsl(var(--status-doing)/0.08)]",
  blocked:
    "border-[hsl(var(--status-blocked)/0.35)] bg-[hsl(var(--status-blocked)/0.08)]",
  completed:
    "border-[hsl(var(--status-done)/0.35)] bg-[hsl(var(--status-done)/0.08)]",
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
  onChange(status: string): void;
  disabled?: boolean;
  className?: string;
}

export function TaskStatusSelect({
  value,
  onChange,
  disabled = false,
  className,
}: TaskStatusSelectProps) {
  const options = taskStatuses.map((status) => ({
    value: status,
    label: taskStatusLabels[status],
  }));

  return (
    <ProjectListFieldSelect
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      ariaLabel="Task status"
      menuLabel="Status"
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
  );
}
