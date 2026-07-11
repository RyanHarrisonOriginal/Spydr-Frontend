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
