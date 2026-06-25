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
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function parseDateOnly(value: string): Date | null {
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface MonthCalendarPickerProps {
  value?: string | null;
  onSelect(date: string): void;
  className?: string;
}

export function MonthCalendarPicker({
  value,
  onSelect,
  className,
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
                isTodayDate &&
                  !isSelected &&
                  "border border-border/80 bg-muted/20",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              aria-label={format(day, "MMMM d, yyyy")}
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
