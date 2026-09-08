import { DatePicker } from "@/components/ui/date-picker";

interface ProjectTargetDateSelectProps {
  value: string | null | undefined;
  onChange(targetDate: string | null): void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showChevron?: boolean;
  showIcon?: boolean;
}

export function ProjectTargetDateSelect({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "No target",
  showChevron = true,
  showIcon = true,
}: ProjectTargetDateSelectProps) {
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
      ariaLabel="Project target date"
      panelLabel="Target date"
      clearLabel="Clear target"
    />
  );
}
