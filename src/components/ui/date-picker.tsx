import { forwardRef, useState } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";
import { MonthCalendarPicker } from "@/components/ui/month-calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatShortDate } from "@/domain/spydr/features/shared/components/time";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string | null;
  onChange(value: string | null): void;
  disabled?: boolean;
  className?: string;
  id?: string;
  placeholder?: string;
  ariaLabel?: string;
  panelLabel?: string;
  clearLabel?: string;
  allowClear?: boolean;
  variant?: "field" | "compact";
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      value,
      onChange,
      disabled = false,
      className,
      id,
      placeholder = "Select date",
      ariaLabel = "Date",
      panelLabel = "Date",
      clearLabel = "Clear date",
      allowClear = true,
      variant = "field",
    },
    ref
  ) {
  const [open, setOpen] = useState(false);
  const hasValue = Boolean(value);
  const displayLabel = hasValue ? formatShortDate(value) : placeholder;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          ref={ref}
          id={id}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          className={cn(
            "flex w-full min-w-0 items-center gap-1.5 rounded-md border transition-colors",
            "border-border/80 bg-background hover:border-border hover:bg-muted/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=open]:border-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-primary/15",
            variant === "field" &&
              "h-8 border-input px-2.5 text-[13px] ring-focus",
            variant === "compact" &&
              "h-7 border-border/80 bg-background/50 px-2 text-[11px]",
            !hasValue && variant === "compact" && "border-dashed bg-muted/20",
            !hasValue && variant === "field" && "text-muted-foreground",
            className
          )}
        >
          <Calendar
            className={cn(
              "shrink-0",
              variant === "field" ? "h-3.5 w-3.5" : "h-3 w-3",
              hasValue ? "text-foreground/70" : "text-muted-foreground/60"
            )}
            aria-hidden
          />
          <span
            className={cn(
              "min-w-0 flex-1 truncate leading-none",
              variant === "compact" && "text-right font-mono tabular-nums",
              hasValue
                ? variant === "compact"
                  ? "text-foreground/90"
                  : "text-foreground"
                : variant === "compact"
                  ? "italic text-muted-foreground"
                  : "text-muted-foreground"
            )}
          >
            {displayLabel}
          </span>
          <ChevronDown
            className={cn(
              "h-3 w-3 shrink-0 text-muted-foreground/70 transition-transform",
              open && "rotate-180 text-foreground"
            )}
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="z-[120] w-[15.5rem] border-border/90 bg-popover p-2 shadow-lg"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <p className="px-0.5 pb-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          {panelLabel}
        </p>

        <MonthCalendarPicker
          value={value}
          onSelect={(next) => {
            onChange(next);
            setOpen(false);
          }}
        />

        {allowClear && hasValue ? (
          <>
            <DropdownMenuSeparator className="my-2 bg-border/70" />
            <DropdownMenuItem
              onSelect={() => {
                onChange(null);
                setOpen(false);
              }}
              className="cursor-pointer gap-2 text-[11px] text-muted-foreground focus:text-foreground"
            >
              <X className="h-3 w-3" aria-hidden />
              {clearLabel}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
