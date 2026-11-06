import { useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import { PageHeader } from "@/domain/spydr/features/shared/components/PageHeader";
import type { ProjectNode } from "@/domain/spydr/utils/types";
import { cn } from "@/lib/utils";
import type { LogConfig, LogSortMode } from "../types";
import { groupLogByDay } from "../utils/dayGroups";
import { LogCapture } from "./LogCapture";
import { LogItem } from "./LogItem";
import "../log-page.css";

const PAGE_SIZE = 50;

interface LogListProps<T extends { id: string }> {
  title: string;
  items: T[];
  config: LogConfig<T>;
  projects: ProjectNode[];
  mode: LogSortMode;
  onModeChange: (mode: LogSortMode) => void;
  search: string;
  onSearchChange: (search: string) => void;
  projectFilter: string | null;
  onProjectFilterChange: (projectId: string | null) => void;
  onReorder?: (orderedIds: string[]) => void;
  reorderEnabled?: boolean;
  isCapturing?: boolean;
  className?: string;
}

export function LogList<T extends { id: string }>({
  title,
  items,
  config,
  projects,
  mode,
  onModeChange,
  search,
  onSearchChange,
  projectFilter,
  onProjectFilterChange,
  onReorder,
  reorderEnabled = false,
  isCapturing = false,
  className,
}: LogListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      if (projectFilter) {
        const projectId = config.getProjectId?.(item) ?? null;
        if (projectId !== projectFilter) return false;
      }
      if (!needle) return true;
      const haystack = [
        config.title?.(item) ?? "",
        config.primary(item),
        config.secondary?.(item) ?? "",
        ...config.meta(item).map((part) => {
          if (part.kind === "project") return part.title;
          if (part.kind === "status") return part.label;
          if (part.kind === "text") return part.text;
          return "";
        }),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, search, projectFilter, config]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = Math.max(0, filtered.length - visible.length);
  const ranked = mode === "ranked" && config.rankable;
  const canDrag = ranked && Boolean(reorderEnabled && onReorder);

  const dayGroups = useMemo(
    () => (ranked ? null : groupLogByDay(visible, config.getTimestamp)),
    [ranked, visible, config]
  );

  const selectedProject =
    projects.find((project) => project.id === projectFilter) ?? null;

  const countLabel =
    filtered.length === 1
      ? `1 ${config.nounSingular}`
      : `${filtered.length} ${config.noun}`;

  return (
    <div className={cn("log-page absolute inset-0 flex min-h-0 flex-col overflow-y-auto", className)}>
      <PageHeader
        dense
        atmosphere={false}
        showBreadcrumbs={false}
        inlineMeta
        className="log-page-header"
        titleClassName="text-[24px] font-semibold tracking-[-0.03em] text-[var(--fg)]"
        title={title}
        meta={<span className="log-page-count">{countLabel}</span>}
      />

      <div className="log-page-toolbar">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-2)]" />
          <input
            className="log-page-toolbar-search"
            value={search}
            onChange={(event) => {
              onSearchChange(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder={`Search ${config.noun}…`}
            aria-label={`Search ${config.noun}`}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="log-page-toolbar-btn"
              data-active={projectFilter ? "true" : "false"}
            >
              <Filter className="h-3.5 w-3.5" aria-hidden />
              {selectedProject ? selectedProject.title : "Project"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-64 w-56 overflow-y-auto">
            <DropdownMenuItem
              onClick={() => {
                onProjectFilterChange(null);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              All projects
            </DropdownMenuItem>
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => {
                  onProjectFilterChange(project.id);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                {project.details?.emoji ? `${project.details.emoji} ` : null}
                {project.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {projectFilter ? (
          <button
            type="button"
            className="log-page-toolbar-btn"
            aria-label="Clear project filter"
            onClick={() => onProjectFilterChange(null)}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear
          </button>
        ) : null}

        {config.rankable ? (
          <div
            role="tablist"
            aria-label="Sort mode"
            className="log-page-segment"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "recent"}
              onClick={() => {
                onModeChange("recent");
                setVisibleCount(PAGE_SIZE);
              }}
            >
              Recent
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "ranked"}
              onClick={() => {
                onModeChange("ranked");
                setVisibleCount(PAGE_SIZE);
              }}
            >
              Ranked
            </button>
          </div>
        ) : null}
      </div>

      <div className="log-page-body">
        <div className="log-panel">
          <LogCapture
            placeholder={config.capturePlaceholder}
            targets={config.captureTargets}
            onSubmit={config.onCapture}
            disabled={isCapturing}
          />

          {filtered.length === 0 ? (
            <p className="log-empty">{config.emptyMessage}</p>
          ) : ranked ? (
            <CollectionSortableList
              items={visible}
              enabled={canDrag}
              layout="list"
              className="m-0 list-none p-0"
              onReorder={(orderedVisibleIds) => {
                if (!onReorder) return;
                const tail = filtered
                  .slice(visibleCount)
                  .map((item) => item.id);
                onReorder([...orderedVisibleIds, ...tail]);
              }}
              renderItem={(item, sortable) => (
                <LogItem
                  item={item}
                  config={config}
                  ranked
                  dragHandleProps={sortable.dragHandleProps}
                />
              )}
            />
          ) : (
            dayGroups?.map((group) => (
              <section key={group.id}>
                <header className="log-day-header">
                  <span>{group.label}</span>
                  <span className="log-day-count">{group.items.length}</span>
                </header>
                {group.items.map((item) => (
                  <LogItem
                    key={item.id}
                    item={item}
                    config={config}
                    ranked={false}
                  />
                ))}
              </section>
            ))
          )}

          {remaining > 0 ? (
            <button
              type="button"
              className="log-earlier"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Show {remaining} earlier
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
