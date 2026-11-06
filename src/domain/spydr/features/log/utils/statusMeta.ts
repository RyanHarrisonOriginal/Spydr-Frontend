import type { MetaPart } from "../types";

const DEFAULT_STATUS = "active";

/** Status colors for log meta dots — only non-default statuses are shown. */
const STATUS_DOT: Record<string, string> = {
  active: "var(--active)",
  waiting: "var(--warn)",
  blocked: "var(--danger)",
  completed: "#4A5058",
  inactive: "#4A5058",
  snoozed: "#4A5058",
  archived: "#4A5058",
  // Spec names (not in schema today) — reserved if they appear in data
  decided: "var(--active)",
  proposed: "var(--warn)",
  reversed: "#4A5058",
  superseded: "#4A5058",
};

export function statusMetaPart(
  status: string | null | undefined
): MetaPart | null {
  if (!status || status === DEFAULT_STATUS) return null;
  return {
    kind: "status",
    status,
    label: status.replace(/_/g, " "),
    color: STATUS_DOT[status] ?? "#5C626B",
  };
}
