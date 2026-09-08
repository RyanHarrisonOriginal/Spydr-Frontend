import { DatePicker } from "@/components/ui/date-picker";

interface TaskDueDateSelectProps {
  value: string | null | undefined;
  onChange(dueDate: string | null): void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showChevron?: boolean;
  showIcon?: boolean;
}

export function TaskDueDateSelect({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "No due date",
  showChevron = true,
  showIcon = true,
}: TaskDueDateSelectProps) {
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      variant="compact"
      placeholder={placeholder}
      showChevron={showChevron}
      showIcon={showIcon}
      ariaLabel="Task due date"
      panelLabel="Due date"
      clearLabel="Clear due date"
    />
  );
}
