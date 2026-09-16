import { Link } from "react-router-dom";
import {
  dashboardPersonRoleIds,
  dashboardPersonRoleLabels,
  initialsFromName,
  maxPersonOpenTasks,
  rankedPersonLoads,
  ratioPercent,
} from "@/domain/spydr/utils/dashboardModel";
import type { WorkspaceDashboard } from "@/domain/spydr/utils/workspaceDashboard";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import { PersonMeBadge } from "@/domain/spydr/features/people/components/PersonIdentity";
import { workPersonPath } from "@/domain/spydr/features/work/utils/workPaths";
import { cn } from "@/lib/utils";
import { DashboardSection, DashboardSegmentBar } from "./DashboardVisuals";

interface DashboardPersonLoadSectionProps {
  dashboard: WorkspaceDashboard;
}

export function DashboardPersonLoadSection({
  dashboard,
}: DashboardPersonLoadSectionProps) {
  const { isMe } = useCurrentUserPerson();
  const maxOpenTasks = maxPersonOpenTasks(dashboard);
  const loads = rankedPersonLoads(dashboard);
  const openWork = loads.reduce((sum, load) => sum + load.openTasks, 0);

  return (
    <DashboardSection title="Load by person" meta={loads.length ? `${loads.length}` : undefined}>
      {loads.length === 0 ? (
        <p className="px-4 pb-8 text-center text-[13px] text-muted-foreground md:px-6">
          Assign people on projects to see workload distribution.
        </p>
      ) : (
        <ul className="space-y-1 px-3 pb-4 md:px-5">
          {loads.map((load, index) => {
            const name = load.person?.name ?? "Unassigned";
            const mine = Boolean(load.person && isMe(load.person.id));
            const clearOpen = Math.max(load.openTasks - load.blockedTasks, 0);
            const share = ratioPercent(load.openTasks, openWork);
            const rankWidth = ratioPercent(load.openTasks, maxOpenTasks);
            const roles = dashboardPersonRoleIds.filter(
              (role) => load.roleCounts[role] > 0
            );

            return (
              <li
                key={load.person?.id ?? "unassigned"}
                className={cn(
                  "rounded-sm px-2 py-2.5 md:px-3",
                  mine && "person-me-row"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/70">
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-muted/40 font-mono text-[9px] font-medium tracking-tight",
                      mine && "border-highlight/50 bg-highlight/10 text-highlight"
                    )}
                  >
                    {load.person ? initialsFromName(name) : "—"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      {load.person ? (
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <Link
                            to={workPersonPath(load.person.id)}
                            className={cn(
                              "truncate text-[13px] font-medium hover:text-highlight",
                              mine && "text-highlight"
                            )}
                          >
                            {name}
                          </Link>
                          {mine ? <PersonMeBadge compact /> : null}
                        </span>
                      ) : (
                        <span className="text-[13px] text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                      <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                        {load.openTasks} open
                        {openWork > 0 ? (
                          <span className="ml-1.5 text-[10px] text-muted-foreground/70">
                            {share}%
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-sm bg-muted/40">
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.max(rankWidth, load.openTasks > 0 ? 6 : 0)}%`,
                        }}
                      >
                        <DashboardSegmentBar
                          className="h-full"
                          trackClassName="bg-transparent"
                          segments={[
                            {
                              key: "open",
                              value: clearOpen,
                              label: "Open",
                              className: "bg-highlight/80",
                            },
                            {
                              key: "blocked",
                              value: load.blockedTasks,
                              label: "Blocked",
                              className: "bg-[hsl(var(--status-blocked))]",
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-[4.25rem] mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span>
                    {load.openProjects}/{load.projects} projects
                  </span>
                  {load.overdueTasks > 0 ? (
                    <span className="text-[hsl(var(--status-blocked))]">
                      {load.overdueTasks} overdue
                    </span>
                  ) : null}
                  {roles.map((role) => (
                    <span key={role}>
                      {dashboardPersonRoleLabels[role]} {load.roleCounts[role]}
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {dashboard.summary.unassignedProjects > 0 ? (
        <p className="px-4 pb-5 text-[12px] text-muted-foreground md:px-6">
          {dashboard.summary.unassignedProjects} projects and{" "}
          {dashboard.summary.unassignedProjectTasks} tasks have no assignee.
        </p>
      ) : null}
    </DashboardSection>
  );
}
