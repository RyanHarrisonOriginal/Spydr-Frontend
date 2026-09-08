import { ArrowUpDown, Filter, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CollectionView } from "@/domain/spydr/features/shared/hooks/useCollectionView";
import { CollectionActiveFilterChips } from "./CollectionActiveFilterChips";
import { CollectionFilterMenu } from "./CollectionFilterMenu";
import { CollectionSortMenu } from "./CollectionSortMenu";

interface CollectionToolbarProps<T> {
  view: CollectionView<T>;
  /** Hide the sort dropdown when the list provides its own column sorting. */
  showSort?: boolean;
  startActions?: ReactNode;
  endActions?: ReactNode;
  sticky?: boolean;
}

export function CollectionToolbar<T>({
  view,
  showSort = true,
  startActions,
  endActions,
  sticky = false,
}: CollectionToolbarProps<T>) {
  const {
    state,
    facets,
    sorts,
    activeChips,
    filteredCount,
    totalCount,
    activeFilterCount,
    hasActiveFilters,
    searchPlaceholder,
    noun,
  } = view;

  const activeSortLabel =
    sorts.find((sort) => sort.id === state.sort.columnId)?.label ?? "Sort";
  const hasFacets = facets.some((facet) => facet.options.length > 0);

  return (
    <div
      className={cn(
        "border-b border-border",
        sticky && "sticky top-0 z-20 bg-background/95 backdrop-blur-sm"
      )}
    >
      <div className="flex flex-col gap-2 bg-muted/10 px-4 py-2 md:flex-row md:flex-wrap md:items-center md:px-6">
        {startActions ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2">{startActions}</div>
        ) : null}
        <div className="relative min-w-0 flex-1 md:min-w-[12rem] md:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={state.search}
            onChange={(event) => view.setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 border-border bg-background pl-8 text-[12px] shadow-none"
            aria-label={searchPlaceholder}
          />
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
        {hasFacets ? (
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
            <CollectionFilterMenu facets={facets} onToggleFacet={view.toggleFacet} />
          </DropdownMenu>
        ) : null}

        {showSort ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]">
                <ArrowUpDown className="h-3.5 w-3.5" />
                {activeSortLabel}
              </Button>
            </DropdownMenuTrigger>
            <CollectionSortMenu
              sorts={sorts}
              sort={state.sort}
              onToggleSort={view.toggleSort}
            />
          </DropdownMenu>
        ) : null}

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={view.clearFilters}
            className="h-8 gap-1 px-2 text-[11px] text-muted-foreground"
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        ) : (
          <span className="hidden font-mono text-[10px] text-muted-foreground/80 sm:inline">
            Drag rows to set priority
          </span>
        )}

        <span
          className={cn(
            "ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
            hasActiveFilters && "text-foreground/70"
          )}
        >
          {filteredCount === totalCount
            ? `${totalCount} ${noun}`
            : `${filteredCount} of ${totalCount}`}
        </span>
        {endActions}
        </div>
      </div>

      <CollectionActiveFilterChips chips={activeChips} onRemove={view.removeFacet} />
    </div>
  );
}
