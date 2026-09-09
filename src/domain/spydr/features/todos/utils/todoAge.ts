/** Compact age labels for todo membership. */
export function formatTodoAgeHours(hours: number, style: "short" | "long" = "short"): string {
  if (style === "long") {
    if (hours < 1) return "just now";
    if (hours === 1) return "1 hour on list";
    if (hours < 24) return `${hours} hours on list`;
    const days = Math.floor(hours / 24);
    const rem = hours % 24;
    if (rem === 0) return `${days}d on list`;
    return `${days}d ${rem}h on list`;
  }

  if (hours < 1) return "<1h";
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return rem === 0 ? `${days}d` : `${days}d${rem}h`;
}

export function formatTodoNoteTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
