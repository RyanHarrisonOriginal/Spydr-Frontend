const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const UTC_MIDNIGHT_PATTERN = /^(\d{4}-\d{2}-\d{2})T00:00:00(?:\.\d+)?(?:Z)?$/;

/** Parse a YYYY-MM-DD string as a local calendar date (no timezone shift). */
export function parseDateOnly(value: string): Date | null {
  const match = value.slice(0, 10).match(DATE_ONLY_PATTERN);
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

export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse date-only and UTC-midnight values as local calendar dates.
 * Returns null for values that are not calendar dates (e.g. full timestamps).
 */
export function parseCalendarDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const dateOnly = parseDateOnly(value);
  if (dateOnly) return dateOnly;

  const midnightMatch = value.match(UTC_MIDNIGHT_PATTERN);
  if (midnightMatch) {
    return parseDateOnly(midnightMatch[1]);
  }

  return null;
}
