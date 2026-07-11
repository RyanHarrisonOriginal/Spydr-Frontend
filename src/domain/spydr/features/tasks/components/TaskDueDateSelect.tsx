import { DatePicker } from "@/components/ui/date-picker";

interface TaskDueDateSelectProps {
  value: string | null | undefined;
  onChange(dueDate: string | null): void;
  disabled?: boolean;
  className?: string;
}

export function TaskDueDateSelect({
  value,
  onChange,
  disabled = false,
  className,
}: TaskDueDateSelectProps) {
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      variant="compact"
      placeholder="No due date"
      ariaLabel="Task due date"
      panelLabel="Due date"
      clearLabel="Clear due date"
    />
  );
}
