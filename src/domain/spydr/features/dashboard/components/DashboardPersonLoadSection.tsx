import { Link } from "react-router-dom";
import {
  dashboardPersonRoleIds,
  dashboardPersonRoleLabels,
  maxPersonOpenTasks,
} from "@/domain/spydr/utils/dashboardModel";
import type { WorkspaceDashboard } from "@/domain/spydr/utils/workspaceDashboard";
import { cn } from "@/lib/utils";

interface DashboardPersonLoadSectionProps {
  dashboard: WorkspaceDashboard;
}

export function DashboardPersonLoadSection({
  dashboard,
}: DashboardPersonLoadSectionProps) {
  const maxOpenTasks = maxPersonOpenTasks(dashboard);
  const loads = dashboard.personLoads.filter(
    (load) =>
      load.projects > 0 ||
      load.tasks > 0 ||
      dashboardPersonRoleIds.some((role) => load.roleCounts[role] > 0)
  );

  return (
    <div className="card-accent rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/25 px-4 py-2.5">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/80">
          Load by person
        </h2>
        <span className="h-px min-w-4 flex-1 bg-border/80" aria-hidden />
        <span className="font-mono text-[10px] text-muted-foreground">
          assignee workload
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[12px]">
          <thead className="border-b border-border/80 bg-muted/10 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Person</th>
              <th className="px-3 py-2 text-right font-medium">Projects</th>
              <th className="px-3 py-2 text-right font-medium">Open tasks</th>
              <th className="min-w-[10rem] px-3 py-2 font-medium">Load</th>
              <th className="px-3 py-2 text-right font-medium">Blocked</th>
              <th className="px-3 py-2 text-right font-medium">Overdue</th>
              <th className="px-4 py-2 font-medium">Roles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {loads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
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
                  <tr key={load.person?.id ?? "unassigned"} className="row-hover">
                    <td className="px-4 py-2.5">
                      {load.person ? (
                        <Link
                          to={`/people/${load.person.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {load.person.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                      {load.projects}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                      {load.openTasks}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="h-2 overflow-hidden rounded-full bg-muted/50">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            load.openTasks > 0 ? "bg-primary/75" : "bg-transparent"
                          )}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right font-mono tabular-nums",
                        load.blockedTasks > 0 && "text-[hsl(var(--status-blocked))]"
                      )}
                    >
                      {load.blockedTasks}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right font-mono tabular-nums",
                        load.overdueTasks > 0 && "text-[hsl(var(--status-blocked))]"
                      )}
                    >
                      {load.overdueTasks}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {roles.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          roles.map((role) => (
                            <span
                              key={role}
                              className="rounded border border-border/70 bg-muted/30 px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                            >
                              {dashboardPersonRoleLabels[role]} {load.roleCounts[role]}
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
        <p className="border-t border-border/70 px-4 py-2 font-mono text-[10px] text-muted-foreground">
          {dashboard.summary.unassignedProjects} projects and{" "}
          {dashboard.summary.unassignedProjectTasks} tasks have no assignee.
        </p>
      ) : null}
    </div>
  );
}
