import { useMemo, useState } from "react";

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

export function useProjectListColumns() {
  const [visibleColumns, setVisibleColumns] = useState<ProjectColumnId[]>(
    defaultVisibleColumns
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
