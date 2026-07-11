import { DatePicker } from "@/components/ui/date-picker";

interface ProjectTargetDateSelectProps {
  value: string | null | undefined;
  onChange(targetDate: string | null): void;
  disabled?: boolean;
  className?: string;
}

export function ProjectTargetDateSelect({
  value,
  onChange,
  disabled = false,
  className,
}: ProjectTargetDateSelectProps) {
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      variant="compact"
      placeholder="No target"
      ariaLabel="Project target date"
      panelLabel="Target date"
      clearLabel="Clear target"
    />
  );
}
