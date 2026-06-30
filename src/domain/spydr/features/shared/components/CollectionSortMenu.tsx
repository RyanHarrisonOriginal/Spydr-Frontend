import { ArrowDown, ArrowUp } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { CollectionSortState } from "@/domain/spydr/utils/collectionView";

interface CollectionSortMenuProps {
  sorts: { id: string; label: string }[];
  sort: CollectionSortState;
  onToggleSort(columnId: string): void;
}

export function CollectionSortMenu({
  sorts,
  sort,
  onToggleSort,
}: CollectionSortMenuProps) {
  return (
    <DropdownMenuContent align="start" className="w-48 p-1">
      <DropdownMenuLabel className="px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        Sort by
      </DropdownMenuLabel>
      {sorts.map((option) => {
        const isActive = sort.columnId === option.id;
        const Icon = sort.direction === "asc" ? ArrowUp : ArrowDown;

        return (
          <DropdownMenuItem
            key={option.id}
            onSelect={(event) => {
              event.preventDefault();
              onToggleSort(option.id);
            }}
            className={cn(
              "justify-between gap-2 text-[12px]",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <span>{option.label}</span>
            {isActive ? <Icon className="h-3.5 w-3.5 text-primary" aria-hidden /> : null}
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuContent>
  );
}
