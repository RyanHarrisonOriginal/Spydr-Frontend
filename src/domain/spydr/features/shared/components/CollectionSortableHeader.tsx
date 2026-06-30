import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CollectionSortState } from "@/domain/spydr/utils/collectionView";

interface CollectionSortableHeaderProps {
  label: string;
  column: string;
  sort: CollectionSortState;
  align?: "start" | "end";
  onSort(column: string): void;
}

/**
 * Clickable column header that toggles a collection-view sort. Mirrors the
 * sortable headers used on the Projects table so every sortable list behaves
 * the same way.
 */
export function CollectionSortableHeader({
  label,
  column,
  sort,
  align = "start",
  onSort,
}: CollectionSortableHeaderProps) {
  const isActive = sort.columnId === column;
  const Icon = !isActive ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={cn(
        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
        align === "end" && "ml-auto",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span>{label}</span>
      <Icon className={cn("h-3 w-3", isActive && "text-primary")} aria-hidden />
    </button>
  );
}
