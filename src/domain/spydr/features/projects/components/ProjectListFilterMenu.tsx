import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  getFacetOptions,
  getFacetSelections,
  projectListFilterFacets,
  type ProjectListFilterContext,
  type ProjectListFilterFacetId,
  type ProjectListFilters,
} from "@/domain/spydr/utils/projectListFilterModel";
import { cn } from "@/lib/utils";

const FILTER_SEARCH_THRESHOLD = 6;

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
  const [searchQuery, setSearchQuery] = useState("");
  const query = searchQuery.trim().toLowerCase();

  const facetSections = useMemo(
    () =>
      projectListFilterFacets.map((facet) => ({
        facet,
        options: getFacetOptions(facet.id, context),
        selections: getFacetSelections(filters, facet.id),
      })),
    [context, filters]
  );

  const totalOptions = facetSections.reduce(
    (count, section) => count + section.options.length,
    0
  );
  const showSearch = totalOptions > FILTER_SEARCH_THRESHOLD;

  const visibleSections = useMemo(() => {
    if (!showSearch || !query) {
      return facetSections;
    }
    return facetSections
      .map((section) => ({
        ...section,
        options: section.options.filter((option) =>
          option.label.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.options.length > 0);
  }, [facetSections, query, showSearch]);

  return (
    <DropdownMenuContent align="start" className="w-56 p-0">
      {showSearch ? (
        <div className="sticky top-0 z-10 border-b border-border/80 bg-popover p-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search filters…"
              aria-label="Search filter options"
              className="h-7 border-border/70 bg-muted/20 pl-7 text-[11px] shadow-none focus-visible:ring-1"
              onKeyDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            />
          </div>
        </div>
      ) : null}

      <div className="max-h-[min(24rem,70vh)] overflow-y-auto p-1">
        {visibleSections.length === 0 ? (
          <p className="px-2 py-3 text-center text-[11px] text-muted-foreground">
            No matches
          </p>
        ) : (
          visibleSections.map((section, index) => {
            const { facet, options, selections } = section;

          return (
            <div key={facet.id}>
              {index > 0 ? <DropdownMenuSeparator className="my-1" /> : null}
              <DropdownMenuLabel className="px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {facet.label}
              </DropdownMenuLabel>
              {options.map((option) => (
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
                ))}
            </div>
          );
        })
        )}
      </div>
    </DropdownMenuContent>
  );
}
