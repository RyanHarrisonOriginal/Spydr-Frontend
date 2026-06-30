import { useMemo } from "react";
import { usePersistentState } from "@/domain/spydr/features/shared/hooks/usePersistentState";

export const optionalProjectColumns = [
  { id: "area", label: "Area", width: "128px" },
  { id: "assignee", label: "Assignee", width: "148px" },
  { id: "priority", label: "Priority", width: "96px" },
  { id: "status", label: "Status", width: "112px" },
  { id: "target", label: "Target", width: "96px" },
  { id: "updated", label: "Updated", width: "128px" },
] as const;

export type ProjectColumnId = (typeof optionalProjectColumns)[number]["id"];

const defaultVisibleColumns = optionalProjectColumns.map((column) => column.id);
const validColumnIds = new Set<string>(defaultVisibleColumns);

function sanitizeColumns(
  raw: unknown,
  fallback: ProjectColumnId[]
): ProjectColumnId[] {
  if (!Array.isArray(raw)) return fallback;
  const cleaned = raw.filter(
    (entry): entry is ProjectColumnId =>
      typeof entry === "string" && validColumnIds.has(entry)
  );
  return cleaned;
}

export function useProjectListColumns() {
  const [visibleColumns, setVisibleColumns] = usePersistentState<ProjectColumnId[]>(
    "collection-columns:projects",
    () => defaultVisibleColumns,
    sanitizeColumns
  );

  const visibleColumnSet = useMemo(
    () => new Set<ProjectColumnId>(visibleColumns),
    [visibleColumns]
  );

  const toggleColumn = (columnId: ProjectColumnId) => {
    setVisibleColumns((current) =>
      current.includes(columnId)
        ? current.filter((id) => id !== columnId)
        : [...current, columnId]
    );
  };

  return {
    columns: optionalProjectColumns,
    visibleColumns,
    visibleColumnSet,
    toggleColumn,
  };
}
