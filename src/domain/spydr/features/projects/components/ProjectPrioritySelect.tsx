import { cn } from "@/lib/utils";
import {
  priorityMarker,
  priorityOptionSurface,
  prioritySurface,
  projectPriorities,
} from "@/domain/spydr/utils/projectPriority";
import { ProjectListFieldSelect } from "./ProjectListFieldSelect";

function PriorityMarker({ priority, className }: { priority: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-sm",
        priorityMarker[priority] ?? "bg-muted-foreground",
        className
      )}
      aria-hidden
    />
  );
}

interface ProjectPrioritySelectProps {
  value: string;
  onChange(priority: string): void;
  disabled?: boolean;
  className?: string;
}

export function ProjectPrioritySelect({
  value,
  onChange,
  disabled = false,
  className,
}: ProjectPrioritySelectProps) {
  const options = projectPriorities.map((priority) => ({
    value: priority,
    label: priority,
  }));

  return (
    <ProjectListFieldSelect
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      ariaLabel="Project priority"
      menuLabel="Priority"
      leading={<PriorityMarker priority={value} />}
      renderOptionLeading={(option) => <PriorityMarker priority={option.value} />}
      triggerClassName={cn(
        prioritySurface[value],
        "font-mono uppercase tracking-wider",
        className
      )}
      labelClassName="font-mono uppercase tracking-wider"
      getOptionClassName={(option, selected) =>
        cn(priorityOptionSurface[option.value], selected && prioritySurface[option.value])
      }
      getOptionLabelClassName={() => "font-mono uppercase tracking-wider"}
    />
  );
}
