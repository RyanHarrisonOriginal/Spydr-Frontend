import { formatDistanceToNow } from "date-fns";
import { parseCalendarDate } from "@/domain/spydr/utils/dateOnly";

export function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return "No date";

  const date = parseCalendarDate(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatMediumDate(value: string | null | undefined): string {
  if (!value) return "No date";

  const date = parseCalendarDate(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function calendarDayOffset(from: Date, to: Date): number {
  const ms = startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

/** Compact list date in the Apple Notes / Bear style. */
export function formatNoteListDate(
  value: string | null | undefined,
  now = new Date()
): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const offset = calendarDayOffset(date, now);
  if (offset === 0) {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
  if (offset === 1) return "Yesterday";
  if (offset > 1 && offset < 7) {
    return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
  }
  if (date.getFullYear() === now.getFullYear()) {
    return formatShortDate(value);
  }
  return formatMediumDate(value);
}

/** Absolute date + time for completed timestamps and similar. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
