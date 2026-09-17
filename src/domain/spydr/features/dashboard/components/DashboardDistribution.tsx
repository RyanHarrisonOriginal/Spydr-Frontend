import { Link } from "react-router-dom";
import { StatusDot } from "@/domain/spydr/features/shared/components/StatusPrimitives";
import { AreaColorSwatch } from "@/domain/spydr/features/projects/components/AreaColorSwatch";
import { hslColorCss } from "@/domain/spydr/utils/projectAreaColors";
import {
  countTotal,
  inMotionProjectCount,
  ratioPercent,
  sortedAreaSummaries,
  sortedStatusEntries,
  statusFillClass,
  withoutClosedStatusCounts,
} from "@/domain/spydr/utils/dashboardModel";
import type {
  WorkspaceDashboard,
  WorkspaceDashboardStatusCounts,
} from "@/domain/spydr/utils/workspaceDashboard";
import { isTaskStatus, taskStatusLabels } from "@/domain/spydr/utils/taskStatus";
import { DashboardStatusDonut } from "@/domain/spydr/features/shared/components/StatusMixChart";
import { workTasksPath } from "@/domain/spydr/features/work/utils/workPaths";
import {
  DashboardSection,
  DashboardSegmentBar,
} from "./DashboardVisuals";

interface DashboardDistributionProps {
  dashboard: WorkspaceDashboard;
}

function statusLabel(status: string) {
  return isTaskStatus(status) ? taskStatusLabels[status] : status.replace(/_/g, " ");
}

function MixPanel({
  title,
  counts,
  ringValue,
  ringLabel,
  centerCaption,
  hrefForStatus,
}: {
  title: string;
  counts: WorkspaceDashboardStatusCounts;
  ringValue: number;
  ringLabel: string;
  centerCaption: string;
  hrefForStatus?: (status: string) => string;
}) {
  const total = countTotal(counts);
  const rows = sortedStatusEntries(counts);

  return (
    <div className="min-w-0 rounded-sm border border-border/60 bg-muted/10 p-3">
      <div className="flex items-center gap-4">
        <DashboardStatusDonut
          counts={counts}
          centerPercent={ratioPercent(ringValue, total)}
          centerLabel={ringLabel}
          centerCaption={centerCaption}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-[13px] font-medium text-foreground">{title}</h3>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {total}
            </span>
          </div>
          <DashboardSegmentBar
            className="mt-2"
            segments={rows.map((row) => ({
              key: row.status,
              value: row.count,
              label: statusLabel(row.status),
              className: statusFillClass(row.status),
              to: hrefForStatus?.(row.status),
            }))}
          />
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="mt-2 text-[12px] text-muted-foreground">Nothing here yet.</p>
      ) : (
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          {rows.map((row) => {
            const content = (
              <>
                <span className="flex min-w-0 items-center gap-1.5 text-[12px] capitalize text-foreground/90">
                  <StatusDot status={row.status} />
                  <span className="truncate">{statusLabel(row.status)}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {row.count}
                  <span className="ml-1 text-[10px] text-muted-foreground/70">
                    {ratioPercent(row.count, total)}%
                  </span>
                </span>
              </>
            );

            return (
              <li key={row.status}>
                {hrefForStatus ? (
                  <Link
                    to={hrefForStatus(row.status)}
                    className="flex items-center justify-between gap-2 rounded-sm hover:text-highlight"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-center justify-between gap-2">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function DashboardDistribution({ dashboard }: DashboardDistributionProps) {
  const projectCounts = withoutClosedStatusCounts(dashboard.projectStatusCounts);
  const taskCounts = dashboard.taskStatusCounts;
  const completedTasks = taskCounts.completed ?? 0;
  const areas = sortedAreaSummaries(dashboard.areaSummaries).filter(
    (entry) => entry.projects > 0 || entry.openTasks > 0
  );
  const maxAreaOpen = areas.reduce((max, area) => Math.max(max, area.openTasks), 0);
  const maxAreaProjects = areas.reduce((max, area) => Math.max(max, area.projects), 0);

  return (
    <>
      <DashboardSection
        title="Mix"
        meta="Open projects"
        className="col-span-full"
      >
        <div className="grid gap-2 px-4 pb-3 md:grid-cols-2 md:px-6">
          <MixPanel
            title="Tasks"
            counts={taskCounts}
            ringValue={completedTasks}
            ringLabel="Tasks completed"
            centerCaption="complete"
            hrefForStatus={(status) => workTasksPath({ status })}
          />
          <MixPanel
            title="Projects"
            counts={projectCounts}
            ringValue={inMotionProjectCount(projectCounts)}
            ringLabel="Projects in motion"
            centerCaption="in motion"
          />
        </div>
      </DashboardSection>

      <DashboardSection title="Areas" meta={areas.length ? `${areas.length}` : undefined}>
        {areas.length === 0 ? (
          <p className="px-4 pb-4 text-[13px] text-muted-foreground md:px-6">
            No areas yet.
          </p>
        ) : (
          <ul className="space-y-2.5 px-4 pb-3 md:px-6">
            {areas.map((area) => {
              const projectWidth = ratioPercent(area.projects, maxAreaProjects);
              const openWidth = ratioPercent(area.openTasks, maxAreaOpen);
              return (
                <li key={area.id ?? `area:${area.name}`} className="min-w-0">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <AreaColorSwatch color={area.color} />
                      <span className="truncate text-[13px] font-medium">
                        {area.emoji ? `${area.emoji} ${area.name}` : area.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {area.activeProjects}/{area.projects} active · {area.openTasks} open
                    </span>
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    <div>
                      <div
                        className="h-1.5 overflow-hidden rounded-sm bg-muted/40"
                        role="img"
                        aria-label={`${area.projects} projects`}
                      >
                        <div
                          className="h-full rounded-sm"
                          style={{
                            width: `${projectWidth}%`,
                            backgroundColor: hslColorCss(area.color),
                            opacity: 0.55,
                          }}
                        />
                      </div>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Projects
                      </p>
                    </div>
                    <div>
                      <div
                        className="h-1.5 overflow-hidden rounded-sm bg-muted/40"
                        role="img"
                        aria-label={`${area.openTasks} open tasks`}
                      >
                        <div
                          className="h-full rounded-sm"
                          style={{
                            width: `${openWidth}%`,
                            backgroundColor: hslColorCss(area.color),
                          }}
                        />
                      </div>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Open tasks
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DashboardSection>
    </>
  );
}
