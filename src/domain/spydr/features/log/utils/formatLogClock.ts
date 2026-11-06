/** Clock column: "9:19 pm". */
export function formatLogClock(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
    .format(date)
    .toLowerCase();
}

/** Compact relative edit age: "31m ago", "2h ago", "3d ago". */
export function formatEditedAgo(
  createdAt: string,
  updatedAt: string,
  now = Date.now()
): string | null {
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();
  if (Number.isNaN(created) || Number.isNaN(updated)) return null;
  // Ignore sub-second / save-jitter differences
  if (updated - created < 2_000) return null;

  const seconds = Math.max(0, Math.floor((now - updated) / 1000));
  if (seconds < 45) return "just now";
  if (seconds < 90) return "1m ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
