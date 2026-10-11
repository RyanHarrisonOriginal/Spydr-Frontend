import type { FittedTrack } from "@/domain/spydr/features/shared/utils/fitGridTracks";
import type { ProjectColumnId } from "../hooks/useProjectListColumns";

export type ProjectListWidthColumn = "name" | ProjectColumnId;

export const PROJECT_LIST_COLUMN_DEFAULTS: Record<ProjectListWidthColumn, number> = {
  name: 320,
  area: 148,
  requester: 180,
  assignee: 180,
  priority: 132,
  status: 160,
  target: 112,
  updated: 128,
};

export const PROJECT_LIST_COLUMN_MIN: Partial<Record<ProjectListWidthColumn, number>> = {
  name: 112,
  area: 96,
  requester: 96,
  assignee: 96,
  priority: 88,
  status: 104,
  target: 88,
  updated: 88,
};

export const PROJECT_LIST_PADDING_X = 32;
export const PROJECT_ACTIONS_COLUMN_WIDTH = 48;
export const PROJECT_ACTIONS_COLUMN_WIDTH_WITH_CREATE = 76;
export const PROJECT_RANK_COLUMN_WIDTH = 36;
export const PROJECT_EXPAND_COLUMN_WIDTH = 32;
export const PROJECT_REORDER_COLUMN_WIDTH = 52;

export function buildProjectTracks(
  visibleColumns: ProjectColumnId[],
  widths: Record<ProjectListWidthColumn, number>,
  reorderEnabled = false,
  showCreateTask = false
): Array<FittedTrack & { id: string }> {
  const actionWidth = showCreateTask
    ? PROJECT_ACTIONS_COLUMN_WIDTH_WITH_CREATE
    : PROJECT_ACTIONS_COLUMN_WIDTH;
  const minOf = (column: ProjectListWidthColumn) =>
    PROJECT_LIST_COLUMN_MIN[column] ?? 80;
  return [
    ...(reorderEnabled
      ? [
          {
            id: "reorder",
            preferred: PROJECT_REORDER_COLUMN_WIDTH,
            min: PROJECT_REORDER_COLUMN_WIDTH,
          },
        ]
      : []),
    {
      id: "expand",
      preferred: PROJECT_EXPAND_COLUMN_WIDTH,
      min: PROJECT_EXPAND_COLUMN_WIDTH,
    },
    {
      id: "rank",
      preferred: PROJECT_RANK_COLUMN_WIDTH,
      min: PROJECT_RANK_COLUMN_WIDTH,
    },
    { id: "name", preferred: widths.name, min: minOf("name"), flexible: true },
    ...visibleColumns.map((id) => ({
      id,
      preferred: widths[id],
      min: minOf(id),
    })),
    { id: "actions", preferred: actionWidth, min: actionWidth },
  ];
}
