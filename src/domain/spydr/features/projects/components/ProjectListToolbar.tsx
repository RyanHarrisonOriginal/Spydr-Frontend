import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { ProjectAreaNode } from "@/domain/spydr/utils/types";
import {
  UNASSIGNED_AREA_FILTER,
  type ProjectListFilters,
} from "@/domain/spydr/utils/projectListView";
import { projectPriorities } from "@/domain/spydr/utils/projectPriority";
import { projectStatuses } from "@/domain/spydr/utils/projectStatus";
import { cn } from "@/lib/utils";

interface ProjectListToolbarProps {
  filters: ProjectListFilters;
  areas: ProjectAreaNode[];
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onSearchChange(search: string): void;
  onToggleStatus(status: string): void;
  onTogglePriority(priority: string): void;
  onToggleArea(areaId: string): void;
  onClearFilters(): void;
}

function FilterCheckbox({ checked }: { checked: boolean }) {
  return (
    <span className="grid h-4 w-4 shrink-0 place-items-center rounded border border-border bg-muted/40">
      {checked ? <span className="h-2 w-2 rounded-sm bg-primary" /> : null}
    </span>
  );
}

export function ProjectListToolbar({
  filters,
  areas,
  filteredCount,
  totalCount,
  hasActiveFilters,
  activeFilterCount,
  onSearchChange,
  onToggleStatus,
  onTogglePriority,
  onToggleArea,
  onClearFilters,
}: ProjectListToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border/80 bg-muted/10 px-6 py-2">
      <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search projects…"
          className="h-8 border-border/80 bg-background pl-8 text-[12px] shadow-none"
          aria-label="Search projects"
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
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Status
          </DropdownMenuLabel>
          {projectStatuses.map((status) => (
            <DropdownMenuItem
              key={status}
              onSelect={(event) => {
                event.preventDefault();
                onToggleStatus(status);
              }}
              className="gap-2 text-[12px] capitalize"
            >
              <FilterCheckbox checked={filters.statuses.includes(status)} />
              {status.replace(/_/g, " ")}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Priority
          </DropdownMenuLabel>
          {projectPriorities.map((priority) => (
            <DropdownMenuItem
              key={priority}
              onSelect={(event) => {
                event.preventDefault();
                onTogglePriority(priority);
              }}
              className="gap-2 font-mono text-[11px] uppercase"
            >
              <FilterCheckbox checked={filters.priorities.includes(priority)} />
              {priority}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Area
          </DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              onToggleArea(UNASSIGNED_AREA_FILTER);
            }}
            className="gap-2 text-[12px]"
          >
            <FilterCheckbox
              checked={filters.areaIds.includes(UNASSIGNED_AREA_FILTER)}
            />
            Unassigned
          </DropdownMenuItem>
          {areas.map((area) => (
            <DropdownMenuItem
              key={area.id}
              onSelect={(event) => {
                event.preventDefault();
                onToggleArea(area.id);
              }}
              className="gap-2 text-[12px]"
            >
              <FilterCheckbox checked={filters.areaIds.includes(area.id)} />
              {area.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
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
          Clear
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
    </div>
  );
}
