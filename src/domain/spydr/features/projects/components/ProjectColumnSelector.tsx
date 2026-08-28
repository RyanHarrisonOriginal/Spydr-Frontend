import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectColumnId } from "../hooks/useProjectListColumns";

interface ProjectColumnSelectorProps {
  columns: readonly {
    id: ProjectColumnId;
    label: string;
  }[];
  visibleColumnSet: Set<ProjectColumnId>;
  onToggleColumn(columnId: ProjectColumnId): void;
  compact?: boolean;
}

export function ProjectColumnSelector({
  columns,
  visibleColumnSet,
  onToggleColumn,
  compact = false,
}: ProjectColumnSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={compact ? "ghost" : "outline"}
          size="sm"
          className={
            compact
              ? "h-7 gap-1.5 px-2 text-[11px] text-muted-foreground"
              : "gap-1.5"
          }
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {columns.map((column) => (
          <DropdownMenuItem
            key={column.id}
            onSelect={(event) => {
              event.preventDefault();
              onToggleColumn(column.id);
            }}
            className="gap-2"
          >
            <span className="grid h-4 w-4 place-items-center rounded border border-border bg-muted/40">
              {visibleColumnSet.has(column.id) && (
                <span className="h-2 w-2 rounded-sm bg-primary" />
              )}
            </span>
            <span>{column.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
