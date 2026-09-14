import { DatePicker } from "@/components/ui/date-picker";
import { useEnsureTaskDueWithinProject } from "../hooks/useEnsureTaskDueWithinProject";
import type { TaskDueProjectRef } from "../hooks/useEnsureTaskDueWithinProject";

interface TaskDueDateSelectProps {
  value: string | null | undefined;
  onChange(dueDate: string | null): void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showChevron?: boolean;
  showIcon?: boolean;
  variant?: "field" | "compact";
  id?: string;
  project?: TaskDueProjectRef | null;
}

export function TaskDueDateSelect({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "No due date",
  showChevron = true,
  showIcon = true,
  variant = "compact",
  id,
  project,
}: TaskDueDateSelectProps) {
  const dueGuard = useEnsureTaskDueWithinProject();

  return (
    <>
      <DatePicker
        id={id}
        value={value}
        onChange={(dueDate) => {
          dueGuard.ensure({
            project,
            dueDate,
            onAllowed: () => onChange(dueDate),
          });
        }}
        disabled={disabled}
        className={className}
        variant={variant}
        placeholder={placeholder}
        showChevron={showChevron}
        showIcon={showIcon}
        highlightAfter={project?.details?.targetDate}
        ariaLabel="Task due date"
        panelLabel="Due date"
        clearLabel="Clear due date"
      />
      {dueGuard.dialog}
    </>
  );
}
