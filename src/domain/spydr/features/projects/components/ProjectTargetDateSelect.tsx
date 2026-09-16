import { DatePicker } from "@/components/ui/date-picker";

interface ProjectTargetDateSelectProps {
  value: string | null | undefined;
  onChange(targetDate: string | null): void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showChevron?: boolean;
  showIcon?: boolean;
  fitContent?: boolean;
}

export function ProjectTargetDateSelect({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "No target",
  showChevron = true,
  showIcon = true,
  fitContent = false,
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
      fitContent={fitContent}
      ariaLabel="Project target date"
      panelLabel="Target date"
      clearLabel="Clear target"
    />
  );
}
