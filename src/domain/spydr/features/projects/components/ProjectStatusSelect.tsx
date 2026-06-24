import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { projectStatuses } from "@/domain/spydr/utils/projectStatus";
import { cn } from "@/lib/utils";
import { ProjectListFieldSelect } from "./ProjectListFieldSelect";

const statusSurface: Record<string, string> = {
  active:
    "border-[hsl(var(--status-active)/0.35)] bg-[hsl(var(--status-active)/0.08)]",
  inactive: "border-border/80 bg-muted/30",
  waiting:
    "border-[hsl(var(--status-doing)/0.35)] bg-[hsl(var(--status-doing)/0.08)]",
  snoozed:
    "border-[hsl(var(--status-doing)/0.35)] bg-[hsl(var(--status-doing)/0.08)]",
  completed:
    "border-[hsl(var(--status-done)/0.35)] bg-[hsl(var(--status-done)/0.08)]",
  archived: "border-border/80 bg-muted/25",
  blocked:
    "border-[hsl(var(--status-blocked)/0.35)] bg-[hsl(var(--status-blocked)/0.08)]",
};

const statusOptionSurface: Record<string, string> = {
  active:
    "focus:bg-[hsl(var(--status-active)/0.14)] data-[highlighted]:bg-[hsl(var(--status-active)/0.14)]",
  inactive: "focus:bg-muted/50 data-[highlighted]:bg-muted/50",
  waiting:
    "focus:bg-[hsl(var(--status-doing)/0.14)] data-[highlighted]:bg-[hsl(var(--status-doing)/0.14)]",
  snoozed:
    "focus:bg-[hsl(var(--status-doing)/0.14)] data-[highlighted]:bg-[hsl(var(--status-doing)/0.14)]",
  completed:
    "focus:bg-[hsl(var(--status-done)/0.14)] data-[highlighted]:bg-[hsl(var(--status-done)/0.14)]",
  archived: "focus:bg-muted/40 data-[highlighted]:bg-muted/40",
  blocked:
    "focus:bg-[hsl(var(--status-blocked)/0.14)] data-[highlighted]:bg-[hsl(var(--status-blocked)/0.14)]",
};

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

interface ProjectStatusSelectProps {
  value: string;
  onChange(status: string): void;
  disabled?: boolean;
  className?: string;
}

export function ProjectStatusSelect({
  value,
  onChange,
  disabled = false,
  className,
}: ProjectStatusSelectProps) {
  const options = projectStatuses.map((status) => ({
    value: status,
    label: formatStatusLabel(status),
  }));

  return (
    <ProjectListFieldSelect
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      ariaLabel="Project status"
      menuLabel="Status"
      leading={<StatusDot status={value} className="shrink-0" />}
      renderOptionLeading={(option) => <StatusDot status={option.value} className="shrink-0" />}
      triggerClassName={cn(statusSurface[value], className)}
      labelClassName="capitalize text-foreground/90"
      getOptionClassName={(option, selected) =>
        cn(
          statusOptionSurface[option.value],
          selected && statusSurface[option.value]
        )
      }
      getOptionLabelClassName={() => "capitalize"}
    />
  );
}
