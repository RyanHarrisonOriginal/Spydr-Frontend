import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActiveFilterChip } from "@/domain/spydr/utils/collectionView";

interface CollectionActiveFilterChipsProps {
  chips: ActiveFilterChip[];
  onRemove(facetId: string, value: string): void;
}

export function CollectionActiveFilterChips({
  chips,
  onRemove,
}: CollectionActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 bg-muted/5 px-6 py-1.5">
      {chips.map((chip) => (
        <Button
          key={`${chip.facetId}-${chip.value}`}
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onRemove(chip.facetId, chip.value)}
          className="h-6 gap-1 rounded-full px-2 text-[10px] font-normal"
        >
          <span className="font-mono uppercase tracking-wider text-muted-foreground">
            {chip.facetLabel}
          </span>
          <span>{chip.label}</span>
          <X className="h-3 w-3 text-muted-foreground" />
        </Button>
      ))}
    </div>
  );
}
