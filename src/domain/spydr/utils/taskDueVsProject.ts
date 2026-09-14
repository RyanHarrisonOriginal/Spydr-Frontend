import { differenceInCalendarDays, startOfToday } from "date-fns";
import { parseCalendarDate } from "@/domain/spydr/utils/dateOnly";

export function toDateOnlyKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = parseCalendarDate(value);
  if (parsed) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const slice = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(slice) ? slice : null;
}

export function isDueAfterProjectTarget(
  dueDate: string | null | undefined,
  projectTargetDate: string | null | undefined
): boolean {
  const due = toDateOnlyKey(dueDate);
  const target = toDateOnlyKey(projectTargetDate);
  if (!due || !target) return false;
  return due > target;
}

export function formatProjectEndRelative(
  targetDate: string | null | undefined
): string | null {
  const date = parseCalendarDate(targetDate ?? "") ?? null;
  if (!date) return null;

  const days = differenceInCalendarDays(date, startOfToday());
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 1) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}
