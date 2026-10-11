import type { FittedTrack } from "@/domain/spydr/features/shared/utils/fitGridTracks";

export type TaskListWidthColumn =
  | "status"
  | "title"
  | "project"
  | "assignee"
  | "priority"
  | "due"
  | "updated";

export type TaskOptionalColumn = Exclude<TaskListWidthColumn, "status" | "title">;

export const TASK_OPTIONAL_COLUMNS: readonly TaskOptionalColumn[] = [
  "project",
  "assignee",
  "priority",
  "due",
  "updated",
];

/** Least important first — shed under narrow panes before horizontal scroll. */
export const TASK_COLUMN_DROP_ORDER: readonly TaskOptionalColumn[] = [
  "updated",
  "priority",
  "assignee",
  "project",
  "due",
];

export const TASK_LIST_COLUMN_DEFAULTS: Record<TaskListWidthColumn, number> = {
  status: 148,
  title: 360,
  project: 160,
  assignee: 180,
  priority: 128,
  due: 132,
  updated: 148,
};

export const TASK_LIST_COLUMN_MIN: Partial<Record<TaskListWidthColumn, number>> = {
  status: 104,
  title: 140,
  project: 104,
  assignee: 96,
  priority: 88,
  due: 88,
  updated: 88,
};

export const TASK_LIST_PADDING_X = 32;
export const TASK_CHECKBOX_WIDTH = 28;
export const TASK_RANK_WIDTH = 36;
export const TASK_REORDER_WIDTH = 52;
export const TASK_TODAY_WIDTH = 40;
export const TASK_ACTIONS_WIDTH = 72;

export function buildTaskTracks(
  widths: Record<TaskListWidthColumn, number>,
  reorderEnabled: boolean,
  optionalColumns: readonly TaskOptionalColumn[] = TASK_OPTIONAL_COLUMNS
): Array<FittedTrack & { id: string }> {
  const minOf = (column: TaskListWidthColumn) => TASK_LIST_COLUMN_MIN[column] ?? 80;
  const optional = new Set(optionalColumns);
  return [
    ...(reorderEnabled
      ? [{ id: "reorder", preferred: TASK_REORDER_WIDTH, min: TASK_REORDER_WIDTH }]
      : []),
    { id: "select", preferred: TASK_CHECKBOX_WIDTH, min: TASK_CHECKBOX_WIDTH },
    { id: "rank", preferred: TASK_RANK_WIDTH, min: TASK_RANK_WIDTH },
    { id: "status", preferred: widths.status, min: minOf("status") },
    { id: "title", preferred: widths.title, min: minOf("title"), flexible: true },
    ...(optional.has("project")
      ? [{ id: "project", preferred: widths.project, min: minOf("project") }]
      : []),
    ...(optional.has("assignee")
      ? [{ id: "assignee", preferred: widths.assignee, min: minOf("assignee") }]
      : []),
    ...(optional.has("priority")
      ? [{ id: "priority", preferred: widths.priority, min: minOf("priority") }]
      : []),
    ...(optional.has("due")
      ? [{ id: "due", preferred: widths.due, min: minOf("due") }]
      : []),
    ...(optional.has("updated")
      ? [{ id: "updated", preferred: widths.updated, min: minOf("updated") }]
      : []),
    { id: "today", preferred: TASK_TODAY_WIDTH, min: TASK_TODAY_WIDTH },
    { id: "actions", preferred: TASK_ACTIONS_WIDTH, min: TASK_ACTIONS_WIDTH },
  ];
}
