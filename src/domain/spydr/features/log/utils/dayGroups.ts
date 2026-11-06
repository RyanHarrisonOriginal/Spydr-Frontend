export interface LogDayGroup<T> {
  id: string;
  label: string;
  items: T[];
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayOffset(from: Date, to: Date): number {
  const ms = startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function formatDayGroupLabel(value: string, now = new Date()): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const offset = dayOffset(date, now);
  if (offset === 0) return "Today";
  if (offset === 1) return "Yesterday";

  const sameYear = date.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date);
}

function dayKey(value: string, now = new Date()): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  const offset = dayOffset(date, now);
  if (offset === 0) return "today";
  if (offset === 1) return "yesterday";
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** Group items by local calendar day of `getTimestamp`, newest days first. */
export function groupLogByDay<T>(
  items: T[],
  getTimestamp: (item: T) => string,
  now = new Date()
): LogDayGroup<T>[] {
  const groups: LogDayGroup<T>[] = [];
  const indexByKey = new Map<string, number>();

  for (const item of items) {
    const stamp = getTimestamp(item);
    const key = dayKey(stamp, now);
    const existing = indexByKey.get(key);
    if (existing !== undefined) {
      groups[existing].items.push(item);
      continue;
    }
    indexByKey.set(key, groups.length);
    groups.push({
      id: key,
      label: formatDayGroupLabel(stamp, now),
      items: [item],
    });
  }

  return groups;
}
