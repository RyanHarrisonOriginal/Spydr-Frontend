import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseDateOnly, toDateOnlyString } from "@/domain/spydr/utils/dateOnly";
import { cn } from "@/lib/utils";
import { toDateOnlyKey } from "@/domain/spydr/utils/taskDueVsProject";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

export interface MonthCalendarPickerProps {
  value?: string | null;
  onSelect(date: string): void;
  className?: string;
  highlightAfter?: string | null;
}

export function MonthCalendarPicker({
  value,
  onSelect,
  className,
  highlightAfter,
}: MonthCalendarPickerProps) {
  const selected = value ? parseDateOnly(value) : null;
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    () => selected ?? new Date()
  );

  useEffect(() => {
    if (selected) {
      setVisibleMonth(selected);
    }
  }, [value]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const monthEnd = endOfMonth(visibleMonth);
    return eachDayOfInterval({
      start: startOfWeek(monthStart),
      end: endOfWeek(monthEnd),
    });
  }, [visibleMonth]);

  return (
    <div className={cn("select-none", className)}>
      <div className="mb-2 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => setVisibleMonth((current) => subMonths(current, 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="font-mono text-[11px] font-medium tabular-nums text-foreground/90">
          {format(visibleMonth, "MMM yyyy")}
        </span>
        <button
          type="button"
          onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          aria-label="Next month"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="flex h-6 items-center justify-center font-mono text-[9px] uppercase tracking-wide text-muted-foreground"
          >
            {label}
          </div>
        ))}

        {days.map((day) => {
          const inMonth = isSameMonth(day, visibleMonth);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isTodayDate = isToday(day);
          const afterLimit = isAfterHighlight(day, highlightAfter);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect(toDateOnlyString(day))}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md font-mono text-[11px] tabular-nums transition-colors",
                "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                !inMonth && "text-muted-foreground/35",
                inMonth && !isSelected && "text-foreground/85",
                afterLimit &&
                  !isSelected &&
                  "text-amber-700/85 hover:bg-amber-500/15 dark:text-amber-400/90",
                isTodayDate &&
                  !isSelected &&
                  "border border-border/80 bg-muted/20",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              aria-label={
                afterLimit
                  ? `${format(day, "MMMM d, yyyy")} — after project target`
                  : format(day, "MMMM d, yyyy")
              }
              aria-pressed={isSelected}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isAfterHighlight(day: Date, highlightAfter?: string | null): boolean {
  const limit = toDateOnlyKey(highlightAfter);
  if (!limit) return false;
  return toDateOnlyString(day) > limit;
}
