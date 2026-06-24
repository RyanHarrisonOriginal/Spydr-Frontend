import { Link } from "react-router-dom";
import type { ProjectAreaNode, ProjectNode } from "@/domain/spydr/utils/types";
import {
  EntityTag,
  PriorityBadge,
  StatusDot,
} from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { formatRelativeTime, formatShortDate } from "@/domain/spydr/features/shared/components/time";
import { resolveProjectAreaId } from "@/domain/spydr/utils/projectAreas";
import type { ProjectColumnId } from "../hooks/useProjectListColumns";
import { ProjectAreaSelect } from "./ProjectAreaSelect";
import { ProjectStatusSelect } from "./ProjectStatusSelect";

interface ProjectListProps {
  projects: ProjectNode[];
  areas: ProjectAreaNode[];
  visibleColumns: ProjectColumnId[];
  updatingProjectId?: string | null;
  onStatusChange?(projectId: string, status: string): void;
  onAreaChange?(projectId: string, areaNodeId: string | null): void;
}

const columnWidths: Record<ProjectColumnId, string> = {
  area: "148px",
  priority: "96px",
  status: "128px",
  target: "96px",
  updated: "128px",
};

function getProjectListGrid(visibleColumns: ProjectColumnId[]) {
  return ["40px", "minmax(280px,1fr)", ...visibleColumns.map((id) => columnWidths[id])].join(" ");
}

export function ProjectList({
  projects,
  areas,
  visibleColumns,
  updatingProjectId = null,
  onStatusChange,
  onAreaChange,
}: ProjectListProps) {
  const gridTemplateColumns = getProjectListGrid(visibleColumns);
  const minWidth = 440 + visibleColumns.length * 112;
  const hasColumn = (columnId: ProjectColumnId) => visibleColumns.includes(columnId);

  return (
    <div className="overflow-x-auto">
      <div
        className="grid items-center gap-4 border-b border-border bg-muted/20 px-6 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
        style={{ gridTemplateColumns, minWidth }}
      >
        <span />
        <span>Name</span>
        {hasColumn("area") && <span className="text-left">Area</span>}
        {hasColumn("priority") && <span className="text-left">Priority</span>}
        {hasColumn("status") && <span className="text-left">Status</span>}
        {hasColumn("target") && <span className="text-right">Target</span>}
        {hasColumn("updated") && <span className="text-right">Updated</span>}
      </div>
      <ul className="divide-y divide-border">
        {projects.map((project) => (
          <li
            key={project.id}
            className="grid items-center gap-4 px-6 py-3 row-hover"
            style={{ gridTemplateColumns, minWidth }}
          >
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
            {hasColumn("priority") && (
              <span className="justify-self-start">
                <PriorityBadge priority={project.priority} />
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
              <span className="justify-self-end font-mono text-[11px] tabular-nums text-muted-foreground">
                {formatShortDate(project.details?.targetDate)}
              </span>
            )}
            {hasColumn("updated") && (
              <span className="justify-self-end text-right font-mono text-[11px] text-muted-foreground">
                {formatRelativeTime(project.updatedAt)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
