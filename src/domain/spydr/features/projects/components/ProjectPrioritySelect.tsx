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
  ariaLabel?: string;
  menuLabel?: string;
  fitContent?: boolean;
  /** Plain sentence-case trigger — no chip surface or caps. */
  quiet?: boolean;
}

export function ProjectPrioritySelect({
  value,
  onChange,
  disabled = false,
  className,
  ariaLabel = "Project priority",
  menuLabel = "Priority",
  fitContent = false,
  quiet = false,
}: ProjectPrioritySelectProps) {
  const options = projectPriorities.map((priority) => ({
    value: priority,
    label: quiet
      ? priority.charAt(0).toUpperCase() + priority.slice(1)
      : priority,
  }));

  return (
    <ProjectListFieldSelect
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      ariaLabel={ariaLabel}
      menuLabel={quiet ? undefined : menuLabel}
      fitContent={fitContent}
      hideChevron={quiet}
      leading={quiet ? null : <PriorityMarker priority={value} />}
      renderOptionLeading={(option) => <PriorityMarker priority={option.value} />}
      triggerClassName={cn(
        !quiet && prioritySurface[value],
        !quiet && "font-mono uppercase tracking-wider",
        className
      )}
      labelClassName={
        quiet
          ? "normal-case tracking-normal"
          : "font-mono uppercase tracking-wider"
      }
      getOptionClassName={(option, selected) =>
        cn(priorityOptionSurface[option.value], selected && prioritySurface[option.value])
      }
      getOptionLabelClassName={() =>
        quiet ? "normal-case tracking-normal" : "font-mono uppercase tracking-wider"
      }
    />
  );
}
