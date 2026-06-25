import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const hasValue = Boolean(value);
  const displayLabel = hasValue ? formatShortDate(value) : "No target";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          aria-label="Project target date"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          className={cn(
            "flex h-7 w-full min-w-0 items-center gap-1.5 rounded-md border px-2",
            "border-border/80 bg-background/50 text-[11px] transition-colors",
            "hover:border-border hover:bg-muted/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=open]:border-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-primary/15",
            !hasValue && "border-dashed bg-muted/20",
            className
          )}
        >
          <Calendar
            className={cn(
              "h-3 w-3 shrink-0",
              hasValue ? "text-foreground/70" : "text-muted-foreground/60"
            )}
            aria-hidden
          />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-right font-mono tabular-nums leading-none",
              hasValue ? "text-foreground/90" : "italic text-muted-foreground"
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
        align="end"
        sideOffset={6}
        className="z-[120] w-[15.5rem] border-border/90 bg-popover p-2 shadow-lg"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <p className="px-0.5 pb-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          Target date
        </p>

        <MonthCalendarPicker
          value={value}
          onSelect={(next) => {
            onChange(next);
            setOpen(false);
          }}
        />

        {hasValue ? (
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
              Clear target
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
