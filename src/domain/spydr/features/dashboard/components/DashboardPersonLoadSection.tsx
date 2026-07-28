import { Link } from "react-router-dom";
import {
  dashboardPersonRoleIds,
  dashboardPersonRoleLabels,
  maxPersonOpenTasks,
} from "@/domain/spydr/utils/dashboardModel";
import type { WorkspaceDashboard } from "@/domain/spydr/utils/workspaceDashboard";
import { useCurrentUserPerson } from "@/domain/spydr/features/people/context/CurrentUserPersonContext";
import { PersonMeBadge } from "@/domain/spydr/features/people/components/PersonIdentity";
import { cn } from "@/lib/utils";

interface DashboardPersonLoadSectionProps {
  dashboard: WorkspaceDashboard;
}

export function DashboardPersonLoadSection({
  dashboard,
}: DashboardPersonLoadSectionProps) {
  const { isMe } = useCurrentUserPerson();
  const maxOpenTasks = maxPersonOpenTasks(dashboard);
  const loads = dashboard.personLoads.filter(
    (load) =>
      load.projects > 0 ||
      load.tasks > 0 ||
      dashboardPersonRoleIds.some((role) => load.roleCounts[role] > 0)
  );

  return (
    <section className="border-b border-border">
      <div className="flex items-center gap-3 px-6 py-3">
        <h2 className="text-[13px] font-medium text-foreground">
          Load by person
        </h2>
        <span className="font-mono text-[10px] text-muted-foreground">
          {loads.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead className="border-y border-border/70 bg-muted/20 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-2 font-medium">Person</th>
              <th className="px-3 py-2 text-right font-medium">Projects</th>
              <th className="px-3 py-2 text-right font-medium">Open</th>
              <th className="min-w-[7rem] px-3 py-2 font-medium">Load</th>
              <th className="px-3 py-2 text-right font-medium">Blocked</th>
              <th className="px-3 py-2 text-right font-medium">Overdue</th>
              <th className="px-6 py-2 font-medium">Roles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loads.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  Assign people on projects to see workload distribution.
                </td>
              </tr>
            ) : (
              loads.map((load) => {
                const width =
                  maxOpenTasks > 0
                    ? Math.round((load.openTasks / maxOpenTasks) * 100)
                    : 0;
                const roles = dashboardPersonRoleIds.filter(
                  (role) => load.roleCounts[role] > 0
                );

                return (
                  <tr
                    key={load.person?.id ?? "unassigned"}
                    className={cn(
                      "row-hover",
                      load.person && isMe(load.person.id) && "person-me-row"
                    )}
                  >
                    <td className="px-6 py-2.5">
                      {load.person ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/people/${load.person.id}`}
                            className={cn(
                              "font-medium hover:text-highlight",
                              isMe(load.person.id) && "text-highlight"
                            )}
                          >
                            {load.person.name}
                          </Link>
                          {isMe(load.person.id) ? (
                            <PersonMeBadge compact />
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                      {load.projects}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                      {load.openTasks}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="h-1.5 overflow-hidden rounded-sm bg-muted/50">
                        <div
                          className={cn(
                            "h-full rounded-sm",
                            load.openTasks > 0
                              ? "bg-highlight/75"
                              : "bg-transparent"
                          )}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right font-mono tabular-nums",
                        load.blockedTasks > 0
                          ? "text-[hsl(var(--status-blocked))]"
                          : "text-muted-foreground"
                      )}
                    >
                      {load.blockedTasks}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right font-mono tabular-nums",
                        load.overdueTasks > 0
                          ? "text-[hsl(var(--status-blocked))]"
                          : "text-muted-foreground"
                      )}
                    >
                      {load.overdueTasks}
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {roles.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          roles.map((role) => (
                            <span
                              key={role}
                              className="rounded-sm border border-border/70 bg-muted/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                            >
                              {dashboardPersonRoleLabels[role]}{" "}
                              {load.roleCounts[role]}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {dashboard.summary.unassignedProjects > 0 ? (
        <p className="border-t border-border/70 px-6 py-2 text-[12px] text-muted-foreground">
          {dashboard.summary.unassignedProjects} projects and{" "}
          {dashboard.summary.unassignedProjectTasks} tasks have no assignee.
        </p>
      ) : null}
    </section>
  );
}
