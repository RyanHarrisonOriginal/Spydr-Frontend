import {
  ChevronsDownUp,
  ChevronsUpDown,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
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

interface WorkMoreMenuProps {
  canExpand: boolean;
  onExpandAll(): void;
  onCollapseAll(): void;
  columns: readonly { id: ProjectColumnId; label: string }[];
  visibleColumnSet: Set<ProjectColumnId>;
  onToggleColumn(columnId: ProjectColumnId): void;
  trashCount: number;
  onOpenTrash(): void;
}

export function WorkMoreMenu({
  canExpand,
  onExpandAll,
  onCollapseAll,
  columns,
  visibleColumnSet,
  onToggleColumn,
  trashCount,
  onOpenTrash,
}: WorkMoreMenuProps) {
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
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          Tree
        </DropdownMenuLabel>
        <DropdownMenuItem
          className="gap-2 text-[12px]"
          disabled={!canExpand}
          onSelect={onExpandAll}
        >
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          Expand all
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-[12px]" onSelect={onCollapseAll}>
          <ChevronsDownUp className="h-3.5 w-3.5 text-muted-foreground" />
          Collapse all
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          Columns
        </DropdownMenuLabel>
        {columns.map((column) => (
          <DropdownMenuItem
            key={column.id}
            className="gap-2 text-[12px]"
            onSelect={(event) => {
              event.preventDefault();
              onToggleColumn(column.id);
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
        {trashCount > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-[12px]" onSelect={onOpenTrash}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              Trash
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                {trashCount}
              </span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
