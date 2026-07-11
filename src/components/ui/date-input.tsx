import * as React from "react";
import { DatePicker, type DatePickerProps } from "@/components/ui/date-picker";

export interface DateInputProps
  extends Omit<
    DatePickerProps,
    "onChange" | "value" | "variant" | "allowClear"
  > {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const DateInput = React.forwardRef<HTMLButtonElement, DateInputProps>(
  ({ value, onChange, className, ...props }, ref) => (
    <DatePicker
      ref={ref}
      value={value || null}
      onChange={(next) =>
        onChange?.({
          target: { value: next ?? "" },
        } as React.ChangeEvent<HTMLInputElement>)
      }
      variant="field"
      className={className}
      {...props}
    />
  )
);
DateInput.displayName = "DateInput";

export { DateInput };
