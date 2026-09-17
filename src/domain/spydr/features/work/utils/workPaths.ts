import {
  isTaskStatus,
  openTaskFilterStatuses,
} from "@/domain/spydr/utils/taskStatus";

export { openTaskFilterStatuses };

export function workPersonPath(personId: string): string {
  return `/work?person=${encodeURIComponent(personId)}`;
}

export function workTasksPath(options?: {
  status?: string | string[];
  due?: "overdue";
  person?: "all" | string;
}): string {
  const params = new URLSearchParams();
  params.set("view", "tasks");
  params.set("person", options?.person ?? "all");
  const statuses = normalizeCsv(options?.status);
  if (statuses.length > 0) params.set("status", statuses.join(","));
  if (options?.due) params.set("due", options.due);
  return `/work?${params.toString()}`;
}

export function parseWorkTaskFilterSelections(
  statusParam: string | null,
  dueParam: string | null
): Record<string, string[]> | null {
  if (statusParam == null && dueParam == null) return null;

  const selections: Record<string, string[]> = {};
  const statuses = normalizeCsv(statusParam).filter(isTaskStatus);
  if (statuses.length > 0) selections.status = statuses;
  if (dueParam === "overdue") selections.due = ["overdue"];
  return Object.keys(selections).length > 0 ? selections : null;
}

function normalizeCsv(value?: string | string[] | null): string[] {
  if (value == null) return [];
  const parts = Array.isArray(value) ? value : value.split(",");
  return parts.map((entry) => entry.trim()).filter((entry) => entry.length > 0);
}
