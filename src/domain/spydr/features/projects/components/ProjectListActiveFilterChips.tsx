import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getActiveFilterChips,
  projectListFilterFacets,
  type ProjectListFilterContext,
  type ProjectListFilterFacetId,
  type ProjectListFilters,
} from "@/domain/spydr/utils/projectListFilterModel";

interface ProjectListActiveFilterChipsProps {
  filters: ProjectListFilters;
  context: ProjectListFilterContext;
  onRemoveFacetValue(facetId: ProjectListFilterFacetId, value: string): void;
}

const facetLabels = Object.fromEntries(
  projectListFilterFacets.map((facet) => [facet.id, facet.label])
) as Record<ProjectListFilterFacetId, string>;

export function ProjectListActiveFilterChips({
  filters,
  context,
  onRemoveFacetValue,
}: ProjectListActiveFilterChipsProps) {
  const chips = getActiveFilterChips(filters, context);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 bg-muted/5 px-6 py-1.5">
      {chips.map((chip) => (
        <Button
          key={`${chip.facetId}-${chip.value}`}
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onRemoveFacetValue(chip.facetId, chip.value)}
          className="h-6 gap-1 rounded-full px-2 text-[10px] font-normal"
        >
          <span className="font-mono uppercase tracking-wider text-muted-foreground">
            {facetLabels[chip.facetId]}
          </span>
          <span>{chip.label}</span>
          <X className="h-3 w-3 text-muted-foreground" />
        </Button>
      ))}
    </div>
  );
}
