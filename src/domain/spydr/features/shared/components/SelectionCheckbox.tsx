import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SelectionCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label: string;
  className?: string;
  onChange(checked: boolean): void;
}

export function SelectionCheckbox({
  checked,
  indeterminate = false,
  disabled = false,
  label,
  className,
  onChange,
}: SelectionCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        className="h-3.5 w-3.5 accent-primary"
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => {
          event.stopPropagation();
          onChange(event.target.checked);
        }}
      />
    </label>
  );
}
