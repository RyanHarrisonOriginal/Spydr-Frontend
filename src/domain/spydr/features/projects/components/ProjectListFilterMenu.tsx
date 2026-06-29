import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  getFacetOptions,
  getFacetSelections,
  projectListFilterFacets,
  type ProjectListFilterContext,
  type ProjectListFilterFacetId,
  type ProjectListFilters,
} from "@/domain/spydr/utils/projectListFilterModel";
import { cn } from "@/lib/utils";

function FilterCheckbox({ checked }: { checked: boolean }) {
  return (
    <span className="grid h-4 w-4 shrink-0 place-items-center rounded border border-border bg-muted/40">
      {checked ? <span className="h-2 w-2 rounded-sm bg-primary" /> : null}
    </span>
  );
}

interface ProjectListFilterMenuProps {
  filters: ProjectListFilters;
  context: ProjectListFilterContext;
  onToggleFacet(facetId: ProjectListFilterFacetId, value: string): void;
}

export function ProjectListFilterMenu({
  filters,
  context,
  onToggleFacet,
}: ProjectListFilterMenuProps) {
  return (
    <DropdownMenuContent align="start" className="w-56 p-0">
      <div className="max-h-[min(24rem,70vh)] overflow-y-auto p-1">
        {projectListFilterFacets.map((facet, index) => {
          const options = getFacetOptions(facet.id, context);
          const selections = getFacetSelections(filters, facet.id);

          return (
            <div key={facet.id}>
              {index > 0 ? <DropdownMenuSeparator className="my-1" /> : null}
              <DropdownMenuLabel className="px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {facet.label}
              </DropdownMenuLabel>
              {options.length === 0 ? (
                <p className="px-2 pb-2 text-[11px] text-muted-foreground">
                  No options
                </p>
              ) : (
                options.map((option) => (
                  <DropdownMenuItem
                    key={`${facet.id}-${option.value}`}
                    onSelect={(event) => {
                      event.preventDefault();
                      onToggleFacet(facet.id, option.value);
                    }}
                    className={cn("gap-2 text-[12px]", option.itemClassName)}
                  >
                    <FilterCheckbox checked={selections.includes(option.value)} />
                    {option.label}
                  </DropdownMenuItem>
                ))
              )}
            </div>
          );
        })}
      </div>
    </DropdownMenuContent>
  );
}
