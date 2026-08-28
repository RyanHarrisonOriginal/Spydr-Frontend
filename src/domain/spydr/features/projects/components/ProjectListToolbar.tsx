import type { ReactNode } from "react";
import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { ProjectAreaNode, PersonNode } from "@/domain/spydr/utils/types";
import {
  hasActiveProjectListFilters,
  type ProjectListFilterFacetId,
  type ProjectListFilters,
} from "@/domain/spydr/utils/projectListView";
import { cn } from "@/lib/utils";
import { ProjectListActiveFilterChips } from "./ProjectListActiveFilterChips";
import { ProjectListFilterMenu } from "./ProjectListFilterMenu";

interface ProjectListToolbarProps {
  filters: ProjectListFilters;
  areas: ProjectAreaNode[];
  people: PersonNode[];
  filteredCount: number;
  totalCount: number;
  activeFilterCount: number;
  onSearchChange(search: string): void;
  onToggleFacet(facetId: ProjectListFilterFacetId, value: string): void;
  onRemoveFacetValue(facetId: ProjectListFilterFacetId, value: string): void;
  onClearFilters(): void;
  endActions?: ReactNode;
}

export function ProjectListToolbar({
  filters,
  areas,
  people,
  filteredCount,
  totalCount,
  activeFilterCount,
  onSearchChange,
  onToggleFacet,
  onRemoveFacetValue,
  onClearFilters,
  endActions,
}: ProjectListToolbarProps) {
  const hasActiveFilters = hasActiveProjectListFilters(filters);
  const filterContext = { areas, people };

  return (
    <div className="border-b border-border/80">
      <div className="flex flex-wrap items-center gap-2 bg-muted/10 px-6 py-2">
        <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name…"
            className="h-8 border-border/80 bg-background pl-8 text-[12px] shadow-none"
            aria-label="Search projects by name"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]">
              <Filter className="h-3.5 w-3.5" />
              Filter
              {activeFilterCount > 0 ? (
                <span className="rounded bg-primary/15 px-1.5 py-px font-mono text-[10px] text-primary">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <ProjectListFilterMenu
            filters={filters}
            context={filterContext}
            onToggleFacet={onToggleFacet}
          />
        </DropdownMenu>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 gap-1 px-2 text-[11px] text-muted-foreground"
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        ) : null}

        <span
          className={cn(
            "ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
            hasActiveFilters && "text-foreground/70"
          )}
        >
          {filteredCount === totalCount
            ? `${totalCount} projects`
            : `${filteredCount} of ${totalCount}`}
        </span>
        {endActions}
      </div>

      <ProjectListActiveFilterChips
        filters={filters}
        context={filterContext}
        onRemoveFacetValue={onRemoveFacetValue}
      />
    </div>
  );
}
