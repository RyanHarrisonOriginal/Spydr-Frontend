import { ArrowDown, ArrowUp, ArrowUpDown, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ProjectAreaNode, ProjectNode, PersonNode } from "@/domain/spydr/utils/types";
import {
  EntityTag,
  PriorityBadge,
  StatusDot,
} from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { formatRelativeTime } from "@/domain/spydr/features/shared/components/time";
import { resolveProjectAreaId } from "@/domain/spydr/utils/projectAreas";
import type { ProjectListSort, ProjectSortColumn } from "@/domain/spydr/utils/projectListView";
import { CollectionDragHandle } from "@/domain/spydr/features/shared/components/CollectionDragHandle";
import { CollectionPriorityRank } from "@/domain/spydr/features/shared/components/CollectionPriorityRank";
import { CollectionSortableList } from "@/domain/spydr/features/shared/components/CollectionSortableList";
import { cn } from "@/lib/utils";
import type { ProjectColumnId } from "../hooks/useProjectListColumns";
import { ProjectAreaSelect } from "./ProjectAreaSelect";
import { ProjectPrioritySelect } from "./ProjectPrioritySelect";
import { ProjectStatusSelect } from "./ProjectStatusSelect";
import { ProjectTargetDateSelect } from "./ProjectTargetDateSelect";
import { PersonSelect } from "./PersonSelect";

interface ProjectListProps {
  projects: ProjectNode[];
  areas: ProjectAreaNode[];
  people: PersonNode[];
  visibleColumns: ProjectColumnId[];
  sort: ProjectListSort;
  reorderEnabled?: boolean;
  getPriorityRank(id: string): number | undefined;
  onReorder?(orderedIds: string[]): void;
  updatingProjectId?: string | null;
  hasActiveFilters?: boolean;
  onSortColumn?(column: ProjectSortColumn): void;
  onClearFilters?(): void;
  onStatusChange?(projectId: string, status: string): void;
  onAreaChange?(projectId: string, areaNodeId: string | null): void;
  onPriorityChange?(projectId: string, priority: string): void;
  onTargetDateChange?(projectId: string, targetDate: string | null): void;
  onAssigneeChange?(projectId: string, assigneePersonNodeId: string | null): void;
  onDelete?(projectId: string): void;
  deletingProjectId?: string | null;
}

const columnWidths: Record<ProjectColumnId, string> = {
  area: "148px",
  assignee: "148px",
  priority: "104px",
  status: "128px",
  target: "112px",
  updated: "128px",
};

const actionsColumnWidth = "72px";

const rankColumnWidth = "36px";

function getProjectListGrid(visibleColumns: ProjectColumnId[], reorderEnabled = false) {
  return [
    ...(reorderEnabled ? ["24px"] : []),
    rankColumnWidth,
    "40px",
    "minmax(280px,1fr)",
    ...visibleColumns.map((id) => columnWidths[id]),
    actionsColumnWidth,
  ].join(" ");
}

function SortableHeader({
  label,
  column,
  sort,
  align = "start",
  onSort,
}: {
  label: string;
  column: ProjectSortColumn;
  sort: ProjectListSort;
  align?: "start" | "end";
  onSort?(column: ProjectSortColumn): void;
}) {
  const isActive = sort.column === column;
  const Icon = !isActive ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;

  if (!onSort) {
    return (
      <span className={align === "end" ? "text-right" : "text-left"}>{label}</span>
    );
  }

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

function ProjectListDeleteButton({
  projectTitle,
  isConfirming,
  isDeleting,
  disabled,
  onRequestDelete,
  onConfirmDelete,
  onCancel,
}: {
  projectTitle: string;
  isConfirming: boolean;
  isDeleting: boolean;
  disabled?: boolean;
  onRequestDelete(): void;
  onConfirmDelete(): void;
  onCancel(): void;
}) {
  if (isConfirming) {
    return (
      <div className="flex items-center justify-end gap-0.5">
        <button
          type="button"
          disabled={isDeleting}
          onClick={(event) => {
            event.stopPropagation();
            onConfirmDelete();
          }}
          className="rounded px-1.5 py-1 text-[10px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          {isDeleting ? "…" : "Delete"}
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={(event) => {
            event.stopPropagation();
            onCancel();
          }}
          aria-label="Cancel delete"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onRequestDelete();
      }}
      aria-label={`Delete ${projectTitle}`}
      className="ml-auto rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

export function ProjectList({
  projects,
  areas,
  people,
  visibleColumns,
  sort,
  reorderEnabled = false,
  getPriorityRank,
  onReorder,
  updatingProjectId = null,
  hasActiveFilters = false,
  onSortColumn,
  onClearFilters,
  onStatusChange,
  onAreaChange,
  onPriorityChange,
  onTargetDateChange,
  onAssigneeChange,
  onDelete,
  deletingProjectId = null,
}: ProjectListProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const gridTemplateColumns = getProjectListGrid(visibleColumns, reorderEnabled);
  const minWidth = 476 + visibleColumns.length * 112 + 72 + (reorderEnabled ? 24 : 0);
  const hasColumn = (columnId: ProjectColumnId) => visibleColumns.includes(columnId);

  useEffect(() => {
    if (!pendingDeleteId) return;
    const timeout = window.setTimeout(() => setPendingDeleteId(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [pendingDeleteId]);

  return (
    <div className="overflow-x-auto">
      <div
        className="grid items-center gap-4 border-b border-border bg-muted/20 px-6 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        style={{ gridTemplateColumns, minWidth }}
      >
        {reorderEnabled ? <span aria-hidden /> : null}
        <SortableHeader label="Rank" column="order" sort={sort} onSort={onSortColumn} />
        <span />
        <SortableHeader label="Name" column="name" sort={sort} onSort={onSortColumn} />
        {hasColumn("area") && (
          <SortableHeader
            label="Area"
            column="area"
            sort={sort}
            onSort={onSortColumn}
          />
        )}
        {hasColumn("assignee") && (
          <SortableHeader
            label="Assignee"
            column="assignee"
            sort={sort}
            onSort={onSortColumn}
          />
        )}
        {hasColumn("priority") && (
          <SortableHeader
            label="Priority"
            column="priority"
            sort={sort}
            onSort={onSortColumn}
          />
        )}
        {hasColumn("status") && (
          <SortableHeader
            label="Status"
            column="status"
            sort={sort}
            onSort={onSortColumn}
          />
        )}
        {hasColumn("target") && (
          <SortableHeader
            label="Target"
            column="target"
            sort={sort}
            align="end"
            onSort={onSortColumn}
          />
        )}
        {hasColumn("updated") && (
          <SortableHeader
            label="Updated"
            column="updated"
            sort={sort}
            align="end"
            onSort={onSortColumn}
          />
        )}
        <span />
      </div>
      {projects.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-[13px] font-medium text-foreground/90">
            No projects match your filters
          </p>
          {hasActiveFilters && onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-2 text-[12px] text-primary hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
      <CollectionSortableList
        items={projects}
        enabled={reorderEnabled}
        className="divide-y divide-border"
        onReorder={(orderedIds) => onReorder?.(orderedIds)}
        renderItem={(project, sortable) => (
          <div
            className="grid items-center gap-4 px-6 py-3 row-hover"
            style={{ gridTemplateColumns, minWidth }}
          >
            {reorderEnabled ? (
              <CollectionDragHandle {...sortable.dragHandleProps} />
            ) : null}
            <CollectionPriorityRank rank={getPriorityRank(project.id)} />
            <span className="grid h-7 w-7 place-items-center rounded border border-border bg-muted/40 font-mono text-[11px] text-muted-foreground">
              {project.title.charAt(0).toUpperCase()}
            </span>
            <Link to={`/projects/${project.id}`} className="min-w-0">
              <div className="flex items-center gap-2">
                <StatusDot status={project.status} />
                <span className="truncate text-[13px] font-medium hover:text-primary">
                  {project.title}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                {project.tags.slice(0, 3).map((tag) => (
                  <EntityTag key={tag} tag={tag} />
                ))}
                {project.details?.riskLevel && (
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">
                    delivery risk {project.details.riskLevel}
                  </span>
                )}
              </div>
            </Link>
            {hasColumn("area") && (
              <span
                className="block min-w-0 w-full"
                onClick={(event) => event.stopPropagation()}
              >
                {onAreaChange ? (
                  <ProjectAreaSelect
                    areas={areas}
                    value={resolveProjectAreaId(project, areas)}
                    onChange={(areaNodeId) => onAreaChange(project.id, areaNodeId)}
                    disabled={updatingProjectId === project.id}
                  />
                ) : project.area ? (
                  <span className="rounded border border-border bg-muted/40 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/80">
                    {project.area}
                  </span>
                ) : (
                  <span className="font-mono text-[11px] text-muted-foreground">No area</span>
                )}
              </span>
            )}
            {hasColumn("assignee") && (
              <span
                className="block min-w-0 w-full"
                onClick={(event) => event.stopPropagation()}
              >
                {onAssigneeChange ? (
                  <PersonSelect
                    people={people}
                    compact
                    value={
                      project.personas?.assignee?.id ??
                      project.details?.assigneePersonNodeId ??
                      null
                    }
                    onChange={(assigneePersonNodeId) =>
                      onAssigneeChange(project.id, assigneePersonNodeId)
                    }
                    disabled={updatingProjectId === project.id}
                    ariaLabel="Project assignee"
                  />
                ) : (
                  <span className="truncate text-[12px] text-muted-foreground">
                    {project.personas?.assignee?.details?.fullName ??
                      project.personas?.assignee?.title ??
                      "—"}
                  </span>
                )}
              </span>
            )}
            {hasColumn("priority") && (
              <span
                className="block min-w-0 w-full"
                onClick={(event) => event.stopPropagation()}
              >
                {onPriorityChange ? (
                  <ProjectPrioritySelect
                    value={project.priority}
                    onChange={(priority) => onPriorityChange(project.id, priority)}
                    disabled={updatingProjectId === project.id}
                  />
                ) : (
                  <PriorityBadge priority={project.priority} />
                )}
              </span>
            )}
            {hasColumn("status") && (
              <span
                className="block min-w-0 w-full"
                onClick={(event) => event.stopPropagation()}
              >
                {onStatusChange ? (
                  <ProjectStatusSelect
                    value={project.status}
                    onChange={(status) => onStatusChange(project.id, status)}
                    disabled={updatingProjectId === project.id}
                  />
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted/40 px-1.5 py-px text-[11px] capitalize text-foreground/80">
                    <StatusDot status={project.status} />
                    {project.status.replace(/_/g, " ")}
                  </span>
                )}
              </span>
            )}
            {hasColumn("target") && (
              <span
                className="block min-w-0 w-full"
                onClick={(event) => event.stopPropagation()}
              >
                <ProjectTargetDateSelect
                  value={project.details?.targetDate}
                  onChange={(targetDate) => {
                    const current = project.details?.targetDate?.slice(0, 10) ?? null;
                    const next = targetDate?.slice(0, 10) ?? null;
                    if (next !== current) {
                      onTargetDateChange?.(project.id, targetDate);
                    }
                  }}
                  disabled={!onTargetDateChange || updatingProjectId === project.id}
                />
              </span>
            )}
            {hasColumn("updated") && (
              <span className="justify-self-end text-right font-mono text-[11px] text-muted-foreground">
                {formatRelativeTime(project.updatedAt)}
              </span>
            )}
            {onDelete ? (
              <ProjectListDeleteButton
                projectTitle={project.title}
                isConfirming={pendingDeleteId === project.id}
                isDeleting={deletingProjectId === project.id}
                disabled={
                  deletingProjectId !== null && deletingProjectId !== project.id
                }
                onRequestDelete={() => setPendingDeleteId(project.id)}
                onConfirmDelete={() => {
                  setPendingDeleteId(null);
                  onDelete(project.id);
                }}
                onCancel={() => setPendingDeleteId(null)}
              />
            ) : null}
          </div>
        )}
      />
      )}
    </div>
  );
}
