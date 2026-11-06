import type { DashboardTotals } from "../utils/buildDashboardView";
import { DashboardTickBar } from "./DashboardTickBar";
import { cn } from "@/lib/utils";

export function DashboardTotalsStrip({ totals }: { totals: DashboardTotals }) {
  const cells = [
    {
      key: "activeProjects",
      label: "Active projects",
      value: totals.activeProjects,
      context: `of ${totals.totalProjects}`,
      ratio:
        totals.totalProjects > 0
          ? totals.activeProjects / totals.totalProjects
          : 0,
      dangerValue: false,
      dangerFill: false,
    },
    {
      key: "openTasks",
      label: "Open tasks",
      value: totals.openTasks,
      context: `of ${totals.totalTasks}`,
      ratio: totals.totalTasks > 0 ? totals.openTasks / totals.totalTasks : 0,
      dangerValue: false,
      dangerFill: false,
    },
    {
      key: "blocked",
      label: "Blocked",
      value: totals.blocked,
      context: `${totals.blockedPctOfOpen}% of open`,
      ratio: totals.openTasks > 0 ? totals.blocked / totals.openTasks : 0,
      dangerValue: false,
      dangerFill: true,
    },
    {
      key: "overdue",
      label: "Overdue",
      value: totals.overdue,
      context: `${totals.overduePctOfOpen}% of open`,
      ratio: totals.openTasks > 0 ? totals.overdue / totals.openTasks : 0,
      dangerValue: totals.overdue > 0,
      dangerFill: true,
    },
  ] as const;

  return (
    <div className="dashboard-totals">
      {cells.map((cell) => (
        <div key={cell.key} className="dashboard-totals-cell">
          <div className="dashboard-totals-label">{cell.label}</div>
          <div className="dashboard-totals-value-row">
            <span
              className={cn(
                "dashboard-totals-value",
                cell.dangerValue && "dashboard-totals-value-danger"
              )}
            >
              {cell.value}
            </span>
            <span className="dashboard-totals-context">{cell.context}</span>
          </div>
          <DashboardTickBar
            ratio={cell.ratio}
            tone={cell.dangerFill ? "danger" : "default"}
          />
        </div>
      ))}
    </div>
  );
}
