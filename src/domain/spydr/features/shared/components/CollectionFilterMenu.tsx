import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { CollectionFacetView } from "@/domain/spydr/features/shared/hooks/useCollectionView";

function FilterCheckbox({ checked }: { checked: boolean }) {
  return (
    <span className="grid h-4 w-4 shrink-0 place-items-center rounded border border-border bg-muted/40">
      {checked ? <span className="h-2 w-2 rounded-sm bg-primary" /> : null}
    </span>
  );
}

interface CollectionFilterMenuProps {
  facets: CollectionFacetView[];
  onToggleFacet(facetId: string, value: string): void;
}

export function CollectionFilterMenu({
  facets,
  onToggleFacet,
}: CollectionFilterMenuProps) {
  const facetsWithOptions = facets.filter((facet) => facet.options.length > 0);

  return (
    <DropdownMenuContent align="start" className="w-56 p-0">
      <div className="max-h-[min(24rem,70vh)] overflow-y-auto p-1">
        {facetsWithOptions.length === 0 ? (
          <p className="px-2 py-2 text-[11px] text-muted-foreground">
            No filters available
          </p>
        ) : (
          facetsWithOptions.map((facet, index) => (
            <div key={facet.id}>
              {index > 0 ? <DropdownMenuSeparator className="my-1" /> : null}
              <DropdownMenuLabel className="px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {facet.label}
              </DropdownMenuLabel>
              {facet.options.map((option) => (
                <DropdownMenuItem
                  key={`${facet.id}-${option.value}`}
                  onSelect={(event) => {
                    event.preventDefault();
                    onToggleFacet(facet.id, option.value);
                  }}
                  className={cn("gap-2 text-[12px]", option.itemClassName)}
                >
                  <FilterCheckbox checked={facet.selected.includes(option.value)} />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </div>
          ))
        )}
      </div>
    </DropdownMenuContent>
  );
}
