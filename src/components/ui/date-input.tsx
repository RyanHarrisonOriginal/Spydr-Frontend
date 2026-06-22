import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, ...props }, ref) => (
    <div className="relative min-w-0">
      <input
        ref={ref}
        type="date"
        className={cn("date-input h-8 w-full min-w-0", className)}
        {...props}
      />
      <Calendar
        aria-hidden
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
);
DateInput.displayName = "DateInput";

export { DateInput };
