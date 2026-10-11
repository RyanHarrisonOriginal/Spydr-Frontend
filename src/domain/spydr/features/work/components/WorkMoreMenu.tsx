import { ChevronsDownUp, ChevronsUpDown, Eye, EyeOff, LayoutTemplate, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectColumnId } from "@/domain/spydr/features/projects/hooks/useProjectListColumns";
import { useIsPhone } from "@/hooks/useIsPhone";

interface WorkMoreMenuProps {
  columns?: readonly { id: ProjectColumnId; label: string }[];
  visibleColumnSet?: Set<ProjectColumnId>;
  onToggleColumn?(columnId: ProjectColumnId): void;
  trashCount?: number;
  onOpenTrash?(): void;
  showCompleted?: boolean;
  completedCount?: number;
  onToggleCompleted?(show: boolean): void;
  hierarchyExpanded?: boolean;
  expandDisabled?: boolean;
  onExpandAll?(): void;
  onCollapseAll?(): void;
}

export function WorkMoreMenu({
  columns = [],
  visibleColumnSet = new Set(),
  onToggleColumn,
  trashCount = 0,
  onOpenTrash,
  showCompleted,
  completedCount = 0,
  onToggleCompleted,
  hierarchyExpanded,
  expandDisabled = false,
  onExpandAll,
  onCollapseAll,
}: WorkMoreMenuProps) {
  const isPhone = useIsPhone();
  const navigate = useNavigate();
  const showColumns = !isPhone && columns.length > 0 && Boolean(onToggleColumn);
  const showCompletedItem =
    typeof showCompleted === "boolean" &&
    completedCount > 0 &&
    Boolean(onToggleCompleted);
  const showExpandItem =
    typeof hierarchyExpanded === "boolean" &&
    Boolean(onExpandAll) &&
    Boolean(onCollapseAll);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="More list options"
          className="h-8 w-8 px-0 text-muted-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[min(24rem,70vh)] w-48 overflow-y-auto">
        {showCompletedItem || showExpandItem ? (
          <>
            <DropdownMenuLabel className="font-mono text-micro uppercase tracking-wider text-muted-foreground">
              List
            </DropdownMenuLabel>
            {showCompletedItem ? (
              <DropdownMenuItem
                className="gap-2 text-caption"
                onSelect={() => onToggleCompleted?.(!showCompleted)}
              >
                {showCompleted ? (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {showCompleted ? "Hide completed" : "Show completed"}
                <span className="ml-auto font-mono text-micro text-muted-foreground">
                  {completedCount}
                </span>
              </DropdownMenuItem>
            ) : null}
            {showExpandItem ? (
              <DropdownMenuItem
                className="gap-2 text-caption"
                disabled={expandDisabled}
                onSelect={() =>
                  hierarchyExpanded ? onCollapseAll?.() : onExpandAll?.()
                }
              >
                {hierarchyExpanded ? (
                  <ChevronsDownUp className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {hierarchyExpanded ? "Collapse all" : "Expand all"}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
          </>
        ) : null}
        {showColumns ? (
          <>
            <DropdownMenuLabel className="font-mono text-micro uppercase tracking-wider text-muted-foreground">
              Columns
            </DropdownMenuLabel>
            {columns.map((column) => (
              <DropdownMenuItem
                key={column.id}
                className="gap-2 text-caption"
                onSelect={(event) => {
                  event.preventDefault();
                  onToggleColumn?.(column.id);
                }}
              >
                <span className="grid h-4 w-4 place-items-center rounded border border-border bg-muted/40">
                  {visibleColumnSet.has(column.id) ? (
                    <span className="h-2 w-2 rounded-sm bg-primary" />
                  ) : null}
                </span>
                {column.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem
          className="gap-2 text-caption"
          onSelect={() => navigate("/project-templates")}
        >
          <LayoutTemplate className="h-3.5 w-3.5 text-muted-foreground" />
          Templates
        </DropdownMenuItem>
        {trashCount > 0 && onOpenTrash ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-caption" onSelect={onOpenTrash}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              Trash
              <span className="ml-auto font-mono text-micro text-muted-foreground">
                {trashCount}
              </span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
