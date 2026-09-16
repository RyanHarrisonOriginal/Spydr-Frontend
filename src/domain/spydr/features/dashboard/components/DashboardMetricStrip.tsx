import { Link } from "react-router-dom";
import {
  CircleAlert,
  Clock3,
  FolderKanban,
  ListTodo,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import {
  dashboardMetrics,
  ratioPercent,
  type DashboardMetricId,
} from "@/domain/spydr/utils/dashboardModel";
import type { WorkspaceDashboardSummary } from "@/domain/spydr/utils/workspaceDashboard";

const metricIcons: Record<
  DashboardMetricId,
  ComponentType<{ className?: string }>
> = {
  activeProjects: FolderKanban,
  openTasks: ListTodo,
  blockedTasks: CircleAlert,
  overdueTasks: Clock3,
};

const metricHrefs: Record<DashboardMetricId, string> = {
  activeProjects: "/work",
  openTasks: "/work?view=tasks",
  blockedTasks: "/work?view=tasks",
  overdueTasks: "/work?view=tasks",
};

function metricRatio(id: DashboardMetricId, summary: WorkspaceDashboardSummary) {
  if (id === "activeProjects") {
    return { part: summary.activeProjects, whole: summary.totalProjects };
  }
  if (id === "openTasks") {
    return { part: summary.openTasks, whole: summary.totalTasks };
  }
  if (id === "blockedTasks") {
    return { part: summary.blockedTasks, whole: summary.openTasks };
  }
  return { part: summary.overdueTasks, whole: summary.openTasks };
}

export function DashboardMetricStrip({
  summary,
}: {
  summary: WorkspaceDashboardSummary;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 px-4 py-4 md:grid-cols-4 md:gap-3 md:px-6">
      {dashboardMetrics.map((metric) => {
        const value = metric.getValue(summary);
        const hint = metric.hint?.(summary);
        const warn = metric.tone === "warn" && value > 0;
        const Icon = metricIcons[metric.id];
        const { part, whole } = metricRatio(metric.id, summary);
        const percent = ratioPercent(part, whole);

        return (
          <Link
            key={metric.id}
            to={metricHrefs[metric.id]}
            className={cn(
              "group min-w-0 rounded-sm border border-border/70 bg-muted/10 px-3 py-3 transition-colors hover:border-highlight/35 hover:bg-muted/20",
              warn &&
                "border-[hsl(var(--status-blocked)/0.4)] bg-[hsl(var(--status-blocked)/0.07)] hover:border-[hsl(var(--status-blocked)/0.55)]"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {metric.label}
              </span>
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-muted-foreground/70 group-hover:text-highlight",
                  warn && "text-[hsl(var(--status-blocked))]"
                )}
              />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={cn(
                  "text-[28px] font-semibold leading-none tabular-nums tracking-tight",
                  warn ? "text-[hsl(var(--status-blocked))]" : "text-foreground"
                )}
              >
                {value}
              </span>
              {hint ? (
                <span className="truncate font-mono text-[10px] text-muted-foreground/75">
                  {hint}
                </span>
              ) : null}
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-sm bg-muted/50">
              <div
                className={cn(
                  "h-full rounded-sm",
                  warn ? "bg-[hsl(var(--status-blocked))]" : "bg-highlight/80"
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[10px] tabular-nums text-muted-foreground/80">
              {whole > 0 ? `${percent}% of ${whole}` : "No baseline yet"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
